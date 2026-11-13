export type StudyStage = 'bridge' | 'beginner' | 'intermediate' | 'advanced' | 'architect';

export type LanguageMode = 'bilingual' | 'en-exam' | 'zh';

export type TechDomain =
  | 'Apex 核心与面向对象 (Apex & OOP)'
  | 'SOQL & SOSL 数据查询 (Data Query)'
  | 'LWC 现代前端组件 (Lightning Web Components)'
  | 'Trigger 与执行顺序 (Triggers & Order of Execution)'
  | '异步 Apex 与集成架构 (Async Apex & Integration)'
  | '安全模型与单元测试 (Security & Testing)';

export type ExamWeightDomain =
  | 'Process Automation & Logic (30%)'
  | 'User Interface / LWC (25%)'
  | 'Data Management & SOQL (25%)'
  | 'Testing, Debugging & Deployment (20%)';

export type PacingMode = 'relaxed' | 'standard' | 'intensive' | 'weekend';

export interface CodeComparison {
  title: string;
  antiPatternLabel: string;
  antiPatternCode: string;
  bestPracticeLabel: string;
  bestPracticeCode: string;
  explanation: string;
}

export interface ExamGlossaryTerm {
  termEn: string;
  meaningZh: string;
  examSignalPhraseEn: string;
}

export interface CurriculumLesson {
  id: string;
  daySuggested: number;
  stage: StudyStage;
  domain: TechDomain;
  examDomain: ExamWeightDomain;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  estimatedMinutes: number;
  examFrequency: '极高频必考 (High-Yield)' | '高频核心 (Core)' | '进阶拉分 (Advanced)' | '架构拔高 (Architect)';
  summary: string;
  summaryEn: string;
  examGlossary: ExamGlossaryTerm[];
  coreConcepts: {
    heading: string;
    content: string;
    codeSnippet?: string;
    language?: 'apex' | 'soql' | 'javascript' | 'html' | 'xml';
  }[];
  codeComparison: CodeComparison;
  examTraps: string[];
  linkedChallengeId?: string;
  linkedQuestionIds: string[];
}

export interface AcceptanceRule {
  id: string;
  label: string;
  description: string;
  /** Regex pattern(s) that must match (case-insensitive) */
  mustMatch: string[];
  /** Regex pattern(s) that must NOT match (e.g. SOQL inside loop) */
  mustNotMatch?: string[];
}

export interface CodingChallenge {
  id: string;
  title: string;
  titleEn?: string;
  stage: StudyStage;
  category: 'SOQL' | 'Apex' | 'LWC';
  domain: TechDomain;
  estimatedMinutes: number;
  scenario: string;
  scenarioEn?: string;
  taskRequirements: string[];
  starterCode: string;
  secondaryStarterCode?: {
    filename: string;
    code: string;
  };
  hints: [string, string, string];
  acceptanceRules: AcceptanceRule[];
  referenceSolution: string;
  secondaryReferenceSolution?: {
    filename: string;
    code: string;
  };
  solutionWalkthrough: {
    lineOrBlock: string;
    explanation: string;
  }[];
  governorLimitImpact: string;
  mockOutputPreview: {
    type: 'table' | 'logs' | 'lwc-preview';
    columns?: string[];
    rows?: Record<string, string | number | boolean>[];
    logs?: string[];
    componentSummary?: string;
  };
}

export interface ExamOption {
  id: 'A' | 'B' | 'C' | 'D' | 'E';
  textEn: string;
  text: string;
  whyRightOrWrong: string;
}

export interface ExamQuestion {
  id: string;
  certLevel: 'PD1' | 'PD2';
  stage: StudyStage;
  domain: TechDomain;
  examDomain: ExamWeightDomain;
  questionType: 'single' | 'multiple';
  selectCount: number;
  scenarioEn: string;
  scenario: string;
  codeBlock?: string;
  options: ExamOption[];
  correctOptionIds: ('A' | 'B' | 'C' | 'D' | 'E')[];
  coreTakeaway: string;
  officialDocTopic: string;
  isCustom?: boolean;
}

export interface FlashcardItem {
  id: string;
  category: 'Governor Limits' | 'Order of Execution' | 'LWC Decorators & Lifecycle' | 'Async Apex' | 'SOQL & Security';
  frontTitle: string;
  frontTitleEn: string;
  frontPrompt: string;
  frontPromptEn: string;
  backAnswer: string;
  backAnswerEn: string;
  examTip: string;
}

export interface DailyStudyLog {
  date: string; // YYYY-MM-DD
  minutesStudied: number;
  completedLessonIds: string[];
  completedChallengeIds: string[];
  answeredQuestionIds: string[];
  status: 'active' | 'rebalanced-rest' | 'completed';
}

export interface QuestionAttempt {
  questionId: string;
  selectedOptionIds: ('A' | 'B' | 'C' | 'D' | 'E')[];
  isCorrect: boolean;
  timestamp: number;
  attemptsCount: number;
  wrongStreak: number;
  masteredFromWrongBook?: boolean;
}

export interface ChallengeSubmission {
  challengeId: string;
  userCode: string;
  passedAllRules: boolean;
  passedRuleIds: string[];
  viewedSolution: boolean;
  updatedAt: number;
}

export interface FlashcardReviewState {
  cardId: string;
  confidence: 'unseen' | 'again' | 'hard' | 'good' | 'easy';
  nextReviewAt: number;
  reviewCount: number;
}

export interface UserAppState {
  languageMode: LanguageMode;
  pacingMode: PacingMode;
  dailyTargetMinutes: number;
  todayAvailableMinutesOverride: number | null;
  targetExam: 'PD1' | 'PD1+PD2';
  examDate: string;
  streakDays: number;
  totalMinutesStudied: number;
  completedLessonIds: string[];
  lessonNotes: Record<string, string>;
  bookmarkedQuestionIds: string[];
  questionAttempts: Record<string, QuestionAttempt>;
  challengeSubmissions: Record<string, ChallengeSubmission>;
  flashcardStates: Record<string, FlashcardReviewState>;
  customQuestions: ExamQuestion[];
  dailyLogs: Record<string, DailyStudyLog>;
  rebalancedDaysCount: number;
  storyMode: boolean;
  companionLog: Record<string, CompanionLogEntry>;
  seenStoryBeats: string[];
  lastCheckInDate: string | null;
  reflections: Record<string, string>;
}

export type Mood = 'tired' | 'calm' | 'energized' | 'drift';

export interface CompanionLogEntry {
  minutes: number;
  mood?: Mood;
  completedLessonIds: string[];
}
