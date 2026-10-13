import { Accessibility, Dog, PawPrint, Slash, type LucideIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface GroupTraitsProps {
  groupId: string;
  groupName: string;
  size?: "sm" | "lg";
}

function PetFreeIcon({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      {...props}
      className={cn("relative inline-flex size-3.5 sm:size-3", className)}
    >
      <PawPrint aria-hidden="true" className="size-full" />
      <Slash aria-hidden="true" className="absolute inset-0 size-full" />
    </span>
  );
}

interface Trait {
  label: string;
  icon?: LucideIcon | typeof PetFreeIcon;
}

/** Stable stand-in until `groups` has columns for these flags. */
function hasPlaceholderTrait(groupId: string, salt: string) {
  let hash = 0;
  const value = `${salt}:${groupId}`;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash % 2 === 0;
}

function traitsFor(groupId: string, groupName: string): Trait[] {
  const traits: Trait[] = [];
  const petFriendly = hasPlaceholderTrait(groupId, "pet");
  if (petFriendly) {
    traits.push({ label: "Pet friendly", icon: Dog });
  } else if (hasPlaceholderTrait(groupId, "allergy")) {
    traits.push({ label: "Pet free", icon: PetFreeIcon });
  }
  if (groupName.trim().toLowerCase() === "south kensington connect") {
    traits.push({ label: "Accessible", icon: Accessibility });
  }
  return traits;
}

export function GroupTraits({
  groupId,
  groupName,
  size = "lg",
}: GroupTraitsProps) {
  const traits = traitsFor(groupId, groupName);
  if (traits.length === 0) return null;

  return (
    <>
      {traits.map((trait) => {
        const Icon = trait.icon;
        return (
          <Badge key={trait.label} variant="outline" size={size}>
            {Icon ? <Icon aria-hidden="true" /> : null}
            {trait.label}
          </Badge>
        );
      })}
    </>
  );
}
