import { getLayaBaseUrl } from "@/lib/domain/usecases/laya/get_laya_base_url.usecase";
import { getLayaHealth } from "@/lib/domain/usecases/laya/get_laya_health.usecase";
import type { LayaModelStatusResponse } from "@/lib/entities/laya.type";

export async function getLayaModels(): Promise<LayaModelStatusResponse> {
  const baseUrl = getLayaBaseUrl();

  try {
    const res = await fetch(`${baseUrl}/models`, {
      cache: "no-store",
    });

    if (res.ok) {
      return (await res.json()) as LayaModelStatusResponse;
    }
  } catch {
    // fallback to health check
  }

  const health = await getLayaHealth();
  const loaded = health.loaded_models || [];

  return {
    device: health.device || "auto",
    total_available: 3,
    total_loaded: loaded.length,
    loaded_models: loaded,
    models: {
      english: {
        repository: "convaiinnovations/laya",
        subfolder: null,
        is_loaded: loaded.includes("english"),
      },
      multilingual: {
        repository: "convaiinnovations/laya",
        subfolder: "multilingual",
        is_loaded: loaded.includes("multilingual"),
      },
      "typed-decisions": {
        repository: "convaiinnovations/laya",
        subfolder: "typed-decisions",
        is_loaded: loaded.includes("typed-decisions"),
      },
    },
  };
}
