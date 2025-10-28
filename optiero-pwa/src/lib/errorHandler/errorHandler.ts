export interface NormalizedError {
  title: string;
  message: string;
  status: number;
}

export async function normalizeApiError(res: Response): Promise<NormalizedError> {
  try {
    // Try to parse the backend’s JSON error format
    const err = await res.json();

    if (err?.title || err?.detail || err?.status) {
      return {
        title: err.title ?? "Error",
        message: err.detail ?? "An unexpected error occurred.",
        status: err.status ?? res.status,
      };
    }

    // If not in expected format
    return {
      title: `API ${res.status}`,
      message: JSON.stringify(err),
      status: res.status,
    };
  } catch {
    // If response isn't JSON (e.g., network failure or HTML error)
    return {
      title: "Network Error",
      message: await res.text().catch(() => "Failed to connect to server."),
      status: res.status || 500,
    };
  }
}

export function normalizeClientError(err: unknown): NormalizedError {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();

    if (msg.includes("fetch failed") || msg.includes("connect") || msg.includes("refused")) {
      return {
        title: "Network Error",
        message: "Failed to connect to the server.",
        status: 503,
      };
    }

    return {
      title: "Client Error",
      message: err.message,
      status: 500,
    };
  }

  return {
    title: "Unknown Error",
    message: "Something went wrong.",
    status: 500,
  };
}
