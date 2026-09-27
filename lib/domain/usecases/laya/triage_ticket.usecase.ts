import { getLayaBaseUrl } from "@/lib/domain/usecases/laya/get_laya_base_url.usecase";
import { runSystemOne } from "@/lib/domain/usecases/laya/run_system_one.usecase";
import type {
  LayaTicketTriageRequest,
  LayaTicketTriageResponse,
  LayaQuestionDefinition,
} from "@/lib/entities/laya.type";

const DEFAULT_TRIAGE_QUESTIONS: Record<string, LayaQuestionDefinition> = {
  queue: {
    type: "choice",
    instructions: "Which engineering or support department should handle this ticket?",
    criteria: {
      infrastructure: "server outages, network downtime, database failures, latency spikes",
      billing: "refunds, SLA credits, invoice disputes, payment processing errors",
      security: "unauthorized access, vulnerabilities, credential leaks, data breaches",
      support: "general questions, documentation requests, feature guidance, login issues",
    },
  },
  urgency: {
    type: "score",
    instructions: "Rate how urgent this ticket is based on business disruption and user impact.",
    criteria: ["low priority", "medium priority", "high priority", "critical blocker"],
  },
  churn_risk: {
    type: "noul",
    instructions: "Does the customer express intent to cancel, request a refund, or threaten to switch providers?",
  },
  sentiment: {
    type: "choice",
    instructions: "What is the emotional tone and frustration level of the customer?",
    criteria: {
      positive: "satisfied, grateful, appreciative tone",
      neutral: "factual, objective, transactional inquiry",
      frustrated: "annoyed, experiencing recurring issues, expressing dissatisfaction",
      angry: "hostile, demanding escalation, aggressive demands",
    },
  },
};

function calculatePriority(urgency: number, churn: number): "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" {
  if (urgency >= 0.75 || (urgency >= 0.5 && churn >= 0.6)) return "CRITICAL";
  if (urgency >= 0.5 || churn >= 0.5) return "HIGH";
  if (urgency >= 0.25) return "MEDIUM";
  return "LOW";
}

function generateRecommendation(queue: string, priority: string, churn: number): string {
  if (priority === "CRITICAL") {
    return `Immediate on-call page to ${queue.toUpperCase()} lead; notify Customer Success.`;
  }
  if (churn >= 0.5) {
    return `Route to ${queue} with senior support representative; trigger retention outreach.`;
  }
  if (priority === "HIGH") {
    return `Assign to ${queue} queue with 2-hour SLA response target.`;
  }
  return `Standard routing to ${queue} queue.`;
}

export async function triageTicket(
  ticket: LayaTicketTriageRequest
): Promise<LayaTicketTriageResponse> {
  const baseUrl = getLayaBaseUrl();

  // 1. Try dedicated /ticket/triage endpoint first
  try {
    const res = await fetch(`${baseUrl}/ticket/triage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ticket),
      cache: "no-store",
    });

    if (res.ok) {
      return (await res.json()) as LayaTicketTriageResponse;
    }
  } catch {
    // Fall back to /v1/systemone below
  }

  // 2. Fall back to standard /v1/systemone (supported natively by laya-serve)
  const systemOneRes = await runSystemOne({
    state: {
      ticket_id: ticket.ticket_id || "TCK-LIVE",
      customer: ticket.customer || "standard_user",
      subject: ticket.subject,
      body: ticket.body,
      ...(ticket.metadata || {}),
    },
    questions: DEFAULT_TRIAGE_QUESTIONS,
    model: ticket.model,
  });

  const answers = systemOneRes.answers || {};
  const queueChoice = answers.queue?.choice || "support";
  const urgencyVal = answers.urgency?.score ?? 0.0;
  const churnVal = answers.churn_risk?.noul ?? 0.0;
  const sentimentChoice = answers.sentiment?.choice || "neutral";

  // Urgency score from laya score rubric is 0-3; normalize to priority calculation
  const normalizedUrgency = urgencyVal > 1.0 ? urgencyVal / 3.0 : urgencyVal;
  const priority = calculatePriority(normalizedUrgency, churnVal);
  const recommendation = generateRecommendation(queueChoice, priority, churnVal);

  return {
    ticket_id: ticket.ticket_id,
    routing_decision: systemOneRes.routing?.model || "default",
    assigned_queue: queueChoice,
    urgency_score: Number(urgencyVal.toFixed(4)),
    priority_level: priority,
    churn_risk: `${(churnVal * 100).toFixed(1)}%`,
    churn_risk_score: Number(churnVal.toFixed(4)),
    sentiment: sentimentChoice,
    action_recommendation: recommendation,
    raw: systemOneRes as unknown as Record<string, unknown>,
  };
}
