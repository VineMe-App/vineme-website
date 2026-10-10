import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { groups } from "@/lib/dashboard/sample-data";

export default function GroupsPage() {
  return (
    <section className="px-5 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="font-heading text-3xl font-bold sm:text-4xl">
          My groups
        </h1>
        <p className="mt-2 text-muted-foreground">
          The groups you lead or help look after.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {groups.map((group) => {
            const isFull = group.members >= group.capacity;
            const spaces = group.capacity - group.members;

            return (
              <Card key={group.id}>
                <CardHeader>
                  <CardTitle className="text-xl">{group.name}</CardTitle>
                  <CardDescription>
                    {group.area} · {group.meets}
                  </CardDescription>
                </CardHeader>
                <CardPanel className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" size="lg">
                      Led by {group.leader}
                    </Badge>
                    {isFull ? (
                      <Badge variant="error" size="lg">
                        At capacity
                      </Badge>
                    ) : (
                      <Badge variant="success" size="lg">
                        {spaces} {spaces === 1 ? "space" : "spaces"} left
                      </Badge>
                    )}
                    {group.pendingFollowUps > 0 ? (
                      <Badge variant="warning" size="lg">
                        {group.pendingFollowUps} to follow up
                      </Badge>
                    ) : null}
                  </div>
                  <Progress
                    value={(group.members / group.capacity) * 100}
                    aria-label={`${group.name} capacity`}
                  />
                  <p className="text-muted-foreground text-sm">
                    {group.members} of {group.capacity} places filled
                  </p>
                </CardPanel>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
