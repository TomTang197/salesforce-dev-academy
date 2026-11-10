import { ExamQuestion } from '../types';

export const QUESTIONS_PART_1: ExamQuestion[] = [
  // ==================== L01: Governor Limits & Data Model ====================
  {
    id: 'Q01',
    certLevel: 'PD1',
    stage: 'beginner',
    domain: 'Apex 核心与面向对象 (Apex & OOP)',
    examDomain: 'Process Automation & Logic (30%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'A developer writes the following Apex code and executes it in a synchronous transaction. What happens when this code runs?',
    scenario:
      '某开发者编写了如下 Apex 代码并在同步事务中执行。请问运行该代码时会出现什么结果？',
    codeBlock: `try {
    for (Integer i = 0; i < 150; i++) {
        List<Account> accs = [SELECT Id FROM Account LIMIT 1];
    }
} catch (Exception e) {
    System.debug('Caught exception: ' + e.getMessage());
}`,
    options: [
      {
        id: 'A',
        textEn: 'On the 101st iteration, a System.LimitException is thrown, caught by the catch block, and logged.',
        text: '在第 101 次循环时抛出 System.LimitException，被 catch 块捕获并打印日志，事务正常完成。',
        whyRightOrWrong: '❌ Incorrect (错误): System.LimitException CANNOT be caught by a try-catch block! (LimitException 是唯一无法被 try-catch 捕获的异常)',
      },
      {
        id: 'B',
        textEn: 'On the 101st iteration, an uncatchable System.LimitException is thrown and the entire transaction rolls back.',
        text: '在第 101 次循环时抛出不可捕获的 System.LimitException，整个事务立即终止并全部回滚。',
        whyRightOrWrong: '✅ Correct (正确): Synchronous SOQL limit is 100 queries. Breaching it throws an uncatchable System.LimitException and rolls back the transaction.',
      },
      {
        id: 'C',
        textEn: 'All 150 iterations succeed because LIMIT 1 keeps total rows below the 50,000-row governor limit.',
        text: '150 次循环全部成功执行，因为每次查询加了 LIMIT 1，总返回行数未超过 50,000 行。',
        whyRightOrWrong: '❌ Incorrect (错误): In addition to the 50,000-row limit, synchronous Apex enforces a strict limit of 100 SOQL queries per transaction.',
      },
      {
        id: 'D',
        textEn: 'The code fails to compile because the Apex compiler prohibits SOQL statements inside for loops.',
        text: '代码无法通过编译，因为 Apex 编译器禁止在 for 循环内编写 SOQL。',
        whyRightOrWrong: '❌ Incorrect (错误): The code compiles without error, but fails at runtime when the governor limit is exceeded.',
      },
    ],
    correctOptionIds: ['B'],
    coreTakeaway: 'Synchronous SOQL limit is 100 (Async is 200), and System.LimitException can NEVER be caught by a try-catch block (同步 SOQL 上限 100 次，LimitException 不可捕获)。',
    officialDocTopic: 'Execution Governors and Limits',
  },
  {
    id: 'Q02',
    certLevel: 'PD1',
    stage: 'beginner',
    domain: 'Apex 核心与面向对象 (Apex & OOP)',
    examDomain: 'Data Management & SOQL (25%)',
    questionType: 'multiple',
    selectCount: 2,
    scenarioEn:
      'An architect at Universal Containers is deciding whether to define the relationship between Invoice_Line__c and Invoice__c as a Master-Detail relationship instead of a Lookup relationship. Which two native platform capabilities are gained by choosing Master-Detail? (Choose 2 answers)',
    scenario:
      '架构师正在评估将 Invoice_Line__c 与 Invoice__c 之间的关联关系定义为 Master-Detail（主详关系）而非 Lookup（查找关系）。选择 Master-Detail 会获得哪两项原生平台能力？（请选择 2 项）',
    options: [
      {
        id: 'A',
        textEn: 'Roll-Up Summary fields can be created natively on Invoice__c to aggregate Invoice_Line__c values.',
        text: '可以在主对象 Invoice__c 上直接创建原生 Roll-Up Summary（汇总统计）字段计算子记录金额。',
        whyRightOrWrong: '✅ Correct (正确): Native Roll-Up Summary fields are only available on the Master object of a Master-Detail relationship.',
      },
      {
        id: 'B',
        textEn: 'Invoice_Line__c records have their own independent OwnerId field and OWD sharing settings.',
        text: '子对象 Invoice_Line__c 拥有独立的 OwnerId 字段和独立的 OWD 共享规则。',
        whyRightOrWrong: '❌ Incorrect (错误): Detail records in a Master-Detail relationship do NOT have an OwnerId field; they inherit sharing and security from the Master record.',
      },
      {
        id: 'C',
        textEn: 'Deleting an Invoice__c record automatically cascade-deletes all related Invoice_Line__c child records.',
        text: '当删除父记录 Invoice__c 时，其下属的所有 Invoice_Line__c 子记录会被自动级联删除（Cascade Delete）。',
        whyRightOrWrong: '✅ Correct (正确): Master-Detail relationships enforce cascade deletion and require the parent field on all child records.',
      },
      {
        id: 'D',
        textEn: 'Up to 5 Master-Detail relationships can be created on a single custom object.',
        text: '每个自定义对象最多可以创建 5 个 Master-Detail 关系字段。',
        whyRightOrWrong: '❌ Incorrect (错误): A custom object can have at most 2 Master-Detail relationships.',
      },
    ],
    correctOptionIds: ['A', 'C'],
    coreTakeaway: 'Master-Detail three pillars: 1) Native Roll-Up Summary fields; 2) Cascade Delete; 3) Child has no OwnerId and inherits security/sharing from Parent.',
    officialDocTopic: 'Object Relationships Overview',
  },
  {
    id: 'Q03',
    certLevel: 'PD1',
    stage: 'beginner',
    domain: 'Apex 核心与面向对象 (Apex & OOP)',
    examDomain: 'Process Automation & Logic (30%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'A developer needs to programmatically check how many DML statements remain available in the current transaction before offloading work to a Queueable job. Which expression returns the remaining DML statements?',
    scenario:
      '开发者需要在运行时动态检查当前事务还剩多少次 DML 语句配额可用，以便在接近上限时转为异步 Queueable 处理。应该使用哪个表达式？',
    options: [
      {
        id: 'A',
        textEn: 'Limits.getLimitDmlStatements() - Limits.getDmlStatements()',
        text: 'Limits.getLimitDmlStatements() - Limits.getDmlStatements()',
        whyRightOrWrong: '✅ Correct (正确): getLimitDmlStatements() returns the maximum limit (150) and getDmlStatements() returns the count used so far.',
      },
      {
        id: 'B',
        textEn: 'Limits.getRemainingDmlStatements()',
        text: 'Limits.getRemainingDmlStatements()',
        whyRightOrWrong: '❌ Incorrect (错误): The Limits class does not have a getRemainingDmlStatements() method.',
      },
      {
        id: 'C',
        textEn: 'Limits.getLimitDmlRows() - Limits.getDmlRows()',
        text: 'Limits.getLimitDmlRows() - Limits.getDmlRows()',
        whyRightOrWrong: '❌ Incorrect (错误): DmlRows tracks the number of records processed by DML (10,000 limit), not the number of DML statements issued (150 limit).',
      },
      {
        id: 'D',
        textEn: 'System.getDmlLimit() - System.getDmlUsed()',
        text: 'System.getDmlLimit() - System.getDmlUsed()',
        whyRightOrWrong: '❌ Incorrect (错误): These methods do not exist on the System class.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'Limits.getXxx() returns usage so far; Limits.getLimitXxx() returns the governor limit ceiling for the current context.',
    officialDocTopic: 'Limits Class Methods',
  },

  // ==================== L02: Collections & Sharing ====================
  {
    id: 'Q04',
    certLevel: 'PD1',
    stage: 'beginner',
    domain: 'Apex 核心与面向对象 (Apex & OOP)',
    examDomain: 'Process Automation & Logic (30%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'A developer wants to populate a Map where the key is the Account record Id and the value is the Account sObject, without writing a for loop. Which code snippet accomplishes this?',
    scenario:
      '开发者想要在不编写 for 循环的前提下，将一个 Account 的 SOQL 查询结果直接构造为以 Account.Id 为 Key、Account 记录为 Value 的 Map。哪行代码是正确的？',
    options: [
      {
        id: 'A',
        textEn: 'Map<Id, Account> accMap = [SELECT Id, Name FROM Account LIMIT 50];',
        text: 'Map<Id, Account> accMap = [SELECT Id, Name FROM Account LIMIT 50];',
        whyRightOrWrong: '❌ Incorrect (错误): A SOQL query returns List<Account>, which cannot be directly assigned to a Map variable.',
      },
      {
        id: 'B',
        textEn: 'Map<Id, Account> accMap = new Map<Id, Account>([SELECT Id, Name FROM Account LIMIT 50]);',
        text: 'Map<Id, Account> accMap = new Map<Id, Account>([SELECT Id, Name FROM Account LIMIT 50]);',
        whyRightOrWrong: '✅ Correct (正确): The Map<Id, sObject> constructor natively accepts a List<sObject> (or inline SOQL query) and indexes records by their Id.',
      },
      {
        id: 'C',
        textEn: 'Map<Id, Account> accMap = Map.fromList([SELECT Id, Name FROM Account LIMIT 50]);',
        text: 'Map<Id, Account> accMap = Map.fromList([SELECT Id, Name FROM Account LIMIT 50]);',
        whyRightOrWrong: '❌ Incorrect (错误): Map.fromList() does not exist in Apex.',
      },
      {
        id: 'D',
        textEn: 'Map<Account, Id> accMap = new Map<Account, Id>([SELECT Id, Name FROM Account LIMIT 50]);',
        text: 'Map<Account, Id> accMap = new Map<Account, Id>([SELECT Id, Name FROM Account LIMIT 50]);',
        whyRightOrWrong: '❌ Incorrect (错误): The auto-indexing sObject list constructor requires Id (or String) as the key type and sObject as the value type.',
      },
    ],
    correctOptionIds: ['B'],
    coreTakeaway: 'new Map<Id, sObject>([SELECT Id, ... FROM sObject]) is the idiomatic O(1) way to build an ID-keyed dictionary in Apex.',
    officialDocTopic: 'Map Class Constructors',
  },
  {
    id: 'Q05',
    certLevel: 'PD1',
    stage: 'beginner',
    domain: '安全模型与单元测试 (Security & Testing)',
    examDomain: 'Process Automation & Logic (30%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'An outer class is declared as `public with sharing class OuterClass`, and it contains an inner class declared as `public class InnerClass` (with no explicit sharing keyword). Under which sharing context do methods inside `InnerClass` execute?',
    scenario:
      '某外部类声明为 `public with sharing class OuterClass`，其内部定义了一个未加任何 sharing 修饰符的内部类 `public class InnerClass`。请问 `InnerClass` 中的方法以什么共享模式运行？',
    options: [
      {
        id: 'A',
        textEn: 'InnerClass automatically inherits the `with sharing` setting from OuterClass.',
        text: '自动继承外部类 OuterClass 的 with sharing 设置。',
        whyRightOrWrong: '❌ Incorrect (错误): Inner classes NEVER inherit the sharing setting from their container class!',
      },
      {
        id: 'B',
        textEn: 'InnerClass executes in `without sharing` (system context) mode by default unless explicitly declared otherwise.',
        text: '默认运行在 without sharing（系统上下文）模式下，因为内部类绝不继承外部类的 sharing 声明。',
        whyRightOrWrong: '✅ Correct (正确): Inner classes do not inherit the sharing setting from their container class; omitting the keyword defaults to without sharing.',
      },
      {
        id: 'C',
        textEn: 'The code fails to compile unless InnerClass declares a matching sharing keyword.',
        text: '编译报错，因为内部类必须与外部类的 sharing 关键字完全一致。',
        whyRightOrWrong: '❌ Incorrect (错误): It compiles cleanly, which makes it a classic exam trap and security pitfall.',
      },
      {
        id: 'D',
        textEn: 'A System.SecurityException is thrown at runtime.',
        text: '在运行时抛出 System.SecurityException。',
        whyRightOrWrong: '❌ Incorrect (错误): No exception is thrown.',
      },
    ],
    correctOptionIds: ['B'],
    coreTakeaway: 'Exam Golden Rule: Inner classes DO NOT inherit the sharing setting from their container class! Always declare `inherited sharing` or `with sharing` on inner classes.',
    officialDocTopic: 'Using the with sharing, without sharing, and inherited sharing Keywords',
  },
  {
    id: 'Q06',
    certLevel: 'PD1',
    stage: 'beginner',
    domain: '安全模型与单元测试 (Security & Testing)',
    examDomain: 'Process Automation & Logic (30%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'A developer is writing a utility class that will be called both by a background Batch Apex job (`without sharing`) and directly by an LWC component via `@AuraEnabled`. To pass AppExchange Security Review and enforce sharing rules when called from LWC while respecting the caller\'s context when called from Batch Apex, which declaration should be used?',
    scenario:
      '开发者正在编写一个既会被后台 Batch 任务（without sharing）调用，又会被前端 LWC 组件作为 @AuraEnabled 顶层入口直接调用的通用类。为了在 LWC 顶层调用时强制执行用户共享规则，同时被后台任务调用时继承调用方上下文，应使用什么声明？',
    options: [
      {
        id: 'A',
        textEn: 'public inherited sharing class UtilityService',
        text: 'public inherited sharing class UtilityService',
        whyRightOrWrong: '✅ Correct (正确): `inherited sharing` inherits the caller\'s sharing mode and safely defaults to `with sharing` when used as a top-level entry point.',
      },
      {
        id: 'B',
        textEn: 'public without sharing class UtilityService',
        text: 'public without sharing class UtilityService',
        whyRightOrWrong: '❌ Incorrect (错误): This bypasses record sharing even when called from LWC by a restricted user.',
      },
      {
        id: 'C',
        textEn: 'public class UtilityService (omitting the sharing keyword)',
        text: 'public class UtilityService（省略关键字）',
        whyRightOrWrong: '❌ Incorrect (错误): Omitting the keyword defaults to `without sharing` when invoked as a top-level entry point.',
      },
      {
        id: 'D',
        textEn: 'public dynamic sharing class UtilityService',
        text: 'public dynamic sharing class UtilityService',
        whyRightOrWrong: '❌ Incorrect (错误): `dynamic sharing` is not a valid Apex keyword.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: '`inherited sharing` is the modern default for service classes and LWC controllers.',
    officialDocTopic: 'Inherited Sharing',
  },

  // ==================== L03: SOQL & SOSL Fundamentals ====================
  {
    id: 'Q07',
    certLevel: 'PD1',
    stage: 'beginner',
    domain: 'SOQL & SOSL 数据查询 (Data Query)',
    examDomain: 'Data Management & SOQL (25%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'A support agent types "Acme" into a custom search bar, and the application must search across Account, Contact, Lead, and Partner__c text/email/phone fields simultaneously. Which query language and return type should the developer use?',
    scenario:
      '客服人员在自定义搜索框中输入关键字 "Acme"，系统需要同时跨 Account、Contact、Lead 和 Partner__c 的文本、邮箱和电话字段快速检索匹配记录。应该使用什么查询方式及返回类型？',
    options: [
      {
        id: 'A',
        textEn: 'A single multi-object SOQL query returning List<sObject>',
        text: '使用单条多表 SOQL 查询，返回 List<sObject>',
        whyRightOrWrong: '❌ Incorrect (错误): SOQL cannot query multiple unrelated objects in a single statement.',
      },
      {
        id: 'B',
        textEn: 'A SOSL query (`FIND \'Acme*\' IN ALL FIELDS RETURNING ...`) returning List<List<sObject>>',
        text: '使用 SOSL 查询 (FIND \'Acme*\' IN ALL FIELDS RETURNING ...)，返回 List<List<sObject>>',
        whyRightOrWrong: '✅ Correct (正确): SOSL searches across multiple unrelated objects at once and always returns `List<List<sObject>>`.',
      },
      {
        id: 'C',
        textEn: 'A SOSL query returning Map<String, List<sObject>>',
        text: '使用 SOSL 查询，返回 Map<String, List<sObject>>',
        whyRightOrWrong: '❌ Incorrect (错误): SOSL returns a 2D list `List<List<sObject>>`, not a Map.',
      },
      {
        id: 'D',
        textEn: 'An AggregateResult query returning List<AggregateResult>',
        text: '使用 AggregateResult 聚合查询，返回 List<AggregateResult>',
        whyRightOrWrong: '❌ Incorrect (错误): AggregateResult is used for GROUP BY summary calculations.',
      },
    ],
    correctOptionIds: ['B'],
    coreTakeaway: 'Use SOSL (`List<List<sObject>>`) for full-text keyword searches across multiple unrelated objects; use SOQL (`List<sObject>`) for structured single/related object queries.',
    officialDocTopic: 'SOQL and SOSL Reference',
  },
  {
    id: 'Q08',
    certLevel: 'PD1',
    stage: 'beginner',
    domain: 'SOQL & SOSL 数据查询 (Data Query)',
    examDomain: 'Data Management & SOQL (25%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'A custom object `Job_Application__c` has a custom Lookup field `Candidate__c` pointing to `Candidate__c` (Child Relationship Name: `Job_Applications`). What is the correct SOQL syntax for (1) a Parent-to-Child subquery from `Candidate__c` and (2) a Child-to-Parent field traversal from `Job_Application__c`?',
    scenario:
      '自定义对象 `Job_Application__c` 上有一个指向 `Candidate__c` 的自定义查找字段 `Candidate__c`（子关系名称为 `Job_Applications`）。请问：(1) 从父对象向下查子记录的子查询语法，以及 (2) 从子对象向上查父对象 `Email__c` 的语法分别是什么？',
    options: [
      {
        id: 'A',
        textEn: 'Parent-to-Child: `(SELECT Id FROM Job_Applications__r)` | Child-to-Parent: `Candidate__r.Email__c`',
        text: '父查子：(SELECT Id FROM Job_Applications__r) | 子查父：Candidate__r.Email__c',
        whyRightOrWrong: '✅ Correct (正确): Both custom Child Relationship subqueries and custom Parent relationship traversals use the `__r` suffix!',
      },
      {
        id: 'B',
        textEn: 'Parent-to-Child: `(SELECT Id FROM Job_Applications__c)` | Child-to-Parent: `Candidate__c.Email__c`',
        text: '父查子：(SELECT Id FROM Job_Applications__c) | 子查父：Candidate__c.Email__c',
        whyRightOrWrong: '❌ Incorrect (错误): `__c` refers to the foreign key Id field itself; traversing the relationship requires `__r`.',
      },
      {
        id: 'C',
        textEn: 'Parent-to-Child: `(SELECT Id FROM Job_Application__r)` | Child-to-Parent: `Candidate.Email__c`',
        text: '父查子：(SELECT Id FROM Job_Application__r) | 子查父：Candidate.Email__c',
        whyRightOrWrong: '❌ Incorrect (错误): Custom relationships must end in `__r`, and the subquery uses the plural Child Relationship Name `Job_Applications__r`.',
      },
      {
        id: 'D',
        textEn: 'Parent-to-Child: `(SELECT Id FROM Job_Applications)` | Child-to-Parent: `Candidate__r.Email__c`',
        text: '父查子：(SELECT Id FROM Job_Applications) | 子查父：Candidate__r.Email__c',
        whyRightOrWrong: '❌ Incorrect (错误): Only standard child relationships (like `Contacts`) omit `__r`.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'Custom relationship rule: reading the raw 18-char foreign key uses `__c`; traversing across objects (dot-notation or child subquery FROM) ALWAYS uses `__r`!',
    officialDocTopic: 'Understanding Relationship Names, Custom Objects, and Custom Fields',
  },
  {
    id: 'Q09',
    certLevel: 'PD1',
    stage: 'beginner',
    domain: 'SOQL & SOSL 数据查询 (Data Query)',
    examDomain: 'Testing, Debugging & Deployment (20%)',
    questionType: 'multiple',
    selectCount: 2,
    scenarioEn:
      'A developer is building a search feature that takes a user-supplied string `searchTerm` and queries `Account` records. Which two techniques prevent SOQL Injection vulnerabilities? (Choose 2 answers)',
    scenario:
      '开发者正在构建一个接收用户输入字符串 `searchTerm` 并查询 `Account` 的搜索功能。以下哪两种方法可以有效防止 SOQL 注入（SOQL Injection）漏洞？（请选择 2 项）',
    options: [
      {
        id: 'A',
        textEn: 'Use a static SOQL query with a `:searchTerm` bind variable (or `Database.queryWithBinds()`).',
        text: '使用带 `:searchTerm` 绑定变量的静态 SOQL 查询（或使用 `Database.queryWithBinds()`）。',
        whyRightOrWrong: '✅ Correct (正确): Bind variables treat user input strictly as literal values, preventing syntax tree manipulation.',
      },
      {
        id: 'B',
        textEn: 'Sanitize the user input using `String.escapeSingleQuotes(searchTerm)` before concatenating it into a dynamic query.',
        text: '在拼接到动态查询字符串前，调用 `String.escapeSingleQuotes(searchTerm)` 转义单引号。',
        whyRightOrWrong: '✅ Correct (正确): `String.escapeSingleQuotes()` escapes any `\'` characters with `\\\'` so an attacker cannot break out of the string literal.',
      },
      {
        id: 'C',
        textEn: 'Declare the Apex controller class as `public with sharing`.',
        text: '将 Apex 控制器类声明为 `public with sharing`。',
        whyRightOrWrong: '❌ Incorrect (错误): `with sharing` restricts row visibility but does not prevent malicious `OR Name != \'\'` SQL/SOQL injection clauses.',
      },
      {
        id: 'D',
        textEn: 'Use `String.stripHtmlTags(searchTerm)` before executing `Database.query()`.',
        text: '在执行 `Database.query()` 前调用 `String.stripHtmlTags(searchTerm)`。',
        whyRightOrWrong: '❌ Incorrect (错误): Stripping HTML tags addresses XSS, not single-quote SOQL injection.',
      },
    ],
    correctOptionIds: ['A', 'B'],
    coreTakeaway: 'Two defenses against SOQL Injection: 1) `:bindVariable` / `Database.queryWithBinds()`; 2) `String.escapeSingleQuotes()`.',
    officialDocTopic: 'SOQL Injection Security',
  },

  // ==================== L04: LWC Templates & Meta XML ====================
  {
    id: 'Q10',
    certLevel: 'PD1',
    stage: 'beginner',
    domain: 'LWC 现代前端组件 (Lightning Web Components)',
    examDomain: 'User Interface / LWC (25%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'A developer creates a custom LWC component named `salesKpiChart`. How should it be referenced in a parent component\'s HTML template, and which directive should be used if the developer needs to render a special banner only on the first and last items of a list?',
    scenario:
      '开发者创建了一个名为 `salesKpiChart` 的 LWC 组件。请问在父组件 HTML 模板中应如何引用它？以及如果需要在列表的第一项和最后一项渲染特殊横幅，应选用哪个模板指令？',
    options: [
      {
        id: 'A',
        textEn: 'Tag: `<c-sales-kpi-chart></c-sales-kpi-chart>` | Directive: `iterator:it={records}` (using `it.first` and `it.last`)',
        text: '标签：<c-sales-kpi-chart></c-sales-kpi-chart> | 指令：iterator:it={records}（使用 it.first 和 it.last）',
        whyRightOrWrong: '✅ Correct (正确): CamelCase `salesKpiChart` maps to kebab-case `<c-sales-kpi-chart>`, and `iterator:it` provides `.first` and `.last` properties.',
      },
      {
        id: 'B',
        textEn: 'Tag: `<c:salesKpiChart></c:salesKpiChart>` | Directive: `for:each={records}`',
        text: '标签：<c:salesKpiChart></c:salesKpiChart> | 指令：for:each={records}',
        whyRightOrWrong: '❌ Incorrect (错误): `<c:xxx>` is Aura syntax, and `for:each` does not expose `.first` or `.last`.',
      },
      {
        id: 'C',
        textEn: 'Tag: `<c-saleskpichart></c-saleskpichart>` | Directive: `lwc:repeat={records}`',
        text: '标签：<c-saleskpichart></c-saleskpichart> | 指令：lwc:repeat={records}',
        whyRightOrWrong: '❌ Incorrect (错误): Uppercase letters must be separated by hyphens, and `lwc:repeat` does not exist.',
      },
      {
        id: 'D',
        textEn: 'Tag: `<lightning-sales-kpi-chart>` | Directive: `iterator:it={records}`',
        text: '标签：<lightning-sales-kpi-chart> | 指令：iterator:it={records}',
        whyRightOrWrong: '❌ Incorrect (错误): Custom components use the `c-` namespace prefix, not `lightning-`.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'LWC camelCase names become `<c-kebab-case>` tags; use `iterator:it` whenever you need `it.first` or `it.last`.',
    officialDocTopic: 'HTML Template Directives',
  },
  {
    id: 'Q11',
    certLevel: 'PD1',
    stage: 'beginner',
    domain: 'LWC 现代前端组件 (Lightning Web Components)',
    examDomain: 'User Interface / LWC (25%)',
    questionType: 'multiple',
    selectCount: 2,
    scenarioEn:
      'A developer deploys a new LWC component to a Sandbox, but the system administrator cannot find the component in Lightning App Builder when editing an Account Record Page. Which two configuration issues in the `.js-meta.xml` file could cause this? (Choose 2 answers)',
    scenario:
      '开发者将一个新 LWC 组件部署到了 Sandbox，但系统管理员在编辑 Account 记录详情页（Lightning Record Page）时找不到该组件。`.js-meta.xml` 中的哪两项配置缺失会导致该问题？（请选择 2 项）',
    options: [
      {
        id: 'A',
        textEn: 'The `<isExposed>` tag is set to `false`.',
        text: '`<isExposed>` 标签的值仍为默认的 `false`。',
        whyRightOrWrong: '✅ Correct (正确): `<isExposed>true</isExposed>` is required for a component to appear in Lightning App Builder or Experience Builder.',
      },
      {
        id: 'B',
        textEn: 'The `<targets>` section does not include `<target>lightning__RecordPage</target>`.',
        text: '`<targets>` 节点下未包含 `<target>lightning__RecordPage</target>`。',
        whyRightOrWrong: '✅ Correct (正确): Without `lightning__RecordPage` in `<targets>`, the component cannot be placed on record pages.',
      },
      {
        id: 'C',
        textEn: 'The JavaScript class is not declared with the `global` access modifier.',
        text: 'JavaScript 控制器类没有声明为 `global` 访问级别。',
        whyRightOrWrong: '❌ Incorrect (错误): LWC uses standard ES module `export default class`.',
      },
      {
        id: 'D',
        textEn: 'The component bundle is missing a `.css` file.',
        text: '组件包缺少同名的 `.css` 样式文件。',
        whyRightOrWrong: '❌ Incorrect (错误): The `.css` file is completely optional in an LWC bundle.',
      },
    ],
    correctOptionIds: ['A', 'B'],
    coreTakeaway: 'To expose an LWC in App Builder: `<isExposed>true</isExposed>` + `<target>lightning__RecordPage</target>` (or AppPage / HomePage).',
    officialDocTopic: 'Configure a Component for Lightning App Builder',
  },
  {
    id: 'Q12',
    certLevel: 'PD1',
    stage: 'beginner',
    domain: 'LWC 现代前端组件 (Lightning Web Components)',
    examDomain: 'User Interface / LWC (25%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'A developer wants to conditionally display a "Free Shipping" badge in an LWC template when `orderTotal > 1000`, and writes `<template lwc:if={orderTotal > 1000}>`. Deployment fails with a template compilation error. How should this be fixed?',
    scenario:
      '开发者希望在 LWC 模板中当 `orderTotal > 1000` 时显示免运费徽章，写了 `<template lwc:if={orderTotal > 1000}>`，部署时编译报错。应如何修复？',
    options: [
      {
        id: 'A',
        textEn: 'Add double quotes around the expression: `<template lwc:if="{orderTotal > 1000}">`.',
        text: '在表达式外加上双引号：`<template lwc:if="{orderTotal > 1000}">`。',
        whyRightOrWrong: '❌ Incorrect (错误): LWC template bindings never use quotes and prohibit inline expressions.',
      },
      {
        id: 'B',
        textEn: 'Define a getter `get isFreeShipping() { return this.orderTotal > 1000; }` in the `.js` file and bind `<template lwc:if={isFreeShipping}>`.',
        text: '在 `.js` 类中定义 `get isFreeShipping() { return this.orderTotal > 1000; }`，并在模板中写 `<template lwc:if={isFreeShipping}>`。',
        whyRightOrWrong: '✅ Correct (正确): LWC templates do not allow inline comparison or arithmetic operators; compute values in a JS getter.',
      },
      {
        id: 'C',
        textEn: 'Switch to the legacy directive `<template if:true={orderTotal > 1000}>`.',
        text: '改用旧版指令 `<template if:true={orderTotal > 1000}>`。',
        whyRightOrWrong: '❌ Incorrect (错误): Neither `lwc:if` nor `if:true` allows expressions inside `{}`.',
      },
      {
        id: 'D',
        textEn: 'Use `@track` on `orderTotal`.',
        text: '在 `orderTotal` 上添加 `@track` 装饰器。',
        whyRightOrWrong: '❌ Incorrect (错误): `@track` does not enable inline template expressions.',
      },
    ],
    correctOptionIds: ['B'],
    coreTakeaway: 'No expressions (`>`, `===`, `&&`, `+`) are allowed inside `{}` in LWC HTML templates—always use a JavaScript `get` property.',
    officialDocTopic: 'Use Getters to Compute a Value',
  },

  // ==================== L05: Triggers & Order of Execution ====================
  {
    id: 'Q13',
    certLevel: 'PD1',
    stage: 'intermediate',
    domain: 'Trigger 与执行顺序 (Triggers & Order of Execution)',
    examDomain: 'Process Automation & Logic (30%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'The `Lead` object has a custom Validation Rule that requires `LeadSource` to not be blank. There is also a `before insert` Apex Trigger on `Lead` that sets `LeadSource = \'Web\'` if `LeadSource` is null. What happens when a user saves a new `Lead` record with a blank `LeadSource` field in the UI?',
    scenario:
      '`Lead` 对象上有一条自定义 Validation Rule 要求 `LeadSource` 不能为空；同时存在一个 `before insert` Trigger，当 `LeadSource` 为空时将其赋值为 `"Web"`。用户在界面上新建一条 `LeadSource` 为空的 Lead 并点击保存，会发生什么？',
    options: [
      {
        id: 'A',
        textEn: 'The save fails because Custom Validation Rules execute before `before insert` triggers.',
        text: '保存失败，因为自定义 Validation Rule 先于 Before Trigger 执行。',
        whyRightOrWrong: '❌ Incorrect (错误): Custom Validation Rules (Step 5) execute AFTER `before` triggers (Step 4)!',
      },
      {
        id: 'B',
        textEn: 'The Lead record is saved successfully with `LeadSource = \'Web\'` because `before` triggers run before Custom Validation Rules.',
        text: '保存成功且 `LeadSource` 为 "Web"，因为 Before Trigger 在自定义 Validation Rule 之前执行。',
        whyRightOrWrong: '✅ Correct (正确): In the Save Order of Execution, Before-Save Flows (Step 3) and Before Triggers (Step 4) run BEFORE Custom Validation Rules (Step 5).',
      },
      {
        id: 'C',
        textEn: 'The record saves, but `LeadSource` remains blank because no `update` DML statement was called in the trigger.',
        text: '保存成功但 `LeadSource` 仍为空，因为 Before Trigger 中没有调用 update 语句。',
        whyRightOrWrong: '❌ Incorrect (错误): Field assignments on `Trigger.new` in a `before` trigger are saved automatically without DML.',
      },
      {
        id: 'D',
        textEn: 'A `System.FinalException` is thrown.',
        text: '抛出 `System.FinalException` 异常。',
        whyRightOrWrong: '❌ Incorrect (错误): `Trigger.new` is writable in `before` triggers.',
      },
    ],
    correctOptionIds: ['B'],
    coreTakeaway: 'Order of Execution: System Validation (Step 2) → Before-Save Flows (Step 3) → Before Triggers (Step 4) → Custom Validation Rules (Step 5) → Save to DB (Step 7) → After Triggers (Step 8).',
    officialDocTopic: 'Triggers and Order of Execution',
  },
  {
    id: 'Q14',
    certLevel: 'PD1',
    stage: 'intermediate',
    domain: 'Trigger 与执行顺序 (Triggers & Order of Execution)',
    examDomain: 'Process Automation & Logic (30%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'Inside a `before insert` trigger, a developer writes `Set<Id> ids = Trigger.newMap.keySet();` and encounters a `System.NullPointerException` at runtime. Why did this occur?',
    scenario:
      '在 `before insert` 触发器中，开发者编写了 `Set<Id> ids = Trigger.newMap.keySet();`，运行时抛出 `System.NullPointerException`。原因是什么？',
    options: [
      {
        id: 'A',
        textEn: 'In `before insert`, records have not been saved to the database yet and have no `Id`, so `Trigger.newMap` is `null`.',
        text: '在 `before insert` 阶段记录尚未写入数据库，还没有生成 `Id`，因此 `Trigger.newMap` 为 `null`。',
        whyRightOrWrong: '✅ Correct (正确): Record IDs are generated in Step 7 (after `before` triggers finish), so `Trigger.newMap` is always `null` in `before insert`.',
      },
      {
        id: 'B',
        textEn: 'The developer should have used `Trigger.oldMap.keySet()` instead.',
        text: '应该改用 `Trigger.oldMap.keySet()`。',
        whyRightOrWrong: '❌ Incorrect (错误): `Trigger.old` and `Trigger.oldMap` are always `null` in all `insert` triggers.',
      },
      {
        id: 'C',
        textEn: '`Trigger.newMap` is only available in `after update` triggers.',
        text: '`Trigger.newMap` 只能在 `after update` 中使用。',
        whyRightOrWrong: '❌ Incorrect (错误): `Trigger.newMap` is available in `after insert`, `before update`, `after update`, and `after undelete`.',
      },
      {
        id: 'D',
        textEn: '`Trigger.newMap` requires `with sharing` on the trigger.',
        text: '`Trigger.newMap` 需要触发器声明 `with sharing`。',
        whyRightOrWrong: '❌ Incorrect (错误): Triggers do not use sharing keywords.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'In `before insert`, ONLY `Trigger.new` is populated (`Trigger.newMap`, `Trigger.old`, and `Trigger.oldMap` are all `null`).',
    officialDocTopic: 'Trigger Context Variables',
  },
  {
    id: 'Q15',
    certLevel: 'PD1',
    stage: 'intermediate',
    domain: 'Trigger 与执行顺序 (Triggers & Order of Execution)',
    examDomain: 'Process Automation & Logic (30%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'When a child `Opportunity_Item__c` record is inserted in a Master-Detail relationship and causes a Roll-Up Summary field on the parent `Opportunity` to recalculate, what happens on the parent `Opportunity` object?',
    scenario:
      '当主详关系下的子记录 `Opportunity_Item__c` 插入并导致父对象 `Opportunity` 上的 Roll-Up Summary 汇总字段重算时，父对象 `Opportunity` 会发生什么？',
    options: [
      {
        id: 'A',
        textEn: 'The parent Opportunity field updates silently at the database layer without firing any Opportunity triggers.',
        text: '父对象字段在数据库底层静默更新，不会触发父对象的任何 Trigger。',
        whyRightOrWrong: '❌ Incorrect (错误): Roll-Up Summary recalculation triggers the full save cycle on the parent record!',
      },
      {
        id: 'B',
        textEn: 'The parent Opportunity goes through its full Save Order of Execution (firing `before update` and `after update` triggers on Opportunity within the same transaction).',
        text: '父对象 Opportunity 会在同一事务内完整经历一遍 Update 保存执行顺序（触发父对象的 Before/After Update Trigger 与校验规则）。',
        whyRightOrWrong: '✅ Correct (正确): Step 15 of the Order of Execution states that when a Roll-Up Summary field updates on the master record, the master record goes through its entire save procedure.',
      },
      {
        id: 'C',
        textEn: 'Parent triggers fire in a separate asynchronous transaction.',
        text: '父对象的 Trigger 会在另一个独立的异步事务中触发。',
        whyRightOrWrong: '❌ Incorrect (错误): Parent save execution happens synchronously in the same transaction and shares the same Governor Limits.',
      },
      {
        id: 'D',
        textEn: 'Only parent Validation Rules run; parent Apex Triggers are skipped.',
        text: '只运行父对象的校验规则，跳过父对象的 Apex Trigger。',
        whyRightOrWrong: '❌ Incorrect (错误): Both parent triggers and validation rules execute.',
      },
    ],
    correctOptionIds: ['B'],
    coreTakeaway: 'When a child DML recalculates a parent Roll-Up Summary field, the parent record executes its full Update save lifecycle in the same transaction.',
    officialDocTopic: 'Triggers and Order of Execution',
  },
  {
    id: 'Q16',
    certLevel: 'PD1',
    stage: 'intermediate',
    domain: 'Trigger 与执行顺序 (Triggers & Order of Execution)',
    examDomain: 'Process Automation & Logic (30%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'When a new `Account` with `Industry == \'Banking\'` is inserted, the business requires: (1) setting `Account.Description = \'VIP Banking Client\'` on the Account itself, and (2) inserting a default related `Contact` record linked to the new Account\'s `Id`. What is the recommended trigger design?',
    scenario:
      '当插入 `Industry == \'Banking\'` 的新 `Account` 时，业务要求：(1) 将该 Account 自身的 `Description` 设为 `"VIP Banking Client"`；(2) 自动创建一条关联到该新 Account `Id` 的默认 `Contact`。最推荐的 Trigger 设计是什么？',
    options: [
      {
        id: 'A',
        textEn: 'Perform both operations in `after insert`: set `acc.Description` and `insert newContact`.',
        text: '全部在 `after insert` 中完成：直接修改 `acc.Description` 并 `insert newContact`。',
        whyRightOrWrong: '❌ Incorrect (错误): Modifying `acc.Description` in `after insert` throws `System.FinalException: Record is read-only`.',
      },
      {
        id: 'B',
        textEn: 'Set `acc.Description` in `before insert` (no DML required) and insert the related `Contact` using `acc.Id` in `after insert`.',
        text: '在 `before insert` 中赋值 `acc.Description`（免 DML），在 `after insert` 中读取新生成的 `acc.Id` 插入关联 `Contact`。',
        whyRightOrWrong: '✅ Correct (正确): Same-record field updates belong in `before insert`; creating related records that require the new `acc.Id` belongs in `after insert`.',
      },
      {
        id: 'C',
        textEn: 'Perform both operations in `before insert`.',
        text: '全部在 `before insert` 中完成。',
        whyRightOrWrong: '❌ Incorrect (错误): `acc.Id` is `null` in `before insert`, so `Contact.AccountId` cannot be linked.',
      },
      {
        id: 'D',
        textEn: 'Use a `before undelete` trigger.',
        text: '使用 `before undelete` 触发器。',
        whyRightOrWrong: '❌ Incorrect (错误): `before undelete` does not exist.',
      },
    ],
    correctOptionIds: ['B'],
    coreTakeaway: 'Modify the same record in `before` triggers (zero DML); read `record.Id` and insert/update related objects in `after` triggers.',
    officialDocTopic: 'Trigger Best Practices',
  },

  // ==================== L06: Trigger Handler & Chunking ====================
  {
    id: 'Q17',
    certLevel: 'PD1',
    stage: 'intermediate',
    domain: 'Trigger 与执行顺序 (Triggers & Order of Execution)',
    examDomain: 'Process Automation & Logic (30%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'An external integration inserts **500 `Opportunity` records** in a single API call. The `Opportunity` object has a `before insert` trigger that executes **3 SOQL queries** per invocation. How many times does the trigger execute, and how many total SOQL queries are consumed in this transaction?',
    scenario:
      '外部集成在单次 API 调用中一次性插入了 **500 条** `Opportunity` 记录。`Opportunity` 上的 `before insert` 触发器每次调用会执行 **3 次 SOQL 查询**。请问该触发器会被调用几次？该事务总共消耗多少次 SOQL？',
    options: [
      {
        id: 'A',
        textEn: '1 trigger execution (500 records at once), consuming 3 SOQL queries.',
        text: '调用 1 次触发器（一次传入 500 条），共消耗 3 次 SOQL。',
        whyRightOrWrong: '❌ Incorrect (错误): Salesforce automatically chunks bulk DML operations into batches of up to 200 records per trigger invocation.',
      },
      {
        id: 'B',
        textEn: '3 trigger executions (chunks of 200 + 200 + 100), consuming 9 SOQL queries total against the shared 100-SOQL transaction limit.',
        text: '调用 3 次触发器（按 200 + 200 + 100 分块），共消耗 9 次 SOQL（共享同一事务的 100 次上限）。',
        whyRightOrWrong: '✅ Correct (正确): 500 records are split into 3 chunks (200, 200, 100). Each chunk runs the trigger (3 × 3 = 9 SOQL queries) within the same transaction.',
      },
      {
        id: 'C',
        textEn: '3 trigger executions, each with its own independent 100-SOQL governor limit.',
        text: '调用 3 次触发器，每次分块拥有各自独立的 100 次 SOQL 配额。',
        whyRightOrWrong: '❌ Incorrect (错误): All 200-record trigger chunks within a single DML operation share the SAME transaction governor limits.',
      },
      {
        id: 'D',
        textEn: '500 trigger executions, failing on the 34th record.',
        text: '调用 500 次触发器，在第 34 条记录超限失败。',
        whyRightOrWrong: '❌ Incorrect (错误): Triggers execute in bulk chunks of up to 200 records, not 1 record at a time.',
      },
    ],
    correctOptionIds: ['B'],
    coreTakeaway: 'Platform Chunking Rule: Bulk DML >200 records is split into chunks of 200 records per trigger invocation, and all chunks share the SAME transaction Governor Limits.',
    officialDocTopic: 'Bulk Triggers and Platform Chunking',
  },
  {
    id: 'Q18',
    certLevel: 'PD2',
    stage: 'intermediate',
    domain: 'Trigger 与执行顺序 (Triggers & Order of Execution)',
    examDomain: 'Process Automation & Logic (30%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'A developer uses `public static Boolean isFirstRun = true;` inside a Trigger Handler to prevent recursion. When an administrator updates **500 `Account` records** using Data Loader (Batch Size = 500), only the first 200 records are processed properly, while records 201–500 are silently skipped! How should the developer fix this?',
    scenario:
      '开发者在 Trigger Handler 中使用 `public static Boolean isFirstRun = true;` 防止递归。当管理员用 Data Loader 一次性更新 500 条 Account 时，只有前 200 条被处理，第 201–500 条全部被静默跳过！应如何修复？',
    options: [
      {
        id: 'A',
        textEn: 'Remove the `static` keyword from `isFirstRun`.',
        text: '去掉 `isFirstRun` 上的 `static` 关键字。',
        whyRightOrWrong: '❌ Incorrect (错误): An instance variable is recreated on every trigger call and will not prevent recursion at all.',
      },
      {
        id: 'B',
        textEn: 'Replace the `static Boolean` with a `private static Set<Id> processedRecordIds = new Set<Id>();` and check field value transitions (`newVal != oldVal`).',
        text: '将 `static Boolean` 替换为 `private static Set<Id> processedRecordIds = new Set<Id>();` 按记录 ID 防重，并对比新旧字段值变化。',
        whyRightOrWrong: '✅ Correct (正确): Tracking processed record IDs in a `Set<Id>` prevents re-entering the same records in Chunk 1 while allowing new IDs in Chunks 2 and 3 (records 201–500) to execute!',
      },
      {
        id: 'C',
        textEn: 'Move the trigger logic into a `@future` method.',
        text: '将触发器逻辑全部移入 `@future` 方法。',
        whyRightOrWrong: '❌ Incorrect (错误): Does not solve the underlying chunking bug.',
      },
      {
        id: 'D',
        textEn: 'Create a second trigger on the `Account` object.',
        text: '在 `Account` 对象上再新建第二个触发器。',
        whyRightOrWrong: '❌ Incorrect (错误): Violates the One Trigger Per Object best practice.',
      },
    ],
    correctOptionIds: ['B'],
    coreTakeaway: 'Never use a naive `static Boolean` for trigger recursion control—it breaks bulk operations >200 records. Always use `static Set<Id>` + field change comparison.',
    officialDocTopic: 'Trigger Recursion and Chunking Pitfalls',
  },

  // ==================== L07: Advanced SOQL & AggregateResult ====================
  {
    id: 'Q19',
    certLevel: 'PD1',
    stage: 'intermediate',
    domain: 'SOQL & SOSL 数据查询 (Data Query)',
    examDomain: 'Data Management & SOQL (25%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'A synchronous Apex method executes `List<Case> cases = [SELECT Id, Subject, Description FROM Case WHERE CreatedDate = THIS_YEAR];` and throws `System.LimitException: Apex heap size too large` when 35,000 records are returned. What is the best practice to resolve this heap limit issue?',
    scenario:
      '某同步方法执行 `List<Case> cases = [SELECT Id, Subject, Description FROM Case WHERE CreatedDate = THIS_YEAR];`，当返回 35,000 条记录时抛出 `System.LimitException: Apex heap size too large`。解决该堆内存超限的最佳实践是什么？',
    options: [
      {
        id: 'A',
        textEn: 'Refactor the query into a SOQL For Loop: `for (List<Case> caseBatch : [SELECT Id, Subject, Description FROM Case WHERE CreatedDate = THIS_YEAR]) { ... }`',
        text: '改写为 SOQL For Loop 流式循环：`for (List<Case> caseBatch : [SELECT Id, Subject, Description FROM Case WHERE CreatedDate = THIS_YEAR]) { ... }`',
        whyRightOrWrong: '✅ Correct (正确): A SOQL For Loop streams records in 200-row chunks without loading the entire 35,000-record list into heap memory at once.',
      },
      {
        id: 'B',
        textEn: 'Add `LIMIT 50000` to the end of the query.',
        text: '在查询末尾加上 `LIMIT 50000`。',
        whyRightOrWrong: '❌ Incorrect (错误): The query is hitting the 6 MB heap memory limit, not the 50,000 row limit.',
      },
      {
        id: 'C',
        textEn: 'Call `Limits.freeMemory()` inside the loop.',
        text: '在循环内调用 `Limits.freeMemory()`。',
        whyRightOrWrong: '❌ Incorrect (错误): `Limits.freeMemory()` does not exist.',
      },
      {
        id: 'D',
        textEn: 'Change the class declaration to `without sharing`.',
        text: '将类声明改为 `without sharing`。',
        whyRightOrWrong: '❌ Incorrect (错误): `without sharing` would return even more records and worsen heap usage.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'Exam cue: "Apex heap size too large" when querying many records → Refactor into a **SOQL For Loop** (`for (List<SObject> batch : [SELECT ...])`).',
    officialDocTopic: 'SOQL For Loops',
  },
  {
    id: 'Q20',
    certLevel: 'PD1',
    stage: 'intermediate',
    domain: 'SOQL & SOSL 数据查询 (Data Query)',
    examDomain: 'Data Management & SOQL (25%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'A developer runs the query: `List<AggregateResult> res = [SELECT StageName, MAX(Amount) maxAmt, MIN(Amount) FROM Opportunity GROUP BY StageName];`. How should the developer retrieve the `MAX(Amount)` and the unaliased `MIN(Amount)` values from `res[0]`?',
    scenario:
      '开发者执行了聚合查询：`List<AggregateResult> res = [SELECT StageName, MAX(Amount) maxAmt, MIN(Amount) FROM Opportunity GROUP BY StageName];`。应如何从 `res[0]` 中提取 `MAX(Amount)` 和未起别名的 `MIN(Amount)`？',
    options: [
      {
        id: 'A',
        textEn: 'res[0].get(\'maxAmt\') and res[0].get(\'expr0\')',
        text: 'res[0].get(\'maxAmt\') 和 res[0].get(\'expr0\')',
        whyRightOrWrong: '✅ Correct (正确): Aliased aggregate columns use their alias (`maxAmt`), while unaliased aggregate expressions default to `expr0`, `expr1`, etc.',
      },
      {
        id: 'B',
        textEn: 'res[0].maxAmt and res[0].MIN_Amount',
        text: 'res[0].maxAmt 和 res[0].MIN_Amount',
        whyRightOrWrong: '❌ Incorrect (错误): `AggregateResult` fields must be retrieved via `.get(String fieldName)`.',
      },
      {
        id: 'C',
        textEn: 'res[0].get(\'MAX(Amount)\') and res[0].get(\'MIN(Amount)\')',
        text: 'res[0].get(\'MAX(Amount)\') 和 res[0].get(\'MIN(Amount)\')',
        whyRightOrWrong: '❌ Incorrect (错误): Passing the function syntax throws an invalid field error.',
      },
      {
        id: 'D',
        textEn: 'res[0].get(\'expr0\') and res[0].get(\'expr1\')',
        text: 'res[0].get(\'expr0\') 和 res[0].get(\'expr1\')',
        whyRightOrWrong: '❌ Incorrect (错误): Once an expression is given an alias (`maxAmt`), it is no longer assigned an `exprN` name; the first unaliased expression (`MIN(Amount)`) becomes `expr0`.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'In `AggregateResult`, aliased columns use `.get(\'alias\')` and unaliased aggregate functions are numbered starting from `expr0`.',
    officialDocTopic: 'Working with SOQL Aggregate Functions',
  },
  {
    id: 'Q21',
    certLevel: 'PD1',
    stage: 'intermediate',
    domain: 'SOQL & SOSL 数据查询 (Data Query)',
    examDomain: 'Data Management & SOQL (25%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'An org has 40,000 `Opportunity` records distributed across 5 `StageName` values. Executing `[SELECT StageName, COUNT(Id) FROM Opportunity GROUP BY StageName]` returns 5 `AggregateResult` rows. How many rows are counted toward the 50,000 SOQL Query Rows governor limit?',
    scenario:
      '某组织有 40,000 条 `Opportunity` 记录分布在 5 个阶段中。执行 `[SELECT StageName, COUNT(Id) FROM Opportunity GROUP BY StageName]` 返回了 5 行 `AggregateResult`。请问消耗了多少行 SOQL Query Rows 配额（上限 50,000 行）？',
    options: [
      {
        id: 'A',
        textEn: '5 rows, because only 5 AggregateResult objects are returned.',
        text: '5 行，因为只返回了 5 个 AggregateResult 对象。',
        whyRightOrWrong: '❌ Incorrect (错误): Aggregate queries count every underlying record scanned/aggregated, not just the grouped summary rows!',
      },
      {
        id: 'B',
        textEn: '40,000 rows, because every underlying record included in the aggregation counts toward the 50,000 query row limit.',
        text: '40,000 行，因为被聚合扫描的每一条底层记录都会计入 50,000 行查询配额。',
        whyRightOrWrong: '✅ Correct (正确): Queries that include aggregate functions still count every aggregated source row toward the 50,000 query row governor limit.',
      },
      {
        id: 'C',
        textEn: '0 rows, because aggregate queries only count toward the 100 SOQL query limit.',
        text: '0 行，聚合查询不计入行数配额。',
        whyRightOrWrong: '❌ Incorrect (错误): They count toward both the 100 query limit and the 50,000 row limit.',
      },
      {
        id: 'D',
        textEn: '1 row.',
        text: '1 行。',
        whyRightOrWrong: '❌ Incorrect (错误).',
      },
    ],
    correctOptionIds: ['B'],
    coreTakeaway: 'Aggregate queries (`COUNT`, `SUM`, `GROUP BY`) count the total number of underlying records aggregated toward the 50,000 SOQL row limit.',
    officialDocTopic: 'Aggregate Queries and Governor Limits',
  },

  // ==================== L08: DML, Savepoint & Mixed DML ====================
  {
    id: 'Q22',
    certLevel: 'PD1',
    stage: 'intermediate',
    domain: 'Apex 核心与面向对象 (Apex & OOP)',
    examDomain: 'Data Management & SOQL (25%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'Given the following code where the second `Contact` is missing the required `LastName` field, how many `Contact` records are inserted into the database, and is `Caught DmlException` printed to the debug log?',
    scenario:
      '阅读以下包含 3 条新 Contact 记录的代码（第 2 条缺少必填字段 `LastName`）。代码执行后成功插入了几条记录？会打印 `Caught DmlException` 吗？',
    codeBlock: `List<Contact> cons = new List<Contact>{
    new Contact(LastName = 'Valid 1'),
    new Contact(), // Missing required LastName
    new Contact(LastName = 'Valid 2')
};
try {
    Database.insert(cons, false);
} catch (DmlException e) {
    System.debug('Caught DmlException');
}`,
    options: [
      {
        id: 'A',
        textEn: '0 records are inserted, and `Caught DmlException` is printed.',
        text: '插入 0 条记录，且打印 Caught DmlException。',
        whyRightOrWrong: '❌ Incorrect (错误): That is the behavior of `insert cons;` or `Database.insert(cons, true)`.',
      },
      {
        id: 'B',
        textEn: '2 records are inserted (`Valid 1` and `Valid 2`), and `Caught DmlException` is NOT printed.',
        text: '成功插入 2 条记录（Valid 1 和 Valid 2），且**不会**抛出异常打印 Caught DmlException。',
        whyRightOrWrong: '✅ Correct (正确): `allOrNone = false` commits valid records (2 inserted) and returns errors in `Database.SaveResult[]` without ever throwing a `DmlException`!',
      },
      {
        id: 'C',
        textEn: '2 records are inserted, AND `Caught DmlException` is printed.',
        text: '成功插入 2 条记录，同时进入 catch 块打印 Caught DmlException。',
        whyRightOrWrong: '❌ Incorrect (错误): `Database.insert(list, false)` never throws `DmlException`.',
      },
      {
        id: 'D',
        textEn: 'Only 1 record (`Valid 1`) is inserted because execution stops at the second record.',
        text: '只插入第 1 条记录，遇到第 2 条失败时中止。',
        whyRightOrWrong: '❌ Incorrect (错误): `Database.insert` processes the entire list.',
      },
    ],
    correctOptionIds: ['B'],
    coreTakeaway: '`Database.insert(list, false)` commits valid records and NEVER throws a `DmlException`—errors are inspected via `Database.SaveResult.isSuccess()`.',
    officialDocTopic: 'Database Class Methods',
  },
  {
    id: 'Q23',
    certLevel: 'PD1',
    stage: 'intermediate',
    domain: 'Apex 核心与面向对象 (Apex & OOP)',
    examDomain: 'Process Automation & Logic (30%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'An onboarding service inserts a new `Contact` record and immediately inserts a `PermissionSetAssignment` record for the corresponding `User` in the same synchronous transaction, throwing a `MIXED_DML_OPERATION` error. How should the developer resolve this in production code?',
    scenario:
      '某入职服务在同一个同步事务中先 `insert newContact;`，紧接着为对应用户 `insert new PermissionSetAssignment(...);`，结果抛出 `MIXED_DML_OPERATION` 错误。在生产代码中应如何解决？',
    options: [
      {
        id: 'A',
        textEn: 'Move the `PermissionSetAssignment` (Setup Object) DML into a `@future` or `Queueable` asynchronous method.',
        text: '将对 `PermissionSetAssignment`（Setup 配置对象）的 DML 拆分到 `@future` 或 `Queueable` 异步方法中执行。',
        whyRightOrWrong: '✅ Correct (正确): Performing Setup Object DML (`User`, `PermissionSetAssignment`, `GroupMember`) in an async transaction separates it from the Non-Setup DML transaction.',
      },
      {
        id: 'B',
        textEn: 'Use `Database.insert(psa, false)` instead of `insert psa;`.',
        text: '改用 `Database.insert(psa, false)`。',
        whyRightOrWrong: '❌ Incorrect (错误): Both operations are still in the same synchronous transaction, so `MIXED_DML_OPERATION` still occurs.',
      },
      {
        id: 'C',
        textEn: 'Call `Database.setSavepoint()` between the two DML statements.',
        text: '在两次 DML 之间调用 `Database.setSavepoint()`。',
        whyRightOrWrong: '❌ Incorrect (错误): Savepoints do not start a separate transaction.',
      },
      {
        id: 'D',
        textEn: 'Change the class to `without sharing`.',
        text: '将类改为 `without sharing`。',
        whyRightOrWrong: '❌ Incorrect (错误): Sharing mode does not prevent Mixed DML.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'Fix `MIXED_DML_OPERATION`: use `@future` / `Queueable` in production code; use `System.runAs(user)` in `@isTest` unit tests.',
    officialDocTopic: 'sObjects That Cannot Be Used Together in DML Operations',
  },
  {
    id: 'Q24',
    certLevel: 'PD1',
    stage: 'intermediate',
    domain: 'Apex 核心与面向对象 (Apex & OOP)',
    examDomain: 'Data Management & SOQL (25%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'An integration receives `List<Order__c> erpOrders` where each record has `ERP_Order_ID__c` (configured as an External ID field in Salesforce). Which statement updates existing records and inserts new records without writing a preliminary SOQL query?',
    scenario:
      '集成接口收到一批 `List<Order__c> erpOrders`，每条记录包含已在 Salesforce 中设为 External ID 的 `ERP_Order_ID__c` 字段。哪条语句可以在不先写 SOQL 查询的情况下自动完成存在则更新、不存在则新建？',
    options: [
      {
        id: 'A',
        textEn: 'upsert erpOrders ERP_Order_ID__c;',
        text: 'upsert erpOrders ERP_Order_ID__c;',
        whyRightOrWrong: '✅ Correct (正确): `upsert list External_ID_Field__c;` matches records by the specified External ID field automatically.',
      },
      {
        id: 'B',
        textEn: 'merge erpOrders ERP_Order_ID__c;',
        text: 'merge erpOrders ERP_Order_ID__c;',
        whyRightOrWrong: '❌ Incorrect (错误): `merge` only merges up to 3 duplicate Account, Contact, Lead, Case, or Individual records.',
      },
      {
        id: 'C',
        textEn: 'update erpOrders;',
        text: 'update erpOrders;',
        whyRightOrWrong: '❌ Incorrect (错误): Fails on new records that do not have a Salesforce `Id`.',
      },
      {
        id: 'D',
        textEn: 'insert erpOrders;',
        text: 'insert erpOrders;',
        whyRightOrWrong: '❌ Incorrect (错误): Fails on existing records with duplicate External IDs.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: '`upsert records Custom_External_Id__c;` performs idempotent insert-or-update matching on External ID without consuming a SOQL query.',
    officialDocTopic: 'Upserting Records with External IDs',
  },

  // ==================== L09: LWC Component Communication ====================
  {
    id: 'Q25',
    certLevel: 'PD1',
    stage: 'intermediate',
    domain: 'LWC 现代前端组件 (Lightning Web Components)',
    examDomain: 'User Interface / LWC (25%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'A Lightning App Page contains three unrelated components in separate regions: a custom LWC filter component, a legacy Aura component, and an embedded Visualforce page. When a user selects an Account in the LWC component, both the Aura component and the Visualforce page must receive the selected Account ID in real time. Which technology should be used?',
    scenario:
      '同一个 Lightning 页面上的不同区域放置了三个无父子关系的组件：一个 LWC 筛选组件、一个 Aura 组件和一个内嵌 Visualforce 页面。当用户在 LWC 中选中某个客户时，Aura 和 Visualforce 页面需实时收到通知。应使用什么技术？',
    options: [
      {
        id: 'A',
        textEn: 'Lightning Message Service (LMS) with a custom `MessageChannel`.',
        text: '使用 Lightning Message Service (LMS) 配合自定义 `MessageChannel`。',
        whyRightOrWrong: '✅ Correct (正确): LMS is the only native browser pub/sub service that works across unrelated LWC, Aura, and Visualforce components on the same page.',
      },
      {
        id: 'B',
        textEn: 'A DOM `CustomEvent` with `bubbles: true` and `composed: true`.',
        text: '派发设置 `bubbles: true, composed: true` 的 DOM `CustomEvent`。',
        whyRightOrWrong: '❌ Incorrect (错误): DOM events only travel up ancestor hierarchies and cannot reach sibling regions or Visualforce iframes.',
      },
      {
        id: 'C',
        textEn: '`@api` public properties.',
        text: '使用 `@api` 公共属性。',
        whyRightOrWrong: '❌ Incorrect (错误): `@api` only works for direct Parent-to-Child communication.',
      },
      {
        id: 'D',
        textEn: 'Apex `@AuraEnabled` static variables.',
        text: '使用 Apex `@AuraEnabled` 静态变量共享。',
        whyRightOrWrong: '❌ Incorrect (错误): Apex static variables only live for the duration of a single server request.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'Unrelated sibling components on a page OR cross-framework communication (LWC ↔ Aura ↔ Visualforce) → **Lightning Message Service (LMS)**.',
    officialDocTopic: 'Lightning Message Service',
  },
  {
    id: 'Q26',
    certLevel: 'PD1',
    stage: 'intermediate',
    domain: 'LWC 现代前端组件 (Lightning Web Components)',
    examDomain: 'User Interface / LWC (25%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'A child component `c-product-tile` needs to pass the selected `productId` up to its immediate parent component `c-product-catalog`. Which implementation follows LWC best practices?',
    scenario:
      '子组件 `c-product-tile` 需要将选中的 `productId` 传递给直接父组件 `c-product-catalog`。哪项实现符合 LWC 最佳实践？',
    options: [
      {
        id: 'A',
        textEn: 'Child: `this.dispatchEvent(new CustomEvent(\'productselect\', { detail: this.productId }));` | Parent HTML: `<c-product-tile onproductselect={handleSelect}>`',
        text: '子组件：`this.dispatchEvent(new CustomEvent(\'productselect\', { detail: this.productId }));` | 父模板：`<c-product-tile onproductselect={handleSelect}>`',
        whyRightOrWrong: '✅ Correct (正确): Dispatch a lowercase `CustomEvent` carrying payload in `detail`, and listen on the parent tag using `on<eventname>`.',
      },
      {
        id: 'B',
        textEn: 'Child: `this.dispatchEvent(new CustomEvent(\'onproductselect\', { data: this.productId }));` | Parent HTML: `<c-product-tile onproductselect={handleSelect}>`',
        text: '子组件：`this.dispatchEvent(new CustomEvent(\'onproductselect\', { data: this.productId }));` | 父模板：`<c-product-tile onproductselect={handleSelect}>`',
        whyRightOrWrong: '❌ Incorrect (错误): Event name should not include `on`, and the payload property on `CustomEvent` must be named `detail`, not `data`.',
      },
      {
        id: 'C',
        textEn: 'Child directly mutates `@api selectedProductId = this.productId;`.',
        text: '子组件直接修改 `@api selectedProductId = this.productId;`。',
        whyRightOrWrong: '❌ Incorrect (错误): `@api` is one-way from parent to child.',
      },
      {
        id: 'D',
        textEn: 'Child calls `this.parentElement.handleSelect(this.productId)`.',
        text: '子组件直接调用 `this.parentElement.handleSelect(this.productId)`。',
        whyRightOrWrong: '❌ Incorrect (错误): Violates Shadow DOM encapsulation.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'Child-to-Parent communication: `new CustomEvent(\'eventname\', { detail: payload })` + `this.dispatchEvent(...)` + parent `<c-child oneventname={handler}>`.',
    officialDocTopic: 'Communicate with Events',
  },
  {
    id: 'Q27',
    certLevel: 'PD1',
    stage: 'intermediate',
    domain: 'LWC 现代前端组件 (Lightning Web Components)',
    examDomain: 'User Interface / LWC (25%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'A parent LWC component needs to imperatively call a method named `resetForm()` defined inside its child component `<c-search-filter>`. How should this be implemented?',
    scenario:
      '父组件需要在用户点击重置按钮时，直接调用子组件 `<c-search-filter>` 内部定义的 `resetForm()` 方法。应该如何实现？',
    options: [
      {
        id: 'A',
        textEn: 'Decorate `resetForm()` with `@api` in the child class, and call `this.template.querySelector(\'c-search-filter\').resetForm()` in the parent class.',
        text: '在子组件的 `resetForm()` 方法前添加 `@api` 装饰器，在父组件中通过 `this.template.querySelector(\'c-search-filter\').resetForm()` 调用。',
        whyRightOrWrong: '✅ Correct (正确): `@api` exposes a public method on the child component that the parent can invoke via `this.template.querySelector()`.',
      },
      {
        id: 'B',
        textEn: 'Decorate `resetForm()` with `@track` in the child class and call `document.querySelector(\'c-search-filter\').resetForm()`.',
        text: '在子组件方法前添加 `@track` 并用 `document.querySelector` 调用。',
        whyRightOrWrong: '❌ Incorrect (错误): `@track` is for reactive private state, not public methods.',
      },
      {
        id: 'C',
        textEn: 'Dispatch a `CustomEvent` from the parent component.',
        text: '从父组件派发 `CustomEvent`。',
        whyRightOrWrong: '❌ Incorrect (错误): `CustomEvent` flows upward from child to parent, not downward.',
      },
      {
        id: 'D',
        textEn: 'Declare `public static resetForm()` in the child component.',
        text: '将子组件方法声明为 `public static resetForm()`。',
        whyRightOrWrong: '❌ Incorrect (错误): LWC uses `@api` on instance methods.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'Decorate child methods with `@api` so the parent component can call them via `this.template.querySelector(\'c-child\').methodName()`.',
    officialDocTopic: 'Create Public Methods on LWC',
  },

  // ==================== L10: LWC Lifecycle, LDS & @wire ====================
  {
    id: 'Q28',
    certLevel: 'PD1',
    stage: 'intermediate',
    domain: 'LWC 现代前端组件 (Lightning Web Components)',
    examDomain: 'User Interface / LWC (25%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'A developer wants to wire an Apex method `AccountController.getTopAccounts()` to an LWC property using `@wire(getTopAccounts)`. What is required on the Apex method signature?',
    scenario:
      '开发者希望在 LWC 中使用 `@wire(getTopAccounts)` 响应式调用 Apex 方法 `AccountController.getTopAccounts()`。该 Apex 方法必须满足什么条件？',
    options: [
      {
        id: 'A',
        textEn: 'The method must be `public static` (or `global static`), annotated with `@AuraEnabled(cacheable=true)`, and must NOT perform any DML operations.',
        text: '必须是 `public/global static` 方法，标注 `@AuraEnabled(cacheable=true)`，且内部不能包含任何 DML 写入操作。',
        whyRightOrWrong: '✅ Correct (正确): `@wire` only works with read-only cacheable methods annotated with `@AuraEnabled(cacheable=true)`.',
      },
      {
        id: 'B',
        textEn: 'The method only needs `@AuraEnabled`; `cacheable=true` is optional for `@wire`.',
        text: '只需标注 `@AuraEnabled`，`cacheable=true` 是可选的。',
        whyRightOrWrong: '❌ Incorrect (错误): Without `cacheable=true`, `@wire` fails; non-cacheable `@AuraEnabled` methods can only be called imperatively.',
      },
      {
        id: 'C',
        textEn: 'The method must be annotated with `@InvocableMethod(cacheable=true)`.',
        text: '必须标注 `@InvocableMethod(cacheable=true)`。',
        whyRightOrWrong: '❌ Incorrect (错误): `@InvocableMethod` exposes Apex to Flows, not LWC `@wire`.',
      },
      {
        id: 'D',
        textEn: 'The method must be annotated with `@Future(cacheable=true)`.',
        text: '必须标注 `@Future(cacheable=true)`。',
        whyRightOrWrong: '❌ Incorrect (错误): Invalid annotation.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: '`@wire` to Apex requires `@AuraEnabled(cacheable=true)` and zero DML; DML requires imperative Apex calls without `cacheable=true`.',
    officialDocTopic: 'Wire Apex Methods to Lightning Web Components',
  },
  {
    id: 'Q29',
    certLevel: 'PD1',
    stage: 'intermediate',
    domain: 'LWC 现代前端组件 (Lightning Web Components)',
    examDomain: 'User Interface / LWC (25%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'A developer needs to build an LWC component that displays and edits 5 standard fields on an `Account` record while automatically enforcing Field-Level Security (FLS), CRUD, and dependent picklists with the least amount of code and no custom Apex. Which base component should be used?',
    scenario:
      '开发者需要构建一个展示并编辑 Account 5 个标准字段的 LWC 组件，要求用最少的代码且不写任何 Apex，自动遵循字段级安全（FLS）、对象 CRUD 和依赖下拉列表。应优先选用哪个基础组件？',
    options: [
      {
        id: 'A',
        textEn: 'lightning-record-form',
        text: 'lightning-record-form',
        whyRightOrWrong: '✅ Correct (正确): `lightning-record-form` uses Lightning Data Service (LDS) to render view/edit modes, handle save, and enforce FLS/CRUD automatically with minimal code.',
      },
      {
        id: 'B',
        textEn: 'Five `lightning-input` fields with an imperative Apex save method.',
        text: '五个独立的 `lightning-input` 配合命令式 Apex 保存。',
        whyRightOrWrong: '❌ Incorrect (错误): Requires custom Apex, unit tests, and manual FLS/validation handling.',
      },
      {
        id: 'C',
        textEn: 'lightning-datatable',
        text: 'lightning-datatable',
        whyRightOrWrong: '❌ Incorrect (错误): Used for multi-row tabular lists, not a single record form.',
      },
      {
        id: 'D',
        textEn: 'lightning-record-view-form',
        text: 'lightning-record-view-form',
        whyRightOrWrong: '❌ Incorrect (错误): `lightning-record-view-form` is read-only and does not support editing.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'Single-record LDS form hierarchy: `lightning-record-form` (fastest, view+edit, least code) → `lightning-record-edit-form` (custom layout/submit override) → `lightning-record-view-form` (read-only).',
    officialDocTopic: 'Work with Records Using Base Components',
  },
  {
    id: 'Q30',
    certLevel: 'PD2',
    stage: 'intermediate',
    domain: 'LWC 现代前端组件 (Lightning Web Components)',
    examDomain: 'User Interface / LWC (25%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'When a parent component `c-parent` containing a child component `c-child` is mounted into the DOM for the first time, in what exact sequence do `constructor()`, `connectedCallback()`, and `renderedCallback()` execute?',
    scenario:
      '当包含子组件 `c-child` 的父组件 `c-parent` 首次挂载到 DOM 时，`constructor()`、`connectedCallback()` 和 `renderedCallback()` 的精确执行顺序是什么？',
    options: [
      {
        id: 'A',
        textEn: 'Parent constructor → Child constructor → Parent connectedCallback → Child connectedCallback → Parent renderedCallback → Child renderedCallback',
        text: '父 constructor → 子 constructor → 父 connectedCallback → 子 connectedCallback → 父 renderedCallback → 子 renderedCallback',
        whyRightOrWrong: '❌ Incorrect (错误): Parent `connectedCallback` runs before Child `constructor`, and `renderedCallback` runs from Child to Parent!',
      },
      {
        id: 'B',
        textEn: 'Parent constructor → Parent connectedCallback → Child constructor → Child connectedCallback → Child renderedCallback → Parent renderedCallback',
        text: '父 constructor → 父 connectedCallback → 子 constructor → 子 connectedCallback → 子 renderedCallback → 父 renderedCallback',
        whyRightOrWrong: '✅ Correct (正确): Construction and connection flow top-down (Parent → Child), while `renderedCallback` finishes bottom-up (Child → Parent)!',
      },
      {
        id: 'C',
        textEn: 'Child constructor → Parent constructor → Child connectedCallback → Parent connectedCallback → Child renderedCallback → Parent renderedCallback',
        text: '子 constructor → 父 constructor → 子 connectedCallback → 父 connectedCallback → 子 renderedCallback → 父 renderedCallback',
        whyRightOrWrong: '❌ Incorrect (错误): The parent component must be constructed and connected before its template instantiates child components.',
      },
      {
        id: 'D',
        textEn: 'All lifecycle hooks run from Child to Parent.',
        text: '所有生命周期钩子均从子到父执行。',
        whyRightOrWrong: '❌ Incorrect (错误): Only `renderedCallback` flows from Child to Parent.',
      },
    ],
    correctOptionIds: ['B'],
    coreTakeaway: 'LWC Lifecycle Order: `Parent constructor` → `Parent connectedCallback` → `Child constructor` → `Child connectedCallback` → `Child renderedCallback` → `Parent renderedCallback`.',
    officialDocTopic: 'LWC Lifecycle Flow',
  },
  {
    id: 'Q31',
    certLevel: 'PD1',
    stage: 'intermediate',
    domain: 'LWC 现代前端组件 (Lightning Web Components)',
    examDomain: 'User Interface / LWC (25%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'After inserting a new Contact imperatively, a developer calls `refreshApex(this.contacts)` to update the wired list, but the UI does not refresh. Based on the code below, what is the mistake?',
    scenario:
      '在通过命令式 Apex 插入一条新联系人后，开发者调用 `refreshApex(this.contacts)` 试图刷新列表，但界面毫无变化。根据下方代码，错误原因是什么？',
    codeBlock: `@wire(getContacts, { accId: '$recordId' })
wiredContacts({ error, data }) {
    if (data) {
        this.contacts = data;
    }
}`,
    options: [
      {
        id: 'A',
        textEn: '`refreshApex()` must receive the entire non-destructured wire result object (`wiredContacts(result) { this.wiredResult = result; }`), not `this.contacts`.',
        text: '`refreshApex()` 必须传入 `@wire` 注入的完整未解构结果对象（`result`），而不能只传入解构后的 `this.contacts` 数据本身。',
        whyRightOrWrong: '✅ Correct (正确): `refreshApex()` requires the full provisioned `{ data, error }` wire object to locate and invalidate the cache entry.',
      },
      {
        id: 'B',
        textEn: '`refreshApex()` can only be called inside `renderedCallback()`.',
        text: '`refreshApex()` 只能在 `renderedCallback()` 中调用。',
        whyRightOrWrong: '❌ Incorrect (错误): Calling it in `renderedCallback()` would cause an infinite loop.',
      },
      {
        id: 'C',
        textEn: 'The `$` prefix on `\'$recordId\'` prevents `refreshApex()` from working.',
        text: '`\'$recordId\'` 上的 `$` 前缀阻止了刷新。',
        whyRightOrWrong: '❌ Incorrect (错误): `$recordId` is standard reactive syntax.',
      },
      {
        id: 'D',
        textEn: '`getContacts` must have `cacheable=false` to use `refreshApex()`.',
        text: '`getContacts` 必须设为 `cacheable=false`。',
        whyRightOrWrong: '❌ Incorrect (错误): `@wire` requires `cacheable=true`.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'Never destructure `({ error, data })` in the `@wire` function signature if you need `refreshApex()`—store the full `result` parameter and call `refreshApex(this.wiredResult)`.',
    officialDocTopic: 'Refresh the Cache When Using @wire',
  },

  // ==================== L11: Asynchronous Apex ====================
  {
    id: 'Q32',
    certLevel: 'PD1',
    stage: 'advanced',
    domain: '异步 Apex 与集成架构 (Async Apex & Integration)',
    examDomain: 'Process Automation & Logic (30%)',
    questionType: 'multiple',
    selectCount: 2,
    scenarioEn:
      'Which two capabilities are provided by `Queueable Apex` that are NOT supported by `@future` methods? (Choose 2 answers)',
    scenario:
      '与 `@future` 方法相比，`Queueable Apex` 提供了哪两项独有能力？（请选择 2 项）',
    options: [
      {
        id: 'A',
        textEn: 'Passing non-primitive data types (such as `List<sObject>` or custom Apex objects) to the asynchronous job.',
        text: '支持将非原始数据类型（如 `List<sObject>` 或自定义 Apex 对象）传入异步任务。',
        whyRightOrWrong: '✅ Correct (正确): `@future` only accepts primitives/collections of primitives, whereas `Queueable` classes can hold `sObject` and custom object member variables.',
      },
      {
        id: 'B',
        textEn: 'Chaining jobs by calling `System.enqueueJob()` inside `execute()` and receiving an `AsyncApexJob` ID.',
        text: '支持在 `execute()` 中调用 `System.enqueueJob()` 链式启动下一个任务，并返回 `AsyncApexJob` 的 Job ID。',
        whyRightOrWrong: '✅ Correct (正确): `Queueable` returns a Job ID and supports chaining; `@future` returns `void` and cannot call another `@future` method.',
      },
      {
        id: 'C',
        textEn: 'Querying up to 50 million records in a single `execute()` method.',
        text: '单次 `execute()` 方法支持直接查询 5,000 万条记录。',
        whyRightOrWrong: '❌ Incorrect (错误): Only `Batch Apex` with `Database.QueryLocator` can query up to 50 million records.',
      },
      {
        id: 'D',
        textEn: 'Bypassing the 100-callout per transaction governor limit.',
        text: '突破单事务 100 次 HTTP Callout 的配额限制。',
        whyRightOrWrong: '❌ Incorrect (错误): A single `Queueable` execution is still subject to the 100-callout limit.',
      },
    ],
    correctOptionIds: ['A', 'B'],
    coreTakeaway: 'Queueable advantages over @future: 1) Accepts `sObject` & complex objects; 2) Returns `AsyncApexJob` ID; 3) Supports Job Chaining & `System.Finalizer`.',
    officialDocTopic: 'Queueable Apex vs Future Methods',
  },
  {
    id: 'Q33',
    certLevel: 'PD1',
    stage: 'advanced',
    domain: '异步 Apex 与集成架构 (Async Apex & Integration)',
    examDomain: 'Process Automation & Logic (30%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'Why are `@future` methods restricted to accepting only primitive data types (or collections of primitives) and prohibited from accepting `sObject` parameters?',
    scenario:
      '为什么 `@future` 方法在语法上只允许接收原始数据类型（或其集合），而禁止直接传入 `sObject` 对象？',
    options: [
      {
        id: 'A',
        textEn: 'Because the sObject record might change in the database between the time the future method is enqueued and the time it actually executes, which could overwrite newer data.',
        text: '因为在 `@future` 方法入队到真正执行的间隔期内，数据库中的 sObject 记录可能已被修改，传入旧快照会导致脏写覆盖。',
        whyRightOrWrong: '✅ Correct (正确): Passing only record `Id`s forces the `@future` method to query the freshest state of the record when it executes.',
      },
      {
        id: 'B',
        textEn: 'Because sObjects cannot be serialized into JSON in Apex.',
        text: '因为 sObject 无法在 Apex 中被序列化。',
        whyRightOrWrong: '❌ Incorrect (错误): sObjects serialize cleanly.',
      },
      {
        id: 'C',
        textEn: 'Because `@future` methods cannot execute SOQL or DML statements.',
        text: '因为 `@future` 方法内部不能执行 SOQL 或 DML。',
        whyRightOrWrong: '❌ Incorrect (错误): `@future` methods have full SOQL (200) and DML (150) access.',
      },
      {
        id: 'D',
        textEn: 'Because `@future` methods execute on the client browser.',
        text: '因为 `@future` 在客户端浏览器中运行。',
        whyRightOrWrong: '❌ Incorrect (错误): `@future` runs asynchronously on Salesforce servers.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'Classic exam question: `@future` forbids sObject parameters because the sObject might change between enqueue time and execution time.',
    officialDocTopic: 'Future Methods Best Practices',
  },
  {
    id: 'Q34',
    certLevel: 'PD1',
    stage: 'advanced',
    domain: '异步 Apex 与集成架构 (Async Apex & Integration)',
    examDomain: 'Process Automation & Logic (30%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'A nightly job must process 8 million `Transaction_Log__c` records and send an email in the `finish()` method containing the cumulative total of failed records and total dollar amount across all batches. How should the class be implemented?',
    scenario:
      '某夜间任务需处理 800 万条 `Transaction_Log__c` 记录，并在 `finish()` 方法中发送包含所有批次累计失败条数与总金额的汇总邮件。应如何定义该类？',
    options: [
      {
        id: 'A',
        textEn: 'Implement `Database.Batchable<sObject>` and `Database.Stateful`, and return a `Database.QueryLocator` from `start()`.',
        text: '实现 `Database.Batchable<sObject>` 和 `Database.Stateful` 接口，且在 `start()` 中返回 `Database.QueryLocator`。',
        whyRightOrWrong: '✅ Correct (正确): `Database.QueryLocator` supports up to 50M rows, and `Database.Stateful` preserves instance member variables across batch chunks.',
      },
      {
        id: 'B',
        textEn: 'Implement `Database.Batchable<sObject>` and store the running totals in `static` variables.',
        text: '实现 `Database.Batchable<sObject>` 并将累计值保存在 `static` 静态变量中。',
        whyRightOrWrong: '❌ Incorrect (错误): `static` variables are reset between each batch `execute()` transaction! Only instance variables with `Database.Stateful` persist.',
      },
      {
        id: 'C',
        textEn: 'Implement `Database.Batchable<sObject>` returning an `Iterable<sObject>` from `start()`.',
        text: '实现 `Database.Batchable<sObject>` 且在 `start()` 中返回 `Iterable<sObject>`。',
        whyRightOrWrong: '❌ Incorrect (错误): Returning an `Iterable` still enforces the 50,000 SOQL row limit and cannot handle 8 million rows.',
      },
      {
        id: 'D',
        textEn: 'Use a `Queueable` job with a SOQL For Loop.',
        text: '使用 `Queueable` 配合 SOQL For Loop。',
        whyRightOrWrong: '❌ Incorrect (错误): `Queueable` is capped at 50,000 SOQL rows per execution.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'Batch Apex rules: 1) `Database.QueryLocator` = up to 50M rows (`Iterable` = 50k rows); 2) `Database.Stateful` preserves instance variables across chunks (`static` variables always reset).',
    officialDocTopic: 'Using Batch Apex and Database.Stateful',
  },
  {
    id: 'Q35',
    certLevel: 'PD2',
    stage: 'advanced',
    domain: '异步 Apex 与集成架构 (Async Apex & Integration)',
    examDomain: 'Process Automation & Logic (30%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'A `Queueable` job occasionally fails with an uncatchable `System.LimitException: Apex CPU time limit exceeded`. An architect wants to automatically log the failure and re-enqueue the job when an unhandled exception occurs. Which feature should be used?',
    scenario:
      '某 `Queueable` 异步任务偶发因不可捕获的 `System.LimitException: Apex CPU time limit exceeded` 崩溃。架构师希望在任务因未捕获异常失败时自动记录日志并重新入队重试。应使用什么特性？',
    options: [
      {
        id: 'A',
        textEn: 'Implement the `System.Finalizer` interface and attach it inside the Queueable `execute()` method using `System.attachFinalizer(finalizer)`.',
        text: '实现 `System.Finalizer` 接口，并在 Queueable 的 `execute()` 方法中调用 `System.attachFinalizer(finalizer)`。',
        whyRightOrWrong: '✅ Correct (正确): Transaction Finalizers execute after a Queueable job finishes—even if it crashes due to an uncatchable `LimitException`—allowing logging and re-enqueueing.',
      },
      {
        id: 'B',
        textEn: 'Wrap the Queueable `execute()` logic in `try { ... } catch (LimitException e)`.',
        text: '在 `execute()` 外层包裹 `try { ... } catch (LimitException e)`。',
        whyRightOrWrong: '❌ Incorrect (错误): `LimitException` cannot be caught by `try-catch`.',
      },
      {
        id: 'C',
        textEn: 'Implement `Database.RaisesPlatformEvents` on the Queueable class.',
        text: '在 Queueable 类上实现 `Database.RaisesPlatformEvents`。',
        whyRightOrWrong: '❌ Incorrect (错误): `Database.RaisesPlatformEvents` is an interface for `Batchable` classes (`BatchApexErrorEvent`), whereas `System.Finalizer` is designed specifically for `Queueable` recovery.',
      },
      {
        id: 'D',
        textEn: 'Switch to a `@future` method.',
        text: '改用 `@future` 方法。',
        whyRightOrWrong: '❌ Incorrect (错误): `@future` does not support Finalizers.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'For `Queueable` error recovery from uncatchable `LimitException`, attach a **`System.Finalizer`** (`System.attachFinalizer`). For `Batch Apex`, implement **`Database.RaisesPlatformEvents`** (`BatchApexErrorEvent`).',
    officialDocTopic: 'Transaction Finalizers for Queueable Apex',
  },

  // ==================== L12: Platform Security & FLS/CRUD ====================
  {
    id: 'Q36',
    certLevel: 'PD1',
    stage: 'advanced',
    domain: '安全模型与单元测试 (Security & Testing)',
    examDomain: 'Data Management & SOQL (25%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'A legacy class is declared as `public without sharing class ReportService`. A developer is adding a new SOQL query inside this class that must enforce the running user\'s Object permissions (CRUD), Field-Level Security (FLS) across `SELECT` and `WHERE` clauses, AND Record-Level Sharing rules. Which SOQL clause accomplishes all three?',
    scenario:
      '某历史类声明为 `public without sharing class ReportService`。开发者需在其中新增一条 SOQL 查询，要求同时强制执行当前用户的对象 CRUD、所有子句（含 WHERE）的字段级安全（FLS）以及记录级共享规则（Sharing Rules）。应使用哪个子句？',
    options: [
      {
        id: 'A',
        textEn: 'WITH USER_MODE',
        text: 'WITH USER_MODE',
        whyRightOrWrong: '✅ Correct (正确): `WITH USER_MODE` enforces CRUD, FLS on all clauses, AND record-level sharing rules even inside a `without sharing` class!',
      },
      {
        id: 'B',
        textEn: 'WITH SECURITY_ENFORCED',
        text: 'WITH SECURITY_ENFORCED',
        whyRightOrWrong: '❌ Incorrect (错误): `WITH SECURITY_ENFORCED` only checks CRUD and FLS on SELECT/FROM; it does NOT enforce record-level sharing rules.',
      },
      {
        id: 'C',
        textEn: 'FOR VIEW',
        text: 'FOR VIEW',
        whyRightOrWrong: '❌ Incorrect (错误): `FOR VIEW` updates `LastViewedDate` metadata.',
      },
      {
        id: 'D',
        textEn: 'USING SCOPE Mine',
        text: 'USING SCOPE Mine',
        whyRightOrWrong: '❌ Incorrect (错误): Filters only records owned by the user rather than applying full sharing rules.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: '`WITH USER_MODE` enforces Object CRUD + all-clause FLS + Record Sharing Rules (overriding `without sharing`).',
    officialDocTopic: 'Enforce User Mode for Database Operations',
  },
  {
    id: 'Q37',
    certLevel: 'PD1',
    stage: 'advanced',
    domain: '安全模型与单元测试 (Security & Testing)',
    examDomain: 'Data Management & SOQL (25%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'An Apex method receives a list of `Contact` records from an external integration and needs to update them. The security requirement states: **"Automatically remove any fields that the running user does not have Field-Level Security (FLS) permission to update, save the remaining permitted fields, and DO NOT throw an exception."** Which API should be used?',
    scenario:
      '某 Apex 方法接收一批 `Contact` 记录并执行更新。安全规范要求：**“自动剔除当前用户没有字段级更新权限（FLS）的字段，正常保存其余有权限的字段，且绝不能抛出异常中断流程”**。应使用哪个 API？',
    options: [
      {
        id: 'A',
        textEn: 'SObjectAccessDecision decision = Security.stripInaccessible(AccessType.UPDATABLE, contacts); update decision.getRecords();',
        text: 'SObjectAccessDecision decision = Security.stripInaccessible(AccessType.UPDATABLE, contacts); update decision.getRecords();',
        whyRightOrWrong: '✅ Correct (正确): `Security.stripInaccessible()` silently removes unauthorized fields and returns sanitized records via `decision.getRecords()` without throwing an exception.',
      },
      {
        id: 'B',
        textEn: 'update as user contacts;',
        text: 'update as user contacts;',
        whyRightOrWrong: '❌ Incorrect (错误): `update as user` throws a `SecurityException` / `DmlException` if any inaccessible field is populated.',
      },
      {
        id: 'C',
        textEn: 'WITH SECURITY_ENFORCED',
        text: 'WITH SECURITY_ENFORCED',
        whyRightOrWrong: '❌ Incorrect (错误): Applies to SOQL queries and throws an exception when inaccessible fields are encountered.',
      },
      {
        id: 'D',
        textEn: 'String.escapeSingleQuotes()',
        text: 'String.escapeSingleQuotes()',
        whyRightOrWrong: '❌ Incorrect (错误): Prevents SOQL injection, not FLS violations.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'Exam signal phrase: "strip/remove fields the user lacks permission to access/update WITHOUT throwing an exception" → `Security.stripInaccessible()`.',
    officialDocTopic: 'Enforce Field-Level Security with stripInaccessible',
  },
  {
    id: 'Q38',
    certLevel: 'PD1',
    stage: 'advanced',
    domain: '安全模型与单元测试 (Security & Testing)',
    examDomain: 'Process Automation & Logic (30%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'How can a developer programmatically verify using `Schema` methods whether the current user has permission to delete `Opportunity` records and update the `Opportunity.Amount` field?',
    scenario:
      '开发者如何使用标准 `Schema` 方法在代码中判断当前用户是否拥有删除 `Opportunity` 对象的权限以及更新 `Opportunity.Amount` 字段的权限？',
    options: [
      {
        id: 'A',
        textEn: 'Schema.sObjectType.Opportunity.isDeletable() and Schema.sObjectType.Opportunity.fields.Amount.isUpdateable()',
        text: 'Schema.sObjectType.Opportunity.isDeletable() 与 Schema.sObjectType.Opportunity.fields.Amount.isUpdateable()',
        whyRightOrWrong: '✅ Correct (正确): `DescribeSObjectResult` and `DescribeFieldResult` expose `isAccessible()`, `isCreateable()`, `isUpdateable()`, and `isDeletable()`.',
      },
      {
        id: 'B',
        textEn: 'UserInfo.isDeletable(\'Opportunity\') and UserInfo.isUpdateable(\'Opportunity.Amount\')',
        text: 'UserInfo.isDeletable(\'Opportunity\') 与 UserInfo.isUpdateable(\'Opportunity.Amount\')',
        whyRightOrWrong: '❌ Incorrect (错误): `UserInfo` does not have CRUD/FLS check methods.',
      },
      {
        id: 'C',
        textEn: 'FeatureManagement.checkPermission(\'Opportunity_Delete\')',
        text: 'FeatureManagement.checkPermission(\'Opportunity_Delete\')',
        whyRightOrWrong: '❌ Incorrect (错误): `FeatureManagement.checkPermission` checks Custom Permissions, not standard CRUD/FLS.',
      },
      {
        id: 'D',
        textEn: 'Security.canDelete(Opportunity.sObjectType)',
        text: 'Security.canDelete(Opportunity.sObjectType)',
        whyRightOrWrong: '❌ Incorrect (错误): Method does not exist.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'Use `Schema.sObjectType.<Obj>.isAccessible()/isCreateable()/isUpdateable()/isDeletable()` for programmatic CRUD/FLS checks.',
    officialDocTopic: 'Enforcing Object and Field Permissions via Schema Describe',
  },

  // ==================== L13: Apex Unit Testing ====================
  {
    id: 'Q39',
    certLevel: 'PD1',
    stage: 'advanced',
    domain: '安全模型与单元测试 (Security & Testing)',
    examDomain: 'Testing, Debugging & Deployment (20%)',
    questionType: 'multiple',
    selectCount: 2,
    scenarioEn:
      'Which two statements are true regarding a `@TestSetup` method in an Apex test class? (Choose 2 answers)',
    scenario:
      '关于 Apex 测试类中的 `@TestSetup` 方法，以下哪两项描述是正确的？（请选择 2 项）',
    options: [
      {
        id: 'A',
        textEn: 'The `@TestSetup` method executes only once for the entire test class, regardless of how many `@isTest` methods exist.',
        text: '无论测试类中有多少个 `@isTest` 方法，`@TestSetup` 方法在整个测试类运行期间只执行一次。',
        whyRightOrWrong: '✅ Correct (正确): `@TestSetup` creates shared baseline records once and sets a savepoint before running individual test methods.',
      },
      {
        id: 'B',
        textEn: 'Changes made to `@TestSetup` records inside one `@isTest` method are automatically rolled back after that method finishes, leaving clean data for subsequent `@isTest` methods.',
        text: '某个 `@isTest` 方法对 `@TestSetup` 数据的修改或删除会在该方法结束时自动回滚，后续测试方法依然读取到初始干净数据。',
        whyRightOrWrong: '✅ Correct (正确): Each `@isTest` method rolls back to the post-`@TestSetup` savepoint upon completion.',
      },
      {
        id: 'C',
        textEn: '`@TestSetup` can be used alongside `@isTest(SeeAllData=true)` on the same test class.',
        text: '`@TestSetup` 可以与 `@isTest(SeeAllData=true)` 在同一个测试类中同时使用。',
        whyRightOrWrong: '❌ Incorrect (错误): `@TestSetup` cannot be used when `SeeAllData=true` is enabled!',
      },
      {
        id: 'D',
        textEn: '`@TestSetup` methods must accept `List<sObject>` parameters.',
        text: '`@TestSetup` 方法必须接收 `List<sObject>` 参数。',
        whyRightOrWrong: '❌ Incorrect (错误): `@TestSetup` methods take no arguments and return `void`.',
      },
    ],
    correctOptionIds: ['A', 'B'],
    coreTakeaway: '`@TestSetup` runs once per class, rolls back changes after each `@isTest` method, and is incompatible with `SeeAllData=true`.',
    officialDocTopic: 'Using @TestSetup Methods',
  },
  {
    id: 'Q40',
    certLevel: 'PD1',
    stage: 'advanced',
    domain: '安全模型与单元测试 (Security & Testing)',
    examDomain: 'Testing, Debugging & Deployment (20%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'A test method uses 85 SOQL queries to set up complex test data, and then needs to test a service method that executes 40 SOQL queries and enqueues a `@future` call. How should the test method be structured?',
    scenario:
      '某测试方法在准备测试数据阶段已消耗 85 次 SOQL 查询，接下来要测试一个内部执行 40 次 SOQL 并触发 `@future` 异步调用的服务方法。应如何组织测试代码？',
    options: [
      {
        id: 'A',
        textEn: 'Call `Test.startTest()` after data setup, invoke the service method, call `Test.stopTest()`, and write `Assert` statements after `Test.stopTest()`.',
        text: '在准备完数据后调用 `Test.startTest()`，调用被测方法，再调用 `Test.stopTest()`，并在 `Test.stopTest()` 之后编写 `Assert` 断言。',
        whyRightOrWrong: '✅ Correct (正确): `Test.startTest()` grants a separate 100-SOQL governor limit context, and `Test.stopTest()` forces the `@future` method to finish synchronously.',
      },
      {
        id: 'B',
        textEn: 'Write the `Assert` statements before `Test.stopTest()`.',
        text: '在 `Test.stopTest()` 之前编写针对异步结果的 `Assert` 断言。',
        whyRightOrWrong: '❌ Incorrect (错误): Async `@future` calls do not execute until `Test.stopTest()` runs.',
      },
      {
        id: 'C',
        textEn: 'Call `Test.startTest()` twice in the same test method.',
        text: '在同一个测试方法中调用两次 `Test.startTest()`。',
        whyRightOrWrong: '❌ Incorrect (错误): `Test.startTest()` can only be called once per test method.',
      },
      {
        id: 'D',
        textEn: 'Annotate the test with `@isTest(Unlimited=true)`.',
        text: '标注 `@isTest(Unlimited=true)`。',
        whyRightOrWrong: '❌ Incorrect (错误): Annotation does not exist.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: '`Test.startTest()` resets governor limits; `Test.stopTest()` executes async calls synchronously—always assert async results AFTER `Test.stopTest()`.',
    officialDocTopic: 'Using Limits, startTest, and stopTest',
  },
  {
    id: 'Q41',
    certLevel: 'PD1',
    stage: 'advanced',
    domain: '安全模型与单元测试 (Security & Testing)',
    examDomain: 'Testing, Debugging & Deployment (20%)',
    questionType: 'multiple',
    selectCount: 2,
    scenarioEn:
      'Which two code coverage requirements must be satisfied when deploying Apex code to a Production org? (Choose 2 answers)',
    scenario:
      '将 Apex 代码部署到 Production 生产环境时，必须满足哪两项代码覆盖率要求？（请选择 2 项）',
    options: [
      {
        id: 'A',
        textEn: 'At least 75% of all Apex code overall must be covered by unit tests, and all executed tests must pass.',
        text: '组织内所有 Apex 代码的整体平均覆盖率必须达到至少 75%，且所有运行的测试不能失败。',
        whyRightOrWrong: '✅ Correct (正确): 75% overall Apex coverage is mandatory for production deployment.',
      },
      {
        id: 'B',
        textEn: 'Every deployed Apex Trigger must have some (>0%, at least 1%) test coverage.',
        text: '每一个部署的 Apex Trigger 都必须有大于 0%（至少 1%）的测试覆盖率。',
        whyRightOrWrong: '✅ Correct (正确): Even if overall coverage is 95%, a single Trigger with 0% coverage blocks deployment.',
      },
      {
        id: 'C',
        textEn: 'Every individual Apex Class must independently achieve at least 75% code coverage.',
        text: '每一个单独的 Apex Class 都必须各自独立达到 75% 以上的覆盖率。',
        whyRightOrWrong: '❌ Incorrect (错误): An individual class can have <75% coverage as long as the combined org-wide average is >=75%.',
      },
      {
        id: 'D',
        textEn: 'Every LWC component must have 75% Jest test coverage on the server.',
        text: '每个 LWC 组件必须在服务端达到 75% 的 Jest 覆盖率。',
        whyRightOrWrong: '❌ Incorrect (错误): LWC Jest tests are not executed by the Salesforce server during metadata deployment.',
      },
    ],
    correctOptionIds: ['A', 'B'],
    coreTakeaway: 'Production deployment rules: 1) Overall Apex coverage >= 75%; 2) Every Trigger coverage > 0%.',
    officialDocTopic: 'Code Coverage Best Practices',
  },

  // ==================== L14: Integration & Platform Events ====================
  {
    id: 'Q42',
    certLevel: 'PD1',
    stage: 'advanced',
    domain: '异步 Apex 与集成架构 (Async Apex & Integration)',
    examDomain: 'Process Automation & Logic (30%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'A payment processing transaction throws an exception and rolls back all database changes when validation fails. However, compliance requires that an audit error log record MUST still be saved even when the transaction rolls back. How should the developer design this?',
    scenario:
      '某支付事务在校验失败时会抛出异常并回滚所有数据库更改。但合规要求：**即使当前数据库事务发生回滚（Rollback），也必须将错误审计日志持久化保存下来**。应如何设计？',
    options: [
      {
        id: 'A',
        textEn: 'Publish a Platform Event (`Audit_Error__e`) configured with **Publish Immediately** before re-throwing the exception.',
        text: '在抛出异常前，调用 `EventBus.publish()` 发布一个配置为 **Publish Immediately（立即发布）** 的 Platform Event（`Audit_Error__e`）。',
        whyRightOrWrong: '✅ Correct (正确): Platform Events configured with `Publish Immediately` are published outside the database transaction and are NOT rolled back when an exception occurs!',
      },
      {
        id: 'B',
        textEn: 'Insert an `Error_Log__c` custom object record inside the `catch` block before `throw e;`.',
        text: '在 `catch` 块中先 `insert new Error_Log__c(...)`，然后再 `throw e;`。',
        whyRightOrWrong: '❌ Incorrect (错误): Re-throwing the exception rolls back the entire transaction, erasing the inserted `Error_Log__c` record.',
      },
      {
        id: 'C',
        textEn: 'Publish a Platform Event configured with **Publish After Commit**.',
        text: '发布一个配置为 **Publish After Commit（提交后发布）** 的 Platform Event。',
        whyRightOrWrong: '❌ Incorrect (错误): `Publish After Commit` discards the event if the transaction rolls back.',
      },
      {
        id: 'D',
        textEn: 'Enqueue a `@future` or `Queueable` method before throwing the exception.',
        text: '在抛出异常前调用 `@future` 或 `Queueable` 方法记录日志。',
        whyRightOrWrong: '❌ Incorrect (错误): `@future` and `Queueable` jobs are only released to the queue after the transaction commits (Step 18); a rollback cancels them!',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'Only a Platform Event configured with **`Publish Immediately`** survives a transaction rollback! Standard DML, `@future`, `Queueable`, and `Publish After Commit` events are all rolled back.',
    officialDocTopic: 'Platform Event Publish Behavior',
  },
  {
    id: 'Q43',
    certLevel: 'PD1',
    stage: 'advanced',
    domain: '异步 Apex 与集成架构 (Async Apex & Integration)',
    examDomain: 'Process Automation & Logic (30%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'A developer is writing an Apex Trigger to subscribe to a Platform Event named `Order_Fulfilled__e`. Which trigger declaration is valid?',
    scenario:
      '开发者正在编写一个订阅平台事件 `Order_Fulfilled__e` 的 Apex Trigger。以下哪个触发器声明是合法的？',
    options: [
      {
        id: 'A',
        textEn: 'trigger OrderFulfilledTrigger on Order_Fulfilled__e (after insert)',
        text: 'trigger OrderFulfilledTrigger on Order_Fulfilled__e (after insert)',
        whyRightOrWrong: '✅ Correct (正确): Platform Event triggers ONLY support the `after insert` event.',
      },
      {
        id: 'B',
        textEn: 'trigger OrderFulfilledTrigger on Order_Fulfilled__e (before insert, after insert)',
        text: 'trigger OrderFulfilledTrigger on Order_Fulfilled__e (before insert, after insert)',
        whyRightOrWrong: '❌ Incorrect (错误): `before insert` is not supported on Platform Events.',
      },
      {
        id: 'C',
        textEn: 'trigger OrderFulfilledTrigger on Order_Fulfilled__e (after insert, after update)',
        text: 'trigger OrderFulfilledTrigger on Order_Fulfilled__e (after insert, after update)',
        whyRightOrWrong: '❌ Incorrect (错误): Platform Events are immutable and cannot be updated or deleted.',
      },
      {
        id: 'D',
        textEn: 'trigger OrderFulfilledTrigger on Order_Fulfilled__e (before publish)',
        text: 'trigger OrderFulfilledTrigger on Order_Fulfilled__e (before publish)',
        whyRightOrWrong: '❌ Incorrect (错误): `before publish` does not exist.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'Platform Event (`__e`) triggers support ONLY `after insert`!',
    officialDocTopic: 'Subscribe to Platform Events with Apex Triggers',
  },
  {
    id: 'Q44',
    certLevel: 'PD1',
    stage: 'advanced',
    domain: '异步 Apex 与集成架构 (Async Apex & Integration)',
    examDomain: 'User Interface / LWC (25%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'An LWC dashboard component needs to subscribe to a Platform Event channel (`/event/Order_Alert__e`) or Change Data Capture channel (`/data/AccountChangeEvent`) to receive real-time server push updates. Which module should be imported?',
    scenario:
      '某监控大屏 LWC 组件需要订阅服务端的 Platform Event（`/event/Order_Alert__e`）或 Change Data Capture（`/data/AccountChangeEvent`）实时流。应导入哪个官方模块？',
    options: [
      {
        id: 'A',
        textEn: 'import { subscribe, unsubscribe, onError } from \'lightning/empApi\';',
        text: 'import { subscribe, unsubscribe, onError } from \'lightning/empApi\';',
        whyRightOrWrong: '✅ Correct (正确): `lightning/empApi` provides CometD Streaming API access for Platform Events and CDC in LWC.',
      },
      {
        id: 'B',
        textEn: 'import { subscribe } from \'lightning/messageService\';',
        text: 'import { subscribe } from \'lightning/messageService\';',
        whyRightOrWrong: '❌ Incorrect (错误): `lightning/messageService` is for client-side cross-component communication on the same Lightning page.',
      },
      {
        id: 'C',
        textEn: 'import { getRecordNotifyChange } from \'lightning/uiRecordApi\';',
        text: 'import { getRecordNotifyChange } from \'lightning/uiRecordApi\';',
        whyRightOrWrong: '❌ Incorrect (错误): Used for LDS cache invalidation.',
      },
      {
        id: 'D',
        textEn: 'import { connectStream } from \'lightning/streamingApi\';',
        text: 'import { connectStream } from \'lightning/streamingApi\';',
        whyRightOrWrong: '❌ Incorrect (错误): Module does not exist.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'Client-side sibling components use `lightning/messageService` (LMS); subscribing to server-side Platform Events / CDC in LWC uses `lightning/empApi`.',
    officialDocTopic: 'Use empApi in Lightning Web Components',
  },

  // ==================== L15: Architect LDV & Selective SOQL ====================
  {
    id: 'Q45',
    certLevel: 'PD2',
    stage: 'architect',
    domain: 'SOQL & SOSL 数据查询 (Data Query)',
    examDomain: 'Data Management & SOQL (25%)',
    questionType: 'multiple',
    selectCount: 2,
    scenarioEn:
      'An org has 4.5 million `Order_History__c` records. A trigger query throws `System.QueryException: Non-selective query against large object type`. Which two changes will make the query selective? (Choose 2 answers)',
    scenario:
      '某组织中的 `Order_History__c` 对象存有 450 万条记录，Trigger 中的查询抛出 `Non-selective query against large object type`。哪两项优化能使该查询变为高选择性（Selective）查询？（请选择 2 项）',
    options: [
      {
        id: 'A',
        textEn: 'Replace negative operators like `WHERE Status__c != \'Cancelled\'` with positive `WHERE Status__c IN (\'Draft\', \'Confirmed\')` combined with an indexed lookup `Account__c IN :accountIds`.',
        text: '将负向运算符 `!= \'Cancelled\'` 改为正向枚举 `IN (\'Draft\', \'Confirmed\')`，并配合带索引的外键 `Account__c IN :accountIds`。',
        whyRightOrWrong: '✅ Correct (正确): Avoiding `!=` / `NOT IN` and filtering on indexed foreign keys allows the optimizer to use index scans.',
      },
      {
        id: 'B',
        textEn: 'Configure the frequently filtered custom text field `ERP_Reference__c` as an **External ID** (or **Unique**) so Salesforce creates a custom database index.',
        text: '将高频用于精确过滤的文本字段 `ERP_Reference__c` 勾选为 **External ID**（或 **Unique**），使平台自动为其建立自定义索引。',
        whyRightOrWrong: '✅ Correct (正确): Marking a custom field as External ID or Unique automatically indexes it.',
      },
      {
        id: 'C',
        textEn: 'Use a leading wildcard `WHERE Order_Name__c LIKE \'%\' + :keyword + \'%\'`.',
        text: '使用前置通配符 `WHERE Order_Name__c LIKE \'%\' + :keyword + \'%\'`。',
        whyRightOrWrong: '❌ Incorrect (错误): Leading `%` wildcards invalidate indexes and force a full table scan.',
      },
      {
        id: 'D',
        textEn: 'Filter on a non-deterministic cross-object Formula field that references `TODAY()`.',
        text: '在引用了 `TODAY()` 的动态跨对象公式字段上过滤。',
        whyRightOrWrong: '❌ Incorrect (错误): Non-deterministic formula fields cannot be indexed.',
      },
    ],
    correctOptionIds: ['A', 'B'],
    coreTakeaway: 'LDV Selectivity: Filter on indexed fields (`Id`, `Name`, Foreign Keys, Audit Dates, `External ID`/`Unique`) and avoid `!=`, `NOT IN`, `LIKE \'%...\'`, and `= null`.',
    officialDocTopic: 'Make SOQL Queries Selective',
  },
  {
    id: 'Q46',
    certLevel: 'PD2',
    stage: 'architect',
    domain: 'SOQL & SOSL 数据查询 (Data Query)',
    examDomain: 'Data Management & SOQL (25%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'Multiple parallel Batch Apex jobs are inserting child `Order_Item__c` records linked to parent `Account` records, frequently failing with `UNABLE_TO_LOCK_ROW` errors. What architectural change reduces record locking contention?',
    scenario:
      '多个并行 Batch 任务在批量插入关联到父对象 `Account` 的子记录 `Order_Item__c` 时，频繁报 `UNABLE_TO_LOCK_ROW` 行锁冲突。哪项架构优化能显著减少锁争用？',
    options: [
      {
        id: 'A',
        textEn: 'Sort the child records by parent `AccountId` (and `ORDER BY AccountId` in the Batch `start()` query) so records sharing the same parent are grouped into the same batch chunk, and reduce the batch scope size.',
        text: '在查询或 DML 前按父记录 `AccountId` 对子记录排序分组，使同一父客户的记录集中在同一批次，并适当调小 Batch Scope Size。',
        whyRightOrWrong: '✅ Correct (正确): Grouping by `AccountId` prevents multiple parallel batch threads from trying to lock the same parent `Account` simultaneously.',
      },
      {
        id: 'B',
        textEn: 'Increase the Batch Apex scope size from 200 to 2,000.',
        text: '将 Batch Scope Size 从 200 调大到 2,000。',
        whyRightOrWrong: '❌ Incorrect (错误): Larger batches hold locks longer and lock more parents per transaction, worsening contention.',
      },
      {
        id: 'C',
        textEn: 'Convert the Lookup relationship to a Master-Detail relationship.',
        text: '将 Lookup 关系改为 Master-Detail 关系。',
        whyRightOrWrong: '❌ Incorrect (错误): Master-Detail Roll-Up Summary calculations increase parent lock contention.',
      },
      {
        id: 'D',
        textEn: 'Use `without sharing` on the Batch class.',
        text: '在 Batch 类上添加 `without sharing`。',
        whyRightOrWrong: '❌ Incorrect (错误): Database row locks are unrelated to record sharing rules.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'To prevent `UNABLE_TO_LOCK_ROW` when inserting/updating child records: **sort by Parent ID (`AccountId`)** and reduce batch size.',
    officialDocTopic: 'Avoiding Deadlocks and Record Locking Errors',
  },

  // ==================== L16: LWC Jest Unit Testing ====================
  {
    id: 'Q47',
    certLevel: 'PD1',
    stage: 'architect',
    domain: 'LWC 现代前端组件 (Lightning Web Components)',
    examDomain: 'Testing, Debugging & Deployment (20%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'In an LWC Jest test, a developer simulates a button click (`buttonEl.click()`) and immediately asserts `expect(element.shadowRoot.querySelector(\'.msg\').textContent).toBe(\'Saved\')` on the very next line, but the assertion fails because the old text is still rendered. How should this test be fixed?',
    scenario:
      '在 LWC Jest 测试中，开发者调用 `buttonEl.click()` 后立即在下一行断言 `expect(element.shadowRoot.querySelector(\'.msg\').textContent).toBe(\'Saved\')`，但断言失败（读到的仍是旧文本）。应如何修复？',
    options: [
      {
        id: 'A',
        textEn: 'Make the test function `async` and add `await Promise.resolve();` between `buttonEl.click()` and the `expect(...)` assertion.',
        text: '将测试函数声明为 `async`，并在 `buttonEl.click()` 与 `expect(...)` 之间添加 `await Promise.resolve();` 等待异步微任务重绘完成。',
        whyRightOrWrong: '✅ Correct (正确): LWC updates the Shadow DOM asynchronously via the microtask queue; `await Promise.resolve()` flushes pending DOM updates.',
      },
      {
        id: 'B',
        textEn: 'Replace `element.shadowRoot.querySelector` with `document.querySelector`.',
        text: '将 `element.shadowRoot.querySelector` 替换为 `document.querySelector`。',
        whyRightOrWrong: '❌ Incorrect (错误): `document.querySelector` cannot pierce LWC Shadow DOM.',
      },
      {
        id: 'C',
        textEn: 'Call `element.renderedCallback()` manually.',
        text: '手动调用 `element.renderedCallback()`。',
        whyRightOrWrong: '❌ Incorrect (错误): Lifecycle hooks are invoked by the framework, not manually.',
      },
      {
        id: 'D',
        textEn: 'Deploy the Jest test to a Sandbox org.',
        text: '将 Jest 测试部署到 Sandbox 运行。',
        whyRightOrWrong: '❌ Incorrect (错误): Jest runs locally in Node.js.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'In LWC Jest tests, always `await Promise.resolve()` after triggering events or `.emit()` before asserting DOM changes via `element.shadowRoot.querySelector()`.',
    officialDocTopic: 'Write Jest Tests for Lightning Web Components',
  },
  {
    id: 'Q48',
    certLevel: 'PD2',
    stage: 'architect',
    domain: 'LWC 现代前端组件 (Lightning Web Components)',
    examDomain: 'Testing, Debugging & Deployment (20%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'Why is `while (document.body.firstChild) { document.body.removeChild(document.body.firstChild); }` placed inside the `afterEach()` block of an LWC Jest test file?',
    scenario:
      '为什么在 LWC Jest 测试文件的 `afterEach()` 钩子中总是要执行 `while (document.body.firstChild) { document.body.removeChild(document.body.firstChild); }`？',
    options: [
      {
        id: 'A',
        textEn: 'Because all `it()` tests within a single Jest file share the same JSDOM `document` instance; resetting `document.body` prevents DOM state from leaking between tests.',
        text: '因为同一个测试文件内的所有 `it()` 用例共享同一个 JSDOM `document` 实例，清空 `document.body` 可防止前一个测试挂载的组件污染后续测试。',
        whyRightOrWrong: '✅ Correct (正确): Cleaning up `document.body` isolates each test case and triggers `disconnectedCallback()` on unmounted components.',
      },
      {
        id: 'B',
        textEn: 'To avoid exceeding the Salesforce 6 MB governor heap limit.',
        text: '为了防止超出 Salesforce 6MB 堆内存配额。',
        whyRightOrWrong: '❌ Incorrect (错误): Jest runs in local Node.js, not on the Salesforce server.',
      },
      {
        id: 'C',
        textEn: 'To automatically generate `@TestSetup` records.',
        text: '为了自动生成 `@TestSetup` 数据。',
        whyRightOrWrong: '❌ Incorrect (错误): `@TestSetup` is an Apex feature.',
      },
      {
        id: 'D',
        textEn: 'To compile the `.js-meta.xml` file.',
        text: '为了编译 `.js-meta.xml` 文件。',
        whyRightOrWrong: '❌ Incorrect (错误).',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'In Jest, `afterEach()` cleans up `document.body` so tests in the same file do not pollute the shared JSDOM.',
    officialDocTopic: 'Jest Test Teardown and DOM Cleanup',
  },
];
