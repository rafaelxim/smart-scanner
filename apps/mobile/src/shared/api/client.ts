import { env } from "../config/env";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, init);

  if (!response.ok) {
    throw await createApiError(response);
  }

  return response;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status && error.status >= 500) {
      return "The backend could not process the request. Try again.";
    }

    return "The request could not be completed. Try again.";
  }

  if (error instanceof Error) {
    if (error.message === "Network request failed") {
      return "Could not reach the backend. Check the connection and try again.";
    }

    return error.message;
  }

  return "Something went wrong. Check the backend connection.";
}

async function createApiError(response: Response): Promise<ApiError> {
  let code: string | undefined;

  try {
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      const body = (await response.json()) as { error?: unknown };

      if (typeof body.error === "string") {
        code = body.error;
      }
    }
  } catch {
    // Ignore malformed error payloads and fall back to HTTP status handling.
  }

  return new ApiError(`Request failed with status ${response.status}`, response.status, code);
}
