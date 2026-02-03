import { Injectable, Logger } from '@nestjs/common';
import { getMongoClient } from '../../database/mongo.client';
import type {
  CharacterResponseDto,
  CharacterSource,
  VoteCharacterRequestDto,
  VoteCharacterResponseDto,
} from './dto/characters.dto';

interface CacheEntry {
  value: number;
  updatedAt: number;
}

const CACHE_TTL_MS = 10 * 60 * 1000;

@Injectable()
export class CharactersService {
  private readonly logger = new Logger('CharactersService');
  private rickAndMortyCount: CacheEntry | null = null;
  private pokemonCount: CacheEntry | null = null;

  async getRandomCharacter(source?: CharacterSource): Promise<CharacterResponseDto> {
    const availableSources = this.getAvailableSources();
    if (source) {
      if (!availableSources.includes(source)) {
        throw new Error('Fuente no disponible.');
      }
      const character = await this.fetchBySource(source);
      await this.upsertCharacter(character);
      return character;
    }

    const chosenSource = this.pickRandom(availableSources);

    if (!chosenSource) {
      throw new Error('No hay fuentes de personajes disponibles.');
    }

    const character = await this.fetchBySource(chosenSource);
    await this.upsertCharacter(character);
    return character;
  }

  async recordVote(input: VoteCharacterRequestDto): Promise<VoteCharacterResponseDto> {
    const collection = await this.getCharactersCollection();
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

    await collection.updateOne(
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

  private async upsertCharacter(character: CharacterResponseDto): Promise<void> {
    const collection = await this.getCharactersCollection();
    const now = new Date();

    await collection.updateOne(
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

  private async getCharactersCollection() {
    const dbName = process.env.MONGO_DB;
    const collectionName = process.env.MONGO_COLLECTION;

    if (!dbName || !collectionName) {
      throw new Error('Faltan MONGO_DB o MONGO_COLLECTION para guardar datos.');
    }

    const client = getMongoClient();
    await client.connect();
    return client.db(dbName).collection(collectionName);
  }

  private getAvailableSources(): CharacterSource[] {
    const sources: CharacterSource[] = ['rickandmorty', 'pokemon'];
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
      default:
        throw new Error('Fuente no soportada.');
    }
  }

  private async getRickAndMortyCharacter(): Promise<CharacterResponseDto> {
    const count = await this.getRickAndMortyCount();
    const id = this.randomId(count);
    const response = await fetch(`https://rickandmortyapi.com/api/character/${id}`);
    if (!response.ok) {
      throw new Error('No se pudo obtener personaje de Rick and Morty.');
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
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!response.ok) {
      throw new Error('No se pudo obtener personaje de Pokemon.');
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
      throw new Error('Falta SUPERHERO_API_KEY para usar Superhero API.');
    }

    const maxId = Number(process.env.SUPERHERO_MAX_ID ?? 731);
    const id = this.randomId(maxId);
    const response = await fetch(`https://superheroapi.com/api/${apiKey}/${id}`);
    if (!response.ok) {
      throw new Error('No se pudo obtener personaje de Superhero API.');
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
      throw new Error('Superhero API respondio con error.');
    }

    return {
      source: 'superhero',
      sourceId: data.id ?? String(id),
      name: data.name ?? 'Desconocido',
      image: data.image?.url ?? '',
    };
  }

  private async getRickAndMortyCount(): Promise<number> {
    if (this.isCacheValid(this.rickAndMortyCount)) {
      return this.rickAndMortyCount.value;
    }

    const response = await fetch('https://rickandmortyapi.com/api/character');
    if (!response.ok) {
      throw new Error('No se pudo obtener el total de Rick and Morty.');
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

    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1');
    if (!response.ok) {
      throw new Error('No se pudo obtener el total de Pokemon.');
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
