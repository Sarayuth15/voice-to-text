// Mirrors the backend DTOs in backend/src/main/java/com/example/backend/dto/**.
// Kept in sync by hand (no codegen yet) - see claude.md's REST API contract table.

// No login/accounts - see claude.md. This is the only "config" the backend exposes.
export interface AppConfigResponse {
  ownerEmail: string | null;
}

export interface ApiKeyResponse {
  id: number;
  label: string;
  maskedKey: string;
  createdAt: string;
  lastSyncedAt: string | null;
  lastSyncStatus: "NEVER_SYNCED" | "IN_PROGRESS" | "SUCCESS" | "FAILED";
  lastSyncError: string | null;
}

export interface UsageSummaryResponse {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  totalCost: number; // Java BigDecimal, serialized as a plain JSON number
  currency: string;
  start: string;
  end: string;
}

export interface TimeseriesPointResponse {
  key: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
}

export interface ModelBreakdownResponse {
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
}

export type TimeseriesGroupBy = "day" | "model" | "key";

export interface ApiErrorBody {
  timestamp?: string;
  status?: number;
  error?: string;
  message: string;
  fieldErrors?: Record<string, string>;
}
