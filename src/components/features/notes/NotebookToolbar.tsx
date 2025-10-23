"use client";
import { NotebookTool } from './NotebookCanvas';

type NotebookToolbarProps = {
  activeTool: NotebookTool;
  onToolChange: (tool: NotebookTool) => void;
  strokeColor: string;
  onStrokeColorChange: (color: string) => void;
  fillColor: string;
  onFillColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (value: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onDeleteSelected: () => void;
  onSave: () => void;
  isSaving: boolean;
  isDirty: boolean;
};

const TOOL_LABELS: Record<NotebookTool, string> = {
  select: '選択',
  pen: 'ペン',
  rectangle: '図形',
  text: 'テキスト',
  eraser: '消しゴム',
};

function toolButtonClass(active: boolean): string {
  const base = 'rounded border px-2 py-1 text-xs font-medium transition-colors';
  return active
    ? `${base} border-blue-600 bg-blue-600 text-white`
    : `${base} border-gray-200 bg-white text-gray-700 hover:border-blue-400 hover:text-blue-600`;
}

export default function NotebookToolbar({
  activeTool,
  onToolChange,
  strokeColor,
  onStrokeColorChange,
  fillColor,
  onFillColorChange,
  strokeWidth,
  onStrokeWidthChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  onDeleteSelected,
  onSave,
  isSaving,
  isDirty,
}: NotebookToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">ツール</span>
        {Object.keys(TOOL_LABELS).map((key) => {
          const tool = key as NotebookTool;
          return (
            <button
              key={tool}
              type="button"
              onClick={() => onToolChange(tool)}
              className={toolButtonClass(activeTool === tool)}
            >
              {TOOL_LABELS[tool]}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
        <label className="flex items-center gap-1 text-xs text-gray-600">
          線色
          <input
            type="color"
            aria-label="線色"
            value={strokeColor}
            onChange={(event) => onStrokeColorChange(event.target.value)}
            className="h-6 w-10 cursor-pointer border border-gray-200"
          />
        </label>
        <label className="flex items-center gap-1 text-xs text-gray-600">
          塗り
          <input
            type="color"
            aria-label="塗りつぶし色"
            value={fillColor}
            onChange={(event) => onFillColorChange(event.target.value)}
            className="h-6 w-10 cursor-pointer border border-gray-200"
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-gray-600">
          線幅
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={strokeWidth}
            onChange={(event) => onStrokeWidthChange(Number(event.target.value))}
            className="h-1.5 w-24 accent-blue-600"
          />
          <span className="w-6 text-right text-[10px] text-gray-500">{strokeWidth}px</span>
        </label>
      </div>

      <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 transition hover:border-blue-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          戻る
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 transition hover:border-blue-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          進む
        </button>
        <button
          type="button"
          onClick={onDeleteSelected}
          className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 transition hover:border-red-400 hover:text-red-600"
        >
          選択削除
        </button>
        <button
          type="button"
          onClick={onClear}
          className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 transition hover:border-red-400 hover:text-red-600"
        >
          全消去
        </button>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {isDirty && <span className="text-xs font-semibold text-orange-500">未保存の変更あり</span>}
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || !isDirty}
          className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isSaving ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  );
}
