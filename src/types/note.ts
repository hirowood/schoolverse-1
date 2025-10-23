/**
 * ノート機能で共通利用する型定義。
 * API Route / Service / フロントの三者が同じ構造を参照できるようにまとめています。
 */
export type CreateNotebookInput = {
  ownerId: string;
  title: string;
  description?: string | null;
  tags?: string[];
};

export type UpdateNotebookInput = {
  notebookId: string;
  title?: string;
  description?: string | null;
  tags?: string[];
  isShared?: boolean;
};

export type UpsertNotebookPageInput = {
  notebookId: string;
  pageNumber: number;
  vectorJson?: unknown;
  pdfAssetId?: string | null;
};

export type NotebookSummary = {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NotebookPagePayload = {
  pageNumber: number;
  vectorJson?: unknown;
  pdfAssetId?: string | null;
};
