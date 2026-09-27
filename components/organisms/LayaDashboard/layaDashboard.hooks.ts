"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import type {
  LayaTicketTriageRequest,
  LayaTicketTriageResponse,
  LayaTicketUrgencyResponse,
  LayaHealthResponse,
  LayaModelStatusResponse,
  LayaBatchTicketResponse,
  LayaPresetsResponse,
  LayaSystemOneResponse,
} from "@/lib/entities/laya.type";
import {
  checkLayaHealthAction,
  triageTicketAction,
  scoreTicketUrgencyAction,
  batchTriageTicketsAction,
  runSystemOneAction,
  getLayaModelsAction,
  loadLayaModelAction,
  unloadLayaModelAction,
  getLayaPresetsAction,
  createLayaPresetAction,
} from "@/lib/domain/actions/laya.actions";

export const SAMPLE_TEMPLATES = [
  {
    label: "Critical Outage (Infra)",
    badge: "Outage",
    data: {
      ticket_id: "TCK-9901",
      customer: "enterprise_acme_corp",
      subject: "Primary database cluster failing with 500 across all regions",
      body: "Our production API has been completely down for 20 minutes. All read/write database transactions are throwing timeout errors. Customers are unable to checkout. We demand an immediate emergency escalation and SLA refund.",
    },
  },
  {
    label: "Billing Dispute (Churn Risk)",
    badge: "Billing",
    data: {
      ticket_id: "TCK-8821",
      customer: "growth_tier_user",
      subject: "Unauthorized recurring charge and SLA credit dispute",
      body: "We were charged $4,500 on our invoice despite having canceled our add-on seats last month. If this is not refunded and corrected within 24 hours, we will immediately cancel our entire annual enterprise contract and move to your competitor.",
    },
  },
  {
    label: "Security Incident",
    badge: "Security",
    data: {
      ticket_id: "TCK-7714",
      customer: "fintech_sec_lead",
      subject: "Suspicious API access token observed from unauthorized IP",
      body: "Our automated SIEM detected a credential leak and unusual bulk queries using one of our production service tokens from an unknown foreign IP address. Please immediately revoke and investigate potential compromised access.",
    },
  },
  {
    label: "General Inquiry",
    badge: "Support",
    data: {
      ticket_id: "TCK-5502",
      customer: "starter_dev",
      subject: "How do I configure Webhook endpoints in the new dashboard?",
      body: "Hi team, I am trying to setup a webhook for successful subscription events, but I cannot locate the signing secret in the settings page. Could you point me to the relevant documentation?",
    },
  },
];

export function useLayaDashboard() {
  const [activeTab, setActiveTab] = useState<"triage" | "batch" | "systemone" | "models">("triage");
  const [health, setHealth] = useState<LayaHealthResponse | null>(null);
  const [modelStatus, setModelStatus] = useState<LayaModelStatusResponse | null>(null);
  const [presets, setPresets] = useState<LayaPresetsResponse | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // Form State
  const [ticketForm, setTicketForm] = useState<LayaTicketTriageRequest>(SAMPLE_TEMPLATES[0].data);
  const [triageMode, setTriageMode] = useState<"full" | "urgency_only">("full");
  const [selectedModel, setSelectedModel] = useState<string>("english");

  // Results State
  const [triageResult, setTriageResult] = useState<LayaTicketTriageResponse | null>(null);
  const [urgencyResult, setUrgencyResult] = useState<LayaTicketUrgencyResponse | null>(null);
  const [batchResult, setBatchResult] = useState<LayaBatchTicketResponse | null>(null);
  const [systemOneResult, setSystemOneResult] = useState<LayaSystemOneResponse | null>(null);

  // System 1 Playground State
  const [sysStateJson, setSysStateJson] = useState(
    JSON.stringify(
      {
        ticket_id: "TCK-102",
        subject: "Cannot connect to server",
        body: "I get connection refused error",
      },
      null,
      2
    )
  );
  const [sysQuestionsJson, setSysQuestionsJson] = useState(
    JSON.stringify(
      {
        is_urgent: {
          type: "score",
          instructions: "Rate how urgent this request is.",
          criteria: ["low", "medium", "high", "critical"],
        },
        category: {
          type: "choice",
          instructions: "Which category does this fall under?",
          criteria: {
            network: "connectivity, timeouts, DNS issues",
            account: "passwords, logins, permissions",
          },
        },
      },
      null,
      2
    )
  );

  const [isPending, startTransition] = useTransition();
  const [notice, setNotice] = useState<string | null>(null);

  const refreshHealth = useCallback(() => {
    startTransition(async () => {
      try {
        setServerError(null);
        const h = await checkLayaHealthAction();
        setHealth(h);
        const m = await getLayaModelsAction();
        setModelStatus(m);
        const p = await getLayaPresetsAction();
        setPresets(p);
      } catch (err) {
        setServerError(err instanceof Error ? err.message : "Cannot reach Laya Server at http://localhost:8000");
      }
    });
  }, []);

  useEffect(() => {
    refreshHealth();
  }, [refreshHealth]);

  const handleTriage = () => {
    startTransition(async () => {
      try {
        setServerError(null);
        if (triageMode === "full") {
          const res = await triageTicketAction({
            ...ticketForm,
            model: selectedModel,
          });
          setTriageResult(res);
          setUrgencyResult(null);
        } else {
          const res = await scoreTicketUrgencyAction({
            ticket_id: ticketForm.ticket_id,
            subject: ticketForm.subject,
            body: ticketForm.body,
            model: selectedModel,
          });
          setUrgencyResult(res);
          setTriageResult(null);
        }
      } catch (err) {
        setServerError(err instanceof Error ? err.message : "Inference failed");
      }
    });
  };

  const handleBatchTriage = (tickets: LayaTicketTriageRequest[]) => {
    startTransition(async () => {
      try {
        setServerError(null);
        const res = await batchTriageTicketsAction({
          tickets,
          model: selectedModel,
        });
        setBatchResult(res);
      } catch (err) {
        setServerError(err instanceof Error ? err.message : "Batch inference failed");
      }
    });
  };

  const handleRunSystemOne = () => {
    startTransition(async () => {
      try {
        setServerError(null);
        const parsedState = JSON.parse(sysStateJson);
        const parsedQuestions = JSON.parse(sysQuestionsJson);
        const res = await runSystemOneAction({
          state: parsedState,
          questions: parsedQuestions,
          model: selectedModel,
        });
        setSystemOneResult(res);
      } catch (err) {
        setServerError(err instanceof Error ? err.message : "Invalid JSON or execution error");
      }
    });
  };

  const handleLoadModel = (modelName: string) => {
    startTransition(async () => {
      try {
        setServerError(null);
        const res = await loadLayaModelAction({ model_name: modelName });
        setNotice(res.message);
        refreshHealth();
      } catch (err) {
        setServerError(err instanceof Error ? err.message : "Failed to load model");
      }
    });
  };

  const handleUnloadModel = (modelName?: string) => {
    startTransition(async () => {
      try {
        setServerError(null);
        const res = await unloadLayaModelAction({ model_name: modelName });
        setNotice(res.message);
        refreshHealth();
      } catch (err) {
        setServerError(err instanceof Error ? err.message : "Failed to unload model");
      }
    });
  };

  return {
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
    setNotice,
    refreshHealth,
    handleTriage,
    handleBatchTriage,
    handleRunSystemOne,
    handleLoadModel,
    handleUnloadModel,
  };
}
