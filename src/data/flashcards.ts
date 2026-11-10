import { FlashcardItem } from '../types';

export interface MockOrgTable {
  objectName: string;
  label: string;
  description: string;
  indexedFields: string[];
  fields: {
    name: string;
    type: string;
    indexed: boolean;
    note?: string;
  }[];
  sampleRows: Record<string, string | number | boolean>[];
}

export const FLASHCARDS_DATA: FlashcardItem[] = [
  {
    id: 'FC01',
    category: 'Governor Limits',
    frontTitleEn: 'Synchronous vs Asynchronous Governor Limits',
    frontTitle: '同步 vs 异步 Governor Limits 五大关键指标',
    frontPromptEn:
      'State the exact Synchronous vs Asynchronous limits for: 1) Total SOQL queries, 2) Total DML statements, 3) Heap size, 4) CPU time, and 5) System.enqueueJob() calls.',
    frontPrompt: '请默写：1) SOQL 查询次数；2) DML 语句次数；3) 堆内存 (Heap Size)；4) CPU 时间；5) System.enqueueJob() 在同步与异步下的确切上限。',
    backAnswerEn: `1. Total SOQL Queries: Sync 100 | Async 200 (Max 50,000 rows retrieved)
2. Total DML Statements: Sync 150 | Async 150 (Max 10,000 rows modified)
3. Heap Size Limit: Sync 6 MB | Async 12 MB
4. CPU Time Limit: Sync 10,000 ms (10s) | Async 60,000 ms (60s)
5. System.enqueueJob() Limit: Sync 50 | Async ONLY 1!`,
    backAnswer: `1. SOQL 查询总数：同步 100 次 | 异步 200 次（最多检索 50,000 行）
2. DML 语句总数：同步 150 次 | 异步 150 次（单次事务最多修改 10,000 行）
3. Heap Size 堆内存：同步 6 MB | 异步 12 MB
4. CPU Time 耗时：同步 10,000 ms (10秒) | 异步 60,000 ms (60秒)
5. System.enqueueJob() 次数：同步 50 次 | 异步仅限 1 次！`,
    examTip: 'Exam Trap (考场陷阱): System.LimitException CANNOT be caught by a try-catch block! And while SOQL/CPU/Heap limits double or increase in Async, System.enqueueJob drops from 50 in Sync to ONLY 1 in Async!'
  },
  {
    id: 'FC02',
    category: 'SOQL & Security',
    frontTitleEn: 'Parent-to-Child Subquery Relationship Name',
    frontTitle: '父查子子查询（Left Outer Join）的关系名称书写铁律',
    frontPromptEn:
      'In a Parent-to-Child SOQL subquery, what relationship name must be used after FROM for a Standard Relationship vs a Custom Relationship?',
    frontPrompt: '在父查子子查询 `(SELECT Id FROM ???)` 中，标准关系与自定义关系的表名分别该怎么写？',
    backAnswerEn: `- Standard Relationship: Use the plural Child Relationship Name (e.g., Contacts, Opportunities, Cases).
- Custom Relationship: Use the plural Child Relationship Name + "__r" (e.g., Invoices__r, Line_Items__r) — NEVER use the object API name "__c"!`,
    backAnswer: `- 标准关系：使用子关系复数形式（如 Contacts, Opportunities, Cases）。
- 自定义关系：必须使用子关系复数名 + "__r"（如 Invoices__r, Line_Items__r），绝不能写自定义对象名 "__c"！`,
    examTip: 'Exam Trap (考场陷阱): Any option showing (SELECT Id FROM Custom_Object__c) inside a subquery is 100% wrong — always look for the plural relationship name ending in __r.'
  },
  {
    id: 'FC03',
    category: 'Order of Execution',
    frontTitleEn: 'When to Use Before Trigger vs After Trigger',
    frontTitle: 'Before Trigger 与 After Trigger 的选择黄金法则',
    frontPromptEn:
      'In which 2 scenarios do you use a Before Trigger, and in which 2 scenarios MUST you use an After Trigger?',
    frontPrompt: '哪两类场景用 Before Trigger？哪两类场景必须用 After Trigger？',
    backAnswerEn: `- Before Trigger (90% of field defaults & validations):
  1. Modifying fields on the current record itself (Trigger.new) without an extra DML statement.
  2. Validating records with record.addError().
- After Trigger (Requires committed Record Id):
  1. Reading system-generated fields like Trigger.new[i].Id, CreatedDate, or Formula/Roll-up fields.
  2. Performing DML on related/other objects (e.g., creating child Contact or Audit__c records).`,
    backAnswer: `- Before Trigger（占自身字段处理 90%）：
  1. 修改当前触发记录（Trigger.new）自身的字段值（无需额外 DML）。
  2. 复杂业务校验并调用 record.addError() 阻断保存。
- After Trigger（依赖已生成的 Record Id）：
  1. 需要读取系统生成的只读字段（如 Id、CreatedDate）。
  2. 需要创建或更新其他关联对象记录（如插入子表 Contact 或审批日志）。`,
    examTip: 'Exam Trap (考场陷阱): Modifying a field on Trigger.new inside an after trigger throws System.FinalException: Record is read-only!'
  },
  {
    id: 'FC04',
    category: 'Order of Execution',
    frontTitleEn: '20-Step Save Order of Execution (Core Checkpoints)',
    frontTitle: 'Salesforce 20 步保存执行顺序核心顺序口诀',
    frontPromptEn:
      'In what exact order do Before-Save Flows, Before Triggers, Custom Validation Rules, After Triggers, and After-Save Flows execute? And what happens when a Workflow Field Update fires?',
    frontPrompt: '请按先后顺序排列：Before-Save Flow、Before Trigger、自定义验证规则、After Trigger、After-Save Flow；并说明 Workflow 字段更新会引发什么？',
    backAnswerEn: `1. System Validation (1st pass)
2. Before-Save Record-Triggered Flows
3. Apex before Triggers
4. System Validation (2nd pass) + Custom Validation Rules
5. Duplicate Rules
6. Save to DB (Id generated, NOT committed yet)
7. Apex after Triggers
8. Assignment -> Auto-Response -> Workflow Rules (if Field Update occurs -> re-runs before & after Triggers 1 more time, WITHOUT re-running Custom Validation Rules!)
9. Escalation -> Entitlement -> Roll-up Summary -> After-Save Record-Triggered Flows
10. Commit to DB -> Post-Commit Actions (@future, Queueable, Platform Events, Emails)`,
    backAnswer: `1. 系统级校验（第1次）
2. Before-Save Flow（记录保存前流）
3. Apex before Trigger
4. 系统级校验（第2次）+ 自定义验证规则（Custom Validation Rules）
5. 重复规则（Duplicate Rules）
6. 写入数据库生成 Id（尚未 Commit）
7. Apex after Trigger
8. 分配规则 -> 自动响应 -> 工作流规则（若有字段更新，before 和 after Trigger 会各重跑 1 次，但不重跑自定义验证规则！）
9. 升级规则 -> 汇总公式计算 -> After-Save Flow
10. 数据库事务提交（Commit）-> 提交后动作（发送邮件、异步任务、非立即型平台事件）`,
    examTip: 'Exam Trap (考场陷阱): Before-Save Flows run BEFORE before triggers; Custom Validation Rules run AFTER before triggers; Workflow Field Updates DO NOT re-evaluate Custom Validation Rules!'
  },
  {
    id: 'FC05',
    category: 'LWC Decorators & Lifecycle',
    frontTitleEn: 'LWC @wire Reactive Parameter & Cache Refresh',
    frontTitle: 'LWC @wire 响应式参数绑定与手动刷新缓存',
    frontPromptEn:
      'How do you make a @wire parameter reactive in LWC, and how must you invoke refreshApex() so it actually works?',
    frontPrompt: '如何在 @wire 中声明响应式参数？调用 refreshApex() 时最容易犯的错误是什么？',
    backAnswerEn: `1. Reactive Parameter: Prefix the property name with "$" inside a string literal: "$searchKey" (never use this.searchKey).
2. refreshApex(wiredResult): You MUST pass the entire raw wired result object received by the wire function (which contains { data, error }), NOT just this.data!`,
    backAnswer: `1. 响应式参数：必须将参数值写成带 $ 前缀的字符串（如 '$searchKey'），不能写 this.searchKey。
2. refreshApex(wiredResult)：必须将 @wire 函数接收到的【完整原始结果对象】（包含 data 和 error 的包装对象）保存起来传给 refreshApex()，绝不能只传解构后的 this.data！`,
    examTip: 'Exam Trap (考场陷阱): An Apex method used with @wire MUST be annotated with @AuraEnabled(cacheable=true) and cannot perform any DML statements.'
  },
  {
    id: 'FC06',
    category: 'LWC Decorators & Lifecycle',
    frontTitleEn: 'LWC 3-Tier Component Communication Matrix',
    frontTitle: 'LWC 跨组件通信的三大标准方案对比',
    frontPromptEn:
      'How do components communicate in LWC for: 1) Parent -> Child, 2) Child -> Parent, and 3) Unrelated Components across the page (LWC / Aura / VF)?',
    frontPrompt: '请分别说明：1) 父传子；2) 子传父；3) 同页无嵌套关系（甚至跨 LWC/Aura/VF）的通信方式。',
    backAnswerEn: `1. Parent -> Child: Expose @api public properties or @api public methods on the child component.
2. Child -> Parent: Dispatch a standard DOM CustomEvent: this.dispatchEvent(new CustomEvent('select', { detail: payload })).
3. Unrelated Components across DOM/Tech boundaries: Use Lightning Message Service (LMS) with a MessageChannel__c and @wire(MessageContext) + publish() / subscribe().`,
    backAnswer: `1. 父传子：子组件暴露 @api 公共属性或 @api 公共方法。
2. 子传父：子组件派发标准 DOM 事件 this.dispatchEvent(new CustomEvent('select', { detail: payload }))（注意 HTML 监听名为 onselect 全小写）。
3. 跨 DOM 树无父子关系组件（含跨 LWC/Aura/VF）：使用 Lightning Message Service (LMS) 及 MessageChannel。`,
    examTip: 'Exam Trap (考场陷阱): Never mutate an @api object property inside the child component — always clone payloads in CustomEvent detail and follow unidirectional data flow!'
  },
  {
    id: 'FC07',
    category: 'Async Apex',
    frontTitleEn: '4 Asynchronous Apex Mechanisms Comparison',
    frontTitle: '四大异步 Apex 机制核心能力对比表',
    frontPromptEn:
      'Compare @future, Queueable, Batchable, and Schedulable in terms of sObject parameter support, job chaining, and max record volume.',
    frontPrompt: '请对比 @future、Queueable、Batchable、Schedulable 在复杂参数传递、链式调用和最大数据量上的区别。',
    backAnswerEn: `- @future: Primitives/collections of primitives ONLY; NO job chaining; returns void (no Job Id).
- Queueable: Accepts sObjects & custom Apex types; supports chaining (System.enqueueJob, max 1 in async context!); returns AsyncApexJob Id.
- Batchable: Processes up to 50 Million records via Database.QueryLocator in chunks (default 200, max 2000); use Database.Stateful to retain member state across chunks.
- Schedulable: Runs on a CRON schedule or System.scheduleBatch().`,
    backAnswer: `- @future：仅支持原始数据类型及集合（不支持 sObject）；不能链式调用；不返回 Job ID。
- Queueable：支持传递 sObject 与自定义对象；支持链式调用（异步内最多 enqueue 1 次）；返回 AsyncApexJob ID。
- Batchable：通过 QueryLocator 最高处理 5,000 万条记录（默认 200 条/批）；跨批次保留状态需实现 Database.Stateful。
- Schedulable：按 CRON 表达式定时调度执行。`,
    examTip: 'Exam Trap (考场陷阱): Why can @future not accept List<Account>? Because the sObject record might change between the time @future is queued and when it actually executes!'
  },
  {
    id: 'FC08',
    category: 'Async Apex',
    frontTitleEn: 'Platform Events: Publish After Commit vs Publish Immediately',
    frontTitle: 'Platform Events 发布行为：Publish After Commit vs Publish Immediately',
    frontPromptEn:
      'What happens to published Platform Events if the publishing transaction rolls back under "Publish After Commit" vs "Publish Immediately"?',
    frontPrompt: '当主事务发生异常回滚（Rollback）时，这两种发布模式下的平台事件分别会怎样？',
    backAnswerEn: `- Publish After Commit: Events are sent ONLY after the database transaction commits successfully. If rolled back, the event is discarded (use for business state sync).
- Publish Immediately: Events are published immediately on EventBus.publish() in a separate context and are NEVER rolled back even if the transaction fails (use for error logging/audit trails).`,
    backAnswer: `- Publish After Commit（提交后发布）：只有主数据库事务成功 Commit 后才真正发出事件；若事务回滚，事件一并丢弃（适用于业务状态同步）。
- Publish Immediately（立即发布）：调用 EventBus.publish() 瞬间立即发出，不受当前事务回滚影响（适用于记录错误审计日志）。`,
    examTip: 'Exam Trap (考场陷阱): If an exam question asks how to persist error logs to a custom table even when an exception rolls back the transaction, the answer is always a Platform Event configured with Publish Immediately!'
  },
  {
    id: 'FC09',
    category: 'SOQL & Security',
    frontTitleEn: 'Sharing Keywords vs Object/Field Security (CRUD/FLS)',
    frontTitle: 'Apex 共享关键字 vs 字段级安全（FLS/CRUD）的双维区分',
    frontPromptEn:
      'Does "with sharing" enforce Object CRUD and Field-Level Security (FLS)? How do you enforce CRUD/FLS in modern Apex?',
    frontPrompt: '类上声明了 `with sharing` 会自动检查字段级权限（FLS）和对象增删改查权限（CRUD）吗？如何真正强制执行 CRUD/FLS？',
    backAnswerEn: `- NO! "with sharing" ONLY enforces Record-Level Sharing (OWD, Role Hierarchy, Sharing Rules). It NEVER enforces Object CRUD or Field-Level Security (FLS).
- To enforce CRUD + FLS + Sharing in Apex:
  1. SOQL: Append WITH USER_MODE (recommended) or WITH SECURITY_ENFORCED.
  2. DML: Use insert as user records; or Database.insert(records, allOrNone, AccessLevel.USER_MODE).
  3. Sanitize in memory: Security.stripInaccessible(AccessType.READABLE / CREATABLE / UPDATABLE, records).`,
    backAnswer: `- 不会！with sharing 仅控制【记录行级可见性（Record-Level Sharing）】，绝不会自动校验对象 CRUD 和字段 FLS。
- 真正强制执行 CRUD/FLS 的三大现代方案：
  1. SOQL 尾部加 WITH USER_MODE（同时执行 FLS + CRUD + Sharing）。
  2. DML 使用 insert as user list; 或 AccessLevel.USER_MODE。
  3. 使用 Security.stripInaccessible(AccessType.READABLE/UPDATABLE, list) 剥离越权字段。`,
    examTip: 'Exam Trap (考场陷阱): WITH SECURITY_ENFORCED throws an exception if a field is inaccessible, whereas Security.stripInaccessible() silently removes inaccessible fields without crashing and returns getRemovedFields()!'
  },
  {
    id: 'FC10',
    category: 'Governor Limits',
    frontTitleEn: 'Apex Deployment Test Coverage & @TestSetup Rollback Rules',
    frontTitle: 'Apex 生产部署测试覆盖率红线与 @TestSetup 事务回滚法则',
    frontPromptEn:
      'What are the exact coverage rules for deploying to Production, and what happens if one @IsTest method modifies records created in @TestSetup?',
    frontPrompt: '代码部署到生产环境的覆盖率要求是什么？@TestSetup 创建的数据在多个测试方法之间会互相污染吗？',
    backAnswerEn: `1. Coverage Rules:
   - Overall org Apex code coverage must be >= 75%.
   - Every deployed Apex Trigger must have > 0% coverage (at least 1 line covered).
2. @TestSetup Rollback Isolation:
   - @TestSetup runs ONCE per test class. Before each @IsTest method starts, Salesforce creates a savepoint and rolls back all changes after each test method finishes, so other @IsTest methods always see the clean original @TestSetup data!`,
    backAnswer: `1. 部署覆盖率双红线：
   - 整体 Apex 代码行覆盖率必须 >= 75%。
   - 每个被部署的 Apex Trigger 覆盖率必须 > 0%（至少覆盖 1 行，且所有测试不可报错）。
2. @TestSetup 隔离机制：
   - @TestSetup 在整个测试类中只运行一次；每个 @IsTest 方法运行完毕后，其对 @TestSetup 数据的修改都会自动回滚到初始快照，绝不污染其他测试方法！`,
    examTip: 'Exam Trap (考场陷阱): Test.startTest() and Test.stopTest() can only be called ONCE per @IsTest method, and Test.stopTest() forces all asynchronous @future/Queueable/Batch calls to finish synchronously!'
  },
  {
    id: 'FC11',
    category: 'Governor Limits',
    frontTitleEn: 'Custom Metadata Types (__mdt) vs Custom Settings (__c)',
    frontTitle: '自定义元数据 (__mdt) vs 自定义设置 (__c) 核心区别',
    frontPromptEn:
      'Compare Custom Metadata Types (__mdt) and Custom Settings (__c) regarding metadata deployment of records, Governor Limits, and User/Profile personalization.',
    frontPrompt: '请从“数据记录能否随包部署”、“Governor Limit 计费”和“按用户/简档个性化”三个维度对比 Custom Metadata 与 Custom Settings。',
    backAnswerEn: `1. Deployment: Custom Metadata (__mdt) records ARE metadata and deploy automatically via Packages/Change Sets/CLI. Custom Settings (__c) records are data and must be migrated separately.
2. Governor Limits: Both support getAll() / getInstance() from application cache (0 SOQL queries). Standard SOQL on __mdt (without Long Text Area) also does not count against the 100 SOQL limit.
3. User/Profile Personalization: Hierarchy Custom Settings natively support Organization -> Profile -> User overrides via getInstance() and $Setup in formulas.`,
    backAnswer: `1. 部署迁移：Custom Metadata (__mdt) 的【记录本身也是元数据】，可随 Change Set / Package / CLI 直接部署；Custom Settings (__c) 的记录属于业务数据，部署后需单独导数。
2. 配额消耗：两者均支持通过 getAll() / getInstance() 从应用缓存读取（0 SOQL 消耗）；查询不含长文本字段的 __mdt 也不扣减 100 次 SOQL 配额。
3. 层级覆写：Hierarchy Custom Settings 原生支持按 Org -> Profile -> User 三级覆写，且可在公式与验证规则中通过 $Setup 直接引用。`,
    examTip: 'Exam Trap (考场陷阱): Need records deployed with a package? Choose Custom Metadata (__mdt). Need different values per Profile or User in a Validation Rule ($Setup)? Choose Hierarchy Custom Settings!'
  },
  {
    id: 'FC12',
    category: 'Order of Execution',
    frontTitleEn: 'Flow @InvocableMethod Bulkification Contract',
    frontTitle: '供 Flow 调用的 @InvocableMethod 批量化签名铁律',
    frontPromptEn:
      'What are the strict rules for declaring an @InvocableMethod in Apex, and what happens when 100 records trigger a Flow Interview simultaneously?',
    frontPrompt: '声明 `@InvocableMethod` 有哪些严格规则？当 100 条记录同时触发调用该方法的 Flow 时会发生什么？',
    backAnswerEn: `1. Modifier Rules: Must be static, and either public or global; a class can contain at most ONE @InvocableMethod.
2. Signature Contract: Input and output (if not void) MUST be a List<T> (or List<List<T>>) whose outer size matches 1-to-1 with the batch of Flow Interviews!
3. Runtime Bulkification: When 100 records are inserted in bulk, Salesforce batches all 100 Flow Interviews and calls the @InvocableMethod ONCE with a List of 100 elements.`,
    backAnswer: `1. 修饰符限制：必须是 static 且为 public 或 global；每个 Apex 类最多只能包含 1 个 @InvocableMethod。
2. 签名契约：入参和返回值（若非 void）的外层类型必须是 List<T>（或 List<List<T>>），且返回列表的元素个数必须与输入列表的元素个数严格 1:1 对应！
3. 自动批量化：当单次批量插入 100 条记录触发 Flow 时，平台会自动将 100 个采访合并为长度为 100 的 List，仅调用 1 次该 Apex 方法。`,
    examTip: 'Exam Trap (考场陷阱): Pass multiple input parameters from Flow into Apex by creating an inner wrapper class with @InvocableVariable properties!'
  },
  {
    id: 'FC13',
    category: 'SOQL & Security',
    frontTitleEn: 'Apex Managed Sharing (__Share & RowCause)',
    frontTitle: 'Apex 托管共享（Apex Managed Sharing）的四大要素',
    frontPromptEn:
      'How do you programmatically share a custom object record (`Job__c`) so the sharing persists even when the record Owner changes?',
    frontPrompt: '如何通过代码动态共享一条自定义对象记录（`Job__c`），且保证在记录所有人（Owner）变更后共享依然保留？',
    backAnswerEn: `1. Share Table: Instantiate Job__Share (Standard objects use AccountShare, OpportunityShare without double underscore).
2. 4 Required Fields:
   - ParentId: Record Id being shared
   - UserOrGroupId: Target User or Public Group Id
   - AccessLevel: 'Read' or 'Edit'
   - RowCause: Schema.Job__Share.RowCause.My_Custom_Reason__c (Apex Sharing Reason guarantees persistence across Owner changes; only available for Custom Objects!)`,
    backAnswer: `1. 共享表名：自定义对象为 <Object>__Share（如 Job__Share）；标准对象为 <Object>Share（如 AccountShare，无双下划线）。
2. 必填四字段：
   - ParentId：被共享记录的 ID
   - UserOrGroupId：目标用户或公共组 ID
   - AccessLevel：'Read' 或 'Edit'
   - RowCause：指定为自定义 Apex Sharing Reason（Schema.Job__Share.RowCause.Reason__c），这样即使记录更改了 Owner，该共享记录也不会被系统清除！（注：Apex Sharing Reason 仅支持自定义对象）。`,
    examTip: 'Exam Trap (考场陷阱): Objects on the Detail side of a Master-Detail relationship DO NOT have a __Share table because their sharing is controlled by the Master record!'
  },
  {
    id: 'FC14',
    category: 'Async Apex',
    frontTitleEn: 'LWC Continuation for Long-Running Callouts',
    frontTitle: 'LWC 调用耗时超长外部接口：Continuation 异步回调架构',
    frontPromptEn:
      'Why use the Continuation class in LWC/Aura, what is its concurrent limit vs normal synchronous callouts, and how is the Apex method annotated?',
    frontPrompt: '为什么在 LWC 中使用 `Continuation` 类？它解决什么并发限制？Apex 方法该如何添加注解？',
    backAnswerEn: `1. Problem Solved: Normal synchronous callouts lasting > 5 seconds count against the org-wide limit of 10 concurrent long-running requests. Continuation offloads the HTTP wait from the Apex thread (up to 120s timeout, up to 3 chained/parallel HttpRequests).
2. Annotation:
   - Entry method: @AuraEnabled(continuation=true cacheable=true) returning Object (a new Continuation(timeoutSecs) instance with cont.continuationMethod = 'callbackName').
   - Callback method: static Object callbackName(List<String> labels, Object state).`,
    backAnswer: `1. 解决痛点：普通同步请求耗时若超过 5 秒，会占用全 Org 仅有的 10 个并发长请求（Concurrent Long-Running Requests）名额。Continuation 在等待外部 HTTP 响应时释放 Apex 工作线程，不占该并发名额（单次支持最多串联/并联 3 个 HttpRequest，超时高达 120 秒）。
2. 核心语法：
   - 入口方法声明 @AuraEnabled(continuation=true)，返回 new Continuation(40) 实例并指定 cont.continuationMethod 和 cont.state。
   - 回调方法通过 Continuation.getResponse(labels[0]) 获取结果并返回给 LWC。`,
    examTip: 'Exam Trap (考场陷阱): In PD2, whenever an LWC or Visualforce page needs to make a slow callout (> 5s) without hitting the Concurrent Request Limit of 10, Continuation is the right answer!'
  },
  {
    id: 'FC15',
    category: 'LWC Decorators & Lifecycle',
    frontTitleEn: 'refreshApex() vs notifyRecordUpdateAvailable()',
    frontTitle: 'refreshApex() 与 notifyRecordUpdateAvailable() 的黄金分野',
    frontPromptEn:
      'When an LWC modifies database records via an imperative Apex call, when should it call refreshApex() vs notifyRecordUpdateAvailable()?',
    frontPrompt: '当 LWC 通过命令式 Apex 修改了数据库记录后，什么时候该用 `refreshApex()`？什么时候该用 `notifyRecordUpdateAvailable()`？',
    backAnswerEn: `- refreshApex(wiredApexResult): Refreshes the client cache of a custom @wire(myApexMethod) call.
- notifyRecordUpdateAvailable([{ recordId }]): Imported from "lightning/uiRecordApi" (replaces deprecated getRecordNotifyChange). Tells Lightning Data Service (LDS) to refresh standard record pages, @wire(getRecord), and lightning-record-form / view-form / edit-form!`,
    backAnswer: `- refreshApex(wiredApexResult)：用于刷新绑定到【自定义 Apex @wire 方法】的缓存结果。
- notifyRecordUpdateAvailable([{ recordId }])：从 "lightning/uiRecordApi" 导入（替代已废弃的 getRecordNotifyChange），用于通知【Lightning Data Service (LDS)】某条记录已在后端被修改，从而自动刷新页面上的标准详情组件、@wire(getRecord) 以及 lightning-record-form！`,
    examTip: 'Exam Trap (考场陷阱): Imperative Apex DML bypasses LDS on the client. To make standard record pages and LDS forms update immediately without page reload, call notifyRecordUpdateAvailable([{ recordId }])!'
  },
  {
    id: 'FC16',
    category: 'SOQL & Security',
    frontTitleEn: '3 Essential Apex Test Data Utilities (SOSL, CSV, CreatedDate)',
    frontTitle: 'Apex 单元测试三大特殊造数 API（SOSL / CSV / CreatedDate）',
    frontPromptEn:
      'Which 3 Test.* methods are used to: 1) Mock SOSL FIND results, 2) Load test records from a Static Resource CSV, and 3) Backdate CreatedDate?',
    frontPrompt: '在 `@IsTest` 中，哪三个 `Test.*` 方法分别用于：1) 让 SOSL 返回结果；2) 从静态资源 CSV 批量导数；3) 将记录创建时间改为过去？',
    backAnswerEn: `1. SOSL in Tests: Test.setFixedSearchResults(List<Id> fixedSearchResults) — without this, SOSL FIND always returns empty lists in unit tests!
2. CSV Static Resource: List<SObject> recs = Test.loadData(Account.SObjectType, 'MyAccountCsvResource');
3. Backdate Audit Timestamp: Test.setCreatedDate(recordId, DateTime.now().addDays(-90)); (must be called AFTER inserting the record).`,
    backAnswer: `1. 模拟 SOSL 全文检索结果：Test.setFixedSearchResults(List<Id>)（不调用它则测试中 SOSL 永远返回空列表！）。
2. 从 CSV 静态资源加载数据：Test.loadData(Account.SObjectType, 'StaticResourceName')。
3. 修改只读创建时间：Test.setCreatedDate(recordId, pastDateTime)（必须在 insert 记录获得 Id 之后调用）。`,
    examTip: 'Exam Trap (考场陷阱): Never use @IsTest(SeeAllData=true) for SOSL or historical data tests — use Test.setFixedSearchResults(), Test.loadData(), and Test.setCreatedDate()!'
  },
  {
    id: 'FC17',
    category: 'Async Apex',
    frontTitleEn: 'Callout Before DML Rule & Platform Event Retry',
    frontTitle: '“先 Callout 后 DML”铁律与平台事件触发器重试机制',
    frontPromptEn:
      '1) Why does executing a DML statement before an HTTP callout fail? 2) How do you retry a failed Platform Event trigger batch up to 9 times?',
    frontPrompt: '1) 为什么在同一个事务中先执行 DML 再发起 HTTP Callout 会报错？2) 平台事件触发器遇到临时故障如何触发自动重试？',
    backAnswerEn: `1. Uncommitted Work Pending: Salesforce forbids holding open database transaction locks while waiting for external HTTP callouts. Always make ALL HTTP Callouts FIRST, then execute DML (or move the callout to @future(callout=true) / Queueable with Database.AllowsCallouts).
2. Platform Event Trigger Retry: Throw new EventBus.RetryableException('Temporary outage'); inside the after insert trigger. The platform rolls back and retries up to 9 times (Check EventBus.TriggerContext.currentContext().retries < 5).`,
    backAnswer: `1. Uncommitted Work Pending 铁律：Salesforce 严禁在持有未提交数据库事务锁（已执行 DML 或发送邮件）的状态下发起同步 HTTP Callout。必须在同一事务中【先完成所有 HTTP Callout，最后再执行 DML】，或者将 Callout 放到异步 Queueable / @future(callout=true) 中。
2. 平台事件重试：在平台事件 after insert 触发器中抛出 throw new EventBus.RetryableException('msg')，系统会自动回滚并按退避策略最多重试 9 次（可通过 EventBus.TriggerContext.currentContext().retries 检查当前重试次数）。`,
    examTip: 'Exam Trap (考场陷阱): System.CalloutException: You have uncommitted work pending. Please commit or rollback before calling out!'
  },
  {
    id: 'FC18',
    category: 'Order of Execution',
    frontTitleEn: 'Workflow Field Update vs Recursive Trigger Guard Trap',
    frontTitle: 'Workflow 字段更新重跑与静态布尔递归锁的大坑',
    frontPromptEn:
      'Why does a simple "public static Boolean hasRun = false;" anti-recursion flag fail when processing 1,000 records via Data Loader (Batch Size 200)?',
    frontPrompt: '为什么在 Trigger Handler 中使用简单的 `public static Boolean hasRun = false;` 防递归锁，在用 Data Loader 导入 1,000 条记录时会引发严重漏处理 Bug？',
    backAnswerEn: `- Static variables persist across the ENTIRE Apex transaction!
- When 1,000 records are inserted in a single transaction, Salesforce chunks Trigger.new into 5 sub-batches of 200 records each.
- If chunk #1 sets hasRun = true, chunks #2, #3, #4, and #5 (the remaining 800 records!) are completely skipped!
- Best Practice: Use a static Set<Id> processedRecordIds (or Map<TriggerOperation, Set<Id>>) to track specific record IDs that have already been processed.`,
    backAnswer: `- 静态变量（Static Variable）的生命周期贯穿【整个 Apex 事务】！
- 当单次事务导入 1,000 条记录时，平台会将 Trigger.new 拆分为 5 个 200 条的子批次（Chunk）依次调用 Trigger。
- 如果第 1 批（前 200 条）把 hasRun 设为了 true，后面的第 2~5 批（整整 800 条记录！）会直接被跳过不执行！
- 最佳实践：使用 private static Set<Id> processedIds = new Set<Id>(); 按记录 ID 集合（或结合 TriggerOperation）进行细粒度防重入控制。`,
    examTip: 'Exam Trap (考场陷阱): Whenever an exam scenario says "a trigger works for 200 records in a test but only processes the first 200 out of 1,000 records during a Data Loader import", the culprit is a static Boolean recursion flag!'
  },
  {
    id: 'FC19',
    category: 'LWC Decorators & Lifecycle',
    frontTitleEn: 'Aura vs LWC Containment & Screen Flow Interop',
    frontTitle: 'Aura/LWC 嵌套方向铁律与 Screen Flow 交互事件',
    frontPromptEn:
      '1) Can LWC contain Aura or vice versa? 2) Which 2 events from "lightning/flowSupport" allow an LWC to update Flow variables and advance screens?',
    frontPrompt: '1) Aura 和 LWC 谁能包含谁？2) LWC 嵌入 Screen Flow 时，通过哪两个事件回传变量并推动下一步？',
    backAnswerEn: `1. Containment Rule: An Aura component CAN contain an LWC, but an LWC CANNOT contain an Aura component! (Always migrate Aura hierarchies bottom-up from leaf components).
2. Screen Flow Interop ("lightning/flowSupport"):
   - Update Flow output variable: this.dispatchEvent(new FlowAttributeChangeEvent('propName', newValue));
   - Navigate to next screen: this.dispatchEvent(new FlowNavigationNextEvent());`,
    backAnswer: `1. 嵌套铁律：外层 Aura 组件【可以】包含内层 LWC 组件，但 LWC 组件【绝对不能】包含 Aura 组件！（因此老项目迁移必须自底向上从最内层子组件开始重构）。
2. Screen Flow 交互（导入自 "lightning/flowSupport"）：
   - 回传修改后的变量值：this.dispatchEvent(new FlowAttributeChangeEvent('propName', val))
   - 触发跳转到下一屏：this.dispatchEvent(new FlowNavigationNextEvent())（可先校验 @api availableActions.includes('NEXT')）。`,
    examTip: 'Exam Trap (考场陷阱): To embed an LWC inside a Visualforce page, use Lightning Out (<apex:includeLightning /> + ltng:outApp + $Lightning.use + $Lightning.createComponent).'
  },
  {
    id: 'FC20',
    category: 'Governor Limits',
    frontTitleEn: '4 Salesforce Sandbox Types Comparison',
    frontTitle: 'Salesforce 四大沙盒（Sandbox）类型容量与刷新周期对比',
    frontPromptEn:
      'Compare Developer, Developer Pro, Partial Copy, and Full Sandboxes in terms of Data Storage, File Storage, Refresh Interval, and Data Template support.',
    frontPrompt: '请对比 Developer、Developer Pro、Partial Copy 和 Full 四种沙盒的数据容量、刷新间隔以及是否自动带出生产业务数据。',
    backAnswerEn: `1. Developer Sandbox: 200 MB Data | 200 MB File | Refresh: 1 Day | Metadata ONLY (no production data).
2. Developer Pro Sandbox: 1 GB Data | 1 GB File | Refresh: 1 Day | Metadata ONLY (no production data).
3. Partial Copy Sandbox: 5 GB Data | Same File storage as Prod | Refresh: 5 Days | Metadata + Sampled Data via Sandbox Template (max 10,000 rows per object).
4. Full Sandbox: Same Data & File storage as Prod | Refresh: 29 Days | Full replica of Prod (supports Sandbox Template filtering; best for Load/Performance & Staging tests).`,
    backAnswer: `1. Developer：200 MB 数据 | 200 MB 文件 | 1 天可刷新 | 仅复制元数据（不含业务数据）。
2. Developer Pro：1 GB 数据 | 1 GB 文件 | 1 天可刷新 | 仅复制元数据（适合日常开发与集成测试）。
3. Partial Copy：5 GB 数据 | 5 天可刷新 | 元数据 + 按 Sandbox Template 抽样的真实业务数据（单对象上限 10,000 条，适合 UAT/QA）。
4. Full Sandbox：与生产环境完全相同的数据容量 | 29 天可刷新 | 完整生产副本（唯一支持完整性能压测 Load Testing 与准生产预演的环境）。`,
    examTip: 'Exam Trap (考场陷阱): Only Partial Copy (required) and Full (optional) Sandboxes support Sandbox Templates to copy production sample records!'
  }
];

export const FLASHCARDS = FLASHCARDS_DATA;

export const MOCK_ORG_TABLES: MockOrgTable[] = [
  {
    objectName: 'Account',
    label: '客户 (Account)',
    description: '标准客户主表，包含行业、评级、年营收等高频查询字段。',
    indexedFields: ['Id', 'Name', 'OwnerId', 'RecordTypeId', 'External_Code__c'],
    fields: [
      { name: 'Id', type: 'Id (Primary Key)', indexed: true, note: '标准主键索引' },
      { name: 'Name', type: 'String(255)', indexed: true, note: '标准名称索引' },
      { name: 'Industry', type: 'Picklist', indexed: false, note: '非索引下拉字段' },
      { name: 'Rating', type: 'Picklist', indexed: false, note: 'Hot / Warm / Cold' },
      { name: 'AnnualRevenue', type: 'Currency(18,0)', indexed: false },
      { name: 'Phone', type: 'Phone', indexed: false },
    ],
    sampleRows: [
      {
        Id: '0018d00000A1B2C',
        Name: 'Acme Global Cloud Corp',
        Industry: 'Technology',
        Rating: 'Hot',
        AnnualRevenue: 4800000,
        Phone: '+1-415-890-2201',
      },
      {
        Id: '0018d00000A1B2D',
        Name: 'Pacific BioMed Holdings',
        Industry: 'Biotechnology',
        Rating: 'Warm',
        AnnualRevenue: 1950000,
        Phone: '+1-650-442-1190',
      },
      {
        Id: '0018d00000A1B2E',
        Name: 'Apex Logistics International',
        Industry: 'Transportation',
        Rating: 'Hot',
        AnnualRevenue: 8200000,
        Phone: '+1-206-771-9088',
      },
      {
        Id: '0018d00000A1B2F',
        Name: 'Northern Retail Group',
        Industry: 'Retail',
        Rating: 'Cold',
        AnnualRevenue: 620000,
        Phone: '+1-312-550-3341',
      },
    ],
  },
  {
    objectName: 'Opportunity',
    label: '商机 (Opportunity)',
    description: '标准销售商机表，通过 AccountId 关联父级客户。',
    indexedFields: ['Id', 'Name', 'AccountId', 'OwnerId', 'CreatedDate', 'SystemModstamp'],
    fields: [
      { name: 'Id', type: 'Id (Primary Key)', indexed: true },
      { name: 'Name', type: 'String(120)', indexed: true },
      { name: 'AccountId', type: 'Lookup(Account)', indexed: true, note: '外键自动索引' },
      { name: 'StageName', type: 'Picklist', indexed: false },
      { name: 'Amount', type: 'Currency(16,2)', indexed: false },
      { name: 'CloseDate', type: 'Date', indexed: false },
    ],
    sampleRows: [
      {
        Id: '0068d00000X9Y01',
        Name: 'Acme Enterprise License Q4',
        AccountId: '0018d00000A1B2C',
        StageName: 'Closed Won',
        Amount: 320000,
        CloseDate: '2025-03-31',
      },
      {
        Id: '0068d00000X9Y02',
        Name: 'Acme AI Add-On Expansion',
        AccountId: '0018d00000A1B2C',
        StageName: 'Negotiation/Review',
        Amount: 145000,
        CloseDate: '2025-04-15',
      },
      {
        Id: '0068d00000X9Y03',
        Name: 'Pacific Clinical CRM Rollout',
        AccountId: '0018d00000A1B2D',
        StageName: 'Proposal/Price Quote',
        Amount: 210000,
        CloseDate: '2025-05-10',
      },
      {
        Id: '0068d00000X9Y04',
        Name: 'Apex Fleet IoT Platform',
        AccountId: '0018d00000A1B2E',
        StageName: 'Closed Won',
        Amount: 580000,
        CloseDate: '2025-02-28',
      },
    ],
  },
  {
    objectName: 'Contact',
    label: '联系人 (Contact)',
    description: '标准联系人表，通过 AccountId 关联客户。',
    indexedFields: ['Id', 'Name', 'Email', 'AccountId', 'OwnerId'],
    fields: [
      { name: 'Id', type: 'Id (Primary Key)', indexed: true },
      { name: 'Name', type: 'String(121)', indexed: true },
      { name: 'Title', type: 'String(128)', indexed: false },
      { name: 'Email', type: 'Email', indexed: true, note: '标准邮箱索引' },
      { name: 'Phone', type: 'Phone', indexed: false },
      { name: 'AccountId', type: 'Lookup(Account)', indexed: true, note: '外键索引' },
    ],
    sampleRows: [
      {
        Id: '0038d00000C1D01',
        Name: 'Elena Vance',
        Title: 'VP of Engineering',
        Email: 'elena.vance@acmecloud.io',
        Phone: '+1-415-890-2201',
        AccountId: '0018d00000A1B2C',
      },
      {
        Id: '0038d00000C1D02',
        Name: 'Marcus Chen',
        Title: 'Chief Architect',
        Email: 'm.chen@pacificbiomed.org',
        Phone: '+1-650-442-1190',
        AccountId: '0018d00000A1B2D',
      },
      {
        Id: '0038d00000C1D03',
        Name: 'Sarah Jenkins',
        Title: 'Director of Operations',
        Email: 'sjenkins@apexlogistics.com',
        Phone: '+1-206-771-9088',
        AccountId: '0018d00000A1B2E',
      },
    ],
  },
  {
    objectName: 'Project__c',
    label: '自定义交付项目 (Project__c)',
    description: '自定义对象，子关系名为 Projects__r，关联客户 Account__c。',
    indexedFields: ['Id', 'Name', 'Account__c', 'External_ID__c'],
    fields: [
      { name: 'Id', type: 'Id (Primary Key)', indexed: true },
      { name: 'Name', type: 'String(80)', indexed: true },
      { name: 'Account__c', type: 'Master-Detail(Account)', indexed: true, note: '主详外键索引' },
      { name: 'Status__c', type: 'Picklist', indexed: false },
      { name: 'Budget__c', type: 'Currency(16,2)', indexed: false },
    ],
    sampleRows: [
      {
        Id: 'a018d00000P001A',
        Name: 'PRJ-2025-LWC-MIGRATION',
        Account__c: '0018d00000A1B2C',
        Status__c: 'Active',
        Budget__c: 185000,
      },
      {
        Id: 'a018d00000P002B',
        Name: 'PRJ-2025-ERP-INTEGRATION',
        Account__c: '0018d00000A1B2E',
        Status__c: 'Active',
        Budget__c: 420000,
      },
    ],
  },
];
