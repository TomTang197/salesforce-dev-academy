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
  recordCompanionActivity,
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
import { BackupReminder } from './components/story/BackupReminder';
import { rateCard } from './utils/srs';
import { shouldRemindBackup, hasMeaningfulProgress, daysSince, snoozeUntil } from './utils/backup';
import {
  FileSyncStatus,
  supportsFileSync,
  loadSavedHandle,
  chooseBackupFile,
  getPermission,
  writeBackup,
  forgetHandle,
  requestPersistentStorage,
} from './utils/backupFile';

const FILE_SYNC_KEY = 'forcecraft_last_file_sync';

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

  // Local-file backup sync (File System Access API, progressive enhancement)
  const fileHandleRef = useRef<FileSystemFileHandle | null>(null);
  const [fileSyncStatus, setFileSyncStatus] = useState<FileSyncStatus>(() =>
    supportsFileSync() ? 'off' : 'unsupported'
  );
  const [lastFileSyncAt, setLastFileSyncAt] = useState<number | null>(() => {
    const raw = localStorage.getItem(FILE_SYNC_KEY);
    return raw ? Number(raw) : null;
  });

  const syncToFile = useCallback(async (snapshot: UserAppState) => {
    const handle = fileHandleRef.current;
    if (!handle) return;
    try {
      await writeBackup(handle, JSON.stringify(snapshot, null, 2));
      const at = Date.now();
      localStorage.setItem(FILE_SYNC_KEY, String(at));
      setLastFileSyncAt(at);
    } catch {
      setFileSyncStatus('needs-permission');
    }
  }, []);

  useEffect(() => {
    requestPersistentStorage();
    loadSavedHandle().then(async (handle) => {
      if (!handle) return;
      fileHandleRef.current = handle;
      setFileSyncStatus((await getPermission(handle, false)) ? 'active' : 'needs-permission');
    });
  }, []);

  useEffect(() => {
    if (fileSyncStatus !== 'active') return;
    const timer = window.setTimeout(() => syncToFile(state), 1500);
    return () => window.clearTimeout(timer);
  }, [state, fileSyncStatus, syncToFile]);

  const handleEnableFileSync = async () => {
    const handle = await chooseBackupFile();
    if (!handle) return;
    fileHandleRef.current = handle;
    setFileSyncStatus('active');
    await syncToFile(state);
  };

  const handleResumeFileSync = async () => {
    const handle = fileHandleRef.current;
    if (!handle) return;
    if (await getPermission(handle as Parameters<typeof getPermission>[0], true)) {
      setFileSyncStatus('active');
      await syncToFile(state);
    }
  };

  const handleStopFileSync = async () => {
    await forgetHandle();
    fileHandleRef.current = null;
    setFileSyncStatus('off');
  };

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
    setState((prev) => recordCompanionActivity(prev, getTodayDateStr()));
  };

  const handleRecordQuestionAttempt = (
    questionId: string,
    selectedOptionIds: ('A' | 'B' | 'C' | 'D' | 'E')[],
    isCorrect: boolean
  ) => {
    setState((prev) => {
      const prevAttempt = prev.questionAttempts[questionId];
      const withActivity = recordCompanionActivity(prev, getTodayDateStr());
      return {
        ...withActivity,
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
      const withActivity = recordCompanionActivity(prev, getTodayDateStr());
      return {
        ...withActivity,
        flashcardStates: {
          ...prev.flashcardStates,
          [cardId]: rateCard(prev.flashcardStates[cardId], cardId, confidence, Date.now()),
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
    setState((prev) => ({ ...prev, lastBackupAt: Date.now(), backupReminderSnoozedUntil: null }));
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

  const nowMs = Date.now();
  const showBackupReminder =
    fileSyncStatus === 'needs-permission'
      ? hasMeaningfulProgress(state) &&
        !(state.backupReminderSnoozedUntil !== null && nowMs < state.backupReminderSnoozedUntil)
      : fileSyncStatus !== 'active' && shouldRemindBackup(state, nowMs, lastFileSyncAt);
  const lastAnyBackup = Math.max(state.lastBackupAt ?? 0, lastFileSyncAt ?? 0) || null;

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
            {fileSyncStatus === 'active' && lastFileSyncAt && (
              <div className="tabular" style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                已同步到本地文件 · {new Date(lastFileSyncAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
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
          {showBackupReminder && (
            <BackupReminder
              daysSinceBackup={daysSince(lastAnyBackup, nowMs)}
              fileSyncStatus={fileSyncStatus}
              onDownload={handleExportJson}
              onEnableFileSync={handleEnableFileSync}
              onResumeFileSync={handleResumeFileSync}
              onSnooze={() => setState((prev) => ({ ...prev, backupReminderSnoozedUntil: snoozeUntil(Date.now()) }))}
            />
          )}
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

        {fileSyncStatus !== 'unsupported' && (
          <div className="surface-panel-inset" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '12px', padding: '12px 16px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {fileSyncStatus === 'active'
                ? '正在自动同步到你选择的本地文件，每次改动后约 2 秒写入。'
                : fileSyncStatus === 'needs-permission'
                ? '自动同步已暂停，需要重新授权写入本地文件。'
                : '可以选一个本地文件，之后每次学习都会自动写入备份。'}
            </span>
            {fileSyncStatus === 'active' ? (
              <button type="button" className="btn-tertiary" onClick={handleStopFileSync}>停止同步</button>
            ) : fileSyncStatus === 'needs-permission' ? (
              <button type="button" className="btn-secondary" onClick={handleResumeFileSync}>继续同步</button>
            ) : (
              <button type="button" className="btn-secondary" onClick={handleEnableFileSync}>选择同步文件</button>
            )}
          </div>
        )}

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
