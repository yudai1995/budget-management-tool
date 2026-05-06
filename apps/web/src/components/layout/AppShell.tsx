import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

type Props = {
  userName?: string;
  children: React.ReactNode;
};

/**
 * 認証済みページ共通ラッパー
 * - デスクトップ: トップヘッダー
 * - モバイル: ボトムナビゲーション + コンテンツ下部パディング
 */
export function AppShell({ userName, children }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-[#fffdf5]">
      <Header userName={userName} />
      {/* モバイルのボトムナビ分の余白 */}
      <div className="flex-1 pb-16 md:pb-0">{children}</div>
      <BottomNav />
    </div>
  );
}
