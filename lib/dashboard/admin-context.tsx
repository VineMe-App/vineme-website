"use client";

import { createContext, useContext } from "react";
import type { createBrowserSupabaseClient } from "@/lib/supabase/client";

export interface AdminContextValue {
  supabase: ReturnType<typeof createBrowserSupabaseClient>;
  userId: string;
  churchId: string;
  churchName: string | null;
  serviceName: string | null;
  firstName: string;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export const AdminProvider = AdminContext.Provider;

export function useAdmin(): AdminContextValue {
  const value = useContext(AdminContext);
  if (!value) {
    throw new Error("useAdmin must be used inside the dashboard AdminGate.");
  }
  return value;
}
