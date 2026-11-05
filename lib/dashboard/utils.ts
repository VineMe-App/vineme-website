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

/** "Led by Sam", "Led by Sam and Alex", "Led by Sam and Alex +1", or "No leader yet". */
export function ledByLabel(leaders: string[]): string {
  if (leaders.length === 0) return "No leader yet";
  const [first, second, ...rest] = leaders;
  if (!second) return `Led by ${first}`;
  return `Led by ${first} and ${second}${rest.length ? ` +${rest.length}` : ""}`;
}
