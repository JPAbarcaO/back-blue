import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '65f1a0b8f6e7c2a1b2c3d4e5' })
  id!: string;

  @ApiProperty({ example: 'demo@local' })
  email!: string;

  @ApiPropertyOptional({ example: 'Demo' })
  name?: string | null;
}
