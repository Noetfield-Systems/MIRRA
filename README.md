# MIRRA 2.0

Editorial psychology, relationship discovery, and thoughtful self-reflection.

## Features

- 50-item IPIP Big Five factor markers with published reverse-scoring, plus 9 original eight-question reflection journeys.
- MIRRA Together: a two-person invitation experience with comparisons and conversation starters. Guest participation does not require an account.
- Email + password accounts backed by PostgreSQL, with private reports and journal entries; account export and deletion.
- Daily reflection prompts, 3 interactive stories, printable result cards, profile history, and personal Mirror.
- AI Mirror works when `OPENAI_API_KEY` or `DEEPSEEK_API_KEY` is present. Otherwise it explicitly provides guided prompts, not AI-generated content.
- Hosted payment links may be configured via `MIRRA_*_LINK`. Checkout buttons remain disabled until configured. Payment unlocking requires Stripe webhook configuration.
- Original MIRRA experience remains available at `/classic`.

## Development

`npm install && npm test && npm start` (Node.js 20+).

## Deployment

Use Railway repo source `Noetfield-Systems/MIRRA`, branch `main`. Set `DATABASE_URL` to a dedicated PostgreSQL database or a PostgreSQL reference, ideally with a dedicated user. The server creates only `mirra_*` tables. Set `NODE_ENV=production` to ensure Secure cookies. SSL is provided by the host proxy.

Variables:
- `DATABASE_URL` required for cloud accounts, reports, journals, invitations, and entitlements.
- `OPENAI_API_KEY` or `DEEPSEEK_API_KEY` optional for live AI responses; model name override `MIRRA_AI_MODEL`.
- `MIRRA_DEEP_DIVE_LINK`, `MIRRA_PLUS_LINK`, `MIRRA_TOGETHER_LINK` optional checkout URLs.
- `STRIPE_WEBHOOK_SECRET` required to securely process payment events. Endpoint `/api/stripe/webhook`.
- `PUBLIC_ORIGIN` optional base URL for invitation links.

## Safety and science

Public-domain IPIP: https://ipip.ori.org/new_ipip-50-item-scale.htm
Goldberg LR (1992), *Psychological Assessment*, 4(1), 26–42. The 0–100 indices are transformed scale scores, not population percentiles. The creative journeys are reflective and not psychometrically validated. Nothing in the app is a clinical diagnosis or therapy service.

Privacy: browser-based guest experience, account-scoped database access, HTTPS-only secure session cookies in production, CSRF origin checks, export and deletion. Anyone with an invitation link can view a completed two-person comparison; never share the link publicly unless you want that audience.
