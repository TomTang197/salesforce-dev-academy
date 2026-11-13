import {
  UserAppState,
  PacingMode,
  CurriculumLesson,
  CodingChallenge,
  ExamQuestion,
  FlashcardItem,
} from '../types';
import { CURRICULUM_LESSONS } from '../data/curriculum';
import { CODING_CHALLENGES } from '../data/challenges';
import { EXAM_QUESTIONS } from '../data/questions';
import { FLASHCARDS_DATA, MOCK_ORG_TABLES } from '../data/flashcards';
import { getReviewQueue } from './srs';

const STORAGE_KEY = 'forcecraft_academy_state_v1';

export function getTodayDateStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDefaultExamDateStr(): string {
  const target = new Date();
  target.setDate(target.getDate() + 21);
  const y = target.getFullYear();
  const m = String(target.getMonth() + 1).padStart(2, '0');
  const d = String(target.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const INITIAL_APP_STATE: UserAppState = {
  languageMode: 'bilingual',
  pacingMode: 'standard',
  dailyTargetMinutes: 60,
  todayAvailableMinutesOverride: null,
  targetExam: 'PD1+PD2',
  examDate: getDefaultExamDateStr(),
  streakDays: 3,
  totalMinutesStudied: 95,
  completedLessonIds: ['L01'],
  lessonNotes: {
    L01: '重点记忆：同步 SOQL 上限 100 次，异步 200 次；System.LimitException 无法被 try-catch 捕获！',
  },
  bookmarkedQuestionIds: ['Q01', 'Q13', 'Q25'],
  questionAttempts: {},
  challengeSubmissions: {},
  flashcardStates: {},
  customQuestions: [],
  dailyLogs: {},
  rebalancedDaysCount: 0,
  storyMode: true,
  companionLog: {},
  seenStoryBeats: ['L01'],
  lastCheckInDate: null,
  reflections: {},
  lastBackupAt: null,
  backupReminderSnoozedUntil: null,
};

export function loadAppState(): UserAppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_APP_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_APP_STATE,
      ...parsed,
    };
  } catch {
    return INITIAL_APP_STATE;
  }
}

export function saveAppState(state: UserAppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to persist state to localStorage:', e);
  }
}

export function getPacingConfig(mode: PacingMode): {
  label: string;
  tagline: string;
  defaultMinutes: number;
  estimatedDays: number;
} {
  switch (mode) {
    case 'relaxed':
      return {
        label: '轻松续航模式 (30m/天)',
        tagline: '适合工作日碎片时间，每天攻克 1 个核心概念 + 2 道真题，约 28 天稳健通关',
        defaultMinutes: 35,
        estimatedDays: 28,
      };
    case 'standard':
      return {
        label: '标准进阶模式 (60m/天)',
        tagline: '最受推荐节奏：每天 1 节深度课 + 1 个实战代码挑战 + 3 道考题，16 天完整通关',
        defaultMinutes: 65,
        estimatedDays: 16,
      };
    case 'intensive':
      return {
        label: '考前冲刺模式 (120m/天)',
        tagline: '高强度突击：每天 2 节核心课 + 2 个代码实验 + 6 道真题，8 天极速冲刺 PD1/PD2',
        defaultMinutes: 120,
        estimatedDays: 8,
      };
    case 'weekend': {
      const day = new Date().getDay();
      const isWeekend = day === 0 || day === 6;
      return {
        label: '周末弹性模式 (平日轻学/周末深潜)',
        tagline: isWeekend
          ? '今天是周末深潜日（100m）：集中攻克高难度架构课与动手编程挑战'
          : '今天是工作日轻量日（35m）：快速过概念与闪卡刷题保持手感',
        defaultMinutes: isWeekend ? 100 : 35,
        estimatedDays: 18,
      };
    }
  }
}

export interface ElasticDailyTaskItem {
  id: string;
  type: 'lesson' | 'challenge' | 'questions' | 'flashcards';
  title: string;
  subtitle: string;
  minutes: number;
  completed: boolean;
  targetId: string;
  badge: string;
}

export function buildElasticDailyPlan(state: UserAppState): {
  effectiveMinutesBudget: number;
  tasks: ElasticDailyTaskItem[];
  totalPlannedMinutes: number;
  completedMinutesToday: number;
  daysRemainingToComplete: number;
} {
  const config = getPacingConfig(state.pacingMode);
  const effectiveMinutesBudget =
    state.todayAvailableMinutesOverride !== null
      ? state.todayAvailableMinutesOverride
      : config.defaultMinutes;

  const allQuestions = [...EXAM_QUESTIONS, ...state.customQuestions];
  const uncompletedLessons = CURRICULUM_LESSONS.filter(
    (l) => !state.completedLessonIds.includes(l.id)
  );
  const lessonsPool =
    uncompletedLessons.length > 0 ? uncompletedLessons : CURRICULUM_LESSONS;

  const tasks: ElasticDailyTaskItem[] = [];
  let accumulatedMinutes = 0;

  // 1. Primary Lesson
  const firstLesson: CurriculumLesson = lessonsPool[0];
  if (firstLesson) {
    const isDone = state.completedLessonIds.includes(firstLesson.id);
    tasks.push({
      id: `task-lesson-${firstLesson.id}`,
      type: 'lesson',
      title: `课程精读：${firstLesson.title}`,
      subtitle: `${firstLesson.domain} · ${firstLesson.examFrequency}`,
      minutes: Math.min(firstLesson.estimatedMinutes, Math.max(20, effectiveMinutesBudget)),
      completed: isDone,
      targetId: firstLesson.id,
      badge: firstLesson.id,
    });
    accumulatedMinutes += firstLesson.estimatedMinutes;
  }

  // 2. Linked Coding Challenge (if budget >= 45m)
  if (effectiveMinutesBudget >= 45 && firstLesson?.linkedChallengeId) {
    const ch: CodingChallenge | undefined = CODING_CHALLENGES.find(
      (c) => c.id === firstLesson.linkedChallengeId
    );
    if (ch) {
      const sub = state.challengeSubmissions[ch.id];
      const isDone = Boolean(sub?.passedAllRules);
      tasks.push({
        id: `task-challenge-${ch.id}`,
        type: 'challenge',
        title: `编程实战：${ch.title}`,
        subtitle: `${ch.category} 动手实验室 · 含参考答案与逐行解析`,
        minutes: ch.estimatedMinutes,
        completed: isDone,
        targetId: ch.id,
        badge: `${ch.category} Lab`,
      });
      accumulatedMinutes += ch.estimatedMinutes;
    }
  }

  // 3. Targeted Exam Questions (Always include a quick quiz block!)
  const wrongIds = Object.values(state.questionAttempts)
    .filter((a) => !a.isCorrect && !a.masteredFromWrongBook)
    .map((a) => a.questionId);

  const linkedQIds = firstLesson?.linkedQuestionIds || ['Q01', 'Q02', 'Q03'];
  const targetQId = wrongIds[0] || linkedQIds[0] || allQuestions[0]?.id || 'Q01';
  const answeredCountForLesson = linkedQIds.filter(
    (qId) => state.questionAttempts[qId]?.isCorrect
  ).length;

  tasks.push({
    id: `task-quiz-${firstLesson?.id || 'daily'}`,
    type: 'questions',
    title:
      wrongIds.length > 0
        ? `错题复盘与随堂真题（含 ${wrongIds.length} 道待复盘错题）`
        : `随堂认证真题演练（${firstLesson?.id || 'PD1'} 配套考点）`,
    subtitle: `已完成 ${answeredCountForLesson}/${linkedQIds.length} 道配套真题 · 含逐项解析`,
    minutes: 15,
    completed: answeredCountForLesson >= linkedQIds.length && wrongIds.length === 0,
    targetId: targetQId,
    badge: 'PD1/PD2',
  });
  accumulatedMinutes += 15;

  // 4. Second Lesson + Challenge if Intensive mode (>= 95 mins)
  if (effectiveMinutesBudget >= 95 && lessonsPool.length > 1) {
    const secondLesson = lessonsPool[1];
    tasks.push({
      id: `task-lesson-${secondLesson.id}`,
      type: 'lesson',
      title: `加餐进阶课：${secondLesson.title}`,
      subtitle: `${secondLesson.domain} · 冲刺模式双倍进度`,
      minutes: secondLesson.estimatedMinutes,
      completed: state.completedLessonIds.includes(secondLesson.id),
      targetId: secondLesson.id,
      badge: secondLesson.id,
    });
    accumulatedMinutes += secondLesson.estimatedMinutes;
  }

  // 5. Spaced-repetition flashcards: due reviews first, then a few new cards
  const queue = getReviewQueue(FLASHCARDS_DATA, state.flashcardStates, Date.now());
  const flashMinutes = queue.all.length === 0 ? 5 : Math.min(15, Math.max(5, queue.all.length * 2));
  tasks.push({
    id: 'task-flashcards-daily',
    type: 'flashcards',
    title:
      queue.due.length > 0
        ? `闪卡复习：${queue.due.length} 张到期`
        : '高频考点闪卡速记（Governor Limits & 执行顺序）',
    subtitle:
      queue.all.length === 0
        ? '今天的卡都翻完了'
        : `${queue.due.length} 张到期复习 · ${queue.fresh.length} 张新卡`,
    minutes: flashMinutes,
    completed: queue.all.length === 0,
    targetId: queue.all[0] ?? FLASHCARDS_DATA[0].id,
    badge: '记忆闪卡',
  });
  accumulatedMinutes += flashMinutes;

  const completedMinutesToday = tasks
    .filter((t) => t.completed)
    .reduce((sum, t) => sum + t.minutes, 0);

  const remainingLessonsMinutes = uncompletedLessons.reduce(
    (sum, l) => sum + l.estimatedMinutes + 25,
    0
  );
  const daysRemainingToComplete = Math.max(
    1,
    Math.ceil(remainingLessonsMinutes / Math.max(20, effectiveMinutesBudget))
  );

  return {
    effectiveMinutesBudget,
    tasks,
    totalPlannedMinutes: accumulatedMinutes,
    completedMinutesToday,
    daysRemainingToComplete,
  };
}

/**
 * Interactive SOQL Live Query Simulator against MOCK_ORG_TABLES
 */
export function executeMockSoql(rawQuery: string): {
  success: boolean;
  objectName: string;
  columns: string[];
  rows: Record<string, string | number | boolean>[];
  queryPlanCost: string;
  selectivityNote: string;
  error?: string;
} {
  const cleaned = rawQuery
    .replace(/--.*$/gm, '')
    .replace(/\s+/g, ' ')
    .trim();

  const fromMatch = cleaned.match(/FROM\s+([a-zA-Z0-9_]+)/i);
  if (!fromMatch) {
    return {
      success: false,
      objectName: 'Unknown',
      columns: [],
      rows: [],
      queryPlanCost: 'N/A',
      selectivityNote: '语法错误：缺少 FROM <ObjectName> 子句',
      error: 'SOQL 语法解析错误：未找到有效的 FROM 对象名（支持 Account, Opportunity, Contact, Project__c）。',
    };
  }

  const objNameInput = fromMatch[1];
  const table =
    MOCK_ORG_TABLES.find(
      (t) => t.objectName.toLowerCase() === objNameInput.toLowerCase()
    ) || MOCK_ORG_TABLES[0];

  const selectMatch = cleaned.match(/SELECT\s+(.+?)\s+FROM\s+/i);
  if (!selectMatch) {
    return {
      success: false,
      objectName: table.objectName,
      columns: [],
      rows: [],
      queryPlanCost: 'N/A',
      selectivityNote: '语法错误：缺少 SELECT 字段列表',
      error: 'SOQL 语法错误：请指定 SELECT 字段（注意：SOQL 不支持 SELECT *）。',
    };
  }

  if (selectMatch[1].trim() === '*') {
    return {
      success: false,
      objectName: table.objectName,
      columns: [],
      rows: [],
      queryPlanCost: 'N/A',
      selectivityNote: '语法错误：SOQL 严禁使用 SELECT *',
      error: 'System.QueryException: SOQL 不支持 SELECT *，请显式列出字段名（如 SELECT Id, Name FROM Account）。',
    };
  }

  const requestedFields = selectMatch[1]
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean);

  let rows = [...table.sampleRows];

  // Simple WHERE filter simulation for interactive feel
  if (/Rating\s*=\s*'Hot'/i.test(cleaned)) {
    rows = rows.filter((r) => r.Rating === 'Hot');
  }
  if (/Amount\s*>\s*(\d+)/i.test(cleaned)) {
    const m = cleaned.match(/Amount\s*>\s*(\d+)/i);
    const minAmt = m ? Number(m[1]) : 0;
    rows = rows.filter((r) => Number(r.Amount || 0) > minAmt);
  }
  if (/Status__c\s*=\s*'Active'/i.test(cleaned)) {
    rows = rows.filter((r) => r.Status__c === 'Active');
  }

  // ORDER BY Amount DESC
  if (/ORDER\s+BY\s+Amount\s+DESC/i.test(cleaned)) {
    rows.sort((a, b) => Number(b.Amount || 0) - Number(a.Amount || 0));
  }

  // LIMIT
  const limitMatch = cleaned.match(/LIMIT\s+(\d+)/i);
  if (limitMatch) {
    rows = rows.slice(0, Number(limitMatch[1]));
  }

  // Query Plan selectivity analysis
  const hasLeadingWildcard = /LIKE\s+'%/i.test(cleaned);
  const hasNotEqual = /(!=|NOT\s+IN)/i.test(cleaned);
  const hasIndexedFilter = /(Id\s*=|Id\s+IN|AccountId\s+IN|Name\s*=|External_Code__c)/i.test(cleaned);

  let queryPlanCost = '0.18 · Selective Index Scan';
  let selectivityNote = '查询命中标准索引，符合 LDV 高选择性规范。';

  if (hasLeadingWildcard || hasNotEqual) {
    queryPlanCost = '1.92 · Non-Selective TableScan';
    selectivityNote =
      '检测到前置通配符 LIKE \'%...\' 或负向运算符 (!= / NOT IN)，在百万级数据表上会导致全表扫描超时。';
  } else if (!hasIndexedFilter && !/WHERE/i.test(cleaned)) {
    queryPlanCost = '1.25 · TableScan (No WHERE)';
    selectivityNote = '未包含 WHERE 索引过滤条件，建议结合索引字段与 LIMIT 收敛结果。';
  }

  const columns =
    requestedFields.length > 0 && rows.length > 0
      ? requestedFields.filter((f) => f in rows[0] || f === 'Id' || f === 'Name')
      : Object.keys(table.sampleRows[0] || {});

  const finalCols = columns.length > 0 ? columns : Object.keys(table.sampleRows[0] || {});

  return {
    success: true,
    objectName: table.objectName,
    columns: finalCols,
    rows,
    queryPlanCost,
    selectivityNote,
  };
}
