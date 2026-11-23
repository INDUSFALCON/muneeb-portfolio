# AI Handover — Muhammad Muneeb Portfolio

**Document purpose:** persistent, platform-independent project memory for AI coding agents. Read this entire file and `CHANGELOG_AI.md` before changing code. This document describes the current source tree as inspected on **2026-11-23**. Facts labelled “verified” come from source/configuration or an observed build/deployment record; unavailable historical conversations are not treated as source-of-truth.

## A. Project overview

This project is Muhammad Muneeb’s responsive personal portfolio website and its browser-based admin workspace. The public site presents product/UI/UX, game, multimedia, photography, certification, experience and testimonial work. The admin route manages portfolio projects and website content through Supabase authentication, database records and storage.

The intended audience is prospective clients, employers and collaborators. The experience is dark-first, purple-accented, motion-rich and responsive, with a lighter content region, accessible controls, project modals and dedicated project/photography galleries. The current stage is a working Vite implementation with Supabase integration and production deployment configuration; content quality is partly placeholder-driven until the owner replaces remaining sample biography, experience, testimonials, FAQs and projects.

**Latest verified change (2026-11-23):** V2 section eyebrow labels now use explicit scoped selectors and an important shared typography rule based on `03 / KEEPING CURIOUS`; `01 / WHO I AM`, `02 / WHAT I BRING`, `04 / THE PROCESS`, `05 / SELECTED PROJECTS`, `06 / EXPERIENCE`, `08 / LET’S CLEAR THINGS UP`, and `HAVE SOMETHING IN MIND?` are aligned while project-card index numbers remain separately sized. Loading/selecting V1 resets the document and saved theme to light, after which the V1 toggle can manually switch to dark. Both V2 homepage and V2 dedicated routes have functional mobile hamburger navigation using the dark V2 palette and no theme toggle. `pnpm run build` passes; only the existing bundle-size warning remains. A production deployment was attempted after team authorization, but the Vercel static-file upload did not complete; no live release is claimed yet.

## B. Technology stack

| Area | Verified implementation |
|---|---|
| Language | JavaScript, JSX, CSS, SQL |
| Frontend | React 19, React DOM 19, Vite 6 |
| Styling | `src/index.css`, `src/admin/admin.css`, Tailwind Vite dependency present; most current layout is authored CSS plus utility classes in JSX |
| Typography | Locally bundled Poppins via `@fontsource/poppins` |
| Motion | GSAP 3 and `@gsap/react`; ScrollTrigger logic in `src/hooks/usePortfolioAnimation.js` |
| Backend | Supabase JavaScript client; Auth, Postgres tables/RPCs, Storage buckets, RLS policies |
| Local fallback | IndexedDB/localStorage preview mode when Supabase variables are absent in Vite development |
| Build | `pnpm run build`; Vite output is `dist` |
| Deployment | Vercel Vite project; `vercel.json` supplies security headers and SPA rewrites |
| Public URL | `https://muneeb-portfolio-swart.vercel.app/` (verified in deployment history; preserve unless explicitly requested) |

Important dependencies and roles:

- `react`, `react-dom`: component rendering and Strict Mode entrypoint.
- `gsap`, `@gsap/react`: pinned stacked portfolio animation and cleanup-safe React integration.
- `@fontsource/poppins`: self-hosted font assets.
- `@supabase/supabase-js`: browser client using `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
- `@tailwindcss/vite`, `tailwindcss`: configured dependency/tooling, although many final visual rules are in CSS.

Never put a Supabase service-role/secret key or admin password in source, `.env` files committed to the repository, or this document. Browser publishable/anon keys are acceptable only with correct RLS policies.

## C. Project architecture

### Top-level structure

```text
G:\My Portfolio Website\
├─ public/assets/                 downloaded Figma/sample media and SVGs
├─ public/portfolio-preview.jpg   social sharing preview image
├─ src/
│  ├─ App.jsx                     public homepage sections and data loading
│  ├─ main.jsx                    theme initialization and route selection
│  ├─ index.css                   public design system, responsive CSS, motion
│  ├─ data/portfolio.js           fallback profile, skills, sample content
│  ├─ components/                 public reusable UI
│  ├─ admin/                      admin login, editor, content manager, metrics
│  ├─ hooks/usePortfolioAnimation.js
│  └─ lib/                        Supabase, fallback stores, rules, theme, metrics
├─ supabase/
│  ├─ schema.sql                  base projects/auth/storage schema
│  ├─ Metrics Update.sql          daily page-view table/RPCs
│  └─ migrations/                 content/order/media/certification extensions
├─ index.html                     metadata, OG/Twitter preview, dark theme default
├─ vercel.json                    Vite build, rewrites and security headers
├─ vite.config.js
├─ package.json / pnpm-lock.yaml
├─ README.md / ADMIN_SETUP.md
└─ start-local.cmd
```

Generated/untracked output such as `node_modules`, `dist` and `.pnpm-store` should not be edited. `dist` is regenerated by the build.

### Entry and routing

`src/main.jsx` sets `document.documentElement.dataset.theme` through `readTheme()` and renders `AdminApp` whenever `window.location.pathname` starts with `/admin`; all other routes render `App`. This is a small SPA route switch rather than React Router. `vercel.json` rewrites `/admin/*`, `/portfolio`, `/projects` and `/photography` to `index.html`.

`Header.jsx` links to homepage anchors and the photography page. `adminPreview.js` adds `?preview=admin` for controlled admin preview links. `PortfolioGallery.jsx` supports both public view-only galleries and admin preview reorder mode; it verifies Supabase admin status before enabling reorder controls.

### Public component/data flow

- `App.jsx` loads `defaultContent`/`loadContent()` and `listProjects()`, tracks loading/error state, records a production landing-page view, and composes `Header`, `Hero`, `About`, `Certifications`, `Process`, `Projects`, `Experience`, `Testimonials`, `FAQ`, `Footer`, `ProjectModal` and gallery pages.
- `Hero` repeats up to five selected projects in two groups for an infinite horizontal showcase; cards open `ProjectModal`.
- `About` renders introduction, skills, `Certifications`, and `Process`.
- `Projects` renders selected stack cards and a filled See More link to `/portfolio`.
- `ProjectMedia` handles image/video media; `ProjectModal` renders the black, scrollable Behance-style slide stack and description.
- `PortfolioGallery` renders the dedicated project or photography grid. Photography uses square previews and hover-only captions.
- `Companies` renders the looping company marquee.
- `Header` includes profile picture modal, responsive navigation and light/dark toggle.
- `Certifications` and `CertificatePreview` render the certificate carousel and persisted fit/zoom/position preview settings.

### Admin/data flow

- `AdminApp.jsx` manages Supabase email/password login, admin allowlist verification, local-preview fallback, sidebar navigation, project/photography collections and theme toggle.
- `ProjectEditor.jsx` manages ordered slide uploads, thumbnails, image/video media, crop controls, title, pills, description, hero/stack positions, draft/publish/archive/delete workflow.
- `ContentManager.jsx` manages profile, companies, introduction, skills, process, achievements, experience, testimonials and FAQs. Limits/field definitions live in `contentRules.js`.
- `MetricsDashboard.jsx` invokes the admin-only `get_landing_page_metrics` RPC and displays daily rows, total, today and best day.
- `projectStore.js` chooses Supabase or IndexedDB local preview, signs media URLs, uploads/removes files and calls project/order RPCs.
- `contentStore.js` reads/upserts `site_content`, uploads site media and cleans replaced files.

### Supabase integration

`schema.sql` creates `portfolio_admins`, `projects`, validation functions, `project-media` storage and RLS. The migration sequence extends `site_content`, project pills/order, company/site media, photography/video support and certifications. `Metrics Update.sql` creates `daily_page_views`, an anonymous `record_landing_page_view()` RPC, and admin-only `get_landing_page_metrics()`.

The browser calls `recordLandingPageView()` only on production `/` without preview query. `src/lib/metrics.js` stores the current Karachi calendar date in localStorage under `muneeb-portfolio:last-landing-page-view`, so the same browser/device will not call the RPC twice that day. This is device/browser deduplication, not guaranteed IP/identity deduplication: private windows, cleared storage, other browsers/devices and blocked storage may count separately.

## D. Design system and UI/UX guidelines

These values are verified from `src/index.css`, JSX classes and `index.html`:

- Primary dark background: near-black navy/purple (`#02021a`, `#080811`, `#11111d`); dark cards commonly use `#1b1b2c`/`#191925`.
- Brand purple: `#5138f2` and `#6D4AFF`; light purple text/highlights include `#c4b5fd`, `#A99AFD`, `#B6A9FF`.
- Body/light region defaults to white/light gray with dark text; dark mode overrides the light region and cards.
- Poppins is the only intended font family, with 400/500/600 weights locally served.
- Heading styles are large, responsive `clamp()` values; section headings use purple/light-purple accents. “Muneeb” in the hero is full white.
- Cards use rounded corners (often 18–32px), thin low-contrast borders, restrained shadows and purple focus/active states.
- Project thumbnails use 3:2 / 600×400 proportions; photography previews use 1:1. Certificate previews use an approximately A-series ratio and `contain` by default.
- Public project modal is black with white text and a light scrollbar thumb. Photography captions are hidden until hover/focus and use a dark purple bottom-to-top gradient.
- Desktop project gallery uses three cards per row; photography uses four square cards on wide screens, two on narrower screens.
- Main responsive breakpoint is around 760px, with additional 900/1100/600/400/380px adjustments. Mobile uses stacked content, touch-friendly controls, horizontal overflow where appropriate and centered footer social icons.
- Motion: hero/footer glow breathes over 3s, marquees loop, showcase loops horizontally, GSAP project stack pins/scales cards. `prefers-reduced-motion` disables animation/pinning and permits ordinary scrolling.
- Preserve accessible labels, native FAQ details/summary, keyboard tabs, focus states, modal close behavior and contrast. Do not reintroduce visible dummy project cards while production content is loading; the hero shows loading skeletons and hides the showcase until data arrives.

## E. Website pages and feature status

| Feature/page | Status | Verified implementation and limits |
|---|---|---|
| Homepage `/` | COMPLETED | Hero, about, skills, certifications, process, selected projects, experience, testimonials, FAQs, footer in `App.jsx`; content may still contain fallback placeholders. |
| Hero project loop | COMPLETED | Selected projects repeat in a seamless loop, pause button, hover/focus pause and loading skeleton. |
| Companies marquee | COMPLETED | `Companies.jsx`, max 20 content entries, logo/name storage through `ContentManager`. |
| About/skills/process | COMPLETED | Supabase-managed content with local fallback; process max four entries. |
| Certifications carousel | COMPLETED | Admin image/title/description and preview fit/zoom/position controls; certificate data requires migration. |
| Project gallery `/portfolio`, `/projects` | COMPLETED | Responsive 3-column desktop gallery, modal, separate order management in verified admin preview. |
| Photography `/photography` | COMPLETED | Separate project kind, square 4-column desktop grid, no pills, hover-only caption gradient. |
| Project modal | COMPLETED | Scrollable vertical media stack; image/video support; black/white accessible styling. |
| GSAP stacked landing section | COMPLETED | `usePortfolioAnimation.js`; four or configured stack cards, disabled for reduced motion/short viewports. Verify current content selection before changing limits. |
| Admin authentication | COMPLETED when Supabase configured; LOCAL PREVIEW only without it | Supabase email/password plus `portfolio_admins` allowlist. Local preview is intentionally not secure and only development. |
| Admin project CRUD | COMPLETED when migrations/storage configured | Upload, reorder, crop thumbnail, title, description, pills, status, archive/restore/delete. |
| Admin content tabs | COMPLETED when migrations configured | Profile, companies, introduction, skills, achievements, process, experience, testimonials, FAQs. |
| Metrics page | COMPLETED when Metrics SQL is installed | Daily stats RPC and admin dashboard. |
| Daily view counting | PARTIALLY IMPLEMENTED | Production only and device/browser once-per-day dedupe; not IP-based or unique-person analytics. |
| Contact form delivery | NOT IMPLEMENTED | Browser validation/preview only; it intentionally does not send or store messages. |
| Supabase OAuth/GitHub login | NOT IMPLEMENTED | Current admin code uses email/password, not GitHub OAuth. |
| Final real portfolio content | PARTIALLY IMPLEMENTED | Fallback sample projects and placeholder experience/testimonials/FAQs remain in `src/data/portfolio.js` until replaced. |

## F. Development history

No `.git` directory or Git log is present in `G:\My Portfolio Website`; historical commits cannot be independently verified here. The following implementation history is reconstructed from current files, migration dates, README/admin notes, and available project context. Treat dates before the current inspection as source/context evidence, not as a complete commit log.

1. **Initial Vite/Figma implementation (date not recoverable):** React/Vite portfolio scaffold, Poppins assets, Figma-derived public sections and sample media were established. `README.md` identifies the source as the Moodboards-memes Figma landing page.
2. **Admin foundation:** Supabase schema, email/password admin allowlist, private project-media storage, RLS, IndexedDB development preview and project editor were added. `schema.sql`, `projectStore.js`, `AdminApp.jsx` and `ProjectEditor.jsx` are the verified result.
3. **Content/order migration:** `20261007_content_and_order.sql` added site content, custom pills and persistent ordering. The old reorder function signature was corrected in later migration work to include project kind.
4. **Brand/content migration:** `20261007_brand_content.sql` added editable companies, skills, introduction and process content plus site-media storage policies.
5. **Media/photography migration:** `20261008_media_photography.sql` added photography projects, project video MIME/size support, 40 MB project media limit and kind-aware ordering.
6. **Certification migration:** `20261008_certifications.sql` added achievement/certificate content and storage policy. `CertificatePreview.jsx` and admin adjustment controls preserve original media while saving preview settings.
7. **Visual/responsive refinement:** Current CSS records requested changes including dark-first theme, faster glows, no top radius on project/experience sections, 600×400 project previews, three-column portfolio layout, square photography cards, footer mobile centering, testimonial sizing, accessibility labels and hover captions.
8. **Social preview/deployment:** `portfolio-preview.jpg`, Open Graph/Twitter metadata and Vercel configuration were added. The production alias is the existing `muneeb-portfolio-swart.vercel.app` domain.
9. **Metrics:** `Metrics Update.sql`, `MetricsDashboard.jsx` and `metrics.js` added daily tracking. The current code additionally deduplicates the same browser/device once per Karachi calendar day using localStorage. A successful production deployment was recorded in available task history; reverify after future deploys.

Abandoned/unverified approaches: local browser preview is intentionally retained only as a development fallback rather than being treated as authentication; contact delivery was left as a preview because no mail service was connected; IP collection was not added because the current requested dedupe was implemented without collecting IP addresses.

## G. Current development status

### Working/complete

- Vite production build path and Vercel SPA rewrites/security headers.
- Public responsive portfolio and photography routes.
- Supabase-backed content/project model with RLS-oriented setup scripts.
- Admin project/content editor and admin-only preview reorder flow.
- Media uploads including video support and 40 MB storage setting in migration.
- Certification preview adjustment controls.
- Metrics dashboard and production-only, browser-local daily dedupe.
- Dark/light theme controls and dark default.

### Known limitations and technical debt

- No Git history is available in this directory; preserve future commits externally.
- `src/data/portfolio.js` contains fallback/sample content; final owner content is not fully represented in source.
- Supabase migrations are run manually in SQL Editor and cannot be verified from this code-only workspace. A newly provisioned Supabase project must run base schema then migrations in dependency order.
- Metrics are page-view counts, not unique visitors. localStorage is user-controlled and is not a security boundary.
- Contact form has no delivery backend.
- Large `App.jsx`, `AdminApp.jsx` and `index.css` are functional but dense; refactor only with tests/visual verification.
- Build output may report a large JavaScript chunk; code splitting is a future optimization.
- Supabase admin authentication and storage policy behavior require end-to-end testing against the actual configured project.

## H. Current working state

The latest verified source state is the metrics/deduplication implementation. `src/lib/metrics.js` now prevents repeat production landing-page RPC calls on the same browser/device for the same Karachi calendar date. A fresh `pnpm run build` on 2026-11-23 passed: 101 modules transformed and `dist` emitted. Vite reports an existing large-chunk warning (about 643 kB minified JS). The public Vercel deployment was previously reported ready, but this inspection did not perform a new deployment.

Recently relevant files:

- `src/lib/metrics.js` — daily view guard and RPC calls.
- `src/App.jsx` — calls `recordLandingPageView()` on app mount and composes all sections.
- `src/admin/MetricsDashboard.jsx` — metrics UI.
- `src/admin/AdminApp.jsx` — Metrics sidebar route.
- `supabase/Metrics Update.sql` — database table/RPC/grants.
- `src/index.css`, `src/admin/admin.css` — current visual rules.

There is no verified unfinished edit in the source tree at this inspection. The next concrete task should be an end-to-end Supabase verification pass: sign in as the allowlisted admin, confirm Metrics loads, verify two same-day reloads produce one row increment, then test a new date/browser and document the result. After any code change, run `pnpm run build` and update both memory files.

## I. Important technical decisions

- Keep the app as a Vite SPA with path rewrites rather than introducing a router or framework migration.
- Keep Supabase client access browser-safe: publishable key plus RLS; never service-role credentials.
- Separate project and photography records with a `kind` field and reuse the editor/gallery/modal where behavior is identical.
- Keep public portfolio ordering view-only by default. Reorder is enabled only in `?preview=admin` after `is_portfolio_admin()` verification.
- Preserve existing visual language: Poppins, dark navy/purple hero, purple headings, rounded cards, responsive CSS, accessible native controls and reduced-motion behavior.
- Use localStorage only as a non-sensitive analytics dedupe hint. Do not describe it as a secure identity or IP mechanism.
- Keep the local IndexedDB editor preview visibly labelled and development-only.
- Do not change the existing Vercel production alias or public contact presentation without explicit permission.

## J. Remaining roadmap

### Critical

- **End-to-end Supabase security verification — OPEN.** Run logged-out, allowlisted-admin and non-allowlisted-account tests from `ADMIN_SETUP.md`; verify RLS, signed URLs, storage and metrics RPC access. Depends on access to the actual Supabase project. Relevant: `supabase/*.sql`, `src/lib/projectStore.js`, `src/lib/contentStore.js`.
- **Protect credentials and deployment environment — OPEN/OPERATIONAL.** Confirm Vercel production has only `VITE_SUPABASE_URL` and publishable key, never service-role credentials. Relevant: Vercel project settings and `ADMIN_SETUP.md`.

### High priority

- **Replace fallback/sample content — PARTIALLY COMPLETE.** Add final projects, biography, experience, testimonials, FAQs, companies, skills and certificates through admin/Supabase. Criteria: no unintended placeholder copy in public production.
- **Validate metrics dedupe — OPEN.** Compare same browser reload, next-day visit, cleared storage/private browser and another device; document expected count behavior. Relevant: `src/lib/metrics.js`, `supabase/Metrics Update.sql`, `MetricsDashboard.jsx`.
- **Test project/media workflows — OPEN.** Exercise upload failure cleanup, video under/over 40 MB, thumbnail crop, 2,000-word description, slot collisions, archive/restore/delete and modal scrolling.

### Medium priority

- **Contact delivery — PLANNED.** Connect a transactional email provider or server-side endpoint; keep secrets server-side and add abuse/rate limiting. Relevant: `Footer` in `src/App.jsx` and deployment environment.
- **Performance/code splitting — RECOMMENDED.** Split admin/editor and gallery routes or lazy-load heavy GSAP/admin code after measuring. Preserve Vite SPA rewrites.
- **Accessibility and responsive regression pass — OPEN.** Test keyboard, screen reader, touch, narrow mobile, tablet, reduced motion, modal focus and contrast after future UI edits.
- **Create/restore Git history — RECOMMENDED.** Initialize or connect a repository outside this documentation task and preserve future changelog-linked commits.

### Low priority

- Refactor dense JSX/CSS into smaller modules only when behavior is covered by visual/manual tests.
- Add automated lint/type/test tooling if the team wants it; no test script currently exists.
- Replace placeholder “coming soon” social controls only when real destinations are provided.

### Future enhancements

- Unique visitor analytics with a privacy-reviewed server-side strategy if required; decide retention/consent before collecting IP or identifiers.
- Password recovery UX, audit logs, upload progress persistence, bulk project management and richer metrics filters.
- Automated CI build/deploy and migration documentation.

## K. Instructions for future AI agents

1. Read this entire `AI_HANDOVER.md` and `CHANGELOG_AI.md` before making changes.
2. Inspect the actual source/configuration; documentation is a guide, not permission to assume behavior.
3. Preserve the existing Vite architecture, route rewrites, Supabase RLS model, public/admin separation and design system.
4. Continue from the latest verified state; do not rebuild working functionality or migrate frameworks without explicit approval.
5. Do not remove features, content controls, accessibility behavior, reduced-motion behavior or the existing Vercel domain without explicit permission.
6. Avoid unnecessary dependencies and keep upload/media/security behavior consistent with current policies.
7. Treat local preview as untrusted development-only functionality.
8. Test changes proportionally: at minimum run `pnpm run build`; for UI changes use localhost browser checks; for Supabase changes run the SQL and security checks in `ADMIN_SETUP.md`.
9. Never expose credentials, tokens or passwords in source, logs or these files.
10. After every meaningful change, update this document’s status/roadmap and prepend a concise entry to `CHANGELOG_AI.md`.
11. If work is interrupted, record exactly what is incomplete, the last verified command/result and the next command to run.
12. Preserve historical entries; correct inaccurate current-state statements without deleting useful history.
# Latest verified update — 2026-11-23

## V2 visual correction — 2026-11-23

Re-read the exact Figma frame `Muhammad Muneeb — Portfolio V2` (`37:4435`). Corrected the homepage composition so the V2 route no longer renders the legacy `Header`; V2 now owns its complete header and landing-page layout. This fixes the most visible old/new UI mixing issue. `pnpm run build` passes after the correction.

## V2 full-frame implementation — 2026-11-23

Expanded `src/components/LandingV2.jsx` into a complete standalone long-form page matching the supplied frame structure: hero/showcase, About Me, Skills, Certifications & Achievements, How do I work, selected projects, Experience, Testimonials, FAQ, services ticker, and contact footer. The component consumes live Supabase content props while keeping the legacy page separate. Added responsive V2-specific styles in `src/index.css`. Build verified successfully.

Removed the later global compact/shrink override after visual review because it incorrectly made the whole V2 page too small and dense. The base Figma-oriented proportions are now active again. `pnpm run build` passes.

Added a final Figma-frame scale override in `src/index.css` using the reference frame’s measured desktop values for the 150.867px header, 59.718px portrait, 19.801px navigation, 157.153px hero type, 44.003px card gaps, and responsive mobile reductions. Build passes.

Added the About Me and Skills frame pass: two-column proportions, taped polaroid portrait, Figma-style copy hierarchy, divider, handwritten annotation, and lime/dark skill pills. Build passes.

Added the V2 Companies section between hero and About. It uses the same admin-managed company content as V1, supports logos or names, and loops horizontally with responsive styling.

Implemented an optional Figma-inspired landing page variant while preserving the existing landing page. `src/components/LandingV2.jsx` provides the dark editorial hero, selected-work cards, company strip, and portfolio CTA. `src/lib/landingVariant.js` loads/saves the selected variant using Supabase `site_settings` (with local-preview fallback), and `src/admin/LandingVariantManager.jsx` exposes the selector in the admin panel under “Landing UI”. The selector is wired into `src/admin/AdminApp.jsx`; the homepage switch is wired into `src/App.jsx`.

Added `supabase/migrations/20261123_landing_variant.sql`. Run it in Supabase before using the selector on the deployed site. The default is `legacy`, so existing visitors keep the old UI until an admin selects the new one.

The build was verified with `pnpm run build` successfully. The build reports only the existing bundle-size warning. The new landing variant currently reuses live project, company, and profile content; further pixel-level refinement can continue after visual review against the Figma frame.
