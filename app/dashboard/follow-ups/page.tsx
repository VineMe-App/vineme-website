"use client";

import { useState } from "react";
import { FollowUpSection } from "@/components/dashboard/FollowUpSection";
import { FollowUpSheet } from "@/components/dashboard/FollowUpSheet";
import { Card, CardPanel } from "@/components/ui/card";
import {
  getFollowUpSection,
  type FollowUpSectionId,
} from "@/lib/dashboard/follow-up-utils";
import {
  adminUser,
  followUps,
  type FollowUp,
  type FollowUpStep,
} from "@/lib/dashboard/sample-data";

const sections: {
  id: FollowUpSectionId;
  title: string;
  note: string;
  variant: "followUp" | "attended";
}[] = [
  {
    id: "needs-attention",
    title: "Needs your attention",
    note: "Outside the follow-up window",
    variant: "followUp",
  },
  {
    id: "on-track",
    title: "On track",
    note: "Within the follow-up window",
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
  const [people, setPeople] = useState<FollowUp[]>(followUps);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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
                ? `Hi ${adminUser.firstName}, ${needsAttentionCount} ${
                    needsAttentionCount === 1 ? "person needs" : "people need"
                  } a follow-up`
                : `Hi ${adminUser.firstName}, you're all caught up`}
            </h1>
            <p className="mt-2 text-muted-foreground">
              Beta Connect · Tower Bridge
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
          {sections.map((section) => (
            <FollowUpSection
              key={section.id}
              title={section.title}
              note={section.note}
              variant={section.variant}
              people={bySection(section.id)}
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
