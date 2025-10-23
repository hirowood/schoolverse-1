import { performance } from 'perf_hooks';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const repoMock = vi.hoisted(() => ({
  createNotebook: vi.fn(),
  updateNotebook: vi.fn(),
  findById: vi.fn(),
  listByOwner: vi.fn(),
  addPage: vi.fn(),
  updatePage: vi.fn(),
}));

vi.mock('@/repositories', () => ({
  notebookRepository: repoMock,
}));

// eslint-disable-next-line import/first
import { noteService } from '@/services/noteService';

describe('Notebook performance smoke tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetching notebook list stays under 1ms on average across 200 runs', async () => {
    repoMock.listByOwner.mockResolvedValue(
      Array.from({ length: 5 }).map((_, index) => ({
        id: `notebook-${index}`,
        ownerId: 'owner-1',
        title: `Notebook ${index}`,
        description: null,
        tags: [],
        isShared: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    );

    const iterations = 200;
    const start = performance.now();
    for (let i = 0; i < iterations; i += 1) {
      await noteService.listMyNotebooks('owner-1');
    }
    const duration = performance.now() - start;
    const average = duration / iterations;

    expect(average).toBeLessThan(1);
  });

  it('savePageForOwner handles insert workload within 2ms average', async () => {
    repoMock.findById.mockResolvedValue({
      id: 'notebook-1',
      ownerId: 'owner-1',
      title: 'Performance Notebook',
      description: null,
      tags: [],
      isShared: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      pages: [],
    });
    repoMock.addPage.mockResolvedValue({
      id: 'page-1',
      notebookId: 'notebook-1',
      pageNumber: 1,
      vectorJson: {},
      pdfAssetId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const iterations = 100;
    const start = performance.now();
    for (let i = 0; i < iterations; i += 1) {
      await noteService.savePageForOwner('owner-1', {
        notebookId: 'notebook-1',
        pageNumber: 1,
        vectorJson: { index: i },
        pdfAssetId: null,
      });
    }
    const duration = performance.now() - start;
    const average = duration / iterations;

    expect(average).toBeLessThan(2);
  });
});
