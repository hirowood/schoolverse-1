import { describe, it, expect, beforeEach, vi } from "vitest";

// ノート機能のリポジトリをモック化し、サービス層の振る舞いを検証する
vi.mock("@/repositories", () => ({
  notebookRepository: {
    createNotebook: vi.fn(),
    updateNotebook: vi.fn(),
    findById: vi.fn(),
    listByOwner: vi.fn(),
    addPage: vi.fn(),
    updatePage: vi.fn(),
  },
}));

import { noteService } from "@/services/noteService";
import { notebookRepository } from "@/repositories";
import type { Notebook, NotebookPage } from "@prisma/client";

type NotebookWithPages = Notebook & { pages: NotebookPage[] };

const mockedNotebookRepository = vi.mocked(notebookRepository);

describe("NoteService", () => {
  const baseNotebook: NotebookWithPages = {
    id: "note-1",
    ownerId: "user-1",
    title: "はじめてのノート",
    description: "テスト用ノート",
    tags: ["math"],
    isShared: false,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    pages: [
      {
        id: "page-1",
        notebookId: "note-1",
        pageNumber: 1,
        vectorJson: { sample: true },
        pdfAssetId: null,
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-01"),
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedNotebookRepository.createNotebook.mockResolvedValue(baseNotebook);
    mockedNotebookRepository.updateNotebook.mockResolvedValue(baseNotebook);
    mockedNotebookRepository.listByOwner.mockResolvedValue([baseNotebook]);
    mockedNotebookRepository.findById.mockResolvedValue(baseNotebook);
    mockedNotebookRepository.updatePage.mockResolvedValue(baseNotebook.pages[0]);
    mockedNotebookRepository.addPage.mockResolvedValue({
      id: "page-2",
      notebookId: "note-1",
      pageNumber: 2,
      vectorJson: { another: true },
      pdfAssetId: null,
      createdAt: new Date("2025-01-02"),
      updatedAt: new Date("2025-01-02"),
    });
  });

  it("ノートを新規作成できる", async () => {
    const notebook = await noteService.createNotebook({
      ownerId: "user-1",
      title: "新しいノート",
      description: "説明",
      tags: ["science"],
    });

    expect(mockedNotebookRepository.createNotebook).toHaveBeenCalled();
    expect(notebook.title).toBe("はじめてのノート");
  });

  it("所有者としてノートを更新できる", async () => {
    const notebook = await noteService.updateNotebook("user-1", {
      notebookId: "note-1",
      title: "タイトル変更",
      isShared: true,
    });

    expect(mockedNotebookRepository.updateNotebook).toHaveBeenCalledWith("note-1", {
      title: "タイトル変更",
      isShared: true,
    });
    expect(notebook.id).toBe("note-1");
  });

  it("ノート一覧を取得できる", async () => {
    const notebooks = await noteService.listMyNotebooks("user-1");
    expect(mockedNotebookRepository.listByOwner).toHaveBeenCalledWith("user-1");
    expect(notebooks).toHaveLength(1);
  });

  it("既存ページを上書き保存できる", async () => {
    const page = await noteService.savePageForOwner("user-1", {
      notebookId: "note-1",
      pageNumber: 1,
      vectorJson: { updated: true },
      pdfAssetId: null,
    });

    expect(mockedNotebookRepository.updatePage).toHaveBeenCalled();
    expect(page.id).toBe("page-1");
  });

  it("存在しないページは新規作成される", async () => {
    // 2ページ目が存在しないことを模擬
    mockedNotebookRepository.findById.mockResolvedValue({
      ...baseNotebook,
      pages: baseNotebook.pages,
    });

    const page = await noteService.savePageForOwner("user-1", {
      notebookId: "note-1",
      pageNumber: 2,
      vectorJson: { newPage: true },
    });

    expect(mockedNotebookRepository.addPage).toHaveBeenCalled();
    expect(page.pageNumber).toBe(2);
  });

  it("所有者でない場合はエラーになる", async () => {
    mockedNotebookRepository.findById.mockResolvedValue({
      ...baseNotebook,
      ownerId: "another-user",
    });

    await expect(
      noteService.savePageForOwner("user-1", {
        notebookId: "note-1",
        pageNumber: 3,
      }),
    ).rejects.toThrowError("NOTEBOOK_NOT_FOUND");
  });
});
