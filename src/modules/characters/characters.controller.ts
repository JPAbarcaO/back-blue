import { BadRequestException, Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CharactersService } from './characters.service';
import {
  CharacterResponseDto,
  GetRandomCharacterQueryDto,
  VoteCharacterRequestDto,
  VoteCharacterResponseDto,
} from './dto/characters.dto';
import type { CharacterSource, VoteValue } from './dto/characters.dto';

@ApiTags('Characters')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('characters')
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  @Get('random')
  @ApiOperation({ summary: 'Obtener personaje aleatorio' })
  @ApiQuery({
    name: 'source',
    required: false,
    enum: ['rickandmorty', 'pokemon', 'superhero'],
  })
  @ApiResponse({ status: 200, description: 'Personaje obtenido', type: CharacterResponseDto })
  @ApiResponse({ status: 400, description: 'Parametro `source` invalido.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getRandom(@Query() query: GetRandomCharacterQueryDto): Promise<CharacterResponseDto> {
    if (query.source) {
      this.validateSource(query.source);
    }
    return this.charactersService.getRandomCharacter(query.source);
  }

  @Post('vote')
  @ApiOperation({ summary: 'Votar un personaje' })
  @ApiResponse({ status: 201, description: 'Voto registrado', type: VoteCharacterResponseDto })
  @ApiResponse({ status: 400, description: 'Body invalido.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async vote(
    @Body() body: VoteCharacterRequestDto,
  ): Promise<VoteCharacterResponseDto> {
    const validated = this.validateVote(body);
    return this.charactersService.recordVote(validated);
  }

  private validateVote(body: VoteCharacterRequestDto): VoteCharacterRequestDto {
    const allowedSources: CharacterSource[] = ['rickandmorty', 'pokemon', 'superhero'];
    const allowedVotes: VoteValue[] = ['like', 'dislike'];

    if (!body.source || !allowedSources.includes(body.source)) {
      throw new BadRequestException('Campo `source` invalido.');
    }
    if (!body.sourceId) {
      throw new BadRequestException('Campo `sourceId` requerido.');
    }
    if (!body.name) {
      throw new BadRequestException('Campo `name` requerido.');
    }
    if (!body.image) {
      throw new BadRequestException('Campo `image` requerido.');
    }
    if (!body.vote || !allowedVotes.includes(body.vote)) {
      throw new BadRequestException('Campo `vote` invalido.');
    }

    return {
      source: body.source,
      sourceId: String(body.sourceId),
      name: body.name,
      image: body.image,
      vote: body.vote,
    };
  }

  private validateSource(source: CharacterSource): void {
    const allowedSources: CharacterSource[] = ['rickandmorty', 'pokemon', 'superhero'];
    if (!allowedSources.includes(source)) {
      throw new BadRequestException('Parametro `source` invalido.');
    }
    if (source === 'superhero' && !process.env.SUPERHERO_API_KEY) {
      throw new BadRequestException('Superhero API no configurada.');
    }
  }
}
