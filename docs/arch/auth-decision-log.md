# 認証設計決定ログ

## 背景

当初、Hono の `setSignedCookie` を使ったセッション Cookie 方式を採用していた。
しかし以下の根本的な問題が発生していた。

- **クロスオリジン Cookie 問題**: API（`:3001`）が発行した `Set-Cookie` は Next.js（`:3000`）に届かない。`serverFetch` は API レスポンスの `Set-Cookie` ヘッダーをブラウザに転送しない仕組みだったため、ログイン後も認証状態が維持できなかった。
- **二重管理**: セッション状態を API 側で持つため、Next.js Middleware からの検証に API 呼び出しが必要だった。

## 決定: RS256 JWT + HttpOnly Cookie（Next.js 管理）

### アーキテクチャ概要

```
Login:
  Browser → POST /api/login → API
                               ↓ JWT 発行（RS256）
  ← { accessToken, refreshToken }
  Next.js Server Action: cookies().set() でブラウザに HttpOnly Cookie をセット

Authenticated Request:
  Browser → Next.js Server Action
  serverFetch: Authorization: Bearer <access_token>
  API: 公開鍵で JWT 検証 → 認可

Token Refresh:
  Next.js Middleware: access_token 期限切れ → refresh_token で /api/refresh
  → 新トークンを Cookie に上書き → リクエスト続行

Refresh Token Reuse Detection:
  失効済み refresh_token が使用される → 該当ユーザーの全 refresh_token を即時失効
  （アカウント侵害を自動検知・遮断）
```

### RS256（非対称鍵）を採用した理由

| 項目 | HS256（共通鍵） | RS256（非対称鍵） |
|---|---|---|
| 鍵管理 | 署名・検証で同一鍵 | 署名は秘密鍵、検証は公開鍵 |
| 鍵漏洩リスク | 高（漏洩で偽造可能） | 低（公開鍵漏洩は問題なし）|
| 将来の拡張 | サービス間共有が困難 | 公開鍵配布で他サービスも検証可能 |

秘密鍵は API サーバーのみが保持する。Next.js Middleware が JWT を検証する際は公開鍵のみ使用するため、秘密鍵の露出リスクが局所化される。

### HttpOnly Cookie を採用した理由

- **XSS 耐性**: JavaScript から `document.cookie` で JWT を取得できない。
- **LocalStorage 禁止**: LocalStorage へのトークン保存は XSS で即座に窃取される。
- **SameSite=Strict**: CSRF 攻撃を遮断する。

### Refresh Token Rotation の設計

- Refresh Token は使い捨て（一度使ったら即時失効・新トークン発行）。
- 失効済みトークンの再利用を検知した場合、そのユーザーの **全 Refresh Token を即時失効** する。
  - これにより「トークン盗難 → 攻撃者が先に使用 → 正規ユーザーの再利用で侵害検知」が機能する。
- Refresh Token の平文はDBに保存しない。SHA-256ハッシュのみ保存する。

### トークン有効期限

| トークン | 有効期限 | 理由 |
|---|---|---|
| Access Token | 15分 | 漏洩時の被害を短時間に限定 |
| Refresh Token | 7日 | UX（頻繁なログイン）とセキュリティのバランス |

## 変更されたファイル

| ファイル | 変更内容 |
|---|---|
| `apps/api/src/application/auth/TokenService.ts` | JWT 署名・検証・Rotation ロジック |
| `apps/api/src/domain/models/RefreshToken.ts` | Refresh Token ドメインモデル |
| `apps/api/src/infrastructure/persistence/entity/RefreshTokenDataModel.ts` | DB エンティティ |
| `apps/api/src/infrastructure/persistence/migrations/AddRefreshTokenTable.ts` | DB マイグレーション |
| `apps/api/src/presentation/routes/auth.ts` | `/login`, `/guest-login`, `/refresh`, `/logout` |
| `apps/api/src/presentation/middleware/auth.ts` | JWT 検証 Middleware（Bearer トークン） |
| `apps/web/src/middleware.ts` | Next.js Middleware（ルート保護・自動リフレッシュ） |
| `apps/web/src/lib/actions/auth.ts` | JWT Cookie のセット・削除 |
| `apps/web/src/lib/api/client.ts` | Authorization ヘッダー付与 |
