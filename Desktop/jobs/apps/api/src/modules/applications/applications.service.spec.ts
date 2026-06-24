import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from './applications.service';
import { ApplicationsRepository } from './applications.repository';
import { ok, err, AppError } from '@nexahire/types';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let repository: jest.Mocked<ApplicationsRepository>;

  beforeEach(async () => {
    const mockRepo = {
      create: jest.fn(),
      findPage: jest.fn(),
      updateStatus: jest.fn(),
      getStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        { provide: ApplicationsRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
    repository = module.get(ApplicationsRepository);
  });

  it('should create an application successfully', async () => {
    const mockApp: any = { id: 'app-1', company: 'Google', role: 'SWE', status: 'applied' };
    repository.create.mockResolvedValue(ok(mockApp));

    const result = await service.create('user-1', { company: 'Google', role: 'SWE' });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.company).toBe('Google');
    }
  });

  it('should return paginated applications', async () => {
    const mockApps: any[] = [{ id: '1' }, { id: '2' }];
    repository.findPage.mockResolvedValue(ok({ data: mockApps, nextCursor: '2' }));

    const result = await service.findPage('user-1', 2);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.data.length).toBe(2);
      expect(result.value.nextCursor).toBe('2');
    }
  });

  it('should handle repository errors on create', async () => {
    repository.create.mockResolvedValue(err(new AppError('Internal', 'DB error')));
    const result = await service.create('user-1', { company: 'X', role: 'Y' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('Internal');
    }
  });
});
