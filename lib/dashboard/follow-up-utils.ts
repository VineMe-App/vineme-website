import type { FollowUp } from "@/lib/dashboard/sample-data";

export type FollowUpSectionId = "needs-attention" | "on-track" | "attended";

export function getFollowUpSection(person: FollowUp): FollowUpSectionId {
  if (person.progress.attended) return "attended";
  if (person.overdueDays) return "needs-attention";
  return "on-track";
}

export function getProgressLabel(person: FollowUp): string {
  if (person.progress.attended) return `Attended ${person.progress.attended}`;
  if (person.progress.invited) return "Invited · waiting to attend";
  if (person.progress.reachedOut) return "Reached out · not yet invited";
  return "Not reached out";
}

export function getRequestedLabel(person: FollowUp): string {
  return `${person.group} · requested ${person.requestedDaysAgo} days ago`;
}

export function getFirstOpenStep(
  person: FollowUp,
): "reachedOut" | "invited" | "attended" | null {
  if (!person.progress.reachedOut) return "reachedOut";
  if (!person.progress.invited) return "invited";
  if (!person.progress.attended) return "attended";
  return null;
}
