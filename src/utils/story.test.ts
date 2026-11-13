import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { CURRICULUM_LESSONS } from '../data/curriculum';
import { LESSON_STORIES, STORY_CHAPTERS } from '../data/story/chapters';
import { CHARACTERS } from '../data/story/characters';
import { MOOD_OPTIONS } from '../data/story/moods';
import {
  getChapterProgress,
  getCurrentChapter,
  getAdoptedAnimals,
  ticketsFromPlan,
  addCompanionMinutes,
  recordCompanionLesson,
  setCompanionMood,
  getGreeting,
  toDateKey,
} from './story';
import { INITIAL_APP_STATE, buildElasticDailyPlan } from './storageAndPlanner';
import type { ElasticDailyTaskItem } from './storageAndPlanner';

const allLessonIds = CURRICULUM_LESSONS.map((l) => l.id).sort();

describe('story data integrity', () => {
  it('every curriculum lesson has exactly one story', () => {
    expect(LESSON_STORIES.map((s) => s.lessonId).sort()).toEqual(allLessonIds);
  });

  it('animal ids are unique', () => {
    const ids = LESSON_STORIES.map((s) => s.animal.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('chapters cover every lesson exactly once', () => {
    expect(STORY_CHAPTERS.flatMap((c) => c.lessonIds).sort()).toEqual(allLessonIds);
  });

  it('each story points at the chapter that lists it', () => {
    for (const s of LESSON_STORIES) {
      const chapter = STORY_CHAPTERS.find((c) => c.id === s.chapterId);
      expect(chapter?.lessonIds).toContain(s.lessonId);
    }
  });

  it('requesters exist, intros are 2-4 lines and portraits exist on disk', () => {
    for (const s of LESSON_STORIES) {
      expect(CHARACTERS[s.requesterId]).toBeDefined();
      expect(s.intro.length).toBeGreaterThanOrEqual(2);
      expect(s.intro.length).toBeLessThanOrEqual(4);
      expect(s.ticketTitleEn.length).toBeGreaterThan(0);
      const file = resolve(process.cwd(), 'public', s.animal.portrait.replace(/^\//, ''));
      expect(existsSync(file)).toBe(true);
    }
  });

  it('mood options reference real characters', () => {
    expect(MOOD_OPTIONS.map((m) => m.mood)).toEqual(['tired', 'calm', 'energized', 'drift']);
    for (const m of MOOD_OPTIONS) expect(CHARACTERS[m.speakerId]).toBeDefined();
  });
});

describe('chapter progress', () => {
  it('lights a chapter only when all of its lessons are done', () => {
    const prologue = STORY_CHAPTERS[0];
    const partial = getChapterProgress(prologue.lessonIds.slice(0, 2));
    expect(partial[0].completed).toBe(2);
    expect(partial[0].lit).toBe(false);
    expect(getChapterProgress(prologue.lessonIds)[0].lit).toBe(true);
  });

  it('current chapter is the first one not yet lit', () => {
    expect(getCurrentChapter([]).id).toBe(STORY_CHAPTERS[0].id);
    expect(getCurrentChapter(STORY_CHAPTERS[0].lessonIds).id).toBe(STORY_CHAPTERS[1].id);
    expect(getCurrentChapter(allLessonIds).id).toBe(STORY_CHAPTERS[STORY_CHAPTERS.length - 1].id);
  });

  it('adopted animals follow completed lessons in story order', () => {
    expect(getAdoptedAnimals(['L05', 'L01']).map((s) => s.animal.id)).toEqual(['doubao', 'buding']);
  });
});

describe('ticketsFromPlan', () => {
  const tasks: ElasticDailyTaskItem[] = [
    { id: 't1', type: 'lesson', title: 'x', subtitle: 'y', minutes: 30, completed: false, targetId: 'L05', badge: 'L05' },
    { id: 't2', type: 'challenge', title: 'x', subtitle: 'y', minutes: 20, completed: false, targetId: 'C05', badge: 'Apex Lab' },
    { id: 't3', type: 'questions', title: 'x', subtitle: 'y', minutes: 15, completed: false, targetId: 'Q10', badge: 'PD1/PD2' },
    { id: 't4', type: 'flashcards', title: 'x', subtitle: 'y', minutes: 10, completed: true, targetId: 'FC01', badge: '记忆闪卡' },
  ];

  it('maps every task type to a bilingual ticket with the same target', () => {
    const tickets = ticketsFromPlan(tasks, { questionAttempts: {} });
    expect(tickets.map((t) => t.targetId)).toEqual(['L05', 'C05', 'Q10', 'FC01']);
    expect(tickets.map((t) => t.type)).toEqual(['lesson', 'challenge', 'questions', 'flashcards']);
    for (const t of tickets) {
      expect(t.titleZh.length).toBeGreaterThan(0);
      expect(t.titleEn.length).toBeGreaterThan(0);
      expect(t.footer.length).toBeGreaterThan(0);
    }
    expect(tickets[0].requester.id).toBe('xiaoman');
    expect(tickets[0].animal?.id).toBe('buding');
    expect(tickets[1].requester.id).toBe('xiaoman');
    expect(tickets[2].requester.id).toBe('qiqi');
    expect(tickets[3].completed).toBe(true);
  });

  it('switches the audit ticket copy when there are wrong answers', () => {
    const tickets = ticketsFromPlan(tasks, {
      questionAttempts: {
        Q10: {
          questionId: 'Q10',
          selectedOptionIds: ['A'],
          isCorrect: false,
          timestamp: 0,
          attemptsCount: 1,
          wrongStreak: 1,
          masteredFromWrongBook: false,
        },
      },
    });
    expect(tickets[2].titleEn).toBe('Revisit the audit findings');
  });

  it('handles the real daily plan', () => {
    const plan = buildElasticDailyPlan(INITIAL_APP_STATE);
    expect(ticketsFromPlan(plan.tasks, INITIAL_APP_STATE)).toHaveLength(plan.tasks.length);
  });
});

describe('companion log', () => {
  it('accumulates minutes, lessons and mood per day', () => {
    let s = addCompanionMinutes(INITIAL_APP_STATE, '2026-11-14', 5);
    s = addCompanionMinutes(s, '2026-11-14', 10);
    s = recordCompanionLesson(s, '2026-11-14', 'L02');
    s = recordCompanionLesson(s, '2026-11-14', 'L02');
    s = setCompanionMood(s, '2026-11-14', 'calm');
    expect(s.companionLog['2026-11-14']).toEqual({ minutes: 15, completedLessonIds: ['L02'], mood: 'calm' });
    expect(INITIAL_APP_STATE.companionLog).toEqual({});
  });
});

describe('helpers', () => {
  it('greets by time of day and formats date keys', () => {
    expect(getGreeting(new Date(2026, 0, 1, 8))).toBe('早上好');
    expect(getGreeting(new Date(2026, 0, 1, 22))).toBe('晚上好');
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});
