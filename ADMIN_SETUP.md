# Portfolio admin setup

## Try it locally now

1. Run `start-local.cmd` in `G:\My Portfolio Website`.
2. Open http://127.0.0.1:5173/admin.
3. Choose **Open local editor preview**.

This preview is available only in Vite development when Supabase is not configured. It has no password and is NOT a real authenticated account. Uploaded images and records are stored in IndexedDB in this browser, on this origin. Clearing site data deletes them. They do not transfer automatically to Supabase. The public site in this browser reflects published preview projects; existing sample cards remain when there are no published preview projects. A production build never offers this preview.

## Connect Supabase

1. Create a Supabase project in your own account. Keep its database password private.
2. Open **SQL Editor**, paste `supabase/schema.sql` from this project, and run it once. It creates the projects table, private image bucket, admin allowlist and access policies. This script targets a new project; policies are not intended to be run twice.
3. Open **Authentication > Users**, create your admin user with an email and strong password, and confirm the email using the dashboard if needed. The login uses email/password; email serves as your username.
4. Copy that user's UUID. In SQL Editor run:

```sql
insert into public.portfolio_admins(user_id)
values ('REPLACE-WITH-YOUR-AUTH-USER-UUID');
```

5. Disable public user signups in Authentication settings. There is no signup form in the website. Only allowlisted users can read drafts or change projects, even if another user somehow signs up.
6. Get the **Project URL** and **publishable key** from the project's Connect/API settings. Copy `.env.example` to `.env.local` in the project root and fill both values. A legacy anon key also works if your project provides one. Never use a secret key or service-role key in a `VITE_` variable.
7. Restart the local server. Go to `/admin` and sign in with the email/password created above.

`.env.local` is ignored by Git. Vite exposes the publishable key to the browser by design; database and storage policies enforce access. Do not send your admin password here. Configure your account directly in Supabase.

## Project workflow

- New project: add a title, upload JPG/PNG/WebP slides (20 MB each, up to 50), and add a thumbnail.
- Upload selection order is preserved. Subsequent uploads append to the bottom. Drag a slide's handle onto another slide to reorder, or use the up/down buttons (also works on mobile).
- The image list has its own vertical scroll. Preview opens the same stacked viewer visitors see.
- Thumbnail controls choose horizontal/vertical crop position and zoom. Saved thumbnails are exactly 600 × 400 WebP images.
- Description is plain text, limited to 2,000 whitespace-separated words. It appears below the last slide in the viewer.
- Hero positions 1–5 and stack positions 1–4 are optional. Each published position can hold one project. Clear the old project's position before reassigning an occupied one.
- Published projects appear in `/portfolio` (and `/projects`, an alias). Featured projects additionally appear in the chosen landing sections. Public pages refresh data on navigation/reload and when the window regains focus.
- Save as draft removes a previously published project from public view. Archive hides it while preserving its files; restore returns it to draft. Delete removes the project and its files after confirmation.
- New or changed media uploads first, then the project row is saved. Replaced media is cleaned up after saving. Interrupted uploads can leave unused storage files; these may be removed manually from the project's UUID folder after checking the current project record.

## Vercel later

Use one Vercel project for the public site and `/admin`. Build command: `pnpm build`; output: `dist`. Add the two `VITE_SUPABASE_*` environment variables in Vercel before building. The included `vercel.json` handles the admin and portfolio routes. Supabase remains the separate managed database, authentication and image storage service. No secrets belong in the frontend or repository.

## Verify after connecting (required before deployment)

Live Supabase authentication and policies cannot be tested until you create and connect your project. Verify these using an incognito browser and the Supabase dashboard:

1. Logged-out visitors can read published projects and their images, but cannot read drafts/archives or write/delete any project or image.
2. Your allowlisted account can create, upload, edit, publish, archive, restore and delete.
3. A non-allowlisted authenticated account cannot access admin records or upload/change/delete files.
4. A draft image cannot receive a visitor signed URL. Published media can. Signed URLs last one hour, so a previously issued URL may continue working briefly after archiving; normal page queries immediately hide archived content.
5. Test upload interruption, slot collisions, description limits, and session expiry. Password reset/recovery is currently handled through Supabase's dashboard, not a custom public recovery flow.

Official references: https://supabase.com/docs/guides/database/postgres/row-level-security and https://supabase.com/docs/guides/storage/security/access-control

## Content and portfolio UI update

Run `supabase/migrations/20261007_content_and_order.sql` once on an existing Supabase setup (safe to rerun). It adds custom project pills, persistent portfolio ordering, and the website-content table with admin-only writes. It does not delete projects or uploaded media.

- Admin sidebar: Experience, Testimonials and FAQs each support add, edit and remove. Both FAQ fields are required. Removing every entry hides that section. Existing placeholders stay available until you edit the section.
- Project editor: three optional pill fields, 32 characters each. Blank fields are removed. The labels appear on hero and ScrollTrigger project cards.
- Sign in at `/admin`, then use **Preview website** in the admin sidebar and **See More** to open the portfolio in admin preview. Normal `/portfolio` visits are view-only, including when signed in. Reordering requires both preview mode and a Supabase-verified admin account; a preview URL alone grants no access. Hold a card for 1.2 seconds to enter rearrange mode, then drag it. On touch devices, release after the hold and drag in rearrange mode. Move earlier/later buttons are also available. Save order commits the public gallery order; Cancel discards it. Hero and stacked-card selections retain their separate positions.
- Modal: black title bar and description background, white text, light scrollbar thumb; the extra Project / Case Study label is removed. White-on-black text contrast is 21:1. Uploaded image content is unchanged.
- Portfolio previews use responsive 3:2 proportions (600×400 at available desktop width). Hero/footer glow timing is now 3 seconds; reduced-motion preferences still disable animation.

## Companies, skills, introduction and process

Apply `supabase/migrations/20261007_brand_content.sql` after the content/order migration. It extends the content table and adds private company-logo storage with admin-only uploads and public reads only for referenced logos.

The admin sidebar now provides Companies (maximum 20), Skills, Introduction (one entry), and How I work (maximum four steps). Company logos accept PNG/JPG/WebP up to 5 MB, are resized to a maximum 800 pixels and saved as WebP. Names can be shown without a logo. Skills and step names are required, as are introduction/process descriptions. Existing dummy entries can be edited or removed. The footer services ticker is intentionally independent of subsequent edits to skill pills.

The public footer now includes the owner's provided email and phone, following their explicit confirmation to display them publicly. Instagram and LinkedIn use the supplied profile links.
