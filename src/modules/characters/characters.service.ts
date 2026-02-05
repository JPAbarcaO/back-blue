import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type {
  CharacterResponseDto,
  CharacterSource,
  CharactersListResponseDto,
  ListCharactersQueryDto,
  VoteCharacterRequestDto,
  VoteCharacterResponseDto,
} from './dto/characters.dto';
import type { CharacterListItemDto } from './dto/characters.dto';
import { Character } from './schemas/character.schema';
import type { CharacterDocument } from './schemas/character.schema';

interface CacheEntry {
  value: number;
  updatedAt: number;
}

const CACHE_TTL_MS = 10 * 60 * 1000;
const RICK_AND_MORTY_API_BASE =
  process.env.RICK_AND_MORTY_API_BASE ?? 'https://rickandmortyapi.com/api';
const POKEMON_API_BASE =
  process.env.POKEMON_API_BASE ?? 'https://pokeapi.co/api/v2';
const SUPERHERO_API_BASE =
  process.env.SUPERHERO_API_BASE ?? 'https://superheroapi.com/api';
const DRAGONBALL_API_BASE =
  process.env.DRAGONBALL_API_BASE ?? 'https://dragonball-api.com/api';
const DRAGONBALL_MAX_ID = Number(process.env.DRAGONBALL_MAX_ID ?? 58);

@Injectable()
export class CharactersService {
  private readonly logger = new Logger('CharactersService');
  private rickAndMortyCount: CacheEntry | null = null;
  private pokemonCount: CacheEntry | null = null;

  constructor(
    @InjectModel(Character.name)
    private readonly characterModel: Model<CharacterDocument>,
  ) {}

  async getRandomCharacter(source?: CharacterSource): Promise<CharacterResponseDto> {
    const availableSources = this.getAvailableSources();
    if (source) {
      if (!availableSources.includes(source)) {
        throw new BadRequestException('Fuente no disponible.');
      }
      const character = await this.fetchBySource(source);
      await this.upsertCharacter(character);
      return character;
    }

    const chosenSource = this.pickRandom(availableSources);

    if (!chosenSource) {
      throw new ServiceUnavailableException('No hay fuentes de personajes disponibles.');
    }

    const character = await this.fetchBySource(chosenSource);
    await this.upsertCharacter(character);
    return character;
  }

  async recordVote(input: VoteCharacterRequestDto): Promise<VoteCharacterResponseDto> {
    const now = new Date();
    const isLike = input.vote === 'like';
    const setOnInsert: Record<string, unknown> = {
      createdAt: now,
      payload: {},
    };
    if (isLike) {
      setOnInsert.dislikes = 0;
    } else {
      setOnInsert.likes = 0;
    }

    await this.characterModel.updateOne(
      { source: input.source, externalId: String(input.sourceId) },
      {
        $set: {
          source: input.source,
          externalId: String(input.sourceId),
          name: input.name,
          imageUrl: input.image,
          lastEvaluatedAt: now,
        },
        $setOnInsert: setOnInsert,
        $inc: isLike ? { likes: 1 } : { dislikes: 1 },
      },
      { upsert: true },
    );

    return { ok: true };
  }

  async listCharacters(query: ListCharactersQueryDto): Promise<CharactersListResponseDto> {
    const filter: Record<string, unknown> = {};
    if (query.source) {
      filter.source = query.source;
    }

    const sortBy = query.sortBy ?? 'createdAt';
    const order = query.order ?? 'desc';
    const sort: Record<string, 1 | -1> = {
      [sortBy]: order === 'asc' ? 1 : -1,
    };

    const limit = query.limit ?? 20;
    const skip = query.skip ?? 0;

    const [items, total] = await Promise.all([
      this.characterModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.characterModel.countDocuments(filter),
    ]);

    const mapped = items.map((item) => ({
      source: item.source,
      sourceId: String(item.externalId),
      name: item.name,
      image: item.imageUrl ?? '',
      likes: item.likes ?? 0,
      dislikes: item.dislikes ?? 0,
      lastEvaluatedAt: item.lastEvaluatedAt
        ? new Date(item.lastEvaluatedAt).toISOString()
        : null,
    })) as CharacterListItemDto[];

    return {
      items: mapped,
      total,
      limit,
      skip,
    };
  }

  async getTopLikedCharacter(): Promise<CharacterListItemDto | null> {
    return this.findSingleBySort({ likes: -1 });
  }

  async getTopDislikedCharacter(): Promise<CharacterListItemDto | null> {
    return this.findSingleBySort({ dislikes: -1 });
  }

  async getLastEvaluatedCharacter(): Promise<CharacterListItemDto | null> {
    return this.findSingleBySort({ lastEvaluatedAt: -1 });
  }

  private async findSingleBySort(
    sort: Record<string, 1 | -1>,
  ): Promise<CharacterListItemDto | null> {
    const item = await this.characterModel.findOne({}).sort(sort).lean();
    if (!item) {
      return null;
    }

    return {
      source: item.source,
      sourceId: String(item.externalId),
      name: item.name,
      image: item.imageUrl ?? '',
      likes: item.likes ?? 0,
      dislikes: item.dislikes ?? 0,
      lastEvaluatedAt: item.lastEvaluatedAt
        ? new Date(item.lastEvaluatedAt).toISOString()
        : null,
    };
  }

  private async upsertCharacter(character: CharacterResponseDto): Promise<void> {
    const now = new Date();

    await this.characterModel.updateOne(
      { source: character.source, externalId: String(character.sourceId) },
      {
        $set: {
          source: character.source,
          externalId: String(character.sourceId),
          name: character.name,
          imageUrl: character.image,
        },
        $setOnInsert: {
          likes: 0,
          dislikes: 0,
          lastEvaluatedAt: null,
          payload: {},
          createdAt: now,
        },
      },
      { upsert: true },
    );
  }

  private getAvailableSources(): CharacterSource[] {
    const sources: CharacterSource[] = ['rickandmorty', 'pokemon', 'dragonball'];
    if (process.env.SUPERHERO_API_KEY) {
      sources.push('superhero');
    }
    return sources;
  }

  private async fetchBySource(source: CharacterSource): Promise<CharacterResponseDto> {
    switch (source) {
      case 'rickandmorty':
        return this.getRickAndMortyCharacter();
      case 'pokemon':
        return this.getPokemonCharacter();
      case 'superhero':
        return this.getSuperheroCharacter();
      case 'dragonball':
        return this.getDragonBallCharacter();
      default:
        throw new BadRequestException('Fuente no soportada.');
    }
  }

  private async getRickAndMortyCharacter(): Promise<CharacterResponseDto> {
    const count = await this.getRickAndMortyCount();
    const id = this.randomId(count);
    const response = await fetch(`${RICK_AND_MORTY_API_BASE}/character/${id}`);
    if (!response.ok) {
      throw new BadGatewayException('No se pudo obtener personaje de Rick and Morty.');
    }

    const data = (await response.json()) as { id: number; name: string; image: string };
    return {
      source: 'rickandmorty',
      sourceId: String(data.id),
      name: data.name,
      image: data.image,
    };
  }

  private async getPokemonCharacter(): Promise<CharacterResponseDto> {
    const count = await this.getPokemonCount();
    const id = this.randomId(count);
    const response = await fetch(`${POKEMON_API_BASE}/pokemon/${id}`);
    if (!response.ok) {
      throw new BadGatewayException('No se pudo obtener personaje de Pokemon.');
    }

    const data = (await response.json()) as {
      id: number;
      name: string;
      sprites?: {
        front_default?: string | null;
        other?: { ['official-artwork']?: { front_default?: string | null } };
      };
    };

    const image =
      data.sprites?.other?.['official-artwork']?.front_default ??
      data.sprites?.front_default ??
      '';

    return {
      source: 'pokemon',
      sourceId: String(data.id),
      name: data.name,
      image,
    };
  }

  private async getSuperheroCharacter(): Promise<CharacterResponseDto> {
    const apiKey = process.env.SUPERHERO_API_KEY;
    if (!apiKey) {
      throw new BadRequestException('Falta SUPERHERO_API_KEY para usar Superhero API.');
    }

    const maxId = Number(process.env.SUPERHERO_MAX_ID ?? 731);
    const id = this.randomId(maxId);
    const response = await fetch(`${SUPERHERO_API_BASE}/${apiKey}/${id}`);
    if (!response.ok) {
      throw new BadGatewayException('No se pudo obtener personaje de Superhero API.');
    }

    const data = (await response.json()) as {
      response?: string;
      error?: string;
      id?: string;
      name?: string;
      image?: { url?: string };
    };

    if (data.response === 'error') {
      this.logger.warn(`Superhero API error: ${data.error ?? 'desconocido'}`);
      throw new BadGatewayException('Superhero API respondio con error.');
    }

    return {
      source: 'superhero',
      sourceId: data.id ?? String(id),
      name: data.name ?? 'Desconocido',
      image: data.image?.url ?? '',
    };
  }

  private async getDragonBallCharacter(): Promise<CharacterResponseDto> {
    const maxId =
      Number.isFinite(DRAGONBALL_MAX_ID) && DRAGONBALL_MAX_ID > 0 ? DRAGONBALL_MAX_ID : 58;
    const id = this.randomId(maxId);
    const response = await fetch(`${DRAGONBALL_API_BASE}/characters/${id}`);
    if (!response.ok) {
      throw new BadGatewayException('No se pudo obtener personaje de Dragon Ball.');
    }

    const data = (await response.json()) as {
      id?: number;
      name?: string;
      image?: string;
    };

    return {
      source: 'dragonball',
      sourceId: data.id ? String(data.id) : String(id),
      name: data.name ?? 'Desconocido',
      image: data.image ?? '',
    };
  }

  private async getRickAndMortyCount(): Promise<number> {
    if (this.isCacheValid(this.rickAndMortyCount)) {
      return this.rickAndMortyCount.value;
    }

    const response = await fetch(`${RICK_AND_MORTY_API_BASE}/character`);
    if (!response.ok) {
      throw new BadGatewayException('No se pudo obtener el total de Rick and Morty.');
    }

    const data = (await response.json()) as { info?: { count?: number } };
    const count = data.info?.count ?? 0;
    this.rickAndMortyCount = { value: count, updatedAt: Date.now() };
    return count;
  }

  private async getPokemonCount(): Promise<number> {
    if (this.isCacheValid(this.pokemonCount)) {
      return this.pokemonCount.value;
    }

    const response = await fetch(`${POKEMON_API_BASE}/pokemon?limit=1`);
    if (!response.ok) {
      throw new BadGatewayException('No se pudo obtener el total de Pokemon.');
    }

    const data = (await response.json()) as { count?: number };
    const count = data.count ?? 0;
    this.pokemonCount = { value: count, updatedAt: Date.now() };
    return count;
  }

  private isCacheValid(entry: CacheEntry | null): entry is CacheEntry {
    return !!entry && Date.now() - entry.updatedAt < CACHE_TTL_MS && entry.value > 0;
  }

  private pickRandom<T>(items: T[]): T {
    const index = Math.floor(Math.random() * items.length);
    return items[index];
  }

  private randomId(max: number): number {
    return Math.max(1, Math.floor(Math.random() * max) + 1);
  }
}
