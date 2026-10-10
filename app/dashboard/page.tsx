"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardFrame,
  CardFrameDescription,
  CardFrameHeader,
  CardFrameTitle,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

const statusVariants: Record<string, NonNullable<BadgeProps["variant"]>> = {
  Connected: "success",
  "Pending follow-up": "warning",
  "Looking for a group": "info",
};

const stats = [
  ["Total users", "428"],
  ["Pending follow-ups", "37"],
  ["Groups at capacity", "12"],
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

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
                ? "Your VineMe user profile needs church_admin in roles before you can view this dashboard."
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

  return (
    <section className="bg-white px-5 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto w-full max-w-6xl">
        <div className="rounded-3xl bg-brand-dark p-6 text-white sm:p-8 lg:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-pink">
            VineMe dashboard
          </p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-heading text-4xl font-bold sm:text-5xl">
                Church connection overview
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-white/75">
                Manage your VineMe user database, track people still waiting,
                and connect ChurchSuite so your pastoral team has one shared
                view.
              </p>
            </div>
            <Button size="xl">Invite user</Button>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {stats.map(([label, value]) => (
            <Card key={label}>
              <CardPanel>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {label}
                </p>
                <p className="mt-3 font-heading text-4xl font-bold text-foreground">
                  {value}
                </p>
              </CardPanel>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <CardFrame>
            <CardFrameHeader>
              <CardFrameTitle>User database</CardFrameTitle>
              <CardFrameDescription>
                A preview of the people and roles your church team can manage.
              </CardFrameDescription>
            </CardFrameHeader>
            <Table variant="card" className="min-w-[640px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.email}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">
                            {user.name}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" size="lg">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.group}</TableCell>
                    <TableCell>
                      <Badge
                        variant={statusVariants[user.status] ?? "outline"}
                        size="lg"
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardFrame>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Link to ChurchSuite</CardTitle>
              <CardDescription>
                Add your ChurchSuite API details so VineMe can sync people,
                groups, and follow-up status.
              </CardDescription>
            </CardHeader>
            <CardPanel>
              <Form className="space-y-5">
                <Field>
                  <FieldLabel>ChurchSuite API key</FieldLabel>
                  <Input
                    name="churchsuite-api-key"
                    type="password"
                    placeholder="Paste API key"
                  />
                </Field>

                <Field>
                  <FieldLabel>ChurchSuite site URL</FieldLabel>
                  <Input
                    name="churchsuite-site"
                    type="url"
                    placeholder="https://yourchurch.churchsuite.com"
                  />
                </Field>

                <Button type="button" size="xl" className="w-full">
                  Link to ChurchSuite
                </Button>
              </Form>
            </CardPanel>
            <CardFooter className="text-muted-foreground text-sm">
              API credentials are not submitted in this preview.
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
