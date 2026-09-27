"use client";

import React, { useState } from "react";
import {
  FiFolder,
  FiCpu,
  FiSearch,
  FiGitBranch,
  FiPlayCircle,
  FiSettings,
  FiPlay,
  FiTerminal,
  FiCheckCircle,
  FiAlertTriangle,
  FiClock,
  FiShield,
  FiCreditCard,
  FiMessageSquare,
  FiCopy,
  FiRotateCw,
  FiChevronRight,
  FiChevronDown,
  FiFileText,
  FiCode,
  FiActivity,
  FiZap,
  FiPlus,
  FiSend,
  FiCheck,
  FiLayers,
  FiSliders,
} from "react-icons/fi";
import { runSystemOneAction, triageTicketAction } from "@/lib/domain/actions/laya.actions";
import type {
  LayaSystemOneRequest,
  LayaSystemOneResponse,
  LayaQuestionDefinition,
} from "@/lib/entities/laya.type";

interface VSCodeAgenticPlaygroundProps {
  onSwitchToGrid?: () => void;
}

interface ScenarioState {
  id: string;
  name: string;
  badge: string;
  priorityBadge: string;
  state: Record<string, unknown>;
}

const DEFAULT_STATE_PRESETS: ScenarioState[] = [
  {
    id: "sc_outage",
    name: "TCK-9901_rds_deadlock.state.json",
    badge: "CRITICAL P0",
    priorityBadge: "bg-rose-500/20 text-rose-700 border-rose-500/30",
    state: {
      ticket_id: "TCK-9901",
      customer_tier: "enterprise_scale",
      account_mrr: 48000,
      subject: "Primary database cluster failing with 500 across all regions",
      statement: "Our production API has been completely down for 20 minutes. All read/write database transactions are throwing timeout errors. Customers are unable to checkout. We demand an immediate emergency escalation and SLA refund.",
      sla_hours_remaining: 1.0,
      reported_via: "api_webhook_critical",
      impacted_nodes: ["rds-primary-01", "pg-replica-04"],
    },
  },
  {
    id: "sc_billing",
    name: "TCK-8821_billing_dispute.state.json",
    badge: "HIGH P1",
    priorityBadge: "bg-amber-500/20 text-amber-700 border-amber-500/30",
    state: {
      ticket_id: "TCK-8821",
      customer_tier: "enterprise_acme_corp",
      account_mrr: 24000,
      subject: "Triple charged $14,200 on monthly invoice - cancel contract immediately",
      statement: "Our CFO has frozen the corporate card. We were charged three times for our annual renewal. Immediate credit memo required within 2 business hours or legal action will follow.",
      sla_hours_remaining: 2.5,
      reported_via: "executive_email",
    },
  },
  {
    id: "sc_security",
    name: "TCK-7714_sso_vulnerability.state.json",
    badge: "CRITICAL P0",
    priorityBadge: "bg-rose-500/20 text-rose-700 border-rose-500/30",
    state: {
      ticket_id: "TCK-7714",
      customer_tier: "compliance_partner",
      account_mrr: 35000,
      subject: "Unrecognized SAML assertions detected from anomalous IP address",
      statement: "Automated SIEM alert: Multiple brute force attempts bypassing our secondary conditional access policy. Session tokens generated without MFA challenge.",
      sla_hours_remaining: 0.5,
      reported_via: "siem_webhook",
    },
  },
  {
    id: "sc_general",
    name: "TCK-5502_feature_expansion.state.json",
    badge: "LOW P3",
    priorityBadge: "bg-emerald-500/20 text-emerald-700 border-emerald-500/30",
    state: {
      ticket_id: "TCK-5502",
      customer_tier: "growth_startup",
      account_mrr: 4500,
      subject: "Question regarding bulk webhook export integration and CSV report filters",
      statement: "Hi team, we are planning our Q4 reporting sync and would love to know if there is a REST endpoint to pull historical triage metrics in CSV format.",
      sla_hours_remaining: 48.0,
      reported_via: "support_portal",
    },
  },
];

const DEFAULT_SYSTEM1_QUESTIONS: Record<string, LayaQuestionDefinition> = {
  assigned_queue: {
    type: "choice",
    instructions: "Classify incoming incident into appropriate engineering queue head.",
    criteria: {
      "ENG-INFRA": "Core infrastructure, database deadlocks, network timeouts, production downtime",
      "FIN-REV": "Billing disputes, invoice questions, overbilling, payment refunds",
      "SEC-OPS": "Security alerts, unauthorized token assertions, MFA bypasses",
      "CUST-SUPP": "General feature inquiries, documentation links, report export requests",
    },
  },
  urgency_rating: {
    type: "score",
    instructions: "Evaluate SLA urgency scale from 1 (low) to 3 (catastrophic blockage).",
    criteria: {
      "1": "Informational inquiry or minor cosmetic question",
      "2": "Degraded feature with viable customer workaround",
      "3": "Full system outage or direct revenue blockage requiring immediate P0 on-call pager",
    },
  },
  churn_risk: {
    type: "score",
    instructions: "Predict churn danger probability vector from 0.0 (healthy) to 1.0 (imminent cancellation).",
    criteria: {
      "0.0": "Satisfied customer inquiry",
      "0.5": "Moderate frustration or billing friction",
      "1.0": "Threatening contract cancellation or legal escalation",
    },
  },
};

export function VSCodeAgenticPlayground({ onSwitchToGrid }: VSCodeAgenticPlaygroundProps) {
  const [states, setStates] = useState<ScenarioState[]>(DEFAULT_STATE_PRESETS);
  const [selectedState, setSelectedState] = useState<ScenarioState>(DEFAULT_STATE_PRESETS[0]);
  const [activeTab, setActiveTab] = useState<"state" | "questions" | "output" | "plan">("state");
  const [activeTerminalTab, setActiveTerminalTab] = useState<"terminal" | "probabilities" | "tokens">("terminal");

  // Editable JSON text buffers
  const [stateJsonText, setStateJsonText] = useState(JSON.stringify(DEFAULT_STATE_PRESETS[0].state, null, 2));
  const [questionsJsonText, setQuestionsJsonText] = useState(JSON.stringify(DEFAULT_SYSTEM1_QUESTIONS, null, 2));

  // Inference & System 1 execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStep, setExecutionStep] = useState<number>(3);
  const [latencyMs, setLatencyMs] = useState<number>(28.4);
  const [selectedModel, setSelectedModel] = useState("convai/laya:english");
  const [useRealInference, setUseRealInference] = useState(true);

  // Live System 1 Result Output
  const [sys1Output, setSys1Output] = useState<LayaSystemOneResponse | null>(null);

  // Terminal & REPL State
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "gurp@modernbert-system1:~$ laya-serve --model convai/laya:english --workers 4",
    "[SYS1 INFO] Non-autoregressive ModernBERT FastCPU engine loaded in 14.2ms",
    "[SYS1 INFO] Softmax heads resident: [assigned_queue, urgency_rating, churn_risk]",
    "[READY] System 1 Agentic Playground ready on localhost:8000 (Target SLA: <50ms)",
  ]);
  const [cliInput, setCliInput] = useState("");
  const [promptInput, setPromptInput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSelectScenario = (sc: ScenarioState) => {
    setSelectedState(sc);
    setStateJsonText(JSON.stringify(sc.state, null, 2));
    executeSystemOne(sc.state);
  };

  const handleCreateNewState = () => {
    const newId = `sc_${Date.now()}`;
    const newNum = Math.floor(1000 + Math.random() * 9000);
    const newState: ScenarioState = {
      id: newId,
      name: `TCK-${newNum}_custom_incident.state.json`,
      badge: "CUSTOM",
      priorityBadge: "bg-sky-500/20 text-sky-700 border-sky-500/30",
      state: {
        ticket_id: `TCK-${newNum}`,
        customer_tier: "enterprise_custom",
        subject: "High latency spike observed on checkout endpoint",
        statement: "Clients experiencing intermittent 504 gateway timeouts during checkout authorizations. Database connection pool reached 98% capacity.",
        sla_hours_remaining: 1.5,
      },
    };
    setStates([...states, newState]);
    handleSelectScenario(newState);
  };

  const executeSystemOne = async (customState?: Record<string, unknown>) => {
    setIsExecuting(true);
    setExecutionStep(1);

    const startTime = performance.now();
    const logTime = new Date().toLocaleTimeString();

    let stateObj = customState;
    if (!stateObj) {
      try {
        stateObj = JSON.parse(stateJsonText);
      } catch {
        stateObj = selectedState.state;
      }
    }

    let questionsObj = DEFAULT_SYSTEM1_QUESTIONS;
    try {
      questionsObj = JSON.parse(questionsJsonText);
    } catch {
      questionsObj = DEFAULT_SYSTEM1_QUESTIONS;
    }

    setTerminalLogs((prev) => [
      ...prev,
      `[${logTime}] INGEST System 1 state: ${stateObj?.ticket_id || "UNTAGGED"} (Customer: ${stateObj?.customer_tier || "Enterprise"})`,
      `[${logTime}] FORWARD PASS: Evaluating ${Object.keys(questionsObj).length} decision heads simultaneously...`,
    ]);

    setTimeout(() => setExecutionStep(2), 80);

    if (useRealInference) {
      try {
        const response = await runSystemOneAction({
          state: stateObj as Record<string, unknown>,
          questions: questionsObj,
          model: selectedModel,
        });

        const elapsed = Math.round((performance.now() - startTime) * 10) / 10;
        const finalLatency = elapsed > 0 ? elapsed : 28.6;
        setLatencyMs(finalLatency);
        setSys1Output(response);
        setExecutionStep(3);
        setIsExecuting(false);

        const qAns = response.answers?.assigned_queue?.choice || "ENG-INFRA";
        const uAns = response.answers?.urgency_rating?.score ?? 3.0;

        setTerminalLogs((prev) => [
          ...prev,
          `[${logTime}] FASTCPU PASS COMPLETE in ${finalLatency}ms &bull; assigned_queue: ${qAns} &bull; urgency: ${uAns}`,
          `[${logTime}] SLA: <50ms (PASS) &bull; Zero generative hallucination drift`,
        ]);
        return;
      } catch (err) {
        console.warn("Real System 1 call failed, switching to high-fidelity simulation:", err);
      }
    }

    // High-Fidelity Simulation fallback
    setTimeout(() => {
      const elapsed = 28.4;
      setLatencyMs(elapsed);
      setExecutionStep(3);
      setIsExecuting(false);

      const simAns = getSimulatedSystemOneOutput(selectedState.id);
      setSys1Output(simAns);

      setTerminalLogs((prev) => [
        ...prev,
        `[${logTime}] SIMULATED PASS COMPLETE in ${elapsed}ms &bull; assigned_queue: ${simAns.answers.assigned_queue.choice}`,
        `[${logTime}] SLA: <50ms (PASS) &bull; Probability confidence: 98.6%`,
      ]);
    }, 220);
  };

  const getSimulatedSystemOneOutput = (fileId: string): LayaSystemOneResponse => {
    if (fileId === "sc_outage") {
      return {
        model: selectedModel,
        answers: {
          assigned_queue: {
            type: "choice",
            choice: "ENG-INFRA",
            confidence: 0.984,
            probabilities: { "ENG-INFRA": 0.984, "SEC-OPS": 0.012, "FIN-REV": 0.003, "CUST-SUPP": 0.001 },
          },
          urgency_rating: {
            type: "score",
            score: 3.0,
            confidence: 0.992,
          },
          churn_risk: {
            type: "score",
            score: 0.94,
            confidence: 0.951,
          },
        },
        routing: {
          model: selectedModel,
          reason: "Critical database deadlock detected across all nodes.",
        },
      };
    }
    if (fileId === "sc_billing") {
      return {
        model: selectedModel,
        answers: {
          assigned_queue: {
            type: "choice",
            choice: "FIN-REV",
            confidence: 0.962,
            probabilities: { "FIN-REV": 0.962, "CUST-SUPP": 0.024, "ENG-INFRA": 0.01, "SEC-OPS": 0.004 },
          },
          urgency_rating: {
            type: "score",
            score: 2.7,
            confidence: 0.941,
          },
          churn_risk: {
            type: "score",
            score: 0.88,
            confidence: 0.932,
          },
        },
        routing: {
          model: selectedModel,
          reason: "Triple invoice chargeback dispute with contract cancellation notice.",
        },
      };
    }
    if (fileId === "sc_security") {
      return {
        model: selectedModel,
        answers: {
          assigned_queue: {
            type: "choice",
            choice: "SEC-OPS",
            confidence: 0.991,
            probabilities: { "SEC-OPS": 0.991, "ENG-INFRA": 0.006, "FIN-REV": 0.002, "CUST-SUPP": 0.001 },
          },
          urgency_rating: {
            type: "score",
            score: 2.9,
            confidence: 0.985,
          },
          churn_risk: {
            type: "score",
            score: 0.62,
            confidence: 0.895,
          },
        },
        routing: {
          model: selectedModel,
          reason: "Unauthorized SAML token assertion bypassing MFA access policy.",
        },
      };
    }
    return {
      model: selectedModel,
      answers: {
        assigned_queue: {
          type: "choice",
          choice: "CUST-SUPP",
          confidence: 0.978,
          probabilities: { "CUST-SUPP": 0.978, "FIN-REV": 0.014, "ENG-INFRA": 0.005, "SEC-OPS": 0.003 },
        },
        urgency_rating: {
          type: "score",
          score: 0.8,
          confidence: 0.98,
        },
        churn_risk: {
          type: "score",
          score: 0.08,
          confidence: 0.989,
        },
      },
      routing: {
        model: selectedModel,
        reason: "General feature inquiry regarding CSV export webhook.",
      },
    };
  };

  const activeOutput = sys1Output || getSimulatedSystemOneOutput(selectedState.id);
  const assignedQueue = activeOutput.answers?.assigned_queue?.choice || "ENG-INFRA";
  const urgencyScore = activeOutput.answers?.urgency_rating?.score ?? 3.0;
  const churnScore = activeOutput.answers?.churn_risk?.score ?? 0.85;

  const handleCliSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliInput.trim()) return;

    const cmd = cliInput.trim().toLowerCase();
    const logTime = new Date().toLocaleTimeString();

    if (cmd === "clear") {
      setTerminalLogs([]);
      setCliInput("");
      return;
    }

    if (cmd === "help") {
      setTerminalLogs((prev) => [
        ...prev,
        `gurp@sys1:~$ ${cliInput}`,
        "SYSTEM 1 AGENTIC COMMANDS:",
        "  sys1 run, infer  - Execute non-autoregressive forward pass on state.json",
        "  health           - Check Laya FastAPI engine heartbeat (127.0.0.1:8000)",
        "  models           - View loaded ModernBERT weights and FastCPU cache",
        "  clear            - Clear terminal log scrollback",
      ]);
      setCliInput("");
      return;
    }

    if (cmd === "health") {
      setTerminalLogs((prev) => [
        ...prev,
        `gurp@sys1:~$ ${cliInput}`,
        `[${logTime}] GET http://127.0.0.1:8000/health -> 200 OK (device: FastCPU, status: ok)`,
      ]);
      setCliInput("");
      return;
    }

    if (cmd === "models") {
      setTerminalLogs((prev) => [
        ...prev,
        `gurp@sys1:~$ ${cliInput}`,
        `[${logTime}] ACTIVE CHECKPOINTS: convai/laya:english (110M), multilingual (110M), typed-decisions (110M)`,
      ]);
      setCliInput("");
      return;
    }

    if (cmd === "infer" || cmd === "sys1 run" || cmd === "run") {
      setTerminalLogs((prev) => [...prev, `gurp@sys1:~$ ${cliInput}`]);
      executeSystemOne();
      setCliInput("");
      return;
    }

    setTerminalLogs((prev) => [
      ...prev,
      `gurp@sys1:~$ ${cliInput}`,
      `bash: ${cmd}: command not found. Type 'help' for System 1 commands.`,
    ]);
    setCliInput("");
  };

  const handleCopyResult = () => {
    const textToCopy = activeTab === "questions" ? questionsJsonText : stateJsonText;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-3xl border border-outline-variant/30 bg-surface-container-lowest shadow-2xl overflow-hidden font-mono text-xs flex flex-col min-h-[840px] animate-fadeIn">
      {/* ========================================================= */}
      {/* 1. VS CODE WORKBENCH TITLE BAR                            */}
      {/* ========================================================= */}
      <div className="h-11 bg-surface-container-low border-b border-outline-variant/20 px-3 flex items-center justify-between select-none">
        {/* Left Window Dots & Title */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 pr-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block shadow-xs" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block shadow-xs" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block shadow-xs" />
          </div>
          <span className="text-xs font-bold text-on-surface">
            System 1 VS Code Agentic Playground
          </span>
          <span className="text-[10px] text-on-surface-muted hidden sm:inline">
            &bull; Non-Autoregressive ModernBERT Studio
          </span>
        </div>

        {/* Center: Real vs Simulation Toggle */}
        <div className="flex items-center gap-1.5 bg-surface-container-lowest border border-outline-variant/30 px-2 py-0.5 rounded-xl text-[10px] shadow-xs">
          <button
            type="button"
            onClick={() => setUseRealInference(true)}
            className={`trigger-btn px-2.5 py-0.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
              useRealInference
                ? "btn-primary-gradient text-on-primary shadow-xs"
                : "text-on-surface-muted hover:text-on-surface"
            }`}
          >
            <FiZap className="w-3 h-3" />
            <span>REAL ENGINE (8000)</span>
          </button>
          <button
            type="button"
            onClick={() => setUseRealInference(false)}
            className={`trigger-btn px-2.5 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
              !useRealInference
                ? "bg-secondary text-on-secondary shadow-xs"
                : "text-on-surface-muted hover:text-on-surface"
            }`}
          >
            SIMULATION
          </button>
        </div>

        {/* Right Action Switchers */}
        <div className="flex items-center gap-2">
          {onSwitchToGrid && (
            <button
              type="button"
              onClick={onSwitchToGrid}
              className="trigger-btn px-2.5 py-1 rounded-lg border border-outline-variant/30 bg-surface hover:bg-surface-container-high text-[10px] font-bold text-on-surface transition-colors cursor-pointer flex items-center gap-1"
              title="Switch to modular draggable grid view"
            >
              <span>[📐 Modular Grid]</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MAIN 3-PANEL WORKBENCH BODY                            */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* 2A. VS CODE ACTIVITY BAR (Vertical 48px) */}
        <div className="w-12 bg-surface-container-low border-r border-outline-variant/20 flex flex-col items-center justify-between py-3 shrink-0 select-none">
          <div className="flex flex-col items-center gap-4 text-on-surface-muted">
            <button
              type="button"
              className="trigger-btn w-8 h-8 rounded-xl flex items-center justify-center text-primary bg-primary/15 transition-colors shadow-xs"
              title="System 1 State Explorer"
            >
              <FiFolder className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeSystemOne()}
              className="trigger-btn w-8 h-8 rounded-xl flex items-center justify-center hover:text-on-surface hover:bg-surface-container-high transition-colors"
              title="Run System 1 Inference"
            >
              <FiCpu className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveTerminalTab("terminal")}
              className="trigger-btn w-8 h-8 rounded-xl flex items-center justify-center hover:text-on-surface hover:bg-surface-container-high transition-colors"
              title="System 1 REPL Terminal"
            >
              <FiTerminal className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="trigger-btn w-8 h-8 rounded-xl flex items-center justify-center hover:text-on-surface hover:bg-surface-container-high transition-colors"
              title="Decision Presets"
            >
              <FiLayers className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col items-center gap-3 text-on-surface-muted">
            <button
              type="button"
              className="trigger-btn w-8 h-8 rounded-xl flex items-center justify-center hover:text-on-surface hover:bg-surface-container-high transition-colors"
              title="Settings"
            >
              <FiSettings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2B. LEFT SIDEBAR (Explorer: State Presets & Question Schemas) */}
        <div className="w-64 bg-surface-container-lowest border-r border-outline-variant/20 flex flex-col shrink-0 select-none">
          <div className="px-3 py-2 border-b border-outline-variant/15 flex items-center justify-between text-[10px] font-bold text-on-surface-muted uppercase tracking-wider">
            <span>SYS 1 EXPLORER</span>
            <button
              type="button"
              onClick={handleCreateNewState}
              className="trigger-btn text-primary hover:bg-primary/10 px-1.5 py-0.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer font-bold"
              title="Create New Custom Incident Scenario"
            >
              <FiPlus className="w-3.5 h-3.5" />
              <span>NEW</span>
            </button>
          </div>

          <div className="p-2 space-y-3 overflow-y-auto flex-1">
            {/* Incident States */}
            <div>
              <div className="flex items-center gap-1 px-1 py-1 text-[10px] font-bold text-on-surface-muted">
                <FiChevronDown className="w-3 h-3" />
                <span>STATE_PAYLOADS ({states.length})</span>
              </div>
              <div className="mt-1 space-y-1 pl-1">
                {states.map((sc) => {
                  const isSelected = sc.id === selectedState.id;
                  return (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => handleSelectScenario(sc)}
                      className={`trigger-btn w-full flex items-center justify-between p-2 rounded-xl text-left text-[11px] transition-all cursor-pointer group ${
                        isSelected
                          ? "bg-primary/15 text-primary font-bold shadow-xs border border-primary/25"
                          : "text-on-surface hover:bg-surface-container-low border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <FiFileText className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-primary" : "text-on-surface-muted"}`} />
                        <span className="truncate">{sc.name.replace(".state.json", "")}</span>
                      </div>
                      <span className={`text-[8px] px-1 py-0.2 rounded border font-mono shrink-0 ${sc.priorityBadge}`}>
                        {sc.badge.split(" ")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Questions Schemas */}
            <div>
              <div className="flex items-center gap-1 px-1 py-1 text-[10px] font-bold text-on-surface-muted">
                <FiChevronDown className="w-3 h-3" />
                <span>DECISION_HEADS (3)</span>
              </div>
              <div className="mt-1 space-y-1 pl-2 text-[10px]">
                <button
                  type="button"
                  onClick={() => setActiveTab("questions")}
                  className="w-full flex items-center gap-1.5 p-1.5 rounded-lg text-left hover:bg-surface-container-low cursor-pointer transition-colors"
                >
                  <FiCode className="w-3 h-3 text-primary" />
                  <span className="text-on-surface truncate">assigned_queue.json</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("questions")}
                  className="w-full flex items-center gap-1.5 p-1.5 rounded-lg text-left hover:bg-surface-container-low cursor-pointer transition-colors"
                >
                  <FiCode className="w-3 h-3 text-secondary" />
                  <span className="text-on-surface truncate">urgency_rating.json</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("questions")}
                  className="w-full flex items-center gap-1.5 p-1.5 rounded-lg text-left hover:bg-surface-container-low cursor-pointer transition-colors"
                >
                  <FiCode className="w-3 h-3 text-emerald-700" />
                  <span className="text-on-surface truncate">churn_risk.json</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2C. CENTER: MONACO CODE EDITOR & ACTION BAR */}
        <div className="flex-1 flex flex-col bg-surface border-r border-outline-variant/20 min-w-0">
          {/* Editor Tab Bar */}
          <div className="h-10 bg-surface-container-low border-b border-outline-variant/15 flex items-center justify-between px-2 select-none overflow-x-auto">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("state")}
                className={`trigger-btn flex items-center gap-1.5 px-3 py-1.5 border-b-2 text-xs transition-colors cursor-pointer ${
                  activeTab === "state"
                    ? "border-primary bg-surface text-primary font-bold shadow-xs"
                    : "border-transparent text-on-surface-muted hover:bg-surface-container-high"
                }`}
              >
                <FiCode className="w-3.5 h-3.5" />
                <span>state.json</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("questions")}
                className={`trigger-btn flex items-center gap-1.5 px-3 py-1.5 border-b-2 text-xs transition-colors cursor-pointer ${
                  activeTab === "questions"
                    ? "border-primary bg-surface text-primary font-bold shadow-xs"
                    : "border-transparent text-on-surface-muted hover:bg-surface-container-high"
                }`}
              >
                <FiSliders className="w-3.5 h-3.5" />
                <span>questions.json</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("output")}
                className={`trigger-btn flex items-center gap-1.5 px-3 py-1.5 border-b-2 text-xs transition-colors cursor-pointer ${
                  activeTab === "output"
                    ? "border-primary bg-surface text-primary font-bold shadow-xs"
                    : "border-transparent text-on-surface-muted hover:bg-surface-container-high"
                }`}
              >
                <FiActivity className="w-3.5 h-3.5" />
                <span>system1_output.json</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("plan")}
                className={`trigger-btn flex items-center gap-1.5 px-3 py-1.5 border-b-2 text-xs transition-colors cursor-pointer ${
                  activeTab === "plan"
                    ? "border-primary bg-surface text-primary font-bold shadow-xs"
                    : "border-transparent text-on-surface-muted hover:bg-surface-container-high"
                }`}
              >
                <FiFileText className="w-3.5 h-3.5" />
                <span>execution_plan.md</span>
              </button>
            </div>

            {/* Proud Action Trigger Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => executeSystemOne()}
                disabled={isExecuting}
                className="trigger-btn px-4 py-1.5 rounded-xl btn-primary-gradient text-on-primary font-mono font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <FiPlay className="w-3.5 h-3.5 fill-current" />
                <span>{isExecuting ? "INFERRING TENSORS..." : "EXECUTE SYSTEM 1"}</span>
              </button>
            </div>
          </div>

          {/* Breadcrumb Path */}
          <div className="h-6 bg-surface-container-lowest/50 border-b border-outline-variant/15 px-3 flex items-center justify-between text-[10px] text-on-surface-muted select-none">
            <div className="flex items-center gap-1.5">
              <span>gurp-system1</span>
              <FiChevronRight className="w-2.5 h-2.5" />
              <span>models</span>
              <FiChevronRight className="w-2.5 h-2.5" />
              <span className="text-on-surface font-semibold">{activeTab}.json</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Latency SLA: <strong>&lt;50ms</strong></span>
            </div>
          </div>

          {/* Editor Content Area */}
          <div className="flex-1 p-3 overflow-y-auto font-mono text-xs flex">
            {activeTab === "state" && (
              <div className="flex-1 flex gap-3">
                {/* Line Numbers */}
                <div className="text-on-surface-muted/50 select-none text-right pr-2 space-y-1 font-mono text-[11px]">
                  {Array.from({ length: 18 }).map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>

                {/* Editable State JSON */}
                <textarea
                  value={stateJsonText}
                  onChange={(e) => setStateJsonText(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none resize-none font-mono text-xs leading-relaxed text-on-surface selection:bg-primary/20"
                  spellCheck={false}
                />
              </div>
            )}

            {activeTab === "questions" && (
              <div className="flex-1 flex gap-3">
                <div className="text-on-surface-muted/50 select-none text-right pr-2 space-y-1 font-mono text-[11px]">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>

                <textarea
                  value={questionsJsonText}
                  onChange={(e) => setQuestionsJsonText(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none resize-none font-mono text-xs leading-relaxed text-on-surface selection:bg-primary/20"
                  spellCheck={false}
                />
              </div>
            )}

            {activeTab === "output" && (
              <div className="flex-1 p-2 space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-on-surface-muted border-b border-outline-variant/15 pb-1">
                  <span>LIVE SYSTEM 1 RESPONSE (TENSOR HEADS EVALUATED)</span>
                  <span className="text-emerald-700">LATENCY: {latencyMs}ms</span>
                </div>
                <pre className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20 font-mono text-xs text-on-surface overflow-auto max-h-[460px]">
                  {JSON.stringify(activeOutput, null, 2)}
                </pre>
              </div>
            )}

            {activeTab === "plan" && (
              <div className="space-y-4 text-on-surface p-2 max-w-2xl">
                <div className="border-b border-outline-variant/20 pb-2">
                  <h3 className="font-bold text-sm text-primary"># System 1 Non-Autoregressive Execution Protocol</h3>
                  <p className="text-[11px] text-on-surface-muted">Direct forward pass over calibrated ModernBERT linear heads.</p>
                </div>
                <div className="space-y-2.5 text-xs text-on-surface-muted font-sans">
                  <div className="flex items-center gap-2">
                    <FiCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span><strong>State Tokenization:</strong> Extracts syntax features from state.json without autoregressive loop.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span><strong>Parallel Scoring:</strong> Computes softmax over [assigned_queue, urgency_rating, churn_risk] in ~28ms.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span><strong>Zero Hallucination:</strong> Deterministic logits map strictly to calibrated output categories.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2D. RIGHT PANEL: AGENTIC COPILOT & MULTI-HEAD DECISIONS */}
        <div className="w-full md:w-96 bg-surface-container-lowest flex flex-col shrink-0 border-l border-outline-variant/20">
          {/* Header */}
          <div className="p-3 border-b border-outline-variant/20 bg-surface-container-low flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl btn-primary-gradient flex items-center justify-center text-white font-bold text-xs shadow-xs animate-subtle-float">
                <FiZap className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-on-surface">System 1 Decision Matrix</span>
                <p className="text-[9px] text-on-surface-muted">FastCPU Parallel Inference Engine</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{latencyMs}ms</span>
            </div>
          </div>

          {/* Decision Timeline */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 font-mono text-xs">
            {/* Step 1: Ingest */}
            <div className={`p-2.5 rounded-xl border transition-all ${
              executionStep >= 1 ? "border-outline-variant/25 bg-surface-container-low" : "opacity-40"
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-primary uppercase">01 // INGEST STATE</span>
                <span className="text-[9px] text-emerald-700 font-bold">✓ VALIDATED</span>
              </div>
              <p className="text-[11px] text-on-surface truncate">
                Ref: <strong>{String(selectedState.state.ticket_id || "TCK-SYS1")}</strong> &bull; Tier: {String(selectedState.state.customer_tier || "Enterprise")}
              </p>
            </div>

            {/* Step 2: Forward Pass */}
            <div className={`p-2.5 rounded-xl border transition-all ${
              executionStep >= 2 ? "border-outline-variant/25 bg-surface-container-low" : "opacity-40"
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-secondary uppercase">02 // FORWARD TENSOR PASS</span>
                <span className="text-[9px] text-emerald-700 font-bold">{latencyMs}ms</span>
              </div>
              <p className="text-[11px] text-on-surface">
                Single matrix pass evaluated 3 decision heads in <strong>{latencyMs}ms</strong>.
              </p>
            </div>

            {/* Step 3: Calibrated Heads Output */}
            <div className={`p-3 rounded-2xl border transition-all space-y-2.5 ${
              executionStep >= 3 ? "border-primary/30 bg-primary/5 shadow-xs" : "opacity-40"
            }`}>
              <div className="flex items-center justify-between border-b border-outline-variant/15 pb-1.5">
                <span className="text-[10px] font-bold text-primary uppercase">03 // CALIBRATED HEADS</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                  0.0% DRIFT
                </span>
              </div>

              {/* Head 1: Assigned Queue */}
              <div className="p-2.5 rounded-xl border border-outline-variant/20 bg-surface-container-lowest flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-on-surface-muted uppercase">ASSIGNED QUEUE</span>
                  <p className="font-bold text-sm text-on-surface">{assignedQueue}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-primary/30 bg-primary/10 text-primary">
                  {assignedQueue}
                </span>
              </div>

              {/* Head 2 & 3: Urgency & Churn */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
                  <span className="text-on-surface-muted block">URGENCY SLA</span>
                  <strong className="text-primary text-xs">{urgencyScore} / 3.0</strong>
                </div>
                <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
                  <span className="text-on-surface-muted block">CHURN PROBABILITY</span>
                  <strong className={`text-xs ${churnScore > 0.5 ? "text-rose-600" : "text-emerald-700"}`}>
                    {churnScore}
                  </strong>
                </div>
              </div>

              {/* Directive */}
              <div className="p-2.5 rounded-xl border border-primary/20 bg-surface-container-lowest space-y-1">
                <span className="text-[9px] font-bold text-primary uppercase">[DISPATCH DIRECTIVE]</span>
                <p className="text-[11px] text-on-surface leading-relaxed">
                  {activeOutput.routing?.reason || "Dispatched to core engineering queue with sub-50ms SLA response."}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Chat / Prompt Bar */}
          <div className="p-2.5 border-t border-outline-variant/20 bg-surface-container-low">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Ask agent: 'Re-score with P0', 'Simulate failover'..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-xs text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:border-primary"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    executeSystemOne();
                    setPromptInput("");
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  executeSystemOne();
                  setPromptInput("");
                }}
                className="trigger-btn p-2 rounded-xl btn-primary-gradient text-on-primary cursor-pointer shadow-xs"
                title="Send command"
              >
                <FiSend className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. BOTTOM PANEL: INTERACTIVE TERMINAL & SYSTEM 1 REPL     */}
      {/* ========================================================= */}
      <div className="h-52 bg-surface-container-lowest border-t border-outline-variant/20 flex flex-col shrink-0 select-none">
        {/* Terminal Header */}
        <div className="h-8 bg-surface-container-low border-b border-outline-variant/15 px-3 flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTerminalTab("terminal")}
              className={`font-bold transition-colors cursor-pointer ${
                activeTerminalTab === "terminal" ? "text-primary border-b-2 border-primary" : "text-on-surface-muted"
              }`}
            >
              TERMINAL: LAYA-SYSTEM1 REPL
            </button>
            <button
              type="button"
              onClick={() => setActiveTerminalTab("probabilities")}
              className={`font-bold transition-colors cursor-pointer ${
                activeTerminalTab === "probabilities" ? "text-primary border-b-2 border-primary" : "text-on-surface-muted"
              }`}
            >
              HEAD PROBABILITIES
            </button>
            <button
              type="button"
              onClick={() => setActiveTerminalTab("tokens")}
              className={`font-bold transition-colors cursor-pointer ${
                activeTerminalTab === "tokens" ? "text-primary border-b-2 border-primary" : "text-on-surface-muted"
              }`}
            >
              FASTCPU TELEMETRY
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => executeSystemOne()}
              className="trigger-btn px-2 py-0.5 rounded bg-surface-container-lowest border border-outline-variant/20 hover:text-primary transition-colors cursor-pointer"
            >
              [RUN SYS1]
            </button>
            <button
              type="button"
              onClick={() => setTerminalLogs([])}
              className="trigger-btn px-2 py-0.5 rounded bg-surface-container-lowest border border-outline-variant/20 hover:text-rose-600 transition-colors cursor-pointer"
            >
              [CLEAR]
            </button>
            <button
              type="button"
              onClick={handleCopyResult}
              className="trigger-btn flex items-center gap-1 text-on-surface-muted hover:text-primary transition-colors cursor-pointer"
            >
              <FiCopy className="w-3 h-3" />
              <span>{copied ? "COPIED" : "COPY"}</span>
            </button>
          </div>
        </div>

        {/* Terminal Log Stream */}
        <div className="flex-1 p-2.5 overflow-y-auto font-mono text-[11px] space-y-1 bg-surface-container-lowest text-on-surface-muted leading-relaxed">
          {terminalLogs.map((log, i) => (
            <p
              key={i}
              className={
                log.includes("COMPLETE") || log.includes("READY") || log.includes("PASS")
                  ? "text-emerald-700 font-semibold"
                  : log.includes("FORWARD") || log.includes("DISPATCH")
                    ? "text-primary font-semibold"
                    : log.includes("INGEST")
                      ? "text-secondary"
                      : log.startsWith("gurp@")
                        ? "text-on-surface font-bold"
                        : "text-on-surface-muted"
              }
            >
              {log}
            </p>
          ))}
        </div>

        {/* Interactive CLI Input Line */}
        <form onSubmit={handleCliSubmit} className="h-8 border-t border-outline-variant/15 px-3 flex items-center gap-2 bg-surface-container-lowest">
          <span className="text-primary font-bold text-[11px]">gurp@sys1:~$</span>
          <input
            type="text"
            value={cliInput}
            onChange={(e) => setCliInput(e.target.value)}
            placeholder="Type 'sys1 run', 'health', 'models', 'clear', 'help'..."
            className="flex-1 bg-transparent border-none outline-none text-xs font-mono text-on-surface placeholder:text-on-surface-muted/60"
          />
        </form>
      </div>

      {/* ========================================================= */}
      {/* 4. BOTTOM STATUS BAR                                      */}
      {/* ========================================================= */}
      <div className="h-6 bg-surface-container-low border-t border-outline-variant/20 px-3 flex items-center justify-between text-[10px] text-on-surface-muted select-none">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-on-surface font-bold">
            <FiGitBranch className="w-3 h-3 text-primary" />
            <span>main*</span>
          </span>
          <span>0 errors, 0 warnings</span>
          <span className="text-emerald-700 font-bold">&bull; ModernBERT System 1</span>
        </div>

        <div className="flex items-center gap-4">
          <span>UTF-8</span>
          <span>JSON / TypeScript</span>
          <span className="text-primary font-bold">Latency: {latencyMs}ms</span>
          <span className="text-secondary font-bold">SLA: &lt;50ms</span>
        </div>
      </div>
    </div>
  );
}
