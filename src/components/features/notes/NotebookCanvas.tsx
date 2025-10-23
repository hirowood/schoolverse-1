"use client";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type {
  Canvas,
  CanvasEvents,
  CanvasPointerEvents,
  FabricObject,
  Rect,
} from 'fabric';

export type NotebookTool = 'select' | 'pen' | 'rectangle' | 'text' | 'eraser';

export type NotebookCanvasHandle = {
  undo: () => void;
  redo: () => void;
  clear: () => void;
  deleteSelected: () => void;
  exportJson: () => unknown;
  load: (json: unknown | null) => Promise<void>;
};

type NotebookCanvasProps = {
  tool: NotebookTool;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  onChange?: (json: unknown) => void;
  onHistoryChange?: (state: { canUndo: boolean; canRedo: boolean }) => void;
};

type HistoryState = {
  past: unknown[];
  future: unknown[];
};

type FabricEventHandler<TEvent> = (event: TEvent) => void;

const MAX_HISTORY_LENGTH = 50;

function normalizeVectorJson(input: unknown): Record<string, unknown> | null {
  if (!input) return null;
  if (typeof input === 'string') {
    try {
      return JSON.parse(input) as Record<string, unknown>;
    } catch (error) {
      console.warn('[NotebookCanvas] Failed to parse vectorJson string', error);
      return null;
    }
  }
  if (typeof input === 'object') {
    return structuredClone(input as Record<string, unknown>);
  }
  return null;
}

const NotebookCanvas = forwardRef<NotebookCanvasHandle, NotebookCanvasProps>(
  ({ tool, strokeColor, fillColor, strokeWidth, onChange, onHistoryChange }, ref) => {
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const fabricModuleRef = useRef<typeof import('fabric') | null>(null);
  const pendingLoadRef = useRef<unknown | null>(null);
  const isRestoringRef = useRef(false);
  type RectangleHandlers = {
    onMouseDown: (event: CanvasPointerEvents['mouse:down']) => void;
    onMouseMove: (event: CanvasPointerEvents['mouse:move']) => void;
    onMouseUp: (event: CanvasPointerEvents['mouse:up']) => void;
  };
  type TextHandlers = { onMouseDown: (event: CanvasPointerEvents['mouse:down']) => void };
  type EraserHandlers = { onMouseDown: (event: CanvasPointerEvents['mouse:down']) => void };
  type ToolHandlers = { rectangle?: RectangleHandlers; text?: TextHandlers; eraser?: EraserHandlers };
  const toolHandlersRef = useRef<ToolHandlers>({});
  type PointerDownEvent = CanvasPointerEvents['mouse:down'];
  type PointerMoveEvent = CanvasPointerEvents['mouse:move'];
  type PointerUpEvent = CanvasPointerEvents['mouse:up'];
  const historyRef = useRef<HistoryState>({ past: [], future: [] });
  const lastSerializedRef = useRef<string>('');
  const [isReady, setIsReady] = useState(false);

    const updateHistoryFlags = useCallback(() => {
      onHistoryChange?.({
        canUndo: historyRef.current.past.length > 1,
        canRedo: historyRef.current.future.length > 0,
      });
    }, [onHistoryChange]);

    const resetHistory = useCallback(
      (snapshot: unknown) => {
        historyRef.current = { past: [structuredClone(snapshot)], future: [] };
        lastSerializedRef.current = JSON.stringify(snapshot);
        updateHistoryFlags();
        onChange?.(structuredClone(snapshot));
      },
      [onChange, updateHistoryFlags],
    );

    const commitHistory = useCallback(() => {
      const canvas = fabricCanvasRef.current;
      if (!canvas || isRestoringRef.current) return;

      const snapshot = canvas.toJSON();
      const serialized = JSON.stringify(snapshot);
      if (serialized === lastSerializedRef.current) return;

      historyRef.current.past.push(structuredClone(snapshot));
      if (historyRef.current.past.length > MAX_HISTORY_LENGTH) {
        historyRef.current.past = historyRef.current.past.slice(-MAX_HISTORY_LENGTH);
      }
      historyRef.current.future = [];
      lastSerializedRef.current = serialized;
      updateHistoryFlags();
      onChange?.(snapshot);
    }, [onChange, updateHistoryFlags]);

    const detachToolHandlers = useCallback(() => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      const handlers = toolHandlersRef.current;
      if (handlers.rectangle) {
        canvas.off('mouse:down', handlers.rectangle.onMouseDown);
        canvas.off('mouse:move', handlers.rectangle.onMouseMove);
        canvas.off('mouse:up', handlers.rectangle.onMouseUp);
      }
      if (handlers.text) {
        canvas.off('mouse:down', handlers.text.onMouseDown);
      }
      if (handlers.eraser) {
        canvas.off('mouse:down', handlers.eraser.onMouseDown);
      }
      toolHandlersRef.current = {};
    }, []);

    const applyCanvasSize = useCallback(() => {
      const canvas = fabricCanvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      canvas.setWidth(rect.width);
      canvas.setHeight(rect.height);
      canvas.renderAll();
    }, []);

    useEffect(() => {
      let isMounted = true;
      let resizeObserver: ResizeObserver | null = null;

      async function setupCanvas() {
        const canvasElement = canvasElementRef.current;
        if (!canvasElement) return;

        try {
          const fabricImport = await import('fabric');
          if (!isMounted) return;
          const fabricModule = (fabricImport as { fabric?: typeof fabricImport }).fabric ?? fabricImport;
          if (!fabricModule) {
            throw new Error('Failed to load Fabric.js');
          }
          fabricModuleRef.current = fabricModule;
          const canvas = new fabricModule.Canvas(canvasElement, {
            selection: true,
            preserveObjectStacking: true,
          });
          fabricCanvasRef.current = canvas;
          isRestoringRef.current = true;

          canvas.backgroundColor = '#ffffff';
          canvas.renderAll();

          applyCanvasSize();
          const container = containerRef.current;
          if (container && typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(() => applyCanvasSize());
            resizeObserver.observe(container);
          }

          const initialSnapshot = canvas.toJSON();
          historyRef.current = { past: [structuredClone(initialSnapshot)], future: [] };
          lastSerializedRef.current = JSON.stringify(initialSnapshot);
          updateHistoryFlags();
          onChange?.(initialSnapshot);

          // Attach event listeners for history tracking
          const handleObjectAdded: FabricEventHandler<CanvasEvents['object:added']> = (event) => {
            void event;
            commitHistory();
          };
          const handleObjectModified: FabricEventHandler<CanvasEvents['object:modified']> = (event) => {
            void event;
            commitHistory();
          };
          const handleObjectRemoved: FabricEventHandler<CanvasEvents['object:removed']> = (event) => {
            void event;
            commitHistory();
          };
          const handlePathCreated: FabricEventHandler<CanvasEvents['path:created']> = (event) => {
            void event;
            commitHistory();
          };

          canvas.on('object:added', handleObjectAdded);
          canvas.on('object:modified', handleObjectModified);
          canvas.on('object:removed', handleObjectRemoved);
          canvas.on('path:created', handlePathCreated);

          // Apply pending load if any
          if (pendingLoadRef.current !== null) {
            const data = pendingLoadRef.current;
            pendingLoadRef.current = null;
            await loadCanvas(data);
          }

          isRestoringRef.current = false;
          setIsReady(true);

          return () => {
            canvas.off('object:added', handleObjectAdded);
            canvas.off('object:modified', handleObjectModified);
            canvas.off('object:removed', handleObjectRemoved);
            canvas.off('path:created', handlePathCreated);
          };
        } catch (error) {
          console.error('[NotebookCanvas] Failed to initialize fabric canvas', error);
        }
      }

      const cleanupPromise = setupCanvas();

      return () => {
        isMounted = false;
        cleanupPromise
          ?.then((cleanup) => {
            cleanup?.();
          })
          .catch(() => undefined);
        detachToolHandlers();
        resizeObserver?.disconnect();
        fabricCanvasRef.current?.dispose();
        fabricCanvasRef.current = null;
        fabricModuleRef.current = null;
      };
    }, [applyCanvasSize, commitHistory, detachToolHandlers, onChange, updateHistoryFlags]);

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (!isReady) return;
        const target = event.target as HTMLElement | null;
        if (target && (target.isContentEditable || ['INPUT', 'TEXTAREA'].includes(target.tagName))) {
          return;
        }

        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
          event.preventDefault();
          if (event.shiftKey) {
            redo();
          } else {
            undo();
          }
        } else if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'y') {
          event.preventDefault();
          redo();
        } else if (event.key === 'Delete' || event.key === 'Backspace') {
          const canvas = fabricCanvasRef.current;
          if (!canvas) return;
          const objects = canvas.getActiveObjects() as FabricObject[];
          if (!objects.length) return;
          objects.forEach((object) => canvas.remove(object));
          canvas.discardActiveObject();
          canvas.requestRenderAll();
          commitHistory();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [commitHistory, isReady]);

    const loadCanvas = useCallback(
      (json: unknown | null) => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) {
          pendingLoadRef.current = json;
          return Promise.resolve();
        }
        const normalized = normalizeVectorJson(json);

        return new Promise<void>((resolve) => {
          isRestoringRef.current = true;
          canvas.backgroundColor = '#ffffff';
          canvas.discardActiveObject();
          canvas.clear();
          canvas.renderAll();

          if (!normalized) {
            const snapshot = canvas.toJSON();
            isRestoringRef.current = false;
            resetHistory(snapshot);
            return resolve();
          }

          canvas.loadFromJSON(normalized, () => {
            canvas.renderAll();
            isRestoringRef.current = false;
            const snapshot = canvas.toJSON();
            resetHistory(snapshot);
            resolve();
          });
        });
      },
      [resetHistory],
    );

    const undo = useCallback(() => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      if (historyRef.current.past.length <= 1) return;

      const current = historyRef.current.past.pop();
      if (current) {
        historyRef.current.future.push(structuredClone(current));
      }
      const previous = historyRef.current.past[historyRef.current.past.length - 1];
      if (!previous) return;

      isRestoringRef.current = true;
      canvas.loadFromJSON(previous, () => {
        canvas.renderAll();
        isRestoringRef.current = false;
        lastSerializedRef.current = JSON.stringify(previous);
        updateHistoryFlags();
        onChange?.(canvas.toJSON());
      });
    }, [onChange, updateHistoryFlags]);

    const redo = useCallback(() => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      if (!historyRef.current.future.length) return;

      const next = historyRef.current.future.pop();
      if (!next) return;
      historyRef.current.past.push(structuredClone(next));

      isRestoringRef.current = true;
      canvas.loadFromJSON(next, () => {
        canvas.renderAll();
        isRestoringRef.current = false;
        lastSerializedRef.current = JSON.stringify(next);
        updateHistoryFlags();
        onChange?.(canvas.toJSON());
      });
    }, [onChange, updateHistoryFlags]);

    const clear = useCallback(() => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      if (!canvas.getObjects().length) return;
      canvas.getObjects()
        .slice()
        .forEach((object) => canvas.remove(object));
      canvas.discardActiveObject();
      canvas.renderAll();
      commitHistory();
    }, [commitHistory]);

    const deleteSelected = useCallback(() => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      const active = canvas.getActiveObjects();
      if (!active.length) return;
      active.forEach((object) => canvas.remove(object));
      canvas.discardActiveObject();
      canvas.renderAll();
      commitHistory();
    }, [commitHistory]);

    useImperativeHandle(
      ref,
      () => ({
        undo,
        redo,
        clear,
        deleteSelected,
        exportJson: () => fabricCanvasRef.current?.toJSON(),
        load: loadCanvas,
      }),
      [clear, deleteSelected, loadCanvas, redo, undo],
    );

    useEffect(() => {
      const canvas = fabricCanvasRef.current;
      const fabricModule = fabricModuleRef.current;
      if (!canvas || !fabricModule) return;

      detachToolHandlers();
      canvas.isDrawingMode = false;
      canvas.selection = tool === 'select';
      canvas.defaultCursor = tool === 'pen' || tool === 'rectangle' ? 'crosshair' : 'default';

      if (tool === 'pen') {
        const brush = new fabricModule.PencilBrush(canvas);
        brush.color = strokeColor;
        brush.width = strokeWidth;
        brush.decimate = 6;
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = brush;
        return;
      }

      if (tool === 'rectangle') {
        let rect: Rect | null = null;
        let startX = 0;
        let startY = 0;

        const onMouseDown = (event: PointerDownEvent) => {
          if (!canvas) return;
          if ('button' in event.e && event.e.button !== 0) return;
          const pointer = canvas.getPointer(event.e);
          startX = pointer.x;
          startY = pointer.y;
          rect = new fabricModule.Rect({
            left: startX,
            top: startY,
            width: 0,
            height: 0,
            fill: fillColor,
            stroke: strokeColor,
            strokeWidth,
            selectable: false,
            evented: false,
            rx: 4,
            ry: 4,
          });
          canvas.add(rect);
        };

        const onMouseMove = (event: PointerMoveEvent) => {
          if (!canvas || !rect) return;
          const pointer = canvas.getPointer(event.e);
          const width = pointer.x - startX;
          const height = pointer.y - startY;
          rect.set({
            width: Math.abs(width),
            height: Math.abs(height),
            left: width < 0 ? pointer.x : startX,
            top: height < 0 ? pointer.y : startY,
          });
          rect.setCoords();
          canvas.renderAll();
        };

        const onMouseUp = (event: PointerUpEvent) => {
          void event;
          if (!canvas || !rect) return;
          rect.set({ selectable: true, evented: true });
          rect = null;
          commitHistory();
        };

        canvas.on('mouse:down', onMouseDown);
        canvas.on('mouse:move', onMouseMove);
        canvas.on('mouse:up', onMouseUp);
        toolHandlersRef.current.rectangle = { onMouseDown, onMouseMove, onMouseUp };
        return;
      }

      if (tool === 'text') {
        const onMouseDown = (event: PointerDownEvent) => {
          if (!canvas) return;
          if ('button' in event.e && event.e.button !== 0) return;
          if (event.target) return;
          const pointer = canvas.getPointer(event.e);
          const text = new fabricModule.IText('テキスト', {
            left: pointer.x,
            top: pointer.y,
            fill: strokeColor,
            fontSize: Math.max(16, strokeWidth * 4),
            fontWeight: 'bold',
          });
          canvas.add(text);
          canvas.setActiveObject(text);
          text.enterEditing();
          text.selectAll();
          canvas.renderAll();
          commitHistory();
        };
        canvas.on('mouse:down', onMouseDown);
        toolHandlersRef.current.text = { onMouseDown };
        return;
      }

      if (tool === 'eraser') {
        const onMouseDown = (event: PointerDownEvent) => {
          if (!canvas) return;
          if ('button' in event.e && event.e.button !== 0) return;
          if (event.target) {
            canvas.remove(event.target);
            canvas.renderAll();
            commitHistory();
          }
        };
        canvas.on('mouse:down', onMouseDown);
        toolHandlersRef.current.eraser = { onMouseDown };
      }
    }, [commitHistory, detachToolHandlers, fillColor, strokeColor, strokeWidth, tool]);

    useEffect(() => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      if (tool === 'pen' && canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = strokeColor;
        canvas.freeDrawingBrush.width = strokeWidth;
      }
    }, [strokeColor, strokeWidth, tool]);

    return (
      <div ref={containerRef} className="relative h-full w-full overflow-hidden rounded-md border border-gray-200 bg-gray-50">
        <canvas ref={canvasElementRef} className="block h-full w-full" />
      </div>
    );
  },
);

NotebookCanvas.displayName = 'NotebookCanvas';

export default NotebookCanvas;
