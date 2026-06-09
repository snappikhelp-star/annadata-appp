# Annadata Agri & Seeds — GitHub Ready

## Run locally / Replit
```bash
npm install
npm run dev
```

## Cloudflare Pages settings
- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: leave blank

## Required Environment Variables
Add these in Cloudflare Pages → Settings → Variables or Replit Secrets:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Important pages
- Website: `/`
- Mobile app look: `/app`
- Admin login: `/admin/login`
- Admin panel: `/admin`

## Admin login
Create the admin user in Supabase:
Supabase → Authentication → Users → Add user → email + password → Auto Confirm ON.
Then login at `/admin/login`.

## Supabase database
Run these SQL files in Supabase SQL Editor:
1. `supabase_schema.sql`
2. `supabase-company-payments.sql`
3. `migration_run_in_supabase.sql` if needed
