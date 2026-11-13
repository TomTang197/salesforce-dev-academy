import type { UserAppState } from '../types';

const DAY = 86_400_000;
export const BACKUP_INTERVAL_DAYS = 7;

export function hasMeaningfulProgress(state: UserAppState): boolean {
  return (
    state.completedLessonIds.length > 1 ||
    Object.keys(state.questionAttempts).length > 0 ||
    Object.keys(state.challengeSubmissions).length > 0 ||
    Object.keys(state.flashcardStates).length > 0 ||
    Object.keys(state.reflections).length > 0
  );
}

/**
 * Gentle, non-blocking reminder rule: only when there is something worth saving,
 * the last backup (manual download or file sync) is 7+ days old, and the user
 * hasn't snoozed it.
 */
export function shouldRemindBackup(state: UserAppState, now: number, lastFileSyncAt: number | null = null): boolean {
  if (!hasMeaningfulProgress(state)) return false;
  if (state.backupReminderSnoozedUntil !== null && now < state.backupReminderSnoozedUntil) return false;
  const last = Math.max(state.lastBackupAt ?? 0, lastFileSyncAt ?? 0);
  if (last === 0) return true;
  return now - last >= BACKUP_INTERVAL_DAYS * DAY;
}

export function daysSince(ts: number | null, now: number): number | null {
  if (!ts) return null;
  return Math.floor((now - ts) / DAY);
}

export function snoozeUntil(now: number): number {
  return now + BACKUP_INTERVAL_DAYS * DAY;
}
