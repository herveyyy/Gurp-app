import { getLayaBaseUrl } from "@/lib/domain/usecases/laya/get_laya_base_url.usecase";
import type { LayaHealthResponse } from "@/lib/entities/laya.type";

export async function getLayaHealth(): Promise<LayaHealthResponse> {
  const baseUrl = getLayaBaseUrl();
  const res = await fetch(`${baseUrl}/health`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Laya health check failed with status: ${res.status}`);
  }

  const data = await res.json();
  return {
    status: data.status || "ok",
    loaded_models: data.loaded || data.loaded_models || [],
    device: data.device || "auto",
  };
}
