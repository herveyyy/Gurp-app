import { getLayaBaseUrl } from "@/lib/domain/usecases/laya/get_laya_base_url.usecase";
import type { LayaUnloadModelRequest, LayaUnloadModelResponse } from "@/lib/entities/laya.type";

export async function unloadLayaModel(
  req: LayaUnloadModelRequest
): Promise<LayaUnloadModelResponse> {
  const baseUrl = getLayaBaseUrl();
  const res = await fetch(`${baseUrl}/models/unload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to unload model (${res.status}): ${errorText}`);
  }

  return (await res.json()) as LayaUnloadModelResponse;
}
