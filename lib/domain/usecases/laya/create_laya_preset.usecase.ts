import { getLayaBaseUrl } from "@/lib/domain/usecases/laya/get_laya_base_url.usecase";
import type { LayaCustomPresetRequest, LayaCustomPresetResponse } from "@/lib/entities/laya.type";

export async function createLayaPreset(
  req: LayaCustomPresetRequest
): Promise<LayaCustomPresetResponse> {
  const baseUrl = getLayaBaseUrl();
  const res = await fetch(`${baseUrl}/models/presets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create preset '${req.preset_name}' (${res.status}): ${errorText}`);
  }

  return (await res.json()) as LayaCustomPresetResponse;
}
