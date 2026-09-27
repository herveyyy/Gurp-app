import { getLayaBaseUrl } from "@/lib/domain/usecases/laya/get_laya_base_url.usecase";
import type { LayaSystemOneRequest, LayaSystemOneResponse } from "@/lib/entities/laya.type";

export async function runSystemOne(
  payload: LayaSystemOneRequest
): Promise<LayaSystemOneResponse> {
  const baseUrl = getLayaBaseUrl();
  const res = await fetch(`${baseUrl}/v1/systemone`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`System 1 call failed (${res.status}): ${errorText}`);
  }

  return (await res.json()) as LayaSystemOneResponse;
}
