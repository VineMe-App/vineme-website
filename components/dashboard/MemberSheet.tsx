"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAdmin } from "@/lib/dashboard/admin-context";
import { fetchContactPhone } from "@/lib/dashboard/queries";
import type { Member } from "@/lib/dashboard/types";
import { getInitials, memberStatusVariants } from "@/lib/dashboard/utils";

interface MemberSheetProps {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PhoneState =
  | { status: "loading" }
  | { status: "ready"; phone: string }
  | { status: "error" };

export function MemberSheet({ member, open, onOpenChange }: MemberSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetPopup className="sm:max-w-lg">
        {member ? <MemberDetails key={member.id} member={member} /> : null}
      </SheetPopup>
    </Sheet>
  );
}

function MemberDetails({ member }: { member: Member }) {
  const admin = useAdmin();
  const [phoneState, setPhoneState] = useState<PhoneState>({
    status: "loading",
  });

  // Phone numbers are private, so look one up only when the sheet opens.
  useEffect(() => {
    let isMounted = true;
    fetchContactPhone(admin, member.id)
      .then((phone) => isMounted && setPhoneState({ status: "ready", phone }))
      .catch(() => isMounted && setPhoneState({ status: "error" }));
    return () => {
      isMounted = false;
    };
  }, [admin, member.id]);

  const phone = phoneState.status === "ready" ? phoneState.phone : "";
  const phoneDigits = phone.replace(/\D/g, "");
  const hasPending = member.memberships.some((m) => m.status === "pending");

  return (
    <>
      <SheetHeader>
        <div className="flex items-center gap-3">
          <Avatar className="size-12">
            <AvatarFallback className="text-sm">
              {getInitials(member.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <SheetTitle>{member.name}</SheetTitle>
            <SheetDescription>Joined {member.joinedOn}</SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <SheetPanel>
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" size="lg">
              {member.role}
            </Badge>
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
            {member.isNewcomer ? (
              <Badge variant="info" size="lg">
                New to church
              </Badge>
            ) : null}
          </div>

          <section aria-labelledby="member-contact">
            <h3
              id="member-contact"
              className="font-medium text-muted-foreground text-sm"
            >
              Contact
            </h3>
            {phoneState.status === "loading" ? (
              <p className="mt-1 text-muted-foreground">
                Looking up their number...
              </p>
            ) : phone ? (
              <>
                <p className="mt-1 font-medium">{phone}</p>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    render={<a href={`tel:${phone}`} />}
                  >
                    Call
                  </Button>
                  <Button
                    variant="outline"
                    render={
                      <a
                        href={`https://wa.me/${phoneDigits}`}
                        target="_blank"
                        rel="noreferrer"
                      />
                    }
                  >
                    WhatsApp
                  </Button>
                </div>
              </>
            ) : (
              <p className="mt-1 text-muted-foreground">
                {phoneState.status === "error"
                  ? "We could not look up their number."
                  : "No phone number on file."}
              </p>
            )}
          </section>

          <section aria-labelledby="member-about">
            <h3
              id="member-about"
              className="font-medium text-muted-foreground text-sm"
            >
              About
            </h3>
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">
              {member.bio || "They have not added a bio yet."}
            </p>
          </section>

          <section aria-labelledby="member-groups">
            <h3
              id="member-groups"
              className="font-medium text-muted-foreground text-sm"
            >
              Groups
            </h3>
            {member.memberships.length === 0 ? (
              <p className="mt-1 text-muted-foreground text-sm">
                Not in a group yet and has no open request.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {member.memberships.map((membership, index) => (
                  <li
                    key={`${membership.group}-${index}`}
                    className="flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm"
                  >
                    <span className="flex-1 font-medium">
                      {membership.group}
                    </span>
                    {membership.role === "leader" ? (
                      <Badge variant="secondary">Leader</Badge>
                    ) : null}
                    {membership.status === "pending" ? (
                      <Badge variant="warning">Waiting</Badge>
                    ) : (
                      <Badge variant="success">Member</Badge>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </SheetPanel>

      <SheetFooter className="flex-col sm:flex-col">
        {hasPending ? (
          <Button
            size="xl"
            className="w-full"
            render={<Link href="/dashboard/follow-ups" />}
          >
            Review their follow-up
          </Button>
        ) : null}
        <Button
          size="xl"
          variant="outline"
          className="w-full"
          render={<Link href="/dashboard/groups" />}
        >
          Browse groups
        </Button>
      </SheetFooter>
    </>
  );
}
