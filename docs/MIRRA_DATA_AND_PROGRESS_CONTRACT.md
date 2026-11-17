# MIRRA Data & Progress · Operational Notes

| Data | Storage | Who can see it | Limitations |
|---|---|---|---|
| Guest quiz answers / saved reports | Browser localStorage, on that device | The device user | Clearing storage loses them; no cloud sync without an account |
| Registered reports / raw answers | PostgreSQL `mirra_reports`, scoped to authenticated user | Account owner via authenticated app/API | Stored to support their personal history; not shared with the CRM |
| Guest Together answers | PostgreSQL invitation record, private bearer-link comparison | Anyone possessing private invitation link after completion | A private link is not a public profile; do not post link publicly |
| Daily moods and reflection | Guest localStorage; optional signed-in journal copy | The person with the device / their authenticated account | Do not upload to Analytics |
| Reflection Points and lessons | Browser localStorage; optional signed-in sync in PostgreSQL `mirra_learning_progress` | The device user / authenticated account owner | Nonmonetary, server-validated point categories; guest data stays on device until signing in |
| Anonymous funnel events | PostgreSQL `mirra_funnel_events` | Aggregates through Growth dashboard | Browser-ID unique per journey/day, 30-day cleanup; not verified humans |
| Furthest question position | PostgreSQL `mirra_quiz_progress` | Aggregates through Growth dashboard | No raw answers, name, email or psychological trait; browser-journey-day unit; 30-day cleanup |
| Private result usefulness | PostgreSQL `mirra_feedback` | Aggregated rating shown only if five or more submissions | Explicit optional statement, never a clinical measure |
| First Circle opt-in | PostgreSQL with explicit email consent | Authorized product operators only; aggregate count on Growth page | Do not assume opt-in = activated user |

## How the founder checks actual activity
1. Open https://mirra-psychology-web-production.up.railway.app/growth.html and refresh. Inspect 7-day browser IDs, first answers, completed reflections and returns.
2. The **Question-level journey health** section shows mean number of questions answered and aggregate step reach per journey. This identifies which question number might be causing dropoff, **not why**.
3. The **What feels useful** section displays optional result ratings in groups of five or more. For qualitative reasons, use volunteered feedback, not guessed personality.
4. Compare cohorts only once real volunteer evidence is documented in Fieldwork; never confuse synthetic browser runs with humans.

## Security and privacy
Funnel events and progress are optional. MIRRA excludes its automated Chromium runs, do-not-track browsers and people who disable analytics. The synthetic lab uses a disposable local PostgreSQL and never sends production events. Question analytics do not carry answer text, name, email or private journal text. 
Never automatically import psychological data to Fieldwork, email providers or ad platforms. Community contacts require appropriate channel permissions. If further data collection is proposed, revise the consent text and acceptance tests before enabling it.

## Founder feedback operations

- Private founder desk: https://mirra-psychology-web-production.up.railway.app/founder.html
- Authorization: `MIRRA_ADMIN_TOKEN` is configured only in Railway's production service Variables. Never commit, embed, or put the value in a URL. The desk holds it in page memory and sends it as `Authorization: Bearer` only to same-origin `/api/admin/*` endpoints.
- Access control: admin API returns HTTP 401 without a valid token; registered user logins alone do not grant founder access.
- Dashboard displays actual private feedback text and opt-in emails to the authorized operator only; public `/growth.html` publishes no contact list or raw feedback.
- Feedback triage statuses: `new`, `reviewed`, `planned`, `addressed`. An operator can export the explicit opt-in contact list as a CSV for permitted outreach; no raw quiz answers or journals are exported to Fieldwork.
- First Circle opt-ins, accounts and invitation counts are different units. None by itself independently confirms a real human actually used the app or liked it.
