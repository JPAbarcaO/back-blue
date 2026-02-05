import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  it('should return status from service', () => {
    const healthService: HealthService = {
      getStatus: jest.fn().mockReturnValue({ status: 'ok' }),
    };
    const controller = new HealthController(healthService);

    expect(controller.getStatus()).toEqual({ status: 'ok' });
    expect(healthService.getStatus).toHaveBeenCalledTimes(1);
  });
});
