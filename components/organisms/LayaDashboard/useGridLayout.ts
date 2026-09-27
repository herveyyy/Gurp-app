"use client";

import { useState, useEffect, useCallback } from "react";
import type { BoxConfig } from "./DraggableBox";

const STORAGE_KEY = "tiyakaluod_laya_grid_layout_v2";

export const DEFAULT_BOXES: BoxConfig[] = [
  {
    id: "box_presets",
    title: "[BOX 01 // SCENARIO PRESETS]",
    badge: "1-Click",
    colSpan: 3,
    height: 480,
    minimized: false,
  },
  {
    id: "box_payload",
    title: "[BOX 02 // TICKET PAYLOAD]",
    badge: "Active",
    colSpan: 4,
    height: 540,
    minimized: false,
  },
  {
    id: "box_decision",
    title: "[BOX 03 // DECISION MATRIX]",
    badge: "ModernBERT",
    colSpan: 5,
    height: 540,
    minimized: false,
  },
  {
    id: "box_weights",
    title: "[BOX 04 // WEIGHT LIFECYCLE]",
    badge: "RAM Cache",
    colSpan: 4,
    height: 380,
    minimized: false,
  },
  {
    id: "box_criteria",
    title: "[BOX 05 // CRITERIA PRESETS]",
    badge: "Built-in",
    colSpan: 4,
    height: 380,
    minimized: false,
  },
  {
    id: "box_raw",
    title: "[BOX 06 // RAW PROBABILITY TREE]",
    badge: "Vector Debug",
    colSpan: 4,
    height: 380,
    minimized: false,
  },
];

/**
 * Balances and auto-adjusts column widths across all grid rows
 * so each row cleanly adds up to 12 columns with zero empty gaps.
 * When column 1 and 2 are shrunk, the 3rd column (or last box in row)
 * dynamically expands to fit the remaining space up to 12.
 */
export function autoAdjustRowWidths(boxesList: BoxConfig[]): BoxConfig[] {
  const minSpan = 3;
  const nonMinimized = boxesList.filter((b) => !b.minimized).map((b) => ({ ...b }));
  const minimized = boxesList.filter((b) => b.minimized).map((b) => ({ ...b }));

  if (nonMinimized.length === 0) return [...minimized];

  const packedRows: BoxConfig[][] = [];
  const queue = [...nonMinimized];

  while (queue.length > 0) {
    const currentRow: BoxConfig[] = [];
    let currentSum = 0;

    // Pull first box for this row
    const first = queue.shift()!;
    first.colSpan = Math.max(minSpan, Math.min(12, first.colSpan));
    currentRow.push(first);
    currentSum = first.colSpan;

    // Greedily fit subsequent boxes into this row
    while (queue.length > 0 && currentSum < 12) {
      const spaceLeft = 12 - currentSum;
      if (spaceLeft < minSpan) {
        // Leftover space cannot fit another box (minSpan = 3)
        // Give leftover space to the last box in the current row
        currentRow[currentRow.length - 1].colSpan += spaceLeft;
        currentSum = 12;
        break;
      }

      const nextCandidate = queue[0];
      if (nextCandidate.colSpan <= spaceLeft) {
        // Candidate fits completely
        queue.shift();
        currentRow.push(nextCandidate);
        currentSum += nextCandidate.colSpan;
      } else if (spaceLeft >= minSpan) {
        // Candidate is larger than remaining space, but remaining space can hold it (>= 3)
        // Pull it into this row and let it dynamically take all remaining space!
        queue.shift();
        nextCandidate.colSpan = spaceLeft;
        currentRow.push(nextCandidate);
        currentSum = 12;
      } else {
        break;
      }
    }

    // If row ended and space remains (e.g. last row with no more boxes in queue)
    if (currentSum < 12 && currentRow.length > 0) {
      currentRow[currentRow.length - 1].colSpan += 12 - currentSum;
    }

    packedRows.push(currentRow);
  }

  const flattened: BoxConfig[] = [];
  packedRows.forEach((r) => flattened.push(...r));
  return [...flattened, ...minimized];
}

/**
 * Fluidly resizes a box's column span:
 * - Updates the target box span.
 * - Dynamically adjusts adjacent/subsequent boxes in the row so the 3rd column
 *   or last column automatically absorbs remaining width to 12.
 * - If space runs out, boxes auto-wrap to the row below; if space clears,
 *   boxes from below auto-move back up to fill the void.
 */
export function fluidResizeSpan(
  boxesList: BoxConfig[],
  targetId: string,
  desiredSpan: number
): BoxConfig[] {
  const minSpan = 3;
  const clampedDesired = Math.max(minSpan, Math.min(12, desiredSpan));

  // Find target and update its span
  const updated = boxesList.map((box) => {
    if (box.id === targetId) {
      return { ...box, colSpan: clampedDesired };
    }
    return { ...box };
  });

  return autoAdjustRowWidths(updated);
}

export function useGridLayout() {
  const [boxes, setBoxes] = useState<BoxConfig[]>(DEFAULT_BOXES);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Load from localStorage on client mount
  useEffect(() => {
    setIsClient(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = parsed.map((item) => {
            const def = DEFAULT_BOXES.find((d) => d.id === item.id);
            return def ? { ...def, ...item } : item;
          });
          DEFAULT_BOXES.forEach((def) => {
            if (!merged.find((m: BoxConfig) => m.id === def.id)) {
              merged.push(def);
            }
          });
          setBoxes(merged);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save to localStorage whenever boxes state changes
  const saveBoxes = useCallback((newBoxes: BoxConfig[]) => {
    setBoxes(newBoxes);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newBoxes));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const updateSpan = useCallback(
    (id: string, newSpan: number) => {
      saveBoxes(fluidResizeSpan(boxes, id, newSpan));
    },
    [boxes, saveBoxes]
  );

  const updateHeight = useCallback(
    (id: string, newHeight: number) => {
      saveBoxes(
        boxes.map((box) => (box.id === id ? { ...box, height: newHeight } : box))
      );
    },
    [boxes, saveBoxes]
  );

  const toggleMinimize = useCallback(
    (id: string) => {
      saveBoxes(
        boxes.map((box) =>
          box.id === id ? { ...box, minimized: !box.minimized } : box
        )
      );
    },
    [boxes, saveBoxes]
  );

  const resetLayout = useCallback(() => {
    saveBoxes(DEFAULT_BOXES);
  }, [saveBoxes]);

  // Auto-adjust all row widths to 12 columns
  const autoAdjustWidths = useCallback(() => {
    saveBoxes(autoAdjustRowWidths(boxes));
  }, [boxes, saveBoxes]);

  // Auto-adjust specific box to cycle clean quotas
  const autoFitSingleBoxWidth = useCallback(
    (id: string) => {
      const target = boxes.find((b) => b.id === id);
      if (!target) return;
      const nextQuota: Record<number, number> = {
        3: 4,
        4: 6,
        5: 6,
        6: 8,
        7: 8,
        8: 12,
        9: 12,
        10: 12,
        12: 4,
      };
      const newSpan = nextQuota[target.colSpan] || 6;
      updateSpan(id, newSpan);
    },
    [boxes, updateSpan]
  );

  const applyPreset = useCallback(
    (preset: "compact" | "balanced" | "widescreen") => {
      let updated: BoxConfig[];
      if (preset === "compact") {
        updated = boxes.map((b) => ({ ...b, colSpan: 4, minimized: false }));
      } else if (preset === "widescreen") {
        updated = boxes.map((b) => ({ ...b, colSpan: 6, minimized: false }));
      } else {
        updated = DEFAULT_BOXES;
      }
      saveBoxes(autoAdjustRowWidths(updated));
    },
    [boxes, saveBoxes]
  );

  // Drag and Drop handlers with slot width auto-adoption
  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id !== draggedId && dragOverId !== id) {
      setDragOverId(id);
    }
  }, [draggedId, dragOverId]);

  const handleDragLeave = useCallback((e: React.DragEvent, id: string) => {
    const currentTarget = e.currentTarget as HTMLElement | null;
    const relatedTarget = e.relatedTarget as Node | null;
    if (currentTarget && relatedTarget && currentTarget.contains(relatedTarget)) {
      return;
    }
    if (dragOverId === id) {
      setDragOverId(null);
    }
  }, [dragOverId]);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      if (!draggedId || draggedId === targetId) {
        setDraggedId(null);
        setDragOverId(null);
        return;
      }

      const draggedIndex = boxes.findIndex((b) => b.id === draggedId);
      const targetIndex = boxes.findIndex((b) => b.id === targetId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const nextBoxes = [...boxes];
        const draggedItem = { ...nextBoxes[draggedIndex] };
        const targetItem = { ...nextBoxes[targetIndex] };

        // Adopt target slot's width
        const targetSpan = targetItem.colSpan;
        const draggedSpan = draggedItem.colSpan;
        draggedItem.colSpan = targetSpan;
        targetItem.colSpan = draggedSpan;

        nextBoxes[draggedIndex] = targetItem;
        nextBoxes[targetIndex] = draggedItem;

        saveBoxes(autoAdjustRowWidths(nextBoxes));
      }

      setDraggedId(null);
      setDragOverId(null);
    },
    [boxes, draggedId, saveBoxes]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDragOverId(null);
  }, []);

  return {
    boxes,
    isClient,
    draggedId,
    dragOverId,
    updateSpan,
    updateHeight,
    toggleMinimize,
    resetLayout,
    applyPreset,
    autoAdjustWidths,
    autoFitSingleBoxWidth,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  };
}
