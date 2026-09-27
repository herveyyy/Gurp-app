"use client";

import React, { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";
import { useTheme } from "@/lib/theme/ThemeProvider";

export function ThemeSelector() {
  const { presets, presetId, activePreset, selectPreset, resetTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="trigger-chip flex items-center gap-2 px-2.5 py-1 rounded-xl border border-outline-variant/30 bg-surface-container-low hover:bg-surface-container-high transition-all text-[11px] font-mono font-bold text-on-surface cursor-pointer shadow-xs"
        title="Change application color theme"
      >
        <span
          className="w-3 h-3 rounded-full border border-outline-variant/40 shrink-0"
          style={{
            backgroundColor: activePreset.vars["--primary"],
            boxShadow: `0 0 0 2px ${activePreset.vars["--surface"]}`,
          }}
        />
        <span className="truncate max-w-[130px] sm:max-w-none">
          {activePreset.label}
        </span>
        <FiChevronDown className={`w-3 h-3 text-on-surface-muted chevron-spin ${isOpen ? "rotated" : ""}`} />
      </button>

      {isOpen && (
        <div className="dropdown-animated absolute right-0 mt-1.5 w-72 sm:w-80 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest/95 shadow-2xl z-50 p-2.5 space-y-1.5 backdrop-blur-md">
          <div className="flex items-center justify-between px-2 py-1 border-b border-outline-variant/20 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-on-surface-muted">
              Select Color Theme
            </span>
            <button
              onClick={() => {
                resetTheme();
                setIsOpen(false);
              }}
              className="trigger-chip text-[9px] font-mono font-bold text-primary hover:underline cursor-pointer"
            >
              [RESET DEFAULT]
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-1 pr-1">
            {presets.map((preset) => {
              const isSelected = presetId === preset.id;
              const v = preset.vars;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    selectPreset(preset.id);
                    setIsOpen(false);
                  }}
                  className={`trigger-chip w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer group ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-xs"
                      : "border-outline-variant/20 hover:border-outline-variant/40 hover:bg-surface-container-low"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold text-on-surface truncate">
                        {preset.label}
                      </span>
                      {preset.id === "beige-brown" && (
                        <span className="px-1 py-0.2 rounded text-[8px] font-mono font-bold bg-amber-500/20 text-amber-800">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-mono text-on-surface-muted truncate mt-0.5">
                      {preset.description}
                    </p>
                  </div>

                  {/* Color Swatch Previews */}
                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className="w-4 h-4 rounded-full border border-black/10"
                      style={{ backgroundColor: v["--surface"] }}
                      title="Surface"
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-black/10"
                      style={{ backgroundColor: v["--primary"] }}
                      title="Primary"
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-black/10"
                      style={{ backgroundColor: v["--secondary"] }}
                      title="Secondary"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
