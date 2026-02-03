import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TokenRequestDto {
  @ApiPropertyOptional({
    description: 'Identificador principal del usuario.',
    example: 'demo-user',
  })
  sub?: string;

  @ApiPropertyOptional({
    description: 'Alias alternativo para el identificador de usuario.',
    example: 'user-123',
  })
  userId?: string;

  @ApiPropertyOptional({
    description: 'Email del usuario.',
    example: 'demo@local',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'Nombre visible del usuario.',
    example: 'Demo',
  })
  name?: string;
}

export class TokenResponseDto {
  @ApiProperty({
    description: 'JWT firmado.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;
}

export class MeResponseDto {
  @ApiPropertyOptional({
    description: 'Payload decodificado del JWT.',
    type: 'object',
    additionalProperties: true,
  })
  user?: Record<string, unknown>;
}
