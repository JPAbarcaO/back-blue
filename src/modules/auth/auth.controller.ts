import { BadRequestException, Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { MeResponseDto, TokenRequestDto, TokenResponseDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token')
  @ApiOperation({ summary: 'Generar JWT' })
  @ApiBody({ type: TokenRequestDto })
  @ApiResponse({ status: 201, description: 'Token generado', type: TokenResponseDto })
  @ApiResponse({ status: 400, description: 'Debes enviar al menos `sub` o `userId`.' })
  getToken(
    @Body() body: TokenRequestDto = {},
  ): Promise<TokenResponseDto> {
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
  @ApiOperation({ summary: 'Obtener perfil desde JWT' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Token valido', type: MeResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: { user?: Record<string, unknown> }): MeResponseDto {
    return { user: req.user };
  }
}
