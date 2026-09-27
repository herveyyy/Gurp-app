"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLayaDashboard, SAMPLE_TEMPLATES } from "./layaDashboard.hooks";
import { DraggableBox, COL_SPAN_CLASSES } from "./DraggableBox";
import { useGridLayout } from "./useGridLayout";
import { ThemeSelector } from "@/components/molecules/ThemeSelector/ThemeSelector";
import { FiZap, FiCreditCard, FiShield, FiMessageSquare, FiCpu } from "react-icons/fi";
import type { LayaTicketTriageResponse } from "@/lib/entities/laya.type";

export function LayaDashboard() {
  const {
    health,
    presets,
    serverError,
    ticketForm,
    setTicketForm,
    triageMode,
    setTriageMode,
    selectedModel,
    setSelectedModel,
    triageResult,
    urgencyResult,
    batchResult,
    systemOneResult,
    sysStateJson,
    setSysStateJson,
    sysQuestionsJson,
    setSysQuestionsJson,
    isPending,
    notice,
    refreshHealth,
    handleTriage,
    handleBatchTriage,
    handleRunSystemOne,
    handleLoadModel,
    handleUnloadModel,
  } = useLayaDashboard();

  const {
    boxes,
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
  } = useGridLayout();

  const draggedBox = boxes.find((b) => b.id === draggedId);

  const [showRaw, setShowRaw] = useState(false);
  const [activeView, setActiveView] = useState<"matrix" | "systemone" | "batch">("matrix");
  const [batchRawInput, setBatchRawInput] = useState(
    JSON.stringify(
      SAMPLE_TEMPLATES.map((t) => t.data),
      null,
      2
    )
  );

  const isServerLive = health && health.status === "ok";

  const getPriorityStyle = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return "bg-rose-500/20 text-rose-700 border-rose-500/40";
      case "HIGH":
        return "bg-amber-500/20 text-amber-700 border-amber-500/40";
      case "MEDIUM":
        return "bg-sky-500/20 text-sky-700 border-sky-500/40";
      default:
        return "bg-emerald-500/20 text-emerald-700 border-emerald-500/40";
    }
  };

  const getQueueInfo = (queue: string) => {
    switch (queue.toLowerCase()) {
      case "infrastructure":
        return {
          badge: "bg-purple-100 text-purple-900 border-purple-300",
          code: "ENG-INFRA",
          icon: <FiZap className="w-5 h-5 text-purple-700" />,
        };
      case "billing":
        return {
          badge: "bg-emerald-100 text-emerald-900 border-emerald-300",
          code: "FIN-REV",
          icon: <FiCreditCard className="w-5 h-5 text-emerald-700" />,
        };
      case "security":
        return {
          badge: "bg-rose-100 text-rose-900 border-rose-300",
          code: "SEC-OPS",
          icon: <FiShield className="w-5 h-5 text-rose-700" />,
        };
      default:
        return {
          badge: "bg-sky-100 text-sky-900 border-sky-300",
          code: "CUST-SUPP",
          icon: <FiMessageSquare className="w-5 h-5 text-sky-700" />,
        };
    }
  };

  // Render content of individual modular boxes
  const renderBoxContent = (boxId: string) => {
    switch (boxId) {
      case "box_presets":
        return (
          <div className="grid grid-cols-2 gap-2 h-full content-start">
            {SAMPLE_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTicketForm(tmpl.data)}
                className="p-2.5 rounded-xl border border-outline-variant/20 bg-surface-container-low hover:bg-surface-container-high transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-secondary uppercase">
                    {tmpl.badge}
                  </span>
                  <span className="text-[9px] font-mono text-on-surface-muted">#{tmpl.data.ticket_id}</span>
                </div>
                <p className="text-xs font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                  {tmpl.label}
                </p>
              </button>
            ))}
          </div>
        );

      case "box_payload":
        return (
          <div className="space-y-3.5 flex flex-col h-full justify-between">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-on-surface-muted uppercase mb-1">
                    TICKET REF ID
                  </label>
                  <input
                    type="text"
                    value={ticketForm.ticket_id || ""}
                    onChange={(e) => setTicketForm((prev) => ({ ...prev, ticket_id: e.target.value }))}
                    className="w-full px-3 py-1.5 rounded-xl bg-surface-container-low border border-outline-variant/25 font-mono text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold text-on-surface-muted uppercase mb-1">
                    ACCOUNT TIER
                  </label>
                  <input
                    type="text"
                    value={ticketForm.customer || ""}
                    onChange={(e) => setTicketForm((prev) => ({ ...prev, customer: e.target.value }))}
                    className="w-full px-3 py-1.5 rounded-xl bg-surface-container-low border border-outline-variant/25 font-mono text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-on-surface-muted uppercase mb-1">
                  INCIDENT SUBJECT LINE
                </label>
                <input
                  type="text"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm((prev) => ({ ...prev, subject: e.target.value }))}
                  placeholder="Subject line..."
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/25 text-xs font-semibold text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-on-surface-muted uppercase mb-1">
                  FULL ISSUE STATEMENT / LOG
                </label>
                <textarea
                  rows={4}
                  value={ticketForm.body}
                  onChange={(e) => setTicketForm((prev) => ({ ...prev, body: e.target.value }))}
                  placeholder="Ticket text or customer payload..."
                  className="w-full p-3 rounded-xl bg-surface-container-low border border-outline-variant/25 font-sans text-xs text-on-surface leading-relaxed focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setTriageMode("full")}
                  className={`py-2 px-3 rounded-xl text-[11px] font-mono font-bold border transition-all cursor-pointer text-center ${
                    triageMode === "full"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-outline-variant/25 text-on-surface-muted hover:bg-surface-container-low"
                  }`}
                >
                  FULL CLASSIFICATION
                </button>
                <button
                  type="button"
                  onClick={() => setTriageMode("urgency_only")}
                  className={`py-2 px-3 rounded-xl text-[11px] font-mono font-bold border transition-all cursor-pointer text-center ${
                    triageMode === "urgency_only"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-outline-variant/25 text-on-surface-muted hover:bg-surface-container-low"
                  }`}
                >
                  RAPID SLA SCAN
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTriage}
              disabled={isPending || !ticketForm.subject || !ticketForm.body}
              className="w-full py-3 rounded-xl btn-primary-gradient text-on-primary font-mono font-bold text-xs tracking-wider uppercase transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-2 mt-2"
            >
              {isPending ? (
                <span>INFERRING WEIGHTS...</span>
              ) : (
                <span>DISPATCH SYSTEM 1 TRIAGE (SUB-50MS)</span>
              )}
            </button>
          </div>
        );

      case "box_decision":
        return triageResult ? (
          <div className="space-y-3.5 animate-fadeIn">
            {/* Top Destination Queue Cell */}
            <div className="p-3.5 rounded-xl border border-outline-variant/20 bg-surface-container-low flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono text-on-surface-muted uppercase">ASSIGNED QUEUE ROUTE</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xl">{getQueueInfo(triageResult.assigned_queue).icon}</span>
                  <span className="text-base font-bold font-mono uppercase text-on-surface">
                    {triageResult.assigned_queue}
                  </span>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${getQueueInfo(triageResult.assigned_queue).badge}`}>
                {getQueueInfo(triageResult.assigned_queue).code}
              </span>
            </div>

            {/* 2x2 Metric Block */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl border border-outline-variant/20 bg-surface-container-low">
                <p className="text-[10px] font-mono text-on-surface-muted uppercase">URGENCY SCORE</p>
                <p className="text-2xl font-black font-mono text-primary mt-1">
                  {triageResult.urgency_score}
                  <span className="text-xs font-normal text-on-surface-muted ml-1">/ 3.0</span>
                </p>
              </div>

              <div className="p-3 rounded-xl border border-outline-variant/20 bg-surface-container-low">
                <p className="text-[10px] font-mono text-on-surface-muted uppercase">PRIORITY TIER</p>
                <div className="mt-1">
                  <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${getPriorityStyle(triageResult.priority_level)}`}>
                    {triageResult.priority_level}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-outline-variant/20 bg-surface-container-low">
                <p className="text-[10px] font-mono text-on-surface-muted uppercase">CHURN DANGER</p>
                <p className={`text-lg font-black font-mono mt-1 ${triageResult.churn_risk_score > 0.5 ? "text-rose-600" : "text-on-surface"}`}>
                  {triageResult.churn_risk}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-outline-variant/20 bg-surface-container-low">
                <p className="text-[10px] font-mono text-on-surface-muted uppercase">SENTIMENT</p>
                <p className="text-xs font-bold font-mono uppercase text-on-surface mt-1.5 truncate">
                  {triageResult.sentiment}
                </p>
              </div>
            </div>

            {/* Dispatch Action Box */}
            <div className="p-3.5 rounded-xl border border-primary/25 bg-primary/5 space-y-1">
              <p className="text-[10px] font-mono font-bold text-primary uppercase">
                [DISPATCH DIRECTIVE]
              </p>
              <p className="text-xs font-medium text-on-surface leading-relaxed">
                {triageResult.action_recommendation}
              </p>
            </div>
          </div>
        ) : urgencyResult ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-outline-variant/20 bg-surface-container-low">
              <p className="text-[10px] font-mono text-on-surface-muted uppercase">SLA BREACH STATUS</p>
              <p className="text-xl font-bold font-mono text-rose-600 mt-1">{urgencyResult.sla_risk}</p>
              <div className="mt-3 flex items-center justify-between text-xs font-mono border-t border-outline-variant/20 pt-2">
                <span>URGENCY: <strong>{urgencyResult.urgency_score} / 3.0</strong></span>
                <span>TIER: <strong className="text-primary">{urgencyResult.priority_level}</strong></span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center border border-dashed border-outline-variant/30 rounded-xl flex flex-col items-center justify-center h-full min-h-[200px]">
            <FiCpu className="w-8 h-8 mb-2 text-primary/70 animate-pulse" />
            <p className="text-xs font-mono font-bold text-on-surface uppercase">Awaiting Triage Input</p>
            <p className="text-[11px] text-on-surface-muted max-w-xs mt-1">
              Inject a scenario dial and trigger inference to view decision telemetry.
            </p>
          </div>
        );

      case "box_weights":
        return (
          <div className="space-y-3 h-full flex flex-col justify-between">
            <div className="space-y-2">
              {["english", "multilingual", "typed-decisions"].map((name) => {
                const isLoaded = health?.loaded_models?.includes(name);
                return (
                  <div
                    key={name}
                    className="p-2.5 rounded-xl border border-outline-variant/20 bg-surface-container-low flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-mono font-bold text-on-surface">{name}</p>
                      <p className="text-[10px] font-mono text-on-surface-muted">
                        {isLoaded ? "ACTIVE (WARM)" : "IDLE (EVICTED)"}
                      </p>
                    </div>
                    <div>
                      {isLoaded ? (
                        <button
                          onClick={() => handleUnloadModel(name)}
                          disabled={isPending}
                          className="px-2 py-1 rounded-md text-[10px] font-mono font-bold bg-rose-500/10 text-rose-700 hover:bg-rose-500/20 cursor-pointer"
                        >
                          EVICT
                        </button>
                      ) : (
                        <button
                          onClick={() => handleLoadModel(name)}
                          disabled={isPending}
                          className="px-2 py-1 rounded-md text-[10px] font-mono font-bold bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
                        >
                          WARM
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => handleUnloadModel()}
              disabled={isPending}
              className="w-full py-1.5 rounded-lg border border-outline-variant/30 text-[10px] font-mono font-bold text-on-surface-muted hover:bg-surface-container-low transition-colors cursor-pointer"
            >
              [PURGE ENTIRE RAM CACHE]
            </button>
          </div>
        );

      case "box_criteria":
        return (
          <div className="space-y-1.5 overflow-y-auto max-h-64 pr-1">
            {presets?.built_in_presets &&
              Object.entries(presets.built_in_presets).map(([k, questions]) => (
                <div
                  key={k}
                  className="p-2 rounded-lg border border-outline-variant/15 bg-surface-container-low text-xs"
                >
                  <span className="font-mono font-bold text-primary uppercase text-[10px]">{k}</span>
                  <p className="text-[10px] font-mono text-on-surface-muted truncate mt-0.5">
                    {questions.join(", ")}
                  </p>
                </div>
              ))}
          </div>
        );

      case "box_raw":
        return triageResult?.raw ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-on-surface-muted">Raw Tensor Weights & Vectors</span>
              <button
                onClick={() => setShowRaw(!showRaw)}
                className="text-xs font-mono font-bold text-primary hover:underline cursor-pointer"
              >
                {showRaw ? "[- COLLAPSE]" : "[+ EXPAND TREE]"}
              </button>
            </div>
            {showRaw && (
              <pre className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 text-xs font-mono text-on-surface overflow-x-auto max-h-72">
                {JSON.stringify(triageResult.raw, null, 2)}
              </pre>
            )}
          </div>
        ) : (
          <p className="text-xs font-mono text-on-surface-muted">No raw vector telemetry recorded yet.</p>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-4">
      {/* ========================================================= */}
      {/* 1. TOP TELEMETRY GRID: CONTIGUOUS STAT CELLS             */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 border border-outline-variant/30 rounded-2xl bg-surface-container-lowest overflow-hidden shadow-xs divide-x divide-y lg:divide-y-0 divide-outline-variant/20">
        <div className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-on-surface-muted uppercase tracking-wider">
            <span>[SYS // ENGINE]</span>
            <span className={`w-2 h-2 rounded-full ${isServerLive ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
          </div>
          <p className="text-sm font-bold font-mono text-on-surface">
            {isServerLive ? "ONLINE (ModernBERT)" : "CONNECTING..."}
          </p>
        </div>

        <div className="p-3.5 space-y-1">
          <p className="text-[10px] font-mono text-on-surface-muted uppercase tracking-wider">[PORT // ROUTE]</p>
          <p className="text-sm font-bold font-mono text-primary truncate">127.0.0.1:8000</p>
        </div>

        <div className="p-3.5 space-y-1">
          <p className="text-[10px] font-mono text-on-surface-muted uppercase tracking-wider">[DEVICE // ACCEL]</p>
          <p className="text-sm font-bold font-mono text-on-surface uppercase">
            {health?.device || "CPU (Optimized)"}
          </p>
        </div>

        <div className="p-3.5 space-y-1">
          <p className="text-[10px] font-mono text-on-surface-muted uppercase tracking-wider">[LOADED WEIGHTS]</p>
          <p className="text-sm font-bold font-mono text-primary">
            {health?.loaded_models?.length ?? 0} Models Active
          </p>
        </div>

        <div className="p-3.5 space-y-1">
          <p className="text-[10px] font-mono text-on-surface-muted uppercase tracking-wider">[INFERENCE SLA]</p>
          <p className="text-sm font-bold font-mono text-emerald-700">{"< 50ms Non-Auto"}</p>
        </div>

        <div className="p-2.5 flex items-center justify-between bg-surface-container-low/60">
          <div>
            <p className="text-[10px] font-mono text-on-surface-muted uppercase">[OPERATOR]</p>
            <p className="text-xs font-bold font-mono text-on-surface truncate">Capt. Hervey</p>
          </div>
          <button
            onClick={refreshHealth}
            disabled={isPending}
            className="p-2 rounded-xl bg-surface-container-lowest hover:bg-surface-container-highest border border-outline-variant/30 text-primary transition-all cursor-pointer"
            title="Refresh Heartbeat"
          >
            <svg
              className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Global Alerts / Notices */}
      {serverError && (
        <div className="p-3.5 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-800 text-xs font-mono flex items-center justify-between">
          <span>[ALERT] {serverError}</span>
          <button onClick={refreshHealth} className="underline font-bold cursor-pointer">RECONNECT</button>
        </div>
      )}
      {notice && (
        <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-800 text-xs font-mono">
          [STATUS] {notice}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. COMMAND BAR & MODULAR LAYOUT CONTROLLER                */}
      {/* ========================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/30 pb-3">
        {/* Left: View Modes */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/20">
            <button
              onClick={() => setActiveView("matrix")}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                activeView === "matrix"
                  ? "bg-surface-container-lowest text-primary shadow-xs border border-outline-variant/30"
                  : "text-on-surface-muted hover:text-on-surface"
              }`}
            >
              [GRID // MODULAR CONSOLE]
            </button>
            <button
              onClick={() => setActiveView("batch")}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                activeView === "batch"
                  ? "bg-surface-container-lowest text-primary shadow-xs border border-outline-variant/30"
                  : "text-on-surface-muted hover:text-on-surface"
              }`}
            >
              [GRID // BATCH INTAKE]
            </button>
            <button
              onClick={() => setActiveView("systemone")}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                activeView === "systemone"
                  ? "bg-surface-container-lowest text-primary shadow-xs border border-outline-variant/30"
                  : "text-on-surface-muted hover:text-on-surface"
              }`}
            >
              [GRID // SYSTEM 1 PLAYGROUND]
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono text-on-surface-muted pl-2">
            <span>TARGET:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="px-2 py-1 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs font-mono font-bold text-on-surface focus:outline-none"
            >
              <option value="english">convai/laya:english</option>
              <option value="multilingual">convai/laya:multilingual</option>
              <option value="typed-decisions">convai/laya:typed-decisions</option>
            </select>
          </div>
        </div>

        {/* Right: Grid Drag & Size Layout Controls */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-on-surface-muted bg-surface-container-low px-2 py-1 rounded-lg border border-outline-variant/20">
            <span>⠿ DRAGGABLE & SIZEABLE SECTIONS</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => applyPreset("compact")}
              title="Compact 4-column layout"
              className="px-2 py-1 rounded-lg border border-outline-variant/25 text-[10px] font-mono font-bold text-on-surface-muted hover:text-primary hover:bg-surface-container-low transition-colors cursor-pointer"
            >
              [COMPACT]
            </button>
            <button
              onClick={() => applyPreset("widescreen")}
              title="Wide 2-column layout"
              className="px-2 py-1 rounded-lg border border-outline-variant/25 text-[10px] font-mono font-bold text-on-surface-muted hover:text-primary hover:bg-surface-container-low transition-colors cursor-pointer"
            >
              [WIDE]
            </button>
            <button
              onClick={autoAdjustWidths}
              title="Automatically balance and auto-adjust row widths so each row fills 12 columns with zero gaps"
              className="px-2 py-1 rounded-lg border border-primary/30 text-[10px] font-mono font-bold text-primary bg-primary/5 hover:bg-primary/15 transition-colors cursor-pointer"
            >
              [AUTO-ADJUST WIDTHS]
            </button>
            <button
              onClick={resetLayout}
              title="Reset layout to default"
              className="px-2 py-1 rounded-lg border border-outline-variant/25 text-[10px] font-mono font-bold text-on-surface-muted hover:text-primary hover:bg-surface-container-low transition-colors cursor-pointer"
            >
              [RESET GRID]
            </button>
            <ThemeSelector />
            <Link
              href="/settings"
              title="System & Theme Settings"
              className="px-2.5 py-1 rounded-lg border border-outline-variant/30 text-[10px] font-mono font-bold text-on-surface hover:text-primary hover:bg-surface-container-low transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <span>⚙</span>
              <span className="hidden sm:inline">[SETTINGS]</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. DYNAMIC DRAGGABLE & SIZEABLE GRID CONSOLE              */}
      {/* ========================================================= */}
      {activeView === "matrix" && (
        <div className="grid grid-cols-12 gap-4 items-start">
          {boxes.map((box) => (
            <DraggableBox
              key={box.id}
              id={box.id}
              title={box.title}
              badge={box.badge}
              colSpan={box.colSpan}
              height={box.height}
              minimized={box.minimized}
              onUpdateSpan={updateSpan}
              onToggleMinimize={toggleMinimize}
              onUpdateHeight={updateHeight}
              onAutoFitWidth={autoFitSingleBoxWidth}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              isDraggingCurrent={draggedId === box.id}
              isDragOverTarget={dragOverId === box.id && draggedId !== box.id}
              draggedBoxTitle={draggedBox?.title}
              draggedBoxSpan={draggedBox?.colSpan}
            >
              {renderBoxContent(box.id)}
            </DraggableBox>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. BATCH INTAKE GRID                                      */}
      {/* ========================================================= */}
      {activeView === "batch" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6 border border-outline-variant/30 rounded-2xl bg-surface-container-lowest p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
              <span className="text-xs font-mono font-bold text-on-surface uppercase">
                [BOX B1 // BATCH PAYLOAD INGEST]
              </span>
              <button
                onClick={() => {
                  try {
                    const parsed = JSON.parse(batchRawInput);
                    handleBatchTriage(parsed);
                  } catch {
                    alert("Invalid JSON format");
                  }
                }}
                disabled={isPending}
                className="py-1.5 px-4 rounded-xl btn-primary-gradient text-on-primary font-mono text-xs font-bold cursor-pointer"
              >
                {isPending ? "RUNNING BATCH..." : "EXECUTE BATCH INFERENCE"}
              </button>
            </div>
            <textarea
              rows={16}
              value={batchRawInput}
              onChange={(e) => setBatchRawInput(e.target.value)}
              className="w-full p-3 font-mono text-xs rounded-xl bg-surface-container-low border border-outline-variant/25 text-on-surface focus:outline-none"
            />
          </div>

          <div className="lg:col-span-6 border border-outline-variant/30 rounded-2xl bg-surface-container-lowest p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
              <span className="text-xs font-mono font-bold text-on-surface uppercase">
                [BOX B2 // INTAKE STREAM RESULTS] ({batchResult ? batchResult.total : 0})
              </span>
              <span className="text-[10px] font-mono text-primary font-bold">STREAM PROCESSED</span>
            </div>

            {batchResult && batchResult.results.length > 0 ? (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {batchResult.results.map((res: LayaTicketTriageResponse, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-outline-variant/20 bg-surface-container-low flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-on-surface">
                          {res.ticket_id || `TCK-BATCH-${idx + 1}`}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getPriorityStyle(res.priority_level)}`}>
                          {res.priority_level}
                        </span>
                        <span className="font-mono text-[10px] text-on-surface-muted uppercase">
                          [{res.assigned_queue}]
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-muted mt-1 truncate max-w-md">
                        {res.action_recommendation}
                      </p>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-xs font-bold text-primary">{res.urgency_score}</span>
                      <p className="text-[10px] text-rose-600">{res.churn_risk} Churn</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-16 text-center text-xs font-mono text-on-surface-muted border border-dashed border-outline-variant/30 rounded-xl">
                Awaiting batch execution.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. SYSTEM 1 PLAYGROUND GRID                               */}
      {/* ========================================================= */}
      {activeView === "systemone" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 border border-outline-variant/30 rounded-2xl bg-surface-container-lowest p-4 space-y-2 shadow-xs">
            <span className="text-xs font-mono font-bold text-on-surface uppercase">[BOX S1 // STATE JSON]</span>
            <textarea
              rows={12}
              value={sysStateJson}
              onChange={(e) => setSysStateJson(e.target.value)}
              className="w-full p-3 font-mono text-xs rounded-xl bg-surface-container-low border border-outline-variant/25 text-on-surface focus:outline-none"
            />
          </div>

          <div className="lg:col-span-4 border border-outline-variant/30 rounded-2xl bg-surface-container-lowest p-4 space-y-2 shadow-xs">
            <span className="text-xs font-mono font-bold text-on-surface uppercase">[BOX S2 // QUESTIONS JSON]</span>
            <textarea
              rows={12}
              value={sysQuestionsJson}
              onChange={(e) => setSysQuestionsJson(e.target.value)}
              className="w-full p-3 font-mono text-xs rounded-xl bg-surface-container-low border border-outline-variant/25 text-on-surface focus:outline-none"
            />
            <button
              onClick={handleRunSystemOne}
              disabled={isPending}
              className="w-full py-2.5 rounded-xl btn-primary-gradient text-on-primary font-mono text-xs font-bold cursor-pointer"
            >
              EXECUTE SYSTEM 1
            </button>
          </div>

          <div className="lg:col-span-4 border border-outline-variant/30 rounded-2xl bg-surface-container-lowest p-4 space-y-2 shadow-xs">
            <span className="text-xs font-mono font-bold text-on-surface uppercase">[BOX S3 // RAW INFERENCE OUTPUT]</span>
            {systemOneResult ? (
              <pre className="p-3 font-mono text-xs rounded-xl bg-surface-container-low border border-outline-variant/25 text-on-surface max-h-[320px] overflow-auto">
                {JSON.stringify(systemOneResult, null, 2)}
              </pre>
            ) : (
              <div className="p-16 text-center text-xs font-mono text-on-surface-muted border border-dashed border-outline-variant/30 rounded-xl">
                Ready for System 1 execution.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
