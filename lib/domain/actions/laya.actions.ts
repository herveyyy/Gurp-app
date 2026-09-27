"use server";

import { LayaService } from "@/lib/domain/services/laya.service";
import type {
  LayaTicketTriageRequest,
  LayaTicketTriageResponse,
  LayaTicketUrgencyRequest,
  LayaTicketUrgencyResponse,
  LayaBatchTicketRequest,
  LayaBatchTicketResponse,
  LayaSystemOneRequest,
  LayaSystemOneResponse,
  LayaLoadModelRequest,
  LayaLoadModelResponse,
  LayaUnloadModelRequest,
  LayaUnloadModelResponse,
  LayaCustomPresetRequest,
  LayaCustomPresetResponse,
  LayaHealthResponse,
  LayaModelStatusResponse,
  LayaPresetsResponse,
} from "@/lib/entities/laya.type";

export async function checkLayaHealthAction(): Promise<LayaHealthResponse> {
  return LayaService.checkHealth();
}

export async function triageTicketAction(
  payload: LayaTicketTriageRequest
): Promise<LayaTicketTriageResponse> {
  return LayaService.triage(payload);
}

export async function scoreTicketUrgencyAction(
  payload: LayaTicketUrgencyRequest
): Promise<LayaTicketUrgencyResponse> {
  return LayaService.scoreUrgency(payload);
}

export async function batchTriageTicketsAction(
  payload: LayaBatchTicketRequest
): Promise<LayaBatchTicketResponse> {
  return LayaService.batchTriage(payload);
}

export async function runSystemOneAction(
  payload: LayaSystemOneRequest
): Promise<LayaSystemOneResponse> {
  return LayaService.systemOne(payload);
}

export async function getLayaModelsAction(): Promise<LayaModelStatusResponse> {
  return LayaService.getModels();
}

export async function loadLayaModelAction(
  payload: LayaLoadModelRequest
): Promise<LayaLoadModelResponse> {
  return LayaService.loadModel(payload);
}

export async function unloadLayaModelAction(
  payload: LayaUnloadModelRequest
): Promise<LayaUnloadModelResponse> {
  return LayaService.unloadModel(payload);
}

export async function getLayaPresetsAction(): Promise<LayaPresetsResponse> {
  return LayaService.getPresets();
}

export async function createLayaPresetAction(
  payload: LayaCustomPresetRequest
): Promise<LayaCustomPresetResponse> {
  return LayaService.createPreset(payload);
}
