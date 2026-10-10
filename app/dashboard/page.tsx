"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardFrame,
  CardFrameDescription,
  CardFrameHeader,
  CardFrameTitle,
  CardPanel,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PendingRequestsChart } from "@/components/dashboard/PendingRequestsChart";
import { useAdmin } from "@/lib/dashboard/admin-context";
import { fetchFollowUps, fetchOverview } from "@/lib/dashboard/queries";
import { useDashboardQuery } from "@/lib/dashboard/use-dashboard-query";
import { getInitials, memberStatusVariants } from "@/lib/dashboard/utils";

export default function DashboardPage() {
  const { churchName } = useAdmin();
  const query = useDashboardQuery(fetchOverview);
  const overview = query.data;
  const followUps = useDashboardQuery(fetchFollowUps);
  const stats = [
    ["Total users", overview?.totalPeople],
    ["Pending follow-ups", overview?.pendingFollowUps],
    ["Groups at capacity", overview?.groupsAtCapacity],
  ];

  return (
    <section className="px-5 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto w-full max-w-6xl">
        <div className="rounded-3xl bg-brand-dark p-6 text-white sm:p-8 lg:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-pink">
            VineMe dashboard
          </p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-heading text-4xl font-bold sm:text-5xl">
                {churchName ?? "Church connection overview"}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-white/75">
                Manage your VineMe user database, track people still waiting,
                and keep your pastoral team on one shared view. Connect
                ChurchSuite from{" "}
                <Link
                  href="/dashboard/settings"
                  className="underline underline-offset-4 hover:text-white"
                >
                  Settings
                </Link>
                .
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
                  {value ?? "-"}
                </p>
              </CardPanel>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <PendingRequestsChart
            people={followUps.data}
            hasError={followUps.status === "error"}
          />
        </div>

        <div className="mt-8">
          <CardFrame>
            <CardFrameHeader>
              <CardFrameTitle>User database</CardFrameTitle>
              <CardFrameDescription>
                {query.status === "error"
                  ? "We could not load your people. Refresh to try again."
                  : "The newest people at your church. See everyone under Members."}
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
                {(overview?.members ?? []).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="font-medium text-foreground">
                          {user.name}
                        </p>
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
                        variant={memberStatusVariants[user.status as keyof typeof memberStatusVariants] ?? "outline"}
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
        </div>
      </div>
    </section>
  );
}
