import type { FollowUp } from "@/lib/dashboard/types";

export type FollowUpSectionId = "needs-attention" | "on-track" | "attended";

export function getFollowUpSection(person: FollowUp): FollowUpSectionId {
  if (person.progress.attended) return "attended";
  if (person.overdueDays) return "needs-attention";
  return "on-track";
}

export type FollowUpStage =
  | "not-reached"
  | "reached-out"
  | "invited"
  | "attended";

export function getFollowUpStage(person: FollowUp): FollowUpStage {
  if (person.progress.attended) return "attended";
  if (person.progress.invited) return "invited";
  if (person.progress.reachedOut) return "reached-out";
  return "not-reached";
}

/** Longest overdue first, then longest waiting. */
export function compareByUrgency(a: FollowUp, b: FollowUp): number {
  return (
    (b.overdueDays ?? 0) - (a.overdueDays ?? 0) ||
    b.requestedDaysAgo - a.requestedDaysAgo
  );
}

export function getProgressLabel(person: FollowUp): string {
  if (person.progress.attended) return `Attended ${person.progress.attended}`;
  if (person.progress.invited) return "Invited · waiting to attend";
  if (person.progress.reachedOut) return "Reached out · not yet invited";
  return "Not reached out";
}

/** Second line under the current stage: when it last changed, and why. */
export function getStatusDetail(person: FollowUp): string {
  if (person.lastUpdatedOn) {
    return person.lastUpdateNote
      ? `Updated ${person.lastUpdatedOn} · ${person.lastUpdateNote}`
      : `Updated ${person.lastUpdatedOn}`;
  }
  if (
    person.progress.reachedOut ||
    person.progress.invited ||
    person.progress.attended
  ) {
    return "Date not recorded";
  }
  return `Waiting since ${person.requestedOn}`;
}

export function getRequestedAgo(person: FollowUp): string {
  return person.requestedDaysAgo === 1
    ? "Requested 1 day ago"
    : `Requested ${person.requestedDaysAgo} days ago`;
}

export function getRequestedLabel(person: FollowUp): string {
  return `${person.group} · ${getRequestedAgo(person).toLowerCase()}`;
}

export function getFirstOpenStep(
  person: FollowUp,
): "reachedOut" | "invited" | "attended" | null {
  if (!person.progress.reachedOut) return "reachedOut";
  if (!person.progress.invited) return "invited";
  if (!person.progress.attended) return "attended";
  return null;
}
