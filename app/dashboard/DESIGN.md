# Dashboard design guide

Scope: the church admin dashboard (`app/dashboard/**`) only. Marketing pages
(`/`, `/church`, `/find`, `/legal/*`) and `/login` keep their own Nunito and
brand styling and must not use anything described here.

## How the scope works

- `app/dashboard/layout.tsx` wraps every dashboard route in `.admin-theme`
  and loads Cal Sans. Nothing is applied globally.
- `.admin-theme` lives in `app/globals.css`. It defines the coss ui colour
  tokens and overrides `--font-heading` and the base `font-family`.
- Anything rendered outside that wrapper (the root-layout `Navbar`, `Footer`,
  and portals appended to `<body>`) does not get the dashboard theme.
- New dashboard routes go under `app/dashboard/` so they inherit the layout.
  If an admin area ever needs its own shell (no marketing navbar), move it to
  a route group such as `app/(admin)/` with its own layout.

## Component library: coss ui

- Docs: <https://coss.com/ui/docs>. LLM-friendly index: <https://coss.com/ui/llms.txt>.
- Built on Base UI (`@base-ui/react`) and Tailwind v4. Not an npm package;
  components are copied into `components/ui/` and owned by us.
- Add a component with the shadcn CLI (registry `@coss` is set in
  `components.json`):

  ```bash
  npx shadcn@latest add @coss/dialog
  ```

  Review the diff afterwards. The CLI can append theme variables to
  `app/globals.css` (`:root` and a `.dark` block). Revert those and add any
  new tokens under `.admin-theme` so the marketing pages stay untouched.
- Installed today: `button`, `input`, `field`, `label`, `form`, `spinner`,
  `card`, `table`, `badge`, `avatar`.
- Use `Field` + `FieldLabel` + `Input` for form controls. Do not pass `id` /
  `htmlFor`; Base UI links the label and control automatically.
- `Button` renders `type="button"` by default. Set `type="submit"` explicitly
  on submit buttons.
- Panels: `Card` (+ `CardHeader`, `CardTitle`, `CardDescription`, `CardPanel`,
  `CardFooter`). Tables and lists: `CardFrame` + `CardFrameHeader` wrapping
  `Table variant="card"`.
- Badges: always coss `Badge`, `size="lg"` in tables. Status uses `success`
  (connected), `warning` (pending), `info` (waiting); roles use `secondary`.
  Always keep the text label.
- People: `Avatar` + `AvatarFallback` with initials.
- Prefer `Button` `loading` over hand-rolled spinners when a button is
  waiting on a request.

## Colour

Brand colours are the source of truth and are unchanged from the marketing
site. coss tokens are mapped onto them inside `.admin-theme`.

| Token | Value | Use |
|---|---|---|
| `--brand-pink` | `#ff0083` | Primary actions, focus ring, key accents |
| `--brand-dark` | `#2c2235` | Body text, dark surfaces (header card) |
| `--brand-beige` | `#fffbee` | Page and card backgrounds, table header |
| `--primary` | `var(--brand-pink)` | coss `Button` default, `bg-primary` |
| `--ring` | `var(--brand-pink)` | Focus ring on coss inputs and buttons |
| `--input` | brand-dark at 15% | Input borders |
| `--muted-foreground` | brand-dark at 65% | Helper text, descriptions |
| `--destructive` (+ `-foreground`) | red 500 / 700 | Errors, destructive actions |
| `--success`, `--warning`, `--info` | emerald / amber / blue | Status badges, alerts |

Rules:

- Use brand utilities (`bg-brand-pink`, `text-brand-dark`, `bg-brand-beige`)
  for layout surfaces and text. Use coss semantic tokens (`bg-primary`,
  `text-muted-foreground`, `border-input`) inside coss components.
- Do not hard-code hex values. Do not edit the `--brand-*` variables for the
  dashboard; change the mapping in `.admin-theme` instead.
- `.admin-theme *` sets the default border colour to `--border` (coss expects
  this; Tailwind's default is `currentColor`). Keep it in `@layer base`.
- Dark mode is not supported. The `dark:` variants in coss files are inert.

## Typography

- **Font:** Cal Sans v2 variable (weights 400-700), SIL OFL 1.1. Files and
  licence are in `app/fonts/cal-sans/`. Loaded via `next/font/local` in
  `app/dashboard/layout.tsx` as `--font-cal-sans`.
- **Body and UI text:** Cal Sans, with Nunito as the fallback, set on
  `.admin-theme`.
- **Headings:** use the existing `font-heading` class. Inside the dashboard
  it resolves to Cal Sans; on marketing pages it still resolves to Nunito
  Black.
- **Weights:** Cal Sans stops at 700. `font-black` (900) renders as 700, so
  prefer `font-bold` in new dashboard code.
- **Sizes:** coss components size themselves (`text-base` on touch,
  `sm:text-sm` on desktop). For page headings use `text-3xl`-`text-5xl`;
  section headings `text-2xl`-`text-3xl`; small uppercase labels use
  `text-sm uppercase tracking-[0.18em]`.
- Never import another font in the dashboard. Add weights or families in
  `layout.tsx` only if the design genuinely needs them.

## Layout and shape

- Page container: `mx-auto w-full max-w-6xl`, horizontal padding `px-5 sm:px-6`,
  vertical `py-10 lg:py-14`.
- Cards: use coss `Card` / `CardFrame` (rounded-2xl, subtle border and
  shadow). The brand-dark hero card at the top of the overview is the one
  custom surface (`rounded-3xl bg-brand-dark`).
- Controls follow coss defaults (`rounded-lg`, 32-40px height). Use
  `size="xl"` for primary page-level buttons and `className="w-full"` for
  full-width form actions.
- Grids: `gap-5` for stat tiles, `gap-8` between major panels; stack on
  mobile, two columns from `lg`.
- Tables: coss `Table variant="card"` inside `CardFrame`. Set a `min-w` on
  wide tables; the frame scrolls horizontally on small screens.

## Content tone

- Plain, warm, pastoral. Short sentences. No jargon ("Link to ChurchSuite",
  not "Configure integration").
- Sentence case for buttons and headings.
- Empty and error states say what happened and what to do next.

## Accessibility

- Every input has a visible `FieldLabel`.
- Keep the coss focus ring (`--ring`); do not remove outlines.
- Status is never colour-only; pair badge colour with text.
- Interactive targets stay at least 44px on touch (coss handles this for its
  buttons via `pointer-coarse`).

## Do and don't

- Do add new admin UI by composing `components/ui/*`.
- Do keep new coss components in `components/ui/` and run lint and build.
- Don't import `components/ui/*` into marketing pages or `/login`.
- Don't add `:root` colour or font overrides for dashboard needs.
- Don't add a second heading font.

## Open items

- Navbar and footer still use the marketing style on dashboard routes.
- First portaled component (Dialog, Select, Popover, Toast) needs its portal
  container inside `.admin-theme`, or the theme class on a higher element.
- Dashboard data is still sample data and the ChurchSuite form does not submit.
