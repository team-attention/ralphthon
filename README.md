# Ralphthon

Hackathon operations site for Team Attention's Ralphthon events, live at https://ralphthon.team-attention.com.

- Participants: Google sign-in, team registration, link submission, lobster requests.
- Admins: live dashboard, lobster queue, CSV export, networking readiness.

## Develop

```bash
pnpm install
cp .env.example .env.local   # fill in Supabase, admin and Polar values
pnpm dev                     # http://localhost:3000
```

Before pushing, run `pnpm lint`, `pnpm tsc --noEmit`, `pnpm build` and `pnpm test:e2e`.
A push to `main` deploys to production on Vercel.

Agent and contributor rules: [AGENTS.md](AGENTS.md).
