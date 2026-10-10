import { Badge } from "@/components/ui/badge";

const traits = ["Pet friendly", "Allergy free"];

/** Shown until groups store these flags. Not a real yes or no. */
export function GroupTraits({ size = "lg" }: { size?: "sm" | "lg" }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="sr-only">Not recorded yet.</span>
      {traits.map((trait) => (
        <Badge
          key={trait}
          variant="outline"
          size={size}
          title="Not recorded yet"
          className="border-dashed text-muted-foreground"
        >
          {trait}
        </Badge>
      ))}
    </div>
  );
}
