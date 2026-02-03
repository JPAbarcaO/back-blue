import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type CharacterSource = 'rickandmorty' | 'pokemon' | 'superhero';
export type VoteValue = 'like' | 'dislike';

export class GetRandomCharacterQueryDto {
  @ApiPropertyOptional({
    enum: ['rickandmorty', 'pokemon', 'superhero'],
    description: 'Fuente desde la que obtener el personaje.',
    example: 'pokemon',
  })
  source?: CharacterSource;
}

export class CharacterResponseDto {
  @ApiProperty({
    enum: ['rickandmorty', 'pokemon', 'superhero'],
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
    enum: ['rickandmorty', 'pokemon', 'superhero'],
    example: 'pokemon',
  })
  source!: CharacterSource;

  @ApiProperty({ example: '25' })
  sourceId!: string;

  @ApiProperty({ example: 'Pikachu' })
  name!: string;

  @ApiProperty({ example: 'https://img' })
  image!: string;

  @ApiProperty({ enum: ['like', 'dislike'], example: 'like' })
  vote!: VoteValue;
}

export class VoteCharacterResponseDto {
  @ApiProperty({ example: true })
  ok!: true;
}
