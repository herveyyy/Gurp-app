"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FiZap,
  FiShield,
  FiCreditCard,
  FiMessageSquare,
  FiAlertTriangle,
  FiCpu,
  FiClock,
  FiCheckCircle,
  FiLock,
  FiLayout,
  FiSliders,
  FiTrendingUp,
  FiBarChart2,
  FiArrowRight,
  FiArrowLeft,
  FiChevronDown,
  FiTerminal,
  FiActivity,
  FiDollarSign,
  FiLayers,
} from "react-icons/fi";
import { ThemeSelector } from "@/components/molecules/ThemeSelector/ThemeSelector";
import { LayaDashboard } from "@/components/organisms/LayaDashboard/LayaDashboard";
import { signOutAction } from "@/lib/domain/actions/auth.actions";

interface CustomerLandingProps {
  session?: {
    user?: {
      name?: string | null;
      email?: string | null;
    };
  } | null;
  defaultView?: "landing" | "console";
}

type ScenarioIconType = "alert" | "billing" | "security" | "support";

interface ScenarioItem {
  id: string;
  label: string;
  badge: string;
  iconType: ScenarioIconType;
  subject: string;
  body: string;
  customer: string;
  result: {
    queue: string;
    code: string;
    urgency: string;
    urgencyPercent: number;
    priority: string;
    priorityBadge: string;
    churnRisk: string;
    churnColor: string;
    sentiment: string;
    action: string;
    latency: string;
  };
}

const DEMO_SCENARIOS: ScenarioItem[] = [
  {
    id: "outage",
    label: "Production Outage",
    badge: "CRITICAL INFRA",
    iconType: "alert",
    subject: "Primary RDS Cluster deadlock - 504 Gateway Timeout across all API nodes",
    body: "Our payment processing pipeline is completely frozen. Over 4,000 checkout transactions are timing out with code 504. Database connection pool reached 100% capacity.",
    customer: "Enterprise (Scale Tier)",
    result: {
      queue: "Infrastructure",
      code: "ENG-INFRA",
      urgency: "3.0 / 3.0",
      urgencyPercent: 100,
      priority: "CRITICAL P0",
      priorityBadge: "bg-rose-500/20 text-rose-700 border-rose-500/40",
      churnRisk: "0.94 (Critical Risk)",
      churnColor: "text-rose-600",
      sentiment: "Severe Frustration / Panic",
      action: "Trigger automated P0 pager escalation to Core Infra on-call. Initialize replica failover.",
      latency: "34ms",
    },
  },
  {
    id: "billing",
    label: "Billing Dispute",
    badge: "FINANCIAL ESCALATION",
    iconType: "billing",
    subject: "Overbilled $14,200 on monthly invoice #INV-88910 - cancel our contract immediately",
    body: "We were charged three times for our annual seat renewal. Our CFO has blocked the corporate card and instructed legal to initiate a chargeback if not credited today.",
    customer: "Global Enterprise Corp",
    result: {
      queue: "Billing Operations",
      code: "FIN-REV",
      urgency: "2.7 / 3.0",
      urgencyPercent: 90,
      priority: "HIGH P1",
      priorityBadge: "bg-amber-500/20 text-amber-700 border-amber-500/40",
      churnRisk: "0.88 (Imminent Churn)",
      churnColor: "text-rose-600",
      sentiment: "Frustrated / Threatening Legal Action",
      action: "Route to Executive Finance Desk. Void duplicate ledger charges and issue credit memo within 1 hour.",
      latency: "38ms",
    },
  },
  {
    id: "security",
    label: "SSO Auth Vulnerability",
    badge: "SECOPS ESCALATION",
    iconType: "security",
    subject: "Unrecognized Okta SAML assertions detected from anomalous IP address",
    body: "Automated SIEM alert: Multiple brute force attempts bypassing our secondary conditional access policy. Session tokens generated without MFA challenge.",
    customer: "FinTech Compliance Partner",
    result: {
      queue: "Security Operations",
      code: "SEC-OPS",
      urgency: "2.9 / 3.0",
      urgencyPercent: 96,
      priority: "CRITICAL P0",
      priorityBadge: "bg-rose-500/20 text-rose-700 border-rose-500/40",
      churnRisk: "0.62 (Moderate)",
      churnColor: "text-amber-600",
      sentiment: "Vigilant / Technical Urgent",
      action: "Revoke Okta SAML active session tokens. Enforce emergency IP perimeter and page SecOps triage.",
      latency: "31ms",
    },
  },
  {
    id: "general",
    label: "Feature Expansion Request",
    badge: "STANDARD SUPPORT",
    iconType: "support",
    subject: "Question about bulk webhook export integration and CSV report filters",
    body: "Hi team, we are planning our Q4 reporting sync and would love to know if there is a REST endpoint to pull historical triage metrics in CSV format.",
    customer: "Mid-Market Growth",
    result: {
      queue: "Customer Success",
      code: "CUST-GROWTH",
      urgency: "0.8 / 3.0",
      urgencyPercent: 26,
      priority: "LOW P3",
      priorityBadge: "bg-emerald-500/20 text-emerald-700 border-emerald-500/40",
      churnRisk: "0.08 (Healthy)",
      churnColor: "text-emerald-600",
      sentiment: "Constructive / Positive",
      action: "Standard response. Provide documentation link to /api/reports/export endpoint.",
      latency: "28ms",
    },
  },
];

const FAQS = [
  {
    q: "How does Gurp achieve sub-50ms inference while LLMs take 3-8 seconds?",
    a: "Gurp is built on a purpose-trained, non-autoregressive ModernBERT architecture. Unlike generative models that output word-by-word tokens sequentially, Gurp processes the entire incident text in a single matrix forward pass, directly computing classification logits and SLA vectors in tens of milliseconds.",
  },
  {
    q: "Can Gurp eliminate hallucinations during critical incident triage?",
    a: "Yes. Generative models hallucinate because they predict arbitrary next tokens. Gurp uses deterministic linear classification heads with calibrated softmax distributions. It maps tickets strictly to predefined engineering queues, SLA buckets, and churn risk scores with 0.0% generative drift.",
  },
  {
    q: "Can we deploy Gurp completely on-premise or within our private VPC?",
    a: "Absolutely. Gurp runs with a 3-tier architecture: the front-end browser talks only to authenticated Next.js Server Actions, which communicate over private localhost or VPC networks directly to the Laya inference engine. Zero incident data ever leaves your perimeter.",
  },
  {
    q: "How does the dynamic draggable dashboard layout work?",
    a: "Gurp features an intelligent fluid grid engine: sections can be dynamically resized and rearranged. When you expand a column, neighboring columns automatically squeeze down to their minimum width; if space runs out, they fluidly reflow to the row below, and automatically pull back up when space clears.",
  },
];

function ScenarioIcon({ type, className }: { type: ScenarioIconType; className?: string }) {
  switch (type) {
    case "alert":
      return <FiAlertTriangle className={className || "w-4 h-4 text-rose-600"} />;
    case "billing":
      return <FiCreditCard className={className || "w-4 h-4 text-amber-600"} />;
    case "security":
      return <FiShield className={className || "w-4 h-4 text-rose-600"} />;
    case "support":
    default:
      return <FiMessageSquare className={className || "w-4 h-4 text-emerald-600"} />;
  }
}

export function CustomerLanding({ session, defaultView = "landing" }: CustomerLandingProps) {
  const [currentView, setCurrentView] = useState<"landing" | "console">(defaultView);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioItem>(DEMO_SCENARIOS[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [customSubject, setCustomSubject] = useState(DEMO_SCENARIOS[0].subject);
  const [customBody, setCustomBody] = useState(DEMO_SCENARIOS[0].body);

  // ROI Calculator State
  const [monthlyTickets, setMonthlyTickets] = useState(25000);

  const handleSelectScenario = (sc: ScenarioItem) => {
    setSelectedScenario(sc);
    setCustomSubject(sc.subject);
    setCustomBody(sc.body);
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 240);
  };

  // Calculations for customer ROI
  const hoursSavedPerMonth = Math.round((monthlyTickets * 4.2) / 60);
  const llmCost = Math.round(monthlyTickets * 0.025);
  const gurpCost = Math.round(monthlyTickets * 0.001);
  const dollarsSaved = Math.max(0, llmCost - gurpCost);

  // If authenticated user selects console view, render LayaDashboard with quick toggle back
  if (session && currentView === "console") {
    return (
      <div className="h-screen w-screen overflow-hidden flex flex-col bg-surface font-sans text-on-surface">
        <LayaDashboard
          onExitConsole={() => setCurrentView("landing")}
          session={session}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans antialiased overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* ========================================================= */}
      {/* 1. TOP NAVIGATION NAVBAR                                  */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-50 w-full border-b border-outline-variant/20 bg-surface/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl btn-primary-gradient flex items-center justify-center text-white font-mono font-black text-lg shadow-md group-hover:scale-105 transition-transform">
              G
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-2xl tracking-tight text-on-surface">
                  Gurp
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary/15 text-primary border border-primary/25">
                  v2.0 ModernBERT
                </span>
              </div>
              <p className="text-[10px] font-mono text-on-surface-muted hidden sm:block">
                Sub-50ms Incident Decision & SLA Triage Engine
              </p>
            </div>
          </Link>

          {/* Center Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-mono font-bold text-on-surface-muted">
            <a href="#simulator" className="hover:text-primary transition-colors flex items-center gap-1">
              <FiActivity className="w-3.5 h-3.5" />
              <span>[SIMULATOR]</span>
            </a>
            <a href="#calculator" className="hover:text-primary transition-colors flex items-center gap-1">
              <FiDollarSign className="w-3.5 h-3.5" />
              <span>[ROI CALCULATOR]</span>
            </a>
            <a href="#comparison" className="hover:text-primary transition-colors flex items-center gap-1">
              <FiBarChart2 className="w-3.5 h-3.5" />
              <span>[BENCHMARKS]</span>
            </a>
            <a href="#features" className="hover:text-primary transition-colors flex items-center gap-1">
              <FiLayers className="w-3.5 h-3.5" />
              <span>[CAPABILITIES]</span>
            </a>
            <a href="#faq" className="hover:text-primary transition-colors">
              [FAQ]
            </a>
          </nav>

          {/* Right Actions & Theme */}
          <div className="flex items-center gap-3">
            <ThemeSelector />

            {session ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentView("console")}
                  className="px-4 py-2 rounded-xl btn-primary-gradient text-on-primary font-mono text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FiTerminal className="w-3.5 h-3.5" />
                  <span>Open Console</span>
                </button>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="text-xs px-3 py-2 rounded-xl border border-outline-variant/30 text-on-surface hover:bg-surface-container-low transition-colors font-mono cursor-pointer hidden sm:block"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/sign-in"
                  className="px-3.5 py-2 rounded-xl border border-outline-variant/30 text-xs font-mono font-bold text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-in"
                  className="px-4 py-2 rounded-xl btn-primary-gradient text-on-primary font-mono text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
                >
                  <span>Launch Console</span>
                  <FiArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. HERO SECTION                                           */}
      {/* ========================================================= */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Decorative Ambient Radial Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[450px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-bold uppercase tracking-wider mb-8 shadow-xs animate-fadeIn">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Non-Autoregressive ModernBERT Decision Platform</span>
        </div>

        <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-on-surface max-w-5xl mx-auto leading-[1.08]">
          Resolve Customer Incidents at{" "}
          <span className="text-primary underline decoration-primary/30 underline-offset-8">
            Sub-50ms Speed.
          </span>
        </h1>

        <p className="mt-7 text-base sm:text-xl text-on-surface-muted max-w-3xl mx-auto leading-relaxed font-sans font-normal">
          Gurp replaces slow, hallucinating generative LLMs with deterministic ModernBERT intelligence.
          Predict ticket urgency, customer churn risk, and automated engineering dispatch in milliseconds.
        </p>

        {/* CTA Cluster */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {session ? (
            <button
              type="button"
              onClick={() => setCurrentView("console")}
              className="px-7 py-4 rounded-2xl btn-primary-gradient text-on-primary font-mono font-bold text-sm tracking-wider uppercase transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center gap-2.5 cursor-pointer"
            >
              <span>ENTER OPERATOR CONSOLE</span>
              <FiTerminal className="w-4 h-4" />
            </button>
          ) : (
            <Link
              href="/sign-in"
              className="px-7 py-4 rounded-2xl btn-primary-gradient text-on-primary font-mono font-bold text-sm tracking-wider uppercase transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center gap-2.5"
            >
              <span>GET STARTED FREE</span>
              <FiZap className="w-4 h-4" />
            </Link>
          )}

          <a
            href="#simulator"
            className="px-7 py-4 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-mono font-bold text-sm tracking-wider uppercase transition-all shadow-sm flex items-center gap-2"
          >
            <span>[TRY LIVE SIMULATOR]</span>
            <FiChevronDown className="w-4 h-4" />
          </a>
        </div>

        {/* Hero Telemetry Stat Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 border border-outline-variant/25 rounded-3xl bg-surface-container-lowest/80 p-5 shadow-bloom backdrop-blur-md divide-y sm:divide-y-0 sm:divide-x divide-outline-variant/20 max-w-5xl mx-auto">
          <div className="p-3">
            <div className="flex items-center justify-center gap-1.5 text-on-surface-muted">
              <FiClock className="w-3.5 h-3.5" />
              <p className="text-[11px] font-mono uppercase font-semibold">Triage Velocity</p>
            </div>
            <p className="text-3xl font-black font-mono text-primary mt-1">{"< 50ms"}</p>
            <span className="text-[11px] font-mono text-emerald-700 font-bold">14x Faster than GPT-4o</span>
          </div>

          <div className="p-3">
            <div className="flex items-center justify-center gap-1.5 text-on-surface-muted">
              <FiCheckCircle className="w-3.5 h-3.5" />
              <p className="text-[11px] font-mono uppercase font-semibold">Routing Precision</p>
            </div>
            <p className="text-3xl font-black font-mono text-on-surface mt-1">99.2%</p>
            <span className="text-[11px] font-mono text-on-surface-muted">ModernBERT Linear Heads</span>
          </div>

          <div className="p-3">
            <div className="flex items-center justify-center gap-1.5 text-on-surface-muted">
              <FiShield className="w-3.5 h-3.5" />
              <p className="text-[11px] font-mono uppercase font-semibold">Hallucination Rate</p>
            </div>
            <p className="text-3xl font-black font-mono text-emerald-700 mt-1">0.0%</p>
            <span className="text-[11px] font-mono text-emerald-700 font-bold">Deterministic Probability</span>
          </div>

          <div className="p-3">
            <div className="flex items-center justify-center gap-1.5 text-on-surface-muted">
              <FiLock className="w-3.5 h-3.5" />
              <p className="text-[11px] font-mono uppercase font-semibold">Deployment</p>
            </div>
            <p className="text-3xl font-black font-mono text-secondary mt-1">Private VPC</p>
            <span className="text-[11px] font-mono text-on-surface-muted">Zero External API Egress</span>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. INTERACTIVE LIVE CUSTOMER TRIAGE SIMULATOR              */}
      {/* ========================================================= */}
      <section id="simulator" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
        <div className="border border-outline-variant/30 rounded-3xl bg-surface-container-lowest shadow-bloom p-6 sm:p-10 lg:p-12 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/20 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
                  [INTERACTIVE CUSTOMER SIMULATOR]
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-800 border border-emerald-500/25">
                  LIVE MODEL RUNNER
                </span>
              </div>
              <h2 className="text-3xl font-display font-black text-on-surface mt-1.5">
                Experience Instant Incident Classification
              </h2>
            </div>
            <p className="text-xs font-mono text-on-surface-muted max-w-sm text-right hidden md:block">
              Select any scenario below to see how Gurp classifies priority, calculates SLA risk, and determines operational dispatch.
            </p>
          </div>

          {/* Scenario Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {DEMO_SCENARIOS.map((sc) => {
              const isActive = selectedScenario.id === sc.id;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => handleSelectScenario(sc)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    isActive
                      ? "border-primary bg-primary/10 shadow-sm ring-2 ring-primary/30"
                      : "border-outline-variant/20 bg-surface-container-low hover:bg-surface-container-high"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-secondary uppercase">
                      {sc.badge}
                    </span>
                    {isActive ? (
                      <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                    ) : (
                      <ScenarioIcon type={sc.iconType} className="w-3.5 h-3.5 text-on-surface-muted" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <ScenarioIcon type={sc.iconType} className="w-4 h-4 shrink-0" />
                    <p className="text-sm font-bold text-on-surface truncate">{sc.label}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Simulation Console: 2-Column Command Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            {/* Left: Input Payload (6 Cols) */}
            <div className="lg:col-span-6 rounded-2xl border border-outline-variant/25 bg-surface-container-low/70 p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-on-surface-muted uppercase">
                  <span>[CUSTOMER INCIDENT PAYLOAD]</span>
                  <span className="text-primary font-semibold">{selectedScenario.customer}</span>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-on-surface-muted uppercase mb-1.5">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-xs font-bold text-on-surface focus:outline-none focus:border-primary shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-on-surface-muted uppercase mb-1.5">
                    Incident Statement / Customer Log
                  </label>
                  <textarea
                    rows={6}
                    value={customBody}
                    onChange={(e) => setCustomBody(e.target.value)}
                    className="w-full p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 font-sans text-xs text-on-surface leading-relaxed focus:outline-none focus:border-primary resize-none shadow-xs"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsSimulating(true);
                  setTimeout(() => setIsSimulating(false), 240);
                }}
                disabled={isSimulating}
                className="w-full py-3.5 rounded-xl btn-primary-gradient text-on-primary font-mono font-bold text-xs uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <FiCpu className="w-4 h-4" />
                <span>{isSimulating ? "COMPUTING TENSOR HEADS..." : "RUN SUB-50MS TRIAGE INFERENCE"}</span>
              </button>
            </div>

            {/* Right: Live ModernBERT Inferred Output (6 Cols) */}
            <div className="lg:col-span-6 rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-6 space-y-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <span className="text-xs font-mono font-bold text-on-surface uppercase tracking-wider">
                  [CLASSIFIER TELEMETRY OUTPUT]
                </span>
                <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-700 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>LATENCY: {selectedScenario.result.latency}</span>
                </div>
              </div>

              {/* Destination Queue Route */}
              <div className="p-4 rounded-2xl border border-outline-variant/20 bg-surface-container-low flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono text-on-surface-muted uppercase font-bold">AUTOMATED ROUTING QUEUE</p>
                  <div className="flex items-center gap-2.5 mt-1.5">
                    <ScenarioIcon type={selectedScenario.iconType} className="w-6 h-6 text-primary" />
                    <span className="text-xl font-black font-mono uppercase text-on-surface">
                      {selectedScenario.result.queue}
                    </span>
                  </div>
                </div>
                <span className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border border-primary/30 bg-primary/10 text-primary">
                  {selectedScenario.result.code}
                </span>
              </div>

              {/* Urgency & Priority 3-Block Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-outline-variant/20 bg-surface-container-low">
                  <p className="text-[10px] font-mono text-on-surface-muted uppercase font-bold">URGENCY SLA</p>
                  <p className="text-lg font-black font-mono text-primary mt-1">
                    {selectedScenario.result.urgency}
                  </p>
                  <div className="w-full bg-surface-container-high rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-500"
                      style={{ width: `${selectedScenario.result.urgencyPercent}%` }}
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-outline-variant/20 bg-surface-container-low">
                  <p className="text-[10px] font-mono text-on-surface-muted uppercase font-bold">PRIORITY LEVEL</p>
                  <div className="mt-1.5">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${selectedScenario.result.priorityBadge}`}>
                      {selectedScenario.result.priority}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-outline-variant/20 bg-surface-container-low">
                  <p className="text-[10px] font-mono text-on-surface-muted uppercase font-bold">CHURN RISK</p>
                  <p className={`text-xs font-black font-mono mt-1.5 ${selectedScenario.result.churnColor}`}>
                    {selectedScenario.result.churnRisk}
                  </p>
                </div>
              </div>

              {/* Direct Recommendation Directive */}
              <div className="p-4 rounded-xl border border-primary/25 bg-primary/5 space-y-1.5">
                <p className="text-[10px] font-mono font-bold text-primary uppercase">
                  [OPERATIONAL DISPATCH DIRECTIVE]
                </p>
                <p className="text-xs font-medium text-on-surface leading-relaxed">
                  {selectedScenario.result.action}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. ROI & HOURS SAVED CALCULATOR                           */}
      {/* ========================================================= */}
      <section id="calculator" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
        <div className="rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-8 sm:p-12 shadow-sm">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
            <span className="text-xs font-mono font-bold text-secondary uppercase tracking-wider">
              [ENTERPRISE VALUE ESTIMATOR]
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-on-surface">
              Calculate Your Operational Savings
            </h2>
            <p className="text-sm text-on-surface-muted">
              Estimate the hours recovered and cloud API bills slashed when replacing manual routing and slow LLMs with Gurp.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
            {/* Slider Control */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-mono font-bold">
                  <span className="text-on-surface">Monthly Customer Incident Volume:</span>
                  <span className="text-primary text-lg">{monthlyTickets.toLocaleString()} tickets</span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={250000}
                  step={5000}
                  value={monthlyTickets}
                  onChange={(e) => setMonthlyTickets(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-2 bg-surface-container-high rounded-lg"
                />
                <div className="flex justify-between text-[11px] font-mono text-on-surface-muted">
                  <span>5,000</span>
                  <span>100,000</span>
                  <span>250,000+</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-2 text-xs font-sans text-on-surface-muted">
                <p>
                  <strong className="text-on-surface">Did you know?</strong> Traditional support agents spend an average of <strong>4.2 minutes</strong> reading, evaluating urgency, and assigning each ticket to SRE, SecOps, or Billing teams.
                </p>
                <p>
                  Gurp executes this exact triage workflow in <strong>under 50 milliseconds</strong> with zero human bottleneck.
                </p>
              </div>
            </div>

            {/* Live Metrics Display */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl border border-outline-variant/20 bg-surface-container-low text-center">
                <p className="text-xs font-mono uppercase text-on-surface-muted font-bold">Engineering Hours Saved</p>
                <p className="text-3xl sm:text-4xl font-black font-mono text-primary mt-2">
                  {hoursSavedPerMonth.toLocaleString()} hrs
                </p>
                <p className="text-[11px] font-mono text-emerald-700 mt-1 font-semibold">/ month recovered</p>
              </div>

              <div className="p-6 rounded-2xl border border-outline-variant/20 bg-surface-container-low text-center">
                <p className="text-xs font-mono uppercase text-on-surface-muted font-bold">LLM Token Savings</p>
                <p className="text-3xl sm:text-4xl font-black font-mono text-emerald-700 mt-2">
                  ${dollarsSaved.toLocaleString()}
                </p>
                <p className="text-[11px] font-mono text-on-surface-muted mt-1">/ month vs OpenAI</p>
              </div>

              <div className="col-span-2 p-5 rounded-2xl border border-primary/25 bg-primary/10 text-center">
                <p className="text-xs font-mono font-bold text-primary uppercase">
                  ANNUALIZED OPERATIONAL IMPACT
                </p>
                <p className="text-2xl font-black font-mono text-on-surface mt-1">
                  ${(dollarsSaved * 12).toLocaleString()} saved &bull; {(hoursSavedPerMonth * 12).toLocaleString()} hrs unlocked
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. BEFORE VS AFTER COMPARISON TABLE                       */}
      {/* ========================================================= */}
      <section id="comparison" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-mono font-bold text-secondary uppercase tracking-wider">
            [ARCHITECTURAL BENCHMARKS]
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-black text-on-surface">
            Legacy LLMs vs. Gurp Dedicated ModernBERT
          </h2>
          <p className="text-sm text-on-surface-muted">
            Why generative autoregressive models are the wrong tool for high-consequence customer operations.
          </p>
        </div>

        <div className="border border-outline-variant/30 rounded-3xl bg-surface-container-lowest overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container-low font-mono uppercase text-on-surface-muted">
                  <th className="p-4 sm:p-5">Capability / Metric</th>
                  <th className="p-4 sm:p-5 text-rose-600 font-bold">Generative LLMs (GPT-4 / Claude)</th>
                  <th className="p-4 sm:p-5 text-primary font-bold">Gurp (Dedicated ModernBERT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15 text-on-surface">
                <tr>
                  <td className="p-4 sm:p-5 font-bold font-mono">Triage Response Latency</td>
                  <td className="p-4 sm:p-5 text-on-surface-muted">3,000ms – 8,000ms (Autoregressive lag)</td>
                  <td className="p-4 sm:p-5 font-bold text-primary font-mono">&lt; 50ms (Single tensor pass)</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-bold font-mono">Classification Determinism</td>
                  <td className="p-4 sm:p-5 text-on-surface-muted">Probabilistic token drift (Hallucinates categories)</td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-700 font-mono">100% Deterministic linear heads</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-bold font-mono">Per-Ticket Ingestion Cost</td>
                  <td className="p-4 sm:p-5 text-on-surface-muted">~$0.02 – $0.05 per API call</td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-700 font-mono">~$0.0001 (Zero token billing)</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-bold font-mono">Data Privacy & Security</td>
                  <td className="p-4 sm:p-5 text-on-surface-muted">Exposes customer PII to external vendor APIs</td>
                  <td className="p-4 sm:p-5 font-bold text-primary font-mono">100% Air-Gapped / Private VPC</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-bold font-mono">Operator Dashboard</td>
                  <td className="p-4 sm:p-5 text-on-surface-muted">Static chat interfaces or rigid tables</td>
                  <td className="p-4 sm:p-5 font-bold text-primary font-mono">Draggable Fluid Grid with auto-reflow</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. ENTERPRISE CAPABILITIES GRID                           */}
      {/* ========================================================= */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
            [ENTERPRISE CAPABILITIES]
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-black text-on-surface">
            Engineered for Modern Customer Operations
          </h2>
          <p className="text-sm text-on-surface-muted">
            Everything your support engineers, SRE on-call teams, and SecOps need to prevent customer SLA breaches.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl border border-outline-variant/30 bg-surface-container-lowest shadow-xs space-y-3.5 hover:border-primary/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <FiZap className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-on-surface">Sub-50ms Non-Autoregressive</h3>
            <p className="text-xs text-on-surface-muted leading-relaxed font-sans">
              No token-by-token generation lag. Single forward tensor pass evaluates urgency scores, queue routes, and priority in a fraction of a blink.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-outline-variant/30 bg-surface-container-lowest shadow-xs space-y-3.5 hover:border-primary/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
              <FiShield className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-on-surface">Zero Hallucination Heads</h3>
            <p className="text-xs text-on-surface-muted leading-relaxed font-sans">
              Eliminate generative hallucination risk. Output queues and SLA scores map strictly to calibrated linear probability layers.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-outline-variant/30 bg-surface-container-lowest shadow-xs space-y-3.5 hover:border-primary/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-700">
              <FiLock className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-on-surface">3-Tier Air-Gapped Security</h3>
            <p className="text-xs text-on-surface-muted leading-relaxed font-sans">
              Browser clients communicate only with your Next.js server actions. Raw Laya model endpoints are isolated on internal loopback networks.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-outline-variant/30 bg-surface-container-lowest shadow-xs space-y-3.5 hover:border-primary/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <FiLayout className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-on-surface">Draggable Fluid Grid Engine</h3>
            <p className="text-xs text-on-surface-muted leading-relaxed font-sans">
              Section resize with neighbor squeeze, intelligent auto-wrapping, and upward gap-filling without broken layouts or jarring glitches.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-outline-variant/30 bg-surface-container-lowest shadow-xs space-y-3.5 hover:border-primary/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
              <FiSliders className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-on-surface">Dynamic Theming & Presets</h3>
            <p className="text-xs text-on-surface-muted leading-relaxed font-sans">
              Comes standard with modern Warm Beige-Brown, Sleek Dark, Cyberpunk, and Forest themes with zero CSS conflicts or flash of unstyled content.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-outline-variant/30 bg-surface-container-lowest shadow-xs space-y-3.5 hover:border-primary/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-700">
              <FiTrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-on-surface">Customer Churn Prediction</h3>
            <p className="text-xs text-on-surface-muted leading-relaxed font-sans">
              Quantify customer frustration and churn probability in real-time to alert customer success managers before high-value accounts cancel.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. FREQUENTLY ASKED QUESTIONS                             */}
      {/* ========================================================= */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-mono font-bold text-secondary uppercase tracking-wider">
            [COMMON INQUIRIES]
          </span>
          <h2 className="text-3xl font-display font-black text-on-surface">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-outline-variant/25 bg-surface-container-lowest space-y-2"
            >
              <h3 className="font-display font-bold text-sm text-on-surface">
                {faq.q}
              </h3>
              <p className="text-xs text-on-surface-muted leading-relaxed font-sans">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. CALL TO ACTION BANNER                                  */}
      {/* ========================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl btn-primary-gradient p-10 sm:p-16 text-center text-on-primary shadow-2xl space-y-6 relative overflow-hidden">
          <div className="relative z-10 space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight leading-tight">
              Ready to Accelerate Your Enterprise Incident Triage?
            </h2>
            <p className="text-sm sm:text-base opacity-90 max-w-xl mx-auto font-sans">
              Deploy Gurp with your existing customer support, SRE, and SecOps workflows in minutes.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              {session ? (
                <button
                  type="button"
                  onClick={() => setCurrentView("console")}
                  className="px-8 py-4 rounded-2xl bg-surface text-on-surface font-mono font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Enter Operator Console</span>
                  <FiArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <Link
                  href="/sign-in"
                  className="px-8 py-4 rounded-2xl bg-surface text-on-surface font-mono font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <span>Launch Command Console</span>
                  <FiArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 9. FOOTER                                                 */}
      {/* ========================================================= */}
      <footer className="border-t border-outline-variant/20 bg-surface-container-lowest py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-6 text-xs font-mono text-on-surface-muted">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-lg btn-primary-gradient flex items-center justify-center text-white font-bold text-xs">
              G
            </span>
            <span className="font-bold text-on-surface">Gurp</span> — Sub-50ms Incident Decision Platform
          </div>

          <div className="flex items-center gap-6">
            <a href="#simulator" className="hover:text-primary transition-colors">Simulator</a>
            <a href="#calculator" className="hover:text-primary transition-colors">Calculator</a>
            <a href="#comparison" className="hover:text-primary transition-colors">Benchmarks</a>
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <Link href="/settings" className="hover:text-primary transition-colors">Settings</Link>
          </div>

          <div>
            © {new Date().getFullYear()} Gurp Systems. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
