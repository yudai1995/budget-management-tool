"use client";

import { useIdleTimer } from "@/lib/hooks/useIdleTimer";
import { logoutAction } from "@/lib/actions/auth";

export function IdleTimerWrapper() {
  useIdleTimer(logoutAction);
  return null;
}
