import { BadRequestException, Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  AuthResponseDto,
  LoginRequestDto,
  MeResponseDto,
  RegisterRequestDto,
  TokenRequestDto,
  TokenResponseDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

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

  @Post('register')
  @ApiOperation({ summary: 'Registrar usuario y devolver JWT' })
  @ApiBody({ type: RegisterRequestDto })
  @ApiResponse({ status: 201, description: 'Usuario creado', type: AuthResponseDto })
  @ApiResponse({ status: 409, description: 'El email ya esta registrado.' })
  async register(@Body() body: RegisterRequestDto): Promise<AuthResponseDto> {
    const user = await this.usersService.createUser({
      email: body.email,
      password: body.password,
      name: body.name,
    });
    const { accessToken } = await this.authService.signPayload({
      sub: user.id,
      email: user.email,
      name: user.name ?? undefined,
    });
    return { accessToken, user };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login y devolver JWT' })
  @ApiBody({ type: LoginRequestDto })
  @ApiResponse({ status: 201, description: 'Login correcto', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Credenciales invalidas.' })
  async login(@Body() body: LoginRequestDto): Promise<AuthResponseDto> {
    const userDoc = await this.usersService.validateUser(body.email, body.password);
    const user = this.usersService.toResponse(userDoc);
    const { accessToken } = await this.authService.signPayload({
      sub: user.id,
      email: user.email,
      name: user.name ?? undefined,
    });
    return { accessToken, user };
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
