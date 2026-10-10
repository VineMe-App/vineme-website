export const adminUser = {
  firstName: "Esther",
  initial: "E",
};

export type FollowUpStep = "reachedOut" | "invited" | "attended";

export interface FollowUp {
  id: string;
  name: string;
  group: string;
  requestedOn: string;
  requestedDaysAgo: number;
  overdueDays?: number;
  dueInDays?: number;
  fromEmail?: boolean;
  phone: string;
  referredBy?: string;
  referralNote?: string;
  progress: Record<FollowUpStep, string | null>;
  notes: string[];
  outcome: "active" | "added" | "archived";
}

export const followUps: FollowUp[] = [
  {
    id: "sally",
    name: "Sally",
    group: "Beta Connect",
    requestedOn: "16 Sep",
    requestedDaysAgo: 16,
    overdueDays: 2,
    fromEmail: true,
    phone: "+44 7700 900123",
    referredBy: "Mark Taylor",
    referralNote: "Keen to find a group near Tower Bridge",
    progress: { reachedOut: "29 Sep", invited: null, attended: null },
    notes: [],
    outcome: "active",
  },
  {
    id: "josh",
    name: "Josh",
    group: "Tower Bridge",
    requestedOn: "23 Sep",
    requestedDaysAgo: 9,
    overdueDays: 3,
    phone: "+44 7700 900456",
    progress: { reachedOut: null, invited: null, attended: null },
    notes: [],
    outcome: "active",
  },
  {
    id: "emma",
    name: "Emma Bell",
    group: "Tower Bridge",
    requestedOn: "30 Sep",
    requestedDaysAgo: 2,
    dueInDays: 4,
    phone: "+44 7700 900789",
    progress: { reachedOut: null, invited: null, attended: null },
    notes: [],
    outcome: "active",
  },
  {
    id: "alice",
    name: "Alice",
    group: "Beta Connect",
    requestedOn: "20 Sep",
    requestedDaysAgo: 12,
    dueInDays: 9,
    phone: "+44 7700 900321",
    progress: { reachedOut: "22 Sep", invited: "27 Sep", attended: null },
    notes: [],
    outcome: "active",
  },
  {
    id: "daniel",
    name: "Daniel",
    group: "Beta Connect",
    requestedOn: "14 Sep",
    requestedDaysAgo: 18,
    phone: "+44 7700 900654",
    progress: { reachedOut: "16 Sep", invited: "20 Sep", attended: "3 Oct" },
    notes: [],
    outcome: "active",
  },
];

export interface Group {
  id: string;
  name: string;
  area: string;
  meets: string;
  leader: string;
  members: number;
  capacity: number;
  pendingFollowUps: number;
}

export const groups: Group[] = [
  {
    id: "beta-connect",
    name: "Beta Connect",
    area: "Tower Bridge",
    meets: "Wednesdays, 7:30pm",
    leader: "Esther Mensah",
    members: 9,
    capacity: 12,
    pendingFollowUps: 2,
  },
  {
    id: "tower-bridge",
    name: "Tower Bridge Evenings",
    area: "Bermondsey",
    meets: "Tuesdays, 8:00pm",
    leader: "Tom Hughes",
    members: 12,
    capacity: 12,
    pendingFollowUps: 2,
  },
  {
    id: "fulham-midweek",
    name: "Fulham Midweek",
    area: "Fulham",
    meets: "Thursdays, 7:00pm",
    leader: "Amara Lewis",
    members: 7,
    capacity: 10,
    pendingFollowUps: 0,
  },
  {
    id: "students-alpha",
    name: "Students Alpha",
    area: "Campus",
    meets: "Mondays, 6:30pm",
    leader: "Ben Carter",
    members: 14,
    capacity: 16,
    pendingFollowUps: 1,
  },
];

export interface Member {
  name: string;
  email: string;
  role: string;
  status: string;
  group: string;
  joined: string;
}

export const members: Member[] = [
  {
    name: "Amara Lewis",
    email: "amara@vineme.church",
    role: "Service Pastor",
    status: "Connected",
    group: "Fulham Midweek",
    joined: "Jan 2024",
  },
  {
    name: "Ben Carter",
    email: "ben@vineme.church",
    role: "Group Leader",
    status: "Pending follow-up",
    group: "Students Alpha",
    joined: "Mar 2024",
  },
  {
    name: "Grace Okafor",
    email: "grace@vineme.church",
    role: "Congregation",
    status: "Looking for a group",
    group: "Unassigned",
    joined: "Sep 2025",
  },
  {
    name: "Tom Hughes",
    email: "tom@vineme.church",
    role: "Admin",
    status: "Connected",
    group: "South Ken Evenings",
    joined: "Nov 2023",
  },
  {
    name: "Esther Mensah",
    email: "esther@vineme.church",
    role: "Group Leader",
    status: "Connected",
    group: "Beta Connect",
    joined: "Feb 2024",
  },
  {
    name: "Mark Taylor",
    email: "mark@vineme.church",
    role: "Congregation",
    status: "Connected",
    group: "Beta Connect",
    joined: "Jun 2024",
  },
  {
    name: "Priya Shah",
    email: "priya@vineme.church",
    role: "Congregation",
    status: "Looking for a group",
    group: "Unassigned",
    joined: "Oct 2025",
  },
  {
    name: "Jonas Weber",
    email: "jonas@vineme.church",
    role: "Congregation",
    status: "Connected",
    group: "Tower Bridge Evenings",
    joined: "Aug 2024",
  },
];

export const memberStatusVariants = {
  Connected: "success",
  "Pending follow-up": "warning",
  "Looking for a group": "info",
} as const;
