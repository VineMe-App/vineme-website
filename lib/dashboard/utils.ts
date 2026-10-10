export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export const memberStatusVariants = {
  Connected: "success",
  "Pending follow-up": "warning",
  "Looking for a group": "info",
} as const;
