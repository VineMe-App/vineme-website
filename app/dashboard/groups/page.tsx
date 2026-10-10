"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { fetchGroups } from "@/lib/dashboard/queries";
import { useDashboardQuery } from "@/lib/dashboard/use-dashboard-query";

export default function GroupsPage() {
  const query = useDashboardQuery(fetchGroups);
  const groups = query.data ?? [];

  return (
    <section className="px-5 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="font-heading text-3xl font-bold sm:text-4xl">
          Groups
        </h1>
        <p className="mt-2 text-muted-foreground">
          Every approved group at your church, busiest first.
        </p>

        {query.status === "loading" ? (
          <p className="mt-8 text-muted-foreground">Loading your groups...</p>
        ) : null}
        {query.status === "error" ? (
          <p className="mt-8 text-muted-foreground">
            We could not load your groups. Refresh to try again.
          </p>
        ) : null}
        {query.status === "ready" && groups.length === 0 ? (
          <p className="mt-8 text-muted-foreground">No approved groups yet.</p>
        ) : null}

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {groups.map((group) => (
            <Card key={group.id}>
              <CardHeader>
                <CardTitle className="text-xl">{group.name}</CardTitle>
                <CardDescription>
                  {group.area} · {group.meets}
                </CardDescription>
              </CardHeader>
              <CardPanel className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" size="lg">
                    Led by {group.leader}
                  </Badge>
                  {group.atCapacity ? (
                    <Badge variant="error" size="lg">
                      At capacity
                    </Badge>
                  ) : (
                    <Badge variant="success" size="lg">
                      Taking new members
                    </Badge>
                  )}
                  {group.pendingFollowUps > 0 ? (
                    <Badge variant="warning" size="lg">
                      {group.pendingFollowUps} to follow up
                    </Badge>
                  ) : null}
                </div>
                <p className="text-muted-foreground text-sm">
                  {group.members} {group.members === 1 ? "member" : "members"}
                </p>
              </CardPanel>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
