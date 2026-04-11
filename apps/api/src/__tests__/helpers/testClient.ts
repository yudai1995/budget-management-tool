/**
 * Hono app.request() ラッパー。
 * supertest の request.agent() に相当する Cookie 自動管理付きのテストクライアント。
 */
import type { Hono } from 'hono';

export type TestResponse = {
    status: number;
    body: unknown;
    headers: Headers;
};

/**
 * レスポンスヘッダーから Set-Cookie 値を抽出し、次のリクエストで使用できる Cookie 文字列を返す。
 * 複数の Cookie が設定される場合にも対応する。
 */
function extractCookies(headers: Headers, currentCookies: string): string {
    const setCookieHeader = headers.get('set-cookie');
    if (!setCookieHeader) return currentCookies;

    // Set-Cookie ヘッダーを分割し、name=value 部分のみを抽出
    const newCookies = setCookieHeader
        .split(/,(?=[^;]+=[^;])/) // 複数 Cookie の区切り（Path= 等の値内のカンマは除外）
        .map((c) => c.trim().split(';')[0].trim())
        .filter(Boolean);

    // 既存の Cookie マップを更新（同名の Cookie は上書き）
    const cookieMap = new Map<string, string>();
    if (currentCookies) {
        currentCookies.split('; ').forEach((pair) => {
            const [name, ...valueParts] = pair.split('=');
            if (name) cookieMap.set(name.trim(), valueParts.join('='));
        });
    }
    newCookies.forEach((pair) => {
        const [name, ...valueParts] = pair.split('=');
        if (name) cookieMap.set(name.trim(), valueParts.join('='));
    });

    return Array.from(cookieMap.entries())
        .map(([k, v]) => `${k}=${v}`)
        .join('; ');
}

async function parseBody(res: Response): Promise<unknown> {
    const contentType = res.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
        return res.json();
    }
    return res.text();
}

/**
 * Cookie を保持しないシングルリクエスト用のヘルパー関数。
 * supertest の `request(app).get(path)` に相当する。
 */
export async function testRequest(app: Hono, path: string, init: RequestInit = {}): Promise<TestResponse> {
    const res = await app.request(path, init);
    const body = await parseBody(res);
    return { status: res.status, body, headers: res.headers };
}

/**
 * セッション Cookie を自動管理するテストエージェント。
 * supertest の `request.agent(app)` に相当する。
 *
 * @example
 * const client = new TestAgent(app);
 * await client.post('/api/login', { userId: 'user-1', password: 'pass' });
 * const res = await client.get('/api/expense');
 * expect(res.status).toBe(200);
 */
export class TestAgent {
    private cookieString = '';

    constructor(private readonly app: Hono) {}

    private buildHeaders(extra: Record<string, string> = {}): Record<string, string> {
        const headers: Record<string, string> = { ...extra };
        if (this.cookieString) {
            headers.Cookie = this.cookieString;
        }
        return headers;
    }

    private async send(path: string, init: RequestInit): Promise<TestResponse> {
        const res = await this.app.request(path, init);
        this.cookieString = extractCookies(res.headers, this.cookieString);
        const body = await parseBody(res);
        return { status: res.status, body, headers: res.headers };
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
