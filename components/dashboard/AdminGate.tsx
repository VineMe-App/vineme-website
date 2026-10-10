"use client";

import { useEffect, useState } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AdminProvider, type AdminContextValue } from "@/lib/dashboard/admin-context";
import {
  createBrowserSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";

type AccessState = "checking" | "allowed" | "denied" | "unconfigured";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const [accessState, setAccessState] = useState<AccessState>("checking");
  const [admin, setAdmin] = useState<AdminContextValue | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkAdminAccess() {
      if (!isSupabaseConfigured()) {
        setAccessState("unconfigured");
        return;
      }

      const supabase = createBrowserSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("roles, church_id, service_id, first_name, name")
        .eq("id", session.user.id)
        .single();

      const roles = Array.isArray(profile?.roles) ? profile.roles : [];

      if (!isMounted) return;

      if (roles.includes("church_admin") && profile?.church_id) {
        const [church, service] = await Promise.all([
          supabase
            .from("churches")
            .select("name")
            .eq("id", profile.church_id)
            .single(),
          profile.service_id
            ? supabase
                .from("services")
                .select("name")
                .eq("id", profile.service_id)
                .single()
            : Promise.resolve({ data: null }),
        ]);

        if (!isMounted) return;

        setAdmin({
          supabase,
          userId: session.user.id,
          churchId: profile.church_id,
          churchName: church.data?.name ?? null,
          serviceName: service.data?.name ?? null,
          firstName:
            profile.first_name || profile.name?.split(" ")[0] || "there",
        });
        setAccessState("allowed");
      } else {
        await supabase.auth.signOut();
        setAccessState("denied");
      }
    }

    void checkAdminAccess();

    return () => {
      isMounted = false;
    };
  }, []);

  if (accessState === "allowed" && admin) {
    return (
      <AdminProvider value={admin}>
        <div className="min-h-screen bg-muted">
          <DashboardNav />
          <main>{children}</main>
        </div>
      </AdminProvider>
    );
  }

  const isDenied = accessState === "denied";
  const isUnconfigured = accessState === "unconfigured";

  return (
    <section className="min-h-screen bg-brand-beige px-5 py-16 sm:px-6 lg:py-24">
      <Card className="mx-auto max-w-xl text-center">
        <CardHeader className="justify-items-center gap-3 pt-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-pink">
            VineMe dashboard
          </p>
          <CardTitle className="text-3xl leading-tight sm:text-4xl">
            {isDenied
              ? "Church admin access required"
              : isUnconfigured
                ? "Dashboard login is not configured"
                : "Checking your access..."}
          </CardTitle>
          <CardDescription className="text-base leading-7">
            {isDenied
              ? "Your VineMe user profile needs church_admin in roles, and a church, before you can view this dashboard."
              : isUnconfigured
                ? "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable passwordless admin login."
                : "We are confirming your VineMe session and church admin role."}
          </CardDescription>
        </CardHeader>
        {isDenied || isUnconfigured ? (
          <CardFooter className="justify-center pb-8">
            <Button size="xl" render={<a href="/login" />}>
              Back to sign in
            </Button>
          </CardFooter>
        ) : null}
      </Card>
    </section>
  );
}
