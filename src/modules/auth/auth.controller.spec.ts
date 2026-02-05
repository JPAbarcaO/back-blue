import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthController', () => {
  const userResponse = { id: 'user-1', email: 'demo@local', name: 'Demo' };

  it('should register a user', async () => {
    const authService = {} as AuthService;
    const usersService = {
      createUser: jest.fn().mockResolvedValue(userResponse),
    } as unknown as UsersService;
    const controller = new AuthController(authService, usersService);

    await expect(
      controller.register({ email: 'demo@local', password: 'pass', name: 'Demo' }),
    ).resolves.toEqual({ user: userResponse });

    expect(usersService.createUser).toHaveBeenCalledWith({
      email: 'demo@local',
      password: 'pass',
      name: 'Demo',
    });
  });

  it('should login and return token + user', async () => {
    const authService = {
      signPayload: jest.fn().mockResolvedValue({ accessToken: 'token-123' }),
    } as unknown as AuthService;
    const usersService = {
      validateUser: jest.fn().mockResolvedValue({ _id: 'user-1' }),
      toResponse: jest.fn().mockReturnValue(userResponse),
    } as unknown as UsersService;
    const controller = new AuthController(authService, usersService);

    await expect(
      controller.login({ email: 'demo@local', password: 'pass' }),
    ).resolves.toEqual({ accessToken: 'token-123', user: userResponse });

    expect(usersService.validateUser).toHaveBeenCalledWith('demo@local', 'pass');
    expect(usersService.toResponse).toHaveBeenCalled();
    expect(authService.signPayload).toHaveBeenCalledWith({
      sub: 'user-1',
      email: 'demo@local',
      name: 'Demo',
    });
  });

  it('should return profile from request', () => {
    const authService = {} as AuthService;
    const usersService = {} as UsersService;
    const controller = new AuthController(authService, usersService);

    const req = { user: { sub: 'user-1' } };
    expect(controller.getProfile(req)).toEqual({ user: req.user });
  });
});
