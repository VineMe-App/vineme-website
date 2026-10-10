import type { AdminContextValue } from "@/lib/dashboard/admin-context";
import type {
  FollowUp,
  Group,
  Member,
  OverviewData,
} from "@/lib/dashboard/types";

/** Days after the last follow-up step before someone counts as overdue. */
export const FOLLOW_UP_WINDOW_DAYS = 7;

const DAY_MS = 864e5;

type Maybe<T> = T | T[] | null | undefined;

const one = <T,>(value: Maybe<T>): T | null =>
  (Array.isArray(value) ? value[0] : value) ?? null;

function formatDay(timestamp: string) {
  return new Date(timestamp).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function formatMonthYear(timestamp: string) {
  return new Date(timestamp).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
}

function daysSince(timestamp: string, now: number) {
  return Math.max(0, Math.floor((now - new Date(timestamp).getTime()) / DAY_MS));
}

function check(...results: { error: unknown }[]) {
  const failed = results.find((result) => result.error);
  if (failed) throw failed.error;
}

type MembershipRow = {
  role: string;
  status: string;
  groups: Maybe<{ title: string }>;
};

type MemberRow = {
  id: string;
  name: string | null;
  roles: string[] | null;
  created_at: string;
  group_memberships: MembershipRow[];
};

function toMember(user: MemberRow): Member {
  const memberships = user.group_memberships ?? [];
  const active = memberships.find((m) => m.status === "active");
  const pending = memberships.find((m) => m.status === "pending");
  const current = active ?? pending;

  const role = user.roles?.includes("church_admin")
    ? "Admin"
    : active && ["leader", "admin"].includes(active.role)
      ? "Group Leader"
      : "Congregation";

  const status = active
    ? "Connected"
    : pending
      ? "Pending follow-up"
      : "Looking for a group";

  return {
    id: user.id,
    name: user.name || "Unnamed",
    role,
    status,
    group: one(current?.groups)?.title ?? "Unassigned",
    joined: formatMonthYear(user.created_at),
  };
}

const memberColumns =
  "id, name, roles, created_at, group_memberships(role, status, groups(title))";

export async function fetchMembers({
  supabase,
  churchId,
}: AdminContextValue): Promise<Member[]> {
  const result = await supabase
    .from("users")
    .select(memberColumns)
    .eq("church_id", churchId)
    .order("created_at", { ascending: false })
    .limit(500);
  check(result);
  return ((result.data ?? []) as unknown as MemberRow[]).map(toMember);
}

export async function fetchOverview({
  supabase,
  churchId,
}: AdminContextValue): Promise<OverviewData> {
  const count = { count: "exact", head: true } as const;

  const [totalPeople, pendingFollowUps, groupsAtCapacity, recent] =
    await Promise.all([
      supabase.from("users").select("id", count).eq("church_id", churchId),
      supabase
        .from("group_memberships")
        .select("id, groups!inner(church_id)", count)
        .eq("groups.church_id", churchId)
        .eq("status", "pending"),
      supabase
        .from("groups")
        .select("id", count)
        .eq("church_id", churchId)
        .eq("status", "approved")
        .eq("at_capacity", true),
      supabase
        .from("users")
        .select(memberColumns)
        .eq("church_id", churchId)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);
  check(totalPeople, pendingFollowUps, groupsAtCapacity, recent);

  return {
    totalPeople: totalPeople.count ?? 0,
    pendingFollowUps: pendingFollowUps.count ?? 0,
    groupsAtCapacity: groupsAtCapacity.count ?? 0,
    members: ((recent.data ?? []) as unknown as MemberRow[]).map(toMember),
  };
}

type GroupRow = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  whatsapp_link: string | null;
  meeting_day: string | null;
  meeting_time: string | null;
  at_capacity: boolean;
  location: { name?: string; address?: string } | null;
  group_memberships: {
    role: string;
    status: string;
    member: Maybe<{ name: string | null }>;
  }[];
};

export async function fetchGroups({
  supabase,
  churchId,
}: AdminContextValue): Promise<Group[]> {
  const result = await supabase
    .from("groups")
    .select(
      "id, title, description, image_url, whatsapp_link, meeting_day, meeting_time, at_capacity, location, group_memberships(role, status, member:users!group_memberships_user_id_fkey(name))",
    )
    .eq("church_id", churchId)
    .eq("status", "approved")
    .order("title", { ascending: true });
  check(result);

  return ((result.data ?? []) as unknown as GroupRow[])
    .map((group) => {
      const memberships = group.group_memberships ?? [];
      const leader = memberships.find(
        (m) => m.status === "active" && m.role === "leader",
      );
      const time = group.meeting_time?.slice(0, 5);

      return {
        id: group.id,
        name: group.title,
        description: group.description?.trim() ?? "",
        imageUrl: group.image_url || null,
        whatsappLink: group.whatsapp_link || null,
        address: group.location?.address ?? "",
        people: memberships
          .filter((m) => m.status === "active" || m.status === "pending")
          .map((m) => ({
            name: one(m.member)?.name || "Unnamed",
            role: m.role,
            status: m.status,
          }))
          .sort(
            (a, b) =>
              Number(b.role === "leader") - Number(a.role === "leader") ||
              Number(a.status === "pending") - Number(b.status === "pending") ||
              a.name.localeCompare(b.name),
          ),
        area: group.location?.name ?? group.location?.address ?? "No location",
        meets:
          [group.meeting_day ? `${group.meeting_day}s` : null, time]
            .filter(Boolean)
            .join(", ") || "Meeting time not set",
        leader: one(leader?.member)?.name || "No leader yet",
        members: memberships.filter((m) => m.status === "active").length,
        atCapacity: group.at_capacity,
        pendingFollowUps: memberships.filter((m) => m.status === "pending")
          .length,
      };
    })
    .sort((a, b) => b.pendingFollowUps - a.pendingFollowUps);
}

type FollowUpRow = {
  id: string;
  user_id: string;
  created_at: string;
  journey_status: number | null;
  member: Maybe<{ name: string | null }>;
  groups: Maybe<{ title: string }>;
};

type NoteRow = {
  membership_id: string;
  note_type: string;
  note_text: string | null;
  new_journey_status: number | null;
  created_at: string;
};

export async function fetchFollowUps({
  supabase,
  churchId,
}: AdminContextValue): Promise<FollowUp[]> {
  const [requests, notes] = await Promise.all([
    supabase
      .from("group_memberships")
      .select(
        "id, user_id, created_at, journey_status, member:users!group_memberships_user_id_fkey(name), groups!inner(title, church_id)",
      )
      .eq("groups.church_id", churchId)
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(200),
    supabase
      .from("group_membership_notes")
      .select(
        "membership_id, note_type, note_text, new_journey_status, created_at, groups!inner(church_id)",
      )
      .eq("groups.church_id", churchId)
      .in("note_type", ["manual", "journey_status_change"])
      .order("created_at", { ascending: true })
      .limit(2000),
  ]);
  check(requests, notes);

  const notesByMembership = new Map<string, NoteRow[]>();
  for (const note of (notes.data ?? []) as unknown as NoteRow[]) {
    const list = notesByMembership.get(note.membership_id) ?? [];
    list.push(note);
    notesByMembership.set(note.membership_id, list);
  }

  const now = Date.now();

  return ((requests.data ?? []) as unknown as FollowUpRow[]).map((row) => {
    const history = notesByMembership.get(row.id) ?? [];
    const journey = row.journey_status ?? 0;

    // Journey status: 1 reached out, 2 spoken to (invited), 3 attended group.
    const stepDate = (status: number) => {
      const reached = history
        .filter((note) => note.new_journey_status === status)
        .at(-1);
      return reached ? formatDay(reached.created_at) : "earlier";
    };

    const lastJourneyNote = history
      .filter((note) => note.note_type === "journey_status_change")
      .at(-1);
    const lastActivity = lastJourneyNote?.created_at;
    const dueAt =
      new Date(lastActivity ?? row.created_at).getTime() +
      FOLLOW_UP_WINDOW_DAYS * DAY_MS;
    const daysLate = Math.floor((now - dueAt) / DAY_MS);

    return {
      id: row.id,
      userId: row.user_id,
      name: one(row.member)?.name || "Unnamed",
      group: one(row.groups)?.title ?? "Group",
      requestedOn: formatDay(row.created_at),
      requestedDaysAgo: daysSince(row.created_at, now),
      overdueDays: now > dueAt ? Math.max(1, daysLate) : undefined,
      dueInDays: now > dueAt ? undefined : Math.ceil((dueAt - now) / DAY_MS),
      phone: "",
      progress: {
        reachedOut: journey >= 1 ? stepDate(1) : null,
        invited: journey >= 2 ? stepDate(2) : null,
        attended: journey >= 3 ? stepDate(3) : null,
      },
      lastUpdatedOn: lastActivity ? formatDay(lastActivity) : undefined,
      lastUpdateNote: lastJourneyNote?.note_text ?? undefined,
      notes: history
        .filter((note) => note.note_type === "manual" && note.note_text)
        .map((note) => note.note_text as string),
      outcome: "active" as const,
    };
  });
}

/**
 * Churches this admin may switch between. A church admin belongs to one
 * church (`users.church_id`); only a superadmin can see them all. Extend this
 * one function if admins are ever linked to several churches.
 */
export async function fetchAccessibleChurches(
  { supabase }: Pick<AdminContextValue, "supabase">,
  home: { id: string; name: string },
  roles: string[],
): Promise<{ id: string; name: string }[]> {
  if (!roles.includes("superadmin")) return [home];

  const { data, error } = await supabase
    .from("churches")
    .select("id, name")
    .order("name", { ascending: true });
  if (error || !data?.some((church) => church.id === home.id)) return [home];
  return data as { id: string; name: string }[];
}

/** Phone number for a person, via the admin-only contact function. */
export async function fetchContactPhone(
  { supabase }: AdminContextValue,
  userId: string,
): Promise<string> {
  const { data, error } = await supabase.rpc("get_user_contact_admin", {
    target_user_id: userId,
  });
  if (error) throw error;
  return (data as { phone?: string | null } | null)?.phone ?? "";
}
