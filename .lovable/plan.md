# Redesign all pages (except Home)

Goal: bring every page (public + authenticated) into visual parity with the new `Home.tsx` — light "Cloud & Blue" surface, Space Grotesk display + DM Sans body, hero panels, soft-elevated cards, generous whitespace, and consistent gradient/CTA language. Functionality stays identical; only layout, structure, and styling change.

## Shared design system (applied to all redesigned pages)

- **Hero pattern**: every page opens with a `gig-hero-panel` (deep slate gradient w/ cyan eyebrow, display headline, subhead, optional inline KPI/action chips) — mirrors Home hero.
- **Body grid**: light surface (`gig-grid-surface`), 12-col responsive grid, content lives in `gig-panel` cards with rounded-3xl, shadow-elevated, hairline borders.
- **Type scale**: `font-display` for h1/h2 (Space Grotesk), DM Sans for body. h1 4xl–6xl, h2 2xl–3xl.
- **Color usage**: white/slate-50 surfaces, primary `#3B82F6` for CTAs, cyan-200 eyebrows over dark hero, money values in `text-primary`.
- **Components**: standard `Button` (rounded-full primary), `Input`/`Select` w/ rounded-2xl, badges, KPI chips. Reuse existing `gig-panel`, `gig-panel-interactive`, `gig-kpi-card`, `gig-hero-panel`, `gig-eyebrow` utilities already defined in `index.css`.
- **AppShell**: keep current dark floating top-nav (already redesigned recently) so the dashboard chrome remains; only the page bodies change.

## Pages to redesign

### Public (PublicSiteShell)
1. **About.tsx** — hero + mission/vision split, founders/values bento grid, stats strip, CTA band.
2. **HowItWorks.tsx** — hero + role-tabbed "Client / Worker" zigzag steps, Instant-Hire & AutoMatch feature panels, FAQ accordion, CTA.
3. **Contact.tsx** — hero + 2-col layout (form card + contact details / hours / socials), success toast unchanged.
4. **ExplorePublic.tsx** — hero w/ search, sticky filter bar (LocationFilters + radius + category chips), responsive `PublicGigCard` grid w/ empty state, sign-up CTA banner.
5. **WorkerProfile.tsx** — hero w/ avatar, name, score chips, Instant Hire CTA → modal; tabs for About / Skills / Reviews / Recent jobs; sticky right sidebar w/ rates and availability on desktop.
6. **Auth.tsx** — split-screen: brand panel (left, dark hero) + form card (right) with role toggle, sign-in / sign-up tabs.
7. **AdminAuth.tsx** — same split treatment, admin-tinted accent.
8. **NotFound.tsx** — centered hero card w/ illustration, primary CTA back to Home, secondary CTA to Explore.
9. **Index.tsx** — verify it just redirects; if not, align spinner to new theme.

### Authenticated (AppShell)
10. **AppHome.tsx** — hero greeting + KPIs row, two-column layout: live "Gigs near you" feed (with LocationFilters + radius + active hire banner integration) on the left, sidebar w/ AutoMatch promo, nearby workers, quick actions on the right. Mobile collapses to single column.
11. **AutoMatch.tsx** — hero w/ Auto-Earn toggle, current-match centerpiece card w/ countdown, history list below.
12. **Explore.tsx** — same shell as ExplorePublic but for logged-in users with apply CTAs.
13. **Jobs.tsx** — hero + tabbed (Open / In progress / Completed) gig list with status pills.
14. **JobDetail.tsx** — hero (title, budget, status), 2-col: details + map/location card on left, application/timeline panel on right; gated client info preserved.
15. **Messages.tsx** — full-height 2-pane layout: conversation list + thread, sticky composer, light surfaces.
16. **Wallet.tsx** — hero balance, KPI row (in escrow, available, lifetime), transactions table, withdrawal CTA.
17. **PostJob.tsx** — hero + stepper card (Details → Location → Budget → Review) with live preview on desktop.
18. **Profile.tsx** — refresh hero (already partly themed), reorganize sections into tabs: Overview, Edit, Payouts, Security.
19. **Saved.tsx** — hero + saved gigs grid w/ empty state.
20. **AdminDashboard.tsx** — hero + KPI row, tabbed sections (Withdrawals, Users, Jobs, Reports) using consistent table cards.
21. **Settings.tsx** — already on-theme; tighten spacing/section headings to match new hero pattern (minor pass).

## Out of scope

- `Home.tsx` (untouched).
- Backend, routes, data hooks, Supabase schema, AppShell chrome, Footer, PublicSiteShell — only minor tweaks if needed for layout parity.
- No new features; redesign only.

## Technical notes

- Reuse existing utility classes from `src/index.css` (`gig-hero-panel`, `gig-panel`, `gig-kpi-card`, `gig-eyebrow`, `gig-grid-surface`).
- Add a small `PageHero` component in `src/components/gigclose/PageHero.tsx` to standardize the hero block across pages and avoid duplication.
- Add a `SectionHeading` helper for consistent eyebrow + title + subtitle pattern.
- Keep all existing imports, queries, mutations, routing, and props intact — diffs are JSX/className-focused.
- Verify zero TS errors and no regressions in real-time subscriptions, geolocation, instant-hire tracker, withdrawals.

## Rollout order

Public pages first (About, HowItWorks, Contact, Auth, AdminAuth, NotFound, ExplorePublic, WorkerProfile), then dashboard (AppHome, Jobs, JobDetail, Messages, Wallet, PostJob, Profile, Saved, AutoMatch, Explore, AdminDashboard, Settings polish).
