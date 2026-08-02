import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApplicationsService } from './applications.service';
import type { ApplicationsRepository } from './applications.repository';
import { ok, err, AppError } from '../../core/result';
import type { Application } from '@prisma/client';

/** A minimal mock of the repository — the service is the unit under test. */
type RepoMock = {
  create: ReturnType<typeof vi.fn>;
  findPage: ReturnType<typeof vi.fn>;
  updateStatus: ReturnType<typeof vi.fn>;
  getStats: ReturnType<typeof vi.fn>;
};

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let repo: RepoMock;

  beforeEach(() => {
    repo = {
      create: vi.fn(),
      findPage: vi.fn(),
      updateStatus: vi.fn(),
      getStats: vi.fn(),
    };
    service = new ApplicationsService(repo as unknown as ApplicationsRepository);
  });

  it('returns the created application on success', async () => {
    const app = { id: 'app-1', company: 'Google', role: 'SWE', status: 'applied' } as unknown as Application;
    repo.create.mockResolvedValue(ok(app));

    const result = await service.create('user-1', { company: 'Google', role: 'SWE' });

    expect(repo.create).toHaveBeenCalledWith('user-1', { company: 'Google', role: 'SWE' });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.company).toBe('Google');
    }
  });

  it('clamps the page size to 50 before hitting the repository', async () => {
    const apps = [{ id: '1' }, { id: '2' }] as unknown as Application[];
    repo.findPage.mockResolvedValue(ok({ data: apps, nextCursor: '2' }));

    const result = await service.findPage('user-1', 200);

    expect(repo.findPage).toHaveBeenCalledWith('user-1', 50, undefined);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.data).toHaveLength(2);
      expect(result.value.nextCursor).toBe('2');
    }
  });

  it('propagates a repository failure as an err Result', async () => {
    repo.create.mockResolvedValue(err(new AppError('Unexpected', 'DB error')));

    const result = await service.create('user-1', { company: 'X', role: 'Y' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('Unexpected');
      expect(result.error.message).toBe('DB error');
    }
  });
});
