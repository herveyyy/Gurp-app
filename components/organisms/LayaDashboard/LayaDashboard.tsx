"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ThemeSelector } from "@/components/molecules/ThemeSelector/ThemeSelector";
import { signOutAction } from "@/lib/domain/actions/auth.actions";
import type { LayaTicketTriageResponse } from "@/lib/entities/laya.type";
import {
  FiActivity,
  FiArrowLeft,
  FiCheckCircle,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiCpu,
  FiCreditCard,
  FiLayers,
  FiLayout,
  FiMessageSquare,
  FiRefreshCw,
  FiSettings,
  FiShield,
  FiSidebar,
  FiZap,
} from "react-icons/fi";
import { DraggableBox } from "./DraggableBox";
import { SAMPLE_TEMPLATES, useLayaDashboard } from "./layaDashboard.hooks";
import { useGridLayout } from "./useGridLayout";
import { VSCodeAgenticPlayground } from "./VSCodeAgenticPlayground";

export interface LayaDashboardProps {
  onExitConsole?: () => void;
  session?: unknown;
}

export function LayaDashboard({ onExitConsole, session }: LayaDashboardProps = {}) {
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
    isPending,
    notice,
    refreshHealth,
    handleTriage,
    handleBatchTriage,
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

  // View state & Sidebar hideability toggles
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [showRaw, setShowRaw] = useState(false);
  const [activeView, setActiveView] = useState<"systemone" | "matrix" | "batch">("systemone");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  // Close model dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    }
    if (isModelDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isModelDropdownOpen]);

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
          <div className="grid grid-cols-1 gap-2 h-full content-start">
            {SAMPLE_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.data.ticket_id}
                type="button"
                onClick={() => setTicketForm(tmpl.data)}
                className="trigger-card p-2.5 rounded-xl border border-outline-variant/20 bg-surface-container-low hover:bg-surface-container-high transition-all text-left cursor-pointer group min-w-0"
              >
                <div className="flex items-center justify-between mb-1 gap-1">
                  <span className="text-[10px] font-mono font-bold text-secondary uppercase truncate">
                    {tmpl.badge}
                  </span>
                  <span className="text-[9px] font-mono text-on-surface-muted shrink-0">#{tmpl.data.ticket_id}</span>
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
          <div className="@container space-y-3.5 flex flex-col h-full justify-between min-w-0">
            <div className="space-y-3 min-w-0">
              <div className="grid grid-cols-1 @[220px]:grid-cols-2 gap-3 min-w-0">
                <div className="min-w-0">
                  <label
                    htmlFor="laya-ticket-id"
                    className="block text-[10px] font-mono text-on-surface-muted uppercase mb-1"
                  >
                    Ticket Ref ID
                  </label>
                  <input
                    id="laya-ticket-id"
                    type="text"
                    value={ticketForm.ticket_id}
                    onChange={(e) => setTicketForm({ ...ticketForm, ticket_id: e.target.value })}
                    className="w-full min-w-0 px-3 py-1.5 font-mono text-xs rounded-xl bg-surface-container-low border border-outline-variant/25 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="min-w-0">
                  <label
                    htmlFor="laya-account-tier"
                    className="block text-[10px] font-mono text-on-surface-muted uppercase mb-1"
                  >
                    Account Tier
                  </label>
                  <input
                    id="laya-account-tier"
                    type="text"
                    value={ticketForm.customer || ""}
                    onChange={(e) => setTicketForm({ ...ticketForm, customer: e.target.value })}
                    className="w-full min-w-0 px-3 py-1.5 font-mono text-xs rounded-xl bg-surface-container-low border border-outline-variant/25 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="laya-incident-subject"
                  className="block text-[10px] font-mono text-on-surface-muted uppercase mb-1"
                >
                  Incident Subject Line
                </label>
                <input
                  id="laya-incident-subject"
                  type="text"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  className="w-full min-w-0 px-3 py-1.5 font-mono text-xs rounded-xl bg-surface-container-low border border-outline-variant/25 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="laya-issue-body"
                  className="block text-[10px] font-mono text-on-surface-muted uppercase mb-1"
                >
                  Full Issue Statement / Log
                </label>
                <textarea
                  id="laya-issue-body"
                  rows={4}
                  value={ticketForm.body}
                  onChange={(e) => setTicketForm({ ...ticketForm, body: e.target.value })}
                  className="w-full min-w-0 p-2.5 font-mono text-xs rounded-xl bg-surface-container-low border border-outline-variant/25 text-on-surface focus:outline-none focus:border-primary resize-none break-words whitespace-pre-wrap"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 min-w-0">
              <div className="flex flex-col @[220px]:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => setTriageMode("full")}
                  className={`trigger-chip flex-1 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                    triageMode === "full"
                      ? "border-primary bg-primary/10 text-primary shadow-xs"
                      : "border-outline-variant/20 hover:bg-surface-container-low text-on-surface-muted"
                  }`}
                >
                  FULL CLASSIFICATION
                </button>
                <button
                  type="button"
                  onClick={() => setTriageMode("urgency_only")}
                  className={`trigger-chip flex-1 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                    triageMode === "urgency_only"
                      ? "border-primary bg-primary/10 text-primary shadow-xs"
                      : "border-outline-variant/20 hover:bg-surface-container-low text-on-surface-muted"
                  }`}
                >
                  RAPID SLA SCAN
                </button>
              </div>

              <button
                type="button"
                onClick={handleTriage}
                disabled={isPending}
                className="trigger-btn w-full py-2.5 rounded-xl btn-primary-gradient text-on-primary font-mono text-xs font-bold tracking-wide uppercase cursor-pointer shadow-xs disabled:opacity-50 text-center leading-snug"
              >
                {isPending ? "INFERRING TENSORS..." : "DISPATCH SYSTEM 1 TRIAGE (SUB-50MS)"}
              </button>
            </div>
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
          <div className="p-6 sm:p-8 text-center border border-dashed border-outline-variant/30 rounded-xl flex flex-col items-center justify-center h-full min-h-[200px] min-w-0">
            <FiCpu className="w-8 h-8 mb-2 text-primary/70 animate-pulse shrink-0" />
            <p className="text-xs font-mono font-bold text-on-surface uppercase">Awaiting Triage Input</p>
            <p className="text-[11px] text-on-surface-muted max-w-xs mt-1 break-words">
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
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => (isLoaded ? handleUnloadModel(name) : handleLoadModel(name))}
                      className={`trigger-chip text-[10px] px-2.5 py-1 rounded-lg border font-mono font-bold cursor-pointer transition-colors ${
                        isLoaded
                          ? "border-rose-500/30 text-rose-700 bg-rose-500/10 hover:bg-rose-500/20"
                          : "border-primary/30 text-primary bg-primary/10 hover:bg-primary/20"
                      }`}
                    >
                      {isLoaded ? "EVICT" : "WARM UP"}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="p-2.5 rounded-xl border border-outline-variant/20 bg-surface-container-low text-[10px] font-mono text-on-surface-muted">
              FastCPU RAM Cache: 248MB &bull; Non-Autoregressive
            </div>
          </div>
        );

      case "box_criteria":
        return (
          <div className="space-y-2 overflow-y-auto max-h-[300px]">
            {presets &&
              Object.entries(presets).map(([k, questions]) => (
                <div
                  key={k}
                  className="p-2 rounded-lg border border-outline-variant/15 bg-surface-container-low text-xs"
                >
                  <span className="font-mono font-bold text-primary uppercase text-[10px]">{k}</span>
                  <p className="text-[10px] font-mono text-on-surface-muted truncate mt-0.5">
                    {Array.isArray(questions)
                      ? questions.join(", ")
                      : typeof questions === "object" && questions !== null
                        ? Object.keys(questions).join(", ")
                        : String(questions ?? "")}
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
                type="button"
                onClick={() => setShowRaw(!showRaw)}
                className="trigger-chip text-xs font-mono font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>{showRaw ? "COLLAPSE TREE" : "EXPAND TREE"}</span>
                <FiChevronDown className={`w-3.5 h-3.5 chevron-spin ${showRaw ? "rotated" : ""}`} />
              </button>
            </div>
            <div className={`box-accordion ${showRaw ? "" : "collapsed"}`}>
              <div className="box-accordion-inner">
                <pre className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 text-xs font-mono text-on-surface overflow-x-auto max-h-72 mt-1">
                  {JSON.stringify(triageResult.raw, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs font-mono text-on-surface-muted">No raw vector telemetry recorded yet.</p>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-surface font-sans text-on-surface overflow-hidden">
      {/* ========================================================= */}
      {/* 1. COMPACT TOP UNIFIED WORKBENCH HEADER                   */}
      {/* ========================================================= */}
      <header className="relative z-50 h-14 border-b border-outline-variant/20 bg-surface-container-lowest/95 backdrop-blur-md px-4 flex items-center justify-between gap-3 shrink-0 select-none overflow-visible">
        {/* Left: Sidebar Toggle & View Switcher */}
        <div className="flex items-center gap-2">
          {onExitConsole && (
            <button
              type="button"
              onClick={onExitConsole}
              className="trigger-chip px-2.5 py-1.5 rounded-xl border border-primary/30 text-xs font-mono font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Return to Customer View"
            >
              <FiArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Customer View</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowLeftSidebar(!showLeftSidebar)}
            className={`trigger-btn px-2.5 py-1.5 rounded-xl border text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
              showLeftSidebar
                ? "border-primary/40 bg-primary/10 text-primary font-bold shadow-xs"
                : "border-outline-variant/30 text-on-surface-muted hover:text-on-surface hover:bg-surface-container-low"
            }`}
            title="Toggle Left Navigation & Controls Sidebar"
          >
            <FiSidebar className="w-4 h-4" />
            <span className="hidden sm:inline text-[11px]">[NAV]</span>
          </button>

          {/* View Switcher Quick Pills */}
          <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/20 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => setActiveView("systemone")}
              className={`trigger-btn px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === "systemone"
                  ? "bg-surface-container-lowest text-primary shadow-xs border border-outline-variant/30"
                  : "text-on-surface-muted hover:text-on-surface"
              }`}
            >
              <FiCpu className="w-3.5 h-3.5 text-primary" />
              <span>{`SYS 1 // AGENTIC IDE`}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView("matrix")}
              className={`trigger-btn px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === "matrix"
                  ? "bg-surface-container-lowest text-primary shadow-xs border border-outline-variant/30"
                  : "text-on-surface-muted hover:text-on-surface"
              }`}
            >
              <FiLayout className="w-3.5 h-3.5" />
              <span>MODULAR GRID</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView("batch")}
              className={`trigger-btn px-3 py-1 rounded-lg font-bold transition-all cursor-pointer hidden md:flex items-center gap-1.5 ${
                activeView === "batch"
                  ? "bg-surface-container-lowest text-primary shadow-xs border border-outline-variant/30"
                  : "text-on-surface-muted hover:text-on-surface"
              }`}
            >
              <FiLayers className="w-3.5 h-3.5" />
              <span>BATCH STREAM</span>
            </button>
          </div>
        </div>

        {/* Center: Model Target Quick Selector with Animated Dropdown */}
        <div ref={modelDropdownRef} className="hidden lg:flex items-center gap-2 text-xs font-mono text-on-surface-muted relative z-[100]">
          <span className="text-[10px] font-bold uppercase">Target Model:</span>
          <button
            type="button"
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className="trigger-chip flex items-center gap-2 px-3 py-1 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs font-mono font-bold text-on-surface hover:bg-surface-container-high transition-all shadow-xs cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>{selectedModel}</span>
            <FiChevronDown className={`w-3.5 h-3.5 text-on-surface-muted chevron-spin ${isModelDropdownOpen ? "rotated" : ""}`} />
          </button>

          {isModelDropdownOpen && (
            <div className="dropdown-animated absolute top-full left-0 mt-1.5 w-72 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-2xl z-[100] p-2 space-y-1">
              {[
                { id: "english", label: "convai/laya:english", desc: "110M params • FastCPU optimized", badge: "DEFAULT" },
                { id: "multilingual", label: "convai/laya:multilingual", desc: "100+ languages supported", badge: "GLOBAL" },
                { id: "typed-decisions", label: "convai/laya:typed-decisions", desc: "Multi-head typed classification", badge: "CALIBRATED" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setSelectedModel(m.id);
                    setIsModelDropdownOpen(false);
                  }}
                  className={`trigger-chip w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedModel === m.id
                      ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                      : "border-outline-variant/15 text-on-surface hover:bg-surface-container-low"
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <p className="text-[11px] truncate">{m.label}</p>
                    <p className="text-[9px] text-on-surface-muted truncate">{m.desc}</p>
                  </div>
                  <span className="text-[8px] font-mono px-1 py-0.5 rounded border border-outline-variant/30 text-on-surface-muted shrink-0">
                    {m.badge}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Right Sidebar Toggle & Actions */}
        <div className="flex items-center gap-2">
          {/* Telemetry Status indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-[10px] font-mono text-emerald-800 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>&lt;50ms FastCPU</span>
          </div>

          <button
            type="button"
            onClick={() => setShowRightSidebar(!showRightSidebar)}
            className={`trigger-btn px-2.5 py-1.5 rounded-xl border text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
              showRightSidebar
                ? "border-primary/40 bg-primary/10 text-primary font-bold shadow-xs"
                : "border-outline-variant/30 text-on-surface-muted hover:text-on-surface hover:bg-surface-container-low"
            }`}
            title="Toggle Right Telemetry & Decision Sidebar"
          >
            <FiActivity className="w-4 h-4" />
            <span className="hidden sm:inline text-[11px]">[TELEMETRY]</span>
          </button>

          <ThemeSelector />

          <Link
            href="/settings"
            className="trigger-btn p-2 rounded-xl border border-outline-variant/30 hover:bg-surface-container-low text-on-surface transition-colors cursor-pointer"
            title="System Settings"
          >
            <FiSettings className="w-4 h-4" />
          </Link>

          {Boolean(session) && (
            <form action={signOutAction}>
              <button
                type="submit"
                className="trigger-btn text-xs px-2.5 py-1.5 rounded-xl border border-outline-variant/30 bg-surface-container-low hover:bg-surface-container-high text-on-surface font-mono transition-colors cursor-pointer"
                title="Sign out of Gurp"
              >
                Sign out
              </button>
            </form>
          )}
        </div>
      </header>

      {/* Global Alerts / Notices */}
      {serverError && (
        <div className="mx-4 mt-3 p-3 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-800 text-xs font-mono flex items-center justify-between">
          <span>[ALERT] {serverError}</span>
          <button type="button" onClick={refreshHealth} className="underline font-bold cursor-pointer">
            RECONNECT
          </button>
        </div>
      )}
      {notice && (
        <div className="mx-4 mt-3 p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-800 text-xs font-mono">
          [STATUS] {notice}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. MAIN 3-PANEL BODY (Left Sidebar - Center - Right Sidebar)*/}
      {/* ========================================================= */}
      <div className="relative z-0 flex-1 flex overflow-hidden">
        {/* 2A. LEFT WORKBENCH SIDEBAR */}
        <aside
          className={`sidebar-panel flex flex-col shrink-0 select-none bg-surface-container-lowest border-outline-variant/20 overflow-hidden ${
            showLeftSidebar
              ? "w-64 max-w-64 opacity-100 translate-x-0 border-r"
              : "w-0 max-w-0 opacity-0 -translate-x-12 border-r-0 pointer-events-none"
          }`}
        >
          <div className="w-64 flex flex-col h-full overflow-hidden">
            {/* Sidebar Title */}
            <div className="p-3 border-b border-outline-variant/15 flex items-center justify-between text-[11px] font-mono font-bold text-on-surface-muted uppercase shrink-0">
              <div className="flex items-center gap-1.5">
                <FiSidebar className="w-3.5 h-3.5 text-primary" />
                <span>WORKBENCH CONTROLS</span>
              </div>
              <button
                type="button"
                onClick={() => setShowLeftSidebar(false)}
                className="trigger-btn text-on-surface-muted hover:text-on-surface p-1 rounded hover:bg-surface-container-low cursor-pointer"
                title="Collapse sidebar"
              >
                <FiChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3 space-y-4 overflow-y-auto flex-1 font-mono text-xs">
              {/* Grid Layout Controls (When on Grid mode) */}
              {activeView === "matrix" && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-on-surface-muted uppercase block">
                    FLUID GRID ENGINE
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => applyPreset("compact")}
                      className="trigger-chip px-2 py-1.5 rounded-lg border border-outline-variant/25 text-on-surface-muted hover:text-primary hover:bg-surface-container-low transition-colors cursor-pointer text-center font-bold"
                    >
                      [COMPACT]
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset("widescreen")}
                      className="trigger-chip px-2 py-1.5 rounded-lg border border-outline-variant/25 text-on-surface-muted hover:text-primary hover:bg-surface-container-low transition-colors cursor-pointer text-center font-bold"
                    >
                      [WIDE]
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={autoAdjustWidths}
                    className="trigger-btn w-full py-1.5 rounded-lg border border-primary/30 text-primary bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer text-center font-bold text-[10px]"
                  >
                    [AUTO-ADJUST 12-COLS]
                  </button>
                  <button
                    type="button"
                    onClick={resetLayout}
                    className="trigger-btn w-full py-1.5 rounded-lg border border-outline-variant/25 text-on-surface-muted hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer text-center font-bold text-[10px]"
                  >
                    [RESET TO DEFAULT]
                  </button>
                </div>
              )}

              {/* 1-Click Scenario Preset Dial */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-on-surface-muted uppercase block">
                  1-CLICK INCIDENT DIALS
                </span>
                <div className="space-y-1.5">
                  {SAMPLE_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.data.ticket_id}
                      type="button"
                      onClick={() => setTicketForm(tmpl.data)}
                      className="trigger-card w-full p-2 rounded-xl border border-outline-variant/20 bg-surface-container-low hover:bg-surface-container-high transition-all text-left cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-secondary uppercase">
                          {tmpl.badge}
                        </span>
                        <span className="text-[9px] text-on-surface-muted">#{tmpl.data.ticket_id}</span>
                      </div>
                      <p className="text-[11px] font-bold text-on-surface truncate group-hover:text-primary transition-colors mt-0.5">
                        {tmpl.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Model Weights Lifecycle */}
              <div className="space-y-2 pt-2 border-t border-outline-variant/15">
                <span className="text-[10px] font-bold text-on-surface-muted uppercase block">
                  WEIGHT CHECKPOINTS
                </span>
                <div className="space-y-1 text-[11px]">
                  {["english", "multilingual", "typed-decisions"].map((name) => {
                    const isLoaded = health?.loaded_models?.includes(name);
                    return (
                      <div
                        key={name}
                        className="p-1.5 rounded-lg border border-outline-variant/15 bg-surface-container-low flex items-center justify-between"
                      >
                        <span className="truncate max-w-[110px]">{name}</span>
                        <button
                          type="button"
                          onClick={() => (isLoaded ? handleUnloadModel(name) : handleLoadModel(name))}
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold cursor-pointer ${
                            isLoaded ? "bg-rose-500/10 text-rose-700" : "bg-primary/10 text-primary"
                          }`}
                        >
                          {isLoaded ? "EVICT" : "WARM"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* 2B. CENTER MAIN WORKSPACE */}
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 transition-all duration-200">
          {activeView === "systemone" && (
            <VSCodeAgenticPlayground onSwitchToGrid={() => setActiveView("matrix")} />
          )}

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

          {activeView === "batch" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-6 border border-outline-variant/30 rounded-2xl bg-surface-container-lowest p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                  <span className="text-xs font-mono font-bold text-on-surface uppercase">
                    {`[BOX B1 // BATCH PAYLOAD INGEST]`}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        const parsed = JSON.parse(batchRawInput);
                        handleBatchTriage(parsed);
                      } catch {
                        alert("Invalid JSON format");
                      }
                    }}
                    disabled={isPending}
                    className="trigger-btn py-1.5 px-4 rounded-xl btn-primary-gradient text-on-primary font-mono text-xs font-bold cursor-pointer"
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
                    {`[BOX B2 // INTAKE STREAM RESULTS] (${batchResult ? batchResult.total : 0})`}
                  </span>
                  <span className="text-[10px] font-mono text-primary font-bold">STREAM PROCESSED</span>
                </div>

                {batchResult && batchResult.results.length > 0 ? (
                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {batchResult.results.map((res: LayaTicketTriageResponse, idx: number) => (
                      <div
                        key={res.ticket_id || `TCK-BATCH-${idx + 1}`}
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
        </main>

        {/* 2C. RIGHT TELEMETRY & DECISION SIDEBAR */}
        <aside
          className={`sidebar-panel flex flex-col shrink-0 select-none bg-surface-container-lowest border-outline-variant/20 overflow-hidden ${
            showRightSidebar
              ? "w-72 max-w-72 opacity-100 translate-x-0 border-l"
              : "w-0 max-w-0 opacity-0 translate-x-12 border-l-0 pointer-events-none"
          }`}
        >
          <div className="w-72 flex flex-col h-full overflow-y-auto p-4 space-y-4 font-mono text-xs">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-outline-variant/15 pb-2 text-[11px] font-bold text-on-surface-muted uppercase">
              <div className="flex items-center gap-1.5">
                <FiActivity className="w-3.5 h-3.5 text-primary" />
                <span>ENGINE TELEMETRY</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={refreshHealth}
                  disabled={isPending}
                  className="trigger-btn p-1 rounded hover:bg-surface-container-low text-primary cursor-pointer transition-colors"
                  title="Refresh Engine Heartbeat"
                >
                  <FiRefreshCw className={`w-3.5 h-3.5 ${isPending ? "animate-spin" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowRightSidebar(false)}
                  className="trigger-btn text-on-surface-muted hover:text-on-surface p-1 rounded hover:bg-surface-container-low cursor-pointer"
                  title="Collapse sidebar"
                >
                  <FiChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Engine Status Block */}
            <div className="p-3 rounded-2xl border border-outline-variant/20 bg-surface-container-low space-y-2">
              <div className="flex items-center justify-between text-[10px] text-on-surface-muted uppercase font-bold">
                <span>SYSTEM STATUS</span>
                <span className={`w-2 h-2 rounded-full ${isServerLive ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
              </div>
              <p className="font-bold text-sm text-on-surface">
                {isServerLive ? "ONLINE (ModernBERT)" : "CONNECTING..."}
              </p>
              <div className="text-[10px] text-on-surface-muted space-y-0.5 border-t border-outline-variant/15 pt-1.5">
                <p>PORT: <strong className="text-primary">127.0.0.1:8000</strong></p>
                <p>DEVICE: <strong className="text-on-surface uppercase">{health?.device || "AUTO (CPU)"}</strong></p>
                <p>MODELS: <strong className="text-secondary">{health?.loaded_models?.length ?? 0} Active</strong></p>
                <p>LATENCY SLA: <strong className="text-emerald-700">&lt; 50ms Non-Auto</strong></p>
              </div>
            </div>

            {/* Operator Session Info */}
            <div className="p-3 rounded-2xl border border-outline-variant/20 bg-surface-container-low space-y-1 text-[10px]">
              <span className="text-on-surface-muted uppercase font-bold block">OPERATOR</span>
              <p className="font-bold text-on-surface text-xs">Capt. Hervey</p>
              <p className="text-emerald-700 font-semibold flex items-center gap-1">
                <FiCheckCircle className="w-3 h-3" />
                <span>Authenticated Session</span>
              </p>
            </div>

            {/* Live Decision Telemetry (if triage result exists) */}
            {triageResult && (
              <div className="p-3 rounded-2xl border border-primary/30 bg-primary/5 space-y-2.5">
                <div className="flex items-center justify-between border-b border-primary/20 pb-1 text-[10px] font-bold text-primary uppercase">
                  <span>LAST INFERENCE OUTPUT</span>
                  <span>SUB-50MS</span>
                </div>
                <div>
                  <span className="text-[9px] text-on-surface-muted uppercase">ASSIGNED QUEUE</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-bold text-on-surface">{triageResult.assigned_queue}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded border border-primary/30 bg-primary/10 text-primary font-bold">
                      {getQueueInfo(triageResult.assigned_queue).code}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className="p-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
                    <span className="text-on-surface-muted block text-[9px]">URGENCY</span>
                    <strong className="text-primary">{triageResult.urgency_score} / 3.0</strong>
                  </div>
                  <div className="p-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
                    <span className="text-on-surface-muted block text-[9px]">PRIORITY</span>
                    <strong className="text-rose-600">{triageResult.priority_level}</strong>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20 text-[10px]">
                  <span className="text-on-surface-muted uppercase text-[9px] block">DIRECTIVE</span>
                  <p className="text-on-surface mt-0.5 leading-relaxed text-[11px] truncate">
                    {triageResult.action_recommendation}
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
