import { getLayaHealth } from "@/lib/domain/usecases/laya/get_laya_health.usecase";
import { runSystemOne } from "@/lib/domain/usecases/laya/run_system_one.usecase";
import { triageTicket } from "@/lib/domain/usecases/laya/triage_ticket.usecase";
import { scoreTicketUrgency } from "@/lib/domain/usecases/laya/score_ticket_urgency.usecase";
import { batchTriageTickets } from "@/lib/domain/usecases/laya/batch_triage_tickets.usecase";
import { getLayaModels } from "@/lib/domain/usecases/laya/get_laya_models.usecase";
import { loadLayaModel } from "@/lib/domain/usecases/laya/load_laya_model.usecase";
import { unloadLayaModel } from "@/lib/domain/usecases/laya/unload_laya_model.usecase";
import { getLayaPresets } from "@/lib/domain/usecases/laya/get_laya_presets.usecase";
import { createLayaPreset } from "@/lib/domain/usecases/laya/create_laya_preset.usecase";

import type {
  LayaHealthResponse,
  LayaSystemOneRequest,
  LayaSystemOneResponse,
  LayaTicketTriageRequest,
  LayaTicketTriageResponse,
  LayaTicketUrgencyRequest,
  LayaTicketUrgencyResponse,
  LayaBatchTicketRequest,
  LayaBatchTicketResponse,
  LayaModelStatusResponse,
  LayaLoadModelRequest,
  LayaLoadModelResponse,
  LayaUnloadModelRequest,
  LayaUnloadModelResponse,
  LayaCustomPresetRequest,
  LayaCustomPresetResponse,
  LayaPresetsResponse,
} from "@/lib/entities/laya.type";

export class LayaService {
  static async checkHealth(): Promise<LayaHealthResponse> {
    return getLayaHealth();
  }

  static async systemOne(payload: LayaSystemOneRequest): Promise<LayaSystemOneResponse> {
    return runSystemOne(payload);
  }

  static async triage(ticket: LayaTicketTriageRequest): Promise<LayaTicketTriageResponse> {
    return triageTicket(ticket);
  }

  static async scoreUrgency(req: LayaTicketUrgencyRequest): Promise<LayaTicketUrgencyResponse> {
    return scoreTicketUrgency(req);
  }

  static async batchTriage(batch: LayaBatchTicketRequest): Promise<LayaBatchTicketResponse> {
    return batchTriageTickets(batch);
  }

  static async getModels(): Promise<LayaModelStatusResponse> {
    return getLayaModels();
  }

  static async loadModel(req: LayaLoadModelRequest): Promise<LayaLoadModelResponse> {
    return loadLayaModel(req);
  }

  static async unloadModel(req: LayaUnloadModelRequest): Promise<LayaUnloadModelResponse> {
    return unloadLayaModel(req);
  }

  static async getPresets(): Promise<LayaPresetsResponse> {
    return getLayaPresets();
  }

  static async createPreset(req: LayaCustomPresetRequest): Promise<LayaCustomPresetResponse> {
    return createLayaPreset(req);
  }
}
