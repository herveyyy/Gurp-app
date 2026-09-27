"use client";

import { useRef, useState, type DragEvent, type PointerEvent, type ReactNode } from "react";
import { FiChevronDown, FiMaximize2, FiMinimize2 } from "react-icons/fi";

export interface BoxConfig {
  id: string;
  title: string;
  badge?: string;
  colSpan: number; // 3, 4, 5, 6, 7, 8, 9, 10, 12
  height?: number; // custom min-height in px
  minimized?: boolean;
}

interface DraggableBoxProps {
  id: string;
  title: string;
  badge?: string;
  subtitle?: string;
  colSpan: number;
  height?: number;
  minimized?: boolean;
  onUpdateSpan: (id: string, newSpan: number) => void;
  onToggleMinimize: (id: string) => void;
  onUpdateHeight?: (id: string, newHeight: number) => void;
  onDragStart: (e: DragEvent, id: string) => void;
  onDragOver: (e: DragEvent, id: string) => void;
  onDragLeave: (e: DragEvent, id: string) => void;
  onDrop: (e: DragEvent, id: string) => void;
  onDragEnd: () => void;
  isDraggingCurrent?: boolean;
  isDragOverTarget?: boolean;
  draggedBoxTitle?: string;
  draggedBoxSpan?: number;
  onAutoFitWidth?: (id: string) => void;
  children: ReactNode;
  headerAction?: ReactNode;
}

export const COL_SPAN_CLASSES: Record<number, string> = {
  3: "lg:col-span-3",
  4: "lg:col-span-4",
  5: "lg:col-span-5",
  6: "lg:col-span-6",
  7: "lg:col-span-7",
  8: "lg:col-span-8",
  9: "lg:col-span-9",
  10: "lg:col-span-10",
  12: "lg:col-span-12",
};

export function DraggableBox({
  id,
  title,
  badge,
  subtitle,
  colSpan,
  height,
  minimized = false,
  onUpdateSpan,
  onToggleMinimize,
  onUpdateHeight,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  isDraggingCurrent = false,
  isDragOverTarget = false,
  draggedBoxTitle,
  draggedBoxSpan,
  onAutoFitWidth,
  children,
  headerAction,
}: DraggableBoxProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [previewSpan, setPreviewSpan] = useState<number>(colSpan);
  const [previewHeight, setPreviewHeight] = useState<number>(height || 360);

  const boxRef = useRef<HTMLDivElement>(null);

  const handleSpanStep = (delta: number) => {
    const validSpans = [3, 4, 5, 6, 7, 8, 12];
    const currentIndex = validSpans.indexOf(colSpan);
    if (currentIndex === -1) {
      onUpdateSpan(id, 6);
      return;
    }
    const nextIndex = Math.max(0, Math.min(validSpans.length - 1, currentIndex + delta));
    onUpdateSpan(id, validSpans[nextIndex]);
  };

  // Multi-axis resize handler (Width, Height, Both) with Auto-fit preview
  const startResize = (direction: "width" | "height" | "both", e: PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;

    const parentGrid = boxRef.current?.closest(".grid") as HTMLElement | null;
    const gridWidth = parentGrid ? parentGrid.offsetWidth : window.innerWidth - 64;
    const colWidth = gridWidth / 12;

    const initialSpan = colSpan;
    const initialHeight = boxRef.current ? boxRef.current.offsetHeight : height || 360;

    let currentCandidateSpan = initialSpan;
    let currentCandidateHeight = initialHeight;

    setPreviewSpan(initialSpan);
    setPreviewHeight(initialHeight);

    const validSpans = [3, 4, 5, 6, 7, 8, 12];
    const snapSpan = (raw: number) => {
      const clamped = Math.max(3, Math.min(12, raw));
      return validSpans.reduce((best, span) =>
        Math.abs(span - clamped) < Math.abs(best - clamped) ? span : best
      );
    };

    const onPointerMove = (moveEvent: globalThis.PointerEvent) => {
      if (direction === "width" || direction === "both") {
        const deltaX = moveEvent.clientX - startX;
        const currentPixelWidth = initialSpan * colWidth + deltaX;
        const rawSpan = Math.round(currentPixelWidth / colWidth);
        const clampedSpan = snapSpan(rawSpan);
        currentCandidateSpan = clampedSpan;
        setPreviewSpan(clampedSpan);
      }

      if (direction === "height" || direction === "both") {
        const deltaY = moveEvent.clientY - startY;
        const clampedHeight = Math.max(160, Math.min(1200, initialHeight + deltaY));
        currentCandidateHeight = clampedHeight;
        setPreviewHeight(clampedHeight);
      }
    };

    const onPointerUp = () => {
      setIsResizing(false);

      if (direction === "width" || direction === "both") {
        onUpdateSpan(id, currentCandidateSpan);
      }
      if ((direction === "height" || direction === "both") && onUpdateHeight) {
        onUpdateHeight(id, currentCandidateHeight);
      }

      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const activeColSpan = isResizing ? previewSpan : colSpan;
  const colClass = COL_SPAN_CLASSES[activeColSpan] || "lg:col-span-6";
  const activeHeight = isResizing ? previewHeight : height;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: HTML5 drag-and-drop card shell
    <div
      ref={boxRef}
      id={id}
      draggable={!isResizing}
      onDragStart={(e) => onDragStart(e, id)}
      onDragOver={(e) => onDragOver(e, id)}
      onDragLeave={(e) => onDragLeave(e, id)}
      onDrop={(e) => onDrop(e, id)}
      onDragEnd={onDragEnd}
      style={{
        // Span is driven by Tailwind lg:col-span-* only — never inline gridColumn,
        // so sub-lg layouts stay full-width (col-span-12) and avoid mid-glyph clipping.
        // Use height (not only minHeight) so the footer grip stays pinned to the bottom edge while resizing.
        height: minimized ? undefined : activeHeight ? `${activeHeight}px` : undefined,
        minHeight: minimized ? "auto" : activeHeight ? `${activeHeight}px` : undefined,
      }}
      className={`min-w-0 col-span-12 ${colClass} relative flex flex-col rounded-2xl border bg-surface-container-lowest transition-[border,box-shadow] duration-150 select-none shadow-xs group ${
        isDraggingCurrent
          ? "opacity-40 border-dashed border-primary"
          : isDragOverTarget
            ? "ring-2 ring-primary ring-offset-2 border-primary bg-primary/5"
            : isResizing
              ? "border-primary ring-2 ring-primary/40 shadow-bloom"
              : "border-outline-variant/30 hover:border-outline-variant/50"
      }`}
    >
      {isResizing && (
        <div className="absolute inset-x-0 top-0 bottom-6 z-30 pointer-events-none rounded-t-2xl border-2 border-b-0 border-dashed border-primary bg-primary/[0.03] flex flex-col p-3 animate-fadeIn">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-2 bg-primary text-on-primary px-3 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase shadow-md shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                AUTO-FITTING: {previewSpan}/12 COLS ({Math.round((previewSpan / 12) * 100)}%)
              </span>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant/30 px-2.5 py-0.5 rounded-lg text-[10px] font-mono text-on-surface shadow-xs font-bold shrink-0">
              {Math.round(previewHeight)}px Height
            </div>
          </div>
        </div>
      )}

      {isDragOverTarget && !isDraggingCurrent && (
        <div className="absolute inset-0 z-40 pointer-events-none rounded-2xl border-2 border-dashed border-primary bg-primary/10 flex flex-col items-center justify-center p-4 text-center select-none shadow-bloom animate-fadeIn">
          <div className="flex items-center gap-2 bg-primary text-on-primary px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-md max-w-full">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="truncate">
              {`[AUTO-FIT DROP ZONE // ${draggedBoxTitle || "DROP TO SWAP"}]`}
            </span>
          </div>
          <p className="text-xs font-mono text-on-surface mt-2 font-bold">
            Drop here to swap positions & auto-fit into this slot
          </p>
          {draggedBoxSpan && (
            <span className="text-[10px] font-mono text-primary font-semibold mt-1 bg-surface-container-lowest px-2.5 py-0.5 rounded-md border border-primary/25">
              Footprint: {draggedBoxSpan}/12 Columns ({Math.round((draggedBoxSpan / 12) * 100)}% Width)
            </span>
          )}
        </div>
      )}

      <div className="shrink-0 flex items-center justify-between px-3.5 py-2.5 border-b border-outline-variant/20 bg-surface-container-low/70 rounded-t-2xl gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            title="Drag to reposition section"
            className="cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-surface-container-high text-on-surface-muted hover:text-primary transition-colors flex items-center gap-1"
          >
            <span className="text-xs font-mono select-none">⠿</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono font-bold text-on-surface uppercase tracking-wider truncate">
                {title}
              </span>
              {badge && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-[9px] font-mono text-on-surface-muted truncate">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {headerAction}

          <div className="flex items-center rounded-lg border border-outline-variant/25 bg-surface-container-lowest px-1 py-0.5 text-[10px] font-mono font-bold text-on-surface-muted">
            <button
              type="button"
              onClick={() => handleSpanStep(-1)}
              title="Decrease width"
              className="trigger-chip px-1 hover:text-primary cursor-pointer disabled:opacity-30"
              disabled={colSpan <= 3}
            >
              -
            </button>
            <button
              type="button"
              onClick={() => onAutoFitWidth?.(id)}
              title="Click to auto-adjust width quota (4 -> 6 -> 8 -> 12)"
              className="trigger-chip px-1 text-[9px] text-primary cursor-pointer hover:bg-primary/10 rounded transition-colors"
            >
              {colSpan}/12
            </button>
            <button
              type="button"
              onClick={() => handleSpanStep(1)}
              title="Increase width"
              className="trigger-chip px-1 hover:text-primary cursor-pointer disabled:opacity-30"
              disabled={colSpan >= 12}
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={() => onUpdateSpan(id, colSpan === 12 ? 6 : 12)}
            title={colSpan === 12 ? "Restore Width" : "Full Width (12 Cols)"}
            className="trigger-chip p-1 rounded-md text-on-surface-muted hover:text-primary hover:bg-surface-container-high transition-colors cursor-pointer text-[11px]"
          >
            {colSpan === 12 ? <FiMinimize2 className="w-3 h-3" /> : <FiMaximize2 className="w-3 h-3" />}
          </button>

          <button
            type="button"
            onClick={() => onToggleMinimize(id)}
            title={minimized ? "Expand Content" : "Minimize Box"}
            className="trigger-chip p-1 rounded-md text-on-surface-muted hover:text-primary hover:bg-surface-container-high transition-colors cursor-pointer text-[11px]"
          >
            <FiChevronDown className={`w-3.5 h-3.5 chevron-spin ${minimized ? "rotated" : ""}`} />
          </button>
        </div>
      </div>

      <div className={`box-accordion min-h-0 ${minimized ? "collapsed" : "flex-1"}`}>
        <div className="box-accordion-inner flex h-full min-h-0 flex-col min-w-0">
          <div className="flex-1 min-h-0 p-4 flex flex-col overflow-x-hidden overflow-y-auto relative min-w-0">
            <div className="min-w-0 w-full h-full">{children}</div>
          </div>

          <div className="shrink-0 mt-auto h-6 border-t border-outline-variant/15 bg-surface-container-low/40 rounded-b-2xl px-3 flex items-center justify-between select-none relative z-40">
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-on-surface-muted min-w-0 pr-16">
              {isResizing ? (
                <span className="text-primary font-bold flex items-center gap-1.5 animate-pulse truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Release pointer to snap & auto-fit grid slot
                </span>
              ) : (
                <span className="text-[8px] tracking-wider uppercase opacity-40 truncate">
                  {colSpan}/12 COLS • {height || 540}PX
                </span>
              )}
            </div>

            <button
              type="button"
              onPointerDown={(e) => startResize("height", e)}
              title="Drag vertically to auto-fit height"
              aria-label="Resize height"
              className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-28 cursor-ns-resize flex items-center justify-center group/bottom py-1 z-10 bg-transparent border-0 p-0"
            >
              <span className="h-1 w-12 bg-outline-variant/50 group-hover/bottom:bg-primary group-hover/bottom:w-16 rounded-full transition-all" />
            </button>

            <button
              type="button"
              onPointerDown={(e) => startResize("both", e)}
              title="Drag to auto-fit both width and height simultaneously"
              aria-label="Resize width and height"
              className="relative z-10 cursor-nwse-resize text-on-surface-muted/70 hover:text-primary select-none p-1 flex items-center justify-center -mr-1 bg-transparent border-0"
            >
              <FiMaximize2 className="w-3 h-3 rotate-90" />
            </button>
          </div>
        </div>
      </div>

      {!minimized && (
        <button
          type="button"
          onPointerDown={(e) => startResize("width", e)}
          onDoubleClick={() => onAutoFitWidth?.(id)}
          title="Drag horizontally or double-click to auto-adjust width"
          aria-label="Resize width"
          className="absolute top-12 right-0 bottom-6 w-2.5 cursor-ew-resize hover:bg-primary/20 transition-colors flex items-center justify-center group/edge z-20 bg-transparent border-0 p-0"
        >
          <span className="w-0.5 h-10 bg-outline-variant/40 group-hover/edge:bg-primary group-hover/edge:h-14 rounded-full transition-all" />
        </button>
      )}
    </div>
  );
}
