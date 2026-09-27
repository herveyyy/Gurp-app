import { getLayaBaseUrl } from "@/lib/domain/usecases/laya/get_laya_base_url.usecase";
import type { LayaLoadModelRequest, LayaLoadModelResponse } from "@/lib/entities/laya.type";

export async function loadLayaModel(
  req: LayaLoadModelRequest
): Promise<LayaLoadModelResponse> {
  const baseUrl = getLayaBaseUrl();
  const res = await fetch(`${baseUrl}/models/load`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to load model '${req.model_name}' (${res.status}): ${errorText}`);
  }

  return (await res.json()) as LayaLoadModelResponse;
}
