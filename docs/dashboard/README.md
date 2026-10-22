# Clergy dashboard: plan

Start here. This folder holds the plan for reworking the clergy dashboard (Overview, Follow-ups, Groups, Members, Reports and Settings). The work is tracked as GitHub issues in the [Clergy Dashboard Upgrades](https://github.com/orgs/VineMe-App/projects/19) project.

| File | What it's for |
| --- | --- |
| `README.md` | This plan: the problem, the order of work, and the decisions still open. |
| `glossary.md` | The definitions and rules every page, query and label follows. Read it before any dashboard task. |
| `issues.md` | The source of the 52 GitHub issues, with the issue number for each key. |
| `reference/` | Reference queries. `people.sql` applies the agreed definitions, and `follow-ups.sql` is the follow-up query. |
| `decisions/` | One file per settled decision: what was decided and why. |
| `audit.md` | Written by AUD-1: where every number comes from, and what's wrong with it. |

## The short version

The dashboard's shape is right. Most of what feels wrong is the same word counting different things on different pages. Connected is 117 on Members, 155 on Reports and 182 in Metabase. There are also a few real bugs, and some data that was invented to fill the design, such as the pet tags.

- **The fix:** agree the definitions once, calculate the numbers once in the database, then work through the pages.
- **The work:** 55 GitHub issues in order, each sized for one Claude Code session and one commit. 44 are dashboard work, and 11 need app or backend work (labelled `needs-dev`). One (FU-5) is parked.
- **Picking up work:** every issue stands on its own and says what it depends on. Take the next open issue in the current milestone.
- **If time is short:** the critical path is DEC-1, DEC-2, AUD-1, QW-1 and DATA-1 to DATA-3, then FU-1 and FU-2. That gets the numbers right and the page clergy act on into shape.

## Principles every change follows

These also sit at the top of `glossary.md`, so Claude Code reads them before every task.

1. **One set of definitions.** Every page, query and label uses the glossary's words, with no synonyms.
2. **Numbers are calculated once.** Two database views, one row per request and one per person, feed both the dashboard and Metabase.
3. **Every number has a unit.** "30 people, 46 requests", never just "46".
4. **Now pages and an over-time page.** Overview, Follow-ups, Groups and Members show what needs doing now. Insights shows change over time. Each number lives in one place and other pages link to it.
5. **Red and green only mean needs attention and on track.** Stage colours are distinct from each other, but never red or green. The devs design a proper chart palette from the brand colours (DEV-10).
6. **Plain, warm words.** No pipeline, performance, effectiveness, workflow or onboarding. Headings work best as plain questions.
7. **Never show data the database doesn't hold.** If a field doesn't exist, leave it out.
8. **Build shared pieces once.** One contact block, one avatar and one drawer per thing, reused everywhere.

## The order of work

1. **Decide and audit.** Settle the definitions, then audit every number on the dashboard without changing anything.
2. **Quick wins and bugs.** Small fixes that don't depend on the numbers. These can run alongside step 1.
3. **Data foundations.** Build the request and person views, and wire the dashboard and Metabase to them. Everything after this reads its numbers from the views, which is why it comes before the pages.
4. **Pages.** Follow-ups first, because it's where clergy act. Then Members, Groups, Overview (after the pages it links to) and Insights.
5. **Polish.**

The dev backlog runs alongside all of it. The GitHub milestones match these steps. Issues #1 to #52 follow the list below, and later additions take the next numbers. `issues.md` has the exact number for each key.

Sizes: **S** is under an hour, **M** is a session of 2 to 3 hours, **L** is more than one session.

**1. Decide and audit**

- DEC-1 Agree the core definitions · S
- DEC-2 Agree the follow-up time rules and wording · S
- DEC-3 Agree how Insights measures things · S
- DEC-4 Agree the smaller product choices · S
- AUD-1 Audit every number and data point, read-only · M

**2. Quick wins and bugs**

- QW-1 Members list stops at 500 and search misses people · M
- QW-2 Settings: "Coming soon" over ChurchSuite · S
- QW-3 Overview: slimmer header, hide Invite user · S
- QW-4 Groups: tidy the cards and drawer · S
- QW-5 Drawers: tidy copy and remove dead buttons · S
- QW-6 Shared contact block with formatted phone numbers · S
- QW-7 Follow-ups: collapse group leader view by default · S
- QW-8 Overview chart: readable stage colours, after DEV-10 · S
- QW-9 Terms dictionary: one place in the code for every label, after DEC-2 · S

**3. Data foundations**

- DATA-1 Request view: one row per request, with stage and time limits · L
- DATA-2 Person view: one row per member · M
- DATA-3 Point the existing numbers at the views · M
- DATA-4 Email in the contact block, read on the server · M
- DATA-5 Bring Metabase in line (Olly, in Metabase) · M

**4. Pages**

- FU-1 Follow-ups: explanation and totals at the top · S
- FU-2 Follow-ups: plain-language cards and colours · M
- FU-3 Follow-ups drawer: full history, leader contact, real archive reasons · M
- FU-4 Follow-ups: confirm before acting on a leader's behalf · M
- FU-5 Follow-ups: nudge on very old requests (parked) · S
- FU-6 Follow-ups drawer: clergy notes, with an "I've spoken to them" tick · M
- MEM-1 Members: top cards · M
- MEM-2 Members: table columns and status · M
- MEM-3 Members: person drawer · M
- MEM-4 Needs help: contact and resolve people who can't find a group · M
- GRP-1 Groups: count, filters and search · M
- GRP-2 Groups: badge and sort · S
- GRP-3 Groups: Active / Closed switch · S
- GRP-4 Groups drawer: open a member's drawer · S
- OV-1 Overview: four clickable cards · S
- OV-2 Overview: pending chart toggle · M
- OV-3 Overview: "This week" strip · S
- OV-4 Overview: who's waiting longest · M
- INS-1 Insights: rename, four tabs and page-wide filters · M
- INS-2 Insights: Activity tab · M
- INS-3 Insights: Results tab · L
- INS-4 Insights: Team tab · M
- INS-5 Insights: Groups scorecard · L

**5. Polish**

- POL-1 Tap a profile picture to enlarge it · M
- POL-2 Search across the dashboard · M

**Dev backlog** (alongside everything): DEV-1 to DEV-11, described under For the devs.

## How to work through it

One issue at a time, in a fresh Claude Code session, with a commit after each.

- Work on the `dashboard-refresh` branch, created from `staging`. At the end of each milestone, merge it back through a pull request, so the changes can be reviewed in sensible chunks.
- `CLAUDE.md` in the repo root already holds the dashboard rules, so Claude Code reads them at the start of every session. One of them: if a task depends on anything marked "Decision needed" in the glossary, it stops and asks rather than assuming the recommendation.

**For each issue**

1. Start a fresh session with `/clear`.
2. Paste the prompt below with the issue number. Start in plan mode if the issue says so.
3. Check the change in the browser.
4. Commit with the message Claude Code suggests. "Closes #N" closes the issue when the branch is merged.

```text
Read docs/dashboard/glossary.md. Then run gh issue view <N> and do that issue only. When you're done, tell me how to check it in the browser and suggest a commit message ending "Closes #<N>".
```

**When a decision is made:** update `glossary.md`, tick it in its decision issue, and close the issue once every box is ticked.

**When you spot something new:** keep it out of the current task, and open an issue for it.

## Decisions to make

DEC-1 and DEC-2 are decided: see `decisions/`, with the definitions in `glossary.md`. The remaining choices are below, each with a recommendation drafted with Claude.

| Decision | Recommendation | Issue |
| --- | --- | --- |
| Name for the Reports page | "Insights" or "Stats". Not "Performance", which sounds like appraising volunteers. | DEC-3 |
| Results headline | Count people: 182 of 259 who asked have attended a group (70%). Counted by requests, it's about 50%. | DEC-3 |
| Team measures | Count every request old enough to judge, not just those that reached the stage. | DEC-3 |
| Metabase | Change it to match, or the two will disagree again. Historical figures will drop. | DEC-3 |
| Invite user | Hide it now. Later it becomes "Invite a colleague" (DEV-6). | DEC-4 |
| Group badge and sort | Count requests needing attention, not all pending. | DEC-4 |
| Search | Groups page first, global search later (POL-2). | DEC-4 |
| Members cards | Built on the DEC-1 definitions: All members, Connected (with how many are plugged in), Not yet connected, Archived, then Needs help and New in 30 days. | DEC-4 |
| Insights groups tab | Framed as "Where to offer support", not a league table. | DEC-4 |

The audit (AUD-1) answers five data questions the work depends on: whether church_admin access shows the whole church or one service, how group status is stored, whether notes record who made a change, where archive reasons are defined, and whether unconfirmed emails can be read on the server.

## What's changing, page by page

**Overview**

- Slimmer header, with Invite user hidden for now.
- Four clickable cards: Needs help, Pending requests (with how many need attention), Groups at capacity ("5 of 18") and Total members. Each opens the matching filtered page.
- The pending requests chart gets readable colours and a toggle between stages and needs attention or on track.
- A "This week" strip: new requests, resolved requests and new sign-ups.
- The bottom list shows people with the most open requests, plus new sign-ups this week.

**Follow-ups**

- A short explanation of the three follow-up states (needs first contact, on track, needs attention), each stage's time limit shown on the page, and a total that ties back to Overview.
- Cards in plain words for each stage: "No contact in 8 days" in red, "Reached out 2 days ago" in green.
- Group leader view collapsed by default, with clearer stage headings.
- Drawer: formatted phone, email, contact for the leader, a full history of notes and stage changes, and the real archive reasons.
- Clergy can add notes, with an "I've spoken to them" tick that resets the clock.
- Admins can act on a leader's behalf after a confirmation, with an optional note.

**Groups**

- A count, filters (taking new members, at capacity) and search by group, leader or member.
- Cards show every leader, no pet tags, and a short area instead of a full address.
- The badge and sort use needs attention.
- An Active / Closed switch, with pending approval to follow.
- In the drawer, members open their own drawer, and "See stats" opens Insights for that group.

**Members**

- Fix the bug: the list stops at 500 and search misses people.
- Cards built on the agreed definitions: connected (and plugged in), not yet connected, archived, needs help, and new in the last 30 days.
- Needs help: see who's asked, and mark them contacted or resolved, as the app does (MEM-4).
- Table: Signed up first, Newcomer or Existing member, a group count, and a status showing the furthest stage, other open requests, needs help and anything needing attention.
- Drawer: each group's stage and timing, opening its follow-up, plus past requests and no dead buttons.

**Insights (was Reports)**

- Four tabs: Activity, Results, Groups and Team. Newcomers becomes a filter across all of them.
- Activity: sign-ups and requests over time, by week, month or quarter.
- Results: the connected and plugged-in rates, and why requests were closed, including how long people waited before losing interest.
- Team: follow-up speed over time, counted fairly.
- Groups: a scorecard for spotting where to offer support.

**Settings**

- "Coming soon" over ChurchSuite until the sync is ready.

**Everywhere**

- Tap a profile picture to enlarge it.
- A proper chart colour palette, built from the brand colours by the devs, so stages are easy to tell apart.
- Later, one search bar for people and groups.

## For the devs

Eleven issues need work in the app or backend, beyond the dashboard. They're labelled `needs-dev` and sit in the Dev backlog milestone.

| Issue | What | Why it matters |
| --- | --- | --- |
| DEV-1 | Notify the leader when an admin adds a note | Otherwise clergy notes go unseen |
| DEV-2 | Notify the leader when an admin acts on their behalf | Leaders need to know their list changed |
| DEV-3 | Group approval flow | New groups approved from the dashboard and flagged on Overview |
| DEV-4 | Refer someone to a group | Re-refer after a poor fit, or place someone who asked for help. 12 requests so far were closed as "Not suitable" or "Group at capacity". |
| DEV-5 | ChurchSuite sync in Settings | Groups shown on church websites, with capacity, memberships and website join requests flowing back into VineMe |
| DEV-6 | Invite a colleague to the dashboard | Uses the roles from DEV-9 |
| DEV-7 | Record who made each change, if missing | Separates leader actions from admin actions |
| DEV-8 | Group details as real fields, like pet friendly | Lets the dashboard show them honestly |
| DEV-9 | Rethink role-level access, with Aonghas | Service pastors see their own service; church pastors see the whole church and can drill into each service |
| DEV-10 | Chart colour palette, built from the brand colours | Four shades of pink can't be told apart. Worth doing early: QW-8 and the Insights charts use it |
| DEV-11 | A proper test-account flag | Matching "test" in names and emails can catch real people and miss real test accounts |

**Where to start.** Everything you need is in the issues, `glossary.md` and `audit.md` (once AUD-1 is done). Pick up the next open issue in the current milestone. Each issue says what it depends on.

## Things to keep in mind

- **Privacy.** The views must respect row-level security (`security_invoker`), or one church could see another's data. Emails from `auth.users` are read on the server only.
- **Small numbers.** A group with 2 requests at 100% outranks one with 25 at 40%. Always show the count beside a percentage.
- **Framing.** The scorecard is for spotting where leaders need support. They're volunteers.
- **Recent periods.** The current week, month or quarter hasn't finished. Mark it "in progress" so it doesn't look better or worse than it is.
- **Data hygiene.** Many requests from 2025 are probably resolved but never updated, such as King's Road's batch from last autumn. A one-off clean-up makes every number more trustworthy.
- **Keep Metabase in step.** When a definition changes, change the views. Metabase reads the same views, so it follows.
- **Claude Code fills gaps.** It invented the pet tags. The audit catches today's; the `CLAUDE.md` rules help stop new ones. Check anything that looks too neat.
