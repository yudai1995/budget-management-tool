/**
 * 認証不要のパブリック API へのクライアント側 fetch ラッパー。
 * Server Action / Server Component では serverFetch を使うこと。
 * このモジュールは "use client" コンポーネントからのみ呼び出す。
 */

const API_BASE = typeof window !== 'undefined' ? '/api' : (process.env.NEXT_PUBLIC_API_BASE ?? '/api');

export class ApiError extends Error {
    constructor(
        public readonly status: number,
        message: string,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export async function publicFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
        throw new ApiError(res.status, (body as { message?: string }).message ?? `HTTP ${res.status}`);
    }

    return res.json() as Promise<T>;
}
