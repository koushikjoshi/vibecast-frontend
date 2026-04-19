# VibeCast — Frontend

Next.js 15 App Router + TypeScript + Tailwind front end for **VibeCast**, the
newsroom-as-a-service podcast app. See [`PRD.md`](../PRD.md) in the parent
workspace for the product spec.

## Stack

- **Next.js 15** (App Router, RSC, TypeScript, `src/` dir)
- **Tailwind CSS v4**
- **shadcn/ui** (to be installed) for the component kit
- Server-sent events (SSE) for live trace streaming from the backend

## Routes (planned, per PRD §7.1)

| Path                          | Purpose                                     |
|-------------------------------|---------------------------------------------|
| `/`                           | Landing — today's episode + CTA             |
| `/feed`                       | News Feed (curated daily episodes)          |
| `/new`                        | Make Your Own (creator flow + live trace)   |
| `/episode/[id]`               | Episode page (player + transcript + share)  |
| `/studio`                     | Host Studio — roster                        |
| `/studio/host/new`            | Hire a host                                 |
| `/studio/host/[id]`           | Edit a host                                 |
| `/traces`                     | All runs (search, diff)                     |
| `/traces/[run_id]`            | Single run's full trace tree                |

RSS feed itself is served by the backend at `/feed.xml`.

## Local dev

```bash
npm install
cp .env.example .env.local   # point NEXT_PUBLIC_BACKEND_URL at your local FastAPI
npm run dev                  # http://localhost:3000
```

The backend must be running at `http://localhost:8000`
(see [`../vibecast-backend/README.md`](../vibecast-backend/README.md)).

## Deployment

Deployed on **Vercel**. Env vars configured in the Vercel project:

- `NEXT_PUBLIC_BACKEND_URL` → the Coolify-hosted FastAPI domain
  (e.g. `https://api.vibecast.yourdomain.com`)
- `INTERNAL_API_KEY` → matches the backend's `INTERNAL_API_KEY`

## Notes

- Keep the spectator UX a first-class concern — the live trace panel during
  generation is core product, not a debug affordance (PRD §7.3 Step C).
- Never import server-only secrets (e.g. `INTERNAL_API_KEY`) into client
  components. Use Server Components / Route Handlers for that.
