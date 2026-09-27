import { getLayaBaseUrl } from "@/lib/domain/usecases/laya/get_laya_base_url.usecase";
import type { LayaPresetsResponse } from "@/lib/entities/laya.type";

export async function getLayaPresets(): Promise<LayaPresetsResponse> {
  const baseUrl = getLayaBaseUrl();

  try {
    const res = await fetch(`${baseUrl}/models/presets`, {
      cache: "no-store",
    });

    if (res.ok) {
      return (await res.json()) as LayaPresetsResponse;
    }
  } catch {
    // fallback
  }

  return {
    built_in_presets: {
      triage: ["intent", "is_urgent", "frustration", "refund_requested", "churn_risk"],
      email: ["category", "is_spam", "is_phishing", "urgency", "needs_reply"],
      guard: ["jailbreak", "prompt_injection", "sensitive_data", "harm_severity", "topic"],
      moderation: ["toxic", "harassment", "threat", "spam", "severity"],
      router: ["difficulty", "domain", "needs_tools", "is_sensitive"],
    },
    custom_presets: {},
    total_custom_presets: 0,
  };
}
