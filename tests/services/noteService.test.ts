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

describe('NoteService edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws NOTEBOOK_NOT_FOUND when updating with invalid ownership', async () => {
    repoMock.findById.mockResolvedValue(null);

    await expect(
      noteService.savePageForOwner('owner-1', {
        notebookId: 'missing-notebook',
        pageNumber: 1,
        vectorJson: null,
        pdfAssetId: null,
      }),
    ).rejects.toThrowError('NOTEBOOK_NOT_FOUND');

    expect(repoMock.findById).toHaveBeenCalledWith('missing-notebook');
    expect(repoMock.updatePage).not.toHaveBeenCalled();
    expect(repoMock.addPage).not.toHaveBeenCalled();
  });

  it('updates existing page instead of inserting when page already exists', async () => {
    repoMock.findById.mockResolvedValue({
      id: 'notebook-1',
      ownerId: 'owner-1',
      title: 'Existing',
      description: null,
      tags: [],
      isShared: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      pages: [
        {
          id: 'page-1',
          notebookId: 'notebook-1',
          pageNumber: 1,
          vectorJson: {},
          pdfAssetId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });
    repoMock.updatePage.mockResolvedValue({
      id: 'page-1',
      notebookId: 'notebook-1',
      pageNumber: 1,
      vectorJson: { content: 'updated' },
      pdfAssetId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await noteService.savePageForOwner('owner-1', {
      notebookId: 'notebook-1',
      pageNumber: 1,
      vectorJson: { content: 'updated' },
      pdfAssetId: null,
    });

    expect(repoMock.updatePage).toHaveBeenCalledWith('page-1', {
      vectorJson: { content: 'updated' },
      pdfAssetId: null,
    });
    expect(repoMock.addPage).not.toHaveBeenCalled();
    expect(result.vectorJson).toEqual({ content: 'updated' });
  });

  it('adds a new page when the requested page does not exist', async () => {
    repoMock.findById.mockResolvedValue({
      id: 'notebook-1',
      ownerId: 'owner-1',
      title: 'Existing',
      description: null,
      tags: [],
      isShared: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      pages: [],
    });
    repoMock.addPage.mockResolvedValue({
      id: 'page-2',
      notebookId: 'notebook-1',
      pageNumber: 2,
      vectorJson: { content: 'new' },
      pdfAssetId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await noteService.savePageForOwner('owner-1', {
      notebookId: 'notebook-1',
      pageNumber: 2,
      vectorJson: { content: 'new' },
      pdfAssetId: null,
    });

    expect(repoMock.addPage).toHaveBeenCalledWith({
      notebook: { connect: { id: 'notebook-1' } },
      pageNumber: 2,
      vectorJson: { content: 'new' },
      pdfAssetId: null,
    });
    expect(repoMock.updatePage).not.toHaveBeenCalled();
    expect(result.pageNumber).toBe(2);
  });
});
