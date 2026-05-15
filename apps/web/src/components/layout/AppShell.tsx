import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { IdleTimerWrapper } from "./IdleTimerWrapper";

type Props = {
  userName?: string;
  children: React.ReactNode;
};

/**
 * 認証済みページ共通ラッパー
 * - PC（md以上）: 左サイドバー + コンテンツ
 * - モバイル（md未満）: ミニヘッダー + コンテンツ + ボトムナビ
 */
export function AppShell({ userName, children }: Props) {
  return (
    <div className="flex flex-col min-h-dvh md:flex-row bg-[#fffdf5]">
      <IdleTimerWrapper />
      {/* PC: サイドバー / モバイル: ミニヘッダー */}
      <Header userName={userName} />

      {/* コンテンツ本体 */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* モバイルのボトムナビ分の余白 */}
        <div className="flex-1 pb-16 md:pb-0">{children}</div>
        <BottomNav userId={userName} />
      </div>
    </div>
  );
}
