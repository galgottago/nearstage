"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import { DemoSession } from "@/domain/session";

type SessionContextValue = {
  session: DemoSession | null;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const raw = useSyncExternalStore(
    DemoSession.subscribe,
    DemoSession.snapshot,
    DemoSession.serverSnapshot,
  );
  const session = raw === null ? null : DemoSession.browser();

  return (
    <SessionContext.Provider value={{ session }}>{children}</SessionContext.Provider>
  );
}

export function useDemoSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error("useDemoSession must be used inside SessionProvider.");
  }
  return value;
}
