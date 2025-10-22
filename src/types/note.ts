/**
 * ノート関連の共通型。
 * API Routes, Services, Frontend で共有するため、ここに集約する。
 */
export type CreateNotebookInput = {
  ownerId: string;
  title: string;
  description?: string | null;
  tags?: string[];
};

export type UpsertNotebookPageInput = {
  notebookId: string;
  pageNumber: number;
  vectorJson?: unknown;
  pdfAssetId?: string | null;
};
