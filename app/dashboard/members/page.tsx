"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { getInitials, memberStatusVariants } from "@/lib/dashboard/utils";

export default function MembersPage() {
  const [query, setQuery] = useState("");
  const result = useDashboardQuery(fetchMembers);
  const members = result.data ?? [];
  const normalisedQuery = query.trim().toLowerCase();
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
          <div className="px-6 pb-4">
            <Input
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
                <TableHead className="text-right">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleMembers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
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
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="font-medium text-foreground">
                          {member.name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" size="lg">
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{member.group}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          memberStatusVariants[
                            member.status as keyof typeof memberStatusVariants
                          ] ?? "outline"
                        }
                        size="lg"
                      >
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {member.joined}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardFrame>
      </div>
    </section>
  );
}
