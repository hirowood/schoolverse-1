"use client";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import NotebookCanvas, {
  NotebookCanvasHandle,
  NotebookTool,
} from './NotebookCanvas';
import NotebookToolbar from './NotebookToolbar';
import {
  createNotebook,
  fetchNotebookPage,
  fetchNotebooks,
  saveNotebookPage,
  HttpError,
} from '@/lib/api/notebooks';
import type { NotebookSummary } from '@/types/note';

const EMPTY_SNAPSHOT = { version: '5.0.0', objects: [] as unknown[] };

function stringifySnapshot(snapshot: unknown): string {
  try {
    return JSON.stringify(snapshot ?? EMPTY_SNAPSHOT);
  } catch {
    return JSON.stringify(EMPTY_SNAPSHOT);
  }
}

export default function NotebookWorkspace() {
  const canvasRef = useRef<NotebookCanvasHandle>(null);
  const [notebooks, setNotebooks] = useState<NotebookSummary[]>([]);
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [tool, setTool] = useState<NotebookTool>('pen');
  const [strokeColor, setStrokeColor] = useState('#2563eb');
  const [fillColor, setFillColor] = useState('#93c5fd66');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });
  const [currentSnapshot, setCurrentSnapshot] = useState<unknown>(EMPTY_SNAPSHOT);
  const [currentSerialized, setCurrentSerialized] = useState(stringifySnapshot(EMPTY_SNAPSHOT));
  const [lastSavedSerialized, setLastSavedSerialized] = useState(stringifySnapshot(EMPTY_SNAPSHOT));
  const [isLoadingNotebooks, setIsLoadingNotebooks] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', description: '' });

  const selectedNotebook = useMemo(
    () => notebooks.find((item) => item.id === selectedNotebookId) ?? null,
    [notebooks, selectedNotebookId],
  );

  const isDirty = selectedNotebookId !== null && currentSerialized !== lastSavedSerialized;

  const handleHistoryState = useCallback((state: { canUndo: boolean; canRedo: boolean }) => {
    setHistoryState(state);
  }, []);

  const handleCanvasChange = useCallback((snapshot: unknown) => {
    setCurrentSnapshot(snapshot);
    setCurrentSerialized(stringifySnapshot(snapshot));
  }, []);

  const resetStatus = useCallback(() => {
    setStatusMessage(null);
    setErrorMessage(null);
  }, []);

  const loadNotebooks = useCallback(async () => {
    setIsLoadingNotebooks(true);
    resetStatus();
    try {
      const data = await fetchNotebooks();
      setNotebooks(data);
      if (!data.length) {
        setSelectedNotebookId(null);
      } else if (!selectedNotebookId || !data.some((item) => item.id === selectedNotebookId)) {
        setSelectedNotebookId(data[0].id);
      }
    } catch (error) {
      console.error('[NotebookWorkspace] failed to fetch notebooks', error);
      setErrorMessage('ノート一覧の取得に失敗しました。');
    } finally {
      setIsLoadingNotebooks(false);
    }
  }, [resetStatus, selectedNotebookId]);

  useEffect(() => {
    loadNotebooks().catch(() => undefined);
  }, [loadNotebooks]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!selectedNotebookId) return;
    const notebookId = selectedNotebookId;
    let ignore = false;

    async function loadPage() {
      setIsPageLoading(true);
      resetStatus();
      try {
        const page = await fetchNotebookPage({ notebookId, pageNumber });
        if (ignore) return;
        await canvasRef.current?.load(page?.vectorJson ?? null);
        if (ignore) return;
        const exported = canvasRef.current?.exportJson() ?? EMPTY_SNAPSHOT;
        const serialized = stringifySnapshot(exported);
        setCurrentSnapshot(exported);
        setCurrentSerialized(serialized);
        setLastSavedSerialized(serialized);
      } catch (error) {
        if (ignore) return;
        console.error('[NotebookWorkspace] failed to load notebook page', error);
        const message =
          error instanceof HttpError && error.status === 404
            ? 'ページデータが存在しないため、新規ページを表示します。'
            : 'ページの読み込みに失敗しました。';
        setErrorMessage(message);
        await canvasRef.current?.load(null);
        if (ignore) return;
        const exported = canvasRef.current?.exportJson() ?? EMPTY_SNAPSHOT;
        const serialized = stringifySnapshot(exported);
        setCurrentSnapshot(exported);
        setCurrentSerialized(serialized);
        setLastSavedSerialized(serialized);
      } finally {
        if (!ignore) {
          setIsPageLoading(false);
        }
      }
    }

    loadPage().catch(() => undefined);
    return () => {
      ignore = true;
    };
  }, [pageNumber, resetStatus, selectedNotebookId]);

  useEffect(() => {
    if (!statusMessage) return;
    const timer = window.setTimeout(() => setStatusMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [statusMessage]);

  const confirmDiscardIfDirty = useCallback(() => {
    if (!isDirty) return true;
    return window.confirm('未保存の変更があります。破棄してもよろしいですか？');
  }, [isDirty]);

  const handleSelectNotebook = useCallback(
    (notebookId: string) => {
      if (notebookId === selectedNotebookId) return;
      if (!confirmDiscardIfDirty()) return;
      setSelectedNotebookId(notebookId);
      setPageNumber(1);
      resetStatus();
    },
    [confirmDiscardIfDirty, resetStatus, selectedNotebookId],
  );

  const handleChangePage = useCallback(
    (nextPage: number) => {
      if (nextPage < 1 || nextPage === pageNumber) return;
      if (!confirmDiscardIfDirty()) return;
      setPageNumber(nextPage);
      resetStatus();
    },
    [confirmDiscardIfDirty, pageNumber, resetStatus],
  );

  const handleSave = useCallback(async () => {
    if (!selectedNotebookId) return;
    setIsSaving(true);
    setStatusMessage(null);
    setErrorMessage(null);
    try {
      await saveNotebookPage({
        notebookId: selectedNotebookId,
        payload: {
          pageNumber,
          vectorJson: currentSnapshot,
        },
      });
      setLastSavedSerialized(currentSerialized);
      setStatusMessage('保存しました。');
    } catch (error) {
      console.error('[NotebookWorkspace] failed to save notebook page', error);
      setErrorMessage('保存に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  }, [currentSnapshot, currentSerialized, pageNumber, selectedNotebookId]);

  const handleCreateNotebook = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!createForm.title.trim()) {
        setErrorMessage('ノート名を入力してください。');
        return;
      }
      setIsCreating(true);
      setErrorMessage(null);
      try {
        const notebook = await createNotebook({
          title: createForm.title.trim(),
          description: createForm.description.trim() ? createForm.description.trim() : undefined,
        });
        setNotebooks((prev) => [notebook, ...prev]);
        setSelectedNotebookId(notebook.id);
        setPageNumber(1);
        setShowCreateForm(false);
        setCreateForm({ title: '', description: '' });
        setStatusMessage('ノートを追加しました。');
      } catch (error) {
        console.error('[NotebookWorkspace] failed to create notebook', error);
        setErrorMessage('ノートの作成に失敗しました。');
      } finally {
        setIsCreating(false);
      }
    },
    [createForm.description, createForm.title],
  );

  const handleDeleteSelected = useCallback(() => {
    canvasRef.current?.deleteSelected();
  }, []);

  const handleClearCanvas = useCallback(() => {
    if (!window.confirm('キャンバスを全て消去しますか？')) return;
    canvasRef.current?.clear();
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">ノート一覧</h2>
            <button
              type="button"
              onClick={() => setShowCreateForm((prev) => !prev)}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              {showCreateForm ? '閉じる' : '新規作成'}
            </button>
          </div>

          {showCreateForm && (
            <form onSubmit={handleCreateNotebook} className="mt-3 space-y-2 rounded border border-gray-200 p-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600">
                  ノート名
                  <input
                    type="text"
                    value={createForm.title}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, title: event.target.value }))}
                    className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="例: 数学ノート"
                  />
                </label>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600">
                  説明（任意）
                  <textarea
                    value={createForm.description}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, description: event.target.value }))}
                    className="mt-1 h-16 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="メモや補足を記入できます"
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={isCreating}
                className="w-full rounded bg-blue-600 py-1 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {isCreating ? '作成中...' : 'ノートを作成'}
              </button>
            </form>
          )}

          <div className="mt-4 space-y-2">
            {isLoadingNotebooks ? (
              <p className="text-xs text-gray-500">読み込み中...</p>
            ) : notebooks.length === 0 ? (
              <p className="text-xs text-gray-500">ノートがありません。新規作成してください。</p>
            ) : (
              notebooks.map((notebook) => {
                const isActive = notebook.id === selectedNotebookId;
                return (
                  <button
                    type="button"
                    key={notebook.id}
                    onClick={() => handleSelectNotebook(notebook.id)}
                    className={`w-full rounded border px-3 py-2 text-left text-xs transition ${
                      isActive
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-blue-400 hover:text-blue-600'
                    }`}
                  >
                    <span className="block font-semibold">{notebook.title}</span>
                    {notebook.description && (
                      <span className="mt-1 line-clamp-2 text-[10px] text-gray-500">{notebook.description}</span>
                    )}
                    <span className="mt-1 block text-[10px] text-gray-400">
                      更新: {new Date(notebook.updatedAt).toLocaleString()}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="flex flex-col gap-4 rounded-md border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {selectedNotebook?.title ?? 'ノートを選択してください'}
              </h2>
              <p className="text-xs text-gray-500">
                ページ {pageNumber}
                {isPageLoading && <span className="ml-2 animate-pulse text-gray-400">読み込み中...</span>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleChangePage(pageNumber - 1)}
                disabled={pageNumber <= 1}
                className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:border-blue-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                前のページ
              </button>
              <input
                type="number"
                min={1}
                value={pageNumber}
                onChange={(event) => handleChangePage(Number(event.target.value))}
                className="w-16 rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleChangePage(pageNumber + 1)}
                className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:border-blue-400 hover:text-blue-600"
              >
                次のページ
              </button>
            </div>
          </div>

          <NotebookToolbar
            activeTool={tool}
            onToolChange={setTool}
            strokeColor={strokeColor}
            onStrokeColorChange={setStrokeColor}
            fillColor={fillColor}
            onFillColorChange={setFillColor}
            strokeWidth={strokeWidth}
            onStrokeWidthChange={setStrokeWidth}
            canUndo={historyState.canUndo}
            canRedo={historyState.canRedo}
            onUndo={() => canvasRef.current?.undo()}
            onRedo={() => canvasRef.current?.redo()}
            onDeleteSelected={handleDeleteSelected}
            onClear={handleClearCanvas}
            onSave={handleSave}
            isSaving={isSaving}
            isDirty={isDirty}
          />

          <div className="relative min-h-[540px]">
            {isPageLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-white/70 text-sm text-gray-600">
                ページを読み込んでいます...
              </div>
            )}
            <NotebookCanvas
              ref={canvasRef}
              tool={tool}
              strokeColor={strokeColor}
              fillColor={fillColor}
              strokeWidth={strokeWidth}
              onChange={handleCanvasChange}
              onHistoryChange={handleHistoryState}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
            <div>{statusMessage}</div>
            <div className="flex items-center gap-3">
              {errorMessage && <span className="font-semibold text-red-500">{errorMessage}</span>}
              {!errorMessage && selectedNotebook && (
                <span className={isDirty ? 'text-orange-500' : 'text-green-600'}>
                  {isDirty ? '未保存の変更があります' : '保存済み'}
                </span>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
