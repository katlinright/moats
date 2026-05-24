import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES_SQL, ONBOARDING_KEYS } from './schema';
import type { ArcType, ActivityEventType } from './schema';

let _db: SQLite.SQLiteDatabase | null = null;

export async function openDatabase(hexKey: string): Promise<void> {
  _db = await SQLite.openDatabaseAsync('moatly.db');
  await _db.execAsync(`PRAGMA key = '${hexKey}';`);
  await _db.execAsync(CREATE_TABLES_SQL);
}

export function isDatabaseOpen(): boolean {
  return _db !== null;
}

function db(): SQLite.SQLiteDatabase {
  if (!_db) throw new Error('Database not initialised — call openDatabase first');
  return _db;
}

// --- Onboarding state ---

export async function getOnboardingValue(
  key: keyof typeof ONBOARDING_KEYS,
): Promise<string | null> {
  const row = await db().getFirstAsync<{ value: string }>(
    'SELECT value FROM onboarding_state WHERE key = ?',
    [ONBOARDING_KEYS[key]],
  );
  return row?.value ?? null;
}

export async function setOnboardingValue(
  key: keyof typeof ONBOARDING_KEYS,
  value: string,
): Promise<void> {
  await db().runAsync(
    'INSERT OR REPLACE INTO onboarding_state (key, value) VALUES (?, ?)',
    [ONBOARDING_KEYS[key], value],
  );
}

// --- Compass ---

export async function insertCompassEntry(
  cycleNumber: number,
  whatToFix: string,
  whyForWhom: string,
): Promise<{ id: number; createdAt: number; lockedUntil: number }> {
  const now = Math.floor(Date.now() / 1000);
  const lockedUntil = now + 86_400;
  const result = await db().runAsync(
    'INSERT INTO user_compass (cycle_number, what_to_fix, why_for_whom, created_at, locked_until) VALUES (?, ?, ?, ?, ?)',
    [cycleNumber, whatToFix, whyForWhom, now, lockedUntil],
  );
  return { id: result.lastInsertRowId, createdAt: now, lockedUntil };
}

export async function getCurrentCompassEntry(cycleNumber: number): Promise<{
  id: number;
  cycle_number: number;
  what_to_fix: string;
  why_for_whom: string;
  created_at: number;
  locked_until: number;
} | null> {
  return db().getFirstAsync(
    'SELECT * FROM user_compass WHERE cycle_number = ? ORDER BY created_at DESC LIMIT 1',
    [cycleNumber],
  );
}

// --- Rings ---

export async function insertRing(cycleNumber: number, arcType: ArcType): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  await db().runAsync(
    'INSERT INTO rings (cycle_number, arc_type, earned_at) VALUES (?, ?, ?)',
    [cycleNumber, arcType, now],
  );
}

export async function getRingsForCycle(cycleNumber: number): Promise<
  Array<{ id: number; cycle_number: number; arc_type: ArcType; earned_at: number }>
> {
  return db().getAllAsync(
    'SELECT * FROM rings WHERE cycle_number = ? ORDER BY earned_at ASC',
    [cycleNumber],
  );
}

// --- Activity log (ring computation) ---

export async function logActivity(
  cycleNumber: number,
  eventType: ActivityEventType,
  eventRef?: string,
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  await db().runAsync(
    'INSERT INTO activity_log (cycle_number, event_type, event_ref, occurred_at) VALUES (?, ?, ?, ?)',
    [cycleNumber, eventType, eventRef ?? null, now],
  );
}

export async function getActivityCount(
  cycleNumber: number,
  eventType: ActivityEventType,
): Promise<number> {
  const row = await db().getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM activity_log WHERE cycle_number = ? AND event_type = ?',
    [cycleNumber, eventType],
  );
  return row?.count ?? 0;
}
