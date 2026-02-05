import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async signPayload(payload: Record<string, unknown>): Promise<{ accessToken: string }> {
    const accessToken = await this.jwtService.signAsync(payload);
    return { accessToken };
  }
}
