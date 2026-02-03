import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async signPayload(payload: Record<string, unknown>): Promise<TokenResponseDto> {
    const accessToken = await this.jwtService.signAsync(payload);
    return { accessToken };
  }
}
