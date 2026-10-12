import { Accessibility, Dog, NutOff, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GroupTraitsProps {
  groupId: string;
  groupName: string;
  size?: "sm" | "lg";
}

interface Trait {
  label: string;
  icon?: LucideIcon;
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
  if (hasPlaceholderTrait(groupId, "pet")) {
    traits.push({ label: "Pet friendly", icon: Dog });
  }
  if (hasPlaceholderTrait(groupId, "allergy")) {
    traits.push({ label: "Allergy free", icon: NutOff });
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
