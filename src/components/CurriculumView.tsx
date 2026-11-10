import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Code2,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  FileEdit,
  HelpCircle,
} from 'lucide-react';
import { UserAppState, StudyStage } from '../types';
import { CURRICULUM_LESSONS } from '../data/curriculum';

interface CurriculumViewProps {
  state: UserAppState;
  activeLessonId: string;
  onSelectLesson: (lessonId: string) => void;
  onToggleLessonComplete: (lessonId: string) => void;
  onSaveNote: (lessonId: string, note: string) => void;
  onNavigateToChallenge: (challengeId: string) => void;
  onNavigateToQuestion: (questionId: string) => void;
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({
  state,
  activeLessonId,
  onSelectLesson,
  onToggleLessonComplete,
  onSaveNote,
  onNavigateToChallenge,
  onNavigateToQuestion,
}) => {
  const [stageFilter, setStageFilter] = useState<'all' | StudyStage>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const langMode = state.languageMode || 'bilingual';

  const filteredLessons = CURRICULUM_LESSONS.filter((l) => {
    if (stageFilter !== 'all' && l.stage !== stageFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        l.title.toLowerCase().includes(q) ||
        l.titleEn.toLowerCase().includes(q) ||
        l.subtitle.toLowerCase().includes(q) ||
        l.subtitleEn.toLowerCase().includes(q) ||
        l.domain.toLowerCase().includes(q) ||
        l.summary.toLowerCase().includes(q) ||
        l.summaryEn.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const currentLesson =
    CURRICULUM_LESSONS.find((l) => l.id === activeLessonId) ||
    filteredLessons[0] ||
    CURRICULUM_LESSONS[0];

  const currentIndex = CURRICULUM_LESSONS.findIndex((l) => l.id === currentLesson.id);
  const prevLesson = currentIndex > 0 ? CURRICULUM_LESSONS[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < CURRICULUM_LESSONS.length - 1
      ? CURRICULUM_LESSONS[currentIndex + 1]
      : null;

  const isCompleted = state.completedLessonIds.includes(currentLesson.id);
  const userNote = state.lessonNotes[currentLesson.id] || '';

  return (
    <div className="grid-sidebar-split">
      {/* Left Sidebar: Lesson Directory */}
      <div className="surface-card" style={{ padding: '16px' }}>
        <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="card-title">课程目录</h2>
            <span className="nav-badge">
              {state.completedLessonIds.length}/{CURRICULUM_LESSONS.length}
            </span>
          </div>
          <input
            type="search"
            className="text-input"
            style={{ width: '100%' }}
            placeholder="搜索课程..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="pill-tab-group" style={{ flexWrap: 'wrap' }}>
            {(
              [
                { id: 'all', label: '全部' },
                { id: 'bridge', label: '先导' },
                { id: 'beginner', label: '入门' },
                { id: 'intermediate', label: '进阶' },
                { id: 'advanced', label: '高级' },
                { id: 'architect', label: '架构' },
              ] as { id: 'all' | StudyStage; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`pill-tab ${stageFilter === tab.id ? 'selected' : ''}`}
                style={{ padding: '4px 8px' }}
                onClick={() => setStageFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            maxHeight: '70vh',
            overflowY: 'auto',
          }}
        >
          {filteredLessons.map((lesson) => {
            const done = state.completedLessonIds.includes(lesson.id);
            const active = lesson.id === currentLesson.id;
            return (
              <button
                key={lesson.id}
                type="button"
                onClick={() => onSelectLesson(lesson.id)}
                className={`nav-item-btn ${active ? 'active' : ''}`}
                style={{
                  alignItems: 'flex-start',
                  padding: '8px 12px',
                }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', minWidth: 0 }}>
                  <div style={{ marginTop: '2px', flexShrink: 0 }}>
                    {done ? (
                      <CheckCircle2 size={16} strokeWidth={1.5} color="var(--color-positive)" />
                    ) : (
                      <Circle size={16} strokeWidth={1.5} />
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className="nav-badge">{lesson.id}</span>
                      <span
                        style={{
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {lesson.domain}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: active ? 500 : 400,
                        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                        marginTop: '4px',
                      }}
                    >
                      {langMode === 'en-exam' ? lesson.titleEn : lesson.title}
                    </div>
                    {langMode === 'bilingual' && (
                      <div
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-muted)',
                          marginTop: '2px',
                        }}
                      >
                        {lesson.titleEn}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Main Lesson Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
        {/* Header Card */}
        <div className="surface-card-featured">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="status-badge primary">{currentLesson.id}</span>
              <span className="status-badge">{currentLesson.domain}</span>
              <span className="status-badge">{currentLesson.examFrequency}</span>
              <span className="status-badge">{currentLesson.examDomain}</span>
            </div>

            <button
              type="button"
              className={isCompleted ? 'btn-secondary' : 'btn-primary'}
              onClick={() => onToggleLessonComplete(currentLesson.id)}
            >
              <CheckCircle2 size={16} strokeWidth={1.5} />
              <span>{isCompleted ? '已标记掌握' : '标记本节已掌握'}</span>
            </button>
          </div>

          {langMode !== 'zh' && (
            <div
              style={{
                fontSize: '13px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                marginBottom: '4px',
              }}
            >
              {currentLesson.titleEn}
            </div>
          )}
          <h1 className="headline-xl" style={{ marginBottom: '8px' }}>
            {langMode === 'en-exam' ? currentLesson.titleEn : currentLesson.title}
          </h1>
          {langMode !== 'zh' && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>
              {currentLesson.subtitleEn}
            </p>
          )}
          {langMode !== 'en-exam' && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
              {currentLesson.subtitle}
            </p>
          )}

          <div
            className="surface-panel-inset"
            style={{
              color: 'var(--text-secondary)',
              fontSize: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {langMode !== 'zh' && (
              <div style={{ color: 'var(--text-primary)' }}>
                <span className="lang-tag">EN</span>
                {currentLesson.summaryEn}
              </div>
            )}
            {langMode !== 'en-exam' && (
              <div>
                <span className="lang-tag">ZH</span>
                {currentLesson.summary}
              </div>
            )}
          </div>

          {/* Quick Jump to Paired Lab & Quiz */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              marginTop: '16px',
            }}
          >
            {currentLesson.linkedChallengeId && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => onNavigateToChallenge(currentLesson.linkedChallengeId!)}
              >
                <Code2 size={16} strokeWidth={1.5} />
                <span>配套编程题 ({currentLesson.linkedChallengeId})</span>
              </button>
            )}
            {currentLesson.linkedQuestionIds.length > 0 && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => onNavigateToQuestion(currentLesson.linkedQuestionIds[0])}
              >
                <HelpCircle size={16} strokeWidth={1.5} />
                <span>配套真题 ({currentLesson.linkedQuestionIds.join(', ')})</span>
              </button>
            )}
          </div>
        </div>

        {/* High-Yield English Exam Glossary & Signal Phrases */}
        {currentLesson.examGlossary && currentLesson.examGlossary.length > 0 && (
          <div className="surface-card">
            <h2 className="headline-md" style={{ marginBottom: '8px' }}>
              考场高频英文术语与题干信号词
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Salesforce 认证考试为全英文试题。掌握下方英文题干关键词（Signal Phrases），可在读题时快速锁定架构方案。
            </p>
            <div className="grid-2">
              {currentLesson.examGlossary.map((g, idx) => (
                <div
                  key={idx}
                  className="surface-panel-inset"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {g.termEn}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {g.meaningZh}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--color-accent-subtle)',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      borderLeft: '2px solid var(--color-accent)',
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)', marginRight: '6px' }}>Signal:</span>
                    {g.examSignalPhraseEn}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Core Concepts Deep Dive */}
        <div className="surface-card">
          <h2
            className="headline-md"
            style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <BookOpen size={16} strokeWidth={1.5} color="var(--text-muted)" />
            <span>核心知识点精讲</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {currentLesson.coreConcepts.map((concept, idx) => (
              <div key={idx} className="surface-panel-inset">
                <h3 className="card-title" style={{ marginBottom: '8px' }}>
                  {concept.heading}
                </h3>
                <div
                  style={{
                    whiteSpace: 'pre-line',
                    color: 'var(--text-secondary)',
                    fontSize: '14px',
                    lineHeight: '22px',
                  }}
                >
                  {concept.content}
                </div>
                {concept.codeSnippet && (
                  <pre className="code-block" style={{ marginTop: '12px' }}>
                    <code>{concept.codeSnippet}</code>
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Side-by-Side Anti-Pattern vs Best Practice */}
        <div className="surface-card">
          <div style={{ marginBottom: '16px' }}>
            <div className="eyebrow-text" style={{ marginBottom: '4px' }}>
              生产级代码重构对比
            </div>
            <h2 className="headline-md">{currentLesson.codeComparison.title}</h2>
          </div>

          <div className="grid-2" style={{ marginBottom: '16px' }}>
            <div
              className="surface-panel-inset"
              style={{ borderColor: 'var(--color-negative-border)' }}
            >
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--color-negative)',
                  marginBottom: '8px',
                }}
              >
                {currentLesson.codeComparison.antiPatternLabel.replace(/^[❌✅]\s*/, '')}
              </div>
              <pre className="code-block">
                <code>{currentLesson.codeComparison.antiPatternCode}</code>
              </pre>
            </div>

            <div
              className="surface-panel-inset"
              style={{ borderColor: 'var(--color-positive-border)' }}
            >
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--color-positive)',
                  marginBottom: '8px',
                }}
              >
                {currentLesson.codeComparison.bestPracticeLabel.replace(/^[❌✅]\s*/, '')}
              </div>
              <pre className="code-block">
                <code>{currentLesson.codeComparison.bestPracticeCode}</code>
              </pre>
            </div>
          </div>

          <div className="surface-panel-inset" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>架构要点：</strong>{' '}
            {currentLesson.codeComparison.explanation}
          </div>
        </div>

        {/* Exam Traps & Pitfalls */}
        <div className="surface-card">
          <h2
            className="headline-md"
            style={{
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertTriangle size={16} strokeWidth={1.5} color="var(--text-muted)" />
            <span>PD1 / PD2 常见陷阱与必记结论</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {currentLesson.examTraps.map((trap, i) => (
              <div
                key={i}
                className="surface-panel-inset"
                style={{
                  borderLeft: '2px solid var(--color-accent)',
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                }}
              >
                {trap}
              </div>
            ))}
          </div>
        </div>

        {/* Personal Markdown Study Notes */}
        <div className="surface-card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileEdit size={16} strokeWidth={1.5} color="var(--text-muted)" />
              <span>随堂笔记</span>
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              本地自动保存
            </span>
          </div>
          <textarea
            className="code-editor-textarea"
            style={{ minHeight: '112px', fontFamily: 'var(--font-text)' }}
            placeholder="记录本节课程的易错点或实战总结..."
            value={userNote}
            onChange={(e) => onSaveNote(currentLesson.id, e.target.value)}
          />
        </div>

        {/* Prev / Next Navigation Footer */}
        <div
          className="surface-card"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          {prevLesson ? (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => onSelectLesson(prevLesson.id)}
            >
              <ArrowLeft size={16} strokeWidth={1.5} />
              <span>上一讲 · {prevLesson.id}</span>
            </button>
          ) : (
            <div />
          )}

          {nextLesson && (
            <button
              type="button"
              className="btn-primary"
              onClick={() => onSelectLesson(nextLesson.id)}
            >
              <span>下一讲 · {nextLesson.id}</span>
              <ArrowRight size={16} strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
