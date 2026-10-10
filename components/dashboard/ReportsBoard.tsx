"use client";

import { useState, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { FOLLOW_UP_WINDOW_DAYS } from "@/lib/dashboard/queries";
import type {
  ReportGroup,
  ReportPerson,
  ReportsData,
  SignupOutcome,
} from "@/lib/dashboard/types";

const outcomes: { key: SignupOutcome; label: string; color: string }[] = [
  { key: "attended", label: "Attended", color: "var(--color-emerald-500)" },
  { key: "requested", label: "Requested", color: "var(--color-amber-500)" },
  { key: "downloaded", label: "Downloaded", color: "var(--color-neutral-400)" },
];

const stages: { key: ReportPerson["pendingStage"] & string; label: string; color: string }[] = [
  { key: "not-reached", label: "Not contacted", color: "var(--chart-stage-1)" },
  { key: "reached-out", label: "Reached out", color: "var(--chart-stage-2)" },
  { key: "invited", label: "Invited", color: "var(--chart-stage-3)" },
  { key: "attended", label: "Attended", color: "var(--chart-stage-4)" },
];

const audiences = [
  { label: "Everyone", value: "all" },
  { label: "Newcomers", value: "newcomers" },
];

const chartFont = { fontFamily: "inherit" } as const;
const axisTick = { fill: "var(--muted-foreground)", fontSize: 12 };

interface Slice {
  key: string;
  label: string;
  value: number;
  color: string;
}

interface MonthRow {
  month: string;
  total: number;
  attended: number;
  requested: number;
  downloaded: number;
}

function monthKey(timestamp: string) {
  return timestamp.slice(0, 7);
}

function lastSixMonths(now: Date) {
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("en-GB", {
      month: "short",
      year: "numeric",
    });
    return { key, label };
  });
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardPanel>{children}</CardPanel>
    </Card>
  );
}

function LegendList({ items }: { items: Slice[] }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <ul className="flex flex-col gap-2" aria-label="Legend">
      {items.map((item) => {
        const share = total ? Math.round((item.value / total) * 100) : 0;
        return (
          <li key={item.key} className="flex items-center gap-2 text-sm">
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-full"
              style={{ background: item.color }}
            />
            <span className="text-foreground">{item.label}</span>
            <span className="text-muted-foreground">
              {item.value} · {share}%
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function Donut({
  slices,
  centreLabel,
}: {
  slices: Slice[];
  centreLabel: string;
}) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  if (total === 0) {
    return <p className="text-muted-foreground text-sm">Nothing to show yet.</p>;
  }

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
      <LegendList items={slices} />
      <div className="relative h-64 w-full max-w-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart style={chartFont}>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="label"
              innerRadius="62%"
              outerRadius="84%"
              paddingAngle={2}
              stroke="none"
              labelLine={false}
              label={({ percent }) =>
                percent && percent >= 0.05
                  ? `${Math.round(percent * 100)}%`
                  : ""
              }
            >
              {slices.map((slice) => (
                <Cell key={slice.key} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                const item = payload?.[0];
                if (!active || !item) return null;
                return (
                  <ChartTip
                    title={String(item.name)}
                    rows={[{ label: centreLabel, value: Number(item.value) }]}
                  />
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-3xl font-bold">{total}</span>
          <span className="text-muted-foreground text-xs">{centreLabel}</span>
        </div>
      </div>
    </div>
  );
}

function ChartTip({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: number; color?: string }[];
}) {
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-foreground">{title}</p>
      {rows.map((row) => (
        <p key={row.label} className="mt-1 flex items-center gap-2">
          {row.color ? (
            <span
              aria-hidden
              className="size-2 rounded-full"
              style={{ background: row.color }}
            />
          ) : null}
          <span className="text-muted-foreground">{row.label}</span>
          <span className="font-medium text-foreground">{row.value}</span>
        </p>
      ))}
    </div>
  );
}

function signupMonths(people: ReportPerson[], now: Date): MonthRow[] {
  return lastSixMonths(now).map(({ key, label }) => {
    const counts = { attended: 0, requested: 0, downloaded: 0 };
    for (const person of people) {
      if (monthKey(person.createdAt) === key) counts[person.outcome] += 1;
    }
    return {
      month: label,
      ...counts,
      total: counts.attended + counts.requested + counts.downloaded,
    };
  });
}

function DownloadsReport({ people }: { people: ReportPerson[] }) {
  const [audience, setAudience] = useState(audiences[0]);
  const visible =
    audience.value === "newcomers"
      ? people.filter((person) => person.isNewcomer)
      : people;
  const slices: Slice[] = outcomes.map((outcome) => ({
    key: outcome.key,
    label: outcome.label,
    color: outcome.color,
    value: visible.filter((person) => person.outcome === outcome.key).length,
  }));
  const months = signupMonths(visible, new Date());

  return (
    <div className="mt-6">
      <Select
        items={audiences}
        value={audience}
        onValueChange={(value) => {
          if (value) setAudience(value);
        }}
      >
        <SelectTrigger className="w-44" aria-label="Who to include">
          <SelectValue />
        </SelectTrigger>
        <SelectPopup>
          {audiences.map((item) => (
            <SelectItem key={item.value} value={item}>
              {item.label}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>

      <h2 className="mt-6 font-heading text-2xl font-bold">
        How many new downloads?
      </h2>
      <p className="mt-2 max-w-2xl text-muted-foreground text-sm">
        Attended means they are in a group or have been to one. Requested
        means they asked to join and are still waiting. Downloaded means they
        signed up and are not connected to a group yet.
      </p>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <ChartCard title="Total people">
          <Donut slices={slices} centreLabel="Total" />
        </ChartCard>
        <ChartCard
          title="People by the month they joined"
          description="Last 6 months, split by where they are now."
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={months} style={chartFont} margin={{ top: 20 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis
                  allowDecimals={false}
                  tick={axisTick}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <ChartTip
                        title={String(label)}
                        rows={payload.map((item) => ({
                          label: String(item.name),
                          value: Number(item.value),
                          color: item.color,
                        }))}
                      />
                    );
                  }}
                />
                {outcomes.map((outcome) => (
                  <Bar
                    key={outcome.key}
                    dataKey={outcome.key}
                    name={outcome.label}
                    stackId="people"
                    fill={outcome.color}
                    maxBarSize={40}
                    radius={
                      outcome.key === "attended" ? [4, 4, 0, 0] : undefined
                    }
                  >
                    {outcome.key === "attended" ? (
                      <LabelList dataKey="total" content={TotalLabel} />
                    ) : null}
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-center text-muted-foreground text-xs">
            Joined
          </p>
        </ChartCard>
      </div>
    </div>
  );
}

function TotalLabel({
  x,
  y,
  width,
  value,
}: {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  value?: unknown;
}) {
  const total = Number(value);
  if (!total) return <text />;
  const xPos = Number(x ?? 0);
  const yPos = Number(y ?? 0);
  const barWidth = Number(width ?? 0);

  return (
    <text
      x={xPos + barWidth / 2}
      y={yPos - 6}
      textAnchor="middle"
      fill="var(--foreground)"
      fontSize={12}
    >
      {total}
    </text>
  );
}

function PipelineReport({ people }: { people: ReportPerson[] }) {
  const rows = stages.map((stage) => ({
    stage: stage.label,
    color: stage.color,
    people: people.filter((person) => person.pendingStage === stage.key).length,
  }));
  const total = rows.reduce((sum, row) => sum + row.people, 0);

  return (
    <div className="mt-6">
      <h2 className="font-heading text-2xl font-bold">
        How is the pipeline looking?
      </h2>
      <p className="mt-2 max-w-2xl text-muted-foreground text-sm">
        Open follow-ups, by the furthest stage recorded on the request.
      </p>
      <div className="mt-6">
        <ChartCard title="Pending requests by stage">
          {total === 0 ? (
            <p className="text-muted-foreground text-sm">
              No open follow-ups.
            </p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rows} style={chartFont} margin={{ top: 20 }}>
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="stage" tick={axisTick} axisLine={false} tickLine={false} />
                  <YAxis
                    allowDecimals={false}
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                    width={28}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      const item = payload?.[0];
                      if (!active || !item) return null;
                      return (
                        <ChartTip
                          title={String(label)}
                          rows={[
                            {
                              label: "People",
                              value: Number(item.value),
                              color: String(item.payload.color),
                            },
                          ]}
                        />
                      );
                    }}
                  />
                  <Bar dataKey="people" maxBarSize={48} radius={[4, 4, 0, 0]}>
                    {rows.map((row) => (
                      <Cell key={row.stage} fill={row.color} />
                    ))}
                    <LabelList dataKey="people" position="top" fill="var(--foreground)" fontSize={12} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

function GroupsReport({ groups }: { groups: ReportGroup[] }) {
  return (
    <div className="mt-6">
      <h2 className="font-heading text-2xl font-bold">How are my groups doing?</h2>
      <p className="mt-2 max-w-2xl text-muted-foreground text-sm">
        Active members in each approved group. Red bars are at capacity.
      </p>
      <div className="mt-6">
        <ChartCard title="Members by group">
          {groups.length === 0 ? (
            <p className="text-muted-foreground text-sm">No approved groups yet.</p>
          ) : (
            <div style={{ height: Math.max(280, groups.length * 36) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={groups}
                  layout="vertical"
                  style={chartFont}
                  margin={{ right: 24, left: 8 }}
                >
                  <CartesianGrid horizontal={false} stroke="var(--border)" />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={150}
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      const item = payload?.[0];
                      if (!active || !item) return null;
                      const group = item.payload as ReportGroup;
                      return (
                        <ChartTip
                          title={group.name}
                          rows={[
                            { label: "Members", value: group.members },
                            { label: "Waiting", value: group.pending },
                          ]}
                        />
                      );
                    }}
                  />
                  <Bar dataKey="members" maxBarSize={18} radius={[0, 4, 4, 0]}>
                    {groups.map((group) => (
                      <Cell
                        key={group.id}
                        fill={
                          group.atCapacity
                            ? "var(--color-rose-500)"
                            : "var(--color-emerald-500)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

function teamSlice(people: ReportPerson[], now: number): Slice[] {
  const counts = { attention: 0, track: 0, attended: 0 };
  for (const person of people) {
    if (!person.pendingStage || !person.pendingSince) continue;
    if (person.pendingStage === "attended") {
      counts.attended += 1;
      continue;
    }
    const days = Math.floor((now - new Date(person.pendingSince).getTime()) / 864e5);
    if (days > FOLLOW_UP_WINDOW_DAYS) counts.attention += 1;
    else counts.track += 1;
  }
  return [
    { key: "attention", label: "Needs your attention", value: counts.attention, color: "var(--color-rose-500)" },
    { key: "track", label: "On track", value: counts.track, color: "var(--color-amber-500)" },
    { key: "attended", label: "Attended, not yet added", value: counts.attended, color: "var(--color-emerald-500)" },
  ];
}

function TeamReport({ people }: { people: ReportPerson[] }) {
  const [now] = useState(() => Date.now());

  return (
    <div className="mt-6">
      <h2 className="font-heading text-2xl font-bold">How are we doing as a team?</h2>
      <p className="mt-2 max-w-2xl text-muted-foreground text-sm">
        Open follow-ups, split the same way as the Follow-ups page. A request
        needs attention once it has waited more than {FOLLOW_UP_WINDOW_DAYS}{" "}
        days without moving on.
      </p>
      <div className="mt-6">
        <ChartCard title="Open follow-ups">
          <Donut slices={teamSlice(people, now)} centreLabel="Open" />
        </ChartCard>
      </div>
    </div>
  );
}

function NewcomersReport({ people }: { people: ReportPerson[] }) {
  const slices: Slice[] = [
    {
      key: "newcomer",
      label: "Newcomer",
      color: "var(--brand-pink)",
      value: people.filter((person) => person.isNewcomer).length,
    },
    {
      key: "returning",
      label: "Not a newcomer",
      color: "var(--color-neutral-400)",
      value: people.filter((person) => !person.isNewcomer).length,
    },
  ];
  const months = lastSixMonths(new Date()).map(({ key, label }) => {
    const joined = people.filter((person) => monthKey(person.createdAt) === key);
    const newcomer = joined.filter((person) => person.isNewcomer).length;
    return { month: label, newcomer, returning: joined.length - newcomer, total: joined.length };
  });

  return (
    <div className="mt-6">
      <h2 className="font-heading text-2xl font-bold">Newcomers</h2>
      <p className="mt-2 max-w-2xl text-muted-foreground text-sm">
        The newcomer flag is how someone is marked today, not the month they
        arrived.
      </p>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <ChartCard title="Newcomers at your church">
          <Donut slices={slices} centreLabel="People" />
        </ChartCard>
        <ChartCard
          title="Who joined, last 6 months"
          description="Split by whether they are marked as a newcomer now."
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={months} style={chartFont} margin={{ top: 20 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <ChartTip
                        title={String(label)}
                        rows={payload.map((item) => ({
                          label: String(item.name),
                          value: Number(item.value),
                          color: item.color,
                        }))}
                      />
                    );
                  }}
                />
                <Bar dataKey="returning" name="Not a newcomer" stackId="joined" fill="var(--color-neutral-400)" maxBarSize={40} />
                <Bar dataKey="newcomer" name="Newcomer" stackId="joined" fill="var(--brand-pink)" maxBarSize={40} radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="total" content={TotalLabel} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

function connectionSlices(people: ReportPerson[]): Slice[] {
  const counts = { inGroup: 0, asked: 0, looking: 0 };
  for (const person of people) {
    if (person.outcome === "attended") counts.inGroup += 1;
    else if (person.askedForHelp) counts.asked += 1;
    else counts.looking += 1;
  }
  return [
    { key: "in-group", label: "In a group", value: counts.inGroup, color: "var(--color-emerald-500)" },
    { key: "asked", label: "Asked for help", value: counts.asked, color: "var(--color-amber-500)" },
    { key: "looking", label: "Not connected", value: counts.looking, color: "var(--color-neutral-400)" },
  ];
}

function ConnectionReport({ people }: { people: ReportPerson[] }) {
  return (
    <div className="mt-6">
      <h2 className="font-heading text-2xl font-bold">Connection</h2>
      <p className="mt-2 max-w-2xl text-muted-foreground text-sm">
        Asked for help means they told us they cannot find a group and they
        are not in one yet.
      </p>
      <div className="mt-6">
        <ChartCard title="How people are connected">
          <Donut slices={connectionSlices(people)} centreLabel="People" />
        </ChartCard>
      </div>
    </div>
  );
}

const tabs = [
  { value: "downloads", label: "How many new downloads?" },
  { value: "pipeline", label: "How is the pipeline looking?" },
  { value: "groups", label: "How are my groups doing?" },
  { value: "team", label: "How are we doing as a team?" },
  { value: "newcomers", label: "Newcomers" },
  { value: "connection", label: "Connection" },
];

export function ReportsBoard({ data }: { data: ReportsData }) {
  return (
    <Tabs defaultValue="downloads" className="mt-8 gap-0">
      <div className="overflow-x-auto border-b">
        <TabsList variant="underline" className="w-max justify-start">
          {tabs.map((tab) => (
            <TabsTab key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTab>
          ))}
        </TabsList>
      </div>
      <TabsPanel value="downloads">
        <DownloadsReport people={data.people} />
      </TabsPanel>
      <TabsPanel value="pipeline">
        <PipelineReport people={data.people} />
      </TabsPanel>
      <TabsPanel value="groups">
        <GroupsReport groups={data.groups} />
      </TabsPanel>
      <TabsPanel value="team">
        <TeamReport people={data.people} />
      </TabsPanel>
      <TabsPanel value="newcomers">
        <NewcomersReport people={data.people} />
      </TabsPanel>
      <TabsPanel value="connection">
        <ConnectionReport people={data.people} />
      </TabsPanel>
    </Tabs>
  );
}
