import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('should sign payload and return access token', async () => {
    const jwtService = {
      signAsync: jest.fn().mockResolvedValue('jwt-token'),
    };
    const service = new AuthService(jwtService as never);

    await expect(service.signPayload({ sub: '1' })).resolves.toEqual({
      accessToken: 'jwt-token',
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: '1' });
  });
});
