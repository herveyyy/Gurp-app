import { triageTicket } from "@/lib/domain/usecases/laya/triage_ticket.usecase";
import type {
  LayaBatchTicketRequest,
  LayaBatchTicketResponse,
  LayaTicketTriageResponse,
} from "@/lib/entities/laya.type";

export async function batchTriageTickets(
  batch: LayaBatchTicketRequest
): Promise<LayaBatchTicketResponse> {
  const results: LayaTicketTriageResponse[] = [];

  for (const ticket of batch.tickets) {
    const res = await triageTicket({
      ...ticket,
      model: ticket.model || batch.model,
    });
    results.push(res);
  }

  return {
    total: results.length,
    results,
  };
}
