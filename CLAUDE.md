# Moatly — Claude Code Context

You are building **Moatly**: a privacy-first, end-to-end encrypted group witnessing app.
Read this file completely before writing any code. The constraints here are load-bearing —
removing them to "simplify delivery" destroys the product.

---

## What Moatly is

A small (8–12 person) anonymous group — called a **Moat** — where users practise honest
self-examination in seven-day cycles. Posts are encrypted on the user's device before they
leave. The server stores only ciphertext blobs. Everything is cryptographically deleted after
seven days. There are no profiles, no analytics, no ranking, no reactions.

Authentication uses a **physical hardware device** (nRF52840 BLE chip) — not a password.
The device glows when someone in the user's Moat posts a Major Statement.

A sibling app — the **Unity ritual app** — is already built by a separate team. We connect
to it only via a narrow email relay. We do not build it; we consume its existing contract.

---

## The Seven Non-Negotiable Principles

These override any default engineering decision. Raise a flag rather than violate them.

1. **E2E encryption is the floor.** Messages are encrypted on the sender's device. The server
   holds ciphertext only. No server-side key. No admin plaintext access. No plaintext logging.
   Use **vodozemac** (Rust, Apache 2.0) — the Olm/Megolm implementation from Matrix/Element.
   Never roll our own crypto.

2. **Seven-day deletion is cryptographic, not administrative.** Content is deleted three ways:
   (a) row deletion + VACUUM, (b) Megolm session rotation at each cycle boundary, (c) backup
   encryption keys expire at 8 days. All three run independently.

3. **No profiles, no identifiers, no analytics.** No display name, avatar, bio, follower count,
   like, share, explore, recommendation, or third-party analytics SDK. Operational metrics from
   infrastructure only — never from user behaviour.

4. **No ranking, no curation, no algorithmic ordering.** Posts appear in strict chronological
   order. No "for you" logic. No pinning, boosting, or threading beyond witness replies.

5. **The device is the key.** Auth requires physical device + combination sequence + composite
   identity code. No email-reset flow into a Moat. Loss of device + combination + seed phrase =
   permanent loss of access. This is a feature.

6. **Open source, always.** Apache 2.0 + Commons Clause. Every commit goes to the public repo.

7. **Rings are private.** A user sees only their own rings. No leaderboard, comparison, or
   social surface on rings. The schema must not support ranking queries.

---

## Current Build Phase

**Phase 1 — MVP, app-only** (no Moats, no device, no multi-user)

Goal: build the mobile app shell so 10 internal dogfooders can complete 2 full 7-day cycles.

What Phase 1 includes:
- Onboarding flow: Threshold → Declaration → Covenant → Seed phrase → Two Questions → Lamp intro
- Local SQLCipher database (seed-phrase-derived key)
- 24-word BIP-39 seed phrase, generated on-device, never transmitted
- The Two Questions (private compass, 24-hour edit lock)
- The Lamp — persistent safety surface, offline crisis resources, never logged
- Rings system — computed locally, no server
- Backend shell — account creation, email endpoints (no Moat messaging yet)
- Email relay — Postmark integration for Unity ritual app prescriptions

What Phase 1 does NOT include:
- Moat group messaging (Phase 2)
- vodozemac / Megolm (Phase 2)
- Hardware device / BLE (Phase 3)
- 7-day deletion pipeline (Phase 2)
- Complaint flow (Phase 2)

---

## Folder Structure

```
moatly/
├── CLAUDE.md                  ← you are here
├── README.md
├── .gitignore
├── app/                       ← React Native (Expo) mobile app
│   ├── src/
│   │   ├── screens/           ← one file per screen
│   │   │   ├── onboarding/    ← Threshold, Declaration, Covenant, SeedPhrase, TwoQuestions, LampIntro
│   │   │   ├── moat/          ← Moat feed, Major Statement, Witness (Phase 2+)
│   │   │   └── rings/         ← Rings display
│   │   ├── components/        ← shared UI components
│   │   │   └── Lamp.tsx       ← always-visible safety icon
│   │   ├── db/                ← SQLCipher schema and queries
│   │   │   ├── schema.ts
│   │   │   └── queries.ts
│   │   ├── crypto/            ← key derivation, seed phrase, future vodozemac FFI
│   │   │   ├── seed.ts        ← BIP-39 generation and verification
│   │   │   └── keys.ts        ← DB key derivation from seed
│   │   ├── state/             ← Zustand stores
│   │   │   ├── onboardingStore.ts
│   │   │   └── compassStore.ts
│   │   ├── navigation/        ← React Navigation setup
│   │   └── assets/
│   │       └── lamp/          ← crisis resources JSON per country
│   ├── app.json
│   ├── package.json
│   └── tsconfig.json
│
├── backend/
│   ├── moat/                  ← Go: Moat service (messaging, deletion) — Phase 2+
│   │   ├── cmd/server/main.go
│   │   ├── internal/
│   │   └── go.mod
│   ├── linkage/               ← Go: Account service + email relay
│   │   ├── cmd/server/main.go
│   │   ├── internal/
│   │   │   ├── accounts/
│   │   │   ├── relay/         ← Postmark email relay for Unity prescriptions
│   │   │   └── auth/
│   │   └── go.mod
│   └── shared/                ← shared Go types
│
├── firmware/                  ← nRF52840 Zephyr RTOS (Phase 3)
│   ├── src/
│   ├── boards/
│   └── CMakeLists.txt
│
└── infra/                     ← Terraform infrastructure as code
    ├── environments/
    │   ├── staging/
    │   └── prod/
    └── modules/
        ├── postgres/
        ├── kms/
        └── networking/
```

---

## Tech Stack

### Mobile (app/)
| Concern | Choice | Why |
|---|---|---|
| Framework | React Native (Expo prebuild) | One codebase, native BLE + crypto |
| Language | TypeScript | Strong typing |
| Local DB | SQLCipher via `react-native-sqlcipher` | Encrypted at rest, well-audited |
| DB key | Derived from seed phrase + OS keystore | Never hardcoded |
| Crypto | vodozemac (Rust) via FFI — Phase 2+ | Audited Olm/Megolm, Apache 2.0 |
| State | Zustand | Minimal, testable |
| Navigation | React Navigation v6 | Standard |
| Animation | Reanimated 3 | Smooth gesture animations |
| BLE | react-native-ble-plx — Phase 3 | Device comms |

### Backend (backend/)
| Concern | Choice |
|---|---|
| Moat service | Go |
| Linkage/email service | Go |
| Database | PostgreSQL 16 |
| Deletion pipeline | Temporal (or cron + Postgres locks) |
| Auth | Device-issued JWT, 15-min expiry |
| API | REST + WebSocket (Moat), REST (linkage) |
| Email | Postmark — transactional stream only |
| Secrets | AWS KMS + SOPS |

### Deployment
- AWS EU region (Frankfurt or Dublin) — GDPR is load-bearing
- No US primary region
- Terraform for all infra

---

## Database (client-side, Phase 1)

```sql
-- Stored only on-device in SQLCipher.
CREATE TABLE user_compass (
  id             INTEGER PRIMARY KEY,
  cycle_number   INTEGER NOT NULL,
  what_to_fix    TEXT NOT NULL,       -- Question 1: what do you want to fix?
  why_for_whom   TEXT NOT NULL,       -- Question 2: why, and for whom?
  created_at     INTEGER NOT NULL,    -- unix timestamp
  locked_until   INTEGER NOT NULL     -- 24-hour reflection lock
);

CREATE TABLE onboarding_state (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
-- Keys: declaration_read_at, covenant_accepted_at, covenant_hash,
--       seed_verified_at, onboarding_complete

CREATE TABLE rings (
  id           INTEGER PRIMARY KEY,
  cycle_number INTEGER NOT NULL,
  arc_type     TEXT NOT NULL CHECK (arc_type IN ('gold','green','blue','grey','fire_scar')),
  earned_at    INTEGER NOT NULL
);
```

---

## API Surface (Phase 1 subset)

```
POST /v1/accounts             Create account. Body: { covenant_hash, device_attestation }
DELETE /v1/accounts/me        Delete account + full purge
PUT /v1/accounts/me/email     Set email for ritual prescriptions
DELETE /v1/accounts/me/email  Remove email

POST /v1/linkage/bootstrap    Issue opaque account ID for Unity app handoff
POST /v1/linkage/relay_prescription  Unity app submits prescription → we relay via Postmark
GET /v1/linkage/receipts      Last N relay receipts (metadata only)
```

---

## The Lamp — Safety Surface Rules

- A lamp icon is ALWAYS visible in the Moat UI corner. It does not pulse or badge.
- Tapping opens a full-screen list of crisis resources (suicide lifelines, abuse helplines,
  emergency services) for the user's locale.
- Resources are bundled in the app — they work OFFLINE. No network fetch.
- NO interaction with the Lamp is logged, counted, or transmitted. Ever.
- The Lamp cannot be removed, hidden, or made optional.
- Resources are curated quarterly. Source file: `app/src/assets/lamp/resources.json`

---

## Onboarding Screen Sequence

1. **Threshold** — one word: "Moatly". Tap to continue. No carousel.
2. **Declaration** — scrollable Declaration of Inner Rights (7 rights). Scroll-to-continue required.
3. **Covenant** — three clauses, each accepted with a 1.5s tap-and-hold:
   - "Speak from the I."
   - "Witness without agenda."
   - "Keep what is said here inside."
   Store: `covenant_hash` = SHA-256 of exact covenant text at time of acceptance.
4. **Device pairing** — Phase 3. In Phase 1: generate Virtual Device (software).
5. **Seed phrase** — 24 BIP-39 words, generated on-device. User writes in physical journal.
   App confirms with 3 random word prompts. Seed never leaves device in plaintext.
6. **Two Questions** — private compass. 240 char limit. 24-hour lock after submission.
7. **Lamp intro** — explicit introduction to the safety surface before Moat placement.
8. **Moat placement** — Phase 2. In Phase 1: show "Your Moat is forming..." holding screen.

---

## Message Types (Phase 2+, for reference)

| Type | Purpose | Char limit |
|---|---|---|
| whisper | Default short honest statement | 1000 |
| major_statement | Structured self-exam; triggers glow | 6 fields + 2000 freeform |
| witness | Reply to any post, "from the I" | 600 |
| presence | Wordless "I am here" ping | — |

No reactions. No quote-reply. No read receipts. No typing indicators. No search.

---

## Coding Rules

1. **Never log message content** — not in debug, not in errors. Log IDs and sizes only.
2. **No analytics SDK** — no Firebase Analytics, no Mixpanel, no Sentry body payloads.
3. **Encryption at rest** — all local data lives in SQLCipher. No plaintext SQLite.
4. **Seed phrase never leaves the device** — not in logs, not in API calls, not in crash reports.
5. **Lint and type-check on every save** — no `any` types in TypeScript without a comment.
6. **Test the deletion pipeline first** — it is the hardest correctness requirement.
7. **Adding a third-party SDK requires a written justification** in the PR description.
8. **No `// TODO: add encryption later`** — if it touches user content, it is encrypted now.

---

## What "Done" Looks Like for Phase 1

- 10 internal users can complete onboarding end-to-end on iOS and Android
- Two Questions can be answered and are locked for 24 hours after submission
- Seed phrase is generated, verified, and stored only in the SQLCipher DB
- The Lamp is visible in the app and opens correct offline crisis resources
- Rings UI renders (no data yet — empty state is fine)
- Backend: account creation and email relay endpoints respond correctly
- Crash-free rate ≥ 99.5% on both platforms
- Zero P1 bugs open

---

## Key External References

- vodozemac repo: https://github.com/matrix-org/vodozemac (Apache 2.0)
- Megolm spec: https://gitlab.matrix.org/matrix-org/olm/-/blob/master/docs/megolm.md
- SQLCipher: https://www.zetetic.net/sqlcipher/
- BIP-39 wordlist: https://github.com/trezor/python-mnemonic/blob/master/src/mnemonic/wordlist/english.txt
- Postmark: https://postmarkapp.com/developer
- Expo docs: https://docs.expo.dev
- Zephyr RTOS: https://docs.zephyrproject.org (Phase 3)
- Nordic nRF52840: https://www.nordicsemi.com/products/nrf52840 (Phase 3)
