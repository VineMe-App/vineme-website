"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { MemberSheet } from "@/components/dashboard/MemberSheet";
import { MemberTableRow } from "@/components/dashboard/MemberTableRow";
import {
  CardFrame,
  CardFrameDescription,
  CardFrameHeader,
  CardFrameTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchMembers } from "@/lib/dashboard/queries";
import { useDashboardQuery } from "@/lib/dashboard/use-dashboard-query";

export default function MembersPage() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const result = useDashboardQuery(fetchMembers);
  const members = result.data ?? [];
  const normalisedQuery = query.trim().toLowerCase();
  const selectedMember =
    members.find((member) => member.id === selectedId) ?? null;
  const handleSelect = (id: string) => {
    setSelectedId(id);
    setIsSheetOpen(true);
  };
  const visibleMembers = members.filter((member) =>
    [member.name, member.group, member.role, member.status].some((value) =>
      value.toLowerCase().includes(normalisedQuery),
    ),
  );

  return (
    <section className="px-5 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="font-heading text-3xl font-bold sm:text-4xl">Members</h1>
        <p className="mt-2 text-muted-foreground">
          Everyone connected to your church on VineMe.
        </p>

        <CardFrame className="mt-8">
          <CardFrameHeader>
            <CardFrameTitle>All members</CardFrameTitle>
            <CardFrameDescription>
              {result.status === "loading"
                ? "Loading..."
                : result.status === "error"
                  ? "We could not load your members. Refresh to try again."
                  : `${visibleMembers.length} of ${members.length} people`}
            </CardFrameDescription>
          </CardFrameHeader>
          <div className="relative px-6 pb-4">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute start-9 top-[calc(50%-0.5rem)] z-10 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              className="[&_input]:ps-9"
              type="search"
              name="member-search"
              aria-label="Search members"
              placeholder="Search by name, group, role or status"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <Table variant="card" className="min-w-[720px]">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleMembers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
                  >
                    {result.status === "ready" && members.length === 0
                      ? "No members yet."
                      : result.status === "ready"
                        ? <>No members match &ldquo;{query}&rdquo;.</>
                        : "Loading..."}
                  </TableCell>
                </TableRow>
              ) : (
                visibleMembers.map((member) => (
                  <MemberTableRow
                    key={member.id}
                    member={member}
                    onSelect={handleSelect}
                    showJoined
                  />
                ))
              )}
            </TableBody>
          </Table>
        </CardFrame>
      </div>

      <MemberSheet
        member={selectedMember}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </section>
  );
}
