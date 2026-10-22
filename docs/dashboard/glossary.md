# VineMe clergy dashboard: glossary

This file is the contract for the clergy dashboard. Every page, query, Metabase question and label follows it. If a definition needs to change, change it here first, then in the code.

The facts here (tables, columns, status values and time limits) come from the reference SQL and the Metabase dashboard as of 22 October 2026. The recommendations were drafted with Claude and are marked.

Lines marked **Decision needed** are recommendations waiting for sign-off. The matching decision issue is named beside each one. Until it's decided, don't build on it: if a task depends on one, stop and ask. Once it's decided, replace the marker with the decision.

## Rules for anyone working on the dashboard

1. **Use these words exactly, with no synonyms as labels.** "Overdue", "To follow up", "Waiting" and "Joined" are currently used as labels for ideas defined below; replace them. Plain sentences on cards, like "Waiting 122 days, no contact yet", are fine.
2. **Every number says what it counts.** People or requests: "30 people, 46 requests", never just "46".
3. **Calculate once.** Once the request and person views exist (DATA-1 and DATA-2), numbers come from them, not from new calculations in components. Until then, don't add number calculations beyond what an issue asks for.
4. **Now pages and an over-time page.** Overview, Follow-ups, Groups and Members show the current state. Insights shows change over time. Each number has one home, and other pages link to it.
5. **Red and green only mean needs attention and on track.** Stage colours are distinct from each other, but never red or green.
6. **Never show data the database doesn't hold.** No placeholders and no invented fields. If something isn't stored, say so.
7. **Plain, warm words.** Avoid pipeline, performance, effectiveness, workflow, onboarding, optimise and streamline. Headings work best as plain questions, like "How quickly are we following up?"
8. **Mark the current period as in progress.** This week, month or quarter hasn't finished, so it can't be compared like for like.
9. **Small numbers get their count.** Every percentage shows the count it's based on. Groups with fewer than 5 requests in a period are greyed out in comparisons (a recommended threshold, open to change).

## People

| Term | Meaning |
| --- | --- |
| Member | Anyone with a VineMe account in this church's scope. Includes group leaders and admins. Excludes test accounts. The scope is one service for now, as only one service uses VineMe; church-wide and per-service views come with the access rethink (DEV-9). **Decision needed (DEC-1):** confirm, and how test accounts are flagged (recommended: a flag on `users`, not matching names). |
| Signed up | The date the person created their account (`users.created_at`). Replaces "Joined" and "Downloaded" as labels. |
| New | Signed up in the last 30 days. |
| Newcomer / Existing member | From `users.newcomer`. Shown as the role for anyone who isn't an admin or a leader. Not the same as New. |
| Role | Admin, Leader, Newcomer or Existing member. |
| Connected | An active member of at least one group right now (a membership with status `active`). Attended but not added is still pending. Someone who left with no other group isn't connected. **Decision needed (DEC-1):** confirm. |
| Pending (person) | Not connected, with at least one pending request. |
| Not in a group yet | Not connected, with no pending request. Covers people who never requested and people whose requests were all archived; a filter separates "never requested" from "requests closed". **Decision needed (DEC-1):** confirm. |
| Furthest stage | The furthest any of a person's requests has reached: Connected, Attended, Spoken to, Reached out, Not contacted, or Not requested yet. |
| Needs help | The person used "I can't find a group" in the app, and it hasn't been handled yet. **Decision needed (DEC-1):** when it clears (recommended: when clergy mark it handled, or the person becomes connected). Where it's stored: answered by AUD-1. |

Connected + Pending + Not in a group yet = All members.

## Requests

| Term | Meaning |
| --- | --- |
| Request | One person asking to join one group: a `group_memberships` row for someone who isn't a leader of that group. A person can have several. |
| Stage | Where a pending request has got to: Not contacted (`journey_status` empty), Reached out (1), Spoken to (2), Attended (3). **Decision needed (DEC-2):** the follow-up drawer calls stage 2 "Invited". Use whatever leaders see in the app, everywhere. |
| Pending (request) | Not yet resolved (`status = 'pending'`). Attended is still pending. |
| Resolved | Added (the leader added them; status `active`) or Archived (closed with a reason; status `archived`). |
| Left | Was added and has since left (status `inactive`). |
| Archive reasons | No longer interested, Not contactable, Not suitable for group, Group at capacity, and any others where the app defines them. Read the list from that definition; never keep a second copy. |
| Last action | The latest of: a stage moving forward, a status change, or a note. Stage taps undone within an hour are ignored, as in `reference/follow-ups.sql`. **Decision needed (DEC-2):** whether admin notes count (recommended: no, only notes from the group's leaders). |

## Time limits and needs attention

Every pending request has a limit for its current stage.

| Stage | Limit | Counted from |
| --- | --- | --- |
| Not contacted | 6 days | the request |
| Reached out | 10 days | the last action |
| Spoken to | 14 days | the last action |
| Attended, not yet added | 30 days | the last action |

**Decision needed (DEC-2):** confirm these limits (they come from `reference/follow-ups.sql`), and that Attended past 30 days counts as needing attention. The dashboard doesn't apply that rule today.

| Term | Meaning |
| --- | --- |
| Needs attention | A pending request past its limit. Shown in red. |
| On track | A pending request within its limit. Shown in green. |
| Very old | A pending request with no action for 90 days. Gets an "Add or archive?" nudge. **Decision needed (DEC-2):** confirm the threshold. |

Card wording says how long it's been since the request (for Not contacted) or since the last action, never days past the limit. For example: "Waiting 122 days, no contact yet", "Spoken to 3 days ago, follow up within 11 days".

## Measures on Insights

**Followed up in time** (the Team tab). Measured from the request date, using the same limits added up:

- Reached out within 6 days
- Spoken to within 16 days (6 + 10)
- Attended within 30 days (6 + 10 + 14)

The base is every request made in the period that's old enough to judge (at least 6, 16 or 30 days old). Requests that never reached the stage count as misses. Year-on-year comparisons are shown in points: "58% (73% last year)". **Decision needed (DEC-3):** confirm, and change Metabase to match.

This answers a different question from needs attention. Needs attention asks "is this request slipping right now?" Followed up in time asks "how quickly did we get people through?" Never use one name for both.

**Got to a group** (the Results tab). Of people who have made at least one request, the share who have attended at least one group. **Decision needed (DEC-3):** count people (recommended) or requests.

**Stuck** (the Results tab). Of people who have made at least one request, the share who were added to a group, even if they've since left.

**Resolved this week** (Overview). Requests that were added or archived this week. Attended doesn't count, because it's still pending.

## Groups

| Term | Meaning |
| --- | --- |
| At capacity / Taking new members | From `groups.at_capacity`, set by the leader. |
| Group status | Active or Closed, with Pending approval to come (DEV-3). How it's stored: answered by AUD-1. |
| Leaders | Every active leader of the group, not just the first. |

## Colours

| Meaning | Colour |
| --- | --- |
| Needs attention | Red |
| On track | Green |
| Stages: Not contacted, Reached out, Spoken to, Attended | Four clearly distinct colours, none of them red or green |

Exact values come from the chart palette (DEV-10), stored as tokens alongside the brand colours. Never hard-code a chart colour.
