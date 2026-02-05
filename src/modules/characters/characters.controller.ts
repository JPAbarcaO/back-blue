import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CharactersService } from './characters.service';
import {
  CharacterResponseDto,
  CharacterSummaryResponseDto,
  CharactersListResponseDto,
  GetRandomCharacterQueryDto,
  ListCharactersQueryDto,
  VoteCharacterRequestDto,
  VoteCharacterResponseDto,
} from './dto/characters.dto';
@ApiTags('Characters')
@Controller('characters')
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  @Get('random')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: 'Obtener personaje aleatorio' })
  @ApiQuery({
    name: 'source',
    required: false,
    enum: ['rickandmorty', 'pokemon', 'superhero', 'dragonball'],
  })
  @ApiResponse({ status: 200, description: 'Personaje obtenido', type: CharacterResponseDto })
  @ApiResponse({ status: 400, description: 'Parametro `source` invalido.' })
  async getRandom(@Query() query: GetRandomCharacterQueryDto): Promise<CharacterResponseDto> {
    return this.charactersService.getRandomCharacter(query.source);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar personajes (paginado)' })
  @ApiQuery({ name: 'source', required: false, enum: ['rickandmorty', 'pokemon', 'superhero', 'dragonball'] })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['likes', 'dislikes', 'lastEvaluatedAt', 'createdAt'],
  })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Listado de personajes', type: CharactersListResponseDto })
  @ApiResponse({ status: 400, description: 'Query invalido.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async listCharacters(
    @Query() query: ListCharactersQueryDto,
  ): Promise<CharactersListResponseDto> {
    return this.charactersService.listCharacters(query);
  }

  @Get('top-like')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Personaje con mas likes' })
  @ApiResponse({ status: 200, description: 'Personaje con mas likes', type: CharacterSummaryResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async topLike(): Promise<CharacterSummaryResponseDto> {
    const item = await this.charactersService.getTopLikedCharacter();
    return { item };
  }

  @Get('top-dislike')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Personaje con mas dislikes' })
  @ApiResponse({ status: 200, description: 'Personaje con mas dislikes', type: CharacterSummaryResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async topDislike(): Promise<CharacterSummaryResponseDto> {
    const item = await this.charactersService.getTopDislikedCharacter();
    return { item };
  }

  @Get('last-evaluated')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Ultimo personaje evaluado' })
  @ApiResponse({ status: 200, description: 'Ultimo personaje evaluado', type: CharacterSummaryResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async lastEvaluated(): Promise<CharacterSummaryResponseDto> {
    const item = await this.charactersService.getLastEvaluatedCharacter();
    return { item };
  }

  @Post('vote')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: 'Votar un personaje' })
  @ApiResponse({ status: 201, description: 'Voto registrado', type: VoteCharacterResponseDto })
  @ApiResponse({ status: 400, description: 'Body invalido.' })
  async vote(
    @Body() body: VoteCharacterRequestDto,
  ): Promise<VoteCharacterResponseDto> {
    return this.charactersService.recordVote(body);
  }
}
