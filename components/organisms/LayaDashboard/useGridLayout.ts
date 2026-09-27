"use client";

import { useState, useEffect, useCallback } from "react";
import type { BoxConfig } from "./DraggableBox";

const STORAGE_KEY = "tiyakaluod_laya_grid_layout_v2";

export const DEFAULT_BOXES: BoxConfig[] = [
  {
    id: "box_presets",
    title: "[BOX 01 // SCENARIO PRESETS]",
    badge: "1-Click",
    colSpan: 5,
    height: 250,
    minimized: false,
  },
  {
    id: "box_payload",
    title: "[BOX 02 // TICKET PAYLOAD]",
    badge: "Active",
    colSpan: 7,
    height: 540,
    minimized: false,
  },
  {
    id: "box_decision",
    title: "[BOX 03 // DECISION MATRIX]",
    badge: "ModernBERT",
    colSpan: 6,
    height: 540,
    minimized: false,
  },
  {
    id: "box_weights",
    title: "[BOX 04 // WEIGHT LIFECYCLE]",
    badge: "RAM Cache",
    colSpan: 3,
    height: 380,
    minimized: false,
  },
  {
    id: "box_criteria",
    title: "[BOX 05 // CRITERIA PRESETS]",
    badge: "Built-in",
    colSpan: 3,
    height: 380,
    minimized: false,
  },
  {
    id: "box_raw",
    title: "[BOX 06 // RAW PROBABILITY TREE]",
    badge: "Vector Debug",
    colSpan: 12,
    height: 280,
    minimized: false,
  },
];

/**
 * Balances and auto-adjusts column widths across all grid rows
 * so each row cleanly adds up to 12 columns with zero empty gaps.
 */
export function autoAdjustRowWidths(boxesList: BoxConfig[]): BoxConfig[] {
  const result: BoxConfig[] = [];
  let currentRow: BoxConfig[] = [];
  let currentSum = 0;

  for (const box of boxesList) {
    if (box.minimized) {
      result.push({ ...box });
      continue;
    }

    if (currentSum + box.colSpan > 12 && currentRow.length > 0) {
      const remaining = 12 - currentSum;
      if (remaining > 0) {
        const perItem = Math.floor(remaining / currentRow.length);
        let extra = remaining % currentRow.length;
        currentRow.forEach((b) => {
          b.colSpan = Math.min(12, b.colSpan + perItem + (extra > 0 ? 1 : 0));
          if (extra > 0) extra--;
        });
      }
      result.push(...currentRow);
      currentRow = [{ ...box }];
      currentSum = box.colSpan;
    } else {
      currentRow.push({ ...box });
      currentSum += box.colSpan;
    }
  }

  if (currentRow.length > 0) {
    const remaining = 12 - currentSum;
    if (remaining > 0) {
      const perItem = Math.floor(remaining / currentRow.length);
      let extra = remaining % currentRow.length;
      currentRow.forEach((b) => {
        b.colSpan = Math.min(12, b.colSpan + perItem + (extra > 0 ? 1 : 0));
        if (extra > 0) extra--;
      });
    }
    result.push(...currentRow);
  }

  return result;
}

/**
 * Fluidly resizes a box's column span:
 * - If expanding, other boxes in the row squeeze to accommodate down to minSpan (3).
 * - If other boxes become smaller than 3, they get pushed to the row down below,
 *   allowing the target box to expand cleanly.
 * - If shrinking, boxes from the row below auto-move back up to fill the empty space!
 */
export function fluidResizeSpan(
  boxesList: BoxConfig[],
  targetId: string,
  desiredSpan: number
): BoxConfig[] {
  const minSpan = 3;
  const clampedDesired = Math.max(minSpan, Math.min(12, desiredSpan));

  const nextList = boxesList.map((b) => ({ ...b }));
  const targetIndex = nextList.findIndex((b) => b.id === targetId);
  if (targetIndex === -1) return nextList;

  // Partition into current rows
  const rows: BoxConfig[][] = [];
  let curRow: BoxConfig[] = [];
  let curSum = 0;

  for (const b of nextList) {
    if (b.minimized) {
      rows.push([b]);
      continue;
    }
    if (curSum + b.colSpan > 12 && curRow.length > 0) {
      rows.push(curRow);
      curRow = [b];
      curSum = b.colSpan;
    } else {
      curRow.push(b);
      curSum += b.colSpan;
    }
  }
  if (curRow.length > 0) rows.push(curRow);

  // Find target's row
  const rowIndex = rows.findIndex((r) => r.some((b) => b.id === targetId));
  if (rowIndex === -1) {
    nextList[targetIndex].colSpan = clampedDesired;
    return autoAdjustRowWidths(nextList);
  }

  const row = rows[rowIndex];
  const targetInRow = row.find((b) => b.id === targetId)!;
  const otherBoxes = row.filter((b) => b.id !== targetId);

  if (otherBoxes.length > 0) {
    const spaceForOthers = 12 - clampedDesired;

    if (spaceForOthers >= otherBoxes.length * minSpan) {
      // Other boxes can absorb the expansion by squeezing
      targetInRow.colSpan = clampedDesired;
      const perOther = Math.floor(spaceForOthers / otherBoxes.length);
      let rem = spaceForOthers % otherBoxes.length;
      otherBoxes.forEach((b) => {
        b.colSpan = perOther + (rem > 0 ? 1 : 0);
        if (rem > 0) rem--;
      });
    } else {
      // Not enough space for other boxes on this row (too small < 3)!
      // Push other boxes to the next row down below
      targetInRow.colSpan = 12;
      otherBoxes.forEach((b) => {
        b.colSpan = Math.max(minSpan, Math.min(6, Math.floor(12 / otherBoxes.length)));
      });
    }
  } else {
    // Target was alone in this row
    if (clampedDesired < 12 && rowIndex < rows.length - 1) {
      // Target is shrinking, check if first box in row below can be pulled UP!
      const nextRow = rows[rowIndex + 1];
      const spaceAvailable = 12 - clampedDesired;
      if (nextRow.length > 0 && spaceAvailable >= minSpan) {
        targetInRow.colSpan = clampedDesired;
        const candidate = nextRow[0];
        candidate.colSpan = spaceAvailable;
      } else {
        targetInRow.colSpan = clampedDesired;
      }
    } else {
      targetInRow.colSpan = clampedDesired;
    }
  }

  // Re-flatten rows
  const flattened: BoxConfig[] = [];
  rows.forEach((r) => flattened.push(...r));

  return autoAdjustRowWidths(flattened);
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
