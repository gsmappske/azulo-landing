# azulo-landing

Standalone marketing landing page for [azulobooks.com](https://azulobooks.com).

## Stack
- React 19 + TypeScript
- Vite
- Tailwind CSS (pricing cards)
- Supabase (public pricing plans, read-only)
- lucide-react icons

## Setup

```bash
npm install
cp .env.example .env      # fill in your Supabase URL + anon key
npm run dev
```

## Build

```bash
npm run build
```

## Deploy (Vercel)

1. Push this repo to GitHub
2. Import in Vercel
3. Add environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
4. In Vercel → Settings → Domains → add `azulobooks.com` and `www.azulobooks.com`

## Domain (one.com)

Point the root domain `azulobooks.com` to Vercel:
- Type: `CNAME`, Name: `@` (or `www`), Value: `cname.vercel-dns.com`
- Or use Vercel's A-record IPs for the apex domain

## Related projects

| Domain | Repo | Purpose |
|---|---|---|
| azulobooks.com | azulo-landing (this) | Marketing landing page |
| apps.azulobooks.com | Azulo2/AZULOBOOKS | ERP application |
| converter.azulobooks.com | (separate) | Doc converter tool |
