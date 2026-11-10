import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { UserAppState, ExamQuestion, LanguageMode } from './types';
import { CURRICULUM_LESSONS } from './data/curriculum';
import { BRIDGE_LESSONS } from './data/bridgeOnboarding';
import { CODING_CHALLENGES } from './data/challenges';
import { EXAM_QUESTIONS } from './data/questions';
import { FLASHCARDS_DATA } from './data/flashcards';
import {
  loadAppState,
  saveAppState,
  INITIAL_APP_STATE,
  getPacingConfig,
} from './utils/storageAndPlanner';
import { ElasticPlannerView } from './components/ElasticPlannerView';
import { BridgeOnboardingView } from './components/BridgeOnboardingView';
import { CurriculumView } from './components/CurriculumView';
import { CodingLabView } from './components/CodingLabView';
import { ExamSimulatorView } from './components/ExamSimulatorView';
import { FlashcardsAndCheatSheetView } from './components/FlashcardsAndCheatSheetView';

type ActiveTab = 'planner' | 'bridge' | 'curriculum' | 'coding-lab' | 'exam-prep' | 'flashcards';

export function App() {
  const [state, setState] = useState<UserAppState>(() => loadAppState());
  const [activeTab, setActiveTab] = useState<ActiveTab>('planner');
  const [activeLessonId, setActiveLessonId] = useState<string>('L01');
  const [activeChallengeId, setActiveChallengeId] = useState<string>('C01');
  const [activeQuestionId, setActiveQuestionId] = useState<string>('Q01');
  const [filterWrongOnly, setFilterWrongOnly] = useState<boolean>(false);

  // Built-in Focus Study Timer
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);

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

  // Study timer effect
  useEffect(() => {
    if (!timerRunning) return;
    const interval = window.setInterval(() => {
      setSessionSeconds((prev) => {
        const next = prev + 1;
        if (next % 60 === 0) {
          setState((s) => ({
            ...s,
            totalMinutesStudied: s.totalMinutesStudied + 1,
          }));
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning]);

  const handleToggleLessonComplete = (lessonId: string) => {
    setState((prev) => {
      const exists = prev.completedLessonIds.includes(lessonId);
      const nextCompleted = exists
        ? prev.completedLessonIds.filter((id) => id !== lessonId)
        : [...prev.completedLessonIds, lessonId];
      return {
        ...prev,
        completedLessonIds: nextCompleted,
        totalMinutesStudied: exists
          ? prev.totalMinutesStudied
          : prev.totalMinutesStudied + 15,
      };
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
            masteredFromWrongBook: isCorrect
              ? true
              : prevAttempt?.masteredFromWrongBook || false,
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

  const handleRateFlashcard = (
    cardId: string,
    confidence: 'again' | 'hard' | 'good' | 'easy'
  ) => {
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
  const completedChallengesCount = Object.values(
    state.challengeSubmissions
  ).filter((s) => s.passedAllRules).length;
  const completedBridgeCount = BRIDGE_LESSONS.filter((l) =>
    state.completedLessonIds.includes(l.id)
  ).length;
  const pacingMinutes =
    state.todayAvailableMinutesOverride ??
    getPacingConfig(state.pacingMode).defaultMinutes;

  const readinessScore = Math.round(
    ((state.completedLessonIds.length / CURRICULUM_LESSONS.length) * 0.4 +
      (completedChallengesCount / CODING_CHALLENGES.length) * 0.3 +
      (Object.values(state.questionAttempts).filter((a) => a.isCorrect).length /
        allQuestionsCount) *
        0.3) *
      100
  );

  return (
    <div className="app-shell">
      {/* Left Navigation Sidebar */}
      <aside className="sidebar" aria-label="主导航">
        <div className="brand-header">
          <div className="brand-glyph" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 3.5H13M3 8H10.5M3 12.5H7.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <div className="brand-title">ForceCraft</div>
            <div className="brand-subtitle">PD1 · PD2 本地备考工作台</div>
          </div>
        </div>

        <div className="nav-section-title">学习工作台</div>
        <ul className="nav-list">
          <li>
            <button
              type="button"
              className={`nav-item-btn ${activeTab === 'planner' ? 'active' : ''}`}
              onClick={() => setActiveTab('planner')}
            >
              <span className="nav-item-left">
                <span className="nav-icon-slot">
                  <Calendar size={16} strokeWidth={1.5} />
                </span>
                <span>每日学习计划</span>
              </span>
              <span className="nav-badge">{pacingMinutes}m</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              className={`nav-item-btn ${activeTab === 'bridge' ? 'active' : ''}`}
              onClick={() => setActiveTab('bridge')}
            >
              <span className="nav-item-left">
                <span className="nav-icon-slot">
                  <Compass size={16} strokeWidth={1.5} />
                </span>
                <span>ADM + 编程先导营</span>
              </span>
              <span className="nav-badge">
                {completedBridgeCount}/{BRIDGE_LESSONS.length}
              </span>
            </button>
          </li>

          <li>
            <button
              type="button"
              className={`nav-item-btn ${activeTab === 'curriculum' ? 'active' : ''}`}
              onClick={() => setActiveTab('curriculum')}
            >
              <span className="nav-item-left">
                <span className="nav-icon-slot">
                  <BookOpen size={16} strokeWidth={1.5} />
                </span>
                <span>体系课程库</span>
              </span>
              <span className="nav-badge">
                {state.completedLessonIds.length}/{CURRICULUM_LESSONS.length}
              </span>
            </button>
          </li>

          <li>
            <button
              type="button"
              className={`nav-item-btn ${activeTab === 'coding-lab' ? 'active' : ''}`}
              onClick={() => setActiveTab('coding-lab')}
            >
              <span className="nav-item-left">
                <span className="nav-icon-slot">
                  <Code2 size={16} strokeWidth={1.5} />
                </span>
                <span>编程实战实验室</span>
              </span>
              <span className="nav-badge">
                {completedChallengesCount}/{CODING_CHALLENGES.length}
              </span>
            </button>
          </li>

          <li>
            <button
              type="button"
              className={`nav-item-btn ${activeTab === 'exam-prep' ? 'active' : ''}`}
              onClick={() => {
                setFilterWrongOnly(false);
                setActiveTab('exam-prep');
              }}
            >
              <span className="nav-item-left">
                <span className="nav-icon-slot">
                  <HelpCircle size={16} strokeWidth={1.5} />
                </span>
                <span>PD1 / PD2 认证题库</span>
              </span>
              <span className="nav-badge">{allQuestionsCount}</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              className={`nav-item-btn ${activeTab === 'flashcards' ? 'active' : ''}`}
              onClick={() => setActiveTab('flashcards')}
            >
              <span className="nav-item-left">
                <span className="nav-icon-slot">
                  <Layers size={16} strokeWidth={1.5} />
                </span>
                <span>闪卡与速查表</span>
              </span>
              <span className="nav-badge">{FLASHCARDS_DATA.length}</span>
            </button>
          </li>
        </ul>

        {/* Sidebar Footer: Overall Exam Readiness & Backup */}
        <div className="sidebar-footer">
          <div className="exam-readiness-box">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                综合备考指数
              </span>
              <span
                className="tabular"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: 500,
                  color:
                    readinessScore >= 68
                      ? 'var(--color-positive)'
                      : 'var(--text-primary)',
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
            <div
              className="tabular"
              style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}
            >
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
        {/* Sticky Top Header */}
        <header className="top-bar">
          <div className="top-bar-left">
            <span className="top-bar-meta">
              连续打卡 <strong>{state.streakDays}d</strong>
            </span>
            <span className="meta-divider" aria-hidden="true" />
            <span className="top-bar-meta">
              累计学习 <strong>{state.totalMinutesStudied}m</strong>
            </span>
            <span className="meta-divider" aria-hidden="true" />
            <span className="top-bar-meta">
              考纲覆盖 <strong>{allQuestionsCount} 题</strong>
            </span>
          </div>

          <div className="top-bar-right">
            {/* Global Bilingual / EN Exam / ZH Switcher */}
            <div
              role="group"
              aria-label="语言显示模式切换"
              className="pill-tab-group"
            >
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
                    onClick={() =>
                      setState((prev) => ({ ...prev, languageMode: mode.id }))
                    }
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
              {timerRunning ? (
                <Pause size={16} strokeWidth={1.5} />
              ) : (
                <Play size={16} strokeWidth={1.5} />
              )}
              <span className="tabular">
                {timerRunning
                  ? `计时中 ${Math.floor(sessionSeconds / 60)}:${String(
                      sessionSeconds % 60
                    ).padStart(2, '0')}`
                  : '专注计时'}
              </span>
            </button>
          </div>
        </header>

        {/* Active Workspace View */}
        <main className="workspace-container">
          {activeTab === 'planner' && (
            <ElasticPlannerView
              state={state}
              onUpdateState={setState}
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
            <FlashcardsAndCheatSheetView
              state={state}
              onRateFlashcard={handleRateFlashcard}
            />
          )}
        </main>
      </div>

      {/* Native <dialog closedby="any"> for Data Backup / Import / Reset */}
      <dialog
        ref={backupDialogRef}
        {...({ closedby: 'any' } as React.DialogHTMLAttributes<HTMLDialogElement>)}
        className="linear-dialog"
        aria-labelledby="backupDialogTitle"
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <h2 id="backupDialogTitle" className="headline-md">
            本地学习档案备份与恢复
          </h2>
          <button
            type="button"
            className="btn-tertiary"
            onClick={() => backupDialogRef.current?.close()}
          >
            <span>关闭</span>
            <kbd className="keycap">Esc</kbd>
          </button>
        </div>

        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          所有学习进度、笔记、代码提交记录、错题本与自定义考题均自动保存在当前浏览器的{' '}
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
              color: importFeedback.ok
                ? 'var(--color-positive)'
                : 'var(--color-negative)',
            }}
          >
            {importFeedback.text}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
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
            <button
              type="button"
              className="btn-secondary"
              onClick={handleImportJson}
            >
              <Upload size={16} strokeWidth={1.5} /> 从 JSON 恢复
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleExportJson}
            >
              <Download size={16} strokeWidth={1.5} /> 下载备份文件
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
export default App;
