"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { THEME_PRESETS, getDefaultThemePreset, type ThemePreset } from "./theme-presets";
import { readAppliedThemeVars, persistAppliedThemeVars } from "./theme-applied";
import {
  applyThemeVars,
  findPresetById,
  getClientThemeState,
  readCustomPresets,
  resolveThemeVars,
  writeStoredTheme,
  type CustomThemePreset,
} from "./theme.utils";
import type { ThemeVars } from "./theme-tokens";

interface ThemeContextType {
  isReady: boolean;
  presetId: string;
  activePreset: ThemePreset;
  presets: ThemePreset[];
  activeVars: ThemeVars;
  selectPreset: (presetId: string) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [presetId, setPresetId] = useState<string>(() => getDefaultThemePreset().id);
  const [customPresets, setCustomPresets] = useState<CustomThemePreset[]>([]);
  const [customVars, setCustomVars] = useState<Partial<ThemeVars>>({});

  // Client bootstrap
  useEffect(() => {
    try {
      const clientState = getClientThemeState();
      setCustomPresets(clientState.customPresets);
      setPresetId(clientState.presetId);
      setCustomVars(clientState.customVars);

      // Apply to document root immediately
      applyThemeVars(clientState.activeVars);
      document.documentElement.dataset.themeReady = "";
    } catch {
      // Fallback to default
      const def = getDefaultThemePreset();
      applyThemeVars(def.vars);
    }
    setIsReady(true);
  }, []);

  const presets = useMemo(() => {
    return [...THEME_PRESETS];
  }, []);

  const activeVars = useMemo(() => {
    return resolveThemeVars(presetId, customVars, customPresets);
  }, [presetId, customVars, customPresets]);

  const activePreset = useMemo(() => {
    return findPresetById(presetId, customPresets) ?? getDefaultThemePreset();
  }, [presetId, customPresets]);

  const selectPreset = useCallback(
    (nextPresetId: string) => {
      const found = findPresetById(nextPresetId, customPresets);
      if (!found) return;

      setPresetId(nextPresetId);
      setCustomVars({});
      applyThemeVars(found.vars);
      writeStoredTheme({ presetId: nextPresetId });
    },
    [customPresets]
  );

  const resetTheme = useCallback(() => {
    const def = getDefaultThemePreset();
    setPresetId(def.id);
    setCustomVars({});
    applyThemeVars(def.vars);
    writeStoredTheme({ presetId: def.id });
  }, []);

  const value = useMemo(
    () => ({
      isReady,
      presetId,
      activePreset,
      presets,
      activeVars,
      selectPreset,
      resetTheme,
    }),
    [isReady, presetId, activePreset, presets, activeVars, selectPreset, resetTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
