import { ExamQuestion, TechDomain } from '../types';
import { QUESTIONS_PART_1 } from './questionsPart1';
import { QUESTIONS_PART_2 } from './questionsPart2';
import { QUESTIONS_PART_3 } from './questionsPart3';

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
  ...QUESTIONS_PART_3
];

export const EXAM_BLUEPRINT_COVERAGE: BlueprintSectionCoverage[] = [
  {
    id: 'BP1',
    sectionEn: '1. Developer Fundamentals, Data Modeling & Declarative vs Programmatic',
    sectionZh: '1. 开发者基础、数据建模与声明式 vs 编程式架构',
    examWeightPd1: '23%',
    examWeightPd2: '15%',
    domain: 'Apex 核心与面向对象 (Apex & OOP)',
    coveredTopics: [
      'Multi-tenant Governor Limits & Execution Contexts (Q01-Q03)',
      'Junction Objects (Many-to-Many) & Primary/Secondary Master-Detail Sharing (Q49)',
      'User Hierarchical Relationships & Standard/Custom Object M-D Rules (Q50-Q51)',
      'Custom Metadata (__mdt) vs Hierarchy Custom Settings (__c) (Q52)',
      'Data Import Wizard vs Data Loader Capabilities (Q53)',
      'OOP Inheritance (virtual/abstract/override), Interfaces & Type.forName() Reflection (Q54, Q72)',
      'Custom Exceptions, SObjectException & Map/Set equals()/hashCode() (Q55-Q57)',
      'Dynamic Schema Describe & Picklist Inspection (Q71)',
      'Flow @InvocableMethod Bulkification & Managed Package global Modifier (Q58, Q99)'
    ],
    questionIds: [
      'Q01', 'Q02', 'Q03', 'Q04', 'Q05', 'Q06',
      'Q49', 'Q50', 'Q51', 'Q52', 'Q53', 'Q54', 'Q55', 'Q56', 'Q57', 'Q58',
      'Q71', 'Q72', 'Q88', 'Q99'
    ]
  },
  {
    id: 'BP2',
    sectionEn: '2. SOQL, SOSL, DML & Large Data Volumes (LDV)',
    sectionZh: '2. SOQL/SOSL 高级查询、DML 事务控制与海量数据（LDV）调优',
    examWeightPd1: '18%',
    examWeightPd2: '22%',
    domain: 'SOQL & SOSL 数据查询 (Data Query)',
    coveredTopics: [
      'Map<Id, SObject> Direct SOQL Constructor & Parent-Child Subqueries (Q07-Q09)',
      'GROUP BY ROLLUP, HAVING & AggregateResult Type Casting (Q10-Q11)',
      'SOSL Returning List<List<SObject>> & Dynamic Bind Variables (Q12)',
      'Database.insert(list, false) Partial Commit & Savepoint/Rollback (Q06, Q46)',
      'Polymorphic Relationships TYPEOF What WHEN ... THEN ... END (Q73)',
      'FOR UPDATE Row Locking, FOR VIEW & FOR REFERENCE (Q47, Q74)',
      'Multi-Currency convertCurrency(Amount) & FORMAT() (Q75)',
      'LDV Query Plan Tool, Selective Index Thresholds (10%/30%) & Skinny Tables (Q43-Q45)'
    ],
    questionIds: [
      'Q07', 'Q08', 'Q09', 'Q10', 'Q11', 'Q12',
      'Q43', 'Q44', 'Q45', 'Q46', 'Q47',
      'Q73', 'Q74', 'Q75'
    ]
  },
  {
    id: 'BP3',
    sectionEn: '3. Process Automation, Apex Triggers & Save Order of Execution',
    sectionZh: '3. 流程自动化、Apex 触发器架构与 20 步保存执行顺序',
    examWeightPd1: '30%',
    examWeightPd2: '20%',
    domain: 'Trigger 与执行顺序 (Triggers & Order of Execution)',
    coveredTopics: [
      'before vs after Trigger Selection & Read-Only Trigger.new Throws FinalException (Q13-Q14)',
      '20-Step Save Order of Execution & Before-Save vs After-Save Flows (Q15)',
      'Workflow Field Update Re-running Triggers Once without Re-running Validation Rules (Q76)',
      'Bulkified Trigger Handler Pattern & Set<Id> Static Guard vs Boolean Flag Trap (Q16-Q18)',
      'merge Statement Firing delete (Losing) & update (Winning) Triggers (Q77)',
      'Trigger.isExecuting Context Check & after undelete Behavior (Q78-Q79)',
      'Bulkified Database.convertLead(List<Database.LeadConvert>) (Q80)'
    ],
    questionIds: [
      'Q13', 'Q14', 'Q15', 'Q16', 'Q17', 'Q18',
      'Q76', 'Q77', 'Q78', 'Q79', 'Q80'
    ]
  },
  {
    id: 'BP4',
    sectionEn: '4. User Interface: LWC, Wire Service, LDS, Aura & Visualforce Interop',
    sectionZh: '4. 用户界面：LWC 组件生命周期、Wire/LDS、跨组件通信与 VF/Aura/Flow 互操作',
    examWeightPd1: '22%',
    examWeightPd2: '20%',
    domain: 'LWC 现代前端组件 (Lightning Web Components)',
    coveredTopics: [
      '@api Public Properties, Unidirectional Data Flow & @track Object/Array Reactivity (Q19, Q82)',
      'Lifecycle Hooks: constructor, connectedCallback, renderedCallback, errorCallback (Q20, Q83)',
      'Shadow DOM CSS Encapsulation (:host) vs Light DOM (renderMode = "light") (Q21, Q85)',
      '@wire Reactive "$prop" Binding, @AuraEnabled(cacheable=true) & refreshApex() (Q22-Q23)',
      'Lightning Data Service (LDS), notifyRecordUpdateAvailable() & Schema Imports (Q24, Q62, Q64)',
      'CustomEvent (bubbles & composed) vs Lightning Message Service (LMS) vs empApi (Q25-Q27)',
      'Static Resources (loadScript), NavigationMixin, Scoped @salesforce/* Modules & lwc:ref (Q60-Q61, Q81, Q84)',
      'Screen Flow Interop (FlowAttributeChangeEvent / FlowNavigationNextEvent) & LightningModal (Q86, Q90)',
      'Aura-LWC Containment Rule & Visualforce Lightning Out / ViewState transient (Q87-Q89)'
    ],
    questionIds: [
      'Q19', 'Q20', 'Q21', 'Q22', 'Q23', 'Q24', 'Q25', 'Q26', 'Q27',
      'Q60', 'Q61', 'Q62', 'Q64',
      'Q81', 'Q82', 'Q83', 'Q84', 'Q85', 'Q86', 'Q87', 'Q88', 'Q89', 'Q90'
    ]
  },
  {
    id: 'BP5',
    sectionEn: '5. Asynchronous Apex, Event-Driven Architecture & REST/SOAP Integration',
    sectionZh: '5. 异步 Apex 四剑客、事件驱动架构（PE/CDC）与 REST/SOAP 集成',
    examWeightPd1: 'included in Logic',
    examWeightPd2: '15%',
    domain: '异步 Apex 与集成架构 (Async Apex & Integration)',
    coveredTopics: [
      '@future Mixed DML Workaround & Primitive Parameter Limitation (Q28)',
      'Queueable Chaining & Governor Limit (50 Sync vs ONLY 1 Async enqueueJob!) (Q29, Q91)',
      'Database.Batchable 50M QueryLocator, Database.Stateful & Database.RaisesPlatformEvents (Q30-Q31, Q92)',
      'Platform Events (Publish After Commit vs Immediately) & EventBus.RetryableException (Q32-Q33, Q69)',
      'Change Data Capture (CDC) AccountChangeEvent & Async Triggers (Q93)',
      'Named Credentials, Uncommitted Work Pending (DML before Callout) & Continuation (Q34-Q36, Q63, Q68)',
      'SOAP WSDL2Apex WebServiceMock & InboundEmailHandler (Q94-Q95)'
    ],
    questionIds: [
      'Q28', 'Q29', 'Q30', 'Q31', 'Q32', 'Q33', 'Q34', 'Q35', 'Q36',
      'Q63', 'Q68', 'Q69',
      'Q91', 'Q92', 'Q93', 'Q94', 'Q95'
    ]
  },
  {
    id: 'BP6',
    sectionEn: '6. Security (Sharing/FLS/CRUD), Testing, Debugging & Deployment',
    sectionZh: '6. 安全模型（Sharing/CRUD/FLS）、单元测试、调试工具与 DevOps 部署',
    examWeightPd1: '7%',
    examWeightPd2: '8%',
    domain: '安全模型与单元测试 (Security & Testing)',
    coveredTopics: [
      'with sharing vs without sharing vs inherited sharing (Q37)',
      'SOQL WITH USER_MODE & Security.stripInaccessible(AccessType, records) (Q38-Q39)',
      'Apex Managed Sharing (__Share, RowCause, AccessLevel) (Q59)',
      '@TestSetup Rollback Isolation, Test.startTest()/stopTest() & HttpCalloutMock (Q40-Q42)',
      'Test.setFixedSearchResults (SOSL), Test.loadData (CSV) & Test.setCreatedDate (Q65-Q66, Q96)',
      'System.runAs() Sharing & Mixed DML Behavior vs Governor Limits (Q97)',
      'Jest Unit Testing for LWC: createElement, sfdx-lwc-jest Wire Adapters (Q48, Q67)',
      'Apex Checkpoints, Replay Debugger, Sandbox Types & Destructive Changes Deployment (Q70, Q98, Q100)'
    ],
    questionIds: [
      'Q37', 'Q38', 'Q39', 'Q40', 'Q41', 'Q42', 'Q48',
      'Q59', 'Q65', 'Q66', 'Q67', 'Q70',
      'Q96', 'Q97', 'Q98', 'Q100'
    ]
  }
];
