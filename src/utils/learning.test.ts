import { describe, it, expect } from 'vitest';
import { FLASHCARDS_DATA } from '../data/flashcards';
import { EXAM_QUESTIONS } from '../data/questions';
import { INITIAL_APP_STATE } from './storageAndPlanner';
import { rateCard, getReviewQueue, nextIntervalMs, NEW_CARDS_PER_DAY, getNextDueAt } from './srs';
import {
  shuffle,
  allocateByWeight,
  buildMockExam,
  mockExamMinutes,
  scoreByDomain,
  domainWeight,
  EXAM_DOMAINS,
} from './examBuilder';
import { shouldRemindBackup, snoozeUntil } from './backup';
import { recordCompanionActivity } from './story';
import type { FlashcardReviewState } from '../types';

const DAY = 86_400_000;
const NOW = new Date(2026, 10, 14, 10, 0, 0).getTime();

/** Deterministic PRNG (mulberry32) for reproducible shuffles. */
function seeded(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('spaced repetition', () => {
  it('grows good/easy intervals with streak and resets on again/hard', () => {
    expect(nextIntervalMs('good', 0)).toBe(3 * DAY);
    expect(nextIntervalMs('good', 2)).toBe(12 * DAY);
    expect(nextIntervalMs('easy', 0)).toBe(7 * DAY);
    expect(nextIntervalMs('easy', 10)).toBe(60 * DAY);
    expect(nextIntervalMs('hard', 5)).toBe(DAY);

    let s = rateCard(undefined, 'FC01', 'good', NOW);
    expect(s.nextReviewAt).toBe(NOW + 3 * DAY);
    expect(s.streak).toBe(1);
    s = rateCard(s, 'FC01', 'good', NOW + 3 * DAY);
    expect(s.nextReviewAt).toBe(NOW + 3 * DAY + 6 * DAY);
    s = rateCard(s, 'FC01', 'again', NOW + 9 * DAY);
    expect(s.streak).toBe(0);
    expect(s.reviewCount).toBe(3);
    expect(s.firstReviewedAt).toBe(NOW);
  });

  it('queues overdue cards first and caps new cards per day', () => {
    const states: Record<string, FlashcardReviewState> = {
      FC02: { cardId: 'FC02', confidence: 'good', nextReviewAt: NOW - 2 * DAY, reviewCount: 1, firstReviewedAt: NOW - 5 * DAY },
      FC03: { cardId: 'FC03', confidence: 'hard', nextReviewAt: NOW - DAY, reviewCount: 1, firstReviewedAt: NOW - 5 * DAY },
      FC04: { cardId: 'FC04', confidence: 'easy', nextReviewAt: NOW + 5 * DAY, reviewCount: 1, firstReviewedAt: NOW - 2 * DAY },
    };
    const q = getReviewQueue(FLASHCARDS_DATA, states, NOW);
    expect(q.due).toEqual(['FC02', 'FC03']);
    expect(q.fresh).toHaveLength(NEW_CARDS_PER_DAY);
    expect(q.fresh).not.toContain('FC04');
    expect(q.all.slice(0, 2)).toEqual(['FC02', 'FC03']);
    expect(getNextDueAt(states, NOW)).toBe(NOW + 5 * DAY);
  });

  it('counts cards introduced today against the new-card limit', () => {
    const states: Record<string, FlashcardReviewState> = {};
    for (const id of ['FC01', 'FC02', 'FC03']) states[id] = rateCard(undefined, id, 'good', NOW - 60_000);
    expect(getReviewQueue(FLASHCARDS_DATA, states, NOW).fresh).toHaveLength(NEW_CARDS_PER_DAY - 3);
  });
});

describe('mock exam builder', () => {
  it('shuffle keeps every element and is deterministic with a seed', () => {
    const items = Array.from({ length: 20 }, (_, i) => i);
    const a = shuffle(items, seeded(1));
    expect([...a].sort((x, y) => x - y)).toEqual(items);
    expect(shuffle(items, seeded(1))).toEqual(a);
    expect(a).not.toEqual(items);
  });

  it('shuffle is roughly uniform', () => {
    const rng = seeded(42);
    const firstCounts = [0, 0, 0, 0];
    for (let i = 0; i < 8000; i++) firstCounts[shuffle([0, 1, 2, 3], rng)[0]]++;
    for (const c of firstCounts) expect(Math.abs(c - 2000)).toBeLessThan(200);
  });

  it('allocates slots by official weight', () => {
    const a = allocateByWeight(60);
    expect(Object.values(a).reduce((x, y) => x + y, 0)).toBe(60);
    expect(a['Process Automation & Logic (28%)']).toBe(17);
    expect(a['Developer Fundamentals (27%)']).toBe(16);
    expect(a['User Interface (25%)']).toBe(15);
    expect(a['Testing, Debugging & Deployment (20%)']).toBe(12);
    expect(Object.values(allocateByWeight(15)).reduce((x, y) => x + y, 0)).toBe(15);
    expect(domainWeight(EXAM_DOMAINS[0])).toBe(0.27);
  });

  it('builds a PD1-only exam of the requested size with unique questions', () => {
    const exam = buildMockExam(EXAM_QUESTIONS, { cert: 'PD1', count: 60, rng: seeded(7) });
    expect(exam).toHaveLength(60);
    expect(new Set(exam.map((q) => q.id)).size).toBe(60);
    expect(exam.every((q) => q.certLevel === 'PD1')).toBe(true);
    const process = exam.filter((q) => q.examDomain === 'Process Automation & Logic (28%)').length;
    expect(process).toBeGreaterThanOrEqual(17);
  });

  it('returns the whole pool when it is smaller than requested', () => {
    const pd2 = EXAM_QUESTIONS.filter((q) => q.certLevel === 'PD2');
    const exam = buildMockExam(EXAM_QUESTIONS, { cert: 'PD2', count: 60, rng: seeded(3) });
    expect(exam).toHaveLength(pd2.length);
    expect(exam.every((q) => q.certLevel === 'PD2')).toBe(true);
  });

  it('uses official pacing and scores by domain', () => {
    expect(mockExamMinutes('PD1', 60)).toBe(105);
    expect(mockExamMinutes('PD1', 15)).toBe(26);
    expect(mockExamMinutes('PD2', 60)).toBe(120);
    const sample = EXAM_QUESTIONS.slice(0, 10);
    const scores = scoreByDomain(sample, (q) => q.id === sample[0].id);
    expect(scores.reduce((s, d) => s + d.total, 0)).toBe(10);
    expect(scores.reduce((s, d) => s + d.correct, 0)).toBe(1);
  });
});

describe('backup reminder', () => {
  const withProgress = { ...INITIAL_APP_STATE, completedLessonIds: ['L01', 'L02'] };

  it('stays quiet without real progress', () => {
    expect(shouldRemindBackup(INITIAL_APP_STATE, NOW)).toBe(false);
  });

  it('reminds when never backed up or 7+ days old, respecting snooze and file sync', () => {
    expect(shouldRemindBackup(withProgress, NOW)).toBe(true);
    expect(shouldRemindBackup({ ...withProgress, lastBackupAt: NOW - 3 * DAY }, NOW)).toBe(false);
    expect(shouldRemindBackup({ ...withProgress, lastBackupAt: NOW - 8 * DAY }, NOW)).toBe(true);
    expect(shouldRemindBackup({ ...withProgress, backupReminderSnoozedUntil: snoozeUntil(NOW) }, NOW + DAY)).toBe(false);
    expect(shouldRemindBackup(withProgress, NOW, NOW - DAY)).toBe(false);
  });
});

describe('companion activity', () => {
  it('marks a day as visited for any practice action', () => {
    let s = recordCompanionActivity(INITIAL_APP_STATE, '2026-11-14');
    s = recordCompanionActivity(s, '2026-11-14', 3);
    expect(s.companionLog['2026-11-14']).toEqual({ minutes: 0, completedLessonIds: [], actions: 4 });
  });
});
