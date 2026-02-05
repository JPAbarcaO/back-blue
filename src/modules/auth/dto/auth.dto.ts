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

export class RegisterResponseDto {
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
