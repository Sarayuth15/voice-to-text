import type {
  AppConfigResponse,
  ApiKeyResponse,
  ModelBreakdownResponse,
  TimeseriesGroupBy,
  TimeseriesPointResponse,
  UsageSummaryResponse,
} from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body } = options;

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, `Couldn't reach the API at ${API_BASE_URL}. Is the backend running?`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.message ?? `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message, data?.fieldErrors);
  }

  return data as T;
}

// No login/accounts (see claude.md) - every call below hits a public endpoint,
// scoped to this single app instance rather than to a signed-in user.
export const api = {
  getConfig: () => request<AppConfigResponse>("/api/config"),

  listApiKeys: () => request<ApiKeyResponse[]>("/api/keys"),

  createApiKey: (label: string, apiKey: string) =>
    request<ApiKeyResponse>("/api/keys", { method: "POST", body: { label, apiKey } }),

  deleteApiKey: (id: number) => request<void>(`/api/keys/${id}`, { method: "DELETE" }),

  syncApiKey: (id: number) => request<ApiKeyResponse>(`/api/keys/${id}/sync`, { method: "POST" }),

  usageSummary: (start: string, end: string) =>
    request<UsageSummaryResponse>(`/api/usage/summary?start=${start}&end=${end}`),

  usageTimeseries: (start: string, end: string, groupBy: TimeseriesGroupBy) =>
    request<TimeseriesPointResponse[]>(
      `/api/usage/timeseries?start=${start}&end=${end}&groupBy=${groupBy}`,
    ),

  usageByModel: (start: string, end: string) =>
    request<ModelBreakdownResponse[]>(`/api/usage/by-model?start=${start}&end=${end}`),
};
