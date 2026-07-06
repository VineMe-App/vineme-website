"use client";

import { useEffect, useState } from "react";
import {
  createBrowserSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";

const users = [
  {
    name: "Amara Lewis",
    email: "amara@vineme.church",
    role: "Service Pastor",
    status: "Connected",
    group: "Fulham Midweek",
  },
  {
    name: "Ben Carter",
    email: "ben@vineme.church",
    role: "Group Leader",
    status: "Pending follow-up",
    group: "Students Alpha",
  },
  {
    name: "Grace Okafor",
    email: "grace@vineme.church",
    role: "Congregation",
    status: "Looking for a group",
    group: "Unassigned",
  },
  {
    name: "Tom Hughes",
    email: "tom@vineme.church",
    role: "Admin",
    status: "Connected",
    group: "South Ken Evenings",
  },
];

export default function DashboardPage() {
  const [accessState, setAccessState] = useState<
    "checking" | "allowed" | "denied" | "unconfigured"
  >("checking");

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
        .select("roles")
        .eq("id", session.user.id)
        .single();

      const roles = Array.isArray(profile?.roles) ? profile.roles : [];

      if (!isMounted) return;

      if (roles.includes("church_admin")) {
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

  if (accessState !== "allowed") {
    const isDenied = accessState === "denied";
    const isUnconfigured = accessState === "unconfigured";

    return (
      <section className="bg-brand-beige px-5 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 text-center shadow-2xl shadow-brand-dark/10">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-brand-pink">
            VineMe dashboard
          </p>
          <h1 className="mt-4 font-heading text-4xl font-black text-brand-dark">
            {isDenied
              ? "Church admin access required"
              : isUnconfigured
                ? "Dashboard login is not configured"
                : "Checking your access..."}
          </h1>
          <p className="mt-4 leading-7 text-brand-dark/70">
            {isDenied
              ? "Your VineMe user profile needs church_admin in roles before you can view this dashboard."
              : isUnconfigured
                ? "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable passwordless admin login."
                : "We are confirming your VineMe session and church admin role."}
          </p>
          {isDenied || isUnconfigured ? (
            <a
              href="/login"
              className="mt-6 inline-block rounded-xl bg-brand-pink px-6 py-4 font-black text-white shadow-lg shadow-brand-pink/20 transition-colors hover:bg-brand-dark"
            >
              Back to sign in
            </a>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white px-5 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto w-full max-w-6xl">
        <div className="rounded-3xl bg-brand-dark p-6 text-white sm:p-8 lg:p-10">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-brand-pink">
            VineMe dashboard
          </p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-heading text-4xl font-black sm:text-5xl">
                Church connection overview
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-white/75">
                Manage your VineMe user database, track people still waiting,
                and connect ChurchSuite so your pastoral team has one shared
                view.
              </p>
            </div>
            <button className="rounded-xl bg-brand-pink px-6 py-4 font-black text-white shadow-lg shadow-brand-pink/20 transition-colors hover:bg-white hover:text-brand-pink">
              Invite user
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            ["Total users", "428"],
            ["Pending follow-ups", "37"],
            ["Groups at capacity", "12"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-brand-dark/10 bg-brand-beige p-6"
            >
              <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-dark/55">
                {label}
              </p>
              <p className="mt-3 font-heading text-4xl font-black text-brand-dark">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="overflow-hidden rounded-3xl border border-brand-dark/10 bg-white shadow-xl shadow-brand-dark/5">
            <div className="border-b border-brand-dark/10 p-6">
              <h2 className="font-heading text-3xl font-black text-brand-dark">
                User database
              </h2>
              <p className="mt-2 text-brand-dark/65">
                A preview of the people and roles your church team can manage.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead className="bg-brand-beige text-sm font-black uppercase tracking-[0.14em] text-brand-dark/60">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Group</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-dark/10">
                  {users.map((user) => (
                    <tr key={user.email}>
                      <td className="px-6 py-5">
                        <p className="font-black text-brand-dark">
                          {user.name}
                        </p>
                        <p className="text-sm text-brand-dark/55">
                          {user.email}
                        </p>
                      </td>
                      <td className="px-6 py-5 font-bold text-brand-dark/75">
                        {user.role}
                      </td>
                      <td className="px-6 py-5 text-brand-dark/75">
                        {user.group}
                      </td>
                      <td className="px-6 py-5">
                        <span className="rounded-full bg-brand-pink/10 px-3 py-1 text-sm font-black text-brand-pink">
                          {user.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-3xl border border-brand-dark/10 bg-brand-beige p-6 shadow-xl shadow-brand-dark/5">
            <h2 className="font-heading text-3xl font-black text-brand-dark">
              Link to ChurchSuite
            </h2>
            <p className="mt-3 leading-7 text-brand-dark/70">
              Add your ChurchSuite API details so VineMe can sync people,
              groups, and follow-up status.
            </p>

            <form className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="churchsuite-api-key"
                  className="text-sm font-black text-brand-dark"
                >
                  ChurchSuite API key
                </label>
                <input
                  id="churchsuite-api-key"
                  name="churchsuite-api-key"
                  type="password"
                  placeholder="Paste API key"
                  className="mt-2 w-full rounded-xl border border-brand-dark/15 bg-white px-4 py-3 text-brand-dark outline-none transition-colors placeholder:text-brand-dark/35 focus:border-brand-pink"
                />
              </div>

              <div>
                <label
                  htmlFor="churchsuite-site"
                  className="text-sm font-black text-brand-dark"
                >
                  ChurchSuite site URL
                </label>
                <input
                  id="churchsuite-site"
                  name="churchsuite-site"
                  type="url"
                  placeholder="https://yourchurch.churchsuite.com"
                  className="mt-2 w-full rounded-xl border border-brand-dark/15 bg-white px-4 py-3 text-brand-dark outline-none transition-colors placeholder:text-brand-dark/35 focus:border-brand-pink"
                />
              </div>

              <button
                type="button"
                className="w-full rounded-xl bg-brand-pink px-6 py-4 font-black text-white shadow-lg shadow-brand-pink/20 transition-colors hover:bg-brand-dark"
              >
                Link to ChurchSuite
              </button>
            </form>

            <p className="mt-5 text-sm leading-6 text-brand-dark/55">
              API credentials are not submitted in this preview.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
