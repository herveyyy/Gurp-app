export type QuestionType = "choice" | "score" | "noul";

export interface LayaQuestionDefinition {
  type: QuestionType;
  instructions: string;
  criteria?: Record<string, string> | string[];
}

export interface LayaTicketTriageRequest {
  ticket_id?: string;
  customer?: string;
  subject: string;
  body: string;
  metadata?: Record<string, unknown>;
  model?: string;
}

export interface LayaTicketTriageResponse {
  ticket_id?: string;
  routing_decision?: string;
  assigned_queue: string;
  urgency_score: number;
  priority_level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  churn_risk: string;
  churn_risk_score: number;
  sentiment: string;
  action_recommendation: string;
  raw?: Record<string, unknown>;
}

export interface LayaTicketUrgencyRequest {
  ticket_id?: string;
  subject: string;
  body: string;
  model?: string;
}

export interface LayaTicketUrgencyResponse {
  ticket_id?: string;
  urgency_score: number;
  priority_level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  churn_risk: string;
  churn_risk_score: number;
  sla_risk: string;
}

export interface LayaBatchTicketRequest {
  tickets: LayaTicketTriageRequest[];
  model?: string;
}

export interface LayaBatchTicketResponse {
  total: number;
  results: LayaTicketTriageResponse[];
}

export interface LayaSystemOneRequest {
  state: Record<string, unknown>;
  questions: Record<string, LayaQuestionDefinition>;
  model?: string;
}

export interface LayaSystemOneResponse {
  model?: string;
  answers: Record<
    string,
    {
      type: QuestionType;
      choice?: string;
      score?: number;
      noul?: number;
      confidence?: number;
      answer_confidence?: number;
      probabilities?: Record<string, number>;
    }
  >;
  routing?: {
    model?: string;
    repo?: string;
    reason?: string;
  };
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface LayaHealthResponse {
  status: string;
  loaded_models?: string[];
  loaded?: string[];
  device?: string;
}

export interface LayaModelStatusResponse {
  device: string;
  total_available: number;
  total_loaded: number;
  loaded_models: string[];
  models?: Record<string, { repository: string; subfolder: string | null; is_loaded: boolean }>;
}

export interface LayaLoadModelRequest {
  model_name: string;
  custom_repo?: string;
  subfolder?: string;
}

export interface LayaLoadModelResponse {
  success: boolean;
  model_name: string;
  loaded_models: string[];
  device: string;
  load_time_ms: number;
  message: string;
}

export interface LayaUnloadModelRequest {
  model_name?: string;
}

export interface LayaUnloadModelResponse {
  success: boolean;
  unloaded: string;
  remaining_models: string[];
  message: string;
}

export interface LayaCustomPresetRequest {
  preset_name: string;
  questions: Record<string, LayaQuestionDefinition>;
}

export interface LayaCustomPresetResponse {
  success: boolean;
  preset_name: string;
  question_keys: string[];
  total_questions: number;
  message: string;
}

export interface LayaPresetsResponse {
  built_in_presets: Record<string, string[]>;
  custom_presets: Record<string, string[]>;
  total_custom_presets: number;
}
