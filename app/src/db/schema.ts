/**
 * SQLCipher schema for Moatly mobile app.
 *
 * All data lives on-device, encrypted at rest via SQLCipher.
 * The database key is derived from the user's seed phrase + OS keystore.
 * Nothing in this file ever leaves the device.
 */

export const SCHEMA_VERSION = 1;

/**
 * Run once on first launch to create all tables.
 * Run on every launch to apply any pending migrations.
 */
export const CREATE_TABLES_SQL = `
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  -- Track which schema version we're on
  CREATE TABLE IF NOT EXISTS schema_version (
    version    INTEGER PRIMARY KEY,
    applied_at INTEGER NOT NULL
  );

  -- Onboarding state. Key/value for simplicity.
  -- Keys:
  --   declaration_read_at    → unix timestamp
  --   covenant_accepted_at   → unix timestamp
  --   covenant_hash          → SHA-256 hex of exact covenant text
  --   seed_verified_at       → unix timestamp (after 3-word confirmation)
  --   onboarding_complete    → "1" when all steps done
  CREATE TABLE IF NOT EXISTS onboarding_state (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  -- The user's private compass. Stored per cycle.
  -- A derived encrypted projection is shared to the Moat (Phase 2).
  -- The server sees ciphertext only.
  CREATE TABLE IF NOT EXISTS user_compass (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    cycle_number   INTEGER NOT NULL,
    what_to_fix    TEXT NOT NULL,     -- Question 1 (max 240 chars)
    why_for_whom   TEXT NOT NULL,     -- Question 2 (max 240 chars)
    created_at     INTEGER NOT NULL,  -- unix timestamp
    locked_until   INTEGER NOT NULL   -- created_at + 86400 (24 hours)
  );

  -- Rings: the user's visible practice record.
  -- Computed client-side. Never sent to the server.
  -- arc_type values: 'gold' | 'green' | 'blue' | 'grey' | 'fire_scar'
  CREATE TABLE IF NOT EXISTS rings (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    cycle_number INTEGER NOT NULL,
    arc_type     TEXT NOT NULL CHECK (arc_type IN ('gold','green','blue','grey','fire_scar')),
    earned_at    INTEGER NOT NULL
  );

  -- Local activity ledger for ring computation.
  -- event_type values: 'whisper' | 'major_statement' | 'witness' | 'presence'
  --                    'ritual_playthrough' | 'breakthrough_marked' | 'hard_season_start' | 'hard_season_end'
  CREATE TABLE IF NOT EXISTS activity_log (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    cycle_number INTEGER NOT NULL,
    event_type   TEXT NOT NULL,
    event_ref    TEXT,               -- optional: message_id or playthrough_ref
    occurred_at  INTEGER NOT NULL
  );

  -- Relay receipts: metadata only from ritual prescription sends.
  -- Body is never stored. Kept ≤30 days.
  CREATE TABLE IF NOT EXISTS relay_receipts (
    relay_id    TEXT PRIMARY KEY,
    sent_at     INTEGER NOT NULL,
    expires_at  INTEGER NOT NULL     -- sent_at + 2592000 (30 days)
  );
`;

/** Keys used in the onboarding_state table */
export const ONBOARDING_KEYS = {
  DECLARATION_READ_AT: 'declaration_read_at',
  COVENANT_ACCEPTED_AT: 'covenant_accepted_at',
  COVENANT_HASH: 'covenant_hash',
  SEED_VERIFIED_AT: 'seed_verified_at',
  ONBOARDING_COMPLETE: 'onboarding_complete',
} as const;

/** Arc types for the rings system */
export type ArcType = 'gold' | 'green' | 'blue' | 'grey' | 'fire_scar';

/** Activity event types for ring computation */
export type ActivityEventType =
  | 'whisper'
  | 'major_statement'
  | 'witness'
  | 'presence'
  | 'ritual_playthrough'
  | 'breakthrough_marked'
  | 'hard_season_start'
  | 'hard_season_end';
