import React, { useState } from 'react';
import {
  RotateCw,
  CheckCircle2,
  BookMarked,
  ChevronDown,
} from 'lucide-react';
import { UserAppState } from '../types';
import { FLASHCARDS_DATA } from '../data/flashcards';
import {
  getReviewQueue,
  getNextDueAt,
  nextIntervalMs,
  describeInterval,
} from '../utils/srs';

interface FlashcardsAndCheatSheetViewProps {
  state: UserAppState;
  onRateFlashcard: (
    cardId: string,
    confidence: 'again' | 'hard' | 'good' | 'easy'
  ) => void;
}

const CONFIDENCE_LABELS: Record<'unseen' | 'again' | 'hard' | 'good' | 'easy', string> = {
  unseen: '未学习',
  again: '需重学',
  hard: '较模糊',
  good: '已掌握',
  easy: '熟练',
};

export const FlashcardsAndCheatSheetView: React.FC<
  FlashcardsAndCheatSheetViewProps
> = ({ state, onRateFlashcard }) => {
  const now = Date.now();
  const queue = getReviewQueue(FLASHCARDS_DATA, state.flashcardStates, now);
  const [selectedCategory, setSelectedCategory] = useState<string>(() =>
    queue.all.length > 0 ? 'DUE' : 'ALL'
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [flipped, setFlipped] = useState<boolean>(false);

  const isDueMode = selectedCategory === 'DUE';
  const filteredCards = isDueMode
    ? queue.all
        .map((id) => FLASHCARDS_DATA.find((c) => c.id === id))
        .filter((c): c is (typeof FLASHCARDS_DATA)[number] => Boolean(c))
    : FLASHCARDS_DATA.filter((c) =>
        selectedCategory === 'ALL' ? true : c.category === selectedCategory
      );

  const dueQueueEmpty = isDueMode && filteredCards.length === 0;
  const currentCard = isDueMode
    ? filteredCards[0] || FLASHCARDS_DATA[0]
    : filteredCards[currentIndex % filteredCards.length] || FLASHCARDS_DATA[0];
  const cardState = state.flashcardStates[currentCard.id];
  const langMode = state.languageMode || 'bilingual';
  const nextDueAt = getNextDueAt(state.flashcardStates, now);

  const previewInterval = (confidence: 'again' | 'hard' | 'good' | 'easy') => {
    const success = confidence === 'good' || confidence === 'easy';
    return describeInterval(nextIntervalMs(confidence, success ? cardState?.streak ?? 0 : 0));
  };

  const handleRate = (confidence: 'again' | 'hard' | 'good' | 'easy') => {
    onRateFlashcard(currentCard.id, confidence);
    setFlipped(false);
    if (!isDueMode) setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Flashcard Active Recall Deck */}
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
          <div>
            <div className="eyebrow-text" style={{ marginBottom: '4px' }}>
              间隔重复记忆闪卡 (Spaced Repetition)
            </div>
            <h1 className="headline-md">
              Governor Limits · 20 步执行顺序 · LWC 与异步架构速记
            </h1>
          </div>

          <div className="pill-tab-group" style={{ flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`pill-tab tabular ${isDueMode ? 'selected' : ''}`}
              onClick={() => {
                setSelectedCategory('DUE');
                setCurrentIndex(0);
                setFlipped(false);
              }}
            >
              今日待复习 ({queue.all.length})
            </button>
            {(
              [
                'ALL',
                'Governor Limits',
                'Order of Execution',
                'LWC Decorators & Lifecycle',
                'Async Apex',
                'SOQL & Security',
              ] as const
            ).map((cat) => (
              <button
                key={cat}
                type="button"
                className={`pill-tab ${selectedCategory === cat ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentIndex(0);
                  setFlipped(false);
                }}
              >
                {cat === 'ALL' ? '全部闪卡' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Card Box */}
        {dueQueueEmpty ? (
          <div
            className="surface-panel-inset"
            style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}
          >
            <h2 className="headline-md">今天的卡都翻完了</h2>
            <p className="tabular" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              {nextDueAt
                ? `下一张卡会在 ${describeInterval(nextDueAt - now)}回来找你。记忆在休息的时候也在巩固。`
                : '还没有复习过的卡片。'}
            </p>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setSelectedCategory('ALL');
                setCurrentIndex(0);
              }}
            >
              自由浏览全部闪卡
            </button>
          </div>
        ) : (
        <div
          className="surface-panel-inset"
          style={{
            padding: '24px',
            minHeight: '220px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderColor: flipped
              ? 'var(--color-accent-border)'
              : 'var(--border-strong)',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="nav-badge">
                  {isDueMode ? `剩余 ${filteredCards.length}` : `${(currentIndex % filteredCards.length) + 1} / ${filteredCards.length}`}
                </span>
                <span className="status-badge">{currentCard.category}</span>
                {cardState && (
                  <span className="status-badge success">
                    上次评级：{CONFIDENCE_LABELS[cardState.confidence]}
                    {cardState.nextReviewAt > now ? ` · 下次 ${describeInterval(cardState.nextReviewAt - now)}` : ' · 已到期'}
                  </span>
                )}
              </div>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => setFlipped((f) => !f)}
              >
                <RotateCw size={16} strokeWidth={1.5} />
                <span>{flipped ? '切回问题面' : '翻转查看答案'}</span>
              </button>
            </div>

            {langMode !== 'zh' && currentCard.frontTitleEn && (
              <div
                style={{
                  fontSize: '13px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                  marginBottom: '4px',
                }}
              >
                {currentCard.frontTitleEn}
              </div>
            )}
            <h2 className="headline-md" style={{ marginBottom: '12px' }}>
              {langMode === 'en-exam' ? currentCard.frontTitleEn : currentCard.frontTitle}
            </h2>
            {langMode !== 'zh' && currentCard.frontPromptEn && (
              <p
                style={{
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                  lineHeight: '22px',
                  marginBottom: '8px',
                }}
              >
                <span className="lang-tag">EN</span>
                {currentCard.frontPromptEn}
              </p>
            )}
            {langMode !== 'en-exam' && (
              <p
                style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  lineHeight: '22px',
                }}
              >
                <span className="lang-tag">ZH</span>
                {currentCard.frontPrompt}
              </p>
            )}

            {flipped && (
              <div
                style={{
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-hairline)',
                }}
              >
                {langMode !== 'zh' && currentCard.backAnswerEn && (
                  <div
                    style={{
                      whiteSpace: 'pre-line',
                      fontSize: '14px',
                      color: 'var(--text-primary)',
                      lineHeight: '22px',
                      marginBottom: '12px',
                      paddingBottom: '12px',
                      borderBottom:
                        langMode === 'bilingual' ? '1px solid var(--border-hairline)' : 'none',
                    }}
                  >
                    {currentCard.backAnswerEn}
                  </div>
                )}
                {langMode !== 'en-exam' && (
                  <div
                    style={{
                      whiteSpace: 'pre-line',
                      fontSize: '14px',
                      color:
                        langMode === 'bilingual'
                          ? 'var(--text-secondary)'
                          : 'var(--text-primary)',
                      lineHeight: '22px',
                      marginBottom: '12px',
                    }}
                  >
                    {currentCard.backAnswer}
                  </div>
                )}
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-accent-subtle)',
                    borderLeft: '2px solid var(--color-accent)',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                  }}
                >
                  <strong style={{ fontWeight: 500 }}>考点提示：</strong> {currentCard.examTip}
                </div>
              </div>
            )}
          </div>

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
            {!flipped ? (
              <button
                type="button"
                className="btn-primary"
                onClick={() => setFlipped(true)}
              >
                回忆后揭晓参考答案
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => handleRate('again')}
                >
                  <span>1 · 需重学 (Again)</span>
                  <span className="nav-badge">{previewInterval('again')}</span>
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => handleRate('hard')}
                >
                  <span>2 · 较模糊 (Hard)</span>
                  <span className="nav-badge">{previewInterval('hard')}</span>
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => handleRate('good')}
                >
                  <span>3 · 已掌握 (Good)</span>
                  <span className="nav-badge">{previewInterval('good')}</span>
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => handleRate('easy')}
                >
                  <CheckCircle2 size={16} strokeWidth={1.5} />
                  <span>4 · 熟练秒答 (Easy)</span>
                  <span className="nav-badge" style={{ color: 'inherit', opacity: 0.7 }}>{previewInterval('easy')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      {/* Searchable Native <details> Exclusive Disclosure Cheat Sheets */}
      <div className="surface-card">
        <div style={{ marginBottom: '16px' }}>
          <h2
            className="headline-md"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}
          >
            <BookMarked size={16} strokeWidth={1.5} color="var(--text-muted)" />
            <span>Salesforce 考前速查手册</span>
            <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              支持 <kbd className="keycap">⌘F</kbd> 自动展开检索
            </span>
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            采用原生 HTML <code>&lt;details name="sf-cheatsheet"&gt;</code> 互斥折叠面板，折叠状态下仍支持浏览器页面内全文检索并自动展开。
          </p>
        </div>

        <details className="linear-disclosure" name="sf-cheatsheet" open>
          <summary>
            <span>1. 核心 Governor Limits 配额对照表 (Sync vs Async)</span>
            <ChevronDown size={16} strokeWidth={1.5} />
          </summary>
          <div className="disclosure-body">
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>配额指标 (Governor Limit)</th>
                    <th>同步事务 (Synchronous)</th>
                    <th>异步事务 (Batch / Queueable / Future)</th>
                    <th>高频考点备注</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>SOQL 查询次数上限</td>
                    <td>100 次</td>
                    <td>200 次</td>
                    <td>循环内严禁写 SOQL</td>
                  </tr>
                  <tr>
                    <td>SOQL 单事务返回总行数</td>
                    <td>50,000 行</td>
                    <td>50,000 行 (Batch QueryLocator 5,000 万行)</td>
                    <td>COUNT/SUM 聚合扫描行数同样计入</td>
                  </tr>
                  <tr>
                    <td>DML 语句调用次数上限</td>
                    <td>150 次</td>
                    <td>150 次</td>
                    <td>setSavepoint / rollback 每次计 1 次 DML</td>
                  </tr>
                  <tr>
                    <td>DML 单事务影响记录行数</td>
                    <td>10,000 行</td>
                    <td>10,000 行</td>
                    <td>超万行修改需使用 Batch Apex</td>
                  </tr>
                  <tr>
                    <td>Heap Size 堆内存上限</td>
                    <td>6 MB</td>
                    <td>12 MB</td>
                    <td>用 SOQL For Loop 流式游标防溢出</td>
                  </tr>
                  <tr>
                    <td>CPU Time 处理时间上限</td>
                    <td>10,000 ms (10s)</td>
                    <td>60,000 ms (60s)</td>
                    <td>用 Map&lt;Id, sObject&gt; 替代双重嵌套循环</td>
                  </tr>
                  <tr>
                    <td>SOSL 全文搜索次数上限</td>
                    <td>20 次 (每次最多 2,000 行)</td>
                    <td>20 次</td>
                    <td>返回类型为 List&lt;List&lt;sObject&gt;&gt;</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </details>

        <details className="linear-disclosure" name="sf-cheatsheet">
          <summary>
            <span>2. 四大异步 Apex 选型决策矩阵 (@future / Queueable / Batch / Schedulable)</span>
            <ChevronDown size={16} strokeWidth={1.5} />
          </summary>
          <div className="disclosure-body">
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>异步机制</th>
                    <th>sObject 参数</th>
                    <th>返回 Job ID</th>
                    <th>链式调用 (Chaining)</th>
                    <th>核心适用场景</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>@future</td>
                    <td>仅限原始类型与集合</td>
                    <td>不支持 (void)</td>
                    <td>不支持 future 调 future</td>
                    <td>轻量异步 Callout、隔离 Mixed DML</td>
                  </tr>
                  <tr>
                    <td>Queueable</td>
                    <td>支持 sObject 与自定义类</td>
                    <td>返回 AsyncApexJob Id</td>
                    <td>支持 enqueueJob 链式与 Finalizer</td>
                    <td>复杂异步工作流、顺序外部接口调用</td>
                  </tr>
                  <tr>
                    <td>Batch Apex</td>
                    <td>支持 (配合 Database.Stateful)</td>
                    <td>返回 Job Id</td>
                    <td>可在 finish() 启动下一 Batch</td>
                    <td>最高 5,000 万行大批量数据清洗重算</td>
                  </tr>
                  <tr>
                    <td>Schedulable</td>
                    <td>支持</td>
                    <td>返回 CronTrigger Id</td>
                    <td>常在 execute 启动 Batch</td>
                    <td>按 Cron 表达式每日/每周定时调度</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </details>

        <details className="linear-disclosure" name="sf-cheatsheet">
          <summary>
            <span>3. LWC 装饰器、生命周期与跨组件通信速查</span>
            <ChevronDown size={16} strokeWidth={1.5} />
          </summary>
          <div className="disclosure-body">
            <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>@api</strong>：声明父组件传入的公共属性或方法。子组件严禁直接修改 @api 传入的对象属性（单向数据流）。
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>@wire</strong>：响应式读取 LDS 或带 <code>@AuraEnabled(cacheable=true)</code> 的只读 Apex 方法；参数前加 <code>$</code>（如 <code>&apos;$recordId&apos;</code>）表示响应式动态绑定；手动刷新缓存需将未解构的完整 <code>result</code> 传给 <code>refreshApex(this.wiredResult)</code>。
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>CustomEvent (子传父)</strong>：<code>this.dispatchEvent(new CustomEvent(&apos;itemselect&apos;, &#123; detail: &#123; id &#125; &#125;))</code>，父组件通过 <code>onitemselect=&#123;handleSelect&#125;</code> 监听。
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Lightning Message Service (LMS)</strong>：同页面无父子关系组件（跨 LWC、Aura、Visualforce）实时通信的标准方案。
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>lightning/empApi</strong>：LWC 订阅后端 Platform Events (<code>__e</code>) 或 Change Data Capture (CDC) 实时事件流。
              </li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
};
