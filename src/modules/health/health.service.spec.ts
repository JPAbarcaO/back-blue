import { HealthService } from './health.service';

describe('HealthService', () => {
  it('should return ok status', () => {
    const service = new HealthService();

    expect(service.getStatus()).toEqual({ status: 'ok' });
  });
});
