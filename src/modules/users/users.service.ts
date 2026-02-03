import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import type { UserResponseDto } from './dto/users.dto';
import { User } from './schemas/user.schema';
import type { UserDocument } from './schemas/user.schema';

interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async createUser(input: CreateUserInput): Promise<UserResponseDto> {
    const email = input.email.trim().toLowerCase();
    const existing = await this.userModel.findOne({ email }).lean();
    if (existing) {
      throw new ConflictException('El email ya esta registrado.');
    }

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
    const passwordInput = this.buildPasswordInput(input.password);
    const passwordHash = await bcrypt.hash(passwordInput, saltRounds);

    const created = await this.userModel.create({
      email,
      passwordHash,
      name: input.name ?? null,
    });

    return this.toResponse(created);
  }

  async validateUser(email: string, password: string): Promise<UserDocument> {
    const normalized = email.trim().toLowerCase();
    const user = await this.userModel
      .findOne({ email: normalized })
      .select('+passwordHash');

    if (!user) {
      throw new UnauthorizedException('Credenciales invalidas.');
    }

    const passwordInput = this.buildPasswordInput(password);
    const matches = await bcrypt.compare(passwordInput, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedException('Credenciales invalidas.');
    }

    return user;
  }

  toResponse(user: UserDocument): UserResponseDto {
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name ?? null,
    };
  }

  private buildPasswordInput(password: string): string {
    const hashPrefix = process.env.HASH;
    if (!hashPrefix) {
      throw new InternalServerErrorException('Falta HASH en el entorno.');
    }
    return `${hashPrefix}:${password}`;
  }
}
