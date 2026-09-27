"use client";

import React, { useState, useRef } from "react";

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
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDragLeave: (e: React.DragEvent, id: string) => void;
  onDrop: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  isDraggingCurrent?: boolean;
  isDragOverTarget?: boolean;
  draggedBoxTitle?: string;
  draggedBoxSpan?: number;
  onAutoFitWidth?: (id: string) => void;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
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
  const [resizeDirection, setResizeDirection] = useState<"width" | "height" | "both" | null>(null);
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
  const startResize = (direction: "width" | "height" | "both", e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    setResizeDirection(direction);

    const startX = e.clientX;
    const startY = e.clientY;

    const parentGrid = boxRef.current?.closest(".grid") as HTMLElement | null;
    const gridWidth = parentGrid ? parentGrid.offsetWidth : (window.innerWidth - 64);
    const colWidth = gridWidth / 12;

    const initialSpan = colSpan;
    const initialHeight = boxRef.current ? boxRef.current.offsetHeight : (height || 360);

    let currentCandidateSpan = initialSpan;
    let currentCandidateHeight = initialHeight;

    setPreviewSpan(initialSpan);
    setPreviewHeight(initialHeight);

    const onPointerMove = (moveEvent: PointerEvent) => {
      // Calculate Width resizing
      if (direction === "width" || direction === "both") {
        const deltaX = moveEvent.clientX - startX;
        const currentPixelWidth = initialSpan * colWidth + deltaX;
        const rawSpan = Math.round(currentPixelWidth / colWidth);
        const clampedSpan = Math.max(3, Math.min(12, rawSpan));
        currentCandidateSpan = clampedSpan;
        setPreviewSpan(clampedSpan);
      }

      // Calculate Height resizing
      if (direction === "height" || direction === "both") {
        const deltaY = moveEvent.clientY - startY;
        const clampedHeight = Math.max(160, Math.min(1200, initialHeight + deltaY));
        currentCandidateHeight = clampedHeight;
        setPreviewHeight(clampedHeight);
      }
    };

    const onPointerUp = () => {
      setIsResizing(false);
      setResizeDirection(null);

      // Auto-fit commit
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
        gridColumn: `span ${activeColSpan} / span ${activeColSpan}`,
        minHeight: minimized ? "auto" : activeHeight ? `${activeHeight}px` : undefined,
      }}
      className={`col-span-12 ${colClass} relative flex flex-col rounded-2xl border bg-surface-container-lowest transition-[grid-column,border,box-shadow] duration-150 select-none shadow-xs group ${
        isDraggingCurrent
          ? "opacity-25 scale-[0.98] border-dashed border-primary"
          : isDragOverTarget
          ? "ring-2 ring-primary ring-offset-2 border-primary bg-primary/5"
          : isResizing
          ? "border-primary ring-2 ring-primary/40 shadow-bloom"
          : "border-outline-variant/30 hover:border-outline-variant/50"
      }`}
    >
      {/* ======================================================== */}
      {/* LIVE AUTO-FIT PREVIEW WIREFRAME OVERLAY                  */}
      {/* ======================================================== */}
      {isResizing && (
        <div className="absolute inset-0 z-30 pointer-events-none rounded-2xl border-2 border-dashed border-primary bg-primary/[0.08] backdrop-blur-[1px] flex flex-col justify-between p-3 animate-fadeIn">
          {/* Top HUD */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-primary text-on-primary px-3 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                AUTO-FITTING: {previewSpan}/12 COLS ({Math.round((previewSpan / 12) * 100)}%)
              </span>
            </div>
            <div className="bg-surface-container-lowest/90 border border-outline-variant/30 px-2 py-0.5 rounded text-[10px] font-mono text-on-surface">
              {Math.round(previewHeight)}px Height
            </div>
          </div>

          {/* Grid Track Visualizer */}
          <div className="grid grid-cols-12 gap-1 w-full my-auto opacity-40">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className={`h-8 rounded border border-dashed text-[8px] font-mono flex items-center justify-center ${
                  i < previewSpan
                    ? "bg-primary/20 border-primary text-primary font-bold"
                    : "bg-surface-container-high/40 border-outline-variant/30 text-on-surface-muted"
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Bottom HUD Hint */}
          <div className="text-center">
            <span className="text-[10px] font-mono font-semibold bg-surface-container-lowest/90 text-primary px-2.5 py-1 rounded-md border border-primary/30">
              Release pointer to snap & auto-fit grid slot
            </span>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DROP TARGET PREVIEW OVERLAY (Zero-Shift / Non-Glitching) */}
      {/* ======================================================== */}
      {isDragOverTarget && !isDraggingCurrent && (
        <div className="absolute inset-0 z-40 pointer-events-none rounded-2xl border-2 border-dashed border-primary bg-primary/[0.12] backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center select-none shadow-bloom animate-fadeIn">
          <div className="flex items-center gap-2 bg-primary text-on-primary px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-md">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>[AUTO-FIT DROP ZONE // {draggedBoxTitle || "DROP TO SWAP"}]</span>
          </div>
          <p className="text-xs font-mono text-on-surface mt-2 font-bold">
            Drop here to swap positions & auto-fit into this slot
          </p>
          {draggedBoxSpan && (
            <span className="text-[10px] font-mono text-primary font-semibold mt-1 bg-surface-container-lowest/90 px-2.5 py-0.5 rounded-md border border-primary/25">
              Footprint: {draggedBoxSpan}/12 Columns ({Math.round((draggedBoxSpan / 12) * 100)}% Width)
            </span>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* BOX HEADER TOOLBAR & DRAG HANDLE                         */}
      {/* ======================================================== */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-outline-variant/20 bg-surface-container-low/70 rounded-t-2xl gap-2">
        {/* Left: Drag grip & Title */}
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

        {/* Right: Sizing, Actions, Minimize */}
        <div className="flex items-center gap-1.5 shrink-0">
          {headerAction}

          {/* Size Pill: Width Controls */}
          <div className="flex items-center rounded-lg border border-outline-variant/25 bg-surface-container-lowest px-1 py-0.5 text-[10px] font-mono font-bold text-on-surface-muted">
            <button
              type="button"
              onClick={() => handleSpanStep(-1)}
              title="Decrease width"
              className="px-1 hover:text-primary cursor-pointer disabled:opacity-30"
              disabled={colSpan <= 3}
            >
              -
            </button>
            <span
              onClick={() => onAutoFitWidth && onAutoFitWidth(id)}
              title="Click to auto-adjust width quota (4 -> 6 -> 8 -> 12)"
              className="px-1 text-[9px] text-primary cursor-pointer hover:bg-primary/10 rounded transition-colors"
            >
              {colSpan}/12
            </span>
            <button
              type="button"
              onClick={() => handleSpanStep(1)}
              title="Increase width"
              className="px-1 hover:text-primary cursor-pointer disabled:opacity-30"
              disabled={colSpan >= 12}
            >
              +
            </button>
          </div>

          {/* Maximize Toggle */}
          <button
            type="button"
            onClick={() => onUpdateSpan(id, colSpan === 12 ? 6 : 12)}
            title={colSpan === 12 ? "Restore Width" : "Full Width (12 Cols)"}
            className="p-1 rounded-md text-on-surface-muted hover:text-primary hover:bg-surface-container-high transition-colors cursor-pointer text-[10px] font-mono"
          >
            {colSpan === 12 ? "⊟" : "⛶"}
          </button>

          {/* Minimize/Collapse Toggle */}
          <button
            type="button"
            onClick={() => onToggleMinimize(id)}
            title={minimized ? "Expand Content" : "Minimize Box"}
            className="p-1 rounded-md text-on-surface-muted hover:text-primary hover:bg-surface-container-high transition-colors cursor-pointer text-[11px] font-mono"
          >
            {minimized ? "▼" : "▲"}
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* BOX BODY (COLLAPSIBLE)                                   */}
      {/* ======================================================== */}
      {!minimized && (
        <div className="flex-1 p-4 flex flex-col overflow-hidden relative">
          {children}

          {/* ==================================================== */}
          {/* INTERACTIVE MULTI-AXIS RESIZE HANDLES                */}
          {/* ==================================================== */}

          {/* 1. Right Edge Handle: Width auto-fit resize */}
          <div
            onPointerDown={(e) => startResize("width", e)}
            onDoubleClick={() => onAutoFitWidth && onAutoFitWidth(id)}
            title="Drag horizontally or double-click to auto-adjust width"
            className="absolute top-0 right-0 w-2.5 h-full cursor-ew-resize hover:bg-primary/20 transition-colors flex items-center justify-center group/edge z-20"
          >
            <div className="w-0.5 h-8 bg-outline-variant/40 group-hover/edge:bg-primary group-hover/edge:h-12 rounded-full transition-all" />
          </div>

          {/* 2. Bottom Edge Handle: Height auto-fit resize */}
          <div
            onPointerDown={(e) => startResize("height", e)}
            title="Drag vertically to auto-fit height"
            className="absolute bottom-0 left-0 w-full h-2.5 cursor-ns-resize hover:bg-primary/20 transition-colors flex items-center justify-center group/bottom z-20"
          >
            <div className="h-0.5 w-12 bg-outline-variant/40 group-hover/bottom:bg-primary group-hover/bottom:w-16 rounded-full transition-all" />
          </div>

          {/* 3. Corner Handle: Simultaneous Width & Height resize */}
          <div
            onPointerDown={(e) => startResize("both", e)}
            title="Drag to auto-fit both width and height simultaneously"
            className="absolute bottom-0.5 right-0.5 w-5 h-5 cursor-nwse-resize text-on-surface-muted/50 hover:text-primary hover:scale-110 select-none text-[12px] font-mono flex items-end justify-end p-0.5 z-20 transition-transform"
          >
            ◢
          </div>
        </div>
      )}
    </div>
  );
}
