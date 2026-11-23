# Muhammad Muneeb — Portfolio

React + JavaScript + Tailwind CSS + GSAP/ScrollTrigger, built with Vite.
Design source: Figma `Moodboards-memes`, Page 1, `MY_Landing Page`, frame `47:178`.

## Local development

Double-click `start-local.cmd`, then open the localhost URL printed in the terminal. Ctrl+C stops the server. With Node.js and pnpm available on PATH:

```sh
pnpm install
pnpm dev
pnpm build
pnpm preview
```

The launcher falls back to this PC's Codex-bundled Node if needed. No global packages are required by the project.

## Edit content

`src/data/portfolio.js` holds the profile, five company-logo slots, sample showcase projects, skills, four process slides, sample portfolio cards, experience, testimonials, FAQs, and social links.

Put company logo files in `public/assets/` and set each company's `logo` to `/assets/your-logo.svg`. Set the profile and social URLs when available. Current biographies, experience, and testimonials are placeholders. The project visuals and sample project descriptions come from the supplied Figma design.

`src/App.jsx` contains the page sections. `src/components/Header.jsx` contains the responsive menu. `src/index.css` contains the Figma colors, Poppins typography, responsive layouts, glows, and marquee animations. Poppins is served locally through @fontsource; Figma images and SVGs are downloaded into `public/assets`.

## Interactions

- Hero: up to five selected projects in a seamless 48-second horizontal loop; pause control, hover and keyboard-focus pause.
- Hero/footer: subtle seven-second glow breathing animation.
- Process: four tabs, keyboard arrow/Home/End navigation, and touch swipe.
- Portfolio: a pinned GSAP timeline presents four cards in sequence, scales previous cards backward, then releases the pin. Reverses naturally when scrolling up. All GSAP state is cleaned up for React Strict Mode.
- Viewports shorter than 650px and reduced-motion preferences use ordinary stacked document flow instead of pinning. Reduced motion also disables glow/marquee motion and allows manual horizontal showcase scrolling.
- Testimonials: previous/next controls and slide indicators.
- FAQs: accessible native details/summary accordions.
- See More: `/portfolio`, the published project gallery (`/projects` is also supported). Every project card opens a scrollable image-stack modal, with its description after the last slide.
- Contact form: browser email validation and an explicit preview message. It does not send or store submissions. Social/LinkedIn controls explain that the destination is pending until real URLs are configured.

## Deployment later

Vercel preset: Vite. Build: `pnpm build`. Output: `dist`.
`vercel.json` includes rewrites for `/admin`, `/portfolio` and `/projects`. Configure Supabase environment variables before deployment; see `ADMIN_SETUP.md`. Nothing has been deployed. Commit the source and pnpm lockfile, excluding node_modules, dist, and .pnpm-store.

## Project admin

Open `/admin` for the project manager. The generic responsive dashboard includes ordered drag-and-drop image uploads, reorder controls, 600×400 thumbnail cropping, descriptions up to 2,000 words, featured positions, drafts, publishing, archive/restore and deletion.

Read `ADMIN_SETUP.md` for the Supabase connection and admin-account setup. Until connected, Vite development offers an explicitly labelled local browser preview. Real login uses Supabase email/password and an admin allowlist. The database and private-storage access policies are in `supabase/schema.sql`. Never put a service-role/secret key in the frontend.
