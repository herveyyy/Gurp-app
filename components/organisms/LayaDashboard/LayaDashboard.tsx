"use client";

import React, { useState } from "react";
import {
  useLayaDashboard,
  SAMPLE_TEMPLATES,
} from "./layaDashboard.hooks";
import type { LayaTicketTriageResponse } from "@/lib/entities/laya.type";

export function LayaDashboard() {
  const {
    activeTab,
    setActiveTab,
    health,
    modelStatus,
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

  const [showRaw, setShowRaw] = useState(false);
  const [batchRawInput, setBatchRawInput] = useState(
    JSON.stringify(
      SAMPLE_TEMPLATES.slice(0, 3).map((t) => t.data),
      null,
      2
    )
  );

  const isServerLive = health && health.status === "ok";

  const getPriorityColor = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return "bg-rose-500/15 text-rose-700 border-rose-500/30";
      case "HIGH":
        return "bg-amber-500/15 text-amber-700 border-amber-500/30";
      case "MEDIUM":
        return "bg-sky-500/15 text-sky-700 border-sky-500/30";
      default:
        return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30";
    }
  };

  const getQueueBadge = (queue: string) => {
    switch (queue.toLowerCase()) {
      case "infrastructure":
        return { bg: "bg-purple-100 text-purple-800", icon: "⚡" };
      case "billing":
        return { bg: "bg-emerald-100 text-emerald-800", icon: "💳" };
      case "security":
        return { bg: "bg-rose-100 text-rose-800", icon: "🛡️" };
      default:
        return { bg: "bg-blue-100 text-blue-800", icon: "💬" };
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-surface-container-lowest p-6 sm:p-8 ghost-border shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isServerLive ? "bg-emerald-400" : "bg-rose-400"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-3 w-3 ${
                    isServerLive ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                />
              </span>
              <span className="text-xs font-semibold tracking-wider uppercase text-on-surface-muted">
                {isServerLive ? "System 1 Engine Connected" : "Connecting to Laya..."}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-surface-container-low text-primary">
                http://localhost:8000
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-on-surface">
              Tiyakaloud Decision Console
            </h1>
            <p className="text-sm sm:text-base text-on-surface-muted max-w-2xl">
              High-performance non-autoregressive triage, SLA scoring, and dynamic routing
              powered by <strong className="text-primary font-semibold">Laya & ModernBERT</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-surface-container-low p-4 rounded-2xl">
            <div className="text-right pr-3 border-r border-outline-variant/20">
              <p className="text-xs text-on-surface-muted">Device</p>
              <p className="text-sm font-semibold font-mono text-on-surface">
                {health?.device || "CPU"}
              </p>
            </div>
            <div className="text-right pr-3 border-r border-outline-variant/20">
              <p className="text-xs text-on-surface-muted">Loaded Weights</p>
              <p className="text-sm font-semibold font-mono text-primary">
                {health?.loaded_models?.length ?? 0} Models
              </p>
            </div>
            <button
              onClick={refreshHealth}
              disabled={isPending}
              className="p-2 rounded-xl text-primary hover:bg-surface-container-highest transition-colors cursor-pointer"
              title="Refresh Engine Status"
            >
              <svg
                className={`w-5 h-5 ${isPending ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {serverError && (
          <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold">Notice:</span> {serverError}
            </div>
            <button
              onClick={refreshHealth}
              className="underline text-xs hover:text-rose-800 cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Notice Message */}
        {notice && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 text-emerald-800 text-sm">
            {notice}
          </div>
        )}

        {/* Tabs Bar */}
        <div className="mt-8 flex flex-wrap border-b border-outline-variant/20 gap-2 sm:gap-6">
          {[
            { id: "triage", label: "Ticket Triage & Urgency", icon: "🎯" },
            { id: "batch", label: "Batch Intake", icon: "📦" },
            { id: "systemone", label: "System 1 Playground", icon: "🧠" },
            { id: "models", label: "Model Lifecycle & Presets", icon: "⚙️" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`pb-3 px-2 text-sm sm:text-base font-semibold transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-muted hover:text-on-surface"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: Single Ticket Triage */}
      {activeTab === "triage" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form & Presets */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-surface-container-lowest rounded-3xl p-6 ghost-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold font-display text-on-surface">
                  Input Support Ticket
                </h2>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-on-surface-muted font-medium">Model:</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="text-xs rounded-lg px-2.5 py-1 bg-surface-container-low text-on-surface border border-outline-variant/30 focus:outline-none"
                  >
                    <option value="english">english (Standard)</option>
                    <option value="multilingual">multilingual</option>
                    <option value="typed-decisions">typed-decisions</option>
                  </select>
                </div>
              </div>

              {/* Sample Templates Quick-Load */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-on-surface-muted uppercase tracking-wider mb-2">
                  Quick Load Incident Scenarios:
                </p>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setTicketForm(tmpl.data)}
                      className="text-xs px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container-high text-on-surface transition-all cursor-pointer font-medium border border-outline-variant/20 hover:border-primary/40 flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                      {tmpl.badge}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-on-surface-muted mb-1">
                      Ticket ID
                    </label>
                    <input
                      type="text"
                      value={ticketForm.ticket_id || ""}
                      onChange={(e) =>
                        setTicketForm((prev) => ({ ...prev, ticket_id: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm rounded-xl bg-surface-container-low text-on-surface border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-on-surface-muted mb-1">
                      Customer Tier
                    </label>
                    <input
                      type="text"
                      value={ticketForm.customer || ""}
                      onChange={(e) =>
                        setTicketForm((prev) => ({ ...prev, customer: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm rounded-xl bg-surface-container-low text-on-surface border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-on-surface-muted mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={ticketForm.subject}
                    onChange={(e) =>
                      setTicketForm((prev) => ({ ...prev, subject: e.target.value }))
                    }
                    placeholder="Enter issue headline..."
                    className="w-full px-3 py-2 text-sm rounded-xl bg-surface-container-low text-on-surface border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-on-surface-muted mb-1">
                    Body / Customer Statement
                  </label>
                  <textarea
                    rows={5}
                    value={ticketForm.body}
                    onChange={(e) =>
                      setTicketForm((prev) => ({ ...prev, body: e.target.value }))
                    }
                    placeholder="Paste customer report or error log..."
                    className="w-full px-3 py-2 text-sm rounded-xl bg-surface-container-low text-on-surface border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed font-sans"
                  />
                </div>

                {/* Triage Mode Segmented Control */}
                <div className="pt-2">
                  <div className="flex bg-surface-container-low p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setTriageMode("full")}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        triageMode === "full"
                          ? "bg-surface-container-lowest text-primary shadow-sm"
                          : "text-on-surface-muted hover:text-on-surface"
                      }`}
                    >
                      Full Triage & Department Route
                    </button>
                    <button
                      type="button"
                      onClick={() => setTriageMode("urgency_only")}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        triageMode === "urgency_only"
                          ? "bg-surface-container-lowest text-primary shadow-sm"
                          : "text-on-surface-muted hover:text-on-surface"
                      }`}
                    >
                      Fast Urgency & SLA Scan
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTriage}
                  disabled={isPending || !ticketForm.subject || !ticketForm.body}
                  className="w-full py-3.5 px-4 rounded-2xl btn-primary-gradient text-on-primary font-semibold tracking-wide text-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  {isPending ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      <span>Inference in Progress...</span>
                    </>
                  ) : (
                    <>
                      <span>Run Non-Autoregressive Triage</span>
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-mono">
                        Sub-50ms
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Classification Dashboard */}
          <div className="lg:col-span-6 space-y-6">
            {triageResult ? (
              <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 ghost-border shadow-sm space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                  <div>
                    <span className="text-xs text-on-surface-muted uppercase font-mono">
                      Ticket #{triageResult.ticket_id || "TCK-LIVE"}
                    </span>
                    <h3 className="text-2xl font-bold font-display text-on-surface">
                      Classification Results
                    </h3>
                  </div>
                  <div
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold border tracking-wider uppercase ${getPriorityColor(
                      triageResult.priority_level
                    )}`}
                  >
                    {triageResult.priority_level} PRIORITY
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {/* Queue Card */}
                  <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/15">
                    <p className="text-xs font-semibold text-on-surface-muted uppercase">
                      Assigned Queue
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-lg">
                        {getQueueBadge(triageResult.assigned_queue).icon}
                      </span>
                      <span className="text-base font-bold text-on-surface capitalize">
                        {triageResult.assigned_queue}
                      </span>
                    </div>
                  </div>

                  {/* Urgency Score */}
                  <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/15">
                    <p className="text-xs font-semibold text-on-surface-muted uppercase">
                      Urgency Score
                    </p>
                    <p className="mt-1 text-2xl font-black font-display text-primary">
                      {triageResult.urgency_score}
                      <span className="text-xs text-on-surface-muted font-normal ml-1">/ 3.0</span>
                    </p>
                  </div>

                  {/* Churn Risk */}
                  <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/15 col-span-2 sm:col-span-1">
                    <p className="text-xs font-semibold text-on-surface-muted uppercase">
                      Churn Probability
                    </p>
                    <p
                      className={`mt-1 text-2xl font-black font-display ${
                        triageResult.churn_risk_score > 0.5
                          ? "text-rose-600"
                          : "text-on-surface"
                      }`}
                    >
                      {triageResult.churn_risk}
                    </p>
                  </div>
                </div>

                {/* Sentiment & Routing Decision */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/15 text-sm">
                  <div>
                    <span className="text-xs text-on-surface-muted font-medium">Customer Sentiment: </span>
                    <span className="font-semibold capitalize text-on-surface">
                      {triageResult.sentiment}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-on-surface-muted font-medium">Inference Engine: </span>
                    <span className="font-mono text-xs font-semibold text-primary">
                      {triageResult.routing_decision}
                    </span>
                  </div>
                </div>

                {/* Action Recommendation */}
                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 space-y-1.5">
                  <p className="text-xs font-bold text-primary uppercase tracking-wider">
                    Automated Next Action Recommendation
                  </p>
                  <p className="text-sm font-medium text-on-surface leading-relaxed">
                    {triageResult.action_recommendation}
                  </p>
                </div>

                {/* Collapsible Raw Decision Inspection */}
                <div>
                  <button
                    onClick={() => setShowRaw(!showRaw)}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>{showRaw ? "Hide" : "Inspect"} ModernBERT Decision Tree</span>
                    <span>{showRaw ? "▲" : "▼"}</span>
                  </button>
                  {showRaw && triageResult.raw && (
                    <pre className="mt-3 p-4 rounded-2xl bg-surface-container-high text-xs font-mono text-on-surface overflow-x-auto max-h-72">
                      {JSON.stringify(triageResult.raw, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ) : urgencyResult ? (
              <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 ghost-border shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                  <h3 className="text-xl font-bold font-display text-on-surface">
                    Rapid SLA Scan
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(
                      urgencyResult.priority_level
                    )}`}
                  >
                    {urgencyResult.priority_level}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-surface-container-low">
                    <p className="text-xs text-on-surface-muted">Urgency Score</p>
                    <p className="text-2xl font-bold text-primary">{urgencyResult.urgency_score}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-surface-container-low">
                    <p className="text-xs text-on-surface-muted">SLA Breach Risk</p>
                    <p className="text-base font-bold text-rose-600 font-mono mt-1">
                      {urgencyResult.sla_risk}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-surface-container-lowest rounded-3xl p-12 ghost-border shadow-sm text-center flex flex-col items-center justify-center min-h-[380px]">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl mb-4">
                  ⚡
                </div>
                <h3 className="text-lg font-bold font-display text-on-surface mb-1">
                  Ready for Inferences
                </h3>
                <p className="text-sm text-on-surface-muted max-w-sm">
                  Select a sample ticket scenario on the left or type your own subject and body to run
                  sub-50ms triage.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Batch Intake */}
      {activeTab === "batch" && (
        <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 ghost-border shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold font-display text-on-surface">
                High-Throughput Batch Intake
              </h2>
              <p className="text-sm text-on-surface-muted">
                Triage dozens or hundreds of tickets concurrently using ModernBERT batch execution.
              </p>
            </div>
            <button
              onClick={() => {
                try {
                  const parsed = JSON.parse(batchRawInput);
                  handleBatchTriage(parsed);
                } catch {
                  alert("Invalid JSON format in batch input");
                }
              }}
              disabled={isPending}
              className="py-2.5 px-6 rounded-xl btn-primary-gradient text-on-primary font-semibold text-sm cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isPending ? "Triaging Batch..." : "Execute Batch Triage"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <label className="block text-xs font-semibold uppercase text-on-surface-muted mb-2">
                Batch JSON Array:
              </label>
              <textarea
                rows={14}
                value={batchRawInput}
                onChange={(e) => setBatchRawInput(e.target.value)}
                className="w-full p-3 font-mono text-xs rounded-2xl bg-surface-container-low text-on-surface border border-outline-variant/30 focus:outline-none"
              />
            </div>

            <div className="lg:col-span-7">
              <label className="block text-xs font-semibold uppercase text-on-surface-muted mb-2">
                Batch Results ({batchResult ? batchResult.total : 0} Processed):
              </label>
              {batchResult && batchResult.results.length > 0 ? (
                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                  {batchResult.results.map((res: LayaTicketTriageResponse, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-on-surface">
                            {res.ticket_id || `Ticket-${idx + 1}`}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getPriorityColor(
                              res.priority_level
                            )}`}
                          >
                            {res.priority_level}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-muted mt-1">
                          Queue: <strong className="text-on-surface capitalize">{res.assigned_queue}</strong> · Churn:{" "}
                          <strong className="text-rose-600">{res.churn_risk}</strong>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-primary">
                          Score {res.urgency_score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-sm text-on-surface-muted bg-surface-container-low rounded-2xl flex items-center justify-center min-h-[280px]">
                  Click "Execute Batch Triage" to process the tickets on the left.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: System 1 Playground */}
      {activeTab === "systemone" && (
        <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 ghost-border shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold font-display text-on-surface">
                Raw System 1 Protocol Playground
              </h2>
              <p className="text-sm text-on-surface-muted">
                Execute non-autoregressive decision questions (<code className="font-mono text-primary font-bold">choice</code>, <code className="font-mono text-primary font-bold">score</code>, <code className="font-mono text-primary font-bold">noul</code>) against arbitrary state schemas.
              </p>
            </div>
            <button
              onClick={handleRunSystemOne}
              disabled={isPending}
              className="py-2.5 px-6 rounded-xl btn-primary-gradient text-on-primary font-semibold text-sm cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isPending ? "Executing..." : "Run System 1"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-on-surface-muted uppercase mb-1">
                State Payload (JSON)
              </label>
              <textarea
                rows={10}
                value={sysStateJson}
                onChange={(e) => setSysStateJson(e.target.value)}
                className="w-full p-3 font-mono text-xs rounded-2xl bg-surface-container-low text-on-surface border border-outline-variant/30 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-muted uppercase mb-1">
                Questions Definition (JSON)
              </label>
              <textarea
                rows={10}
                value={sysQuestionsJson}
                onChange={(e) => setSysQuestionsJson(e.target.value)}
                className="w-full p-3 font-mono text-xs rounded-2xl bg-surface-container-low text-on-surface border border-outline-variant/30 focus:outline-none"
              />
            </div>
          </div>

          {systemOneResult && (
            <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-3">
              <h4 className="text-sm font-bold font-display text-on-surface">
                System 1 Decision Output:
              </h4>
              <pre className="text-xs font-mono text-on-surface overflow-x-auto p-4 bg-surface-container-lowest rounded-xl max-h-80">
                {JSON.stringify(systemOneResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Model Lifecycle & Presets */}
      {activeTab === "models" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-surface-container-lowest rounded-3xl p-6 ghost-border shadow-sm space-y-4">
            <h3 className="text-xl font-bold font-display text-on-surface">
              ModernBERT Memory & Weights
            </h3>
            <p className="text-xs text-on-surface-muted">
              Dynamically warm up models or evict weights from RAM to optimize resource allocation.
            </p>

            <div className="space-y-3 mt-4">
              {["english", "multilingual", "typed-decisions"].map((name) => {
                const isLoaded = health?.loaded_models?.includes(name);
                return (
                  <div
                    key={name}
                    className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/15 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-bold font-mono text-on-surface">{name}</p>
                      <p className="text-xs text-on-surface-muted">
                        Status:{" "}
                        <span className={isLoaded ? "text-emerald-600 font-semibold" : "text-amber-600 font-medium"}>
                          {isLoaded ? "Active in Memory (Warm)" : "Idle (Lazy load)"}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isLoaded ? (
                        <button
                          onClick={() => handleUnloadModel(name)}
                          disabled={isPending}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Unload
                        </button>
                      ) : (
                        <button
                          onClick={() => handleLoadModel(name)}
                          disabled={isPending}
                          className="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Warm Up
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                onClick={() => handleUnloadModel()}
                disabled={isPending}
                className="w-full py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-semibold cursor-pointer transition-colors"
              >
                Evict All Models (Free RAM)
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 bg-surface-container-lowest rounded-3xl p-6 ghost-border shadow-sm space-y-4">
            <h3 className="text-xl font-bold font-display text-on-surface">
              Question Presets
            </h3>
            <p className="text-xs text-on-surface-muted">
              Built-in domain criteria and custom question registries.
            </p>

            <div className="space-y-2 mt-4">
              {presets?.built_in_presets &&
                Object.entries(presets.built_in_presets).map(([k, questions]) => (
                  <div
                    key={k}
                    className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/15 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono text-xs font-bold text-primary uppercase">
                        {k}
                      </span>
                      <p className="text-[11px] text-on-surface-muted mt-0.5">
                        Keys: {questions.join(", ")}
                      </p>
                    </div>
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                      Built-in
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
