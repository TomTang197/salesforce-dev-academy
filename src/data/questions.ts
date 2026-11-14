import { ExamQuestion, TechDomain } from '../types';
import { QUESTIONS_PART_1 } from './questionsPart1';
import { QUESTIONS_PART_2 } from './questionsPart2';
import { QUESTIONS_PART_3 } from './questionsPart3';
import { QUESTIONS_PART_4 } from './questionsPart4';

export interface BlueprintSectionCoverage {
  id: string;
  sectionEn: string;
  sectionZh: string;
  examWeightPd1: string;
  examWeightPd2: string;
  domain: TechDomain;
  coveredTopics: string[];
  questionIds: string[];
}

export const EXAM_QUESTIONS: ExamQuestion[] = [
  ...QUESTIONS_PART_1,
  ...QUESTIONS_PART_2,
  ...QUESTIONS_PART_3,
  ...QUESTIONS_PART_4
];

/**
 * Study-topic sections mapped to the official outlines (checked 2026-11):
 * - Platform Developer (PD1): Developer Fundamentals 27%, Process Automation & Logic 28%,
 *   User Interface 25%, Testing, Debugging & Deployment 20%.
 * - Platform Developer II (PD2): Advanced Developer Fundamentals 15%, Process Automation,
 *   Logic & Integration 27%, User Interface 20%, Testing, Debugging & Deployment 20%, Performance 18%.
 * Sections 2 and 5 are slices of the PD1 "Process Automation & Logic" domain, and section 6 combines
 * the sharing/CRUD/FLS part of "Developer Fundamentals" with "Testing, Debugging & Deployment".
 */
export const EXAM_BLUEPRINT_COVERAGE: BlueprintSectionCoverage[] = [
  {
    id: 'BP1',
    sectionEn: '1. Developer Fundamentals, Data Modeling & Declarative vs Programmatic',
    sectionZh: '1. 开发者基础、数据建模与声明式 vs 编程式架构',
    examWeightPd1: '27%',
    examWeightPd2: '15%',
    domain: 'Apex 核心与面向对象 (Apex & OOP)',
    coveredTopics: [
      'Multi-tenant Governor Limits, Limits Class & Map<Id, SObject> Constructor (Q01, Q03, Q04, Q119)',
      'Master-Detail vs Lookup, Junction Objects, Hierarchical Relationships & Roll-Up Summary (Q02, Q49-Q51, Q123)',
      'Custom Metadata (__mdt) vs Hierarchy Custom Settings & Data Import Wizard vs Data Loader (Q52-Q54)',
      'OOP: virtual/abstract/override, Custom Set/Map Keys (equals/hashCode), Static vs Instance Members (Q55, Q58, Q124)',
      'SObjectException on Unqueried Fields, Dynamic Describe & Type.forName() Reflection (Q57, Q71, Q72)',
      'Declarative vs Programmatic Choice, MVC on the Platform & Managed Package global Modifier (Q99, Q118, Q120)'
    ],
    questionIds: [
      'Q01', 'Q02', 'Q03', 'Q04',
      'Q49', 'Q50', 'Q51', 'Q52', 'Q53', 'Q54', 'Q55', 'Q57', 'Q58',
      'Q71', 'Q72', 'Q99',
      'Q118', 'Q119', 'Q120', 'Q123', 'Q124'
    ]
  },
  {
    id: 'BP2',
    sectionEn: '2. SOQL, SOSL, DML & Large Data Volumes (LDV)',
    sectionZh: '2. SOQL/SOSL 高级查询、DML 事务控制与海量数据（LDV）调优',
    examWeightPd1: 'in Logic 28%',
    examWeightPd2: 'Performance 18% + Logic',
    domain: 'SOQL & SOSL 数据查询 (Data Query)',
    coveredTopics: [
      'SOSL List<List<SObject>> & Custom Relationship Queries (__r) (Q07, Q08)',
      'SOQL For Loops (Heap), AggregateResult Aliases & Query-Row Accounting for COUNT vs SUM (Q19-Q21)',
      'Database.insert(list, false) Partial Success, Mixed DML & Upsert by External ID (Q22-Q24)',
      'LDV Selective Queries, Indexes & UNABLE_TO_LOCK_ROW Mitigation (Q45, Q46)',
      'Polymorphic TYPEOF, FOR VIEW / FOR REFERENCE & Multi-Currency convertCurrency() (Q73-Q75)'
    ],
    questionIds: [
      'Q07', 'Q08',
      'Q19', 'Q20', 'Q21', 'Q22', 'Q23', 'Q24',
      'Q45', 'Q46',
      'Q73', 'Q74', 'Q75'
    ]
  },
  {
    id: 'BP3',
    sectionEn: '3. Process Automation, Apex Triggers & Save Order of Execution',
    sectionZh: '3. 流程自动化、Apex 触发器架构与保存执行顺序',
    examWeightPd1: '28%',
    examWeightPd2: '27%',
    domain: 'Trigger 与执行顺序 (Triggers & Order of Execution)',
    coveredTopics: [
      'Before Triggers vs Validation Rules, Trigger Context Variables & before/after Design (Q13, Q14, Q16)',
      'Roll-Up Summary Parent Save Cycle & Legacy Workflow Field Update Re-run (Workflow/Process Builder end of support Dec 31, 2025) (Q15, Q76)',
      'Trigger Chunking (200 per invocation, one transaction) & Set<Id> Recursion Guard (Q17, Q18)',
      'Custom Exceptions & Flow-to-Apex @InvocableMethod Bulkification (Q56, Q59)',
      'merge Triggers, Trigger.isExecuting, after undelete & Bulk Database.convertLead (Q77-Q80)'
    ],
    questionIds: [
      'Q13', 'Q14', 'Q15', 'Q16', 'Q17', 'Q18',
      'Q56', 'Q59',
      'Q76', 'Q77', 'Q78', 'Q79', 'Q80'
    ]
  },
  {
    id: 'BP4',
    sectionEn: '4. User Interface: LWC, Wire Service, LDS, Aura & Visualforce',
    sectionZh: '4. 用户界面：LWC 组件、Wire/LDS、跨组件通信与 Visualforce/Aura/Flow 互操作',
    examWeightPd1: '25%',
    examWeightPd2: '20%',
    domain: 'LWC 现代前端组件 (Lightning Web Components)',
    coveredTopics: [
      'Component Naming, iterator, js-meta.xml Targets, lwc:if & Getters (Q10-Q12)',
      'CustomEvent, @api Public Methods, LMS & empApi (Q25-Q27, Q44, Q117)',
      '@wire + cacheable=true, refreshApex, Lifecycle Order & LDS Record Forms (Q28-Q31, Q116)',
      'Static Resources, NavigationMixin, @salesforce/schema & notifyRecordUpdateAvailable (Q61-Q63, Q65, Q115)',
      'lwc:ref, @track Deep Reactivity, errorCallback, Scoped Modules & Light DOM (Q81-Q85)',
      'Screen Flow Events, Aura-LWC Containment, Lightning Out & LightningModal (Q86, Q87, Q89, Q90)',
      'Visualforce Standard/Custom Controllers, Extensions, StandardSetController & View State (Q88, Q112-Q114)'
    ],
    questionIds: [
      'Q10', 'Q11', 'Q12',
      'Q25', 'Q26', 'Q27', 'Q28', 'Q29', 'Q30', 'Q31',
      'Q44',
      'Q61', 'Q62', 'Q63', 'Q65',
      'Q81', 'Q82', 'Q83', 'Q84', 'Q85', 'Q86', 'Q87', 'Q88', 'Q89', 'Q90',
      'Q112', 'Q113', 'Q114', 'Q115', 'Q116', 'Q117'
    ]
  },
  {
    id: 'BP5',
    sectionEn: '5. Asynchronous Apex, Event-Driven Architecture & Integration',
    sectionZh: '5. 异步 Apex、事件驱动架构（PE/CDC）与 REST/SOAP 集成',
    examWeightPd1: 'in Logic 28%',
    examWeightPd2: 'in Logic 27%',
    domain: '异步 Apex 与集成架构 (Async Apex & Integration)',
    coveredTopics: [
      'Queueable vs @future, Batch Apex + Database.Stateful & Transaction Finalizers (Q32-Q35)',
      'Platform Events: Publish Immediately vs After Commit, after insert Triggers & RetryableException (Q42, Q43, Q69)',
      'Continuation for Long-Running UI Callouts & "Uncommitted Work Pending" (Q64, Q68)',
      'enqueueJob Limits (50 sync / 1 async), BatchApexErrorEvent & Change Data Capture (Q91-Q93)',
      'WSDL2Apex WebServiceMock & Messaging.InboundEmailHandler (Q94, Q95)'
    ],
    questionIds: [
      'Q32', 'Q33', 'Q34', 'Q35',
      'Q42', 'Q43',
      'Q64', 'Q68', 'Q69',
      'Q91', 'Q92', 'Q93', 'Q94', 'Q95'
    ]
  },
  {
    id: 'BP6',
    sectionEn: '6. Security (Sharing/CRUD/FLS), Testing, Debugging & Deployment',
    sectionZh: '6. 安全模型（Sharing/CRUD/FLS）、单元测试、调试工具与部署',
    examWeightPd1: '20% + DF security',
    examWeightPd2: '20%',
    domain: '安全模型与单元测试 (Security & Testing)',
    coveredTopics: [
      'with / without / inherited sharing (API v67.0 secure-by-default note) & SOQL Injection (Q05, Q06, Q09, Q121)',
      'WITH USER_MODE vs legacy WITH SECURITY_ENFORCED, stripInaccessible & Schema CRUD/FLS Checks (Q36-Q38, Q122)',
      'Apex Managed Sharing (__Share, RowCause) (Q60)',
      '@TestSetup, startTest/stopTest, Coverage Rules, Test Data Factory & SeeAllData (Q39-Q41, Q107, Q110)',
      'Test.setFixedSearchResults, Test.loadData, Test.setCreatedDate, System.runAs & Assert (Q66, Q67, Q96, Q97, Q106, Q111)',
      'HttpCalloutMock, WebServiceMock & StubProvider / Test.createStub (Q108, Q109)',
      'LWC Jest Testing (Q47, Q48)',
      'Debug Logs & Trace Flags, Developer Console, Checkpoints & Replay Debugger (Q98, Q101, Q102)',
      'sf CLI Deploy/Retrieve/Validate, Test Levels, Sandboxes vs Scratch Orgs & Destructive Changes (Q70, Q100, Q103-Q105)'
    ],
    questionIds: [
      'Q05', 'Q06', 'Q09',
      'Q36', 'Q37', 'Q38', 'Q39', 'Q40', 'Q41', 'Q47', 'Q48',
      'Q60', 'Q66', 'Q67', 'Q70',
      'Q96', 'Q97', 'Q98', 'Q100',
      'Q101', 'Q102', 'Q103', 'Q104', 'Q105', 'Q106', 'Q107', 'Q108', 'Q109', 'Q110', 'Q111',
      'Q121', 'Q122'
    ]
  }
];
