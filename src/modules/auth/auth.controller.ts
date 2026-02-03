import { BadRequestException, Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token')
  async getToken(
    @Body() body: { sub?: string; userId?: string; email?: string; name?: string } = {},
  ): Promise<{ accessToken: string }> {
    const payload: Record<string, unknown> = {};
    const subject = body.sub ?? body.userId;

    if (subject) {
      payload.sub = String(subject);
    }
    if (body.email) {
      payload.email = body.email;
    }
    if (body.name) {
      payload.name = body.name;
    }

    if (Object.keys(payload).length === 0) {
      throw new BadRequestException('Debes enviar al menos `sub` o `userId`.');
    }

    return this.authService.signPayload(payload);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: { user?: unknown }): { user?: unknown } {
    return { user: req.user };
  }
}
