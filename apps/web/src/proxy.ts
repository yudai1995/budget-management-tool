import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** express-session のデフォルトクッキー名 */
const SESSION_COOKIE = "connect.sid";

/**
 * 認証ガード。
 * セッションクッキーが存在しない場合は /login へリダイレクトする。
 * 注意: クッキーの存在確認のみ行う楽観的チェック。
 * 実際のセッション有効性は Server Component 側で /api を呼び出して検証する。
 */
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE);
  if (!hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/expenses/:path*", "/report/:path*"],
};
