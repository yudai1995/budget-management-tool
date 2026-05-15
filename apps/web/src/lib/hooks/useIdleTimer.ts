import { useEffect, useRef } from "react";
import { toast } from "sonner";

const IDLE_MS = 30 * 60 * 1000;
const WARN_BEFORE_MS = 60 * 1000;

export function useIdleTimer(onTimeout: () => void) {
  const onTimeoutRef = useRef(onTimeout);

  // Keep ref in sync without triggering timer re-setup
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  });

  useEffect(() => {
    let warnTimer: ReturnType<typeof setTimeout> | null = null;
    let logoutTimer: ReturnType<typeof setTimeout> | null = null;
    let toastId: string | number | null = null;

    // Plain function declaration so the toast action can reference reset without forward-ref issues
    function reset() {
      if (warnTimer) clearTimeout(warnTimer);
      if (logoutTimer) clearTimeout(logoutTimer);
      if (toastId !== null) {
        toast.dismiss(toastId);
        toastId = null;
      }

      warnTimer = setTimeout(() => {
        toastId = toast.warning("セッションが間もなく切れます", {
          description: "1分後に自動ログアウトします",
          duration: WARN_BEFORE_MS,
          action: { label: "続行する", onClick: reset },
        });
      }, IDLE_MS - WARN_BEFORE_MS);

      logoutTimer = setTimeout(() => {
        onTimeoutRef.current();
      }, IDLE_MS);
    }

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"] as const;
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (warnTimer) clearTimeout(warnTimer);
      if (logoutTimer) clearTimeout(logoutTimer);
    };
     
  }, []);
}
