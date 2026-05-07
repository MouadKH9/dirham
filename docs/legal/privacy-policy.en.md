# Privacy Policy

**Effective date:** 6 May 2026
**Last updated:** 6 May 2026

## 1. Who we are

This privacy policy applies to **Dirham**, a personal finance tracking app
("the app", "we", "us"). Dirham is published by [Legal entity name to be
filled in], registered in Morocco, with contact email `privacy@dirham.app`.

Dirham is a manual expense-tracking utility. It does **not** move money,
trade securities, lend money, or connect to your bank accounts.

## 2. What data we collect

We collect only the data needed to operate the app.

| Category | Examples | Why we need it |
|---|---|---|
| Account | Email address, hashed password, preferred language, preferred currency | To authenticate you and personalise the app |
| Financial info | Transactions, categories, accounts, budgets, recurring bills (all entered manually by you) | Core functionality |
| Diagnostics | Crash logs, performance metrics | Stability and debugging |
| Usage data | Anonymous product-interaction events (e.g. "transaction_created") | Improving the app |
| Device | Device model, OS version, app version, language, timezone | Compatibility and localisation |

We do **not** collect: contacts, location, photos, microphone, biometrics,
advertising identifier, browsing history, or data from other apps.

## 3. How we use your data

We use your data only to:

- Provide the core features (transaction tracking, budgets, reminders);
- Generate weekly AI insights (see §4 below);
- Diagnose crashes and improve reliability;
- Communicate critical security or service notices.

We do **not** sell your data, share it with advertisers, or use it for
behavioural advertising.

## 4. AI-generated insights (third-party AI disclosure)

If you opt in to AI insights, we send a **weekly aggregated summary** of your
transactions to **Google's Gemini API**. The summary contains:

- Category-level totals (e.g. "Groceries: 1,240 DH this month");
- Date ranges;
- Currency.

The summary does **not** include: merchant names, transaction notes, your
email, your name, or any free-text you have entered.

Google processes the data to generate insight text, then returns it to our
backend. Per Google's
[Generative AI Additional Terms](https://policies.google.com/terms/generative-ai),
data sent via the paid Gemini API is **not used to train** Google's models.

You can disable AI insights at any time in **Settings → AI insights**, which
stops further data from being sent to Google.

## 5. Third parties we share data with

| Third party | Purpose | Data shared | Privacy policy |
|---|---|---|---|
| Railway (hosting) | App backend hosting in Europe | All app data, encrypted at rest and in transit | https://railway.app/legal/privacy |
| PostHog | Product analytics & error tracking | Anonymous events, crash logs, device metadata | https://posthog.com/privacy |
| Google (Gemini) | Weekly AI insight generation (opt-in only) | Category-level transaction aggregates | https://policies.google.com/privacy |
| Apple | App distribution, push notifications (when enabled) | Device token, App Store metadata | https://www.apple.com/legal/privacy/ |

We require each third party to provide protection at least as strong as this
policy.

## 6. Data retention

- **Active accounts:** retained while your account is active.
- **Deleted accounts:** all your personal data is **permanently deleted within
  30 days** of you deleting your account in-app.
- **Aggregated, non-identifying analytics:** retained up to 24 months.
- **Backups:** rotating encrypted backups are kept up to 30 days.

## 7. Your rights

You have the right to:

- **Access** your data — visible in the app;
- **Correct** your data — edit any record from inside the app;
- **Export** your data — coming soon; in the meantime, contact us;
- **Delete** your account and all associated data — **Settings → Delete
  account** inside the app, or by emailing `privacy@dirham.app`;
- **Withdraw consent** for AI insights — **Settings → AI insights**;
- **Lodge a complaint** with the Moroccan data protection authority
  (CNDP, https://www.cndp.ma) under Law 09-08.

We respond to verified requests within 30 days.

## 8. Security

- All traffic uses HTTPS (TLS 1.2+).
- Passwords are hashed with PBKDF2-SHA256.
- Authentication uses short-lived JWT access tokens (15 min) and rotating
  refresh tokens stored in iOS Keychain via `expo-secure-store`.
- Database is encrypted at rest by Railway.
- The Django admin is restricted to internal staff with mandatory MFA.

## 9. Children

Dirham is not directed at children under 13 and we do not knowingly collect
data from them. If you believe a child has created an account, contact us
and we will delete it.

## 10. International transfers

Your data may be processed by Google in the United States and by PostHog
in the United States or European Union. Transfers rely on Standard
Contractual Clauses (or equivalent safeguards) where required.

## 11. Changes to this policy

We will notify users of material changes through the app and update the
"Last updated" date above. Continued use of the app after a change
constitutes acceptance of the updated policy.

## 12. Contact

Questions, requests, or complaints:

- Email: `privacy@dirham.app`
- Postal: [Address to be filled in], Morocco
