import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CharactersService } from './characters.service';
import {
  CharacterResponseDto,
  CharactersListResponseDto,
  GetRandomCharacterQueryDto,
  ListCharactersQueryDto,
  VoteCharacterRequestDto,
  VoteCharacterResponseDto,
} from './dto/characters.dto';
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
    return this.charactersService.getRandomCharacter(query.source);
  }

  @Get()
  @ApiOperation({ summary: 'Listar personajes (paginado)' })
  @ApiQuery({ name: 'source', required: false, enum: ['rickandmorty', 'pokemon', 'superhero'] })
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

  @Post('vote')
  @ApiOperation({ summary: 'Votar un personaje' })
  @ApiResponse({ status: 201, description: 'Voto registrado', type: VoteCharacterResponseDto })
  @ApiResponse({ status: 400, description: 'Body invalido.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async vote(
    @Body() body: VoteCharacterRequestDto,
  ): Promise<VoteCharacterResponseDto> {
    return this.charactersService.recordVote(body);
  }
}
