"use client";

import { ChevronRightIcon } from "lucide-react";
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
      <Table variant="card" className="min-w-[860px] table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[27%]">Person</TableHead>
            <TableHead className="w-[22%]">Where they are</TableHead>
            <TableHead className="w-[27%] text-right">
              {variant === "attended" ? "Status" : "Follow-up window"}
            </TableHead>
            <TableHead className="w-[24%] text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {people.map((person) => (
            <TableRow
              key={person.id}
              className="cursor-pointer hover:bg-accent/50"
              onClick={() => onSelect(person.id)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{person.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {getRequestedLabel(person)}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{getProgressLabel(person)}</TableCell>
              <TableCell className="text-right">
                {variant === "attended" ? (
                  <Badge variant="success" size="lg">
                    Ready to add
                  </Badge>
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
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {variant === "attended" ? (
                    <Button
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        onAddToGroup(person.id);
                      }}
                    >
                      Add to group
                    </Button>
                  ) : null}
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={`Review ${person.name}`}
                    aria-haspopup="dialog"
                  >
                    Review
                    <ChevronRightIcon />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardFrame>
  );
}
