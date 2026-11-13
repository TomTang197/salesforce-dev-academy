import type { FlashcardItem, FlashcardReviewState } from '../types';

export type Confidence = 'again' | 'hard' | 'good' | 'easy';

const MINUTE = 60_000;
const DAY = 86_400_000;
const MAX_INTERVAL_DAYS = 60;

/** New (never-seen) cards introduced per day, so the deck never floods you. */
export const NEW_CARDS_PER_DAY = 5;

/**
 * Leitner-style intervals.
 * `streak` = number of consecutive successful (good / easy) reviews before this one.
 */
export function nextIntervalMs(confidence: Confidence, streak: number): number {
  switch (confidence) {
    case 'again':
      return 10 * MINUTE;
    case 'hard':
      return DAY;
    case 'good':
      return Math.min(3 * 2 ** streak, MAX_INTERVAL_DAYS) * DAY;
    case 'easy':
      return Math.min(7 * 2 ** streak, MAX_INTERVAL_DAYS) * DAY;
  }
}

export function rateCard(
  prev: FlashcardReviewState | undefined,
  cardId: string,
  confidence: Confidence,
  now: number
): FlashcardReviewState {
  const prevStreak = prev?.streak ?? 0;
  const success = confidence === 'good' || confidence === 'easy';
  return {
    cardId,
    confidence,
    nextReviewAt: now + nextIntervalMs(confidence, success ? prevStreak : 0),
    reviewCount: (prev?.reviewCount ?? 0) + 1,
    streak: success ? prevStreak + 1 : 0,
    firstReviewedAt: prev?.firstReviewedAt ?? prev?.lastReviewedAt ?? now,
    lastReviewedAt: now,
  };
}

function isSameLocalDay(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

export interface ReviewQueue {
  /** Previously reviewed cards whose interval has elapsed, most overdue first. */
  due: string[];
  /** Never-seen cards allowed today (respects NEW_CARDS_PER_DAY). */
  fresh: string[];
  /** due followed by fresh. */
  all: string[];
}

export function getReviewQueue(
  cards: FlashcardItem[],
  states: Record<string, FlashcardReviewState>,
  now: number,
  newLimit: number = NEW_CARDS_PER_DAY
): ReviewQueue {
  const seen = (id: string) => Boolean(states[id]) && states[id].confidence !== 'unseen';

  const due = cards
    .filter((c) => seen(c.id) && states[c.id].nextReviewAt <= now)
    .sort((a, b) => states[a.id].nextReviewAt - states[b.id].nextReviewAt)
    .map((c) => c.id);

  const introducedToday = Object.values(states).filter(
    (s) => s.confidence !== 'unseen' && s.firstReviewedAt !== undefined && isSameLocalDay(s.firstReviewedAt, now)
  ).length;

  const fresh = cards
    .filter((c) => !seen(c.id))
    .slice(0, Math.max(0, newLimit - introducedToday))
    .map((c) => c.id);

  return { due, fresh, all: [...due, ...fresh] };
}

/** Earliest future review time among reviewed cards, or null. */
export function getNextDueAt(states: Record<string, FlashcardReviewState>, now: number): number | null {
  const future = Object.values(states)
    .filter((s) => s.confidence !== 'unseen' && s.nextReviewAt > now)
    .map((s) => s.nextReviewAt);
  return future.length ? Math.min(...future) : null;
}

export function describeInterval(ms: number): string {
  if (ms < 60 * MINUTE) return `${Math.max(1, Math.round(ms / MINUTE))} 分钟后`;
  if (ms < DAY) return `${Math.round(ms / (60 * MINUTE))} 小时后`;
  return `${Math.round(ms / DAY)} 天后`;
}
