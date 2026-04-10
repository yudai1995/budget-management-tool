import { cookies } from "next/headers";

const API_BASE = process.env.API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Server Component / Server Action から呼び出すサーバーサイド専用 fetch ラッパー。
 * express-session のセッション Cookie を自動転送する。
 */
export async function serverFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const cookieStore = await cookies();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieStore.toString(),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new ApiError(res.status, body.message ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}
