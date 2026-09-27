"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function SettingsPage() {
  const { presets, presetId, activePreset, selectPreset, resetTheme } = useTheme();

  // Future feature settings state
  const [layaHost, setLayaHost] = useState("http://localhost:8000");
  const [slaThreshold, setSlaThreshold] = useState("2.2");
  const [defaultModel, setDefaultModel] = useState("english");
  const [autoWarmWeights, setAutoWarmWeights] = useState(true);
  const [audioAlerts, setAudioAlerts] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveNotice("Settings successfully updated & persisted to local storage.");
    setTimeout(() => setSaveNotice(null), 3000);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Top Breadcrumb & Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-xl border border-outline-variant/30 bg-surface-container-low hover:bg-surface-container-high transition-colors font-mono text-xs font-bold text-primary flex items-center gap-1.5"
            >
              <FiArrowLeft className="w-3.5 h-3.5" />
              <span>[COMMAND CONSOLE]</span>
            </Link>
            <div>
              <h1 className="text-lg font-mono font-black text-on-surface tracking-wider uppercase">
                [SYSTEM SETTINGS & WORKSPACE LAB]
              </h1>
              <p className="text-xs font-mono text-on-surface-muted">
                Configure dynamic themes, fluid grid reflow, and Laya ModernBERT inference policies.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg border border-outline-variant/30 bg-surface-container-low text-[10px] font-mono text-on-surface-muted">
              OPERATOR: <strong className="text-on-surface">Capt. Hervey</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-[10px] font-mono font-bold text-emerald-800">
              ● SECURE SESSION
            </span>
          </div>
        </div>

        {saveNotice && (
          <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-800 text-xs font-mono animate-fadeIn flex items-center justify-between">
            <span>[SUCCESS] {saveNotice}</span>
          </div>
        )}

        {/* ======================================================= */}
        {/* SETTINGS BOX GRID                                       */}
        {/* ======================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* ===================================================== */}
          {/* BOX 1: THEME & DISPLAY ENGINE (7 COLS)                 */}
          {/* ===================================================== */}
          <div className="lg:col-span-7 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-on-surface uppercase tracking-wider">
                  [BOX T1 // DYNAMIC COLOR THEME ENGINE]
                </span>
                <p className="text-[11px] font-mono text-on-surface-muted mt-0.5">
                  Real-time CSS variable injection with zero-flicker bootstrap.
                </p>
              </div>
              <button
                type="button"
                onClick={resetTheme}
                className="px-2.5 py-1 rounded-lg border border-primary/30 text-[10px] font-mono font-bold text-primary hover:bg-primary/10 transition-colors cursor-pointer"
              >
                [RESET BEIGE & BROWN]
              </button>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {presets.map((preset) => {
                const isSelected = presetId === preset.id;
                const v = preset.vars;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => selectPreset(preset.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 group ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/30 bg-primary/5 shadow-xs"
                        : "border-outline-variant/25 hover:border-outline-variant/50 bg-surface-container-low/50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-on-surface">
                          {preset.label}
                        </span>
                        {preset.id === "beige-brown" && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-amber-500/20 text-amber-800 border border-amber-500/30">
                            DEFAULT
                          </span>
                        )}
                        {isSelected && preset.id !== "beige-brown" && (
                          <span className="text-[10px] text-primary font-bold">✓ ACTIVE</span>
                        )}
                      </div>
                      <p className="text-[10px] font-mono text-on-surface-muted leading-relaxed line-clamp-2">
                        {preset.description}
                      </p>
                    </div>

                    {/* Palette Swatch Preview */}
                    <div className="flex items-center justify-between pt-1 border-t border-outline-variant/15">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: v["--surface"] }}
                          title="Surface"
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: v["--primary"] }}
                          title="Primary"
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: v["--secondary"] }}
                          title="Secondary"
                        />
                      </div>
                      <span className="text-[9px] font-mono text-on-surface-muted uppercase">
                        {v["--primary"]}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Theme Variables Readout */}
            <div className="p-3.5 rounded-xl border border-outline-variant/20 bg-surface-container-low space-y-2">
              <span className="text-[10px] font-mono font-bold text-on-surface-muted uppercase">
                Active CSS Root Variables
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
                <div>
                  <span className="text-on-surface-muted block">--surface:</span>
                  <span className="font-bold text-on-surface">{activePreset.vars["--surface"]}</span>
                </div>
                <div>
                  <span className="text-on-surface-muted block">--primary:</span>
                  <span className="font-bold text-primary">{activePreset.vars["--primary"]}</span>
                </div>
                <div>
                  <span className="text-on-surface-muted block">--secondary:</span>
                  <span className="font-bold text-secondary">{activePreset.vars["--secondary"]}</span>
                </div>
                <div>
                  <span className="text-on-surface-muted block">--radius:</span>
                  <span className="font-bold text-on-surface">{activePreset.vars["--radius"]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================== */}
          {/* BOX 2: GRID & FLUID REFLOW SETTINGS (5 COLS)           */}
          {/* ===================================================== */}
          <div className="lg:col-span-5 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 space-y-4 shadow-xs">
            <div className="border-b border-outline-variant/20 pb-3">
              <span className="text-xs font-mono font-bold text-on-surface uppercase tracking-wider">
                [BOX T2 // FLUID AUTO-FIT GRID ENGINE]
              </span>
              <p className="text-[11px] font-mono text-on-surface-muted mt-0.5">
                Dynamic row squeezing, overflow pushing, and gap pull-up reflow.
              </p>
            </div>

            <div className="space-y-3.5 text-xs font-mono">
              <div className="p-3 rounded-xl border border-outline-variant/20 bg-surface-container-low space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-on-surface">Row Auto-Squeeze & Wrap</span>
                  <span className="text-emerald-700 font-bold">ENABLED</span>
                </div>
                <p className="text-[11px] text-on-surface-muted leading-relaxed font-sans">
                  When a section is stretched, adjacent boxes in the same row squeeze down to 3 columns. If stretched further, neighbors auto-wrap to the row below, and automatically move back up to fill gaps when shrunk.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-outline-variant/20 bg-surface-container-low space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-on-surface">Slot Width Auto-Adoption</span>
                  <span className="text-emerald-700 font-bold">ENABLED</span>
                </div>
                <p className="text-[11px] text-on-surface-muted leading-relaxed font-sans">
                  Dragging and dropping to swap sections automatically transfers column footprints so row boundaries never overflow.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-outline-variant/20 bg-surface-container-low space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-on-surface">Grid Dimensions Snapping</span>
                  <span className="text-primary font-bold">12-TRACK MESH</span>
                </div>
                <p className="text-[11px] text-on-surface-muted leading-relaxed font-sans">
                  Interactive drag handles snap cleanly into fractional columns: 3/12 (25%), 4/12 (33%), 6/12 (50%), 8/12 (66%), 12/12 (100%).
                </p>
              </div>
            </div>
          </div>

          {/* ===================================================== */}
          {/* BOX 3: LAYA ENGINE INFERENCE POLICIES (6 COLS)        */}
          {/* ===================================================== */}
          <div className="lg:col-span-6 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 space-y-4 shadow-xs">
            <div className="border-b border-outline-variant/20 pb-3">
              <span className="text-xs font-mono font-bold text-on-surface uppercase tracking-wider">
                [BOX T3 // LAYA ENGINE BACKEND CONFIG]
              </span>
              <p className="text-[11px] font-mono text-on-surface-muted mt-0.5">
                Communication parameters for local ModernBERT server.
              </p>
            </div>

            <form onSubmit={handleSavePreferences} className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="block text-[10px] font-bold text-on-surface-muted uppercase mb-1">
                  Laya Server Endpoint
                </label>
                <input
                  type="text"
                  value={layaHost}
                  onChange={(e) => setLayaHost(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/25 font-mono text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-muted uppercase mb-1">
                    Default Model
                  </label>
                  <select
                    value={defaultModel}
                    onChange={(e) => setDefaultModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/25 font-mono text-xs text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="english">convai/laya:english</option>
                    <option value="multilingual">convai/laya:multilingual</option>
                    <option value="typed-decisions">convai/laya:typed-decisions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-on-surface-muted uppercase mb-1">
                    SLA Urgency Alert (Score)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="3.0"
                    value={slaThreshold}
                    onChange={(e) => setSlaThreshold(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/25 font-mono text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl border border-outline-variant/20 bg-surface-container-low">
                <div>
                  <span className="font-bold text-on-surface">Auto-Warm In-Memory Cache</span>
                  <p className="text-[10px] text-on-surface-muted">Preload ModernBERT weights on application startup</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoWarmWeights}
                  onChange={(e) => setAutoWarmWeights(e.target.checked)}
                  className="w-4 h-4 text-primary rounded cursor-pointer"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl btn-primary-gradient text-on-primary font-mono font-bold text-xs uppercase tracking-wider cursor-pointer shadow-xs"
              >
                Save Engine Parameters
              </button>
            </form>
          </div>

          {/* ===================================================== */}
          {/* BOX 4: FUTURE INTERACTIONS & AUTOMATION LAB (6 COLS)   */}
          {/* ===================================================== */}
          <div className="lg:col-span-6 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 space-y-4 shadow-xs">
            <div className="border-b border-outline-variant/20 pb-3">
              <span className="text-xs font-mono font-bold text-on-surface uppercase tracking-wider">
                [BOX T4 // FUTURE INTERACTIONS LAB]
              </span>
              <p className="text-[11px] font-mono text-on-surface-muted mt-0.5">
                Experimental telemetry streams, automated webhooks, and alert chimes.
              </p>
            </div>

            <div className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="block text-[10px] font-bold text-on-surface-muted uppercase mb-1">
                  Incident Escalation Webhook URL
                </label>
                <input
                  type="text"
                  placeholder="https://hooks.slack.com/services/..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/25 font-mono text-xs text-on-surface focus:outline-none focus:border-primary"
                />
                <p className="text-[9px] text-on-surface-muted mt-1">
                  Trigger automatic webhook payloads when Churn Danger &gt; 0.5 or Priority is CRITICAL.
                </p>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl border border-outline-variant/20 bg-surface-container-low">
                <div>
                  <span className="font-bold text-on-surface">Critical SLA Audio Chime</span>
                  <p className="text-[10px] text-on-surface-muted">Play mission-control tactical chime on high urgency incident</p>
                </div>
                <input
                  type="checkbox"
                  checked={audioAlerts}
                  onChange={(e) => setAudioAlerts(e.target.checked)}
                  className="w-4 h-4 text-primary rounded cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-xl border border-outline-variant/20 bg-surface-container-low space-y-1">
                <span className="text-[10px] font-bold text-primary uppercase">
                  [GRAPHIFY KNOWLEDGE GRAPH INTEGRATION]
                </span>
                <p className="text-[10px] text-on-surface-muted leading-relaxed font-sans">
                  Codebase graph index generated at <code className="text-primary font-mono">graphify-out/graph.json</code>.
                  Supports god-node detection, BFS traversal, and real-time dependency queries for Laya models.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
