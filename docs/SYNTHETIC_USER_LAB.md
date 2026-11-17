# MIRRA Synthetic User Lab

This is a **developer QA facility**, not a public community and not real user research. Ten scripted scenario personas browse a disposable local clone of the production application using Chromium. They complete assessments, make mistakes, navigate backward, use a keyboard, return for a daily prompt, test image outages, and run both sides of a Together invitation.

## Repeatable evidence
- Per-persona action completion, browser console and same-origin HTTP errors
- Responsive 320px / 390px / 430px / 1440px screenshots, report screens and two-person comparison
- Functional assertions, mobile overflow, touch control height, answer labels, scientific disclaimers, guest persistence
- Machine-readable `artifacts/synthetic-lab/report.json` and CI artifact, always labeled `synthetic=true`
- P0 regressions fail CI; editorial hypotheses are labeled and must not be sold as human validation

## Runtime
Runs **inside the existing MIRRA quality workflow**, every 6 hours and on main pushes, against isolated GitHub Actions PostgreSQL and localhost web server. No production invitation records are created; browser analytics are disabled for synthetic contexts.

```sh
npm install
npx playwright install chromium
MIRRA_LAB_BASE_URL=http://127.0.0.1:3000 npm run test:synthetic
```

The existing Factory/Founder mission M22 remains owner of ongoing product improvement. A scheduled test does not prove that an LLM coding model or six independent live agents ran. All output is safe test data and must remain absent from real-user counts.

**Purpose:** identify actual software flaws early, propose improvements, and accelerate genuine five-person usability research. Synthetic testers cannot determine whether a real person enjoys the experience; treat aesthetic critiques as hypotheses pending qualified human feedback. Reference: Nielsen Norman Group, *Synthetic Users: If, When and How to Use AI-Generated Research*.
