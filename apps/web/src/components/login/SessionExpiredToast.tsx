"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export function SessionExpiredToast() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="alert"
      className="mb-4 flex items-start justify-between gap-2 rounded-xl border border-[#fbbf24]/40 bg-[#fef3c7] px-3 py-2 text-sm font-medium text-[#1c1410]"
    >
      <span>セッションが切れました。再度ログインしてください。</span>
      <button
        type="button"
        aria-label="閉じる"
        onClick={() => setVisible(false)}
        className="shrink-0 text-[#1c1410]/50 hover:text-[#1c1410]"
      >
        <X size={14} />
      </button>
    </div>
  );
}
