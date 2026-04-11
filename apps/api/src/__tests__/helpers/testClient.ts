/**
 * Hono app.request() ラッパー。
 * JWT Bearer トークンを自動管理するテストクライアント。
 */
import type { Hono } from 'hono';

export type TestResponse = {
    status: number;
    body: unknown;
    headers: Headers;
};

async function parseBody(res: Response): Promise<unknown> {
    const contentType = res.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
        return res.json();
    }
    return res.text();
}

/**
 * 認証不要なシングルリクエスト用ヘルパー関数。
 */
export async function testRequest(app: Hono, path: string, init: RequestInit = {}): Promise<TestResponse> {
    const res = await app.request(path, init);
    const body = await parseBody(res);
    return { status: res.status, body, headers: res.headers };
}

/**
 * JWT Bearer トークンを自動管理するテストエージェント。
 * ログイン後のアクセストークンを保持し、認証済みリクエストに自動付与する。
 *
 * @example
 * const client = new TestAgent(app);
 * await client.login('/api/login', { userId: 'user-1', password: 'pass' });
 * const res = await client.get('/api/expense');
 * expect(res.status).toBe(200);
 */
export class TestAgent {
    private accessToken = '';
    private refreshToken = '';

    constructor(private readonly app: Hono) {}

    private buildHeaders(extra: Record<string, string> = {}): Record<string, string> {
        const headers: Record<string, string> = { ...extra };
        if (this.accessToken) {
            headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return headers;
    }

    private async send(path: string, init: RequestInit): Promise<TestResponse> {
        const res = await this.app.request(path, init);
        const body = await parseBody(res);
        return { status: res.status, body, headers: res.headers };
    }

    /** ログインしてトークンを取得・保持する */
    async login(path: string, credentials: unknown): Promise<TestResponse> {
        const res = await this.send(path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });
        const body = res.body as Record<string, unknown>;
        if (typeof body.accessToken === 'string') this.accessToken = body.accessToken;
        if (typeof body.refreshToken === 'string') this.refreshToken = body.refreshToken;
        return res;
    }

    /** ゲストログインしてトークンを取得・保持する */
    async guestLogin(path: string): Promise<TestResponse> {
        const res = await this.send(path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        const body = res.body as Record<string, unknown>;
        if (typeof body.accessToken === 'string') this.accessToken = body.accessToken;
        if (typeof body.refreshToken === 'string') this.refreshToken = body.refreshToken;
        return res;
    }

    getRefreshToken(): string {
        return this.refreshToken;
    }

    async get(path: string): Promise<TestResponse> {
        return this.send(path, { method: 'GET', headers: this.buildHeaders() });
    }

    async post(path: string, body?: unknown): Promise<TestResponse> {
        return this.send(path, {
            method: 'POST',
            headers: this.buildHeaders({ 'Content-Type': 'application/json' }),
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    }

    async put(path: string, body?: unknown): Promise<TestResponse> {
        return this.send(path, {
            method: 'PUT',
            headers: this.buildHeaders({ 'Content-Type': 'application/json' }),
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    }

    async delete(path: string): Promise<TestResponse> {
        return this.send(path, { method: 'DELETE', headers: this.buildHeaders() });
    }
}
