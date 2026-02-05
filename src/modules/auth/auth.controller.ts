import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  AuthResponseDto,
  LoginRequestDto,
  MeResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
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

  @Post('register')
  @ApiOperation({ summary: 'Registrar usuario' })
  @ApiBody({ type: RegisterRequestDto })
  @ApiResponse({ status: 201, description: 'Usuario creado', type: RegisterResponseDto })
  @ApiResponse({ status: 409, description: 'El email ya esta registrado.' })
  async register(@Body() body: RegisterRequestDto): Promise<RegisterResponseDto> {
    const user = await this.usersService.createUser({
      email: body.email,
      password: body.password,
      name: body.name,
    });
    return { user };
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
