import { ChevronRightIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import type { Member } from "@/lib/dashboard/types";
import { getInitials, memberStatusVariants } from "@/lib/dashboard/utils";

interface MemberTableRowProps {
  member: Member;
  onSelect: (id: string) => void;
  showJoined?: boolean;
}

export function MemberTableRow({
  member,
  onSelect,
  showJoined = false,
}: MemberTableRowProps) {
  return (
    <TableRow
      className="cursor-pointer hover:bg-accent/50"
      onClick={() => onSelect(member.id)}
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
          </Avatar>
          <p className="font-medium text-foreground">{member.name}</p>
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
      {showJoined ? (
        <TableCell className="text-muted-foreground">{member.joined}</TableCell>
      ) : null}
      <TableCell className="text-right">
        <Button
          variant="outline"
          size="sm"
          aria-label={`View ${member.name}`}
          aria-haspopup="dialog"
        >
          View
          <ChevronRightIcon />
        </Button>
      </TableCell>
    </TableRow>
  );
}
