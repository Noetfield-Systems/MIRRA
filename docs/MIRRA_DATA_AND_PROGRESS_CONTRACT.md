# MIRRA Data & Progress · Operational Notes

| Data | Storage | Who can see it | Limitations |
|---|---|---|---|
| Guest quiz answers / saved reports | Browser localStorage, on that device | The device user | Clearing storage loses them; no cloud sync without an account |
| Registered reports / raw answers | PostgreSQL `mirra_reports`, scoped to authenticated user | Account owner via authenticated app/API | Stored to support their personal history; not shared with the CRM |
| Guest Together answers | PostgreSQL invitation record, private bearer-link comparison | Anyone possessing private invitation link after completion | A private link is not a public profile; do not post link publicly |
| Daily moods and reflection | Guest localStorage; optional signed-in journal copy | The person with the device / their authenticated account | Do not upload to Analytics |
| Reflection Points and lessons | Browser localStorage `mirra2:explorationLedger` | The device user | Nonmonetary, not synchronized cross-device yet; not a scientific score |
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
