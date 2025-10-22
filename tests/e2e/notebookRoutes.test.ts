import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Notebook, NotebookPage } from "@prisma/client";
import type { AuthResult } from "@/lib/auth/middleware";

// ルート内部で利用される依存をモック化
vi.mock("@/lib/auth/middleware", () => ({
  requireAuth: vi.fn(() => ({ userId: "user-1" })),
  unauthorized: vi.fn(() => NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 })),
}));

vi.mock("@/services/noteService", () => ({
  noteService: {
    listMyNotebooks: vi.fn(),
    createNotebook: vi.fn(),
    updateNotebook: vi.fn(),
    savePageForOwner: vi.fn(),
  },
}));

import { GET, POST } from "@/app/api/notebooks/route";
import { PUT as PUT_NOTEBOOK } from "@/app/api/notebooks/[id]/route";
import { PUT as PUT_PAGE } from "@/app/api/notebooks/[id]/pages/route";
import { noteService } from "@/services/noteService";
import { requireAuth } from "@/lib/auth/middleware";

const mockedNoteService = vi.mocked(noteService);
const mockedRequireAuth = vi.mocked(requireAuth);

// テスト用の簡易リクエスト生成ヘルパー
function createJsonRequest<T>(payload: T): NextRequest {
  return {
    json: async () => payload,
  } as unknown as NextRequest;
}

describe("API /api/notebooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedRequireAuth.mockReturnValue({ userId: "user-1" } as AuthResult);
  });

  it("GET はノート一覧を返す", async () => {
    const sampleNotebook: Notebook = {
      id: "note-1",
      ownerId: "user-1",
      title: "サンプル",
      description: "説明",
      tags: [],
      isShared: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockedNoteService.listMyNotebooks.mockResolvedValue([sampleNotebook]);

    const response = await GET({} as NextRequest);
    const body = await response.json();

    expect(mockedNoteService.listMyNotebooks).toHaveBeenCalledWith("user-1");
    expect(body.notebooks).toHaveLength(1);
  });

  it("POST はノートを作成する", async () => {
    const createdNotebook: Notebook = {
      id: "note-1",
      ownerId: "user-1",
      title: "POST ノート",
      description: null,
      tags: [],
      isShared: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockedNoteService.createNotebook.mockResolvedValue(createdNotebook);

    const request = createJsonRequest({ title: "POST ノート" });
    const response = await POST(request);
    const body = await response.json();

    expect(mockedNoteService.createNotebook).toHaveBeenCalled();
    expect(body.notebook.title).toBe("POST ノート");
  });
});

describe("API /api/notebooks/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedRequireAuth.mockReturnValue({ userId: "user-1" } as AuthResult);
  });

  it("PUT はノートを更新する", async () => {
    const updatedNotebook: Notebook = {
      id: "note-1",
      ownerId: "user-1",
      title: "更新後タイトル",
      description: null,
      tags: [],
      isShared: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockedNoteService.updateNotebook.mockResolvedValue(updatedNotebook);

    const request = createJsonRequest({ title: "更新後タイトル", isShared: true });
    const response = await PUT_NOTEBOOK(request, { params: { id: "note-1" } });
    const body = await response.json();

    expect(mockedNoteService.updateNotebook).toHaveBeenCalledWith("user-1", {
      notebookId: "note-1",
      title: "更新後タイトル",
      description: undefined,
      tags: undefined,
      isShared: true,
    });
    expect(body.notebook.title).toBe("更新後タイトル");
  });
});

describe("API /api/notebooks/[id]/pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedRequireAuth.mockReturnValue({ userId: "user-1" } as AuthResult);
  });

  it("PUT はページを保存する", async () => {
    const savedPage: NotebookPage = {
      id: "page-1",
      notebookId: "note-1",
      pageNumber: 1,
      vectorJson: { saved: true },
      pdfAssetId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockedNoteService.savePageForOwner.mockResolvedValue(savedPage);

    const request = createJsonRequest({ pageNumber: 1, vectorJson: { saved: true } });
    const response = await PUT_PAGE(request, { params: { id: "note-1" } });
    const body = await response.json();

    expect(mockedNoteService.savePageForOwner).toHaveBeenCalledWith("user-1", {
      notebookId: "note-1",
      pageNumber: 1,
      vectorJson: { saved: true },
      pdfAssetId: null,
    });
    expect(body.page.pageNumber).toBe(1);
  });
});
