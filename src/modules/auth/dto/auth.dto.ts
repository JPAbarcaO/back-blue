import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserResponseDto } from '../../users/dto/users.dto';

export class TokenRequestDto {
  @ApiPropertyOptional({
    description: 'Identificador principal del usuario.',
    example: 'demo-user',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  sub?: string;

  @ApiPropertyOptional({
    description: 'Alias alternativo para el identificador de usuario.',
    example: 'user-123',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Email del usuario.',
    example: 'demo@local',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Nombre visible del usuario.',
    example: 'Demo',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
}

export class TokenResponseDto {
  @ApiProperty({
    description: 'JWT firmado.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;
}

export class RegisterRequestDto {
  @ApiProperty({ example: 'demo@local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Demo' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({ example: 'super-seguro-123' })
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password!: string;
}

export class LoginRequestDto {
  @ApiProperty({ example: 'demo@local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'super-seguro-123' })
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password!: string;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT firmado' })
  accessToken!: string;

  @ApiProperty({ type: UserResponseDto })
  user!: UserResponseDto;
}

export class MeResponseDto {
  @ApiPropertyOptional({
    description: 'Payload decodificado del JWT.',
    type: 'object',
    additionalProperties: true,
  })
  user?: Record<string, unknown>;
}
