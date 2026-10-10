"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CardFrame,
  CardFrameAction,
  CardFrameHeader,
  CardFrameTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getProgressLabel,
  getRequestedLabel,
} from "@/lib/dashboard/follow-up-utils";
import type { FollowUp } from "@/lib/dashboard/sample-data";
import { getInitials } from "@/lib/dashboard/utils";

interface FollowUpSectionProps {
  title: string;
  note: string;
  people: FollowUp[];
  variant: "followUp" | "attended";
  onSelect: (id: string) => void;
  onAddToGroup: (id: string) => void;
}

export function FollowUpSection({
  title,
  note,
  people,
  variant,
  onSelect,
  onAddToGroup,
}: FollowUpSectionProps) {
  if (people.length === 0) return null;

  return (
    <CardFrame>
      <CardFrameHeader>
        <CardFrameTitle>{title}</CardFrameTitle>
        <CardFrameAction>
          <span className="text-muted-foreground text-sm">{note}</span>
        </CardFrameAction>
      </CardFrameHeader>
      <Table variant="card" className="min-w-[640px] table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[38%]">Person</TableHead>
            <TableHead className="w-[28%]">Where they are</TableHead>
            <TableHead className="w-[34%] text-right">
              {variant === "attended" ? "Next step" : "Follow-up window"}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {people.map((person) => (
            <TableRow
              key={person.id}
              className="cursor-pointer"
              onClick={() => onSelect(person.id)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <button
                      type="button"
                      className="rounded-sm text-left font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {person.name}
                    </button>
                    <p className="text-muted-foreground text-xs">
                      {getRequestedLabel(person)}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{getProgressLabel(person)}</TableCell>
              <TableCell className="text-right">
                {variant === "attended" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      onAddToGroup(person.id);
                    }}
                  >
                    Add to group
                  </Button>
                ) : (
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {person.fromEmail ? (
                      <Badge variant="outline" size="lg">
                        From your email
                      </Badge>
                    ) : null}
                    {person.overdueDays ? (
                      <Badge variant="error" size="lg">
                        Overdue {person.overdueDays} days
                      </Badge>
                    ) : (
                      <Badge variant="outline" size="lg">
                        Due in {person.dueInDays} days
                      </Badge>
                    )}
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardFrame>
  );
}
