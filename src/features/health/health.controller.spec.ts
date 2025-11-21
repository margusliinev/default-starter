import { createTestModule } from '../../common/testing/setup.testing';
import { HealthCheckService } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { TestingModule } from '@nestjs/testing';
import { HealthModule } from './health.module';

describe('HealthController', () => {
    let controller: HealthController;
    let healthCheckService: HealthCheckService;
    let module: TestingModule;

    beforeEach(async () => {
        module = await createTestModule({ imports: [HealthModule] });

        controller = module.get<HealthController>(HealthController);
        healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    });

    afterEach(async () => {
        await module.close();
    });

    it('should return health check result', async () => {
        const result = await controller.check();

        expect(result).toBeDefined();
        expect(result).toHaveProperty('status');
        expect(result).toHaveProperty('info');
        expect(result).toHaveProperty('error');
        expect(result).toHaveProperty('details');
    });

    it('should call health check service with database ping check', async () => {
        const checkSpy = jest.spyOn(healthCheckService, 'check').mockResolvedValue({
            status: 'ok',
            info: { database: { status: 'up' } },
            error: {},
            details: { database: { status: 'up' } },
        });

        await controller.check();

        expect(checkSpy).toHaveBeenCalled();
        expect(checkSpy).toHaveBeenCalledWith(expect.arrayContaining([expect.any(Function)]));

        checkSpy.mockRestore();
    });

    it('should return health status', async () => {
        const checkSpy = jest.spyOn(healthCheckService, 'check').mockResolvedValue({
            status: 'ok',
            info: { database: { status: 'up' } },
            error: {},
            details: { database: { status: 'up' } },
        });

        const result = await controller.check();

        expect(result.status).toBe('ok');
        expect(result.info?.database?.status).toBe('up');

        checkSpy.mockRestore();
    });

    it('should handle health check errors', async () => {
        const checkSpy = jest.spyOn(healthCheckService, 'check').mockResolvedValue({
            status: 'error',
            info: {},
            error: { database: { status: 'down', message: 'Database connection failed' } },
            details: { database: { status: 'down', message: 'Database connection failed' } },
        });

        const result = await controller.check();

        expect(result.status).toBe('error');
        expect(result.error?.database?.status).toBe('down');

        checkSpy.mockRestore();
    });
});
