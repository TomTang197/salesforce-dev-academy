import { CurriculumLesson } from '../types';
import { BRIDGE_LESSONS } from './bridgeOnboarding';

export const CURRICULUM_LESSONS: CurriculumLesson[] = [
  // ==================== STAGE 0: BRIDGE (ADM + 编程背景破冰先导 / Bridge Onboarding) ====================
  ...BRIDGE_LESSONS,

  // ==================== STAGE 1: BEGINNER (入门筑基 / Foundations) ====================
  {
    id: 'L01',
    daySuggested: 1,
    stage: 'beginner',
    domain: 'Apex 核心与面向对象 (Apex & OOP)',
    examDomain: 'Developer Fundamentals (27%)',
    title: '多租户架构、对象关系与 Governor Limits 核心红线',
    titleEn: 'Multitenant Architecture, Object Relationships & Governor Limits',
    subtitle: '理解为什么 Salesforce 严禁在循环中写 SOQL/DML，以及 Master-Detail 与 Lookup 的本质差异',
    subtitleEn: 'Understand why SOQL/DML inside loops is strictly forbidden, and Master-Detail vs. Lookup relationships',
    estimatedMinutes: 30,
    examFrequency: '极高频必考 (High-Yield)',
    summary:
      'Salesforce 运行在多租户（Multitenant）共享资源架构之上。为防止单一租户的代码独占共享 CPU、内存与数据库连接，Apex 运行时引擎在每个事务（Transaction）中严格执行 Governor Limits（运行时配额限制）。',
    summaryEn:
      'Salesforce operates on a multitenant architecture where all customers share computing resources. To prevent any single tenant from monopolizing shared CPU, memory, or database connections, the Apex runtime engine strictly enforces per-transaction Governor Limits.',
    examGlossary: [
      {
        termEn: 'Multitenant Architecture & Governor Limits',
        meaningZh: '多租户架构与运行时配额限制',
        examSignalPhraseEn: '"Because Apex runs in a multitenant environment, the Apex runtime engine strictly enforces limits... System.LimitException cannot be caught by a try-catch block."',
      },
      {
        termEn: 'Master-Detail Relationship vs. Lookup Relationship',
        meaningZh: '主详关系（强耦合级联删除/继承安全/支持汇总）vs 查找关系（松耦合独立Owner）',
        examSignalPhraseEn: '"Cascade delete child records, inherit sharing and security from the parent record, and calculate Roll-Up Summary fields."',
      },
      {
        termEn: 'Roll-Up Summary Field',
        meaningZh: '汇总统计字段（原生仅限 Master-Detail 主对象上创建，支持 COUNT/SUM/MIN/MAX）',
        examSignalPhraseEn: '"Aggregate values (COUNT, SUM, MIN, MAX) from child records on a Master-Detail relationship without writing Apex."',
      },
    ],
    coreConcepts: [
      {
        heading: '1. Core Per-Transaction Governor Limits / 必须死记硬背的配额数字 (PD1 High-Yield)',
        content:
          'Synchronous (同步事务) vs. Asynchronous (异步事务 - Batch / Queueable / Future) 配额对照：\n• Total number of SOQL queries issued (SOQL 查询次数上限)：Sync 100 / Async 200\n• Total number of records retrieved by SOQL queries (单事务 SOQL 返回总行数)：50,000 rows (SUM/AVG/MIN/MAX count every aggregated row toward this limit; COUNT()/COUNT(field) counts as 1 row, or 1 row per GROUP BY group)\n• Total number of DML statements issued (DML 语句调用次数上限)：150 statements (Sync & Async)\n• Total number of records processed as a result of DML statements (单事务 DML 处理总记录数)：10,000 rows\n• Total number of SOSL queries issued (SOSL 搜索调用上限)：20 queries (up to 2,000 records per search)\n• Maximum CPU time on the Salesforce servers (CPU 时间上限)：Sync 10,000 ms (10s) / Async 60,000 ms (60s)\n• Total heap size (Heap 堆内存上限)：Sync 6 MB / Async 12 MB\n• Total number of callouts (HTTP Requests or Web Services calls)：100 callouts per transaction (max cumulative timeout 120 seconds)',
        language: 'apex',
        codeSnippet: `// Monitor remaining Governor Limits dynamically at runtime using the Limits class
System.debug('SOQL Queries used: ' + Limits.getQueries() + ' / ' + Limits.getLimitQueries());
System.debug('Remaining DML Statements: ' + (Limits.getLimitDmlStatements() - Limits.getDmlStatements()));
System.debug('Current Heap Size: ' + Limits.getHeapSize() + ' / ' + Limits.getLimitHeapSize() + ' bytes');`,
      },
      {
        heading: '2. Master-Detail Relationship vs. Lookup Relationship (对象关系选型对比)',
        content:
          '• Master-Detail Relationship (主详关系)：Tightly coupled parent-child relationship.\n  - Child (Detail) records DO NOT have an `OwnerId` field; they inherit sharing and security settings from the Master record.\n  - Deleting the Master record automatically **cascade deletes (级联删除)** all Detail records.\n  - Allows creating native **Roll-Up Summary fields** (`COUNT`, `SUM`, `MIN`, `MAX`) on the Master object.\n  - Up to **2 Master-Detail relationships** per custom object.\n• Lookup Relationship (查找关系)：Loosely coupled relationship.\n  - Child records have their own independent `OwnerId` and Organization-Wide Defaults (OWD) sharing.\n  - Can be optional or required; supports "Clear the value of this field" or "Don\'t allow deletion of the lookup record that\'s part of a lookup relationship".',
      },
    ],
    codeComparison: {
      title: 'Governor Limit Classic Killer: SOQL Inside a Loop vs. Bulkified Map Query (循环内查询 vs 批量化预加载)',
      antiPatternLabel: '❌ Anti-Pattern (反模式): SOQL inside a For Loop (Throws uncatchable LimitException >100 records)',
      antiPatternCode: `public static void updateContactAreaCode(List<Contact> contacts) {
    // FATAL: If contacts has 101 records, throws uncatchable:
    // System.LimitException: Too many SOQL queries: 101
    for (Contact c : contacts) {
        if (c.AccountId != null) {
            Account acc = [SELECT Id, Phone FROM Account WHERE Id = :c.AccountId];
            c.Phone = acc.Phone;
        }
    }
}`,
      bestPracticeLabel: '✅ Best Practice (最佳实践): Collect IDs in a Set<Id> + Query Once into Map<Id, sObject>',
      bestPracticeCode: `public static void updateContactAreaCode(List<Contact> contacts) {
    Set<Id> accountIds = new Set<Id>();
    for (Contact c : contacts) {
        if (c.AccountId != null) {
            accountIds.add(c.AccountId);
        }
    }
    if (accountIds.isEmpty()) return;

    // Consumes ONLY 1 SOQL query whether processing 1 or 200 Contacts!
    Map<Id, Account> accountMap = new Map<Id, Account>(
        [SELECT Id, Phone FROM Account WHERE Id IN :accountIds]
    );
    for (Contact c : contacts) {
        if (accountMap.containsKey(c.AccountId)) {
            c.Phone = accountMap.get(c.AccountId).Phone;
        }
    }
}`,
      explanation:
        'Exam Golden Rule: `System.LimitException` CANNOT be caught by a `try-catch` block! Once any Governor Limit is breached, the entire transaction immediately aborts and rolls back. Always collect foreign keys in a `Set<Id>` and query once into a `Map<Id, sObject>`.',
    },
    examTraps: [
      'Exam Trap 1 (考官陷阱): Can you catch `System.LimitException` with `try { ... } catch (Exception e)`? NO! LimitExceptions cannot be caught and immediately roll back the entire transaction.',
      'Exam Trap 2 (转换前提): To convert an existing Lookup relationship to a Master-Detail relationship, EVERY existing child record must contain a valid value in the Lookup field (cannot be null).',
      'Exam Trap 3 (汇总字段): Native Roll-Up Summary fields only work on Master-Detail relationships. For a Lookup relationship, you must use an Apex Trigger or Record-Triggered Flow.',
    ],
    linkedChallengeId: 'C01',
    linkedQuestionIds: ['Q01', 'Q02', 'Q03'],
  },

  {
    id: 'L02',
    daySuggested: 2,
    stage: 'beginner',
    domain: 'Apex 核心与面向对象 (Apex & OOP)',
    examDomain: 'Developer Fundamentals (27%)',
    title: 'Apex 集合体系 (List / Set / Map) 与 Sharing 共享声明',
    titleEn: 'Apex Collections (List / Set / Map) & Sharing Declarations',
    subtitle: '深入掌握 Map<Id, sObject> 快捷构造、内部类继承规则与 with / without / inherited sharing',
    subtitleEn: 'Master Map<Id, sObject> SOQL constructor, Inner Class sharing rules, and with / without / inherited sharing',
    estimatedMinutes: 35,
    examFrequency: '极高频必考 (High-Yield)',
    summary:
      'Apex 是强类型、面向对象的服务端语言。在 Salesforce 开发中，95% 的批量数据处理围绕 List、Set、Map 三大集合展开；而记录级共享权限（Record-Level Sharing）则由类的 with sharing / without sharing / inherited sharing 关键字控制。',
    summaryEn:
      'Apex is a strongly typed, object-oriented server-side language. In Salesforce development, 95% of bulk data processing revolves around List, Set, and Map collections, while record-level sharing visibility is governed by with sharing, without sharing, and inherited sharing keywords.',
    examGlossary: [
      {
        termEn: 'with sharing / without sharing / inherited sharing',
        meaningZh: '强制执行用户记录共享规则 / 系统模式忽略共享规则 / 动态继承调用方共享模式（顶层默认 with sharing）',
        examSignalPhraseEn: '"Enforce the sharing rules of the current user vs. run in system context vs. dynamically inherit sharing from the caller and default to with sharing as an entry point."',
      },
      {
        termEn: 'Inner Class Sharing Inheritance Rule',
        meaningZh: '内部类绝不自动继承外部容器类的 sharing 设置（必须单独显式声明）',
        examSignalPhraseEn: '"Inner classes DO NOT inherit the sharing setting from their container class."',
      },
      {
        termEn: 'Map<Id, sObject> Auto-Indexing Constructor',
        meaningZh: '将 SOQL 查询列表直接传入 Map<Id, sObject> 构造器，自动以记录 Id 作为 Key',
        examSignalPhraseEn: '"Populate a Map where the key is the record Id and the value is the sObject without using a loop."',
      },
    ],
    coreConcepts: [
      {
        heading: '1. List, Set, Map & One-Line SOQL-to-Map Initialization (集合与一行构造字典)',
        content:
          '• `List<T>` (Ordered, allows duplicates / 有序可重复列表)：Standard return type of SOQL queries. Indexed via `list[0]` or `list.get(0)`.\n• `Set<T>` (Unordered, unique elements / 无序自动去重集合)：Ideal for collecting foreign keys (`Set<Id>`) to bind in `WHERE AccountId IN :accountIds`.\n• `Map<K, V>` (Key-Value Hash Table / 键值对哈希映射)：Apex allows passing a `List<sObject>` or inline SOQL query directly into `new Map<Id, sObject>([SELECT ...])`, automatically indexing records by their 18-character `Id`!',
        language: 'apex',
        codeSnippet: `// Directly pass an inline SOQL query into the Map<Id, sObject> constructor (No loop needed!)
Map<Id, Account> accMap = new Map<Id, Account>(
    [SELECT Id, Name, Industry, AnnualRevenue FROM Account WHERE AnnualRevenue > 1000000]
);

// Extract all record Ids as a Set<Id> in O(1) time
Set<Id> highValueAccIds = accMap.keySet();
List<Account> accList = accMap.values();`,
      },
      {
        heading: '2. Sharing Keywords: with sharing vs. without sharing vs. inherited sharing',
        content:
          '• `with sharing`：Enforces the **record-level sharing rules** (OWD, Role Hierarchy, Sharing Rules, Manual Sharing) of the current logged-in user. Note: It does NOT enforce Object-level (CRUD) or Field-Level Security (FLS) by itself!\n• `without sharing`：Runs in **System Context (系统上下文)** regarding sharing—ignores record sharing rules and can query/modify all records in the org.\n• `inherited sharing` (Recommended Best Practice)：Dynamically inherits the sharing mode of the calling class. If invoked as a top-level entry point (e.g., `@AuraEnabled` LWC controller or REST endpoint), it safely defaults to **`with sharing`** to pass AppExchange Security Review.',
        language: 'apex',
        codeSnippet: `public inherited sharing class OpportunityService {
    // Runs as 'with sharing' when called from LWC @AuraEnabled, or inherits caller's mode
    public static List<Opportunity> getOpenDeals() {
        return [SELECT Id, Name, Amount FROM Opportunity WHERE IsClosed = false WITH USER_MODE];
    }
}`,
      },
    ],
    codeComparison: {
      title: 'Omitted Sharing Declaration Risk vs. Explicit inherited sharing (省略共享声明的风险 vs 显式声明)',
      antiPatternLabel: '❌ Anti-Pattern (反模式): Omitting sharing keyword (API v66.0 and earlier: runs without sharing at entry point)',
      antiPatternCode: `public class AccountHelper {
    // API v66.0 and earlier: a class that omits any sharing keyword inherits the caller's mode,
    // and runs as 'without sharing' when it is the entry point (e.g. called from an LWC component).
    // (API v67.0+ secure-by-default: an omitted keyword defaults to 'with sharing' - still declare it explicitly!)
    public static List<Account> fetchAll() {
        return [SELECT Id, Name FROM Account];
    }
}`,
      bestPracticeLabel: '✅ Best Practice (最佳实践): Explicit inherited sharing + WITH USER_MODE',
      bestPracticeCode: `public inherited sharing class AccountHelper {
    // Enforces record sharing + CRUD + FLS simultaneously
    public static List<Account> fetchAll() {
        return [SELECT Id, Name FROM Account WITH USER_MODE];
    }
}`,
      explanation:
        'Critical Exam Rule: **Inner classes DO NOT inherit the sharing setting from their container (outer) class!** Every inner class must explicitly declare its own sharing keyword.',
    },
    examTraps: [
      'Exam Trap 1 (内部类陷阱): Inner classes NEVER inherit the sharing setting from their enclosing outer class. If omitted, the classic rule applies (API v66.0 and earlier: inherits the caller, `without sharing` as an entry point; API v67.0+: defaults to `with sharing`) — always declare it explicitly!',
      'Exam Trap 2 (跨类调用): If Class A (`with sharing`) calls a method in Class B (`without sharing`), the code inside Class B executes under Class B\'s declaration (`without sharing`).',
      'Exam Trap 3 (权限边界): `with sharing` ONLY enforces record-level sharing (which rows you see), NOT Object CRUD or Field-Level Security (FLS). Use `WITH USER_MODE` or `Security.stripInaccessible` for CRUD/FLS.',
    ],
    linkedChallengeId: 'C02',
    linkedQuestionIds: ['Q04', 'Q05', 'Q06'],
  },

  {
    id: 'L03',
    daySuggested: 3,
    stage: 'beginner',
    domain: 'SOQL & SOSL 数据查询 (Data Query)',
    examDomain: 'Process Automation & Logic (28%)',
    title: 'SOQL 与 SOSL 基础语法、日期字面量与跨对象检索',
    titleEn: 'SOQL vs. SOSL Fundamentals, Date Literals & Cross-Object Relationships',
    subtitle: '精准区分何时使用 SOQL 与 SOSL，掌握关系名称（__c vs __r）与防注入绑定变量',
    subtitleEn: 'Distinguish when to use SOQL vs. SOSL, master __c vs. __r relationship names, and prevent SOQL Injection',
    estimatedMinutes: 35,
    examFrequency: '极高频必考 (High-Yield)',
    summary:
      'SOQL（Salesforce Object Query Language）用于查询单一对象或有明确关联关系的对象结构化数据；SOSL（Salesforce Object Search Language）基于全文搜索引擎索引，用于跨多个不相关对象的文本字段快速检索关键字。',
    summaryEn:
      'SOQL (Salesforce Object Query Language) retrieves structured records from a single object or related objects, whereas SOSL (Salesforce Object Search Language) performs full-text search across multiple unrelated objects simultaneously.',
    examGlossary: [
      {
        termEn: 'SOQL (List<sObject>) vs. SOSL (List<List<sObject>>)',
        meaningZh: '结构化单表/关联表查询（返回一维列表）vs 跨多对象全文搜索（返回二维列表）',
        examSignalPhraseEn: '"Search for a text string across multiple unrelated objects (Account, Contact, Lead) at once -> Use SOSL returning List<List<sObject>>."',
      },
      {
        termEn: 'Custom Relationship Suffix (__r vs. __c)',
        meaningZh: '自定义字段本身用 __c；跨对象访问父字段或父查子子关系名必须用 __r',
        examSignalPhraseEn: '"Traverse a custom relationship in SOQL (Child-to-Parent or Parent-to-Child subquery) using __r."',
      },
      {
        termEn: 'SOQL Injection Prevention (:bindVariable / String.escapeSingleQuotes)',
        meaningZh: '使用静态变量绑定 :var 或 String.escapeSingleQuotes() 防止动态 SOQL 注入',
        examSignalPhraseEn: '"Prevent SOQL injection when building a dynamic query string from user input."',
      },
    ],
    coreConcepts: [
      {
        heading: '1. When to Use SOQL vs. SOSL (考试选型决策矩阵)',
        content:
          '• **Use SOQL when (何时用 SOQL)**:\n  1. You know which object(s) the data resides in (明确知道目标对象).\n  2. You need to count records (`COUNT()`), aggregate (`SUM`/`AVG`), or sort (`ORDER BY`).\n  3. You are filtering on Number, Date, Datetime, or Checkbox (`Boolean`) fields.\n  4. You need synchronous data inside a Trigger (SOSL search indexes are updated asynchronously and will NOT find newly inserted records in the same transaction).\n• **Use SOSL when (何时用 SOSL)**:\n  1. You want to search a keyword (e.g., `"Acme"` or a phone number) across **multiple unrelated objects** (`Account`, `Contact`, `Lead`, `Opportunity`) in a single call.\n  2. Return type is always **`List<List<sObject>>`**.',
        language: 'soql',
        codeSnippet: `// 1. SOQL Query with Child-to-Parent traversal & Date Literal (LAST_N_DAYS:30)
List<Opportunity> recentOpps = [
    SELECT Id, Name, Amount, Account.Name, Account.Industry
    FROM Opportunity
    WHERE CreatedDate = LAST_N_DAYS:30
      AND StageName != 'Closed Lost'
    ORDER BY Amount DESC NULLS LAST
    LIMIT 50
];

// 2. SOSL Multi-Object Search (Always returns List<List<SObject>>)
List<List<SObject>> searchList = [
    FIND 'Universal*' IN ALL FIELDS
    RETURNING Account(Id, Name, Industry),
              Contact(Id, FirstName, LastName, Email WHERE Department = 'IT')
];
List<Account> matchedAccounts = (List<Account>) searchList[0];
List<Contact> matchedContacts = (List<Contact>) searchList[1];`,
      },
      {
        heading: '2. Standard vs. Custom Relationship Naming Rules (__c vs. __r)',
        content:
          '• **Standard Relationships (标准关系)**：Use the relationship name directly, e.g., `Contact.Account.Name` (Child-to-Parent), or `(SELECT Id, LastName FROM Contacts)` (Parent-to-Child plural Child Relationship Name).\n• **Custom Relationships (自定义关系)**：The foreign key field itself ends with `__c` (e.g., `Project__c` storing the 18-char Id). When traversing to parent fields or writing a child subquery, replace `__c` with **`__r`** (e.g., `Project__r.Manager__r.Name` or `(SELECT Id FROM Job_Applications__r)`).',
      },
    ],
    codeComparison: {
      title: 'Dynamic String Concatenation (SOQL Injection Vulnerability) vs. Bind Variables',
      antiPatternLabel: '❌ Anti-Pattern (反模式): Unescaped string concatenation in Database.query()',
      antiPatternCode: `public static List<Account> searchByKeyword(String userInput) {
    // CRITICAL VULNERABILITY: If userInput is "test' OR Name != '" -> SOQL Injection!
    String query = 'SELECT Id, Name FROM Account WHERE Name LIKE \\'%' + userInput + '%\\'';
    return Database.query(query);
}`,
      bestPracticeLabel: '✅ Best Practice (最佳实践): Use :variable binding or String.escapeSingleQuotes()',
      bestPracticeCode: `public static List<Account> searchByKeyword(String userInput) {
    String safePattern = '%' + userInput + '%';
    // Bind variable :safePattern automatically escapes single quotes and prevents injection
    return [
        SELECT Id, Name, CreatedDate
        FROM Account
        WHERE Name LIKE :safePattern
          AND CreatedDate = THIS_QUARTER
        WITH USER_MODE
    ];
}`,
      explanation:
        'In static or dynamic SOQL, always prefer `:variable` bind variables (or `Database.queryWithBinds()`). If dynamic string concatenation is unavoidable, wrap user input in `String.escapeSingleQuotes(userInput)`.',
    },
    examTraps: [
      'Exam Trap 1: SOSL always returns `List<List<sObject>>`, whereas SOQL returns `List<sObject>`, a single `sObject`, or `Integer` (only for `SELECT COUNT() FROM Account`).',
      'Exam Trap 2: SOQL does NOT support `SELECT * FROM Account`! You must explicitly specify field API names (`Id` is implicitly returned).',
      'Exam Trap 3: When traversing a custom relationship in SOQL, never write `Candidate__c.Email__c` — it must be `Candidate__r.Email__c`!',
    ],
    linkedChallengeId: 'C03',
    linkedQuestionIds: ['Q07', 'Q08', 'Q09'],
  },

  {
    id: 'L04',
    daySuggested: 4,
    stage: 'beginner',
    domain: 'LWC 现代前端组件 (Lightning Web Components)',
    examDomain: 'User Interface (25%)',
    title: 'LWC 组件包结构、现代条件指令 (lwc:if) 与列表渲染',
    titleEn: 'LWC Bundle Architecture, Modern Directives (lwc:if) & List Iteration',
    subtitle: '告别过时的 if:true，掌握 lwc:if / lwc:elseif、for:each 与 iterator:it 的核心差异',
    subtitleEn: 'Replace legacy if:true with lwc:if/lwc:elseif, and master for:each vs. iterator:it & .js-meta.xml targets',
    estimatedMinutes: 35,
    examFrequency: '极高频必考 (High-Yield)',
    summary:
      'Lightning Web Components (LWC) 基于浏览器原生 Web Components 标准构建。一个标准 LWC 组件包含同名文件夹下的 .html 模板、.js 控制器、.css 样式表以及定义组件暴露位置的 .js-meta.xml 元数据配置文件。',
    summaryEn:
      'Lightning Web Components (LWC) are built on modern Web Components standards. An LWC bundle consists of an .html template, a .js controller, an optional .css stylesheet, and a .js-meta.xml configuration file that defines where the component is exposed.',
    examGlossary: [
      {
        termEn: 'camelCase Bundle Name -> kebab-case HTML Tag',
        meaningZh: '小驼峰组件名（salesKpiChart）在 HTML 中必须转为短横线标签（<c-sales-kpi-chart>）',
        examSignalPhraseEn: '"Reference a custom LWC component named myAccountTile inside a parent template -> <c-my-account-tile>."',
      },
      {
        termEn: 'iterator:it (it.first / it.last) vs. for:each',
        meaningZh: 'iterator:it 提供 it.first 和 it.last 属性专门用于渲染列表首项或末项特殊样式',
        examSignalPhraseEn: '"Apply special styling or a summary row to the first or last item in a list -> Use iterator:it."',
      },
      {
        termEn: 'isExposed & <targets> in .js-meta.xml',
        meaningZh: '控制组件是否在 Lightning App Builder 中对管理员可见及允许拖拽到哪些页面',
        examSignalPhraseEn: '"A component is deployed to the org, but the administrator cannot see it in Lightning App Builder -> Set <isExposed>true</isExposed> and add <target>lightning__RecordPage</target>."',
      },
    ],
    coreConcepts: [
      {
        heading: '1. Modern Conditional Rendering: lwc:if / lwc:elseif / lwc:else',
        content:
          'Salesforce no longer recommends legacy `if:true` and `if:false` (they may be deprecated and removed in a future release) in favor of **`lwc:if`**, **`lwc:elseif`**, and **`lwc:else`**. Remember: **LWC templates DO NOT allow inline JavaScript expressions** (writing `lwc:if={count > 0}` causes a compile error). You must compute boolean values inside a JavaScript **`get` getter property**!',
        language: 'html',
        codeSnippet: `<template>
    <template lwc:if={isPremiumAccount}>
        <span class="badge-vip">Strategic VIP Account (战略核心客户)</span>
    </template>
    <template lwc:elseif={isStandardAccount}>
        <span class="badge-std">Standard Commercial Account (标准客户)</span>
    </template>
    <template lwc:else>
        <span class="badge-lead">Prospect / Lead (潜在培育客户)</span>
    </template>
</template>`,
      },
      {
        heading: '2. List Rendering: for:each vs. iterator:it',
        content:
          '• `for:each={items} for:item="item" for:index="index"`：Standard loop. You MUST bind a unique primitive `key={item.Id}` on the first direct child element (never use the array index as `key`).\n• `iterator:it={items}`：Provides special boolean properties **`it.first`** and **`it.last`** alongside `it.value.PropertyName`. Whenever an exam question asks how to render a special header on the **first item** or a footer/divider on the **last item**, **`iterator:it`** is the exact answer!',
        language: 'html',
        codeSnippet: `<template>
    <ul class="opp-list">
        <template iterator:it={opportunities}>
            <li key={it.value.Id} class="opp-row">
                <template lwc:if={it.first}>
                    <div class="top-deal-banner">🏆 Top Opportunity of the Quarter (榜首商机)</div>
                </template>
                <span>{it.value.Name} — {it.value.Amount}</span>
                <template lwc:if={it.last}>
                    <div class="list-footer">End of active opportunities (列表底部汇总)</div>
                </template>
            </li>
        </template>
    </ul>
</template>`,
      },
      {
        heading: '3. Exposing Components in .js-meta.xml for Lightning App Builder',
        content:
          'To make an LWC component draggable in Lightning App Builder, you must set `<isExposed>true</isExposed>` and declare the appropriate `<target>` (such as `lightning__RecordPage`, `lightning__AppPage`, `lightning__HomePage`, or `lightning__FlowScreen`).',
        language: 'xml',
        codeSnippet: `<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>62.0</apiVersion>
    <isExposed>true</isExposed>
    <targets>
        <target>lightning__RecordPage</target>
        <target>lightning__AppPage</target>
        <target>lightning__HomePage</target>
    </targets>
    <targetConfigs>
        <targetConfig targets="lightning__RecordPage">
            <objects>
                <object>Account</object>
            </objects>
        </targetConfig>
    </targetConfigs>
</LightningComponentBundle>`,
      },
    ],
    codeComparison: {
      title: 'Inline Template Expression Compile Error vs. JavaScript Getter Property',
      antiPatternLabel: '❌ Anti-Pattern (反模式): Comparison expression in HTML & array index as key',
      antiPatternCode: `<template>
    <!-- COMPILE ERROR: LWC templates forbid comparison operators inside {} -->
    <template lwc:if={accounts.length > 0}>
        <template for:each={accounts} for:item="acc" for:index="idx">
            <!-- ANTI-PATTERN: Using array index as key breaks DOM state on reorder -->
            <p key={idx}>{acc.Name}</p>
        </template>
    </template>
</template>`,
      bestPracticeLabel: '✅ Best Practice (最佳实践): Compute boolean in JS Getter + Unique Record Id as key',
      bestPracticeCode: `// accountList.js
import { LightningElement, api } from 'lwc';
export default class AccountList extends LightningElement {
    @api accounts = [];
    get hasAccounts() {
        return Array.isArray(this.accounts) && this.accounts.length > 0;
    }
}

<!-- accountList.html -->
<template>
    <template lwc:if={hasAccounts}>
        <template for:each={accounts} for:item="acc">
            <p key={acc.Id}>{acc.Name}</p>
        </template>
    </template>
</template>`,
      explanation:
        'LWC templates strictly prohibit expressions (`>`, `===`, `&&`, `+`) inside curly braces `{}`. Always define a `get propertyName()` getter in your JavaScript class.',
    },
    examTraps: [
      'Exam Trap 1 (命名转换): Folder/file names use `camelCase` (`accountCard`), while HTML tags use `kebab-case` (`<c-account-card>`).',
      'Exam Trap 2 (首尾特殊样式): Need special styling on the first (`it.first`) or last (`it.last`) list item? Choose `iterator:it` over `for:each`.',
      'Exam Trap 3 (组件不可见): Component deployed but missing in Lightning App Builder? Check `<isExposed>true</isExposed>` and `<targets>` in `.js-meta.xml`.',
    ],
    linkedChallengeId: 'C04',
    linkedQuestionIds: ['Q10', 'Q11', 'Q12'],
  },

  // ==================== STAGE 2: INTERMEDIATE (核心进阶 - PD1 Core) ====================
  {
    id: 'L05',
    daySuggested: 5,
    stage: 'intermediate',
    domain: 'Trigger 与执行顺序 (Triggers & Order of Execution)',
    examDomain: 'Process Automation & Logic (28%)',
    title: 'Apex Trigger 上下文变量与 Salesforce 20 步保存执行顺序',
    titleEn: 'Apex Trigger Context Variables & Save Order of Execution',
    subtitle: '彻底攻克 Before vs After Trigger 选择黄金法则与 Order of Execution 必考题',
    subtitleEn: 'Master the Golden Rule of Before vs. After Triggers and the 20-step Save Order of Execution',
    estimatedMinutes: 45,
    examFrequency: '极高频必考 (High-Yield)',
    summary:
      '在 PD1 和 PD2 考试中，“何时使用 Before Trigger、何时使用 After Trigger”以及“记录保存时的执行顺序（Save Order of Execution）”占据了极高分值。理解这一机制能避免 FinalException（记录只读）与校验顺序误判。',
    summaryEn:
      'In both PD1 and PD2 exams, choosing between Before vs. After Triggers and tracing the Save Order of Execution are among the highest-weighted topics. Mastering this prevents System.FinalException (Record is read-only) and validation timing bugs.',
    examGlossary: [
      {
        termEn: 'Before Trigger vs. After Trigger',
        meaningZh: 'Before 用于修改当前记录自身字段（无需 DML）或自定义校验；After 用于读取系统生成的 Id 或更新关联他表记录',
        examSignalPhraseEn: '"Update fields on the same record being saved without an extra DML statement -> Before Trigger. Access the system-generated Record Id or insert related records -> After Trigger."',
      },
      {
        termEn: 'Save Order of Execution (Before-Save Flow -> Before Trigger -> Custom Validation Rules -> After Trigger)',
        meaningZh: '保存执行顺序：Before-Save Flow (3) → Before Trigger (4) → 自定义校验规则 (5) → 暂存生成 Id (7) → After Trigger (8)',
        examSignalPhraseEn: '"Custom Validation Rules run AFTER Before Triggers, so field defaults set in a Before Trigger pass validation!"',
      },
      {
        termEn: 'System.FinalException: Record is read-only',
        meaningZh: '在 After Trigger 中直接修改 Trigger.new 的字段会抛出只读异常',
        examSignalPhraseEn: '"Modifying a field on Trigger.new inside an after insert or after update trigger throws System.FinalException."',
      },
    ],
    coreConcepts: [
      {
        heading: '1. Before Trigger vs. After Trigger Golden Selection Rule (黄金选型法则)',
        content:
          '• **Use a `before` trigger when (何时用 Before Trigger)**:\n  1. Updating or defaulting fields on the **same record** being saved (no DML statement needed—changes to `Trigger.new` are automatically committed!).\n  2. Performing complex custom validation using `record.addError(\'Message\')`.\n• **Use an `after` trigger when (何时用 After Trigger)**:\n  1. Accessing system-generated fields that are only populated after database insertion (such as **`record.Id`**, `CreatedDate`, `LastModifiedDate`).\n  2. Creating or updating **related records on other objects** (e.g., creating a default `Contact` after an `Account` is inserted) or firing async callouts.',
        language: 'apex',
        codeSnippet: `trigger OpportunityTrigger on Opportunity (before insert, before update, after insert) {
    if (Trigger.isBefore) {
        for (Opportunity opp : Trigger.new) {
            // 1. Before Trigger: Modify field on the same record WITHOUT any DML statement!
            if (opp.Amount != null && opp.Amount > 500000) {
                opp.Description = 'High-Value Deal - VP Approval Required';
            }
            // 2. Before Update: Compare Trigger.new with Trigger.oldMap to block invalid stage rollback
            if (Trigger.isUpdate) {
                Opportunity oldOpp = Trigger.oldMap.get(opp.Id);
                if (oldOpp.StageName == 'Closed Won' && opp.StageName != 'Closed Won') {
                    opp.StageName.addError('Cannot reopen a Closed Won Opportunity! (已赢单商机严禁回退)');
                }
            }
        }
    }
}`,
      },
      {
        heading: '2. Context Variables Availability Matrix (Trigger.new / old / newMap / oldMap)',
        content:
          '• `before insert`：ONLY `Trigger.new` is available! (`Trigger.newMap` is **`null`** because records do not have an `Id` yet! `Trigger.old` and `oldMap` are also `null`).\n• `after insert`：`Trigger.new` and `Trigger.newMap` are available (records in `Trigger.new` are **Read-Only**).\n• `before update` / `after update`：All four (`Trigger.new`, `Trigger.old`, `Trigger.newMap`, `Trigger.oldMap`) are available!\n• `before delete` / `after delete`：ONLY `Trigger.old` and `Trigger.oldMap` are available (`Trigger.new` is `null`).\n• `after undelete`：ONLY `Trigger.new` and `Trigger.newMap` are available (there is NO `before undelete` event!).',
      },
      {
        heading: '3. Salesforce Save Order of Execution (20步核心顺序必背)',
        content:
          '1. Load original record → 2. System Validation (required fields on page layout, field formats, max length)\n3. **Record-Triggered Flows (Before-Save / Fast Field Updates)**\n4. **All `before` Triggers**\n5. System Validation again + **Custom Validation Rules (自定义校验规则)** 👈 Notice: `before` triggers run BEFORE Custom Validation Rules!\n6. Duplicate Rules (重复规则)\n7. Save record to database (**Record `Id` is generated**, but NOT committed yet)\n8. **All `after` Triggers**\n9. Assignment Rules → 10. Auto-Response Rules → 11. Workflow Rules (legacy — Workflow Rules & Process Builder reached end of support on Dec 31, 2025; new automation should use Flow. Legacy field updates re-run `before` & `after` update triggers 1 more time!)\n12. Escalation Rules → 13. **Record-Triggered Flows (After-Save / Actions & Related Records)**\n14. Entitlement Rules → 15. **Roll-Up Summary Fields calculation on Parent (triggers full parent save procedure!)**\n16. Criteria-Based Sharing → 17. **Commit all DML operations to database**\n18. **Post-Commit Logic**: Send Email Alerts, enqueue `@future` / `Queueable` jobs, send Outbound Messages.',
      },
    ],
    codeComparison: {
      title: 'Mutating Trigger.new in After Trigger (Crash) vs. Zero-DML Assignment in Before Trigger',
      antiPatternLabel: '❌ Anti-Pattern (反模式): Modifying Trigger.new inside an After Insert Trigger',
      antiPatternCode: `trigger AccountTrigger on Account (after insert) {
    for (Account acc : Trigger.new) {
        // RUNTIME CRASH: System.FinalException: Record is read-only
        acc.Rating = 'Hot';
    }
}`,
      bestPracticeLabel: '✅ Best Practice (最佳实践): Populate same-record fields in Before Insert Trigger',
      bestPracticeCode: `trigger AccountTrigger on Account (before insert) {
    for (Account acc : Trigger.new) {
        if (acc.AnnualRevenue != null && acc.AnnualRevenue >= 5000000) {
            // Automatically saved to DB in Step 7 without consuming any DML statement!
            acc.Rating = 'Hot';
        }
    }
}`,
      explanation:
        'By the time an `after` trigger runs (Step 8), the record has already been written to the database buffer (Step 7) and locked as read-only.',
    },
    examTraps: [
      'Exam Trap 1 (经典顺序题): An Account has a Custom Validation Rule requiring `Rating != null`, and a `before insert` trigger that sets blank `Rating = \'Warm\'`. If a user inserts an Account with a blank `Rating`, does it fail? NO! It succeeds because Before Triggers (Step 4) execute BEFORE Custom Validation Rules (Step 5)!',
      'Exam Trap 2: What is the value of `Trigger.newMap` in a `before insert` trigger? It is `null` because record IDs are not generated until Step 7.',
      'Exam Trap 3: When a child record updates a Roll-Up Summary field on the Parent object, the Parent record goes through its entire Save Order of Execution (firing Parent Before/After Update Triggers in the same transaction).',
    ],
    linkedChallengeId: 'C05',
    linkedQuestionIds: ['Q13', 'Q14', 'Q15', 'Q16'],
  },

  {
    id: 'L06',
    daySuggested: 6,
    stage: 'intermediate',
    domain: 'Trigger 与执行顺序 (Triggers & Order of Execution)',
    examDomain: 'Process Automation & Logic (28%)',
    title: 'Trigger Handler 架构模式、200 条分块机制与防递归设计',
    titleEn: 'Trigger Handler Pattern, 200-Record Platform Chunking & Recursion Prevention',
    subtitle: '遵循“单对象单 Trigger (One Trigger Per Object)”原则与 Set<Id> 精确防递归',
    subtitleEn: 'Follow One Trigger Per Object and avoid the static Boolean anti-pattern during >200 record bulk chunking',
    estimatedMinutes: 40,
    examFrequency: '高频核心 (Core)',
    summary:
      '如果同一个对象上有多个 Trigger，Salesforce 无法保证它们之间的执行先后顺序！因此企业级工程必须做到“每个对象只写一个 Trigger”，将业务逻辑委托给 TriggerHandler 类，并正确处理单事务超过 200 条记录时的平台分块（Platform Chunking）。',
    summaryEn:
      'When multiple triggers exist on the same object, Salesforce does NOT guarantee their execution order. Enterprise architecture mandates "One Trigger Per Object" delegating to a Handler class, while using Set<Id> instead of a naive static Boolean to handle 200-record platform chunks.',
    examGlossary: [
      {
        termEn: 'One Trigger Per Object & Trigger.operationType',
        meaningZh: '单对象单触发器原则（多触发器执行顺序不确定），利用 switch on Trigger.operationType 分发',
        examSignalPhraseEn: '"Execution order of multiple triggers on the same object is non-deterministic -> Consolidate into a single trigger per object."',
      },
      {
        termEn: '200-Record Bulk Trigger Chunking',
        meaningZh: '单次 DML 超过 200 条时，平台自动按每批最多 200 条分块调用 Trigger（共享同一事务配额）',
        examSignalPhraseEn: '"Inserting 500 records in a single batch invokes the trigger 3 times (200 + 200 + 100) within the same transaction."',
      },
      {
        termEn: 'Static Set<Id> Recursion Guard vs. Static Boolean Trap',
        meaningZh: '使用 static Set<Id> 精确防递归，避免 static Boolean 在 >200 条分批时跳过后续批次',
        examSignalPhraseEn: '"A static boolean flag causes records 201–1000 to be skipped when a single Apex DML statement updates 1,000 records -> Replace with static Set<Id>."',
      },
    ],
    coreConcepts: [
      {
        heading: '1. Why One Trigger Per Object? (单对象单 Trigger 原则)',
        content:
          'When `AccountTrigger1` and `AccountTrigger2` both listen to `before insert` on `Account`, Salesforce explicitly states their execution order is **undefined / non-deterministic (不确定)**. By using a single trigger per object and routing via `switch on Trigger.operationType` (`BEFORE_INSERT`, `AFTER_UPDATE`, etc.), you control the exact execution sequence.',
        language: 'apex',
        codeSnippet: `trigger AccountTrigger on Account (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    switch on Trigger.operationType {
        when BEFORE_INSERT {
            AccountTriggerHandler.handleBeforeInsert(Trigger.new);
        }
        when BEFORE_UPDATE {
            AccountTriggerHandler.handleBeforeUpdate(Trigger.new, Trigger.oldMap);
        }
        when AFTER_INSERT {
            AccountTriggerHandler.handleAfterInsert(Trigger.newMap);
        }
        when AFTER_UPDATE {
            AccountTriggerHandler.handleAfterUpdate(Trigger.new, Trigger.oldMap);
        }
    }
}`,
      },
      {
        heading: '2. Why a Static Boolean Flag Breaks on >200 Records (PD2 High-Yield)',
        content:
          'Suppose a single Apex DML statement (e.g., `update caseList;`) updates **500 records** in one transaction. Salesforce splits them into **3 chunks of 200, 200, and 100 records**, invoking your Trigger 3 times within the **same transaction**. (Note: external loads differ — each SOAP API / Data Loader batch of up to 200 records, and each Bulk API 200-record chunk, runs in its own transaction.)\nIf Chunk 1 (records 1–200) sets `public static Boolean hasRun = true;`, then Chunk 2 (201–400) and Chunk 3 (401–500) see `hasRun == true` and **exit immediately without processing**! Always track processed IDs using `private static Set<Id> processedIds = new Set<Id>();` combined with checking if the field value actually changed (`newVal != oldVal`).',
      },
    ],
    codeComparison: {
      title: 'Naive static Boolean (Drops Records 201+) vs. Record-Level static Set<Id> Guard',
      antiPatternLabel: '❌ Anti-Pattern (反模式): Single static Boolean skips Chunks 2+ in >200 bulk DML',
      antiPatternCode: `public class CaseTriggerHandler {
    public static Boolean hasRun = false;
    public static void afterUpdate(List<Case> newCases) {
        if (hasRun) return; // BUG: In a 500-record update, records 201-500 are silently ignored!
        hasRun = true;
        // Business logic...
    }
}`,
      bestPracticeLabel: '✅ Best Practice (最佳实践): Check field transition + static Set<Id> processedCaseIds',
      bestPracticeCode: `public class CaseTriggerHandler {
    private static Set<Id> processedCaseIds = new Set<Id>();

    public static void afterUpdate(List<Case> newCases, Map<Id, Case> oldMap) {
        List<Case> escalatedCases = new List<Case>();
        for (Case c : newCases) {
            Case oldCase = oldMap.get(c.Id);
            // Only process if Status just changed to Escalated AND this Id hasn't been processed yet
            if (c.Status == 'Escalated' &&
                oldCase.Status != 'Escalated' &&
                !processedCaseIds.contains(c.Id)) {
                processedCaseIds.add(c.Id);
                escalatedCases.add(c);
            }
        }
        if (!escalatedCases.isEmpty()) {
            notifyEscalationTeam(escalatedCases);
        }
    }
}`,
      explanation:
        'Using `Set<Id> processedCaseIds` prevents infinite recursion (max trigger depth = 16) for records already handled, while allowing subsequent 200-record chunks in the same transaction to execute normally.',
    },
    examTraps: [
      'Exam Trap 1: Maximum trigger recursion depth is 16 (`System.TriggerException: Maximum trigger depth exceeded`).',
      'Exam Trap 2: If Apex code inserts 1,000 records with a single DML statement, the trigger executes 5 times (200 records each), and all 5 executions share the SAME transaction Governor Limits (100 SOQL total, not 500)!',
    ],
    linkedChallengeId: 'C06',
    linkedQuestionIds: ['Q17', 'Q18'],
  },

  {
    id: 'L07',
    daySuggested: 7,
    stage: 'intermediate',
    domain: 'SOQL & SOSL 数据查询 (Data Query)',
    examDomain: 'Process Automation & Logic (28%)',
    title: '进阶 SOQL：父子双向关联查询、AggregateResult 聚合与 SOQL For Loop',
    titleEn: 'Advanced SOQL: Parent-Child Subqueries, AggregateResult & SOQL For Loops',
    subtitle: '掌握 (SELECT ... FROM Contacts) 嵌套子查询、GROUP BY 与 200 条流式批处理循环防内存溢出',
    subtitleEn: 'Master parent-to-child subqueries, GROUP BY AggregateResult, and streaming SOQL For Loops to prevent Heap Size limits',
    estimatedMinutes: 40,
    examFrequency: '极高频必考 (High-Yield)',
    summary:
      '复杂业务统计离不开聚合函数（COUNT、SUM、AVG、MIN、MAX）和父子双向查询。同时，面对数万条查询结果，使用 SOQL For Loop 流式游标可以将 Heap Size 内存占用从数 MB 降低到几 KB。',
    summaryEn:
      'Enterprise reporting relies on aggregate functions (COUNT, SUM, AVG, MIN, MAX) and parent-child relationship queries. When processing tens of thousands of rows, using a SOQL For Loop streams records in 200-record chunks to prevent exceeding the 6 MB / 12 MB Heap Size limit.',
    examGlossary: [
      {
        termEn: 'AggregateResult & expr0 Default Alias',
        meaningZh: '含 GROUP BY 或聚合函数的查询返回 List<AggregateResult>；未起别名的聚合列默认叫 expr0, expr1',
        examSignalPhraseEn: '"Retrieve aggregated values from a GROUP BY query using ar.get(\'alias\') or ar.get(\'expr0\')."',
      },
      {
        termEn: 'SOQL For Loop (for (List<SObject> batch : [SELECT ...]))',
        meaningZh: '流式游标循环，每次仅加载 200 条进内存，专门解决 Apex heap size too large 内存溢出',
        examSignalPhraseEn: '"Resolve System.LimitException: Apex heap size too large when querying 40,000 records -> Use a SOQL For Loop."',
      },
      {
        termEn: 'Aggregate Query Row Counting Rule',
        meaningZh: 'SUM/AVG/MIN/MAX 聚合所扫描的每一行底层记录都计入 50,000 行 SOQL Query Rows 配额；COUNT()/COUNT(field) 只计 1 行（有 GROUP BY 时每组计 1 行）',
        examSignalPhraseEn: '"All aggregate functions other than COUNT() or COUNT(fieldname) include each row used by the aggregation as a query row; COUNT queries consume one query row, or one row per grouping with GROUP BY."',
      },
    ],
    coreConcepts: [
      {
        heading: '1. AggregateResult Queries & Reading Aliases (聚合查询与别名读取)',
        content:
          'Any SOQL query using `GROUP BY` or aggregate functions (`SUM`, `AVG`, `MIN`, `MAX`, `COUNT(fieldName)`) returns **`List<AggregateResult>`**. Unaliased aggregate columns are automatically named **`expr0`**, **`expr1`**, etc. Always cast the result of `ar.get(\'aliasName\')` to the appropriate type (`Decimal`, `Integer`, `Id`).',
        language: 'apex',
        codeSnippet: `List<AggregateResult> results = [
    SELECT AccountId, StageName, COUNT(Id) dealCount, SUM(Amount) totalRevenue
    FROM Opportunity
    WHERE IsClosed = false
    GROUP BY AccountId, StageName
    HAVING SUM(Amount) > 100000
];

for (AggregateResult ar : results) {
    Id accId = (Id) ar.get('AccountId');
    Integer count = (Integer) ar.get('dealCount');
    Decimal revenue = (Decimal) ar.get('totalRevenue');
    System.debug('Account ' + accId + ' has ' + count + ' deals totaling: ' + revenue);
}`,
      },
      {
        heading: '2. SOQL For Loops to Prevent Heap Size Limit Exceeded (流式游标防内存爆炸)',
        content:
          'Assigning `List<Contact> all = [SELECT Id, Description FROM Contact];` loads all 45,000 records into memory at once, breaching the **6 MB synchronous Heap Limit** (`System.LimitException: Apex heap size too large`). By placing the SOQL query directly inside the `for` loop header (`for (List<Contact> batch : [SELECT ...])`), the platform uses `query` and `queryMore` cursors to stream **200 records at a time**, keeping heap usage minimal.',
        language: 'apex',
        codeSnippet: `// Best Practice: List-based SOQL For Loop processes 200 records per iteration and frees memory
for (List<Contact> contactBatch : [
    SELECT Id, FirstName, LastName, MailingCountry
    FROM Contact
    WHERE MailingCountry = null
]) {
    for (Contact c : contactBatch) {
        c.MailingCountry = 'New Zealand';
    }
    update contactBatch; // Single DML per 200-record chunk
}`,
      },
    ],
    codeComparison: {
      title: 'Loading 45,000 Records into a List Variable vs. Streaming SOQL For Loop',
      antiPatternLabel: '❌ Anti-Pattern (反模式): Assigning large result set directly to a List (Heap > 6MB crash)',
      antiPatternCode: `public static void processLargeContacts() {
    // Loads all 45,000 records into RAM at once -> Apex heap size too large!
    List<Contact> hugeList = [SELECT Id, Name, Description FROM Contact LIMIT 45000];
    for (Contact c : hugeList) {
        // Process...
    }
}`,
      bestPracticeLabel: '✅ Best Practice (最佳实践): Inline SOQL inside For Loop header (200-row streaming)',
      bestPracticeCode: `public static void processLargeContacts() {
    // Streams 200 records at a time via database cursor; heap stays under 200 KB
    for (List<Contact> batch : [SELECT Id, Name, Description FROM Contact LIMIT 45000]) {
        for (Contact c : batch) {
            // Process...
        }
    }
}`,
      explanation:
        'Whenever an exam scenario mentions `Apex heap size too large` on a large query, the answer is to refactor into a **SOQL For Loop**.',
    },
    examTraps: [
      'Exam Trap 1: If `Opportunity` has 40,000 records across 5 stages, `SELECT StageName, SUM(Amount) FROM Opportunity GROUP BY StageName` returns 5 `AggregateResult` rows, but consumes **40,000 query rows** against the 50,000 limit! (Exception: `COUNT()`/`COUNT(Id)` with `GROUP BY StageName` consumes only 5 query rows — 1 per group.)',
      'Exam Trap 2: Unaliased aggregate expressions in `AggregateResult` are accessed via `ar.get(\'expr0\')`, `ar.get(\'expr1\')`.',
    ],
    linkedChallengeId: 'C07',
    linkedQuestionIds: ['Q19', 'Q20', 'Q21'],
  },

  {
    id: 'L08',
    daySuggested: 8,
    stage: 'intermediate',
    domain: 'Apex 核心与面向对象 (Apex & OOP)',
    examDomain: 'Process Automation & Logic (28%)',
    title: 'DML 事务控制、Database 部分成功机制与 Mixed DML 破局',
    titleEn: 'DML Transaction Control, Database Partial Success & Mixed DML Operations',
    subtitle: '对比 insert vs Database.insert(list, false)，掌握 Savepoint 回滚与 Setup 对象隔离',
    subtitleEn: 'Compare DML statements vs. Database.insert(list, false), Savepoint rollback, and resolving MIXED_DML_OPERATION',
    estimatedMinutes: 35,
    examFrequency: '极高频必考 (High-Yield)',
    summary:
      'Apex 提供两种 DML 操作方式：DML 关键字语句（如 insert list; 全部成功或全部抛出 DmlException 回滚）与 Database 类方法（如 Database.insert(list, false)，支持 Partial Success 部分成功且不抛异常）。',
    summaryEn:
      'Apex offers two ways to perform DML: standalone DML statements (all-or-nothing, throwing DmlException on any error) and Database class methods with allOrNone=false (allowing partial commit without throwing an exception).',
    examGlossary: [
      {
        termEn: 'Database.insert(recordList, false) (allOrNone = false)',
        meaningZh: '允许部分成功入库，且不会抛出 DmlException，错误封装在 Database.SaveResult 中',
        examSignalPhraseEn: '"Commit valid records while gracefully skipping invalid records without throwing a DmlException."',
      },
      {
        termEn: 'MIXED_DML_OPERATION (Setup vs. Non-Setup Objects)',
        meaningZh: '同一同步事务中严禁同时对 Setup 对象（User/PermissionSetAssignment/GroupMember）和业务对象（Account）做 DML',
        examSignalPhraseEn: '"Inserting an Account and updating a User or PermissionSetAssignment in the same transaction throws MIXED_DML_OPERATION -> Separate using @future / Queueable (or System.runAs in tests)."',
      },
      {
        termEn: 'upsert list External_ID_Field__c',
        meaningZh: '根据指定的 External ID 字段自动判断新建或更新，无需先写 SOQL 查询',
        examSignalPhraseEn: '"Synchronize records from an external ERP system using an External ID field without querying first -> upsert."',
      },
    ],
    coreConcepts: [
      {
        heading: '1. DML Statement vs. Database.insert(records, allOrNone)',
        content:
          '• `insert accounts;` is equivalent to `Database.insert(accounts, true);` (All-or-None). If 1 record out of 100 fails validation, all 100 fail and a `DmlException` is thrown.\n• `Database.SaveResult[] results = Database.insert(accounts, false);` sets `allOrNone = false`. If 3 records fail out of 100, **the remaining 97 valid records succeed and are committed**! Crucially, **NO `DmlException` is thrown**—you inspect `sr.isSuccess()` and `sr.getErrors()`.',
        language: 'apex',
        codeSnippet: `List<Database.SaveResult> srList = Database.insert(accountsToInsert, false);
for (Integer i = 0; i < srList.size(); i++) {
    Database.SaveResult sr = srList[i];
    if (!sr.isSuccess()) {
        for (Database.Error err : sr.getErrors()) {
            System.debug('Record index ' + i + ' failed: ' + err.getStatusCode() + ' - ' + err.getMessage());
        }
    }
}`,
      },
      {
        heading: '2. Resolving MIXED_DML_OPERATION Errors (Setup vs. Non-Setup Objects)',
        content:
          'Salesforce forbids performing DML on a **Setup Object** (`User`, `Group`, `GroupMember`, `PermissionSetAssignment`, `QueueSObject`, `ObjectPermissions`) and a **Non-Setup Object** (`Account`, `Contact`, `Custom__c`) in the same synchronous transaction because Setup changes recalculate sharing access across the org.\n• **In Production Code**: Move the Setup Object DML into an asynchronous **`@future`** or **`Queueable`** method.\n• **In Apex Unit Tests**: Wrap the Setup Object DML inside **`System.runAs(user) { ... }`**. ',
      },
    ],
    codeComparison: {
      title: 'Synchronous Account + User DML (MIXED_DML_OPERATION) vs. @future Separation',
      antiPatternLabel: '❌ Anti-Pattern (反模式): Inserting Account and updating User in the same sync transaction',
      antiPatternCode: `public static void onboardPartner(Account partnerAcc, Id userId, Id roleId) {
    insert partnerAcc; // Non-Setup Object DML
    // THROWS System.DmlException: MIXED_DML_OPERATION
    update new User(Id = userId, UserRoleId = roleId); // Setup Object DML
}`,
      bestPracticeLabel: '✅ Best Practice (最佳实践): Offload Setup Object DML to @future or Queueable',
      bestPracticeCode: `public static void onboardPartner(Account partnerAcc, Id userId, Id roleId) {
    insert partnerAcc; // Synchronous Non-Setup DML
    assignUserRoleAsync(userId, roleId); // Asynchronous separate transaction for Setup DML
}

@future
public static void assignUserRoleAsync(Id userId, Id roleId) {
    update new User(Id = userId, UserRoleId = roleId);
}`,
      explanation:
        'Separating the `User` or `PermissionSetAssignment` DML into a `@future` or `Queueable` method executes it in a separate transaction, completely avoiding `MIXED_DML_OPERATION`.',
    },
    examTraps: [
      'Exam Trap 1: When `Database.insert(cons, false)` encounters a record missing a required field, does execution enter `catch (DmlException e)`? NO! `allOrNone = false` never throws `DmlException`.',
      'Exam Trap 2: Calling `Database.setSavepoint()` and `Database.rollback(sp)` each counts as **1 DML statement** against the 150 DML limit!',
    ],
    linkedChallengeId: 'C08',
    linkedQuestionIds: ['Q22', 'Q23', 'Q24'],
  },

  {
    id: 'L09',
    daySuggested: 9,
    stage: 'intermediate',
    domain: 'LWC 现代前端组件 (Lightning Web Components)',
    examDomain: 'User Interface (25%)',
    title: 'LWC 组件通信全景：@api、CustomEvent 冒泡与 LMS 跨树通信',
    titleEn: 'LWC Component Communication: @api, CustomEvent & Lightning Message Service (LMS)',
    subtitle: '父传子、子传父、以及无父子关系的跨页面组件（LWC / Aura / VF）通信方案决策',
    subtitleEn: 'Parent-to-Child (@api), Child-to-Parent (CustomEvent), and Unrelated Cross-DOM / Cross-Tech (LMS) communication',
    estimatedMinutes: 45,
    examFrequency: '极高频必考 (High-Yield)',
    summary:
      'LWC 严格遵循单向数据流（One-way Data Flow）。父向子传值或调方法使用 @api；子向父通知使用标准 DOM CustomEvent；而页面上没有直接父子层级关系的两个独立组件（甚至跨 LWC、Aura、Visualforce）则必须通过 Lightning Message Service (LMS) 通信。',
    summaryEn:
      'LWC enforces one-way data binding: Parent-to-Child uses @api properties/methods, Child-to-Parent dispatches standard DOM CustomEvents with a detail payload, and unrelated components across the page (including across LWC, Aura, and Visualforce) communicate via Lightning Message Service (LMS).',
    examGlossary: [
      {
        termEn: '@api Public Property & Public Method',
        meaningZh: '父传子公开属性（子组件内只读不可直接修改）或供父组件 querySelector 调用的公开方法',
        examSignalPhraseEn: '"Pass data from a parent component to a child component or invoke a method on a child component from the parent -> @api."',
      },
      {
        termEn: 'CustomEvent(eventName, { detail: payload })',
        meaningZh: '子传父标准 DOM 事件，事件名全小写无 on 前缀，数据挂载在 detail 属性上',
        examSignalPhraseEn: '"Communicate from a child component to its parent component -> Dispatch a CustomEvent and pass data in the detail property."',
      },
      {
        termEn: 'Lightning Message Service (LMS - lightning/messageService)',
        meaningZh: '同页面内无父子关系的独立组件（支持跨 LWC、Aura、Visualforce）发布/订阅通信总线',
        examSignalPhraseEn: '"Communicate between unrelated components on the same Lightning page, or across LWC, Aura, and Visualforce -> Lightning Message Service (LMS)."',
      },
    ],
    coreConcepts: [
      {
        heading: '1. Parent-to-Child: @api Properties & @api Public Methods',
        content:
          '• Properties decorated with `@api` are reactive and supplied by the parent. **A child component MUST NEVER mutate an `@api` object property directly** (it is wrapped in a read-only proxy membrane).\n• Methods decorated with `@api` can be called imperatively by the parent via `this.template.querySelector(\'c-child-comp\').myPublicMethod()`.',
      },
      {
        heading: '2. Child-to-Parent: Dispatching CustomEvent with detail',
        content:
          'The child dispatches `this.dispatchEvent(new CustomEvent(\'itemselect\', { detail: { recordId: this.id } }))` (event name lowercase, NO `on` prefix). The parent listens in HTML using `onitemselect={handleSelect}` and reads `event.detail.recordId`.\n• Default `{ bubbles: false, composed: false }`: Only notifies the immediate parent.\n• `{ bubbles: true, composed: false }`: Bubbles inside the current shadow tree (e.g., through `<slot>`).\n• `{ bubbles: true, composed: true }`: Crosses Shadow DOM boundaries (use sparingly).',
        language: 'javascript',
        codeSnippet: `// Child Component: childItem.js
import { LightningElement, api } from 'lwc';
export default class ChildItem extends LightningElement {
    @api item;
    handleClick() {
        // Event name 'itemselect' maps to 'onitemselect' in the parent HTML template
        const evt = new CustomEvent('itemselect', {
            detail: { id: this.item.Id, name: this.item.Name }
        });
        this.dispatchEvent(evt);
    }
}`,
      },
      {
        heading: '3. Unrelated Components / Cross-Framework: Lightning Message Service (LMS)',
        content:
          'When two sibling components sit in different regions of a Lightning page (or when an **LWC**, an **Aura component**, and an embedded **Visualforce page** need to exchange messages), use **Lightning Message Service (`lightning/messageService`)** with a custom `MessageChannel` (`@salesforce/messageChannel/ChannelName__c`).',
        language: 'javascript',
        codeSnippet: `import { LightningElement, wire } from 'lwc';
import { publish, subscribe, unsubscribe, MessageContext } from 'lightning/messageService';
import ACCOUNT_CHANNEL from '@salesforce/messageChannel/AccountSelected__c';

export default class AccountSubscriber extends LightningElement {
    subscription = null;
    selectedAccountId;

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        if (!this.subscription) {
            this.subscription = subscribe(this.messageContext, ACCOUNT_CHANNEL, (msg) => {
                this.selectedAccountId = msg.accountId;
            });
        }
    }

    disconnectedCallback() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }
}`,
      },
    ],
    codeComparison: {
      title: 'Mutating @api Object in Child (Read-Only Error) vs. Dispatching CustomEvent',
      antiPatternLabel: '❌ Anti-Pattern (反模式): Child directly mutating an @api object property',
      antiPatternCode: `export default class OrderRow extends LightningElement {
    @api orderRecord;
    handleApprove() {
        // RUNTIME ERROR: Uncaught TypeError: Cannot assign to read only property 'Status__c'
        this.orderRecord.Status__c = 'Approved';
    }
}`,
      bestPracticeLabel: '✅ Best Practice (最佳实践): Dispatch CustomEvent with detail payload to Parent',
      bestPracticeCode: `export default class OrderRow extends LightningElement {
    @api orderRecord;
    handleApprove() {
        this.dispatchEvent(new CustomEvent('approveorder', {
            detail: { orderId: this.orderRecord.Id, status: 'Approved' }
        }));
    }
}`,
      explanation:
        'LWC wraps objects passed via `@api` in a read-only proxy. Always dispatch a `CustomEvent` so the parent component owns state mutations.',
    },
    examTraps: [
      'Exam Trap 1: If an exam question asks how an LWC, an Aura component, and a Visualforce page on the same Lightning page can communicate, the ONLY native answer is **Lightning Message Service (LMS)**.',
      'Exam Trap 2: Custom payload data in `CustomEvent` must be passed inside the **`detail`** property (`{ detail: ... }`), read via `event.detail`.',
    ],
    linkedChallengeId: 'C09',
    linkedQuestionIds: ['Q25', 'Q26', 'Q27'],
  },

  {
    id: 'L10',
    daySuggested: 10,
    stage: 'intermediate',
    domain: 'LWC 现代前端组件 (Lightning Web Components)',
    examDomain: 'User Interface (25%)',
    title: 'LWC 生命周期钩子、LDS 表单与 @wire vs Imperative Apex',
    titleEn: 'LWC Lifecycle Hooks, Lightning Data Service (LDS) & @wire vs. Imperative Apex',
    subtitle: '掌握 connectedCallback / renderedCallback 执行顺序、反应式变量 $recordId 与 refreshApex',
    subtitleEn: 'Master parent-child lifecycle order, lightning-record-form, reactive $recordId, and refreshApex()',
    estimatedMinutes: 45,
    examFrequency: '极高频必考 (High-Yield)',
    summary:
      '在 LWC 中访问 Salesforce 数据时，官方遵循“优先使用 LDS 基础表单组件 (lightning-record-form) → 其次 @wire LDS 适配器 → 最后自定义 Apex”的原则；使用 @wire 调用 Apex 时方法必须带 @AuraEnabled(cacheable=true)。',
    summaryEn:
      'When working with Salesforce data in LWC, prioritize Base Lightning Components built on Lightning Data Service (lightning-record-form), then @wire LDS adapters, and finally custom Apex. Apex methods wired via @wire MUST be annotated with @AuraEnabled(cacheable=true).',
    examGlossary: [
      {
        termEn: '@AuraEnabled(cacheable=true)',
        meaningZh: '使 Apex 方法支持被 LWC @wire 调用（方法内部严禁包含任何 DML 语句）',
        examSignalPhraseEn: '"To use @wire with an Apex method, the method must be annotated with @AuraEnabled(cacheable=true) and cannot perform DML."',
      },
      {
        termEn: 'refreshApex(wiredResult)',
        meaningZh: '强制刷新 @wire 缓存，必须传入 @wire 注入的完整未解构对象（而非 result.data）',
        examSignalPhraseEn: '"Pass the entire provisioned object (not the destructured data property) to refreshApex()."',
      },
      {
        termEn: 'Lifecycle Order (Parent -> Child on connect; Child -> Parent on renderedCallback)',
        meaningZh: 'constructor 和 connectedCallback 从父到子执行；renderedCallback 从子到父执行',
        examSignalPhraseEn: '"constructor and connectedCallback flow from parent to child, whereas renderedCallback flows from child to parent."',
      },
    ],
    coreConcepts: [
      {
        heading: '1. LWC Lifecycle Hooks Order (父子组件生命周期执行顺序)',
        content:
          'When `c-parent` mounts `c-child`:\n1. Parent `constructor()` → 2. Parent `connectedCallback()` → 3. Child `constructor()` → 4. Child `connectedCallback()` → 5. **Child `renderedCallback()`** → 6. **Parent `renderedCallback()`** (Bottom-up!).\n• Never access child DOM elements inside `constructor()`, and always guard state changes inside `renderedCallback()` with a boolean flag to avoid infinite render loops.',
      },
      {
        heading: '2. Lightning Data Service (LDS) Base Form Components',
        content:
          '• **`lightning-record-form`**：Fastest way to display and edit a record with zero Apex code! Accepts `record-id`, `object-api-name`, and `fields={fields}` or `layout-type="Full"`.\n• **`lightning-record-view-form`** (`lightning-output-field`)：Read-only custom field layout.\n• **`lightning-record-edit-form`** (`lightning-input-field`)：Custom edit layout with `onsubmit` / `onsuccess` interception.',
      },
      {
        heading: '3. @wire Reactive Adapter vs. Imperative Apex & refreshApex()',
        content:
          '• **`@wire(getContacts, { accountId: \'$recordId\' })`**：\n  - Requires `@AuraEnabled(cacheable=true)` on the `public static` Apex method (**NO DML allowed**!).\n  - Prefixing a parameter with **`$`** (`\'$recordId\'`) makes it reactive: whenever `this.recordId` changes, `@wire` automatically re-fetches data.\n  - To manually refresh cached `@wire` data after an imperative DML update, pass the **entire provisioned result object** (`this.wiredContactsResult`) into **`refreshApex(this.wiredContactsResult)`**.\n• **Imperative Apex (`await markPrimary({ contactId })`)**：Used for button-click actions or any Apex method that performs DML (`@AuraEnabled` without `cacheable=true`).',
        language: 'javascript',
        codeSnippet: `import { LightningElement, api, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getRelatedContacts from '@salesforce/apex/ContactController.getRelatedContacts';
import markPrimaryContact from '@salesforce/apex/ContactController.markPrimaryContact';

export default class AccountContactsPanel extends LightningElement {
    @api recordId;
    contacts = [];
    error;
    wiredContactsResult; // Store the entire provisioned wire result for refreshApex()

    @wire(getRelatedContacts, { accountId: '$recordId' })
    wiredContacts(result) {
        this.wiredContactsResult = result;
        if (result.data) {
            this.contacts = result.data;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.contacts = [];
        }
    }

    async handleSetPrimary(event) {
        const contactId = event.currentTarget.dataset.id;
        // Perform DML imperatively, then refresh the @wire cache
        await markPrimaryContact({ contactId });
        await refreshApex(this.wiredContactsResult);
    }
}`,
      },
    ],
    codeComparison: {
      title: 'Passing Destructured data to refreshApex (Fails) vs. Passing Provisioned Result',
      antiPatternLabel: '❌ Anti-Pattern (反模式): Destructuring ({ error, data }) breaks refreshApex()',
      antiPatternCode: `@wire(getOpps, { accId: '$recordId' })
wiredOpps({ error, data }) {
    if (data) this.opps = data;
}
handleRefresh() {
    // FAILS SILENTLY: refreshApex requires the full wire result object, not just data!
    refreshApex(this.opps);
}`,
      bestPracticeLabel: '✅ Best Practice (最佳实践): Hold reference to full result object for refreshApex()',
      bestPracticeCode: `wiredOppsResult;
@wire(getOpps, { accId: '$recordId' })
wiredOpps(result) {
    this.wiredOppsResult = result;
    if (result.data) this.opps = result.data;
}
handleRefresh() {
    return refreshApex(this.wiredOppsResult);
}`,
      explanation:
        'Exam favorite: `refreshApex()` inspects metadata on the outer provisioned wire object `{ data, error }`. Passing `this.opps` (`result.data`) will not refresh the cache.',
    },
    examTraps: [
      'Exam Trap 1: An Apex method called via `@wire` MUST have `@AuraEnabled(cacheable=true)` and CANNOT contain any DML statements.',
      'Exam Trap 2: Need to display/edit a single record respecting FLS, CRUD, and validation rules without writing Apex? Use `lightning-record-form`.',
      'Exam Trap 3: `renderedCallback()` fires from Child to Parent and runs after every reactive state change—mutating tracked state unconditionally inside `renderedCallback()` causes an infinite loop.',
    ],
    linkedChallengeId: 'C10',
    linkedQuestionIds: ['Q28', 'Q29', 'Q30', 'Q31'],
  },

  // ==================== STAGE 3: ADVANCED (高级架构 - PD1 High-Score & PD2 Core) ====================
  {
    id: 'L11',
    daySuggested: 11,
    stage: 'advanced',
    domain: '异步 Apex 与集成架构 (Async Apex & Integration)',
    examDomain: 'Process Automation & Logic (28%)',
    title: '异步 Apex 四大支柱全景对比：@future、Queueable、Batch 与 Schedulable',
    titleEn: 'Asynchronous Apex Four Pillars: @future, Queueable, Batch & Schedulable',
    subtitle: '一张决策表搞定所有异步选型考题：非原始类型传参、链式调用、5000 万行处理与 Stateful',
    subtitleEn: 'Master non-primitive parameters, Job Chaining, TransactionFinalizer, 50M rows QueryLocator, and Database.Stateful',
    estimatedMinutes: 45,
    examFrequency: '极高频必考 (High-Yield)',
    summary:
      '异步 Apex 不仅拥有更高的 Governor Limits（200 次 SOQL、12MB Heap、60s CPU），还用于解决同步触发器外部 Callout、Mixed DML 以及数千万级大批量数据清洗。',
    summaryEn:
      'Asynchronous Apex provides higher Governor Limits (200 SOQL, 12 MB Heap, 60s CPU) and is essential for external callouts from triggers, resolving Mixed DML, chaining complex jobs, and processing up to 50 million records.',
    examGlossary: [
      {
        termEn: '@future(callout=true) Primitive Parameter Restriction',
        meaningZh: '@future 仅允许接收原始类型或原始类型集合（防止排队延迟期间 sObject 数据过时覆盖最新记录）',
        examSignalPhraseEn: '"Future methods only accept primitive data types or collections of primitives because the sObject might change between the time you call the method and the time it actually executes."',
      },
      {
        termEn: 'Queueable Apex (Non-Primitives + Job Chaining + System.Finalizer)',
        meaningZh: '支持传入 sObject/复杂对象、返回 Job Id、支持 System.enqueueJob 链式调用及 Finalizer 捕获 LimitException',
        examSignalPhraseEn: '"Pass sObjects as parameters, get an AsyncApexJob ID to monitor progress, chain a second job, or attach a TransactionFinalizer -> Queueable Apex."',
      },
      {
        termEn: 'Database.Batchable<sObject> + Database.QueryLocator (50M rows) + Database.Stateful',
        meaningZh: 'QueryLocator 突破至 5000 万行；实现 Database.Stateful 以在多个 execute 批次间保留实例变量状态',
        examSignalPhraseEn: '"Process up to 50 million records and maintain state (such as a running total or count) across batch transactions -> Database.Batchable with Database.QueryLocator and Database.Stateful."',
      },
    ],
    coreConcepts: [
      {
        heading: '1. Four Pillars of Asynchronous Apex Comparison (四大异步机制对比)',
        content:
          '1. **`@future` Methods**：\n   - Must be `static void`, annotated with `@future` (or `@future(callout=true)`).\n   - **Parameter Restriction**: ONLY accepts **primitive data types or collections of primitives** (`Set<Id>`, `List<String>`). **Cannot accept `sObject` parameters** because the sObject data might change in the database while the future method is waiting in the queue!\n   - Cannot call another `@future` method (nor be called from Batch); does NOT return a Job ID; max 50 `@future` calls per transaction.\n2. **`Queueable` Apex (`implements Queueable, Database.AllowsCallouts`)**：\n   - Accepts **`sObject` lists and custom Apex objects** via constructor!\n   - `Id jobId = System.enqueueJob(new MyJob());` returns an `AsyncApexJob` ID (50 enqueues per sync transaction; only 1 from inside an async transaction). Optional delay: `System.enqueueJob(job, delayMinutes)` (0–10 min) or `AsyncOptions` (`MinimumQueueableDelayInMinutes`, `MaximumQueueableStackDepth`, `DuplicateSignature`).\n   - Supports **Job Chaining** (calling `System.enqueueJob` inside `execute()`; chain depth unlimited except Developer/Trial orgs = 5) and **`System.Finalizer`** (`System.attachFinalizer`) to recover from unhandled `LimitException` errors!\n3. **`Batch` Apex (`implements Database.Batchable<sObject>, Database.Stateful`)**：\n   - `Database.getQueryLocator([SELECT ...])` in `start()` retrieves up to **50,000,000 (50 Million) records**! (Note: using `Iterable` is still capped at 50,000 rows).\n   - Each `execute()` chunk (default 200 records, max 2,000) gets its own fresh Governor Limits.\n   - Implementing **`Database.Stateful`** preserves instance member variables across `execute()` chunks so `finish()` can send summary emails (`static` variables are ALWAYS reset between batch transactions!).\n4. **`Schedulable` Apex (`implements Schedulable`)**：\n   - Schedules Apex classes to run at specific times via `System.schedule(\'Job Name\', cronExp, new MySchedulable())` or the Setup UI.',
        language: 'apex',
        codeSnippet: `public class RevenueSummaryBatch implements Database.Batchable<sObject>, Database.Stateful {
    // Database.Stateful preserves these instance variables across all execute() transactions!
    public Integer totalProcessedRecords = 0;
    public Decimal grandTotalAmount = 0;

    public Database.QueryLocator start(Database.BatchableContext bc) {
        // QueryLocator supports up to 50,000,000 records
        return Database.getQueryLocator([
            SELECT Id, Amount FROM Opportunity WHERE StageName = 'Closed Won' AND CloseDate = THIS_YEAR
        ]);
    }

    public void execute(Database.BatchableContext bc, List<Opportunity> scope) {
        for (Opportunity opp : scope) {
            totalProcessedRecords++;
            if (opp.Amount != null) grandTotalAmount += opp.Amount;
        }
    }

    public void finish(Database.BatchableContext bc) {
        System.debug('Processed ' + totalProcessedRecords + ' deals. Total: ' + grandTotalAmount);
    }
}`,
      },
    ],
    codeComparison: {
      title: 'Synchronous HTTP Callout in Trigger (Crash) vs. Queueable with Database.AllowsCallouts',
      antiPatternLabel: '❌ Anti-Pattern (反模式): Making synchronous HTTP Callout directly inside a Trigger',
      antiPatternCode: `trigger OrderTrigger on Order__c (after insert) {
    // THROWS System.CalloutException: Callout from triggers are currently not supported.
    HttpRequest req = new HttpRequest();
    req.setEndpoint('callout:ERP_Endpoint/orders');
    req.setMethod('POST');
    new Http().send(req);
}`,
      bestPracticeLabel: '✅ Best Practice (最佳实践): Enqueue a Queueable implementing Database.AllowsCallouts',
      bestPracticeCode: `public class OrderSyncQueueable implements Queueable, Database.AllowsCallouts {
    private List<Order__c> orders;
    public OrderSyncQueueable(List<Order__c> orders) {
        this.orders = orders;
    }
    public void execute(QueueableContext context) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:ERP_Endpoint/orders');
        req.setMethod('POST');
        req.setBody(JSON.serialize(this.orders));
        new Http().send(req);
    }
}`,
      explanation:
        'Synchronous callouts are prohibited inside Triggers because holding open database transaction locks while waiting on external HTTP servers would degrade multitenant database performance.',
    },
    examTraps: [
      'Exam Trap 1: Why can\'t `@future` accept `sObject` parameters? Because the sObject might be modified between enqueue time and execution time, risking overwriting newer data.',
      'Exam Trap 2: In Batch Apex, `static` variables DO NOT retain their values between `execute()` chunks! You MUST use instance variables + `implements Database.Stateful`.',
      'Exam Trap 3: To make an HTTP callout from Batch or Queueable Apex, the class must also implement `Database.AllowsCallouts`.',
    ],
    linkedChallengeId: 'C11',
    linkedQuestionIds: ['Q32', 'Q33', 'Q34', 'Q35'],
  },

  {
    id: 'L12',
    daySuggested: 12,
    stage: 'advanced',
    domain: '安全模型与单元测试 (Security & Testing)',
    examDomain: 'Developer Fundamentals (27%)',
    title: '平台安全模型：WITH USER_MODE、stripInaccessible 与 CRUD/FLS 防御',
    titleEn: 'Platform Security: WITH USER_MODE, Security.stripInaccessible & CRUD/FLS Enforcement',
    subtitle: '掌握现代 Salesforce 安全最佳实践，区分何时抛异常拦截、何时静默脱敏无权限字段',
    subtitleEn: 'Distinguish WITH USER_MODE vs. Security.stripInaccessible (stripping unauthorized fields without throwing an exception)',
    estimatedMinutes: 35,
    examFrequency: '极高频必考 (High-Yield)',
    summary:
      '传统上（API v66.0 及更早版本），Apex 代码默认运行在 System Mode（系统模式），会自动忽略当前用户的对象权限（CRUD）和字段级安全（FLS）。Summer \'26（API v67.0）起引入 secure-by-default：v67.0+ 编译的类省略共享关键字时默认 with sharing，SOQL/SOSL/DML 默认 user mode（可用 AccessLevel.SYSTEM_MODE / WITH SYSTEM_MODE 显式退出）。在 LWC 控制器或集成接口中，开发者仍应显式选择 WITH USER_MODE 或 Security.stripInaccessible。',
    summaryEn:
      'Classically (API v66.0 and earlier), Apex executes in System Mode by default, bypassing Object CRUD and Field-Level Security (FLS). Since Summer \'26 (API v67.0), secure-by-default Apex makes classes that omit a sharing keyword default to with sharing and runs SOQL/SOSL/DML in user mode (opt out with AccessLevel.SYSTEM_MODE / WITH SYSTEM_MODE). Developers should still explicitly enforce user permissions using WITH USER_MODE, Security.stripInaccessible(), or Schema describe checks.',
    examGlossary: [
      {
        termEn: 'WITH USER_MODE (SOQL) & as user (DML)',
        meaningZh: '同时强制执行 CRUD + 所有子句(含WHERE/ORDER BY)的 FLS + 记录共享规则（哪怕外层类是 without sharing）',
        examSignalPhraseEn: '"Enforce Object CRUD, Field-Level Security across all SOQL clauses, and Sharing rules even inside a without sharing class -> WITH USER_MODE."',
      },
      {
        termEn: 'Security.stripInaccessible(AccessType, sourceRecords)',
        meaningZh: '静默移除用户无权读取或更新的字段而不抛出异常（without throwing an exception）',
        examSignalPhraseEn: '"Remove fields that the running user lacks FLS permission to read or update WITHOUT throwing an exception -> Security.stripInaccessible."',
      },
      {
        termEn: 'Schema.sObjectType.<Obj>.isUpdateable() / isDeletable()',
        meaningZh: '使用 Schema Describe 方法在代码中编程检查当前用户的对象 CRUD 与字段 FLS 权限',
        examSignalPhraseEn: '"Programmatically verify if the current user has permission to delete an object or update a specific field -> Schema.sObjectType."',
      },
    ],
    coreConcepts: [
      {
        heading: '1. WITH USER_MODE vs. WITH SECURITY_ENFORCED',
        content:
          '• **`WITH USER_MODE`** (Recommended Modern Standard):\n  - Enforces **Object CRUD + Field-Level Security (FLS) across ALL clauses (`SELECT`, `WHERE`, `ORDER BY`) + Record-Level Sharing Rules**!\n  - Even if the enclosing class is declared `without sharing`, a query with `WITH USER_MODE` enforces the current user\'s sharing rules.\n  - Supported in DML via `insert as user record;` or `Database.insert(record, AccessLevel.USER_MODE)`.\n• **`WITH SECURITY_ENFORCED`**:\n  - Legacy clause that only checks FLS/CRUD on `SELECT`/`FROM` fields, throws on the first violation, and does NOT override sharing mode. **Starting with API v67.0 (Summer \'26) it can no longer be used in Apex (compile error) — replace it with `WITH USER_MODE`.** It may still appear on the exam as an older, not-recommended option.',
        language: 'apex',
        codeSnippet: `// 1. Enforce CRUD + FLS + Sharing in SOQL
List<Account> accs = [
    SELECT Id, Name, AnnualRevenue, Rating
    FROM Account
    WHERE Industry = 'Technology'
    WITH USER_MODE
];

// 2. Enforce CRUD + FLS + Sharing in DML
Account newAcc = new Account(Name = 'ForceCraft Ltd');
insert as user newAcc;`,
      },
      {
        heading: '2. Security.stripInaccessible(): Sanitize Fields WITHOUT Throwing an Exception',
        content:
          'If a user lacks permission on one field (e.g., `AnnualRevenue`), `WITH USER_MODE` throws a `QueryException`/`SecurityException` and fails the entire operation. When the exam prompt specifies **"strip/remove fields the user does not have permission to view or update WITHOUT throwing an exception"**, the exact answer is **`Security.stripInaccessible(AccessType.READABLE / CREATABLE / UPDATABLE, records)`**!',
        language: 'apex',
        codeSnippet: `List<Opportunity> rawOpps = [SELECT Id, Name, Amount, ExpectedRevenue FROM Opportunity LIMIT 20];

// Gracefully strips inaccessible fields without throwing an exception!
SObjectAccessDecision decision = Security.stripInaccessible(AccessType.READABLE, rawOpps);
List<Opportunity> safeOpps = (List<Opportunity>) decision.getRecords();
Set<String> removedFields = decision.getRemovedFields().get('Opportunity');`,
      },
    ],
    codeComparison: {
      title: 'Returning Raw Records in System Mode (FLS Leak) vs. Security.stripInaccessible()',
      antiPatternLabel: '❌ Anti-Pattern (反模式): Exposing restricted fields to LWC in default System Mode',
      antiPatternCode: `@AuraEnabled(cacheable=true)
public static List<Contact> getContacts() {
    // API v66.0 and earlier: Apex runs in System Mode by default — leaks Social_Security_Number__c to unauthorized users!
    return [SELECT Id, Name, Social_Security_Number__c FROM Contact LIMIT 50];
}`,
      bestPracticeLabel: '✅ Best Practice (最佳实践): Strip unauthorized fields gracefully with stripInaccessible',
      bestPracticeCode: `@AuraEnabled(cacheable=true)
public static List<Contact> getContacts() {
    List<Contact> rows = [SELECT Id, Name, Social_Security_Number__c FROM Contact LIMIT 50];
    SObjectAccessDecision decision = Security.stripInaccessible(AccessType.READABLE, rows);
    return (List<Contact>) decision.getRecords();
}`,
      explanation:
        'Exam Keyword Cue: "gracefully remove inaccessible fields without throwing an exception" → `Security.stripInaccessible()`.',
    },
    examTraps: [
      'Exam Trap 1: Need to enforce CRUD, FLS (including `WHERE` fields), AND Sharing Rules inside a `without sharing` class? Use `WITH USER_MODE`.',
      'Exam Trap 2: Need to sanitize an incoming JSON payload of sObjects before `update` by removing fields the user cannot edit without throwing an exception? Use `Security.stripInaccessible(AccessType.UPDATABLE, records)`.',
    ],
    linkedChallengeId: 'C12',
    linkedQuestionIds: ['Q36', 'Q37', 'Q38'],
  },

  {
    id: 'L13',
    daySuggested: 13,
    stage: 'advanced',
    domain: '安全模型与单元测试 (Security & Testing)',
    examDomain: 'Testing, Debugging & Deployment (20%)',
    title: 'Apex 单元测试体系：@TestSetup、startTest/stopTest 与 HttpCalloutMock',
    titleEn: 'Apex Unit Testing: @TestSetup, Test.startTest/stopTest, HttpCalloutMock & 75% Coverage',
    subtitle: '冲刺 100% 生产级测试质量：测试数据隔离、配额重置、异步同步化与部署覆盖率铁律',
    subtitleEn: 'Master @TestSetup rollback isolation, Governor Limit resets, flushing async jobs in stopTest(), and deployment rules',
    estimatedMinutes: 40,
    examFrequency: '极高频必考 (High-Yield)',
    summary:
      'Salesforce 强制要求部署到 Production 生产环境时，整体 Apex 代码覆盖率必须达到 75% 以上，且每个 Trigger 覆盖率不能为 0%。掌握 @TestSetup 与 Test.startTest()/stopTest() 是通过考试的必由之路。',
    summaryEn:
      'Deploying to Production requires at least 75% overall Apex code coverage and >0% coverage on every Trigger. Mastering @TestSetup, Test.startTest()/stopTest(), HttpCalloutMock, and System.runAs() is essential for PD1 and PD2.',
    examGlossary: [
      {
        termEn: '@TestSetup Method (Runs Once + Automatic Rollback per Test Method)',
        meaningZh: '测试数据工厂方法：全类只运行 1 次，每个 @isTest 方法对其数据的修改在方法结束时自动回滚还原',
        examSignalPhraseEn: '"Create test records once for the entire test class and automatically roll back modifications after each @isTest method -> @TestSetup."',
      },
      {
        termEn: 'Test.startTest() & Test.stopTest()',
        meaningZh: 'startTest 开启一套全新独立的 Governor Limits 配额；stopTest 强制所有异步任务立刻同步执行完毕',
        examSignalPhraseEn: '"Reset governor limits after test data setup and force asynchronous @future / Queueable / Batch methods to execute synchronously -> Test.startTest() and Test.stopTest()."',
      },
      {
        termEn: 'Production Deployment Coverage Rules (75% Overall + >0% Every Trigger)',
        meaningZh: '生产部署要求所有 Apex 整体覆盖率 >= 75%，且每一个 Trigger 覆盖率必须 > 0%（至少 1%）',
        examSignalPhraseEn: '"At least 75% of all Apex code must be covered by unit tests, and every trigger must have some (>0%) coverage."',
      },
    ],
    coreConcepts: [
      {
        heading: '1. @TestSetup Data Isolation & Rollback Mechanics (@TestSetup 运行与回滚机制)',
        content:
          'By default, Apex tests run with `@isTest(SeeAllData=false)` and cannot see real org data (except setup/metadata objects like `User`, `Profile`, `Organization`, `RecordType`).\n• A **`@TestSetup static void setupData()`** method runs **ONLY ONCE** before any `@isTest` methods in the class.\n• Any data modifications (`update`/`delete`) made by `@isTest` Method 1 are **automatically rolled back** when Method 1 finishes, so `@isTest` Method 2 sees the original clean `@TestSetup` records!\n• Note: `@TestSetup` CANNOT be used in a class annotated with `SeeAllData=true`.',
      },
      {
        heading: '2. The Two Superpowers of Test.startTest() and Test.stopTest()',
        content:
          'Each `@isTest` method can call `Test.startTest()` and `Test.stopTest()` at most **once**:\n1. **Fresh Set of Governor Limits**: Any SOQL/DML used to prepare test data before `Test.startTest()` is excluded; code inside `startTest()`–`stopTest()` gets a brand-new 100 SOQL / 150 DML quota!\n2. **Synchronously Flushes Async Jobs**: Any `@future`, `Queueable`, or `Batch` job enqueued inside the block is forced to execute synchronously the moment **`Test.stopTest()`** is called. Always place `Assert.areEqual(...)` **AFTER `Test.stopTest()`**!',
        language: 'apex',
        codeSnippet: `@isTest
private class AccountServiceTest {
    @TestSetup
    static void makeData() {
        List<Account> accs = new List<Account>();
        for (Integer i = 0; i < 200; i++) {
            accs.add(new Account(Name = 'Test Acc ' + i, AnnualRevenue = 10000));
        }
        insert accs;
    }

    @isTest
    static void testAsyncTierUpgradeBulk() {
        List<Account> accs = [SELECT Id FROM Account];
        Set<Id> accIds = new Map<Id, Account>(accs).keySet();

        Test.startTest(); // 1. Grants a fresh set of Governor Limits
        AccountService.upgradeTierAsync(accIds); // Enqueues @future or Queueable
        Test.stopTest();  // 2. Forces async job to finish synchronously right here!

        // Always assert async results AFTER Test.stopTest()
        Integer vipCount = [SELECT COUNT() FROM Account WHERE Type = 'VIP'];
        Assert.areEqual(200, vipCount, 'All 200 accounts should be upgraded to VIP');
    }
}`,
      },
      {
        heading: '3. HttpCalloutMock & System.runAs(testUser)',
        content:
          '• **`Test.setMock(HttpCalloutMock.class, new MyMock())`**: Unit tests cannot make real external HTTP callouts. You must implement `HttpCalloutMock` (or use `StaticResourceCalloutMock`) and register it with `Test.setMock` before calling the method.\n• **`System.runAs(testUser)`**: Tests record-level sharing as a specific user (it enforces record sharing only — NOT user permissions/CRUD or FLS), avoids `MIXED_DML_OPERATION`, and each `runAs` call counts against the transaction\'s DML statement limit.',
      },
    ],
    codeComparison: {
      title: 'Asserting Async Results Before Test.stopTest() (Fails) vs. After Test.stopTest()',
      antiPatternLabel: '❌ Anti-Pattern (反模式): Asserting Batch/@future results before Test.stopTest()',
      antiPatternCode: `@isTest
static void testBatchJob() {
    Test.startTest();
    Database.executeBatch(new CleanUpBatch());
    // FAILS: The Batch job has not executed yet because stopTest() hasn't been called!
    Assert.areEqual(0, [SELECT COUNT() FROM Lead WHERE Status = 'Junk']);
    Test.stopTest();
}`,
      bestPracticeLabel: '✅ Best Practice (最佳实践): Query and Assert immediately AFTER Test.stopTest()',
      bestPracticeCode: `@isTest
static void testBatchJob() {
    Test.startTest();
    Database.executeBatch(new CleanUpBatch());
    Test.stopTest(); // Flushes start(), execute(), and finish() synchronously!

    Assert.areEqual(0, [SELECT COUNT() FROM Lead WHERE Status = 'Junk']);
}`,
      explanation:
        'Asynchronous calls (`@future`, `Queueable`, `Batch`) remain queued until `Test.stopTest()` executes.',
    },
    examTraps: [
      'Exam Trap 1: If a test class has 1 `@TestSetup` method and 5 `@isTest` methods, how many times does `@TestSetup` execute? **Only 1 time!**',
      'Exam Trap 2: Does every individual Apex Class need 75% coverage to deploy? NO! The **overall (combined)** Apex coverage must be >= 75%, and **every Trigger** must have > 0% coverage.',
    ],
    linkedChallengeId: 'C13',
    linkedQuestionIds: ['Q39', 'Q40', 'Q41'],
  },

  {
    id: 'L14',
    daySuggested: 14,
    stage: 'advanced',
    domain: '异步 Apex 与集成架构 (Async Apex & Integration)',
    examDomain: 'Process Automation & Logic (28%)',
    title: '外部集成与事件驱动架构：REST Callouts、Named Credentials 与 Platform Events',
    titleEn: 'Integration & Event-Driven Architecture: REST, Named Credentials & Platform Events',
    subtitle: '掌握 @RestResource 暴露自定义接口、Named Credentials 免硬编码鉴权与 Publish Immediately 事件',
    subtitleEn: 'Master @RestResource custom endpoints, callout:Named_Credential, and Publish Immediately Platform Events',
    estimatedMinutes: 40,
    examFrequency: '高频核心 (Core)',
    summary:
      '对外调用 REST API 使用 HttpRequest 配合 Named Credentials；对外暴露自定义 REST 端点使用 @RestResource；而跨系统实时解耦或事务回滚日志持久化则依托于 Platform Events (__e)。',
    summaryEn:
      'Outbound REST callouts use HttpRequest with Named Credentials; inbound custom REST APIs use @RestResource; and real-time pub/sub decoupling or rollback-safe error logging uses Platform Events (__e).',
    examGlossary: [
      {
        termEn: 'Named Credential (callout:My_Credential/path)',
        meaningZh: '命名凭据：在 Setup 中托管外部 API 的 URL 与 OAuth/密钥鉴权，代码中免硬编码直接用 callout: 引用',
        examSignalPhraseEn: '"Avoid hardcoding endpoint URLs and authentication credentials in Apex callouts -> Use a Named Credential."',
      },
      {
        termEn: 'Platform Event (__e): Publish Immediately vs. Publish After Commit',
        meaningZh: 'Publish Immediately 独立于数据库事务，即使当前事务抛出异常回滚，事件依然会发出（用于持久化错误日志）',
        examSignalPhraseEn: '"Persist error logs or audit events even when the database transaction rolls back due to an unhandled exception -> Platform Event configured with Publish Immediately."',
      },
      {
        termEn: 'lightning/empApi (LWC Streaming API Subscriber)',
        meaningZh: 'LWC 组件订阅服务端 Platform Events 或 Change Data Capture (CDC) 实时推送的标准模块',
        examSignalPhraseEn: '"Subscribe to Platform Events or Change Data Capture channels directly inside a Lightning Web Component -> lightning/empApi."',
      },
    ],
    coreConcepts: [
      {
        heading: '1. Outbound Callouts with Named Credentials & Inbound @RestResource',
        content:
          '• **Named Credentials**: Never hardcode URLs or tokens in Apex. Use `req.setEndpoint(\'callout:Stripe_API/v1/charges\')` so Salesforce handles endpoint resolution and OAuth/API Key authentication.\n• **Custom Apex REST (`@RestResource(urlMapping=\'/v1/Accounts/*\')`)**: Must be a **`global` class** with **`global static`** methods annotated with `@HttpGet`, `@HttpPost`, `@HttpPut`, `@HttpPatch`, or `@HttpDelete`.',
        language: 'apex',
        codeSnippet: `@RestResource(urlMapping='/v1/Accounts/*')
global with sharing class AccountRestService {
    @HttpGet
    global static Account getAccountById() {
        RestRequest req = RestContext.request;
        String accountId = req.requestURI.substring(req.requestURI.lastIndexOf('/') + 1);
        return [SELECT Id, Name, Industry, Phone FROM Account WHERE Id = :accountId WITH USER_MODE];
    }
}`,
      },
      {
        heading: '2. Platform Events (__e) & Publish Immediately vs. Publish After Commit',
        content:
          'Platform Events (`Order_Event__e`) are immutable pub/sub messages published via `EventBus.publish(events)`. They **cannot be queried via SOQL, updated, or deleted**, and their Apex Triggers **ONLY support `after insert`**!\n• **Publish After Commit**: Event is sent only if the transaction commits successfully.\n• **Publish Immediately**: Event is published immediately regardless of whether the transaction succeeds or rolls back! Ideal for **persisting error logs when a transaction rolls back**.',
      },
    ],
    codeComparison: {
      title: 'DML Insert Error Log (Rolled Back on Exception) vs. Publish Immediately Platform Event',
      antiPatternLabel: '❌ Anti-Pattern (反模式): Inserting Error_Log__c before re-throwing exception (Gets rolled back!)',
      antiPatternCode: `try {
    // Business logic fails
} catch (Exception e) {
    insert new Error_Log__c(Message__c = e.getMessage());
    throw e; // Re-throwing rolls back the entire transaction, erasing Error_Log__c!
}`,
      bestPracticeLabel: '✅ Best Practice (最佳实践): Publish a Platform Event with Publish Immediately',
      bestPracticeCode: `try {
    // Business logic fails
} catch (Exception e) {
    // Configured as 'Publish Immediately' — survives transaction rollback when throw e executes!
    EventBus.publish(new System_Error_Event__e(
        Error_Message__c = e.getMessage(),
        Stack_Trace__c = e.getStackTraceString()
    ));
    throw e;
}`,
      explanation:
        'When a transaction rolls back, standard DML, `@future`, `Queueable`, and `Publish After Commit` events are all rolled back. Only a **`Publish Immediately` Platform Event** survives rollback.',
    },
    examTraps: [
      'Exam Trap 1: Which Trigger event is supported on a Platform Event (`__e`)? **ONLY `after insert`**! (`before insert`, `update`, and `delete` do not exist for Platform Events).',
      'Exam Trap 2: Which module allows an LWC component to subscribe to Platform Events or CDC? **`lightning/empApi`**.',
    ],
    linkedChallengeId: 'C14',
    linkedQuestionIds: ['Q42', 'Q43', 'Q44'],
  },

  // ==================== STAGE 4: ARCHITECT (架构大师 - PD2 Mastery) ====================
  {
    id: 'L15',
    daySuggested: 15,
    stage: 'architect',
    domain: 'SOQL & SOSL 数据查询 (Data Query)',
    examDomain: 'Process Automation & Logic (28%)',
    title: '海量数据 (LDV) 架构调优：高选择性 SOQL、索引失效反模式与 FOR UPDATE 行锁',
    titleEn: 'Large Data Volumes (LDV): Selective SOQL Queries, Index Anti-Patterns & FOR UPDATE Locking',
    subtitle: '攻克百万级对象查询超时 (Non-selective query) 与高并发 UNABLE_TO_LOCK_ROW 死锁难题',
    subtitleEn: 'Eliminate Non-selective query exceptions using Indexed fields & Query Plan Tool, and prevent UNABLE_TO_LOCK_ROW deadlocks',
    estimatedMinutes: 45,
    examFrequency: '架构拔高 (Architect)',
    summary:
      '当单个对象的数据量突破 200,000 条（Large Data Volumes, LDV）时，非选择性（Non-selective）SOQL 查询会在 Trigger 中直接报错或超时。掌握索引字段规则、Query Plan 工具与 FOR UPDATE 锁机制是高级开发者的分水岭。',
    summaryEn:
      'When an object exceeds 200,000 records (Large Data Volumes, LDV), non-selective SOQL queries in triggers throw System.QueryException. Mastering indexed fields, the Query Plan Tool, and FOR UPDATE record locking is essential for PD2.',
    examGlossary: [
      {
        termEn: 'Selective SOQL Query & Indexed Fields (External ID / Lookup / Master-Detail)',
        meaningZh: '高选择性查询：利用主键、外键、Name、审计日期或标记为 External ID / Unique 的自定义索引字段过滤',
        examSignalPhraseEn: '"Resolve Non-selective query against large object type -> Filter on indexed fields (Primary Key, Foreign Key, Audit Dates, or External ID) and avoid leading % wildcards or != operators."',
      },
      {
        termEn: 'Index-Invalidating Anti-Patterns (LIKE \'%...\', !=, NOT IN, = null)',
        meaningZh: '导致索引失效触发全表扫描（Full Table Scan）的四大杀手：前置 % 通配符、!=、NOT IN、= null',
        examSignalPhraseEn: '"Leading wildcards (LIKE \'%term\') and negative operators (!=, NOT IN) force a full table scan."',
      },
      {
        termEn: 'FOR UPDATE & UNABLE_TO_LOCK_ROW Prevention',
        meaningZh: '使用 FOR UPDATE 获取行级锁；将子记录按父记录 AccountId 排序分组以消除并发死锁',
        examSignalPhraseEn: '"Mitigate UNABLE_TO_LOCK_ROW errors during bulk parallel updates -> Sort child records by parent AccountId and reduce batch scope size."',
      },
    ],
    coreConcepts: [
      {
        heading: '1. Standard & Custom Indexed Fields in Salesforce (哪些字段默认带索引)',
        content:
          'Salesforce automatically maintains database indexes on:\n1. Primary Keys (`Id`)\n2. Record Names (`Name`)\n3. Foreign Keys (Lookup and Master-Detail fields like `AccountId`, `OwnerId`)\n4. Audit Dates (`CreatedDate`, `SystemModstamp`) and `RecordTypeId`\n5. Custom fields marked as **External ID** or **Unique**.\nUse the **Query Plan Tool** in Developer Console: a query with **Cost < 1.0** is considered **Selective**.',
      },
      {
        heading: '2. Four Anti-Patterns That Force a Full Table Scan (导致索引失效的四大反模式)',
        content:
          'Even on an indexed field, the query optimizer cannot use the index if you write:\n• **Leading wildcards**: `WHERE Name LIKE \'%Acme%\'` (Use `LIKE \'Acme%\'` or SOSL instead)\n• **Negative operators**: `WHERE Status__c != \'Closed\'` or `NOT IN` (Rewrite positively as `WHERE Status__c IN (\'New\', \'Working\')`)\n• **Comparison with null**: `WHERE Custom_Field__c = null`\n• **Non-deterministic Formula Fields** (formulas referencing `TODAY()` or cross-object fields).',
      },
      {
        heading: '3. FOR UPDATE Row Locking & Preventing UNABLE_TO_LOCK_ROW',
        content:
          'Appending **`FOR UPDATE`** to a SOQL query locks the retrieved records until the transaction completes, preventing concurrent race conditions. When bulk inserting/updating child records (`Order_Item__c`), Salesforce implicitly locks the parent (`Account`). To prevent **`UNABLE_TO_LOCK_ROW`** deadlocks across parallel batches, **sort child records by `AccountId` (parent ID)** so each batch locks as few parents as possible in a consistent order, and reduce the Batch scope size.',
        language: 'apex',
        codeSnippet: `// Lock inventory records for the duration of the transaction to prevent concurrent overselling
List<Inventory__c> items = [
    SELECT Id, Available_Stock__c
    FROM Inventory__c
    WHERE Product_Code__c = :skuCode
    FOR UPDATE
];`,
      },
    ],
    codeComparison: {
      title: 'Non-Selective Negative/Wildcard Query (LDV Crash) vs. Selective Indexed Query',
      antiPatternLabel: '❌ Anti-Pattern (反模式): != and leading % wildcard on a 5M-row table',
      antiPatternCode: `// Throws System.QueryException: Non-selective query against large object type
List<Case> activeCases = [
    SELECT Id, Subject
    FROM Case
    WHERE Status != 'Closed'
      AND Subject LIKE '%Refund%'
];`,
      bestPracticeLabel: '✅ Best Practice (最佳实践): Positive IN set + Indexed Foreign Key & Date range',
      bestPracticeCode: `Set<String> openStatuses = new Set<String>{'New', 'Working', 'Escalated'};
List<Case> activeCases = [
    SELECT Id, Subject
    FROM Case
    WHERE AccountId IN :targetAccountIds
      AND Status IN :openStatuses
      AND CreatedDate = LAST_N_DAYS:90
];`,
      explanation:
        'Replacing `!=` with a positive `IN :openStatuses` and anchoring on indexed `AccountId` and `CreatedDate` drops the Query Plan Cost below the 1.0 selectivity threshold.',
    },
    examTraps: [
      'Exam Trap 1: How can you make a custom text field indexed without contacting Salesforce Customer Support? Mark the field as **External ID** or **Unique**.',
      'Exam Trap 2: How do you fix `UNABLE_TO_LOCK_ROW` when parallel batches insert child records? **Order the records by Parent ID (`AccountId`)** and reduce the batch scope size.',
    ],
    linkedChallengeId: 'C15',
    linkedQuestionIds: ['Q45', 'Q46'],
  },

  {
    id: 'L16',
    daySuggested: 16,
    stage: 'architect',
    domain: 'LWC 现代前端组件 (Lightning Web Components)',
    examDomain: 'Testing, Debugging & Deployment (20%)',
    title: 'LWC 高级架构与 Jest 单元测试：Shadow DOM、Wire Mock 与异步 DOM 断言',
    titleEn: 'LWC Architecture & Jest Unit Testing: Shadow DOM, Wire Adapters & Async Microtasks',
    subtitle: '深入掌握 createElement、element.shadowRoot、@salesforce/sfdx-lwc-jest 与 Promise.resolve()',
    subtitleEn: 'Master createElement, element.shadowRoot.querySelector, wire adapter .emit(), and await Promise.resolve()',
    estimatedMinutes: 40,
    examFrequency: '架构拔高 (Architect)',
    summary:
      'LWC 的单元测试不在 Salesforce 服务器上运行，而是基于 Node.js + `@salesforce/sfdx-lwc-jest` 在本地极速执行。理解 `element.shadowRoot.querySelector`、Wire Adapter `emit()` 以及 `await Promise.resolve()` 微任务刷新是攻克 UI 测试考题的关键。',
    summaryEn:
      'LWC unit tests run locally in Node.js using @salesforce/sfdx-lwc-jest. Mastering element.shadowRoot.querySelector, mocking @wire adapters with .emit(), cleaning up document.body in afterEach, and awaiting Promise.resolve() before DOM assertions is critical.',
    examGlossary: [
      {
        termEn: 'element.shadowRoot.querySelector() (in Jest) vs. this.template.querySelector() (in Component)',
        meaningZh: '在 Jest 测试外部用 element.shadowRoot 访问组件内部 DOM；在组件 .js 内部用 this.template 访问',
        examSignalPhraseEn: '"Query DOM elements inside an LWC component during a Jest test -> element.shadowRoot.querySelector()."',
      },
      {
        termEn: 'await Promise.resolve() (Microtask Queue Flush)',
        meaningZh: '等待 LWC 异步微任务队列完成响应式 DOM 重绘后再执行 expect() 断言',
        examSignalPhraseEn: '"Wait for asynchronous reactive DOM updates to complete in a Jest test before asserting -> await Promise.resolve()."',
      },
      {
        termEn: 'afterEach DOM Cleanup (document.body.removeChild)',
        meaningZh: '每个测试用例结束后清空 document.body，防止同一文件内多个 it() 用例互相污染 JSDOM',
        examSignalPhraseEn: '"Clean up the JSDOM document.body in afterEach() so tests remain isolated."',
      },
    ],
    coreConcepts: [
      {
        heading: '1. Four Steps of LWC Jest Unit Testing (LWC Jest 测试核心四步法)',
        content:
          '1. **Teardown (`afterEach`)**: Remove all children from `document.body` and call `jest.clearAllMocks()` so tests in the same file don\'t pollute each other\'s JSDOM.\n2. **Mount (`createElement`)**: Instantiate with `createElement(\'c-account-banner\', { is: AccountBanner })` and call `document.body.appendChild(element)`.\n3. **Trigger Event or Emit `@wire` Data**: Click an element or call `getAccountInfo.emit(mockJson)`.\n4. **Flush Microtasks (`await Promise.resolve()`)**: Wait for LWC\'s asynchronous rendering engine to update the Shadow DOM before asserting via `element.shadowRoot.querySelector(...)`.',
        language: 'javascript',
        codeSnippet: `import { createElement } from 'lwc';
import AccountBanner from 'c/accountBanner';
import getAccountInfo from '@salesforce/apex/AccountController.getAccountInfo';

jest.mock(
    '@salesforce/apex/AccountController.getAccountInfo',
    () => {
        const { createApexTestWireAdapter } = require('@salesforce/sfdx-lwc-jest');
        return { default: createApexTestWireAdapter(jest.fn()) };
    },
    { virtual: true }
);

describe('c-account-banner', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    it('renders account name when @wire emits data', async () => {
        const element = createElement('c-account-banner', { is: AccountBanner });
        document.body.appendChild(element);

        // Emit mock data into the @wire adapter
        getAccountInfo.emit({ Id: '001xx000003DGbY', Name: 'Acme Corp', Rating: 'Hot' });

        // Wait for the microtask queue to flush reactive DOM updates
        await Promise.resolve();

        const titleEl = element.shadowRoot.querySelector('.account-title');
        expect(titleEl.textContent).toBe('Acme Corp');
    });
});`,
      },
    ],
    codeComparison: {
      title: 'document.querySelector Without Microtask Flush (Fails) vs. element.shadowRoot + Promise.resolve()',
      antiPatternLabel: '❌ Anti-Pattern (反模式): Using document.querySelector and asserting synchronously',
      antiPatternCode: `it('updates label on click', () => {
    const element = createElement('c-counter', { is: Counter });
    document.body.appendChild(element);
    // ERROR 1: document.querySelector cannot pierce Shadow DOM (returns null)
    const btn = document.querySelector('button');
    btn.click();
    // ERROR 2: DOM re-render is asynchronous; textContent is still old value!
    expect(document.querySelector('.count').textContent).toBe('1');
});`,
      bestPracticeLabel: '✅ Best Practice (最佳实践): element.shadowRoot.querySelector + await Promise.resolve()',
      bestPracticeCode: `it('updates label on click', async () => {
    const element = createElement('c-counter', { is: Counter });
    document.body.appendChild(element);

    const btn = element.shadowRoot.querySelector('button');
    btn.click();

    await Promise.resolve(); // Flush microtask queue so LWC finishes re-rendering DOM
    const countEl = element.shadowRoot.querySelector('.count');
    expect(countEl.textContent).toBe('1');
});`,
      explanation:
        'LWC schedules DOM updates asynchronously on the JavaScript microtask queue. Always `await Promise.resolve()` after triggering state changes in Jest.',
    },
    examTraps: [
      'Exam Trap 1: Inside a component `.js` file, query DOM with `this.template.querySelector()`. Inside a `.test.js` Jest file, query DOM with `element.shadowRoot.querySelector()`.',
      'Exam Trap 2: Why did a Jest assertion fail immediately after `.click()` or `wireAdapter.emit()`? Because the test did not `await Promise.resolve()` before reading the DOM.',
    ],
    linkedChallengeId: 'C16',
    linkedQuestionIds: ['Q47', 'Q48'],
  },
];
