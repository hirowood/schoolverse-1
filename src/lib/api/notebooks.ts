"use client";
import type { NotebookSummary, NotebookPagePayload } from '@/types/note';

type NotebookPageResponse = {
  id: string;
  pageNumber: number;
  vectorJson: unknown;
  pdfAssetId: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch (error) {
    console.error('[api][notebooks] failed to parse json', error);
    throw new HttpError('INVALID_JSON_RESPONSE', response.status || 500);
  }
}

function createRequestInit(body?: unknown, method: 'GET' | 'POST' | 'PUT' = 'GET'): RequestInit {
  const init: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    cache: 'no-store',
  };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }
  return init;
}

export async function fetchNotebooks(): Promise<NotebookSummary[]> {
  const response = await fetch('/api/notebooks', createRequestInit());
  if (!response.ok) {
    throw new HttpError('FAILED_TO_FETCH_NOTEBOOKS', response.status);
  }
  const data = await parseJson<{ notebooks: NotebookSummary[] }>(response);
  return data.notebooks ?? [];
}

export async function createNotebook(payload: { title: string; description?: string | null; tags?: string[] }) {
  const response = await fetch('/api/notebooks', createRequestInit(payload, 'POST'));
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message = typeof error.error === 'string' ? error.error : 'FAILED_TO_CREATE_NOTEBOOK';
    throw new HttpError(message, response.status);
  }
  const data = await parseJson<{ notebook: NotebookSummary }>(response);
  return data.notebook;
}

export async function fetchNotebookPage(params: { notebookId: string; pageNumber: number }): Promise<NotebookPageResponse | null> {
  const url = new URL(`/api/notebooks/${params.notebookId}/pages`, window.location.origin);
  url.searchParams.set('page', String(params.pageNumber));

  const response = await fetch(url.toString(), createRequestInit());
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new HttpError('FAILED_TO_FETCH_NOTEBOOK_PAGE', response.status);
  }
  const data = await parseJson<{ page: NotebookPageResponse | null }>(response);
  return data.page ?? null;
}

export async function saveNotebookPage(params: {
  notebookId: string;
  payload: NotebookPagePayload;
}): Promise<NotebookPageResponse> {
  const response = await fetch(
    `/api/notebooks/${params.notebookId}/pages`,
    createRequestInit(params.payload, 'PUT'),
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message = typeof error.error === 'string' ? error.error : 'FAILED_TO_SAVE_NOTEBOOK_PAGE';
    throw new HttpError(message, response.status);
  }

  const data = await parseJson<{ page: NotebookPageResponse }>(response);
  return data.page;
}
