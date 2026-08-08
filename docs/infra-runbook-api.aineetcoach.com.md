# API Infrastructure Runbook — api.aineetcoach.com

## Service Overview
- **Purpose**: Dedicated mobile API origin for AI NEET Coach Flutter application
- **Hosting**: Render Free (initial deployment)
- **URL**: https://api.aineetcoach.com
- **Render Service URL**: (set after deployment, used as temporary fallback)
- **Independence from Vercel**: YES — separate Node.js process, separate deployment pipeline

## Deployment
1. Connect GitHub repo to Render
2. Set service name: `neet-api`
3. Build: `npm install && npm run build`
4. Start: `node server.js`
5. Set all required env vars in Render Dashboard (see list below)
6. Configure custom domain: `api.aineetcoach.com` → Render CNAME
7. TLS: Auto-provisioned by Render (Let's Encrypt)

## Required Environment Variables (set in Render Dashboard)
| Variable | Description | Source |
|---|---|---|
| SUPABASE_URL | Supabase project URL | Supabase Dashboard |
| SUPABASE_SERVICE_ROLE_KEY | Service role key | Supabase Dashboard |
| SUPABASE_ANON_KEY | Anon key | Supabase Dashboard |
| GEMINI_API_KEY | Gemini AI key | Google AI Studio |
| NEXT_PUBLIC_SUPABASE_URL | Public Supabase URL | Supabase Dashboard |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Public anon key | Supabase Dashboard |
| NEET_API_ORIGIN | api.aineetcoach.com | Hardcode this |
| NODE_ENV | production | Hardcode this |
| SENTRY_DSN | Sentry DSN for this service | Sentry Dashboard |

**Important**: Never commit secrets to the repository. Configure all secrets in Render Dashboard only.

## Health Checks
- Health: GET https://api.aineetcoach.com/api/health
- Readiness: GET https://api.aineetcoach.com/api/health/readiness
- Version: GET https://api.aineetcoach.com/api/health/version

## Fault Isolation Model

### If Vercel (ai-neet.vercel.app) goes down:
- Web/PSEO pages: UNAVAILABLE
- Mobile app API: CONTINUES via Render
- Student impact: Can't access web, can use mobile normally

### If Render goes down:
- Web/PSEO pages: CONTINUES via Vercel
- Mobile app API: UNAVAILABLE (online features degraded)
- Student impact: Mobile shows offline/degraded state, cached content available
- Note: This is the acknowledged Render Free single-origin limitation

## Monitoring
- Set up Better Uptime / UptimeRobot to ping /api/health every 5 minutes
- Alert on 2+ consecutive failures
- Render Free may sleep after 15 minutes of inactivity — the /api/cron/keepalive route exists for this

## Deployment Checklist
- [ ] Render service created from GitHub repo
- [ ] All env vars set in Render Dashboard
- [ ] Custom domain `api.aineetcoach.com` configured
- [ ] DNS CNAME record pointing to Render domain
- [ ] TLS certificate provisioned
- [ ] /api/health returns 200
- [ ] /api/auth/login tested with Postman
- [ ] Flutter app NEET_API_URL dart-define pointing to https://api.aineetcoach.com
- [ ] Vercel outage simulation passed
- [ ] Uptime monitoring active

## Rollback
Render supports instant rollback via the Dashboard to any previous deploy. In emergency, re-point DNS back to Vercel temporarily while investigating.
