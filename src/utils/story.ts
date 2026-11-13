import { CURRICULUM_LESSONS } from '../data/curriculum';
import { CHARACTERS, Character } from '../data/story/characters';
import {
  LESSON_STORIES,
  STORY_CHAPTERS,
  LessonStory,
  StoryAnimal,
  StoryChapter,
} from '../data/story/chapters';
import type { CompanionLogEntry, Mood, UserAppState } from '../types';
import type { ElasticDailyTaskItem } from './storageAndPlanner';

const STORY_BY_LESSON = new Map(LESSON_STORIES.map((s) => [s.lessonId, s] as const));
const LESSON_BY_ID = new Map(CURRICULUM_LESSONS.map((l) => [l.id, l] as const));

export function getLessonStory(lessonId: string): LessonStory | undefined {
  return STORY_BY_LESSON.get(lessonId);
}

export interface ChapterProgress {
  chapter: StoryChapter;
  completed: number;
  total: number;
  lit: boolean;
}

export function getChapterProgress(completedLessonIds: string[]): ChapterProgress[] {
  const done = new Set(completedLessonIds);
  return STORY_CHAPTERS.map((chapter) => {
    const completed = chapter.lessonIds.filter((id) => done.has(id)).length;
    return { chapter, completed, total: chapter.lessonIds.length, lit: completed === chapter.lessonIds.length };
  });
}

export function getCurrentChapter(completedLessonIds: string[]): StoryChapter {
  const firstOpen = getChapterProgress(completedLessonIds).find((p) => !p.lit);
  return firstOpen ? firstOpen.chapter : STORY_CHAPTERS[STORY_CHAPTERS.length - 1];
}

export function getAdoptedAnimals(completedLessonIds: string[]): LessonStory[] {
  const done = new Set(completedLessonIds);
  return LESSON_STORIES.filter((s) => done.has(s.lessonId));
}

export function getGreeting(date: Date): string {
  const h = date.getHours();
  if (h < 5) return '夜深了';
  if (h < 11) return '早上好';
  if (h < 14) return '中午好';
  if (h < 18) return '下午好';
  return '晚上好';
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export interface StoryTicket {
  id: string;
  type: ElasticDailyTaskItem['type'];
  targetId: string;
  requester: Character;
  titleZh: string;
  titleEn: string;
  body: string;
  footer: string;
  minutes: number;
  completed: boolean;
  animal?: StoryAnimal;
}

function shortDomain(domain: string): string {
  return domain.replace(/\s*\(.*\)\s*$/, '');
}

export function ticketsFromPlan(
  tasks: ElasticDailyTaskItem[],
  state: Pick<UserAppState, 'questionAttempts'>
): StoryTicket[] {
  const wrongCount = Object.values(state.questionAttempts).filter(
    (a) => !a.isCorrect && !a.masteredFromWrongBook
  ).length;

  return tasks.map((task): StoryTicket => {
    const base = {
      id: task.id,
      type: task.type,
      targetId: task.targetId,
      minutes: task.minutes,
      completed: task.completed,
    };

    if (task.type === 'lesson') {
      const story = getLessonStory(task.targetId);
      const lesson = LESSON_BY_ID.get(task.targetId);
      const footer = `${task.targetId} · ${lesson ? shortDomain(lesson.domain) : task.subtitle} · ${task.minutes}m`;
      if (!story) {
        return { ...base, requester: CHARACTERS.alan, titleZh: task.title, titleEn: task.targetId, body: task.subtitle, footer };
      }
      return {
        ...base,
        requester: CHARACTERS[story.requesterId],
        titleZh: story.ticketTitleZh,
        titleEn: story.ticketTitleEn,
        body: story.intro.join(''),
        footer,
        animal: story.animal,
      };
    }

    if (task.type === 'challenge') {
      const lessonTaskInPlan = tasks.find(
        (t) => t.type === 'lesson' && LESSON_BY_ID.get(t.targetId)?.linkedChallengeId === task.targetId
      );
      const lessonId =
        lessonTaskInPlan?.targetId ??
        CURRICULUM_LESSONS.find((l) => l.linkedChallengeId === task.targetId)?.id;
      const story = lessonId ? getLessonStory(lessonId) : undefined;
      return {
        ...base,
        requester: story ? CHARACTERS[story.requesterId] : CHARACTERS.alan,
        titleZh: '上次那个需求，能写出来跑一遍吗？',
        titleEn: `Ship it: ${task.targetId}`,
        body: story
          ? `${story.animal.name}还在等。去实验室把代码写完，让检查点全部通过。`
          : '去实验室把代码写完，让检查点全部通过。',
        footer: `${task.targetId} · ${task.badge} · ${task.minutes}m`,
        animal: story?.animal,
      };
    }

    if (task.type === 'questions') {
      const hasWrong = wrongCount > 0;
      return {
        ...base,
        requester: CHARACTERS.qiqi,
        titleZh: hasWrong ? '上次审查有几处没对上，再看看？' : '站里要做年度系统审查，想先请你过几道题',
        titleEn: hasWrong ? 'Revisit the audit findings' : 'Pass the annual system audit',
        body: hasWrong
          ? `还有 ${wrongCount} 道题没对上，不急，一道一道来。`
          : '都是考试里会遇到的真实场景，答完有逐项解析。',
        footer: `${task.targetId} · PD1/PD2 · ${task.minutes}m`,
      };
    }

    return {
      ...base,
      requester: CHARACTERS.alan,
      titleZh: '去喂喂猫吧，顺手翻几张卡',
      titleEn: 'Feed the cats, flip a few cards',
      body: '不用想太多，十分钟就好。',
      footer: `闪卡 · ${task.minutes}m`,
    };
  });
}

function withCompanionEntry(
  state: UserAppState,
  dateKey: string,
  update: (entry: CompanionLogEntry) => CompanionLogEntry
): UserAppState {
  const current = state.companionLog[dateKey] ?? { minutes: 0, completedLessonIds: [] };
  return { ...state, companionLog: { ...state.companionLog, [dateKey]: update(current) } };
}

export function addCompanionMinutes(state: UserAppState, dateKey: string, minutes: number): UserAppState {
  return withCompanionEntry(state, dateKey, (e) => ({ ...e, minutes: e.minutes + minutes }));
}

export function recordCompanionLesson(state: UserAppState, dateKey: string, lessonId: string): UserAppState {
  return withCompanionEntry(state, dateKey, (e) =>
    e.completedLessonIds.includes(lessonId) ? e : { ...e, completedLessonIds: [...e.completedLessonIds, lessonId] }
  );
}

export function setCompanionMood(state: UserAppState, dateKey: string, mood: Mood): UserAppState {
  return withCompanionEntry(state, dateKey, (e) => ({ ...e, mood }));
}
