export type FollowUpStep = "reachedOut" | "invited" | "attended";

export interface FollowUp {
  id: string;
  userId: string;
  name: string;
  group: string;
  requestedOn: string;
  requestedDaysAgo: number;
  overdueDays?: number;
  dueInDays?: number;
  fromEmail?: boolean;
  /** Empty until looked up with get_user_contact_admin. */
  phone: string;
  phoneLookedUp?: boolean;
  referredBy?: string;
  referralNote?: string;
  progress: Record<FollowUpStep, string | null>;
  /** Date and text of the latest journey_status_change note, if any. */
  lastUpdatedOn?: string;
  lastUpdateNote?: string;
  notes: string[];
  outcome: "active" | "added" | "archived";
}

export interface GroupPerson {
  name: string;
  role: string;
  status: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  whatsappLink: string | null;
  address: string;
  people: GroupPerson[];
  area: string;
  meets: string;
  leader: string;
  members: number;
  atCapacity: boolean;
  pendingFollowUps: number;
}

export interface MemberGroup {
  group: string;
  role: string;
  status: string;
}

export interface Member {
  id: string;
  name: string;
  role: string;
  status: string;
  group: string;
  joined: string;
  joinedOn: string;
  bio: string;
  isNewcomer: boolean;
  /** Every group membership (active or pending), newest first. */
  memberships: MemberGroup[];
}

export interface OverviewData {
  totalPeople: number;
  pendingFollowUps: number;
  groupsAtCapacity: number;
  members: Member[];
}
