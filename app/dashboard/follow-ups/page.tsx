"use client";

import { useEffect, useState } from "react";
import { FollowUpSection } from "@/components/dashboard/FollowUpSection";
import { FollowUpSheet } from "@/components/dashboard/FollowUpSheet";
import { Card, CardPanel } from "@/components/ui/card";
import {
  compareByUrgency,
  getFollowUpSection,
  getFollowUpStage,
  type FollowUpSectionId,
  type FollowUpStage,
} from "@/lib/dashboard/follow-up-utils";
import { useAdmin } from "@/lib/dashboard/admin-context";
import { fetchContactPhone, fetchFollowUps } from "@/lib/dashboard/queries";
import type { FollowUp, FollowUpStep } from "@/lib/dashboard/types";
import { useDashboardQuery } from "@/lib/dashboard/use-dashboard-query";

const stages: {
  id: FollowUpStage;
  title: string;
  note: string;
  variant: "followUp" | "attended";
}[] = [
  {
    id: "not-reached",
    title: "Not reached out yet",
    note: "Nobody has contacted them",
    variant: "followUp",
  },
  {
    id: "reached-out",
    title: "Reached out",
    note: "Next: invite them to the group",
    variant: "followUp",
  },
  {
    id: "invited",
    title: "Invited",
    note: "Waiting for them to attend",
    variant: "followUp",
  },
  {
    id: "attended",
    title: "Attended, not yet added",
    note: "One step left",
    variant: "attended",
  },
];

export default function FollowUpsPage() {
  const query = useDashboardQuery(fetchFollowUps);

  if (query.status === "loading") {
    return (
      <PageMessage>Loading your follow-ups...</PageMessage>
    );
  }
  if (query.status === "error") {
    return (
      <PageMessage>
        We could not load your follow-ups. Refresh to try again.
      </PageMessage>
    );
  }

  return <FollowUpsView initialPeople={query.data} />;
}

function PageMessage({ children }: { children: React.ReactNode }) {
  return (
    <section className="px-5 py-10 sm:px-6 lg:py-14">
      <p className="mx-auto w-full max-w-6xl text-muted-foreground">
        {children}
      </p>
    </section>
  );
}

function FollowUpsView({ initialPeople }: { initialPeople: FollowUp[] }) {
  const admin = useAdmin();
  const [people, setPeople] = useState<FollowUp[]>(initialPeople);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Phone numbers are private, so look one up only when its sheet opens.
  useEffect(() => {
    const target = people.find((person) => person.id === selectedId);
    if (!target || target.phoneLookedUp) return;

    let isMounted = true;
    fetchContactPhone(admin, target.userId)
      .catch(() => "")
      .then((phone) => {
        if (!isMounted) return;
        setPeople((current) =>
          current.map((person) =>
            person.id === target.id
              ? { ...person, phone, phoneLookedUp: true }
              : person,
          ),
        );
      });

    return () => {
      isMounted = false;
    };
  }, [admin, people, selectedId]);

  const updatePerson = (id: string, update: (person: FollowUp) => FollowUp) => {
    setPeople((current) =>
      current.map((person) => (person.id === id ? update(person) : person)),
    );
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setIsSheetOpen(true);
  };

  const handleToggleStep = (id: string, step: FollowUpStep) => {
    updatePerson(id, (person) => ({
      ...person,
      progress: {
        ...person.progress,
        [step]: person.progress[step] ? null : "Today",
      },
    }));
  };

  const handleAddNote = (id: string, note: string) => {
    updatePerson(id, (person) => ({
      ...person,
      notes: [...person.notes, note],
    }));
  };

  const handleAddToGroup = (id: string) => {
    updatePerson(id, (person) => ({ ...person, outcome: "added" }));
    setIsSheetOpen(false);
  };

  const handleArchive = (id: string) => {
    updatePerson(id, (person) => ({ ...person, outcome: "archived" }));
    setIsSheetOpen(false);
  };

  const activePeople = people.filter((person) => person.outcome === "active");
  const bySection = (sectionId: FollowUpSectionId) =>
    activePeople.filter((person) => getFollowUpSection(person) === sectionId);
  const byStage = (stage: FollowUpStage) =>
    activePeople
      .filter((person) => getFollowUpStage(person) === stage)
      .sort(compareByUrgency);

  const stats = [
    { label: "Need attention", count: bySection("needs-attention").length },
    { label: "On track", count: bySection("on-track").length },
    { label: "Attended, not yet added", count: bySection("attended").length },
  ];
  const needsAttentionCount = stats[0].count;
  const selectedPerson =
    people.find((person) => person.id === selectedId) ?? null;

  return (
    <section className="px-5 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="font-heading text-balance text-3xl font-bold sm:text-4xl">
              {needsAttentionCount > 0
                ? `Hi ${admin.firstName}, ${needsAttentionCount} ${
                    needsAttentionCount === 1 ? "person needs" : "people need"
                  } a follow-up`
                : `Hi ${admin.firstName}, you're all caught up`}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {[admin.churchName, admin.serviceName].filter(Boolean).join(" · ")}
            </p>
            <p className="mt-1 text-muted-foreground text-sm">
              Select a person, or press Review, to see their follow-up. Changes
              you make here are not saved yet.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardPanel className="px-4 py-3 text-center">
                  <p className="font-heading text-2xl font-bold">{stat.count}</p>
                  <p className="mt-1 text-muted-foreground text-xs">
                    {stat.label}
                  </p>
                </CardPanel>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-8">
          {stages.map((section) => (
            <FollowUpSection
              key={section.id}
              title={section.title}
              note={section.note}
              variant={section.variant}
              people={byStage(section.id)}
              onSelect={handleSelect}
              onAddToGroup={handleAddToGroup}
            />
          ))}
        </div>

        <p className="mt-10 text-center text-muted-foreground text-sm">
          That&apos;s everything for now. Your next digest arrives Monday.
        </p>
      </div>

      <FollowUpSheet
        person={selectedPerson}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onToggleStep={handleToggleStep}
        onAddNote={handleAddNote}
        onAddToGroup={handleAddToGroup}
        onArchive={handleArchive}
      />
    </section>
  );
}
