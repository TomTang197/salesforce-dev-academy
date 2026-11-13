# 窝窝救助站叙事层 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 ForceCraft 加一层「窝窝救助站」现实职场剧叙事：工单化的今日任务、会被点亮的救助站平面图、水彩领养墙、陪伴日志与每日状态签到，同时保留「专注备考模式」。

**Architecture:** 叙事内容放在 `src/data/story/` 的纯数据文件中；所有派生逻辑（章节进度、工单映射、陪伴日志更新）是 `src/utils/story.ts` 中的纯函数，由 vitest 覆盖；UI 组件放在 `src/components/story/`，`App.tsx` 负责挂载首页、弹窗与模式切换。现有每日计划算法、课程、编程题、考题不做改动。

**Tech Stack:** React 19 + TypeScript + Vite 6、原生 CSS tokens（unslop Graphite 体系）、vitest 3、原生 `<dialog closedby="any">`。

**Spec:** `docs/superpowers/specs/2026-11-13-wowo-shelter-story-design.md`

**约定：** 每个完整文件代码块前都有一行 `<!-- file: 路径 -->` 标记，表示「用该代码块整体创建/覆盖此文件」。

---

## File Structure

| 文件 | 职责 |
|---|---|
| `src/types.ts`（改） | 新增 `Mood`、`CompanionLogEntry` 与 `UserAppState` 叙事字段 |
| `src/utils/storageAndPlanner.ts`（改） | `INITIAL_APP_STATE` 默认值 |
| `src/data/story/characters.ts` | 4 位同事 |
| `src/data/story/chapters.ts` | 9 章 + 20 讲剧情与动物 |
| `src/data/story/moods.ts` | 签到 4 档选项 |
| `src/utils/story.ts` | 纯函数：进度、工单、陪伴日志 |
| `src/utils/story.test.ts` | 数据完整性与纯函数测试 |
| `src/utils/useLightDismissFallback.ts` | `<dialog closedby>` 回退 hook |
| `src/components/story/TicketQueue.tsx` | 工单列表 |
| `src/components/story/ShelterMap.tsx` | 救助站平面图 |
| `src/components/story/AdoptionWall.tsx` | 领养墙 |
| `src/components/story/CompanionLog.tsx` | 陪伴日志 |
| `src/components/story/ShelterHomeView.tsx` | 新首页 |
| `src/components/story/MoodCheckInDialog.tsx` | 每日签到 |
| `src/components/story/StoryUnlockDialog.tsx` | 课后结局 |
| `src/index.css`（改，追加） | 叙事层样式 |
| `src/components/ElasticPlannerView.tsx`（改） | 故事模式下用工单队列；移除「差 X%」 |
| `src/App.tsx`（覆盖） | 挂载首页、弹窗、模式切换、陪伴日志写入 |
| `package.json` / `tsconfig.json`（改） | vitest 与测试排除 |

---

### Task 1: vitest 测试基础设施

**Files:** Modify `package.json`, `tsconfig.json`

- [ ] **Step 1: 安装 vitest**

Run: `npm install -D vitest@^3`
Expected: `added N packages`，无报错。

- [ ] **Step 2: 增加 test 脚本**（`package.json` 的 `scripts` 中加入）

```json
"test": "vitest run"
```

- [ ] **Step 3: 测试文件不参与 `tsc -b`**（`tsconfig.json` 顶层与 `include` 同级加入）

```json
"exclude": ["src/**/*.test.ts"]
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json tsconfig.json
git commit -m "chore: add vitest"
```

---

### Task 2: 状态字段

**Files:** Modify `src/types.ts`, `src/utils/storageAndPlanner.ts`

- [ ] **Step 1: 在 `src/types.ts` 末尾追加类型**

```ts
export type Mood = 'tired' | 'calm' | 'energized' | 'drift';

export interface CompanionLogEntry {
  minutes: number;
  mood?: Mood;
  completedLessonIds: string[];
}
```

- [ ] **Step 2: 在 `UserAppState` 中 `rebalancedDaysCount: number;` 之后加入**

```ts
  storyMode: boolean;
  companionLog: Record<string, CompanionLogEntry>;
  seenStoryBeats: string[];
  lastCheckInDate: string | null;
  reflections: Record<string, string>;
```

- [ ] **Step 3: 在 `INITIAL_APP_STATE` 中 `rebalancedDaysCount: 0,` 之后加入**

```ts
  storyMode: true,
  companionLog: {},
  seenStoryBeats: ['L01'],
  lastCheckInDate: null,
  reflections: {},
```

`loadAppState` 已用 `{ ...INITIAL_APP_STATE, ...parsed }` 合并，旧存档自动获得默认值。

- [ ] **Step 4: Commit** — `git commit -am "feat(story): add story state fields"`

---

### Task 3: 剧情数据（先写失败测试）

**Files:** Create `src/utils/story.test.ts`, `src/data/story/characters.ts`, `src/data/story/chapters.ts`, `src/data/story/moods.ts`

- [ ] **Step 1: 写测试（同时覆盖 Task 4 的纯函数）**

<!-- file: src/utils/story.test.ts -->
```ts
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
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test`
Expected: FAIL，`Failed to resolve import "../data/story/chapters"`。

- [ ] **Step 3: 同事数据**

<!-- file: src/data/story/characters.ts -->
```ts
export type CharacterId = 'alan' | 'xiaoman' | 'laozhou' | 'qiqi';

export interface Character {
  id: CharacterId;
  name: string;
  initial: string;
  role: string;
}

export const CHARACTERS: Record<CharacterId, Character> = {
  alan: { id: 'alan', name: '阿岚', initial: '岚', role: '站长' },
  xiaoman: { id: 'xiaoman', name: '小满', initial: '满', role: '领养专员' },
  laozhou: { id: 'laozhou', name: '老周', initial: '周', role: '兽医' },
  qiqi: { id: 'qiqi', name: '七七', initial: '七', role: '捐赠与财务' },
};
```

- [ ] **Step 4: 签到选项**

<!-- file: src/data/story/moods.ts -->
```ts
import type { Mood } from '../../types';
import type { CharacterId } from './characters';

export interface MoodOption {
  mood: Mood;
  label: string;
  hint: string;
  minutes: number | null;
  speakerId: CharacterId;
  reply: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  { mood: 'tired', label: '有点累', hint: '20 分钟 · 轻量保温', minutes: 20, speakerId: 'alan', reply: '累了就去喂喂猫吧，看几张卡就好。' },
  { mood: 'calm', label: '平静', hint: '45 分钟 · 一讲课', minutes: 45, speakerId: 'xiaoman', reply: '今天也来啦！有几张工单我攒着等你。' },
  { mood: 'energized', label: '有劲', hint: '90 分钟 · 课程 + 实验', minutes: 90, speakerId: 'laozhou', reply: '好。今天可以啃硬骨头。' },
  { mood: 'drift', label: '想放空', hint: '不排任务 · 只是来看看', minutes: null, speakerId: 'alan', reply: '那就只是来坐坐，看看它们也很好。' },
];
```

- [ ] **Step 5: 章节与剧情**

<!-- file: src/data/story/chapters.ts -->
```ts
import type { CharacterId } from './characters';

export type ShelterArea =
  | 'lobby'
  | 'kennels'
  | 'cattery'
  | 'adoption'
  | 'storage'
  | 'yard'
  | 'donation'
  | 'clinic'
  | 'garden';

export interface StoryChapter {
  id: string;
  title: string;
  area: ShelterArea;
  areaLabel: string;
  lessonIds: string[];
}

export interface StoryAnimal {
  id: string;
  name: string;
  species: string;
  portrait: string;
}

export interface LessonStory {
  lessonId: string;
  chapterId: string;
  requesterId: CharacterId;
  animal: StoryAnimal;
  ticketTitleZh: string;
  ticketTitleEn: string;
  intro: string[];
  outro: string;
  newHome: string;
  headline?: string;
}

export const STORY_CHAPTERS: StoryChapter[] = [
  { id: 'prologue', title: '序章 · 门口的纸箱', area: 'lobby', areaLabel: '门厅', lessonIds: ['L00-1', 'L00-2', 'L00-3', 'L00-4'] },
  { id: 'ch1', title: '第一章 · 豆包的档案', area: 'kennels', areaLabel: '犬舍', lessonIds: ['L01', 'L02'] },
  { id: 'ch2', title: '第二章 · 找到每一个家', area: 'cattery', areaLabel: '猫屋', lessonIds: ['L03', 'L04'] },
  { id: 'ch3', title: '第三章 · 重复的申请', area: 'adoption', areaLabel: '领养厅', lessonIds: ['L05', 'L06'] },
  { id: 'ch4', title: '第四章 · 寒潮夜', area: 'storage', areaLabel: '仓库', lessonIds: ['L07', 'L08'] },
  { id: 'ch5', title: '第五章 · 领养日', area: 'yard', areaLabel: '院子', lessonIds: ['L09', 'L10'] },
  { id: 'ch6', title: '第六章 · 捐款人的信', area: 'donation', areaLabel: '捐赠角', lessonIds: ['L11', 'L12'] },
  { id: 'ch7', title: '第七章 · 不再出错', area: 'clinic', areaLabel: '诊室', lessonIds: ['L13', 'L14'] },
  { id: 'finale', title: '终章 · 十年后的窝窝', area: 'garden', areaLabel: '屋顶花园', lessonIds: ['L15', 'L16'] },
];

const animal = (id: string, name: string, species: string): StoryAnimal => ({
  id,
  name,
  species,
  portrait: `/story/animals/${id}.jpg`,
});

export const LESSON_STORIES: LessonStory[] = [
  {
    lessonId: 'L00-1',
    chapterId: 'prologue',
    requesterId: 'alan',
    animal: animal('zhima', '芝麻', '纸箱里的小黑猫'),
    ticketTitleZh: '带我看看这套系统到底长什么样',
    ticketTitleEn: "Map the shelter's org metadata",
    intro: [
      '早上门口又放了一个纸箱，里面是一只小黑猫，我们叫它芝麻。',
      '我想给它建档，可系统里有三个都叫「动物」的对象，我不知道哪个才是真的。',
      '你懂 Object Manager，能帮我理一理，顺便把它们拉到本地看看吗？',
    ],
    outro: '你把旧系统的元数据拉到了本地，理清了真正在用的 Animal__c。芝麻成了新系统里的第一条记录。',
    newHome: '芝麻被隔壁面包店的老板娘领走了，每天在橱窗里晒太阳。',
  },
  {
    lessonId: 'L00-2',
    chapterId: 'prologue',
    requesterId: 'alan',
    animal: animal('tuanzi', '团子', '白色小京巴混种'),
    ticketTitleZh: '前任志愿者留下的代码，我看不懂',
    ticketTitleEn: "Read the old volunteer's Apex",
    intro: [
      '之前帮忙的志愿者回老家了，留下一堆 Apex 代码。',
      '他说跟 Java 差不多，可我看到 Map、Set 就头大。',
      '团子的疫苗提醒就卡在这段代码里，你能先读懂它吗？',
    ],
    outro: '你发现旧代码把 Java 的习惯带进了 Apex，改成了地道写法。团子的疫苗提醒第一次准时发了出去。',
    newHome: '团子去了一对退休教师家，每天傍晚跟着他们在河边散步。',
  },
  {
    lessonId: 'L00-3',
    chapterId: 'prologue',
    requesterId: 'laozhou',
    animal: animal('juzi', '橘子', '胖橘猫'),
    ticketTitleZh: '把入站登记的 Flow 换成 Trigger',
    ticketTitleEn: 'Turn the intake Flow into a Trigger',
    intro: [
      '入站登记的 Flow 越画越大，我已经看不清了。',
      '昨天橘子进来，体重字段又没自动算出来。',
      '你会 SQL 也会 Flow，把它翻成 Trigger 和 SOQL 吧。',
    ],
    outro: 'Flow 里的每一个分支都在 Trigger 里找到了位置。橘子的入站体检单这次一次就填对了。',
    newHome: '橘子被一位程序员领养，现在最爱趴在机械键盘旁边睡觉。',
  },
  {
    lessonId: 'L00-4',
    chapterId: 'prologue',
    requesterId: 'xiaoman',
    animal: animal('huihui', '灰灰', '灰色小兔'),
    ticketTitleZh: '前台想要一个能用的小组件',
    ticketTitleEn: 'Put a simple LWC on the front desk',
    intro: [
      '前台电脑上的页面全是灰色表格，来看动物的人根本找不到想看的。',
      '我想在首页放个小卡片，显示今天刚来的小家伙。',
      '听说你写过 React？那 LWC 应该很快就能上手吧？',
    ],
    outro: '你的第一个 LWC 出现在了前台首页。第一个被它展示出来的，是一只叫灰灰的小兔子。',
    newHome: '灰灰被一个小女孩一眼选中，现在住在洒满阳光的阳台上。',
  },
  {
    lessonId: 'L01',
    chapterId: 'ch1',
    requesterId: 'alan',
    animal: animal('doubao', '豆包', '柴犬'),
    ticketTitleZh: '领养日系统一到高峰就崩',
    ticketTitleEn: 'Stop the org crashing on adoption day',
    intro: [
      '上周末领养日，系统在最忙的时候报错了，一直说什么 101 次查询。',
      '当时豆包的领养手续办到一半，那家人等了很久，最后先走了。',
      '我不想再让它等了。你能查查是哪里出了问题吗？',
    ],
    outro: '你找到了藏在循环里的查询，把它改成了一次批量查询。下一个领养日系统很稳，豆包等到了它的家人。',
    newHome: '豆包跟着一家三口回了家，小男孩给它织了一条歪歪扭扭的围巾。',
  },
  {
    lessonId: 'L02',
    chapterId: 'ch1',
    requesterId: 'laozhou',
    animal: animal('niangao', '年糕', '三花猫'),
    ticketTitleZh: '把病历按动物归好类',
    ticketTitleEn: 'Group medical records by animal',
    intro: [
      '病历一条一条混在一起，查年糕的记录我要翻二十页。',
      '我需要按动物分组，一只一张清单。',
      '还有，那个类没写 sharing，志愿者能看到不该看的东西。',
    ],
    outro: '你用 Map<Id, List<...>> 把病历按动物归了组，还给类补上了共享声明。老周第一次在两秒内找到了年糕的全部病历。',
    newHome: '年糕被一位独居的奶奶领养，每天陪她听收音机。',
  },
  {
    lessonId: 'L03',
    chapterId: 'ch2',
    requesterId: 'laozhou',
    animal: animal('ahui', '阿灰', '灰口鼻的老田园犬'),
    ticketTitleZh: '找出等得太久的老狗',
    ticketTitleEn: 'Find every senior dog waiting too long',
    intro: [
      '阿灰在这里住了两年半了，没人选它，因为它老了。',
      '我想把入站超过一年、年龄超过 8 岁的狗都找出来，单独做一次推荐。',
      '查询里别拼字符串，上次差点被注入。',
    ],
    outro: '你用日期字面量和绑定变量写出了安全的查询，把 11 只被遗忘的老狗列进了「慢慢来」专题。第一位来看的人，就选了阿灰。',
    newHome: '阿灰被一对中年夫妻领走，他们说就想要一只安静的狗陪着慢慢变老。',
  },
  {
    lessonId: 'L04',
    chapterId: 'ch2',
    requesterId: 'xiaoman',
    animal: animal('xiaotudou', '小土豆', '棕色垂耳兔'),
    ticketTitleZh: '把可领养的小家伙做成列表',
    ticketTitleEn: 'Show adoptable animals as a list',
    intro: [
      '来领养的人总问：现在还有哪些小家伙？',
      '我想要一个列表，有照片、名字，没人等待的时候显示一句「它们都找到家啦」。',
      '小土豆在后面笼子里，每次都被人错过。',
    ],
    outro: '你用 lwc:if 和 for:each 做出了可领养列表，空状态也写得很温柔。小土豆第一次出现在了列表的第一页。',
    newHome: '小土豆和一只叫土豆泥的兔子成了室友，主人说它们会一起偷吃菜叶。',
  },
  {
    lessonId: 'L05',
    chapterId: 'ch3',
    requesterId: 'xiaoman',
    animal: animal('buding', '布丁', '金毛幼犬'),
    ticketTitleZh: '能拦住重复的领养申请吗',
    ticketTitleEn: 'Prevent duplicate adoption applications',
    intro: [
      '布丁太可爱了，同一个人一晚上提交了三次申请。',
      '申请一多，布丁就被锁住，别人连看都看不到。',
      '能在保存之前就拦下来吗？最好还能自动把状态填好。',
    ],
    outro: '你在 before 触发器里拦住了重复申请，顺手补全了状态字段，一句 DML 都没多写。布丁迎来了最合适的那一家。',
    newHome: '布丁被一位消防员领养，现在是消防站里最受欢迎的小狗。',
  },
  {
    lessonId: 'L06',
    chapterId: 'ch3',
    requesterId: 'alan',
    animal: animal('kele', '可乐', '黑色拉布拉多'),
    ticketTitleZh: '批量导入时触发器也要扛得住',
    ticketTitleEn: 'Make the trigger safe for bulk imports',
    intro: [
      '市里转来了 300 只动物的档案，要一次导进来。',
      '可导到一半，后面的记录全都没处理，可乐的资料就丢在那一批里。',
      '能让触发器扛住大批量，也不会自己反复触发吗？',
    ],
    outro: '你把逻辑搬进了 Handler，用记录级的 Set<Id> 防递归，300 条一条不落。可乐的档案完整地回来了。',
    newHome: '可乐去了一位导盲犬训练师家，正在学着成为一只工作犬。',
  },
  {
    lessonId: 'L07',
    chapterId: 'ch4',
    requesterId: 'laozhou',
    animal: animal('xueqiu', '雪球', '白色长毛猫'),
    ticketTitleZh: '今晚每个犬舍需要几条毯子',
    ticketTitleEn: 'Count blankets per kennel tonight',
    intro: [
      '今晚零下五度。',
      '我需要知道每个犬舍有几只动物、几只年纪大的，好分毯子。',
      '数据有四万多条，别一下全塞进内存。',
    ],
    outro: '你用 AggregateResult 一次算出了每个犬舍的数量，用 SOQL for 循环稳稳扫完了全部记录。那一夜，雪球裹着最厚的那条毯子睡着了。',
    newHome: '雪球被一位画家领养，成了她新画册的封面。',
  },
  {
    lessonId: 'L08',
    chapterId: 'ch4',
    requesterId: 'alan',
    animal: animal('lizi', '栗子', '爪子冻伤的小土狗'),
    ticketTitleZh: '有一条录错了，别让整批都丢掉',
    ticketTitleEn: 'Save what you can when some records fail',
    intro: [
      '寒潮夜我们临时收进来二十多只，志愿者一口气录入。',
      '其中一条填错了，结果整批都没保存，栗子的冻伤记录也没了。',
      '能不能让对的先存下来，错的单独告诉我？',
    ],
    outro: '你用 Database.insert 的部分成功模式保住了正确的记录，把出错的那条整理成清单发给了阿岚。栗子的爪子得到了及时治疗。',
    newHome: '栗子的爪子完全好了，现在每天跟着新主人晨跑。',
  },
  {
    lessonId: 'L09',
    chapterId: 'ch5',
    requesterId: 'xiaoman',
    animal: animal('tangyuan', '汤圆', '奶牛猫'),
    ticketTitleZh: '让动物卡片和申请表说上话',
    ticketTitleEn: 'Let the cards talk to the adoption form',
    intro: [
      '领养日那天，我希望大家点一下动物卡片，旁边的申请表就自动填好名字。',
      '现在点了没反应，大家还得手抄编号。',
      '汤圆的编号上次就被抄错了……',
    ],
    outro: '你让子组件通过 CustomEvent 把选中的动物告诉父组件，跨区域的部分用了 LMS。汤圆的申请表这次一字不差。',
    newHome: '汤圆被一对新婚夫妻领养，他们说它是家里的第一个成员。',
  },
  {
    lessonId: 'L10',
    chapterId: 'ch5',
    requesterId: 'xiaoman',
    animal: animal('maiya', '麦芽', '柯基'),
    ticketTitleZh: '有动物被领走时，大屏幕要自己刷新',
    ticketTitleEn: 'Refresh the board when an animal is adopted',
    intro: [
      '大屏幕上的动物列表不会自己更新。',
      '麦芽明明已经被领走了，还挂在上面，又有人跑来问。',
      '能不能领养一确认，板子就刷新？',
    ],
    outro: '你用 @wire 绑定了响应式参数，并把完整的 wire 结果交给 refreshApex。麦芽的卡片换成了「已回家」的照片。',
    newHome: '麦芽去了一个有小院子的家，每天巡视三遍菜地。',
  },
  {
    lessonId: 'L11',
    chapterId: 'ch6',
    requesterId: 'qiqi',
    animal: animal('xiaoyugan', '小鱼干', '狸花猫'),
    ticketTitleZh: '夜里慢慢发完所有感谢回执',
    ticketTitleEn: 'Send thank-you receipts overnight',
    intro: [
      '这个月有一千多笔小额捐款，每一笔我都想回一封感谢信。',
      '可一次发系统就超时，上次还漏了好多人。',
      '能不能让它晚上自己慢慢发，还要告诉我一共发了多少？',
    ],
    outro: '你写了一个带 Database.Stateful 的 Batch，夜里分批发送并统计总数，再用 Schedulable 每晚定时启动。第二天早上，七七收到了一份完整的发送报告。',
    newHome: '小鱼干被一位常年小额捐款的读者领养，她说终于见到了「自己捐过的猫」。',
  },
  {
    lessonId: 'L12',
    chapterId: 'ch6',
    requesterId: 'qiqi',
    animal: animal('xingxing', '星星', '失明的老猫'),
    ticketTitleZh: '保护捐款人的隐私',
    ticketTitleEn: 'Keep donor details private',
    intro: [
      '有位捐款人希望匿名，可志愿者在页面上能看到她的电话和地址。',
      '她领养了星星，一只看不见的老猫，她不想被打扰。',
      '能让每个人只看到自己该看的吗？',
    ],
    outro: '你用 WITH USER_MODE 和 Security.stripInaccessible 守住了字段权限。捐款人的信息只在该看到的人面前出现。',
    newHome: '星星和那位匿名的捐款人住在一起，每天靠脚步声认出她回家。',
  },
  {
    lessonId: 'L13',
    chapterId: 'ch7',
    requesterId: 'qiqi',
    animal: animal('maoxian', '毛线', '卷毛混种小狗'),
    ticketTitleZh: '部署之前，先证明捐款逻辑是对的',
    ticketTitleEn: 'Prove the donation logic with tests',
    intro: [
      '上个月有一次改动，把月捐款人全标成了一次性捐款。',
      '我不想再靠运气，部署前能不能先证明它是对的？',
      '毛线的助养人就是那次被弄错的。',
    ],
    outro: '你写了 @TestSetup 和带 startTest/stopTest 的测试，异步逻辑也断言得清清楚楚。之后的每一次部署，七七都先看测试报告。',
    newHome: '毛线的助养人最后决定直接领养它，说「不想再只是每个月看照片了」。',
  },
  {
    lessonId: 'L14',
    chapterId: 'ch7',
    requesterId: 'qiqi',
    animal: animal('dafu', '大福', '三条腿的边牧'),
    ticketTitleZh: '和市宠物登记平台同步',
    ticketTitleEn: 'Sync with the city pet registry',
    intro: [
      '市里要求每只被领养的动物都要同步到宠物登记平台。',
      '直接在触发器里调接口会报错，失败了还没有任何记录。',
      '大福的登记卡了一周，新主人有点着急。',
    ],
    outro: '你用 Named Credential 发起调用，失败时立刻发布 Platform Event 记录，不会被回滚吞掉。大福的登记证第二天就寄到了。',
    newHome: '大福用三条腿跑得比谁都快，现在是社区飞盘队的队员。',
  },
  {
    lessonId: 'L15',
    chapterId: 'finale',
    requesterId: 'laozhou',
    animal: animal('yunduo', '云朵', '萨摩耶'),
    ticketTitleZh: '一百万条记录也要搜得快',
    ticketTitleEn: 'Keep search fast with a million records',
    intro: [
      '这几年，周边三个城市的救助站都接进了我们的系统。',
      '记录过了一百万，搜名字要转半分钟，还经常超时。',
      '云朵是第一只跨城领养的，我想让它的故事能被搜到。',
    ],
    outro: '你改写了高选择性查询，避开了前导通配符，并在并发更新时加上了 FOR UPDATE。搜索又回到了一秒以内。',
    newHome: '云朵被另一座城市的一家人领养，他们开了四个小时的车来接它。',
  },
  {
    lessonId: 'L16',
    chapterId: 'finale',
    requesterId: 'alan',
    animal: animal('wowo', '窝窝', '站里最老的橘猫'),
    ticketTitleZh: '交接之前，给前台组件留一套测试',
    ticketTitleEn: 'Test the front desk before we hand it over',
    intro: [
      '窝窝是这里最老的猫，站名就是跟着它起的。',
      '明年我想把站长交给小满，系统也要交给更多志愿者。',
      '你写的那些前台组件，能留下一套测试吗？这样就算你不在，它们也不会坏。',
    ],
    outro: '你用 Jest 给前台组件写好了测试，Shadow DOM 查询和异步渲染都覆盖到了。交接那天，阿岚说：「窝窝终于有一个不会塌的家了。」',
    newHome: '窝窝没有被领养，它留在了这里。它就是这个家本身。',
    headline: '窝窝有了一个不会塌的家',
  },
];
```

- [ ] **Step 6: 运行测试** — Run: `npm test`。Expected: 数据完整性用例 PASS；`./story` 导入失败（Task 4 实现）。

---

### Task 4: 纯函数 `story.ts`

**Files:** Create `src/utils/story.ts`

- [ ] **Step 1: 实现**

<!-- file: src/utils/story.ts -->
```ts
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
```

- [ ] **Step 2: 运行测试** — Run: `npm test`。Expected: 全部 PASS。
- [ ] **Step 3: Commit** — `git add src/data/story src/utils/story.ts src/utils/story.test.ts && git commit -m "feat(story): story data and pure helpers with tests"`

---

### Task 5: 叙事层样式

**Files:** Modify `src/index.css`（文件末尾追加）

- [ ] **Step 1: 追加样式**

```css
/* ===== Wowo Shelter Story Layer ===== */
:root {
  --color-warm: #e8b77a;
  --color-warm-subtle: rgba(232, 183, 122, 0.08);
  --color-warm-border: rgba(232, 183, 122, 0.32);
  --paper: #f4ecdf;
  --paper-ink: #2f2a24;
  --paper-ink-muted: #6f6559;
}

.avatar-initial {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-raised);
  border: 1px solid var(--border-strong);
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
}

.ticket-card {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: start;
  padding: 16px;
  background-color: var(--bg-sidebar);
  border: 1px solid var(--border-hairline);
  border-radius: var(--radius-md);
  transition: border-color 150ms var(--ease-out);
}

.ticket-card.next {
  border-color: var(--border-strong);
}

.ticket-card.done {
  opacity: 0.64;
}

.ticket-card.compact {
  grid-template-columns: 28px minmax(0, 1fr);
}

.ticket-card.compact .ticket-action {
  grid-column: 2;
  justify-self: start;
}

.ticket-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 12px;
  line-height: 16px;
  color: var(--text-muted);
}

.ticket-from {
  color: var(--text-secondary);
  font-weight: 500;
}

.ticket-title {
  margin-top: 4px;
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  color: var(--text-primary);
}

.ticket-title-en {
  font-size: 12px;
  line-height: 16px;
  font-style: italic;
  color: var(--text-muted);
}

.ticket-text {
  margin-top: 8px;
  font-size: 13px;
  line-height: 20px;
  color: var(--text-secondary);
}

.ticket-card.compact .ticket-text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}

.ticket-footer {
  display: block;
  margin-top: 8px;
}

.shelter-map {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-rows: 104px;
  grid-template-areas:
    'lobby lobby kennels cattery'
    'adoption yard yard storage'
    'donation clinic garden garden';
  gap: 1px;
  background-color: var(--border-strong);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.shelter-area {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px;
  background-color: var(--bg-sidebar);
  transition: background-color 220ms var(--ease-out);
}

.shelter-area-label {
  font-size: 13px;
  line-height: 20px;
  font-weight: 500;
  color: var(--text-muted);
}

.shelter-area-chapter {
  font-size: 12px;
  line-height: 16px;
  color: var(--text-muted);
}

.shelter-area-lamp {
  position: absolute;
  top: 18px;
  right: 12px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--border-strong);
}

.shelter-area.lit {
  background-color: var(--color-warm-subtle);
}

.shelter-area.lit .shelter-area-label {
  color: var(--color-warm);
}

.shelter-area.lit .shelter-area-chapter {
  color: var(--text-secondary);
}

.shelter-area.lit .shelter-area-lamp {
  background-color: var(--color-warm);
  box-shadow: 0 0 0 3px rgba(232, 183, 122, 0.16);
}

.shelter-area.current {
  box-shadow: inset 0 0 0 1px var(--color-warm-border);
}

.shelter-area.current .shelter-area-label {
  color: var(--text-primary);
}

.adoption-wall {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(136px, 1fr));
  gap: 16px;
}

.polaroid {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 8px 12px;
  background-color: var(--paper);
  border: 1px solid var(--color-warm-border);
  border-radius: var(--radius-sm);
}

.polaroid img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  border-radius: 2px;
}

.polaroid figcaption {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 4px;
}

.polaroid-name {
  font-size: 13px;
  line-height: 20px;
  font-weight: 500;
  color: var(--paper-ink);
}

.polaroid-note {
  font-size: 11px;
  line-height: 16px;
  color: var(--paper-ink-muted);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;
}

.polaroid.waiting {
  background-color: var(--bg-sidebar);
  border-color: var(--border-hairline);
}

.polaroid.waiting img {
  filter: grayscale(1);
  opacity: 0.4;
}

.polaroid.waiting .polaroid-name {
  color: var(--text-secondary);
}

.polaroid.waiting .polaroid-note {
  color: var(--text-muted);
}

.companion-grid {
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(7, 10px);
  grid-auto-columns: 10px;
  gap: 4px;
}

.companion-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  background-color: var(--bg-raised);
}

.companion-dot.visited {
  background-color: var(--color-warm);
}

.companion-dot.visited.light {
  background-color: rgba(232, 183, 122, 0.5);
}

.companion-dot.today {
  outline: 1px solid var(--text-secondary);
  outline-offset: 1px;
}

.companion-dot.pad {
  visibility: hidden;
}

.mood-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.mood-option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 16px;
  text-align: left;
  background-color: var(--bg-sidebar);
  border: 1px solid var(--border-hairline);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: var(--font-text);
  cursor: pointer;
  transition:
    border-color 150ms var(--ease-out),
    background-color 150ms var(--ease-out);
}

.mood-option:hover {
  border-color: var(--border-strong);
  background-color: var(--bg-raised);
}

.mood-option:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.mood-option-label {
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
}

.mood-option-hint {
  font-size: 12px;
  line-height: 16px;
  color: var(--text-muted);
}

.story-unlock {
  display: grid;
  grid-template-columns: 168px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.story-quote {
  padding: 12px 16px;
  border-left: 2px solid var(--color-warm);
  background-color: var(--color-warm-subtle);
  border-radius: var(--radius-sm);
  font-size: 13px;
  line-height: 20px;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .shelter-map {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-areas:
      'lobby lobby'
      'kennels cattery'
      'adoption storage'
      'yard yard'
      'donation clinic'
      'garden garden';
  }
  .story-unlock,
  .mood-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 2: Commit** — `git commit -am "style(story): shelter, ticket, polaroid and companion styles"`

---

### Task 6: 弹窗回退 hook 与展示组件

**Files:** Create `src/utils/useLightDismissFallback.ts`, `src/components/story/TicketQueue.tsx`, `ShelterMap.tsx`, `AdoptionWall.tsx`, `CompanionLog.tsx`

- [ ] **Step 1: hook**

<!-- file: src/utils/useLightDismissFallback.ts -->
```ts
import { RefObject, useEffect } from 'react';

/** Modern Web Guidance: light-dismiss fallback for browsers without <dialog closedby>. */
export function useLightDismissFallback(ref: RefObject<HTMLDialogElement | null>) {
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return;
    const handleClick = (event: MouseEvent) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const inside =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;
      if (!inside) dialog.close();
    };
    dialog.addEventListener('click', handleClick);
    return () => dialog.removeEventListener('click', handleClick);
  }, [ref]);
}
```

- [ ] **Step 2: 工单队列**

<!-- file: src/components/story/TicketQueue.tsx -->
```tsx
import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { StoryTicket } from '../../utils/story';

interface TicketQueueProps {
  tickets: StoryTicket[];
  onOpen: (ticket: StoryTicket) => void;
  limit?: number;
  compact?: boolean;
}

export const TicketQueue: React.FC<TicketQueueProps> = ({ tickets, onOpen, limit, compact = false }) => {
  const [expanded, setExpanded] = useState(false);
  const firstPendingId = tickets.find((t) => !t.completed)?.id;
  const visible = limit && !expanded ? tickets.slice(0, limit) : tickets;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {visible.map((ticket) => {
        const isNext = ticket.id === firstPendingId;
        return (
          <article
            key={ticket.id}
            className={`ticket-card ${compact ? 'compact' : ''} ${isNext ? 'next' : ''} ${ticket.completed ? 'done' : ''}`}
          >
            <span className="avatar-initial" aria-hidden="true">
              {ticket.requester.initial}
            </span>
            <div style={{ minWidth: 0 }}>
              <div className="ticket-meta">
                <span className="ticket-from">{ticket.requester.name}</span>
                <span>{ticket.requester.role}</span>
                {ticket.completed && <span className="status-badge success">已解决</span>}
              </div>
              <div className="ticket-title">{ticket.titleZh}</div>
              <div className="ticket-title-en">{ticket.titleEn}</div>
              {ticket.body && <p className="ticket-text">{ticket.body}</p>}
              <span className="ticket-footer nav-badge">{ticket.footer}</span>
            </div>
            <button
              type="button"
              className={`ticket-action ${isNext ? 'btn-primary' : 'btn-secondary'}`}
              style={{ minHeight: '32px', padding: '4px 12px' }}
              onClick={() => onOpen(ticket)}
            >
              <span>{ticket.completed ? '再看看' : '接下工单'}</span>
              <ArrowRight size={16} strokeWidth={1.5} />
            </button>
          </article>
        );
      })}
      {limit !== undefined && tickets.length > limit && (
        <button
          type="button"
          className="btn-tertiary"
          style={{ alignSelf: 'flex-start' }}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? '收起' : `还有 ${tickets.length - limit} 张工单`}
        </button>
      )}
    </div>
  );
};
```

- [ ] **Step 3: 救助站平面图**

<!-- file: src/components/story/ShelterMap.tsx -->
```tsx
import React from 'react';
import type { ChapterProgress } from '../../utils/story';

interface ShelterMapProps {
  progress: ChapterProgress[];
  currentChapterId: string;
}

export const ShelterMap: React.FC<ShelterMapProps> = ({ progress, currentChapterId }) => (
  <div className="shelter-map" role="list" aria-label="救助站平面图">
    {progress.map((p) => {
      const isCurrent = p.chapter.id === currentChapterId && !p.lit;
      const status = p.lit ? '已点亮' : isCurrent ? `进行中 ${p.completed}/${p.total}` : `${p.completed}/${p.total}`;
      return (
        <div
          key={p.chapter.id}
          role="listitem"
          className={`shelter-area ${p.lit ? 'lit' : ''} ${isCurrent ? 'current' : ''}`}
          style={{ gridArea: p.chapter.area }}
          aria-label={`${p.chapter.areaLabel}，${p.chapter.title}，${status}`}
        >
          <span className="shelter-area-lamp" aria-hidden="true" />
          <div>
            <div className="shelter-area-label">{p.chapter.areaLabel}</div>
            <div className="shelter-area-chapter">{p.chapter.title}</div>
          </div>
          <span className="nav-badge">{status}</span>
        </div>
      );
    })}
  </div>
);
```

- [ ] **Step 4: 领养墙**

<!-- file: src/components/story/AdoptionWall.tsx -->
```tsx
import React from 'react';
import { LESSON_STORIES } from '../../data/story/chapters';

interface AdoptionWallProps {
  completedLessonIds: string[];
}

export const AdoptionWall: React.FC<AdoptionWallProps> = ({ completedLessonIds }) => {
  const done = new Set(completedLessonIds);
  return (
    <div className="adoption-wall">
      {LESSON_STORIES.map((s) => {
        const adopted = done.has(s.lessonId);
        return (
          <figure key={s.animal.id} className={`polaroid ${adopted ? '' : 'waiting'}`}>
            <img
              src={s.animal.portrait}
              alt={`${s.animal.name}，${s.animal.species}`}
              width={512}
              height={512}
              loading="lazy"
              decoding="async"
            />
            <figcaption>
              <span className="polaroid-name">{s.animal.name}</span>
              <span className="polaroid-note">{adopted ? s.newHome : `${s.lessonId} · 还在等你`}</span>
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
};
```

- [ ] **Step 5: 陪伴日志**

<!-- file: src/components/story/CompanionLog.tsx -->
```tsx
import React from 'react';
import type { CompanionLogEntry } from '../../types';
import { getLessonStory, toDateKey } from '../../utils/story';

interface CompanionLogProps {
  log: Record<string, CompanionLogEntry>;
  reflections: Record<string, string>;
}

const DAYS = 84;

export const CompanionLog: React.FC<CompanionLogProps> = ({ log, reflections }) => {
  const today = new Date();
  const todayKey = toDateKey(today);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (DAYS - 1));
  const padding = (start.getDay() + 6) % 7;
  const days = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const key = toDateKey(d);
    return { key, entry: log[key] };
  });

  const visitedDays = Object.keys(log).length;
  const totalMinutes = Object.values(log).reduce((sum, e) => sum + e.minutes, 0);
  const recentReflections = Object.entries(reflections)
    .filter(([, text]) => text.trim())
    .slice(-3)
    .reverse();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', flexWrap: 'wrap' }}>
        <div className="companion-grid" role="img" aria-label={`最近 12 周陪伴过 ${visitedDays} 天`}>
          {Array.from({ length: padding }, (_, i) => (
            <span key={`pad-${i}`} className="companion-dot pad" />
          ))}
          {days.map(({ key, entry }) => (
            <span
              key={key}
              title={entry ? `${key} · ${entry.minutes} 分钟` : key}
              className={`companion-dot ${entry ? 'visited' : ''} ${entry && entry.minutes < 20 ? 'light' : ''} ${key === todayKey ? 'today' : ''}`}
            />
          ))}
        </div>
        <p className="tabular" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          陪伴过 {visitedDays} 天 · 共 {totalMinutes} 分钟
          <br />
          中途停下也没关系，这里只记得你来过。
        </p>
      </div>

      {recentReflections.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {recentReflections.map(([lessonId, text]) => (
            <div key={lessonId} className="story-quote">
              <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>
                写给{getLessonStory(lessonId)?.animal.name ?? lessonId}
              </span>
              {text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 6: Commit** — `git add src/utils/useLightDismissFallback.ts src/components/story && git commit -m "feat(story): ticket queue, shelter map, adoption wall, companion log"`

---

### Task 7: 首页与弹窗

**Files:** Create `ShelterHomeView.tsx`, `MoodCheckInDialog.tsx`, `StoryUnlockDialog.tsx`

- [ ] **Step 1: 首页**

<!-- file: src/components/story/ShelterHomeView.tsx -->
```tsx
import React from 'react';
import type { UserAppState } from '../../types';
import { buildElasticDailyPlan } from '../../utils/storageAndPlanner';
import {
  ticketsFromPlan,
  getChapterProgress,
  getCurrentChapter,
  getAdoptedAnimals,
  getGreeting,
  StoryTicket,
} from '../../utils/story';
import { LESSON_STORIES } from '../../data/story/chapters';
import { TicketQueue } from './TicketQueue';
import { ShelterMap } from './ShelterMap';
import { AdoptionWall } from './AdoptionWall';
import { CompanionLog } from './CompanionLog';

interface ShelterHomeViewProps {
  state: UserAppState;
  onOpenTicket: (ticket: StoryTicket) => void;
}

export const ShelterHomeView: React.FC<ShelterHomeViewProps> = ({ state, onOpenTicket }) => {
  const plan = buildElasticDailyPlan(state);
  const tickets = ticketsFromPlan(plan.tasks, state);
  const progress = getChapterProgress(state.completedLessonIds);
  const current = getCurrentChapter(state.completedLessonIds);
  const adopted = getAdoptedAnimals(state.completedLessonIds);
  const waiting = LESSON_STORIES.length - adopted.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header>
        <div className="eyebrow-text">{current.title}</div>
        <h1 className="headline-xl" style={{ marginTop: '4px' }}>
          {getGreeting(new Date())}，今天也来看看它们吧
        </h1>
        <p className="tabular" style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          已帮 {adopted.length} 只小动物找到家{waiting > 0 ? ` · 还有 ${waiting} 只在等你` : ' · 每一只都回家了'}
        </p>
      </header>

      <div className="grid-asymmetric">
        <section className="surface-card" aria-labelledby="shelter-map-title">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
            <h2 id="shelter-map-title" className="card-title">窝窝救助站</h2>
            <span className="nav-badge">
              {progress.filter((p) => p.lit).length}/{progress.length} 个区域已点亮
            </span>
          </div>
          <ShelterMap progress={progress} currentChapterId={current.id} />
        </section>

        <section className="surface-card" aria-labelledby="tickets-title">
          <div style={{ marginBottom: '16px' }}>
            <h2 id="tickets-title" className="card-title">今天的工单</h2>
            <p className="tabular" style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              按今天 {plan.effectiveMinutesBudget} 分钟安排，做多少都可以
            </p>
          </div>
          <TicketQueue tickets={tickets} onOpen={onOpenTicket} limit={3} compact />
        </section>
      </div>

      <section id="adoption-wall" className="surface-card" aria-labelledby="adoption-wall-title" style={{ scrollMarginTop: '72px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
          <h2 id="adoption-wall-title" className="card-title">领养墙</h2>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>每学完一讲，就有一只小家伙回家</span>
        </div>
        <AdoptionWall completedLessonIds={state.completedLessonIds} />
      </section>

      <section className="surface-card" aria-labelledby="companion-title">
        <h2 id="companion-title" className="card-title" style={{ marginBottom: '16px' }}>陪伴日志</h2>
        <CompanionLog log={state.companionLog} reflections={state.reflections} />
      </section>
    </div>
  );
};
```

- [ ] **Step 2: 每日签到**

<!-- file: src/components/story/MoodCheckInDialog.tsx -->
```tsx
import React, { useEffect, useRef, useState } from 'react';
import type { Mood } from '../../types';
import { MOOD_OPTIONS } from '../../data/story/moods';
import { CHARACTERS } from '../../data/story/characters';
import { useLightDismissFallback } from '../../utils/useLightDismissFallback';

interface MoodCheckInDialogProps {
  open: boolean;
  onChoose: (mood: Mood) => void;
  onClose: (mood: Mood | null) => void;
}

export const MoodCheckInDialog: React.FC<MoodCheckInDialogProps> = ({ open, onChoose, onClose }) => {
  const ref = useRef<HTMLDialogElement | null>(null);
  const chosenRef = useRef<Mood | null>(null);
  const [chosen, setChosen] = useState<Mood | null>(null);
  useLightDismissFallback(ref);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleClose = () => onClose(chosenRef.current);
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  const option = MOOD_OPTIONS.find((o) => o.mood === chosen);
  const speaker = option ? CHARACTERS[option.speakerId] : null;

  return (
    <dialog
      ref={ref}
      {...({ closedby: 'any' } as React.DialogHTMLAttributes<HTMLDialogElement>)}
      className="linear-dialog"
      aria-labelledby="moodDialogTitle"
      style={{ maxWidth: '480px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h2 id="moodDialogTitle" className="headline-md">今天的你，状态怎么样？</h2>
        <button type="button" className="btn-tertiary" onClick={() => ref.current?.close()}>
          <span>跳过</span>
          <kbd className="keycap">Esc</kbd>
        </button>
      </div>

      {!option || !speaker ? (
        <>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            选一个就好，没有对错。今天的工单会跟着你调整。
          </p>
          <div className="mood-grid">
            {MOOD_OPTIONS.map((o) => (
              <button
                key={o.mood}
                type="button"
                className="mood-option"
                onClick={() => {
                  chosenRef.current = o.mood;
                  setChosen(o.mood);
                  onChoose(o.mood);
                }}
              >
                <span className="mood-option-label">{o.label}</span>
                <span className="mood-option-hint">{o.hint}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span className="avatar-initial" aria-hidden="true">{speaker.initial}</span>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {speaker.name} · {speaker.role}
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '4px' }}>{option.reply}</p>
            </div>
          </div>
          <button type="button" className="btn-primary" style={{ alignSelf: 'flex-end' }} onClick={() => ref.current?.close()}>
            好
          </button>
        </div>
      )}
    </dialog>
  );
};
```

- [ ] **Step 3: 课后结局**

<!-- file: src/components/story/StoryUnlockDialog.tsx -->
```tsx
import React, { useEffect, useRef, useState } from 'react';
import type { LessonStory } from '../../data/story/chapters';
import { STORY_CHAPTERS } from '../../data/story/chapters';
import { useLightDismissFallback } from '../../utils/useLightDismissFallback';

interface StoryUnlockDialogProps {
  story: LessonStory | null;
  reflection: string;
  onSaveReflection: (text: string) => void;
  onClose: () => void;
}

export const StoryUnlockDialog: React.FC<StoryUnlockDialogProps> = ({ story, reflection, onSaveReflection, onClose }) => {
  const ref = useRef<HTMLDialogElement | null>(null);
  const [text, setText] = useState(reflection);
  useLightDismissFallback(ref);

  useEffect(() => {
    setText(reflection);
  }, [story?.lessonId, reflection]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (story && !dialog.open) dialog.showModal();
    if (!story && dialog.open) dialog.close();
  }, [story]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    dialog.addEventListener('close', onClose);
    return () => dialog.removeEventListener('close', onClose);
  }, [onClose]);

  const chapter = story ? STORY_CHAPTERS.find((c) => c.id === story.chapterId) : undefined;

  return (
    <dialog
      ref={ref}
      {...({ closedby: 'any' } as React.DialogHTMLAttributes<HTMLDialogElement>)}
      className="linear-dialog"
      aria-labelledby="storyUnlockTitle"
    >
      {story && (
        <div className="story-unlock">
          <figure className="polaroid" style={{ width: '168px' }}>
            <img src={story.animal.portrait} alt={`${story.animal.name}，${story.animal.species}`} width={512} height={512} />
            <figcaption>
              <span className="polaroid-name">{story.animal.name}</span>
              <span className="polaroid-note">{story.animal.species}</span>
            </figcaption>
          </figure>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
            <div className="eyebrow-text">
              {chapter?.title} · {story.lessonId}
            </div>
            <h2 id="storyUnlockTitle" className="headline-md">
              {story.headline ?? `${story.animal.name}找到家了`}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{story.outro}</p>
            <div className="story-quote">{story.newHome}</div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
              想对{story.animal.name}或自己说一句话吗？（选填）
              <textarea
                className="text-input"
                style={{ minHeight: '64px', resize: 'vertical' }}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="比如：今天终于搞懂了 before 和 after 的区别"
              />
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" className="btn-secondary" onClick={() => ref.current?.close()}>
                先这样
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  onSaveReflection(text.trim());
                  ref.current?.close();
                }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
};
```

- [ ] **Step 4: Commit** — `git add src/components/story && git commit -m "feat(story): shelter home, mood check-in and story unlock dialogs"`

---

### Task 8: 计划页接入工单 & 去掉「差 X%」

**Files:** Modify `src/components/ElasticPlannerView.tsx`

- [ ] **Step 1: 导入**（文件顶部 import 区追加）

```tsx
import { TicketQueue } from './story/TicketQueue';
import { ticketsFromPlan, StoryTicket } from '../utils/story';
```

- [ ] **Step 2: Props 接口追加**

```tsx
  storyMode?: boolean;
  onOpenTicket?: (ticket: StoryTicket) => void;
```

并在组件参数解构中加入 `storyMode = false, onOpenTicket,`。

- [ ] **Step 3: 任务行区块**：把 `{/* Task Rows */}` 下的整个 `<div>` 用条件包裹

```tsx
{storyMode && onOpenTicket ? (
  <TicketQueue tickets={ticketsFromPlan(plan.tasks, state)} onOpen={onOpenTicket} />
) : (
  /* 原有 Task Rows <div> 保持不变 */
)}
```

- [ ] **Step 4: 准备度卡片文案** — 把
```tsx
{readinessScore >= 68
  ? `高于 68% 官方通过线 +${readinessScore - 68}%`
  : `距 68% 官方通过线差 ${68 - readinessScore}%`}
```
替换为 `官方通过线 68%`，卡片标题「综合备考指数」改为「考场准备度」。

- [ ] **Step 5: Commit** — `git commit -am "feat(story): planner uses ticket queue in story mode"`

---

### Task 9: App 接入

**Files:** Overwrite `src/App.tsx`

- [ ] **Step 1: 覆盖 App**

<!-- file: src/App.tsx -->
```tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Calendar,
  BookOpen,
  Code2,
  HelpCircle,
  Layers,
  Play,
  Pause,
  Download,
  Upload,
  RotateCcw,
  Compass,
  Home,
} from 'lucide-react';
import { UserAppState, ExamQuestion, LanguageMode, Mood } from './types';
import { CURRICULUM_LESSONS } from './data/curriculum';
import { BRIDGE_LESSONS } from './data/bridgeOnboarding';
import { CODING_CHALLENGES } from './data/challenges';
import { EXAM_QUESTIONS } from './data/questions';
import { FLASHCARDS_DATA } from './data/flashcards';
import { MOOD_OPTIONS } from './data/story/moods';
import {
  loadAppState,
  saveAppState,
  INITIAL_APP_STATE,
  getPacingConfig,
  getTodayDateStr,
} from './utils/storageAndPlanner';
import {
  addCompanionMinutes,
  recordCompanionLesson,
  setCompanionMood,
  getAdoptedAnimals,
  getLessonStory,
  StoryTicket,
} from './utils/story';
import { ElasticPlannerView } from './components/ElasticPlannerView';
import { BridgeOnboardingView } from './components/BridgeOnboardingView';
import { CurriculumView } from './components/CurriculumView';
import { CodingLabView } from './components/CodingLabView';
import { ExamSimulatorView } from './components/ExamSimulatorView';
import { FlashcardsAndCheatSheetView } from './components/FlashcardsAndCheatSheetView';
import { ShelterHomeView } from './components/story/ShelterHomeView';
import { MoodCheckInDialog } from './components/story/MoodCheckInDialog';
import { StoryUnlockDialog } from './components/story/StoryUnlockDialog';

type ActiveTab = 'shelter' | 'planner' | 'bridge' | 'curriculum' | 'coding-lab' | 'exam-prep' | 'flashcards';

export function App() {
  const [state, setState] = useState<UserAppState>(() => loadAppState());
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => (state.storyMode ? 'shelter' : 'planner'));
  const [activeLessonId, setActiveLessonId] = useState<string>('L01');
  const [activeChallengeId, setActiveChallengeId] = useState<string>('C01');
  const [activeQuestionId, setActiveQuestionId] = useState<string>('Q01');
  const [filterWrongOnly, setFilterWrongOnly] = useState<boolean>(false);

  // Built-in Focus Study Timer
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);

  // Story layer dialogs
  const [checkInOpen, setCheckInOpen] = useState<boolean>(
    () => state.storyMode && state.lastCheckInDate !== getTodayDateStr()
  );
  const [unlockLessonId, setUnlockLessonId] = useState<string | null>(null);

  // Backup / Restore Dialog Ref
  const backupDialogRef = useRef<HTMLDialogElement | null>(null);
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [importFeedback, setImportFeedback] = useState<{ text: string; ok: boolean } | null>(null);

  // Persist state on every update
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  // Modern Web Guidance mandatory fallback for <dialog closedby="any">
  useEffect(() => {
    const dialog = backupDialogRef.current;
    if (!dialog) return;
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      const handleBackdropClick = (event: MouseEvent) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;
        if (isDialogContent) return;
        dialog.close();
      };
      dialog.addEventListener('click', handleBackdropClick);
      return () => dialog.removeEventListener('click', handleBackdropClick);
    }
  }, []);

  // Study timer effect (also feeds the companion log)
  useEffect(() => {
    if (!timerRunning) return;
    const interval = window.setInterval(() => {
      setSessionSeconds((prev) => {
        const next = prev + 1;
        if (next % 60 === 0) {
          setState((s) =>
            addCompanionMinutes({ ...s, totalMinutesStudied: s.totalMinutesStudied + 1 }, getTodayDateStr(), 1)
          );
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning]);

  const handleToggleLessonComplete = (lessonId: string) => {
    const willComplete = !state.completedLessonIds.includes(lessonId);
    if (willComplete && state.storyMode && !state.seenStoryBeats.includes(lessonId) && getLessonStory(lessonId)) {
      setUnlockLessonId(lessonId);
    }
    setState((prev) => {
      if (prev.completedLessonIds.includes(lessonId)) {
        return { ...prev, completedLessonIds: prev.completedLessonIds.filter((id) => id !== lessonId) };
      }
      const today = getTodayDateStr();
      let next: UserAppState = {
        ...prev,
        completedLessonIds: [...prev.completedLessonIds, lessonId],
        totalMinutesStudied: prev.totalMinutesStudied + 15,
        seenStoryBeats: prev.seenStoryBeats.includes(lessonId) ? prev.seenStoryBeats : [...prev.seenStoryBeats, lessonId],
      };
      next = addCompanionMinutes(next, today, 15);
      return recordCompanionLesson(next, today, lessonId);
    });
  };

  const handleSaveNote = (lessonId: string, note: string) => {
    setState((prev) => ({
      ...prev,
      lessonNotes: {
        ...prev.lessonNotes,
        [lessonId]: note,
      },
    }));
  };

  const handleSaveChallengeSubmission = (
    challengeId: string,
    userCode: string,
    passedAllRules: boolean,
    passedRuleIds: string[],
    viewedSolution: boolean
  ) => {
    setState((prev) => ({
      ...prev,
      challengeSubmissions: {
        ...prev.challengeSubmissions,
        [challengeId]: {
          challengeId,
          userCode,
          passedAllRules,
          passedRuleIds,
          viewedSolution,
          updatedAt: Date.now(),
        },
      },
    }));
  };

  const handleRecordQuestionAttempt = (
    questionId: string,
    selectedOptionIds: ('A' | 'B' | 'C' | 'D' | 'E')[],
    isCorrect: boolean
  ) => {
    setState((prev) => {
      const prevAttempt = prev.questionAttempts[questionId];
      return {
        ...prev,
        questionAttempts: {
          ...prev.questionAttempts,
          [questionId]: {
            questionId,
            selectedOptionIds,
            isCorrect,
            timestamp: Date.now(),
            attemptsCount: (prevAttempt?.attemptsCount || 0) + 1,
            wrongStreak: isCorrect ? 0 : (prevAttempt?.wrongStreak || 0) + 1,
            masteredFromWrongBook: isCorrect ? true : prevAttempt?.masteredFromWrongBook || false,
          },
        },
      };
    });
  };

  const handleToggleBookmark = (questionId: string) => {
    setState((prev) => {
      const exists = prev.bookmarkedQuestionIds.includes(questionId);
      return {
        ...prev,
        bookmarkedQuestionIds: exists
          ? prev.bookmarkedQuestionIds.filter((id) => id !== questionId)
          : [...prev.bookmarkedQuestionIds, questionId],
      };
    });
  };

  const handleMarkWrongMastered = (questionId: string) => {
    setState((prev) => {
      const existing = prev.questionAttempts[questionId];
      if (!existing) return prev;
      return {
        ...prev,
        questionAttempts: {
          ...prev.questionAttempts,
          [questionId]: {
            ...existing,
            masteredFromWrongBook: true,
          },
        },
      };
    });
  };

  const handleAddCustomQuestion = (q: ExamQuestion) => {
    setState((prev) => ({
      ...prev,
      customQuestions: [...prev.customQuestions, q],
    }));
  };

  const handleRateFlashcard = (cardId: string, confidence: 'again' | 'hard' | 'good' | 'easy') => {
    setState((prev) => {
      const existing = prev.flashcardStates[cardId];
      return {
        ...prev,
        flashcardStates: {
          ...prev.flashcardStates,
          [cardId]: {
            cardId,
            confidence,
            nextReviewAt: Date.now() + 86400000,
            reviewCount: (existing?.reviewCount || 0) + 1,
          },
        },
      };
    });
  };

  const handleExportJson = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forcecraft-study-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (parsed && Array.isArray(parsed.completedLessonIds)) {
        setState({ ...INITIAL_APP_STATE, ...parsed });
        setImportFeedback({ text: '学习档案已恢复', ok: true });
      } else {
        setImportFeedback({ text: 'JSON 格式不完整，缺少必要字段', ok: false });
      }
    } catch {
      setImportFeedback({ text: 'JSON 解析失败，请检查内容是否完整', ok: false });
    }
  };

  const allQuestionsCount = EXAM_QUESTIONS.length + state.customQuestions.length;
  const completedChallengesCount = Object.values(state.challengeSubmissions).filter((s) => s.passedAllRules).length;
  const completedBridgeCount = BRIDGE_LESSONS.filter((l) => state.completedLessonIds.includes(l.id)).length;
  const wrongBookCount = Object.values(state.questionAttempts).filter(
    (a) => !a.isCorrect && !a.masteredFromWrongBook
  ).length;
  const adoptedCount = getAdoptedAnimals(state.completedLessonIds).length;
  const pacingMinutes = state.todayAvailableMinutesOverride ?? getPacingConfig(state.pacingMode).defaultMinutes;

  const readinessScore = Math.round(
    ((state.completedLessonIds.length / CURRICULUM_LESSONS.length) * 0.4 +
      (completedChallengesCount / CODING_CHALLENGES.length) * 0.3 +
      (Object.values(state.questionAttempts).filter((a) => a.isCorrect).length / allQuestionsCount) * 0.3) *
      100
  );

  const handleOpenTicket = (ticket: StoryTicket) => {
    if (ticket.type === 'lesson') {
      setActiveLessonId(ticket.targetId);
      setActiveTab('curriculum');
    } else if (ticket.type === 'challenge') {
      setActiveChallengeId(ticket.targetId);
      setActiveTab('coding-lab');
    } else if (ticket.type === 'questions') {
      setActiveQuestionId(ticket.targetId);
      setFilterWrongOnly(wrongBookCount > 0);
      setActiveTab('exam-prep');
    } else {
      setActiveTab('flashcards');
    }
  };

  const handleSetStoryMode = (on: boolean) => {
    setState((prev) => ({ ...prev, storyMode: on }));
    setActiveTab(on ? 'shelter' : 'planner');
  };

  const handleChooseMood = (mood: Mood) => {
    const option = MOOD_OPTIONS.find((o) => o.mood === mood);
    const today = getTodayDateStr();
    setState((prev) => {
      let next = setCompanionMood({ ...prev, lastCheckInDate: today }, today, mood);
      if (option && option.minutes !== null) {
        next = { ...next, todayAvailableMinutesOverride: option.minutes };
      }
      return next;
    });
  };

  const handleCloseCheckIn = useCallback((mood: Mood | null) => {
    setCheckInOpen(false);
    setState((prev) => ({ ...prev, lastCheckInDate: getTodayDateStr() }));
    if (mood === 'drift') {
      setActiveTab('shelter');
      window.setTimeout(() => {
        document.getElementById('adoption-wall')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  }, []);

  const handleCloseUnlock = useCallback(() => setUnlockLessonId(null), []);

  const unlockStory = unlockLessonId ? getLessonStory(unlockLessonId) ?? null : null;

  const navItem = (tab: ActiveTab, icon: React.ReactNode, label: string, badge: React.ReactNode, onClick?: () => void) => (
    <li>
      <button
        type="button"
        className={`nav-item-btn ${activeTab === tab ? 'active' : ''}`}
        onClick={onClick ?? (() => setActiveTab(tab))}
      >
        <span className="nav-item-left">
          <span className="nav-icon-slot">{icon}</span>
          <span>{label}</span>
        </span>
        <span className="nav-badge">{badge}</span>
      </button>
    </li>
  );

  return (
    <div className="app-shell">
      {/* Left Navigation Sidebar */}
      <aside className="sidebar" aria-label="主导航">
        <div className="brand-header">
          <div className="brand-glyph" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 3.5H13M3 8H10.5M3 12.5H7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="brand-title">ForceCraft</div>
            <div className="brand-subtitle">
              {state.storyMode ? '窝窝救助站 · 技术志愿者' : 'PD1 · PD2 本地备考工作台'}
            </div>
          </div>
        </div>

        <div className="nav-section-title">学习工作台</div>
        <ul className="nav-list">
          {state.storyMode &&
            navItem('shelter', <Home size={16} strokeWidth={1.5} />, '窝窝救助站', `${adoptedCount}/${CURRICULUM_LESSONS.length}`)}
          {navItem('planner', <Calendar size={16} strokeWidth={1.5} />, '每日学习计划', `${pacingMinutes}m`)}
          {navItem(
            'bridge',
            <Compass size={16} strokeWidth={1.5} />,
            'ADM + 编程先导营',
            `${completedBridgeCount}/${BRIDGE_LESSONS.length}`
          )}
          {navItem(
            'curriculum',
            <BookOpen size={16} strokeWidth={1.5} />,
            '体系课程库',
            `${state.completedLessonIds.length}/${CURRICULUM_LESSONS.length}`
          )}
          {navItem(
            'coding-lab',
            <Code2 size={16} strokeWidth={1.5} />,
            '编程实战实验室',
            `${completedChallengesCount}/${CODING_CHALLENGES.length}`
          )}
          {navItem('exam-prep', <HelpCircle size={16} strokeWidth={1.5} />, 'PD1 / PD2 认证题库', allQuestionsCount, () => {
            setFilterWrongOnly(false);
            setActiveTab('exam-prep');
          })}
          {navItem('flashcards', <Layers size={16} strokeWidth={1.5} />, '闪卡与速查表', FLASHCARDS_DATA.length)}
        </ul>

        {/* Sidebar Footer: Exam Readiness & Backup */}
        <div className="sidebar-footer">
          <div className="exam-readiness-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>考场准备度</span>
              <span
                className="tabular"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: readinessScore >= 68 ? 'var(--color-positive)' : 'var(--text-primary)',
                }}
              >
                {readinessScore}%
              </span>
            </div>
            <div className="progress-track">
              <div
                className={`progress-fill ${readinessScore >= 68 ? 'success' : ''}`}
                style={{ width: `${Math.max(4, readinessScore)}%` }}
              />
            </div>
            <div className="tabular" style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
              官方通过线 68% · 本地自动保存
            </div>
          </div>

          <button
            type="button"
            className="btn-secondary"
            style={{ width: '100%' }}
            onClick={() => {
              setImportJsonText(JSON.stringify(state, null, 2));
              setImportFeedback(null);
              backupDialogRef.current?.showModal();
            }}
          >
            <Download size={16} strokeWidth={1.5} /> 备份与恢复数据
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-area">
        <header className="top-bar">
          <div className="top-bar-left">
            {state.storyMode ? (
              <span className="top-bar-meta">
                已回家 <strong>{adoptedCount} 只</strong>
              </span>
            ) : (
              <span className="top-bar-meta">
                考纲覆盖 <strong>{allQuestionsCount} 题</strong>
              </span>
            )}
            <span className="meta-divider" aria-hidden="true" />
            <span className="top-bar-meta">
              累计学习 <strong>{state.totalMinutesStudied}m</strong>
            </span>
          </div>

          <div className="top-bar-right">
            <div role="group" aria-label="界面模式" className="pill-tab-group">
              <button
                type="button"
                className={`pill-tab ${state.storyMode ? 'selected' : ''}`}
                onClick={() => handleSetStoryMode(true)}
              >
                窝窝
              </button>
              <button
                type="button"
                className={`pill-tab ${!state.storyMode ? 'selected' : ''}`}
                onClick={() => handleSetStoryMode(false)}
              >
                专注备考
              </button>
            </div>

            <div role="group" aria-label="语言显示模式切换" className="pill-tab-group">
              {(
                [
                  { id: 'bilingual', label: '中英双语' },
                  { id: 'en-exam', label: 'EN 考场' },
                  { id: 'zh', label: '中文精析' },
                ] as { id: LanguageMode; label: string }[]
              ).map((mode) => {
                const active = (state.languageMode || 'bilingual') === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    className={`pill-tab ${active ? 'selected' : ''}`}
                    onClick={() => setState((prev) => ({ ...prev, languageMode: mode.id }))}
                  >
                    {mode.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className={timerRunning ? 'btn-primary' : 'btn-secondary'}
              style={{ minHeight: '32px', padding: '4px 12px' }}
              onClick={() => setTimerRunning((r) => !r)}
            >
              {timerRunning ? <Pause size={16} strokeWidth={1.5} /> : <Play size={16} strokeWidth={1.5} />}
              <span className="tabular">
                {timerRunning
                  ? `计时中 ${Math.floor(sessionSeconds / 60)}:${String(sessionSeconds % 60).padStart(2, '0')}`
                  : '专注计时'}
              </span>
            </button>
          </div>
        </header>

        <main className="workspace-container">
          {activeTab === 'shelter' && state.storyMode && (
            <ShelterHomeView state={state} onOpenTicket={handleOpenTicket} />
          )}

          {activeTab === 'planner' && (
            <ElasticPlannerView
              state={state}
              onUpdateState={setState}
              storyMode={state.storyMode}
              onOpenTicket={handleOpenTicket}
              onNavigateToLesson={(lessonId) => {
                setActiveLessonId(lessonId);
                setActiveTab('curriculum');
              }}
              onNavigateToChallenge={(challengeId) => {
                setActiveChallengeId(challengeId);
                setActiveTab('coding-lab');
              }}
              onNavigateToQuestion={(questionId, wrongOnly) => {
                setActiveQuestionId(questionId);
                setFilterWrongOnly(Boolean(wrongOnly));
                setActiveTab('exam-prep');
              }}
              onNavigateToFlashcards={() => setActiveTab('flashcards')}
              onNavigateToBridge={() => setActiveTab('bridge')}
            />
          )}

          {activeTab === 'bridge' && (
            <BridgeOnboardingView
              state={state}
              onNavigateToLesson={(lessonId) => {
                setActiveLessonId(lessonId);
                setActiveTab('curriculum');
              }}
              onNavigateToChallenge={(challengeId) => {
                setActiveChallengeId(challengeId);
                setActiveTab('coding-lab');
              }}
              onNavigateToQuestion={(questionId) => {
                setActiveQuestionId(questionId);
                setFilterWrongOnly(false);
                setActiveTab('exam-prep');
              }}
            />
          )}

          {activeTab === 'curriculum' && (
            <CurriculumView
              state={state}
              activeLessonId={activeLessonId}
              onSelectLesson={setActiveLessonId}
              onToggleLessonComplete={handleToggleLessonComplete}
              onSaveNote={handleSaveNote}
              onNavigateToChallenge={(challengeId) => {
                setActiveChallengeId(challengeId);
                setActiveTab('coding-lab');
              }}
              onNavigateToQuestion={(questionId) => {
                setActiveQuestionId(questionId);
                setFilterWrongOnly(false);
                setActiveTab('exam-prep');
              }}
            />
          )}

          {activeTab === 'coding-lab' && (
            <CodingLabView
              state={state}
              activeChallengeId={activeChallengeId}
              onSelectChallenge={setActiveChallengeId}
              onSaveSubmission={handleSaveChallengeSubmission}
            />
          )}

          {activeTab === 'exam-prep' && (
            <ExamSimulatorView
              state={state}
              activeQuestionId={activeQuestionId}
              initialFilterWrongOnly={filterWrongOnly}
              onSelectQuestion={setActiveQuestionId}
              onRecordAttempt={handleRecordQuestionAttempt}
              onToggleBookmark={handleToggleBookmark}
              onMarkWrongMastered={handleMarkWrongMastered}
              onAddCustomQuestion={handleAddCustomQuestion}
            />
          )}

          {activeTab === 'flashcards' && (
            <FlashcardsAndCheatSheetView state={state} onRateFlashcard={handleRateFlashcard} />
          )}
        </main>
      </div>

      <MoodCheckInDialog open={checkInOpen} onChoose={handleChooseMood} onClose={handleCloseCheckIn} />

      <StoryUnlockDialog
        story={unlockStory}
        reflection={unlockLessonId ? state.reflections[unlockLessonId] || '' : ''}
        onSaveReflection={(text) => {
          if (!unlockLessonId) return;
          setState((prev) => ({ ...prev, reflections: { ...prev.reflections, [unlockLessonId]: text } }));
        }}
        onClose={handleCloseUnlock}
      />

      {/* Native <dialog closedby="any"> for Data Backup / Import / Reset */}
      <dialog
        ref={backupDialogRef}
        {...({ closedby: 'any' } as React.DialogHTMLAttributes<HTMLDialogElement>)}
        className="linear-dialog"
        aria-labelledby="backupDialogTitle"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 id="backupDialogTitle" className="headline-md">本地学习档案备份与恢复</h2>
          <button type="button" className="btn-tertiary" onClick={() => backupDialogRef.current?.close()}>
            <span>关闭</span>
            <kbd className="keycap">Esc</kbd>
          </button>
        </div>

        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          所有学习进度、笔记、代码提交记录、错题本、自定义考题与陪伴日志均自动保存在当前浏览器的{' '}
          <code>localStorage</code> 中，可随时导出为 JSON 文件归档。
        </p>

        <textarea
          className="code-editor-textarea"
          style={{ minHeight: '180px', marginBottom: '12px' }}
          value={importJsonText}
          onChange={(e) => setImportJsonText(e.target.value)}
        />

        {importFeedback && (
          <div
            style={{
              fontSize: '13px',
              marginBottom: '12px',
              color: importFeedback.ok ? 'var(--color-positive)' : 'var(--color-negative)',
            }}
          >
            {importFeedback.text}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setState(INITIAL_APP_STATE);
              setImportJsonText(JSON.stringify(INITIAL_APP_STATE, null, 2));
              setImportFeedback({ text: '已重置为初始默认状态', ok: true });
            }}
          >
            <RotateCcw size={16} strokeWidth={1.5} /> 重置初始进度
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn-secondary" onClick={handleImportJson}>
              <Upload size={16} strokeWidth={1.5} /> 从 JSON 恢复
            </button>
            <button type="button" className="btn-primary" onClick={handleExportJson}>
              <Download size={16} strokeWidth={1.5} /> 下载备份文件
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
export default App;
```

- [ ] **Step 2: 构建** — Run: `npm run build`。Expected: `✓ built`，0 TypeScript 错误。
- [ ] **Step 3: 测试** — Run: `npm test`。Expected: 全部 PASS。
- [ ] **Step 4: Commit** — `git add -A && git commit -m "feat(story): wire shelter home, check-in, unlock and story mode toggle"`

---

### Task 10: 视觉验证与发布

- [ ] **Step 1: 截图首页（新访客，签到弹窗应出现）**

Run: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --window-size=1440,960 --hide-scrollbars --screenshot=/tmp/wowo-checkin.png http://localhost:5188/`
Expected: 签到弹窗居中，4 个选项可见。

- [ ] **Step 2: 截图已签到首页**（通过 puppeteer 设置 `localStorage` 中 `lastCheckInDate` 为今天后重载）
Expected: 平面图点亮门厅外区域为暗；工单 3 张；领养墙中 L01 豆包为彩色，其余为灰度。

- [ ] **Step 3: 确认无连续打卡与「差 X%」** — `grep -rn "streakDays\|差 \${" src/components src/App.tsx` 只应命中类型/存储层，不出现在 UI。

- [ ] **Step 4: 推送** — `git push`

---

## Self-Review

1. **Spec coverage**：世界观/角色 → Task 3；20 讲剧情 → Task 3；工单 → Task 4/6/8；首页平面图/领养墙/陪伴日志 → Task 6/7；签到 → Task 3/7/9；课后结局与一句话 → Task 7/9；专注备考模式 → Task 9；移除打卡/差距 → Task 8/9；测试 → Task 1/3/4；暖色 token → Task 5。
2. **偏差说明**：spec 写未领养动物显示「空相框 + 首字」，本计划改为「灰度半透明画像 + 还在等你」，让用户看到正在等待的具体小动物，情感牵引更强；已同步更新 spec。
3. **类型一致**：`StoryTicket`、`ChapterProgress`、`LessonStory`、`MoodOption.speakerId`、`CompanionLogEntry` 在定义与使用处一致；`ticketsFromPlan(tasks, Pick<UserAppState,'questionAttempts'>)` 在测试、首页、计划页调用一致。
