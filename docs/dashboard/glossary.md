# VineMe clergy dashboard: glossary

This file is the contract for the clergy dashboard. Every page, query, Metabase question and label follows it. If a definition needs to change, change it here first, then in the code. Every label shown on screen comes from one terms file in the code (QW-9), so renaming a term means changing it here and in that file, nowhere else.

The facts here (tables, columns, status values and time limits) come from the reference SQL and the Metabase dashboard as of 22 October 2026. The recommendations were drafted with Claude and are marked. Decisions already made are recorded in `decisions/`.

Lines marked **Decision needed** are recommendations waiting for sign-off. The matching decision issue is named beside each one. Until it's decided, don't build on it: if a task depends on one, stop and ask. Once it's decided, replace the marker with the decision. Lines marked **Check** are facts to confirm in the code. They don't block work.

## Rules for anyone working on the dashboard

1. **Use these words exactly, with no synonyms as labels.** "Overdue", "To follow up", "Waiting", "Joined" and "Looking for a group" are currently used as labels for ideas defined below; replace them. Plain sentences on cards, like "Waiting 122 days, no contact yet", are fine.
2. **Every number says what it counts.** People or requests: "30 people, 46 requests", never just "46".
3. **Calculate once.** Once the request and person views exist (DATA-1 and DATA-2), numbers come from them, not from new calculations in components. Until then, don't add number calculations beyond what an issue asks for.
4. **Now pages and an over-time page.** Overview, Follow-ups, Groups and Members show the current state. Insights shows change over time. Each number has one home, and other pages link to it.
5. **Red and green only mean needs attention and on track.** Stage colours are distinct from each other, but never red or green.
6. **Never show data the database doesn't hold.** No placeholders and no invented fields. If something isn't stored, say so.
7. **Plain, warm words.** Avoid pipeline, performance, effectiveness, workflow, onboarding, optimise and streamline. Headings work best as plain questions, like "How quickly are we following up?"
8. **Mark the current period as in progress.** This week, month or quarter hasn't finished, so it can't be compared like for like.
9. **Small numbers get their count.** Every percentage shows the count it's based on. Groups with fewer than 5 requests in a period are greyed out in comparisons (a recommended threshold, open to change).

## Scope

- **People** belong to the dashboard's church and service when `users.church_id` and `users.service_id` match. All their memberships count, in any group, open or closed, so a person's history doesn't vanish when a group closes.
- **Requests** belong to the service of the group they were made to (`groups.service_id`). Follow-ups and the Team measures use this.
- Only one service uses VineMe today, so the two rarely differ. Church-wide and per-service views come with DEV-9.

## People

| Term | Meaning |
| --- | --- |
| Member | Everyone in scope, leaders and admins included, test accounts excluded. |
| Admin | A member whose `users.roles` includes `church_admin`. |
| Leader | A member with an active leader membership (`group_memberships.role = 'leader'`, status `active`). |
| Test account | First name, last name or email containing "test", in any case. A proper flag would be safer (DEV-11). |
| Signed up | When the person created their account (`users.created_at`). Replaces "Joined" and "Downloaded" as labels. |
| New | Signed up in the last 30 days. Worked out from Signed up; nothing in the database stores it. |
| Newcomer | Said during onboarding that they're looking for a group (`users.newcomer`). It doesn't mean new to church. It separates people using VineMe to find a group from existing members recording a group they're already in. Everyone else is an Existing member. |
| Role | Admin, Leader, Newcomer or Existing member. |

## Requests

| Term | Meaning |
| --- | --- |
| Request | One person's membership of one group (a `group_memberships` row). Everyone starts by asking to join, so it's called a request. A person can have several. |
| Stage | Where a pending request has got to: Not contacted (`journey_status` empty), Reached out (1), Spoken to (2), Attended (3). **Decision needed (DEC-2):** the follow-up drawer calls stage 2 "Invited". Use whatever leaders see in the app, everywhere. |
| Pending | Not yet resolved (`status = 'pending'`). Attended is still pending. |
| Added | The leader added them to the group (status `active`). |
| Left | Was added and has since left (status `inactive`). |
| Archived | Closed with a reason (status `archived`). |
| Resolved | Added or Archived. |
| Archive reasons | No longer interested, Not contactable, Not suitable for group, Group at capacity, and any others where the app defines them. Read the list from that definition; never keep a second copy. |
| Last action | The latest of: a stage moving forward, a status change, or a note. Stage taps undone within an hour are ignored, as in `reference/follow-ups.sql`. **Decision needed (DEC-2):** whether admin notes count (recommended: no, only notes from the group's leaders). |

## Outcomes: who got connected

Pending and Connected live at different levels, which is what makes this subtle:

- **Pending** only ever describes a request. A request isn't finished until the leader adds the person or it's archived, so an attended request is still pending.
- **Connected** only ever describes a person. They're connected the moment one of their requests reaches Attended, whatever happens to that request afterwards.

So a person can be connected while their request is still pending, because the leader hasn't added them yet. That's expected, not a contradiction. Never call a person pending.

Everyone who has requested falls into exactly one of these, decided by their best request:

| Outcome | Meaning |
| --- | --- |
| Connected | At least one membership at Attended (`journey_status` 3), whatever its status now: pending, added, left or archived. |
| Not yet connected | Not connected, and at least one request still pending, at Spoken to, Reached out or Not contacted. |
| Archived | Not connected, and every request archived. |

These add up to everyone who has requested. Members who have never made a request are **No requests**. The connection bar on Insights shows the first three, with Not yet connected split into its stages.

Other person-level terms:

- **Requested:** has made at least one request.
- **Furthest stage:** the outcome with Not yet connected split into its stages: Connected, Spoken to, Reached out, Not contacted, Archived or No requests.
- **Plugged in:** a connected person who was then added to the group, even if they've since left. It's a measure, not a separate group: every plugged-in person is also connected.
- **In a group now:** has an active membership today, as a member or a leader. This is a state, not a VineMe outcome. Group member counts use it.

Every request goes through the journey: the app only lets a leader add someone once they've reached Attended. So an added or left request should always be at stage 3. `reference/people.sql` counts anything else as a data error.

`reference/people.sql` is the reference query for all of these. It uses each request's current stage.

## Needs help

| Term | Meaning |
| --- | --- |
| Needs help | The person pressed "I can't find a group" in the app (`users.cannot_find_group`, with `cannot_find_group_requested_at`) and it hasn't been resolved. Only clergy see these. |
| Contacted | Someone has marked them contacted (`cannot_find_group_contacted_at`), but it isn't resolved yet. |
| Resolved | Marked resolved (`cannot_find_group_resolved_at`). They drop off the list. |

**Check (MEM-4):** in the app code, whether resolving sets `cannot_find_group` back to false, and what happens if someone asks again. Until then, a request made after the last resolution counts as open again.

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

**Connected rate** (the Results tab). Of people who requested, the share who are connected. **Decision needed (DEC-3):** count people (recommended) or requests.

**Plugged-in rate** (the Results tab). Of people who requested, the share who are plugged in.

**Resolved this week** (Overview). Requests that were added or archived this week. Attended doesn't count, because it's still pending.

## Groups

| Term | Meaning |
| --- | --- |
| At capacity / Taking new members | From `groups.at_capacity`, set by the leader. |
| Group status | Active or Closed, with Pending approval to come (DEV-3). How it's stored: answered by AUD-1. |
| Leaders | Every active leader of the group, not just the first. |
| Members (of a group) | People in the group now: active memberships, leaders included. |

## Colours

| Meaning | Colour |
| --- | --- |
| Needs attention | Red |
| On track | Green |
| Stages: Not contacted, Reached out, Spoken to, Attended | Four clearly distinct colours, none of them red or green |

Exact values come from the chart palette (DEV-10), stored as tokens alongside the brand colours. Never hard-code a chart colour.
