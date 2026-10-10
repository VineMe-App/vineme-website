"use client";

import { ChevronRightIcon } from "lucide-react";
import { useState } from "react";
import { GroupImage } from "@/components/dashboard/GroupImage";
import { GroupSheet } from "@/components/dashboard/GroupSheet";
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const selectedGroup = groups.find((group) => group.id === selectedId) ?? null;

  const handleOpenGroup = (id: string) => {
    setSelectedId(id);
    setIsSheetOpen(true);
  };

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
            <Card
              key={group.id}
              render={
                <button
                  type="button"
                  aria-haspopup="dialog"
                  aria-label={`View ${group.name}`}
                  onClick={() => handleOpenGroup(group.id)}
                />
              }
              className="cursor-pointer text-left transition-colors hover:border-foreground/25 hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              <div className="px-6 pt-6">
                <GroupImage src={group.imageUrl} alt={group.name} />
              </div>
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
                <div className="flex items-center justify-between gap-3">
                  <p className="text-muted-foreground text-sm">
                    {group.members}{" "}
                    {group.members === 1 ? "member" : "members"}
                  </p>
                  <span className="inline-flex items-center gap-1 font-medium text-sm">
                    View details
                    <ChevronRightIcon aria-hidden="true" className="size-4" />
                  </span>
                </div>
              </CardPanel>
            </Card>
          ))}
        </div>
      </div>

      <GroupSheet
        group={selectedGroup}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </section>
  );
}
