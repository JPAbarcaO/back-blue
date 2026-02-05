import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export type CharacterSource = 'rickandmorty' | 'pokemon' | 'superhero' | 'dragonball';
export type VoteValue = 'like' | 'dislike';

export class GetRandomCharacterQueryDto {
  @ApiPropertyOptional({
    enum: ['rickandmorty', 'pokemon', 'superhero', 'dragonball'],
    description: 'Fuente desde la que obtener el personaje.',
    example: 'pokemon',
  })
  @IsOptional()
  @IsEnum(['rickandmorty', 'pokemon', 'superhero', 'dragonball'])
  source?: CharacterSource;
}

export class CharacterResponseDto {
  @ApiProperty({
    enum: ['rickandmorty', 'pokemon', 'superhero', 'dragonball'],
    example: 'pokemon',
  })
  source!: CharacterSource;

  @ApiProperty({ example: '25' })
  sourceId!: string;

  @ApiProperty({ example: 'Pikachu' })
  name!: string;

  @ApiProperty({ example: 'https://img' })
  image!: string;
}

export class VoteCharacterRequestDto {
  @ApiProperty({
    enum: ['rickandmorty', 'pokemon', 'superhero', 'dragonball'],
    example: 'pokemon',
  })
  @IsEnum(['rickandmorty', 'pokemon', 'superhero', 'dragonball'])
  source!: CharacterSource;

  @ApiProperty({ example: '25' })
  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined || value === null) {
      return undefined;
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    return undefined;
  })
  @IsString()
  @IsNotEmpty()
  sourceId!: string;

  @ApiProperty({ example: 'Pikachu' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'https://img' })
  @IsString()
  @IsNotEmpty()
  image!: string;

  @ApiProperty({ enum: ['like', 'dislike'], example: 'like' })
  @IsEnum(['like', 'dislike'])
  vote!: VoteValue;
}

export class VoteCharacterResponseDto {
  @ApiProperty({ example: true })
  ok!: true;
}

export class ListCharactersQueryDto {
  @ApiPropertyOptional({
    enum: ['rickandmorty', 'pokemon', 'superhero', 'dragonball'],
    description: 'Filtra por fuente.',
    example: 'pokemon',
  })
  @IsOptional()
  @IsEnum(['rickandmorty', 'pokemon', 'superhero', 'dragonball'])
  source?: CharacterSource;

  @ApiPropertyOptional({
    enum: ['likes', 'dislikes', 'lastEvaluatedAt', 'createdAt'],
    description: 'Campo para ordenar.',
    example: 'likes',
  })
  @IsOptional()
  @IsEnum(['likes', 'dislikes', 'lastEvaluatedAt', 'createdAt'])
  sortBy?: 'likes' | 'dislikes' | 'lastEvaluatedAt' | 'createdAt';

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    description: 'Orden ascendente o descendente.',
    example: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order?: 'asc' | 'desc';

  @ApiPropertyOptional({ description: 'Cantidad de resultados.', example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ description: 'Cantidad a saltar (paginacion).', example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number;
}

export class CharacterListItemDto {
  @ApiProperty({
    enum: ['rickandmorty', 'pokemon', 'superhero', 'dragonball'],
    example: 'pokemon',
  })
  source!: CharacterSource;

  @ApiProperty({ example: '25' })
  sourceId!: string;

  @ApiProperty({ example: 'Pikachu' })
  name!: string;

  @ApiProperty({ example: 'https://img' })
  image!: string;

  @ApiProperty({ example: 10 })
  likes!: number;

  @ApiProperty({ example: 2 })
  dislikes!: number;

  @ApiPropertyOptional({ example: '2026-02-03T22:30:00.000Z' })
  lastEvaluatedAt?: string | null;
}

export class CharactersListResponseDto {
  @ApiProperty({ type: [CharacterListItemDto] })
  items!: CharacterListItemDto[];

  @ApiProperty({ example: 120 })
  total!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 0 })
  skip!: number;
}
