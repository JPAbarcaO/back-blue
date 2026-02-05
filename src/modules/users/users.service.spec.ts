import { ConflictException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { UsersService } from './users.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UsersService', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  it('should create a user', async () => {
    process.env.HASH = 'BX';
    process.env.BCRYPT_SALT_ROUNDS = '10';

    const userModel = {
      findOne: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      }),
      create: jest.fn().mockResolvedValue({
        _id: { toString: () => 'user-1' },
        email: 'demo@local',
        name: 'Demo',
      }),
    };
    bcryptMock.hash.mockResolvedValue('hashed-password' as never);

    const service = new UsersService(userModel as never);

    await expect(
      service.createUser({ email: 'Demo@Local', password: 'pass', name: 'Demo' }),
    ).resolves.toEqual({
      id: 'user-1',
      email: 'demo@local',
      name: 'Demo',
    });

    expect(userModel.findOne).toHaveBeenCalledWith({ email: 'demo@local' });
    expect(bcryptMock.hash).toHaveBeenCalledWith('BX:pass', 10);
  });

  it('should throw conflict when email exists', async () => {
    const userModel = {
      findOne: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({ _id: 'existing' }),
      }),
    };
    const service = new UsersService(userModel as never);

    await expect(
      service.createUser({ email: 'demo@local', password: 'pass' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should throw error when HASH is missing', async () => {
    delete process.env.HASH;
    const userModel = {
      findOne: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      }),
    };
    const service = new UsersService(userModel as never);

    await expect(
      service.createUser({ email: 'demo@local', password: 'pass' }),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('should validate user with correct password', async () => {
    process.env.HASH = 'BX';
    const userDoc = {
      _id: 'user-1',
      email: 'demo@local',
      passwordHash: 'hashed-password',
    };
    const userModel = {
      findOne: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(userDoc),
      }),
    };
    bcryptMock.compare.mockResolvedValue(true as never);
    const service = new UsersService(userModel as never);

    await expect(service.validateUser('demo@local', 'pass')).resolves.toBe(userDoc);
    expect(bcryptMock.compare).toHaveBeenCalledWith('BX:pass', 'hashed-password');
  });

  it('should reject invalid email', async () => {
    const userModel = {
      findOne: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      }),
    };
    const service = new UsersService(userModel as never);

    await expect(service.validateUser('demo@local', 'pass')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('should reject invalid password', async () => {
    process.env.HASH = 'BX';
    const userModel = {
      findOne: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: 'user-1',
          email: 'demo@local',
          passwordHash: 'hashed-password',
        }),
      }),
    };
    bcryptMock.compare.mockResolvedValue(false as never);
    const service = new UsersService(userModel as never);

    await expect(service.validateUser('demo@local', 'wrong')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('should map user to response', () => {
    const service = new UsersService({} as never);
    const userDoc = {
      _id: { toString: () => 'user-1' },
      email: 'demo@local',
      name: null,
    };

    expect(service.toResponse(userDoc as never)).toEqual({
      id: 'user-1',
      email: 'demo@local',
      name: null,
    });
  });
});
