import { getLayaBaseUrl } from "@/lib/domain/usecases/laya/get_laya_base_url.usecase";
import { runSystemOne } from "@/lib/domain/usecases/laya/run_system_one.usecase";
import type {
  LayaTicketUrgencyRequest,
  LayaTicketUrgencyResponse,
  LayaQuestionDefinition,
} from "@/lib/entities/laya.type";

const URGENCY_QUESTIONS: Record<string, LayaQuestionDefinition> = {
  urgency: {
    type: "score",
    instructions: "Evaluate how severely this issue disrupts business operations or user workflow.",
    criteria: [
      "minor cosmetic issue with no operational impact",
      "moderate issue with available workarounds",
      "major degradation affecting business operations",
      "catastrophic total outage or critical blocker",
    ],
  },
  churn_risk: {
    type: "noul",
    instructions: "Is there severe danger of the customer terminating their account or requesting an immediate full refund?",
  },
};

export async function scoreTicketUrgency(
  req: LayaTicketUrgencyRequest
): Promise<LayaTicketUrgencyResponse> {
  const baseUrl = getLayaBaseUrl();

  try {
    const res = await fetch(`${baseUrl}/ticket/urgency`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
      cache: "no-store",
    });

    if (res.ok) {
      return (await res.json()) as LayaTicketUrgencyResponse;
    }
  } catch {
    // Fall back to /v1/systemone
  }

  const sysOne = await runSystemOne({
    state: {
      ticket_id: req.ticket_id || "TCK-URGENT",
      subject: req.subject,
      body: req.body,
    },
    questions: URGENCY_QUESTIONS,
    model: req.model,
  });

  const urgencyVal = sysOne.answers?.urgency?.score ?? 0.0;
  const churnVal = sysOne.answers?.churn_risk?.noul ?? 0.0;
  const normalized = urgencyVal > 1.0 ? urgencyVal / 3.0 : urgencyVal;

  let priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" = "LOW";
  let slaRisk = "MINIMAL";

  if (normalized >= 0.75) {
    priority = "CRITICAL";
    slaRisk = "HIGH_BREACH_RISK";
  } else if (normalized >= 0.5) {
    priority = "HIGH";
    slaRisk = "MODERATE_BREACH_RISK";
  } else if (normalized >= 0.25) {
    priority = "MEDIUM";
    slaRisk = "NORMAL";
  }

  return {
    ticket_id: req.ticket_id,
    urgency_score: Number(urgencyVal.toFixed(4)),
    priority_level: priority,
    churn_risk: `${(churnVal * 100).toFixed(1)}%`,
    churn_risk_score: Number(churnVal.toFixed(4)),
    sla_risk: slaRisk,
  };
}
