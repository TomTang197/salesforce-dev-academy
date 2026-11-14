import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  XCircle,
  Bookmark,
  Clock,
  Plus,
  Filter,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  UserAppState,
  ExamQuestion,
  TechDomain,
  ExamOption,
} from '../types';
import { EXAM_QUESTIONS, EXAM_BLUEPRINT_COVERAGE } from '../data/questions';
import {
  buildMockExam,
  certPool,
  mockExamMinutes,
  scoreByDomain,
  domainShortName,
  CertLevel,
} from '../utils/examBuilder';

interface ExamSimulatorViewProps {
  state: UserAppState;
  activeQuestionId: string;
  initialFilterWrongOnly?: boolean;
  onSelectQuestion: (qId: string) => void;
  onRecordAttempt: (
    qId: string,
    selectedIds: ('A' | 'B' | 'C' | 'D' | 'E')[],
    isCorrect: boolean
  ) => void;
  onToggleBookmark: (qId: string) => void;
  onMarkWrongMastered: (qId: string) => void;
  onAddCustomQuestion: (q: ExamQuestion) => void;
}

export const ExamSimulatorView: React.FC<ExamSimulatorViewProps> = ({
  state,
  activeQuestionId,
  initialFilterWrongOnly = false,
  onSelectQuestion,
  onRecordAttempt,
  onToggleBookmark,
  onMarkWrongMastered,
  onAddCustomQuestion,
}) => {
  const [mode, setMode] = useState<'practice' | 'mock-exam' | 'blueprint'>('practice');
  const [certFilter, setCertFilter] = useState<'ALL' | 'PD1' | 'PD2'>('ALL');
  const [domainFilter, setDomainFilter] = useState<'ALL' | TechDomain>('ALL');
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'UNANSWERED' | 'WRONG' | 'BOOKMARKED'
  >(initialFilterWrongOnly ? 'WRONG' : 'ALL');
  const [searchText, setSearchText] = useState<string>('');
  const [peekChineseInEnMode, setPeekChineseInEnMode] = useState<boolean>(false);

  const langMode = state.languageMode || 'bilingual';
  const allQuestions = [...EXAM_QUESTIONS, ...state.customQuestions];

  useEffect(() => {
    if (initialFilterWrongOnly) {
      setMode('practice');
      setStatusFilter('WRONG');
    }
  }, [initialFilterWrongOnly]);

  const filteredQuestions = allQuestions.filter((q) => {
    if (certFilter !== 'ALL' && q.certLevel !== certFilter) return false;
    if (domainFilter !== 'ALL' && q.domain !== domainFilter) return false;
    const attempt = state.questionAttempts[q.id];
    if (statusFilter === 'UNANSWERED' && attempt) return false;
    if (
      statusFilter === 'WRONG' &&
      (!attempt || attempt.isCorrect || attempt.masteredFromWrongBook)
    ) {
      return false;
    }
    if (
      statusFilter === 'BOOKMARKED' &&
      !state.bookmarkedQuestionIds.includes(q.id)
    ) {
      return false;
    }
    if (searchText.trim()) {
      const kw = searchText.toLowerCase();
      const matchId = q.id.toLowerCase().includes(kw);
      const matchZh = q.scenario.toLowerCase().includes(kw);
      const matchEn = (q.scenarioEn || '').toLowerCase().includes(kw);
      const matchTopic = q.officialDocTopic.toLowerCase().includes(kw);
      if (!matchId && !matchZh && !matchEn && !matchTopic) return false;
    }
    return true;
  });

  const currentQuestion: ExamQuestion =
    filteredQuestions.find((q) => q.id === activeQuestionId) ||
    filteredQuestions[0] ||
    allQuestions[0];

  const [selectedOptions, setSelectedOptions] = useState<
    ('A' | 'B' | 'C' | 'D' | 'E')[]
  >([]);
  const [revealed, setRevealed] = useState<boolean>(false);

  // Timed Mock Exam state
  const [mockQuestions, setMockQuestions] = useState<ExamQuestion[]>([]);
  const [mockIndex, setMockIndex] = useState<number>(0);
  const [mockAnswers, setMockAnswers] = useState<
    Record<string, ('A' | 'B' | 'C' | 'D' | 'E')[]>
  >({});
  const [mockSecondsLeft, setMockSecondsLeft] = useState<number>(25 * 60);
  const [mockSubmitted, setMockSubmitted] = useState<boolean>(false);
  const [mockCert, setMockCert] = useState<CertLevel>('PD1');
  const [mockTarget, setMockTarget] = useState<number>(0);

  // Native <dialog closedby="any"> ref for Custom Question Creator
  const customDialogRef = useRef<HTMLDialogElement | null>(null);
  const [newScenarioEn, setNewScenarioEn] = useState('');
  const [newScenario, setNewScenario] = useState('');
  const [newCodeBlock, setNewCodeBlock] = useState('');
  const [newOptA, setNewOptA] = useState('');
  const [newOptB, setNewOptB] = useState('');
  const [newOptC, setNewOptC] = useState('');
  const [newOptD, setNewOptD] = useState('');
  const [newCorrectId, setNewCorrectId] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [newExplanation, setNewExplanation] = useState('');

  // Modern Web Guidance mandatory fallback for <dialog closedby="any">
  useEffect(() => {
    const dialog = customDialogRef.current;
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

  useEffect(() => {
    if (!currentQuestion) return;
    const prevAttempt = state.questionAttempts[currentQuestion.id];
    if (prevAttempt) {
      setSelectedOptions(prevAttempt.selectedOptionIds);
    } else {
      setSelectedOptions([]);
    }
    setRevealed(false);
    setPeekChineseInEnMode(false);
  }, [currentQuestion?.id]);

  // Countdown timer for mock exam
  useEffect(() => {
    if (mode !== 'mock-exam' || mockSubmitted) return;
    const timer = window.setInterval(() => {
      setMockSecondsLeft((prev) => {
        if (prev <= 1) {
          setMockSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [mode, mockSubmitted]);

  const handleToggleOption = (optId: 'A' | 'B' | 'C' | 'D' | 'E') => {
    if (revealed) return;
    if (currentQuestion.questionType === 'single') {
      setSelectedOptions([optId]);
    } else {
      setSelectedOptions((prev) =>
        prev.includes(optId)
          ? prev.filter((id) => id !== optId)
          : [...prev, optId]
      );
    }
  };

  const checkIsCorrect = (
    q: ExamQuestion,
    chosen: ('A' | 'B' | 'C' | 'D' | 'E')[]
  ): boolean => {
    if (chosen.length !== q.correctOptionIds.length) return false;
    return q.correctOptionIds.every((id) => chosen.includes(id));
  };

  const handleSubmitPracticeAnswer = () => {
    if (selectedOptions.length === 0) return;
    const isCorrect = checkIsCorrect(currentQuestion, selectedOptions);
    setRevealed(true);
    onRecordAttempt(currentQuestion.id, selectedOptions, isCorrect);
  };

  const handleStartMockExam = (cert: CertLevel, count: number) => {
    const picked = buildMockExam(allQuestions, { cert, count });
    setMockQuestions(picked);
    setMockCert(cert);
    setMockTarget(count);
    setMockIndex(0);
    setMockAnswers({});
    setMockSecondsLeft(mockExamMinutes(cert, picked.length) * 60);
    setMockSubmitted(false);
    setMode('mock-exam');
  };

  const handleFinishMockExam = () => {
    setMockSubmitted(true);
    mockQuestions.forEach((q) => {
      const chosen = mockAnswers[q.id] || [];
      // Unanswered questions still count against the score, but aren't
      // dumped into the wrong-answer book.
      if (chosen.length === 0) return;
      const correct = checkIsCorrect(q, chosen);
      onRecordAttempt(q.id, chosen, correct);
    });
  };

  const handleCreateCustomQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScenario.trim() || !newOptA.trim() || !newOptB.trim()) return;

    const customId = `CUST-${state.customQuestions.length + 1}`;
    const options: ExamOption[] = [
      {
        id: 'A',
        textEn: newOptA,
        text: newOptA,
        whyRightOrWrong:
          newCorrectId === 'A'
            ? `Correct (正确)：${newExplanation || '自定义正确答案'}`
            : 'Incorrect (干扰项)',
      },
      {
        id: 'B',
        textEn: newOptB,
        text: newOptB,
        whyRightOrWrong:
          newCorrectId === 'B'
            ? `Correct (正确)：${newExplanation || '自定义正确答案'}`
            : 'Incorrect (干扰项)',
      },
      {
        id: 'C',
        textEn: newOptC || 'None of the above',
        text: newOptC || '以上均不对',
        whyRightOrWrong:
          newCorrectId === 'C'
            ? `Correct (正确)：${newExplanation || '自定义正确答案'}`
            : 'Incorrect (干扰项)',
      },
      {
        id: 'D',
        textEn: newOptD || 'Throws a runtime exception',
        text: newOptD || '抛出运行时异常',
        whyRightOrWrong:
          newCorrectId === 'D'
            ? `Correct (正确)：${newExplanation || '自定义正确答案'}`
            : 'Incorrect (干扰项)',
      },
    ];

    const created: ExamQuestion = {
      id: customId,
      certLevel: 'PD1',
      stage: 'intermediate',
      domain: 'Apex 核心与面向对象 (Apex & OOP)',
      examDomain: 'Process Automation & Logic (28%)',
      questionType: 'single',
      selectCount: 1,
      scenarioEn: newScenarioEn.trim() || newScenario,
      scenario: newScenario,
      codeBlock: newCodeBlock.trim() ? newCodeBlock : undefined,
      options,
      correctOptionIds: [newCorrectId],
      coreTakeaway: newExplanation || '自定义录入考题核心总结',
      officialDocTopic: 'Custom User Note & Question',
      isCustom: true,
    };

    onAddCustomQuestion(created);
    setNewScenarioEn('');
    setNewScenario('');
    setNewCodeBlock('');
    setNewOptA('');
    setNewOptB('');
    setNewOptC('');
    setNewOptD('');
    setNewExplanation('');
    customDialogRef.current?.close();
    onSelectQuestion(customId);
  };

  const currentIdxInFiltered = filteredQuestions.findIndex(
    (q) => q.id === currentQuestion?.id
  );
  const pd2PoolSize = certPool(allQuestions, 'PD2').length;
  const isMock = (cert: CertLevel, count: number) =>
    mode === 'mock-exam' && mockCert === cert && mockTarget === count;
  const wrongQuestionsCount = Object.values(state.questionAttempts).filter(
    (a) => !a.isCorrect && !a.masteredFromWrongBook
  ).length;
  const showEnglish = langMode === 'bilingual' || langMode === 'en-exam';
  const showChinese =
    langMode === 'bilingual' ||
    langMode === 'zh' ||
    revealed ||
    peekChineseInEnMode;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Action Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div className="pill-tab-group" style={{ flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`pill-tab tabular ${mode === 'practice' && statusFilter !== 'WRONG' ? 'selected' : ''}`}
            onClick={() => {
              setMode('practice');
              setStatusFilter('ALL');
            }}
          >
            题库精刷 ({allQuestions.length})
          </button>
          <button
            type="button"
            className={`pill-tab ${mode === 'blueprint' ? 'selected' : ''}`}
            onClick={() => setMode('blueprint')}
          >
            考纲覆盖矩阵
          </button>
          <button
            type="button"
            className={`pill-tab tabular ${mode === 'practice' && statusFilter === 'WRONG' ? 'selected' : ''}`}
            onClick={() => {
              setMode('practice');
              setStatusFilter('WRONG');
            }}
          >
            错题本 ({wrongQuestionsCount})
          </button>
          <button
            type="button"
            className={`pill-tab tabular ${isMock('PD1', 15) ? 'selected' : ''}`}
            onClick={() => handleStartMockExam('PD1', 15)}
          >
            PD1 快测 15 题 ({mockExamMinutes('PD1', 15)}m)
          </button>
          <button
            type="button"
            className={`pill-tab tabular ${isMock('PD1', 60) ? 'selected' : ''}`}
            onClick={() => handleStartMockExam('PD1', 60)}
          >
            PD1 全真模考 60 题 (105m)
          </button>
          <button
            type="button"
            className={`pill-tab tabular ${isMock('PD2', 60) ? 'selected' : ''}`}
            onClick={() => handleStartMockExam('PD2', 60)}
          >
            PD2 专项 {pd2PoolSize} 题 ({mockExamMinutes('PD2', pd2PoolSize)}m)
          </button>
        </div>

        <button
          type="button"
          className="btn-secondary"
          onClick={() => customDialogRef.current?.showModal()}
        >
          <Plus size={16} strokeWidth={1.5} />
          <span>新增自定义考题</span>
        </button>
      </div>

      {/* Native <dialog closedby="any"> for Custom Question Creation */}
      <dialog
        ref={customDialogRef}
        {...({ closedby: 'any' } as React.DialogHTMLAttributes<HTMLDialogElement>)}
        className="linear-dialog"
        aria-labelledby="customQuestionDialogTitle"
      >
        <form onSubmit={handleCreateCustomQuestion}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <h2 id="customQuestionDialogTitle" className="headline-md">
              新增自定义双语考题
            </h2>
            <button
              type="button"
              className="btn-tertiary"
              onClick={() => customDialogRef.current?.close()}
            >
              <span>关闭</span>
              <kbd className="keycap">Esc</kbd>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                英文题干 (可选)
              </label>
              <textarea
                className="text-input"
                style={{ width: '100%', minHeight: '56px' }}
                placeholder="What happens when Trigger.newMap is accessed in a before insert trigger?"
                value={newScenarioEn}
                onChange={(e) => setNewScenarioEn(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                中文题干与场景描述 *
              </label>
              <textarea
                required
                className="text-input"
                style={{ width: '100%', minHeight: '64px' }}
                placeholder="在 before insert 触发器中访问 Trigger.newMap 会发生什么？"
                value={newScenario}
                onChange={(e) => setNewScenario(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                附带代码片段 (可选)
              </label>
              <textarea
                className="code-editor-textarea"
                style={{ minHeight: '72px' }}
                placeholder="粘贴 Apex / SOQL / LWC 代码..."
                value={newCodeBlock}
                onChange={(e) => setNewCodeBlock(e.target.value)}
              />
            </div>

            <div className="grid-2">
              <input
                required
                className="text-input"
                placeholder="选项 A *"
                value={newOptA}
                onChange={(e) => setNewOptA(e.target.value)}
              />
              <input
                required
                className="text-input"
                placeholder="选项 B *"
                value={newOptB}
                onChange={(e) => setNewOptB(e.target.value)}
              />
              <input
                className="text-input"
                placeholder="选项 C"
                value={newOptC}
                onChange={(e) => setNewOptC(e.target.value)}
              />
              <input
                className="text-input"
                placeholder="选项 D"
                value={newOptD}
                onChange={(e) => setNewOptD(e.target.value)}
              />
            </div>

            <div className="grid-2">
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  正确选项
                </label>
                <select
                  className="select-input"
                  style={{ width: '100%' }}
                  value={newCorrectId}
                  onChange={(e) => setNewCorrectId(e.target.value as 'A' | 'B' | 'C' | 'D')}
                >
                  <option value="A">选项 A</option>
                  <option value="B">选项 B</option>
                  <option value="C">选项 C</option>
                  <option value="D">选项 D</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  参考答案解析 *
                </label>
                <input
                  required
                  className="text-input"
                  style={{ width: '100%' }}
                  placeholder="核心原理说明..."
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => customDialogRef.current?.close()}
              >
                取消
              </button>
              <button type="submit" className="btn-primary">
                保存到本地题库
              </button>
            </div>
          </div>
        </form>
      </dialog>

      {/* Mode 1: Official PD1 & PD2 Exam Blueprint 100% Coverage Matrix */}
      {mode === 'blueprint' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="surface-card-featured">
            <div className="eyebrow-text" style={{ marginBottom: '4px' }}>
              Salesforce Certification Exam Guide Alignment
            </div>
            <h1 className="headline-xl" style={{ marginBottom: '8px' }}>
              Platform Developer I & II 考纲覆盖矩阵（{EXAM_QUESTIONS.length} 题）
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              覆盖官方 6 大计分板块与 48 个核心子考点，包含数据建模、LDV 索引选择性、Continuation 异步长连接、动态 Apex 以及跨框架互操作。点击任一题号可直接开始作答。
            </p>
          </div>

          <div className="grid-2">
            {EXAM_BLUEPRINT_COVERAGE.map((sec) => {
              const completedInSec = sec.questionIds.filter(
                (qId) => state.questionAttempts[qId]?.isCorrect
              ).length;
              const pct = Math.round((completedInSec / sec.questionIds.length) * 100);

              return (
                <div
                  key={sec.id}
                  className="surface-card"
                  style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {sec.sectionEn}
                      </div>
                      <h3 className="card-title" style={{ marginTop: '4px' }}>
                        {sec.sectionZh}
                      </h3>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <span className="status-badge">PD1 {sec.examWeightPd1}</span>
                      <span className="status-badge">PD2 {sec.examWeightPd2}</span>
                    </div>
                  </div>

                  <div>
                    <div
                      className="tabular"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        marginBottom: '4px',
                      }}
                    >
                      <span>板块正确率 ({completedInSec}/{sec.questionIds.length})</span>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          color: pct >= 68 ? 'var(--color-positive)' : 'var(--text-secondary)',
                        }}
                      >
                        {pct}%
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className={`progress-fill ${pct >= 68 ? 'success' : ''}`}
                        style={{ width: `${Math.max(4, pct)}%` }}
                      />
                    </div>
                  </div>

                  <div className="surface-panel-inset" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      已覆盖子考点
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {sec.coveredTopics.map((tp, i) => (
                        <li key={i}>{tp}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      关联真题 ({sec.questionIds.length})
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {sec.questionIds.map((qId) => {
                        const att = state.questionAttempts[qId];
                        return (
                          <button
                            key={qId}
                            type="button"
                            onClick={() => {
                              setCertFilter('ALL');
                              setDomainFilter('ALL');
                              setStatusFilter('ALL');
                              setSearchText('');
                              onSelectQuestion(qId);
                              setMode('practice');
                            }}
                            style={{
                              padding: '4px 8px',
                              fontSize: '12px',
                              fontFamily: 'var(--font-mono)',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              border: att
                                ? att.isCorrect
                                  ? '1px solid var(--color-positive-border)'
                                  : '1px solid var(--color-negative-border)'
                                : '1px solid var(--border-hairline)',
                              background: att
                                ? att.isCorrect
                                  ? 'var(--color-positive-subtle)'
                                  : 'var(--color-negative-subtle)'
                                : 'var(--bg-raised)',
                              color: att
                                ? att.isCorrect
                                  ? 'var(--color-positive)'
                                  : 'var(--color-negative)'
                                : 'var(--text-primary)',
                            }}
                          >
                            {qId}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 2: Practice & Wrong Book Mode */}
      {mode === 'practice' && (
        <div className="grid-sidebar-split">
          {/* Left Filter & Question List */}
          <div className="surface-card" style={{ padding: '16px' }}>
            <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Filter size={16} strokeWidth={1.5} color="var(--text-muted)" />
                  <span>题库筛选</span>
                  <span className="nav-badge">
                    {filteredQuestions.length}/{allQuestions.length}
                  </span>
                </span>
                <div className="pill-tab-group">
                  {(['ALL', 'PD1', 'PD2'] as const).map((lv) => (
                    <button
                      key={lv}
                      type="button"
                      className={`pill-tab ${certFilter === lv ? 'selected' : ''}`}
                      style={{ padding: '4px 8px' }}
                      onClick={() => setCertFilter(lv)}
                    >
                      {lv === 'ALL' ? '全部' : lv}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="search"
                className="text-input"
                style={{ width: '100%' }}
                placeholder="搜索题号或关键词..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />

              <select
                className="select-input"
                style={{ width: '100%' }}
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value as 'ALL' | TechDomain)}
              >
                <option value="ALL">全部 6 大技术领域</option>
                <option value="Apex 核心与面向对象 (Apex & OOP)">Apex 核心与面向对象</option>
                <option value="SOQL & SOSL 数据查询 (Data Query)">SOQL & SOSL 数据查询</option>
                <option value="LWC 现代前端组件 (Lightning Web Components)">LWC 现代前端组件</option>
                <option value="Trigger 与执行顺序 (Triggers & Order of Execution)">Trigger 与执行顺序</option>
                <option value="异步 Apex 与集成架构 (Async Apex & Integration)">异步 Apex 与集成架构</option>
                <option value="安全模型与单元测试 (Security & Testing)">安全模型与单元测试</option>
              </select>

              <div className="pill-tab-group" style={{ flexWrap: 'wrap' }}>
                {(
                  [
                    { id: 'ALL', label: '全部' },
                    { id: 'UNANSWERED', label: '未做' },
                    { id: 'WRONG', label: `错题 (${wrongQuestionsCount})` },
                    { id: 'BOOKMARKED', label: '收藏' },
                  ] as const
                ).map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    className={`pill-tab tabular ${statusFilter === st.id ? 'selected' : ''}`}
                    style={{ padding: '4px 8px' }}
                    onClick={() => setStatusFilter(st.id)}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredQuestions.length === 0 ? (
              <div className="surface-panel-inset" style={{ textAlign: 'center', padding: '24px 16px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  {statusFilter === 'WRONG'
                    ? '当前错题本已清空，没有待复盘的错题'
                    : '当前筛选条件下没有匹配的考题'}
                </p>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setCertFilter('ALL');
                    setDomainFilter('ALL');
                    setStatusFilter('ALL');
                    setSearchText('');
                  }}
                >
                  重置筛选条件
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  maxHeight: '68vh',
                  overflowY: 'auto',
                }}
              >
                {filteredQuestions.map((q) => {
                  const attempt = state.questionAttempts[q.id];
                  const active = q.id === currentQuestion.id;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      className={`nav-item-btn ${active ? 'active' : ''}`}
                      onClick={() => onSelectQuestion(q.id)}
                      style={{ alignItems: 'flex-start', padding: '8px 12px' }}
                    >
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', width: '100%' }}>
                        <div style={{ marginTop: '2px', flexShrink: 0 }}>
                          {!attempt ? (
                            <span className="nav-badge">{q.id}</span>
                          ) : attempt.isCorrect ? (
                            <CheckCircle2 size={16} strokeWidth={1.5} color="var(--color-positive)" />
                          ) : (
                            <XCircle size={16} strokeWidth={1.5} color="var(--color-negative)" />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                              {q.id} · {q.certLevel}{' '}
                              {q.questionType === 'multiple' ? `(Choose ${q.selectCount})` : '(Single)'}
                            </span>
                            {state.bookmarkedQuestionIds.includes(q.id) && (
                              <Bookmark
                                size={14}
                                strokeWidth={1.5}
                                color="var(--color-accent)"
                                fill="var(--color-accent)"
                              />
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: '13px',
                              color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              marginTop: '2px',
                            }}
                          >
                            {langMode === 'en-exam' ? q.scenarioEn || q.scenario : q.scenario}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Question Card & Reference Explanation */}
          {currentQuestion && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
              <div className="surface-card-featured">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span className="status-badge primary">
                      {currentQuestion.id} · {currentQuestion.certLevel}
                    </span>
                    <span className="status-badge">
                      {currentQuestion.questionType === 'multiple'
                        ? `多选题 · 选 ${currentQuestion.selectCount} 项`
                        : '单选题'}
                    </span>
                    <span className="status-badge">{currentQuestion.domain}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {langMode === 'en-exam' && !revealed && (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setPeekChineseInEnMode((p) => !p)}
                      >
                        {peekChineseInEnMode ? (
                          <EyeOff size={16} strokeWidth={1.5} />
                        ) : (
                          <Eye size={16} strokeWidth={1.5} />
                        )}
                        <span>{peekChineseInEnMode ? '隐藏中文对照' : '显示中文对照'}</span>
                      </button>
                    )}
                    {state.questionAttempts[currentQuestion.id] &&
                      !state.questionAttempts[currentQuestion.id].isCorrect &&
                      !state.questionAttempts[currentQuestion.id].masteredFromWrongBook && (
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => onMarkWrongMastered(currentQuestion.id)}
                        >
                          <Trash2 size={16} strokeWidth={1.5} />
                          <span>移出错题本</span>
                        </button>
                      )}
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => onToggleBookmark(currentQuestion.id)}
                    >
                      <Bookmark
                        size={16}
                        strokeWidth={1.5}
                        fill={
                          state.bookmarkedQuestionIds.includes(currentQuestion.id)
                            ? 'var(--color-accent)'
                            : 'none'
                        }
                      />
                      <span>
                        {state.bookmarkedQuestionIds.includes(currentQuestion.id)
                          ? '已收藏'
                          : '收藏'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Bilingual Scenario Stem */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                  {showEnglish && currentQuestion.scenarioEn && (
                    <div
                      style={{
                        fontSize: '15px',
                        lineHeight: '24px',
                        color: 'var(--text-primary)',
                        fontWeight: 500,
                      }}
                    >
                      <span className="lang-tag">EN</span>
                      {currentQuestion.scenarioEn}
                    </div>
                  )}

                  {showChinese && (
                    <div
                      style={{
                        fontSize: '14px',
                        lineHeight: '22px',
                        color: showEnglish ? 'var(--text-secondary)' : 'var(--text-primary)',
                        paddingLeft: showEnglish ? '12px' : '0',
                        borderLeft: showEnglish ? '2px solid var(--border-strong)' : 'none',
                      }}
                    >
                      {showEnglish && <span className="lang-tag">ZH</span>}
                      {currentQuestion.scenario}
                    </div>
                  )}
                </div>

                {/* Optional Code Block */}
                {currentQuestion.codeBlock && (
                  <pre className="code-block" style={{ marginBottom: '16px' }}>
                    <code>{currentQuestion.codeBlock}</code>
                  </pre>
                )}

                {/* Options List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {currentQuestion.options.map((opt) => {
                    const isSelected = selectedOptions.includes(opt.id);
                    const isRightOption = currentQuestion.correctOptionIds.includes(
                      opt.id
                    );

                    let borderColor = isSelected
                      ? 'var(--color-accent)'
                      : 'var(--border-hairline)';
                    let bgColor = isSelected
                      ? 'var(--color-accent-subtle)'
                      : 'var(--bg-sidebar)';

                    if (revealed) {
                      if (isRightOption) {
                        borderColor = 'var(--color-positive-border)';
                        bgColor = 'var(--color-positive-subtle)';
                      } else if (isSelected && !isRightOption) {
                        borderColor = 'var(--color-negative-border)';
                        bgColor = 'var(--color-negative-subtle)';
                      }
                    }

                    return (
                      <div
                        key={opt.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleToggleOption(opt.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleToggleOption(opt.id);
                          }
                        }}
                        style={{
                          padding: '12px 16px',
                          borderRadius: 'var(--radius-md)',
                          border: `1px solid ${borderColor}`,
                          backgroundColor: bgColor,
                          cursor: revealed ? 'default' : 'pointer',
                          transition:
                            'background-color 150ms var(--ease-out), border-color 150ms var(--ease-out)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <span
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: 'var(--radius-xs)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '12px',
                              fontWeight: 500,
                              backgroundColor: isSelected
                                ? 'var(--color-accent)'
                                : 'var(--bg-raised)',
                              color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                              flexShrink: 0,
                            }}
                          >
                            {opt.id}
                          </span>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {showEnglish && opt.textEn && (
                              <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>
                                {opt.textEn}
                              </div>
                            )}
                            {showChinese && (
                              <div
                                style={{
                                  fontSize: '13px',
                                  color: showEnglish ? 'var(--text-secondary)' : 'var(--text-primary)',
                                }}
                              >
                                {opt.text}
                              </div>
                            )}
                            {revealed && (
                              <div
                                style={{
                                  marginTop: '8px',
                                  paddingTop: '8px',
                                  borderTop: '1px solid var(--border-hairline)',
                                  fontSize: '13px',
                                  color: isRightOption
                                    ? 'var(--color-positive)'
                                    : 'var(--text-secondary)',
                                }}
                              >
                                {opt.whyRightOrWrong.replace(/^[✅❌]\s*/, '')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Action Footer */}
                <div
                  style={{
                    marginTop: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={selectedOptions.length === 0}
                      onClick={handleSubmitPracticeAnswer}
                      style={{ opacity: selectedOptions.length === 0 ? 0.5 : 1 }}
                    >
                      提交答案并查看解析
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setRevealed((prev) => !prev)}
                    >
                      {revealed ? '隐藏解析' : '直接查看解析'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className="nav-badge">
                      {currentIdxInFiltered + 1} / {filteredQuestions.length}
                    </span>
                    {currentIdxInFiltered > 0 && (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() =>
                          onSelectQuestion(filteredQuestions[currentIdxInFiltered - 1].id)
                        }
                      >
                        <ArrowLeft size={16} strokeWidth={1.5} />
                        <span>上一题</span>
                      </button>
                    )}
                    {currentIdxInFiltered < filteredQuestions.length - 1 && (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() =>
                          onSelectQuestion(filteredQuestions[currentIdxInFiltered + 1].id)
                        }
                      >
                        <span>下一题</span>
                        <ArrowRight size={16} strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Core Takeaway & Official Reference Panel */}
              {revealed && (
                <div className="surface-card">
                  <h3 className="card-title" style={{ marginBottom: '12px' }}>
                    核心考点提炼（正确答案：{currentQuestion.correctOptionIds.join(', ')}）
                  </h3>
                  <div
                    className="surface-panel-inset"
                    style={{
                      borderLeft: '2px solid var(--color-positive)',
                      fontSize: '14px',
                      color: 'var(--text-primary)',
                      marginBottom: '12px',
                    }}
                  >
                    {currentQuestion.coreTakeaway}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <BookOpen size={16} strokeWidth={1.5} />
                    <span>
                      官方文档章节：{currentQuestion.officialDocTopic} · 计分域：{currentQuestion.examDomain}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mode 3: Timed Mock Exam Mode */}
      {mode === 'mock-exam' && (
        <div className="surface-card-featured">
          {!mockSubmitted && mockQuestions.length > 0 ? (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '16px',
                  borderBottom: '1px solid var(--border-hairline)',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="status-badge primary">
                    {mockCert} 模拟考场 · {mockIndex + 1} / {mockQuestions.length}
                  </span>
                  <div className="pill-tab-group">
                    <button
                      type="button"
                      className={`pill-tab tabular ${isMock('PD1', 15) ? 'selected' : ''}`}
                      onClick={() => handleStartMockExam('PD1', 15)}
                    >
                      PD1 15 题
                    </button>
                    <button
                      type="button"
                      className={`pill-tab tabular ${isMock('PD1', 30) ? 'selected' : ''}`}
                      onClick={() => handleStartMockExam('PD1', 30)}
                    >
                      PD1 30 题
                    </button>
                    <button
                      type="button"
                      className={`pill-tab tabular ${isMock('PD1', 60) ? 'selected' : ''}`}
                      onClick={() => handleStartMockExam('PD1', 60)}
                    >
                      PD1 60 题
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="status-badge warning">
                    <Clock size={16} strokeWidth={1.5} />
                    <span className="tabular">
                      {Math.floor(mockSecondsLeft / 60)}:
                      {String(mockSecondsLeft % 60).padStart(2, '0')}
                    </span>
                  </span>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleFinishMockExam}
                  >
                    交卷并生成报告
                  </button>
                </div>
              </div>

              {(() => {
                const mq = mockQuestions[mockIndex];
                const chosen = mockAnswers[mq.id] || [];
                return (
                  <div>
                    <div style={{ marginBottom: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      [{mq.certLevel}] {mq.examDomain} ·{' '}
                      {mq.questionType === 'multiple'
                        ? `多选题 (选 ${mq.selectCount} 项)`
                        : '单选题'}
                    </div>

                    {showEnglish && mq.scenarioEn && (
                      <div style={{ fontSize: '15px', fontWeight: 500, marginBottom: '8px', lineHeight: '24px' }}>
                        {mq.scenarioEn}
                      </div>
                    )}
                    {(langMode !== 'en-exam' || peekChineseInEnMode) && (
                      <div
                        style={{
                          fontSize: '14px',
                          color: showEnglish ? 'var(--text-secondary)' : 'var(--text-primary)',
                          marginBottom: '16px',
                          lineHeight: '22px',
                        }}
                      >
                        {mq.scenario}
                      </div>
                    )}

                    {mq.codeBlock && (
                      <pre className="code-block" style={{ marginBottom: '16px' }}>
                        <code>{mq.codeBlock}</code>
                      </pre>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                      {mq.options.map((opt) => {
                        const sel = chosen.includes(opt.id);
                        return (
                          <div
                            key={opt.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              const next =
                                mq.questionType === 'single'
                                  ? [opt.id]
                                  : sel
                                  ? chosen.filter((x) => x !== opt.id)
                                  : [...chosen, opt.id];
                              setMockAnswers((prev) => ({ ...prev, [mq.id]: next }));
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                const next =
                                  mq.questionType === 'single'
                                    ? [opt.id]
                                    : sel
                                    ? chosen.filter((x) => x !== opt.id)
                                    : [...chosen, opt.id];
                                setMockAnswers((prev) => ({ ...prev, [mq.id]: next }));
                              }
                            }}
                            style={{
                              padding: '12px 16px',
                              borderRadius: 'var(--radius-md)',
                              border: `1px solid ${
                                sel ? 'var(--color-accent)' : 'var(--border-hairline)'
                              }`,
                              backgroundColor: sel
                                ? 'var(--color-accent-subtle)'
                                : 'var(--bg-sidebar)',
                              cursor: 'pointer',
                              display: 'flex',
                              gap: '12px',
                              alignItems: 'flex-start',
                            }}
                          >
                            <span className="nav-badge" style={{ marginTop: '2px' }}>
                              {opt.id}
                            </span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {showEnglish && opt.textEn && (
                                <span style={{ fontWeight: 500, fontSize: '14px' }}>{opt.textEn}</span>
                              )}
                              {(langMode !== 'en-exam' || peekChineseInEnMode) && (
                                <span
                                  style={{
                                    fontSize: '13px',
                                    color: showEnglish ? 'var(--text-secondary)' : 'var(--text-primary)',
                                  }}
                                >
                                  {opt.text}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        disabled={mockIndex === 0}
                        onClick={() => setMockIndex((i) => Math.max(0, i - 1))}
                      >
                        <ArrowLeft size={16} strokeWidth={1.5} />
                        <span>上一题</span>
                      </button>
                      {mockIndex < mockQuestions.length - 1 ? (
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={() =>
                            setMockIndex((i) => Math.min(mockQuestions.length - 1, i + 1))
                          }
                        >
                          <span>下一题</span>
                          <ArrowRight size={16} strokeWidth={1.5} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={handleFinishMockExam}
                        >
                          确认交卷
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            /* Mock Exam Result Report */
            <div>
              {(() => {
                const correctTotal = mockQuestions.filter((q) =>
                  checkIsCorrect(q, mockAnswers[q.id] || [])
                ).length;
                const scorePct = Math.round(
                  (correctTotal / Math.max(1, mockQuestions.length)) * 100
                );
                const passed = scorePct >= 68;

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <span
                          className={`status-badge ${passed ? 'success' : 'danger'}`}
                          style={{ marginBottom: '8px' }}
                        >
                          {passed
                            ? '已达到 68% 官方通过线'
                            : '未达 68% 通过线 · 错题已收入错题本'}
                        </span>
                        <h2 className="headline-xl tabular">
                          模考得分 {scorePct}%（{correctTotal} / {mockQuestions.length} 题正确）
                        </h2>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => handleStartMockExam(mockCert, mockTarget)}
                        >
                          <RotateCcw size={16} strokeWidth={1.5} />
                          <span>同样配置再测一次</span>
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => handleStartMockExam('PD1', 60)}
                        >
                          <RotateCcw size={16} strokeWidth={1.5} />
                          <span>PD1 全真 60 题</span>
                        </button>
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={() => {
                            setMode('practice');
                            setStatusFilter('WRONG');
                          }}
                        >
                          复盘错题本
                        </button>
                      </div>
                    </div>

                    <DomainBreakdown
                      scores={scoreByDomain(mockQuestions, (q) => checkIsCorrect(q, mockAnswers[q.id] || []))}
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {mockQuestions.map((q, idx) => {
                        const chosen = mockAnswers[q.id] || [];
                        const ok = checkIsCorrect(q, chosen);
                        return (
                          <div
                            key={q.id}
                            className="surface-panel-inset"
                            style={{
                              borderColor: ok
                                ? 'var(--color-positive-border)'
                                : 'var(--color-negative-border)',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '8px',
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 500,
                                  color: ok ? 'var(--color-positive)' : 'var(--color-negative)',
                                }}
                              >
                                第 {idx + 1} 题 ({q.id}) · {ok ? '回答正确' : '回答错误'}
                              </span>
                              <span className="nav-badge">
                                作答: {chosen.join(',') || '未作答'} · 标准答案: {q.correctOptionIds.join(',')}
                              </span>
                            </div>
                            {q.scenarioEn && (
                              <p style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                                {q.scenarioEn}
                              </p>
                            )}
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                              {q.scenario}
                            </p>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                              <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>核心解析：</strong>{' '}
                              {q.coreTakeaway}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const DomainBreakdown: React.FC<{ scores: ReturnType<typeof scoreByDomain> }> = ({ scores }) => {
  if (scores.length === 0) return null;
  const weakest = [...scores].sort((a, b) => a.pct - b.pct)[0];
  return (
    <div className="surface-panel-inset" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '13px', fontWeight: 500 }}>分领域表现</span>
        {weakest.pct < 68 && (
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            最值得先补的是 {domainShortName(weakest.domain)}
          </span>
        )}
      </div>
      {scores.map((s) => (
        <div key={s.domain} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div className="tabular" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{domainShortName(s.domain)}</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: s.pct >= 68 ? 'var(--color-positive)' : 'var(--text-secondary)' }}>
              {s.correct}/{s.total} · {s.pct}%
            </span>
          </div>
          <div className="progress-track">
            <div className={`progress-fill ${s.pct >= 68 ? 'success' : ''}`} style={{ width: `${Math.max(2, s.pct)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
};
