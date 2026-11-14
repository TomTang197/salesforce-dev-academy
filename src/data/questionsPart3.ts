import { ExamQuestion } from '../types';

export const QUESTIONS_PART_3: ExamQuestion[] = [
  {
    "id": "Q71",
    "certLevel": "PD1",
    "stage": "intermediate",
    "domain": "Apex 核心与面向对象 (Apex & OOP)",
    "examDomain": "Developer Fundamentals (27%)",
    "questionType": "single",
    "selectCount": 1,
    "scenarioEn": "A developer needs to build a generic utility method that accepts an sObject API name (e.g., \"Account\") and a Picklist field API name (e.g., \"Industry\") as String parameters, and dynamically returns all active Picklist values and labels at runtime without hardcoding object references. Which Apex approach is the most governor-limit efficient?",
    "scenario": "开发人员需要构建一个通用工具方法，接收 sObject API 名称（如 `\"Account\"`）和下拉列表字段 API 名称（如 `\"Industry\"`）作为字符串参数，在运行时动态返回所有激活的 Picklist 值与标签，且不硬编码对象引用。哪种 Apex 方案对 Governor Limit 最友好？",
    "options": [
      {
        "id": "A",
        "textEn": "Use Schema.describeSObjects(new List<String>{sObjectName}) to get the DescribeSObjectResult, then access fields.getMap().get(fieldName).getDescribe().getPicklistValues().",
        "text": "使用 Schema.describeSObjects(new List<String>{sObjectName}) 获取 DescribeSObjectResult，然后访问 fields.getMap().get(fieldName).getDescribe().getPicklistValues()。",
        "whyRightOrWrong": "正确（Correct）！相比于调用开销极大的 Schema.getGlobalDescribe()（加载整个 Org 成百上千个对象元数据），Schema.describeSObjects(types) 仅按需解析指定的 sObject，CPU 和堆内存开销极低。"
      },
      {
        "id": "B",
        "textEn": "Query the PicklistValueInfo object using SOQL inside a loop for each field.",
        "text": "在循环中针对每个字段使用 SOQL 查询 PicklistValueInfo 对象。",
        "whyRightOrWrong": "错误（Incorrect）：消耗宝贵的 SOQL 查询配额，且循环内 SOQL 违反 Bulkification 原则。"
      },
      {
        "id": "C",
        "textEn": "Call Schema.getGlobalDescribe().values() and iterate through every sObject and every field until a name match is found.",
        "text": "调用 Schema.getGlobalDescribe().values() 并遍历每个 sObject 和每个字段，直到找到匹配名称。",
        "whyRightOrWrong": "错误（Incorrect）：遍历所有对象的 getGlobalDescribe().values() 并触发全量 Describe 极易在大中型 Org 中直接引爆 10,000ms CPU Time Limit。"
      },
      {
        "id": "D",
        "textEn": "Make a synchronous Tooling API REST callout to /services/data/v60.0/sobjects/Account/describe.",
        "text": "向 /services/data/v60.0/sobjects/Account/describe 发起同步 Tooling API REST Callout。",
        "whyRightOrWrong": "错误（Incorrect）：原生 Schema Describe 无需网络请求即可在内存完成，Callout 既慢又受限于 DML 与 Callout 隔离限制。"
      }
    ],
    "correctOptionIds": [
      "A"
    ],
    "coreTakeaway": "动态获取对象元数据时，优先使用 Schema.describeSObjects(List<String>) 或 Type.forName()，尽量避免在高频路径中调用全量的 Schema.getGlobalDescribe()。",
    "officialDocTopic": "Dynamic Apex: Schema.describeSObjects & Picklist Inspection"
  },
  {
    "id": "Q72",
    "certLevel": "PD1",
    "stage": "intermediate",
    "domain": "Apex 核心与面向对象 (Apex & OOP)",
    "examDomain": "Developer Fundamentals (27%)",
    "questionType": "single",
    "selectCount": 1,
    "scenarioEn": "An architect designs a plugin framework where the class name of a payment processor implementing the IPaymentProcessor interface is stored in a Custom Metadata record (`Processor_Class_Name__c`). How can the Apex service dynamically instantiate the class at runtime?",
    "scenario": "架构师设计了一个插件化框架，实现 `IPaymentProcessor` 接口的支付处理器类名存储在自定义元数据记录（`Processor_Class_Name__c`）中。Apex 服务如何在运行时动态实例化该类？",
    "codeBlock": "public interface IPaymentProcessor {\n    void process(Decimal amount);\n}",
    "options": [
      {
        "id": "A",
        "textEn": "Type t = Type.forName(className); IPaymentProcessor processor = (IPaymentProcessor) t.newInstance();",
        "text": "Type t = Type.forName(className); IPaymentProcessor processor = (IPaymentProcessor) t.newInstance();",
        "whyRightOrWrong": "正确（Correct）！Type.forName(className) 获取类的 Type 引用，调用 t.newInstance() 调用无参构造函数创建实例，再强转为接口类型 IPaymentProcessor，这是 Salesforce 标准依赖注入/策略工厂模式。"
      },
      {
        "id": "B",
        "textEn": "IPaymentProcessor processor = (IPaymentProcessor) Class.newInstance(className);",
        "text": "IPaymentProcessor processor = (IPaymentProcessor) Class.newInstance(className);",
        "whyRightOrWrong": "错误（Incorrect）：Apex 中不存在 Class.newInstance() 方法。"
      },
      {
        "id": "C",
        "textEn": "IPaymentProcessor processor = new DynamicApex(className);",
        "text": "IPaymentProcessor processor = new DynamicApex(className);",
        "whyRightOrWrong": "错误（Incorrect）：Apex 不存在 DynamicApex 类。"
      },
      {
        "id": "D",
        "textEn": "IPaymentProcessor processor = (IPaymentProcessor) Schema.getGlobalDescribe().get(className).newSObject();",
        "text": "IPaymentProcessor processor = (IPaymentProcessor) Schema.getGlobalDescribe().get(className).newSObject();",
        "whyRightOrWrong": "错误（Incorrect）：Schema.getGlobalDescribe() 仅适用于数据库 sObject 表，不能用于自定义 Apex Class。"
      }
    ],
    "correctOptionIds": [
      "A"
    ],
    "coreTakeaway": "Type.forName(className).newInstance() 是 Apex 实现运行时反射实例化、插件模式（Strategy Pattern）与 Mock 解耦的核心 API。",
    "officialDocTopic": "Dynamic Apex: Type.forName() & Runtime Dependency Injection"
  },
  {
    "id": "Q73",
    "certLevel": "PD2",
    "stage": "architect",
    "domain": "SOQL & SOSL 数据查询 (Data Query)",
    "examDomain": "Process Automation & Logic (28%)",
    "questionType": "single",
    "selectCount": 1,
    "scenarioEn": "A developer needs to query Task records where the polymorphic `What` (Related To) field can point to either an Account or an Opportunity. If `What` is an Account, the query should retrieve `Account.AnnualRevenue`; if `What` is an Opportunity, it should retrieve `Opportunity.Amount` and `Opportunity.StageName`. How can this be achieved in a SINGLE SOQL query?",
    "scenario": "开发人员需要查询 `Task` 记录，其中多态关联字段 `What`（Related To）可能指向 `Account` 或 `Opportunity`。如果 `What` 是 `Account`，查询需返回 `Account.AnnualRevenue`；如果 `What` 是 `Opportunity`，需返回 `Opportunity.Amount` 和 `Opportunity.StageName`。如何在**单条 SOQL 查询**中实现？",
    "options": [
      {
        "id": "A",
        "textEn": "Use the TYPEOF clause in SELECT: SELECT Id, Subject, TYPEOF What WHEN Account THEN AnnualRevenue WHEN Opportunity THEN Amount, StageName END FROM Task.",
        "text": "在 SELECT 中使用 TYPEOF 子句：SELECT Id, Subject, TYPEOF What WHEN Account THEN AnnualRevenue WHEN Opportunity THEN Amount, StageName END FROM Task。",
        "whyRightOrWrong": "正确（Correct）！SOQL 的 TYPEOF ... WHEN ... THEN ... END 专门用于多态外键（如 Task.Who、Task.What、Owner），允许根据关联记录的实际对象类型在同一条 SOQL 中选择不同的字段。"
      },
      {
        "id": "B",
        "textEn": "Query What.AnnualRevenue and What.Amount directly in the SELECT clause.",
        "text": "直接在 SELECT 子句中查询 What.AnnualRevenue 和 What.Amount。",
        "whyRightOrWrong": "错误（Incorrect）：多态关系字段（Name 对象引用）默认只暴露 Id、Name、Type 等通用字段，直接点出特定子类型字段会报编译错误。"
      },
      {
        "id": "C",
        "textEn": "Use a SQL LEFT OUTER JOIN on Account and Opportunity tables.",
        "text": "在 Account 和 Opportunity 表上使用 SQL LEFT OUTER JOIN。",
        "whyRightOrWrong": "错误（Incorrect）：SOQL 不支持传统的任意表 LEFT OUTER JOIN 语法。"
      },
      {
        "id": "D",
        "textEn": "Use FIND {Task} IN ALL FIELDS RETURNING Account, Opportunity.",
        "text": "使用 FIND {Task} IN ALL FIELDS RETURNING Account, Opportunity。",
        "whyRightOrWrong": "错误（Incorrect）：这是全文检索 SOSL，无法按 Task 记录多态外键拉取关联父字段。"
      }
    ],
    "correctOptionIds": [
      "A"
    ],
    "coreTakeaway": "针对多态外键（Polymorphic Key 如 WhoId/WhatId/OwnerId），使用 TYPEOF What WHEN ObjectA THEN Field1 WHEN ObjectB THEN Field2 ELSE Name END 即可单次查询不同父对象的专有字段。",
    "officialDocTopic": "SOQL Polymorphic Queries: TYPEOF What WHEN ... THEN ... END"
  },
  {
    "id": "Q74",
    "certLevel": "PD1",
    "stage": "beginner",
    "domain": "SOQL & SOSL 数据查询 (Data Query)",
    "examDomain": "Process Automation & Logic (28%)",
    "questionType": "single",
    "selectCount": 1,
    "scenarioEn": "A custom LWC displays a detail view of a custom `Project__c` record. The business requires that whenever this custom component queries and displays a `Project__c` record, the record should automatically appear in the user's \"Recent Items\" list and update the `LastViewedDate` field. Which SOQL clause achieves this?",
    "scenario": "一个自定义 LWC 显示自定义对象 `Project__c` 的详情视图。业务要求每当该自定义组件查询并显示 `Project__c` 记录时，该记录应自动出现在用户的“最近查看（Recent Items）”列表中并更新 `LastViewedDate` 字段。哪个 SOQL 子句能实现此需求？",
    "options": [
      {
        "id": "A",
        "textEn": "Append FOR VIEW to the SOQL query: [SELECT Id, Name FROM Project__c WHERE Id = :projId FOR VIEW].",
        "text": "在 SOQL 查询末尾添加 FOR VIEW：[SELECT Id, Name FROM Project__c WHERE Id = :projId FOR VIEW]。",
        "whyRightOrWrong": "正确（Correct）！FOR VIEW 会通知 Salesforce 更新当前用户对该记录的 LastViewedDate（并写入 RecentlyViewed 表），使其出现在最近查看列表中。"
      },
      {
        "id": "B",
        "textEn": "Append FOR UPDATE to the SOQL query.",
        "text": "在 SOQL 查询末尾添加 FOR UPDATE。",
        "whyRightOrWrong": "错误（Incorrect）：FOR UPDATE 用于数据库行级悲观锁，不会更新 LastViewedDate。"
      },
      {
        "id": "C",
        "textEn": "Execute an explicit DML update on Project__c.LastViewedDate = System.now().",
        "text": "对 Project__c.LastViewedDate = System.now() 执行显式 DML update。",
        "whyRightOrWrong": "错误（Incorrect）：LastViewedDate 是系统只读审计字段，无法通过 DML 直接修改。"
      },
      {
        "id": "D",
        "textEn": "Append WITH USER_MODE to the SOQL query.",
        "text": "在 SOQL 查询末尾添加 WITH USER_MODE。",
        "whyRightOrWrong": "错误（Incorrect）：WITH USER_MODE 用于安全权限校验，与最近访问记录无关。"
      }
    ],
    "correctOptionIds": [
      "A"
    ],
    "coreTakeaway": "SOQL 尾部子句对比：FOR UPDATE（加行级锁防并发写冲突）、FOR VIEW（更新 LastViewedDate 并加入最近查看列表）、FOR REFERENCE（更新 LastReferencedDate）。",
    "officialDocTopic": "SOQL Clauses: FOR VIEW & FOR REFERENCE"
  },
  {
    "id": "Q75",
    "certLevel": "PD2",
    "stage": "intermediate",
    "domain": "SOQL & SOSL 数据查询 (Data Query)",
    "examDomain": "Process Automation & Logic (28%)",
    "questionType": "single",
    "selectCount": 1,
    "scenarioEn": "Universal Containers has enabled Multi-Currency in their org. Opportunities are recorded in EUR, GBP, JPY, and USD. A developer is building an executive dashboard LWC that needs to display each Opportunity's `Amount` converted into the logged-in user's personal currency, formatted correctly. Which SOQL function should be used?",
    "scenario": "Universal Containers 在其 Org 中启用了多币种（Multi-Currency）。商机以 EUR、GBP、JPY 和 USD 记录。开发人员正在构建高管仪表盘 LWC，需要将每个商机的 `Amount` 转换为当前登录用户的个人币种并正确格式化。应使用哪个 SOQL 函数？",
    "options": [
      {
        "id": "A",
        "textEn": "SELECT Id, Name, FORMAT(convertCurrency(Amount)) convertedAmount FROM Opportunity",
        "text": "SELECT Id, Name, FORMAT(convertCurrency(Amount)) convertedAmount FROM Opportunity",
        "whyRightOrWrong": "正确（Correct）！convertCurrency(Amount) 将金额字段按汇率转换为当前用户的币种数值，外层套上 FORMAT() 可同时返回带币种符号与本地化千分位的格式化字符串。"
      },
      {
        "id": "B",
        "textEn": "SELECT Id, Name, TO_USER_CURRENCY(Amount) FROM Opportunity",
        "text": "SELECT Id, Name, TO_USER_CURRENCY(Amount) FROM Opportunity",
        "whyRightOrWrong": "错误（Incorrect）：SOQL 不存在 TO_USER_CURRENCY() 函数。"
      },
      {
        "id": "C",
        "textEn": "SELECT Id, Name, Amount USING CURRENCY(UserInfo.getDefaultCurrency()) FROM Opportunity",
        "text": "SELECT Id, Name, Amount USING CURRENCY(UserInfo.getDefaultCurrency()) FROM Opportunity",
        "whyRightOrWrong": "错误（Incorrect）：SOQL 中不存在 USING CURRENCY 子句。"
      },
      {
        "id": "D",
        "textEn": "Query the raw Amount field and multiply it by a hardcoded exchange rate in JavaScript.",
        "text": "查询原始 Amount 字段并在 JavaScript 中乘以硬编码汇率。",
        "whyRightOrWrong": "错误（Incorrect）：硬编码汇率违背多币种动态汇率管理原则。"
      }
    ],
    "correctOptionIds": [
      "A"
    ],
    "coreTakeaway": "多币种 Org 中，SOQL SELECT 子句使用 convertCurrency(CurrencyField) 可自动将金额换算为当前查询用户的币种（注意：WHERE 子句过滤条件不能使用 convertCurrency）。",
    "officialDocTopic": "Multi-Currency SOQL: convertCurrency() & FORMAT()"
  },
  {
    "id": "Q76",
    "certLevel": "PD1",
    "stage": "advanced",
    "domain": "Trigger 与执行顺序 (Triggers & Order of Execution)",
    "examDomain": "Process Automation & Logic (28%)",
    "questionType": "single",
    "selectCount": 1,
    "scenarioEn": "An Account record is updated via DML. During the Save Order of Execution, an active Workflow Rule (or Flow after-save field update behavior) performs a cross-field update on the same Account record. What happens to the Account's `before update` and `after update` Apex Triggers?",
    "scenario": "一条 Account 记录通过 DML 被更新。在保存执行顺序（Save Order of Execution）期间，一条激活的 Workflow Rule 字段更新在同一个 Account 记录上执行了字段修改。此时 Account 的 `before update` 和 `after update` Apex Trigger 会发生什么？",
    "options": [
      {
        "id": "A",
        "textEn": "Both before update and after update triggers fire ONE more time (and only once more), while Custom Validation Rules and Escalation Rules are NOT re-evaluated.",
        "text": "before update 和 after update 触发器都会**额外再执行一次**（且仅再执行一次），同时自定义验证规则（Custom Validation Rules）和升级规则**不会**重新评估。",
        "whyRightOrWrong": "正确（Correct）！这是 PD1/PD2 极具杀伤力的必考细节：Workflow 字段更新会导致 before update 和 after update Trigger 重跑一次（共执行 2 次），但在此重跑阶段，System Validation 会执行，而 Custom Validation Rules、Duplicate Rules、Escalation Rules 不会重新执行！"
      },
      {
        "id": "B",
        "textEn": "Only after update triggers fire again, and Custom Validation Rules are re-evaluated.",
        "text": "只有 after update 触发器再次触发，且自定义验证规则会被重新评估。",
        "whyRightOrWrong": "错误（Incorrect）：before 和 after 都会重跑一次，且自定义验证规则不会在 Workflow 字段更新后重新运行。"
      },
      {
        "id": "C",
        "textEn": "Triggers do not fire again unless the recursive flag is reset manually.",
        "text": "触发器不会再次触发，除非手动重置递归标志。",
        "whyRightOrWrong": "错误（Incorrect）：平台会自动再次调用 before/after Trigger（这也是为什么静态 boolean 锁如果写法不当会导致第二次触发被意外跳过的原因）。"
      },
      {
        "id": "D",
        "textEn": "Triggers fire infinitely until the Maximum Trigger Depth (16) limit is reached.",
        "text": "触发器无限循环触发，直到达到最大触发深度（16）限制。",
        "whyRightOrWrong": "错误（Incorrect）：Salesforce 规定 Workflow 字段更新引发的 Trigger 重跑最多只额外执行 1 次。"
      }
    ],
    "correctOptionIds": [
      "A"
    ],
    "coreTakeaway": "牢记：Workflow Field Update 会让 before update 和 after update Trigger 额外重跑 1 次，但不会重新触发 Custom Validation Rules！而 Before-Save Record-Triggered Flow 在 before trigger 之前运行，根本不会引发重跑。",
    "officialDocTopic": "Order of Execution: Workflow Field Update Trigger Re-entry"
  },
  {
    "id": "Q77",
    "certLevel": "PD1",
    "stage": "intermediate",
    "domain": "Trigger 与执行顺序 (Triggers & Order of Execution)",
    "examDomain": "Process Automation & Logic (28%)",
    "questionType": "single",
    "selectCount": 1,
    "scenarioEn": "A developer executes the following statement in an Apex service class: `merge masterAccount duplicateAccount;`. Both `masterAccount` and `duplicateAccount` are `Account` records. Which sequence of Account triggers will fire as a result of the `merge` statement?",
    "scenario": "开发人员在 Apex 服务类中执行以下语句：`merge masterAccount duplicateAccount;`。`masterAccount` 和 `duplicateAccount` 均为 `Account` 记录。该 `merge` 语句会触发哪些 Account Trigger？",
    "options": [
      {
        "id": "A",
        "textEn": "before delete and after delete triggers fire for the losing record (duplicateAccount), and before update and after update triggers fire for the winning record (masterAccount).",
        "text": "针对被合并删除的副记录（duplicateAccount）触发 before delete 和 after delete，针对保留的主记录（masterAccount）触发 before update 和 after update。",
        "whyRightOrWrong": "正确（Correct）！Salesforce 中没有独立的 before/after merge 触发事件。merge 操作本质上是：将从属记录重挂载后，对副记录（losing record）执行 delete 触发器，并对主记录（winning record）执行 update 触发器。此外在 after delete 中可通过 duplicateAccount.MasterRecordId 识别主记录 ID！"
      },
      {
        "id": "B",
        "textEn": "before merge and after merge triggers fire for both records.",
        "text": "针对两条记录触发 before merge 和 after merge 触发器。",
        "whyRightOrWrong": "错误（Incorrect）：Apex Trigger 仅有 7 种事件，不存在 before merge 或 after merge。"
      },
      {
        "id": "C",
        "textEn": "Only before update and after update triggers fire for masterAccount; no delete triggers fire.",
        "text": "仅对 masterAccount 触发 before update 和 after update，不触发 delete 触发器。",
        "whyRightOrWrong": "错误（Incorrect）：副记录会被移入回收站，必然触发 before delete 和 after delete。"
      },
      {
        "id": "D",
        "textEn": "Only after undelete and after update triggers fire.",
        "text": "仅触发 after undelete 和 after update 触发器。",
        "whyRightOrWrong": "错误（Incorrect）：merge 是删除副记录并更新主记录，与 undelete 无关。"
      }
    ],
    "correctOptionIds": [
      "A"
    ],
    "coreTakeaway": "merge 操作会触发副记录（Losing Record）的 before/after delete 触发器（在 after delete 中可读取 MasterRecordId 字段），以及主记录（Winning Record）的 before/after update 触发器。",
    "officialDocTopic": "DML Merge Statement: Losing Delete & Winning Update Triggers"
  },
  {
    "id": "Q78",
    "certLevel": "PD1",
    "stage": "beginner",
    "domain": "Trigger 与执行顺序 (Triggers & Order of Execution)",
    "examDomain": "Process Automation & Logic (28%)",
    "questionType": "single",
    "selectCount": 1,
    "scenarioEn": "A developer is writing a utility method inside an Apex class that may be called either from an Apex Trigger or from an LWC `@AuraEnabled` controller. How can the utility method determine whether the current execution context was invoked directly inside a running Trigger?",
    "scenario": "开发人员正在 Apex 类中编写一个工具方法，该方法既可能被 Apex Trigger 调用，也可能被 LWC `@AuraEnabled` 控制器调用。该工具方法如何判断当前执行上下文是否正处于运行中的 Trigger 内部？",
    "options": [
      {
        "id": "A",
        "textEn": "Check if Trigger.isExecuting is true.",
        "text": "检查 Trigger.isExecuting 是否为 true。",
        "whyRightOrWrong": "正确（Correct）！Trigger.isExecuting 在代码由 Apex Trigger 触发执行时返回 true（无论是在 Trigger 本体还是在 Trigger 调用的 Handler 类方法中），否则返回 false。"
      },
      {
        "id": "B",
        "textEn": "Check if System.isTrigger() is true.",
        "text": "检查 System.isTrigger() 是否为 true。",
        "whyRightOrWrong": "错误（Incorrect）：System 类只有 isBatch()、isFuture()、isQueueable()、isScheduled()，没有 System.isTrigger() 方法。"
      },
      {
        "id": "C",
        "textEn": "Check if Trigger.new.size() > 0 without null checking.",
        "text": "在不做 null 检查的情况下直接判断 Trigger.new.size() > 0。",
        "whyRightOrWrong": "错误（Incorrect）：在非 Trigger 上下文或 delete Trigger 中，Trigger.new 为 null，直接调用 .size() 会抛出 NullPointerException。"
      },
      {
        "id": "D",
        "textEn": "Check if Limits.getTriggerInvocations() > 0.",
        "text": "检查 Limits.getTriggerInvocations() > 0。",
        "whyRightOrWrong": "错误（Incorrect）：Limits 类中不存在 getTriggerInvocations() 方法。"
      }
    ],
    "correctOptionIds": [
      "A"
    ],
    "coreTakeaway": "判断当前是否在 Trigger 上下文中应使用 Trigger.isExecuting；判断异步上下文则使用 System.isBatch()、System.isFuture()、System.isQueueable()、System.isScheduled()。",
    "officialDocTopic": "Trigger Context Variables: Trigger.isExecuting"
  },
  {
    "id": "Q79",
    "certLevel": "PD1",
    "stage": "beginner",
    "domain": "Trigger 与执行顺序 (Triggers & Order of Execution)",
    "examDomain": "Process Automation & Logic (28%)",
    "questionType": "single",
    "selectCount": 1,
    "scenarioEn": "When an `Opportunity` record is restored from the Recycle Bin, which Trigger event is supported and what are the values of `Trigger.new` and `Trigger.old`?",
    "scenario": "当一条 `Opportunity` 记录从回收站（Recycle Bin）恢复时，支持哪种 Trigger 事件？此时 `Trigger.new` 和 `Trigger.old` 的值分别是什么？",
    "options": [
      {
        "id": "A",
        "textEn": "Only after undelete is supported (there is no before undelete). Trigger.new contains the restored records (read-only), and Trigger.old is null.",
        "text": "仅支持 after undelete（不存在 before undelete）。Trigger.new 包含恢复后的记录（只读），而 Trigger.old 为 null。",
        "whyRightOrWrong": "正确（Correct）！因为记录在恢复回数据库前尚处于已删除状态，所以 Salesforce 没有 before undelete 事件，只有 after undelete；且因为恢复前没有旧的活动版本，Trigger.old 为 null，Trigger.new 中的记录为只读（如需修改必须额外查询并执行 update DML）。"
      },
      {
        "id": "B",
        "textEn": "Both before undelete and after undelete are supported; Trigger.new is writable in before undelete.",
        "text": "同时支持 before undelete 和 after undelete；在 before undelete 中 Trigger.new 可写。",
        "whyRightOrWrong": "错误（Incorrect）：Apex 只有 7 种触发器事件，绝对没有 before undelete。"
      },
      {
        "id": "C",
        "textEn": "Only after undelete is supported; both Trigger.new and Trigger.old are populated.",
        "text": "仅支持 after undelete；Trigger.new 和 Trigger.old 均有值。",
        "whyRightOrWrong": "错误（Incorrect）：after undelete 中 Trigger.old 为 null。"
      },
      {
        "id": "D",
        "textEn": "Restoring from the Recycle Bin fires after insert instead of undelete.",
        "text": "从回收站恢复会触发 after insert 而不是 undelete。",
        "whyRightOrWrong": "错误（Incorrect）：从回收站恢复触发的是专门的 after undelete。"
      }
    ],
    "correctOptionIds": [
      "A"
    ],
    "coreTakeaway": "Apex 7 大触发事件：before/after insert、before/after update、before/after delete、以及唯一的 after undelete（无 before undelete，Trigger.old 为 null，Trigger.new 只读）。",
    "officialDocTopic": "Recycle Bin Restoration: after undelete Trigger Context"
  },
  {
    "id": "Q80",
    "certLevel": "PD1",
    "stage": "intermediate",
    "domain": "Trigger 与执行顺序 (Triggers & Order of Execution)",
    "examDomain": "Process Automation & Logic (28%)",
    "questionType": "single",
    "selectCount": 1,
    "scenarioEn": "A developer needs to programmatically convert up to 80 `Lead` records into Accounts, Contacts, and Opportunities inside an Apex service method. Which syntax is Bulkified and governor-limit safe?",
    "scenario": "开发人员需要在 Apex 服务方法中通过代码将最多 80 条 `Lead` 记录批量转换为 Account、Contact 和 Opportunity。哪种语法是批量化（Bulkified）且符合 Governor Limit 安全的？",
    "options": [
      {
        "id": "A",
        "textEn": "Create a List<Database.LeadConvert>, populate each item, and pass the list to Database.convertLead(leadConverts, false) in a single call.",
        "text": "创建 List<Database.LeadConvert>，填充每个元素，并在单次调用中将该列表传给 Database.convertLead(leadConverts, false)。",
        "whyRightOrWrong": "正确（Correct）！Database.convertLead() 支持传入 List<Database.LeadConvert>（单次最多可转换 100 条 Lead），切勿在 for 循环中逐条调用 convertLead。"
      },
      {
        "id": "B",
        "textEn": "Loop through the Lead list and call leadRecord.convert() on each sObject.",
        "text": "遍历 Lead 列表并在每个 sObject 上调用 leadRecord.convert()。",
        "whyRightOrWrong": "错误（Incorrect）：Lead sObject 上没有 .convert() 实例方法，且循环内单条转换会引爆 DML/SOQL 限制。"
      },
      {
        "id": "C",
        "textEn": "Manually insert Accounts, Contacts, and Opportunities, then delete the Lead records.",
        "text": "手动 insert Account、Contact 和 Opportunity，然后 delete Lead 记录。",
        "whyRightOrWrong": "错误（Incorrect）：手动插入并删除 Lead 会丢失系统标准线索转换审计字段（如 ConvertedAccountId、ConvertedContactId、IsConverted）及标准映射。"
      },
      {
        "id": "D",
        "textEn": "Update Lead.IsConverted = true and execute update leads.",
        "text": "设置 Lead.IsConverted = true 并执行 update leads。",
        "whyRightOrWrong": "错误（Incorrect）：IsConverted 不能通过普通 update DML 直接设为 true，必须通过 Database.convertLead API。"
      }
    ],
    "correctOptionIds": [
      "A"
    ],
    "coreTakeaway": "批量转换线索（Lead Conversion）必须使用 List<Database.LeadConvert> 并单次调用 Database.convertLead(listToConvert, allOrNone)，单批支持最多 100 条 Lead。",
    "officialDocTopic": "Bulkified Lead Conversion: Database.convertLead()"
  },
  {
    "id": "Q81",
    "certLevel": "PD1",
    "stage": "beginner",
    "domain": "LWC 现代前端组件 (Lightning Web Components)",
    "examDomain": "User Interface (25%)",
    "questionType": "single",
    "selectCount": 1,
    "scenarioEn": "In modern Lightning Web Components (API v57.0+), what is the recommended way to obtain a direct reference to a specific DOM element in the template without running a CSS selector search across the shadow tree?",
    "scenario": "在现代 Lightning Web Components（API v57.0+）中，无需在整个 Shadow Tree 中运行 CSS 选择器搜索，直接获取模板中特定 DOM 元素引用的推荐方式是什么？",
    "options": [
      {
        "id": "A",
        "textEn": "Add the lwc:ref=\"myInput\" directive to the HTML element and access it in JavaScript via this.refs.myInput.",
        "text": "在 HTML 元素上添加 lwc:ref=\"myInput\" 指令，并在 JavaScript 中通过 this.refs.myInput 访问它。",
        "whyRightOrWrong": "正确（Correct）！lwc:ref 配合 this.refs.<name> 是 Salesforce 现代 LWC 推荐的直接 DOM 引用方式，性能优于 this.template.querySelector() 且不受 class 重命名影响。"
      },
      {
        "id": "B",
        "textEn": "Add id=\"myInput\" and call document.getElementById(\"myInput\").",
        "text": "添加 id=\"myInput\" 并调用 document.getElementById(\"myInput\")。",
        "whyRightOrWrong": "错误（Incorrect）：Shadow DOM 会隔离组件内部节点，且 LWC 编译期会改写元素的 id 属性以保证全局唯一，document.getElementById 无法正常工作。"
      },
      {
        "id": "C",
        "textEn": "Use @wire(CurrentElement, { ref: \"myInput\" }).",
        "text": "使用 @wire(CurrentElement, { ref: \"myInput\" })。",
        "whyRightOrWrong": "错误（Incorrect）：不存在 CurrentElement wire 适配器。"
      },
      {
        "id": "D",
        "textEn": "Use React.useRef(\"myInput\").",
        "text": "使用 React.useRef(\"myInput\")。",
        "whyRightOrWrong": "错误（Incorrect）：这是 React Hook，不是 LWC 标准指令。"
      }
    ],
    "correctOptionIds": [
      "A"
    ],
    "coreTakeaway": "现代 LWC 使用模板指令 lwc:ref=\"xxx\" 与控制器中的 this.refs.xxx 获取 DOM 节点引用；同时使用 lwc:if / lwc:elseif / lwc:else 替代旧版 if:true / if:false。",
    "officialDocTopic": "Modern LWC Template Directives: lwc:ref & this.refs"
  },
  {
    "id": "Q82",
    "certLevel": "PD1",
    "stage": "intermediate",
    "domain": "LWC 现代前端组件 (Lightning Web Components)",
    "examDomain": "User Interface (25%)",
    "questionType": "single",
    "selectCount": 1,
    "scenarioEn": "A developer defines a property in an LWC JavaScript class without any decorator: `filterCriteria = { status: \"Open\", priority: \"High\" };`. In a button click handler, the code executes `this.filterCriteria.status = \"Closed\";`. However, the HTML template binding `{filterCriteria.status}` does NOT re-render. Why, and what are the two valid ways to fix it?",
    "scenario": "开发人员在 LWC JavaScript 类中定义了一个不带任何装饰器的属性：`filterCriteria = { status: \"Open\", priority: \"High\" };`。在按钮点击处理函数中，代码执行了 `this.filterCriteria.status = \"Closed\";`。然而 HTML 模板绑定的 `{filterCriteria.status}` **没有**重新渲染。原因是什么？哪两种方式可以修复？",
    "options": [
      {
        "id": "A",
        "textEn": "Plain properties only observe top-level reassignment. Fix by either adding @track filterCriteria = {...} OR reassigning a new object reference: this.filterCriteria = { ...this.filterCriteria, status: \"Closed\" }.",
        "text": "普通属性仅监听顶层引用重新赋值。可通过添加 @track filterCriteria = {...}，或者重新赋一个新对象引用 `this.filterCriteria = { ...this.filterCriteria, status: \"Closed\" }` 来修复。",
        "whyRightOrWrong": "正确（Correct）！Spring '20 之后，LWC 的普通字段默认具备浅响应式（重新给 this.prop 赋值会触发重绘），但当原地修改对象内部属性（this.obj.prop = x）或数组原地变更（this.arr.push(x)）时，必须使用 @track 装饰器或采用不可变展开语法（Spread Operator `{ ...this.obj }`）创建新引用！"
      },
      {
        "id": "B",
        "textEn": "Add @api to filterCriteria so the component can mutate its own state.",
        "text": "为 filterCriteria 添加 @api 以便组件修改自身状态。",
        "whyRightOrWrong": "错误（Incorrect）：@api 用于暴露公共属性供父组件传值，子组件内部不应重写自身的 @api 属性。"
      },
      {
        "id": "C",
        "textEn": "Call this.forceUpdate() after mutating the property.",
        "text": "修改属性后调用 this.forceUpdate()。",
        "whyRightOrWrong": "错误（Incorrect）：LightningElement 没有 forceUpdate() 方法。"
      },
      {
        "id": "D",
        "textEn": "Wrap the assignment inside renderedCallback().",
        "text": "将赋值操作包裹在 renderedCallback() 中。",
        "whyRightOrWrong": "错误（Incorrect）：renderedCallback 是在重绘后触发的钩子，且在其中修改响应式状态极易引发无限重绘死循环。"
      }
    ],
    "correctOptionIds": [
      "A"
    ],
    "coreTakeaway": "@track 并未被废弃！对于原始类型或直接替换引用的变量无需 @track；但当你需要就地修改对象内部属性（obj.a = 1）或调用数组变异方法（arr.push()）并触发视图更新时，仍需使用 @track 或克隆新对象引用。",
    "officialDocTopic": "LWC Reactivity: @track on Deep Object/Array Mutations"
  },
  {
    "id": "Q83",
    "certLevel": "PD1",
    "stage": "intermediate",
    "domain": "LWC 现代前端组件 (Lightning Web Components)",
    "examDomain": "User Interface (25%)",
    "questionType": "single",
    "selectCount": 1,
    "scenarioEn": "A parent LWC contains several child components. If one of the child components throws an unhandled JavaScript error during its lifecycle hook or event handler, which lifecycle method can the parent component implement to catch the error and render a friendly fallback UI (Error Boundary)?",
    "scenario": "父 LWC 包含多个子组件。如果其中一个子组件在其生命周期钩子或事件处理器中抛出了未捕获的 JavaScript 错误，父组件可以实现哪个生命周期方法来捕获该错误并渲染友好的降级恢复界面（Error Boundary）？",
    "options": [
      {
        "id": "A",
        "textEn": "errorCallback(error, stack)",
        "text": "errorCallback(error, stack)",
        "whyRightOrWrong": "正确（Correct）！errorCallback(error, stack) 是 LWC 专属的错误边界（Error Boundary）生命周期钩子，专门用于捕获后代组件在其生命周期钩子或模板声明式事件处理器中抛出的异常。"
      },
      {
        "id": "B",
        "textEn": "disconnectedCallback(error)",
        "text": "disconnectedCallback(error)",
        "whyRightOrWrong": "错误（Incorrect）：disconnectedCallback 在组件从 DOM 移除时调用，不接收 error 参数，也不是错误边界。"
      },
      {
        "id": "C",
        "textEn": "catchCallback(exception)",
        "text": "catchCallback(exception)",
        "whyRightOrWrong": "错误（Incorrect）：LWC 中不存在 catchCallback 生命周期方法。"
      },
      {
        "id": "D",
        "textEn": "window.onerror inside constructor()",
        "text": "在 constructor() 中绑定 window.onerror",
        "whyRightOrWrong": "错误（Incorrect）：违反 LWC 封装原则且无法精确充当组件树级别的 Error Boundary。"
      }
    ],
    "correctOptionIds": [
      "A"
    ],
    "coreTakeaway": "LWC 共有 5 个核心生命周期钩子：constructor()、connectedCallback()、renderedCallback()、disconnectedCallback()、以及充当子组件错误边界的 errorCallback(error, stack)。",
    "officialDocTopic": "LWC Error Boundary Lifecycle: errorCallback(error, stack)"
  },
  {
    "id": "Q84",
    "certLevel": "PD1",
    "stage": "beginner",
    "domain": "LWC 现代前端组件 (Lightning Web Components)",
    "examDomain": "User Interface (25%)",
    "questionType": "single",
    "selectCount": 1,
    "scenarioEn": "A developer wants to check in an LWC whether the currently logged-in user has been granted a Custom Permission named `Approve_High_Discount`, and also wants to display a translated Custom Label named `Discount_Warning_Msg`. Which scoped `@salesforce` modules should be imported?",
    "scenario": "开发人员希望在 LWC 中检查当前登录用户是否拥有名为 `Approve_High_Discount` 的自定义权限（Custom Permission），并显示名为 `Discount_Warning_Msg` 的多语言自定义标签（Custom Label）。应导入哪些 `@salesforce` 作用域模块？",
    "options": [
      {
        "id": "A",
        "textEn": "import hasApproveDiscount from \"@salesforce/customPermission/Approve_High_Discount\"; and import discountWarning from \"@salesforce/label/c.Discount_Warning_Msg\";",
        "text": "import hasApproveDiscount from \"@salesforce/customPermission/Approve_High_Discount\"; 以及 import discountWarning from \"@salesforce/label/c.Discount_Warning_Msg\";",
        "whyRightOrWrong": "正确（Correct）！@salesforce/customPermission/PermissionName 直接返回布尔值（true/false，若未授权则为 undefined/falsy），@salesforce/label/c.LabelName 直接返回按用户语言翻译好的标签文本，完全无需编写 Apex！"
      },
      {
        "id": "B",
        "textEn": "Write an Apex @AuraEnabled method calling FeatureManagement.checkPermission() and System.Label.",
        "text": "编写调用 FeatureManagement.checkPermission() 和 System.Label 的 Apex @AuraEnabled 方法。",
        "whyRightOrWrong": "错误（Incorrect）：虽然能工作，但发起了不必要的服务端网络请求，违背 LWC 原生模块优先的最佳实践。"
      },
      {
        "id": "C",
        "textEn": "import { getPermission, getLabel } from \"lightning/uiRecordApi\";",
        "text": "import { getPermission, getLabel } from \"lightning/uiRecordApi\";",
        "whyRightOrWrong": "错误（Incorrect）：lightning/uiRecordApi 不包含 getPermission 或 getLabel 方法。"
      },
      {
        "id": "D",
        "textEn": "Access $Permission.Approve_High_Discount and $Label.c.Discount_Warning_Msg directly in the LWC HTML template.",
        "text": "直接在 LWC HTML 模板中访问 $Permission.Approve_High_Discount 和 $Label.c.Discount_Warning_Msg。",
        "whyRightOrWrong": "错误（Incorrect）：$Permission 和 $Label 全局变量是 Visualforce / Aura 的语法，在 LWC 模板中无效，必须通过 ES Module import 导入并绑定到 JS 属性上。"
      }
    ],
    "correctOptionIds": [
      "A"
    ],
    "coreTakeaway": "必背 LWC `@salesforce/*` 静态模块：`@salesforce/schema/Obj.Field`、`@salesforce/label/c.Name`、`@salesforce/resourceUrl/Name`、`@salesforce/customPermission/Name`、`@salesforce/user/Id`。",
    "officialDocTopic": "LWC Scoped Modules: @salesforce/customPermission & @salesforce/label"
  },
  {
    "id": "Q85",
    "certLevel": "PD2",
    "stage": "intermediate",
    "domain": "LWC 现代前端组件 (Lightning Web Components)",
    "examDomain": "User Interface (25%)",
    "questionType": "single",
    "selectCount": 1,
    "scenarioEn": "A third-party analytics and CSS framework requires global CSS styles to penetrate into an LWC and query DOM elements directly from `document.querySelector()` without Shadow DOM encapsulation barriers. How can a developer configure an LWC to render in Light DOM instead of Shadow DOM?",
    "scenario": "第三方分析与 CSS 框架要求全局 CSS 样式能够穿透到 LWC 内部，并直接从 `document.querySelector()` 查询 DOM 元素而不受 Shadow DOM 封装屏障阻挡。开发人员如何将 LWC 配置为在 **Light DOM** 而非 Shadow DOM 中渲染？",
    "options": [
      {
        "id": "A",
        "textEn": "Set static renderMode = \"light\"; in the LWC JavaScript class and add the lwc:render-mode=\"light\" directive to the root <template> tag.",
        "text": "在 LWC JavaScript 类中设置 `static renderMode = \"light\";`，并在根 `<template>` 标签上添加 `lwc:render-mode=\"light\"` 指令。",
        "whyRightOrWrong": "正确（Correct）！在 LWC 中启用 Light DOM 必须同时满足两处声明：JS 类中声明静态属性 `static renderMode = \"light\"`，且 HTML 根模板声明 `<template lwc:render-mode=\"light\">`。注意在 Light DOM 下使用 `this.querySelector()` 而非 `this.template.querySelector()`。"
      },
      {
        "id": "B",
        "textEn": "Set <isShadowDom>false</isShadowDom> in the .js-meta.xml file.",
        "text": "在 .js-meta.xml 文件中设置 `<isShadowDom>false</isShadowDom>`。",
        "whyRightOrWrong": "错误（Incorrect）：.js-meta.xml 中不存在 `<isShadowDom>` 配置标签。"
      },
      {
        "id": "C",
        "textEn": "Pass { mode: \"open\" } to super() in the component constructor.",
        "text": "在组件 constructor 中向 super() 传递 `{ mode: \"open\" }`。",
        "whyRightOrWrong": "错误（Incorrect）：LWC 的 Shadow DOM 默认就是 open mode，但这仍然是 Shadow DOM 而非 Light DOM。"
      },
      {
        "id": "D",
        "textEn": "Import LightElement instead of LightningElement from \"lwc\".",
        "text": "从 \"lwc\" 导入 LightElement 代替 LightningElement。",
        "whyRightOrWrong": "错误（Incorrect）：lwc 模块中不存在 LightElement。"
      }
    ],
    "correctOptionIds": [
      "A"
    ],
    "coreTakeaway": "启用 LWC Light DOM：JS 类加 `static renderMode = \"light\";` + HTML 根标签加 `<template lwc:render-mode=\"light\">`，此时查询内部节点用 `this.querySelector()`（此时 this.template 为 null）。",
    "officialDocTopic": "LWC Light DOM Configuration: static renderMode = \"light\""
  },
  {
    "id": "Q86",
    "certLevel": "PD1",
    "stage": "intermediate",
    "domain": "LWC 现代前端组件 (Lightning Web Components)",
    "examDomain": "User Interface (25%)",
    "questionType": "single",
    "selectCount": 1,
    "scenarioEn": "A developer is embedding a custom LWC inside a Screen Flow (`lightning__FlowScreen`). When the user clicks a custom \"Approve & Continue\" button inside the LWC, the component needs to update an output property `@api approvalCode` and automatically advance the Screen Flow to the next screen. Which module and events should be used?",
    "scenario": "开发人员将一个自定义 LWC 嵌入到屏幕流（Screen Flow，`lightning__FlowScreen`）中。当用户点击 LWC 内部的自定义“批准并继续”按钮时，组件需要更新输出属性 `@api approvalCode` 并自动推动 Screen Flow 进入下一个屏幕。应使用哪个模块和哪些事件？",
    "options": [
      {
        "id": "A",
        "textEn": "Import FlowAttributeChangeEvent and FlowNavigationNextEvent from \"lightning/flowSupport\" and dispatch both events via this.dispatchEvent().",
        "text": "从 \"lightning/flowSupport\" 导入 FlowAttributeChangeEvent 和 FlowNavigationNextEvent，并通过 this.dispatchEvent() 派发这两个事件。",
        "whyRightOrWrong": "正确（Correct）！在 Flow Screen 中，LWC 修改传回给 Flow 的属性必须派发 `new FlowAttributeChangeEvent(\"approvalCode\", val)`，触发跳到下一步/上一步/完成则需派发 `new FlowNavigationNextEvent()`（可先检查 `@api availableActions.includes(\"NEXT\")`）。"
      },
      {
        "id": "B",
        "textEn": "Use NavigationMixin.Navigate with type: \"standard__flowNext\".",
        "text": "使用带 type: \"standard__flowNext\" 的 NavigationMixin.Navigate。",
        "whyRightOrWrong": "错误（Incorrect）：NavigationMixin 用于页面路由跳转，无法控制 Flow 采访引擎内部的上下步流转。"
      },
      {
        "id": "C",
        "textEn": "Publish a message on Lightning Message Service to the Flow runtime channel.",
        "text": "通过 Lightning Message Service 向 Flow 运行时频道发布消息。",
        "whyRightOrWrong": "错误（Incorrect）：Flow 屏幕流转使用专用的 lightning/flowSupport 事件，而非 LMS。"
      },
      {
        "id": "D",
        "textEn": "Call window.history.forward().",
        "text": "调用 window.history.forward()。",
        "whyRightOrWrong": "错误（Incorrect）：Flow 屏幕在同一 URL 内渲染，浏览器历史前进无法驱动 Flow 引擎。"
      }
    ],
    "correctOptionIds": [
      "A"
    ],
    "coreTakeaway": "LWC 与 Screen Flow 交互必考模块：`lightning/flowSupport`，提供 `FlowAttributeChangeEvent`（回传变量值给 Flow）与 `FlowNavigationNextEvent` / `FlowNavigationFinishEvent`（控制流转步骤）。",
    "officialDocTopic": "LWC in Screen Flows: lightning/flowSupport Events"
  },
  {
    "id": "Q87",
    "certLevel": "PD1",
    "stage": "intermediate",
    "domain": "LWC 现代前端组件 (Lightning Web Components)",
    "examDomain": "User Interface (25%)",
    "questionType": "single",
    "selectCount": 1,
    "scenarioEn": "Can an Aura Component contain a Lightning Web Component (LWC), and can an LWC contain an Aura Component as a child in its template?",
    "scenario": "Aura 组件可以包含 Lightning Web Component (LWC) 吗？反过来，LWC 可以在其模板中包含 Aura 组件作为子组件吗？",
    "options": [
      {
        "id": "A",
        "textEn": "An Aura component CAN contain an LWC, but an LWC CANNOT contain an Aura component.",
        "text": "Aura 组件**可以**包含 LWC，但 LWC **不能**包含 Aura 组件。",
        "whyRightOrWrong": "正确（Correct）！因为 LWC 是更底层、更现代的 Web 标准组件，外层旧框架（Aura）可以向下包裹内层新组件（LWC）；但内层 LWC 绝对不能反过来依赖或包裹外层重量级的 Aura 组件。这也是渐进式重构需“从叶子节点向根节点（Bottom-up）”迁移的原因！"
      },
      {
        "id": "B",
        "textEn": "An LWC CAN contain an Aura component, but an Aura component CANNOT contain an LWC.",
        "text": "LWC 可以包含 Aura 组件，但 Aura 组件不能包含 LWC。",
        "whyRightOrWrong": "错误（Incorrect）：恰好说反了。"
      },
      {
        "id": "C",
        "textEn": "Both can contain each other freely in any hierarchy.",
        "text": "两者可以在任意层级互相自由包含。",
        "whyRightOrWrong": "错误（Incorrect）：LWC 严禁包含 Aura 组件。"
      },
      {
        "id": "D",
        "textEn": "Neither can contain the other; they can only communicate via LMS as sibling components on a FlexiPage.",
        "text": "两者互不能包含；它们只能作为 FlexiPage 上的同级组件通过 LMS 通信。",
        "whyRightOrWrong": "错误（Incorrect）：Aura 完全可以在标记中直接写 `<c:myLwcComponent />` 包含 LWC。"
      }
    ],
    "correctOptionIds": [
      "A"
    ],
    "coreTakeaway": "组件嵌套铁律：Aura 可以包含 LWC（`<c:myLwc />`），但 LWC 绝不能包含 Aura！因此将旧 Aura 页面迁移到 LWC 时，应遵循自底向上（从最内层子组件开始迁移）的策略。",
    "officialDocTopic": "Component Interoperability: Aura vs LWC Containment Hierarchy"
  },
  {
    "id": "Q88",
    "certLevel": "PD1",
    "stage": "intermediate",
    "domain": "Apex 核心与面向对象 (Apex & OOP)",
    "examDomain": "Developer Fundamentals (27%)",
    "questionType": "multiple",
    "selectCount": 2,
    "scenarioEn": "A legacy Visualforce page with a custom Apex controller is throwing a `Maximum view state size limit (170KB) exceeded` error when displaying a large read-only report of 2,000 wrapper objects and a temporarily uploaded `Blob` file attachment. Which two techniques reduce the Visualforce View State size?",
    "scenario": "一个带有自定义 Apex 控制器的遗留 Visualforce 页面在显示包含 2,000 个 Wrapper 对象的只读大型报表以及一个临时上传的 `Blob` 文件附件时，抛出了 `Maximum view state size limit (170KB) exceeded` 错误。哪两种技术可以减小 Visualforce 的视图状态（View State）体积？（选择两项）",
    "options": [
      {
        "id": "A",
        "textEn": "Mark controller variables that do not need to persist across postbacks (such as the Blob body or read-only report lists) with the transient keyword.",
        "text": "使用 `transient` 关键字修饰不需要在页面回传（Postback）之间保持状态的控制器变量（例如 Blob 文件体或只读报表列表）。",
        "whyRightOrWrong": "正确（Correct）！transient 关键字修饰的成员变量不会被序列化进 Visualforce 加密的隐藏域 View State 中，立竿见影消除大体积内存占用。"
      },
      {
        "id": "B",
        "textEn": "Use ApexPages.StandardSetController for pagination instead of storing all 2,000 records in a controller list property.",
        "text": "使用 `ApexPages.StandardSetController` 进行服务端分页，而不是将全部 2,000 条记录保存在控制器的 List 属性中。",
        "whyRightOrWrong": "正确（Correct）！StandardSetController 在服务端游标分页（最高支持 10,000 条记录），每次仅向页面传输当前页（如 20 条）记录，大幅降低 View State 大小。"
      },
      {
        "id": "C",
        "textEn": "Change the controller class from with sharing to without sharing.",
        "text": "将控制器类从 with sharing 改为 without sharing。",
        "whyRightOrWrong": "错误（Incorrect）：共享模式仅影响数据可见性，不减小序列化后的 View State 体积。"
      },
      {
        "id": "D",
        "textEn": "Add additional <apex:form> tags on the Visualforce page for each section.",
        "text": "在 Visualforce 页面上为每个部分添加额外的 `<apex:form>` 标签。",
        "whyRightOrWrong": "错误（Incorrect）：每个 `<apex:form>` 都会生成一份 View State 拷贝，多个 `<apex:form>` 反而会让 View State 体积成倍膨胀！"
      }
    ],
    "correctOptionIds": [
      "A",
      "B"
    ],
    "coreTakeaway": "Visualforce View State（上限 170KB）优化四大法宝：1. 使用 `transient` 关键字；2. 使用 `StandardSetController` 分页；3. 合并为单个 `<apex:form>`（甚至用 `<apex:actionRegion>` 或 JavaScript Remoting `@RemoteAction` 无状态调用）；4. 及时将无需保留的集合置为 null。",
    "officialDocTopic": "Visualforce Performance: View State Limit (170KB) & transient Keyword"
  },
  {
    "id": "Q89",
    "certLevel": "PD2",
    "stage": "intermediate",
    "domain": "LWC 现代前端组件 (Lightning Web Components)",
    "examDomain": "User Interface (25%)",
    "questionType": "single",
    "selectCount": 1,
    "scenarioEn": "A company has an existing complex Visualforce page that cannot be fully migrated yet, but the team wants to embed a newly built LWC (`c:orderSummaryLwc`) inside that Visualforce page. Which technology allows rendering an LWC inside a Visualforce page?",
    "scenario": "一家公司有一个现有的复杂 Visualforce 页面尚无法完全迁移，但团队希望在该 Visualforce 页面内部嵌入一个新开发的 LWC（`c:orderSummaryLwc`）。哪种技术允许在 Visualforce 页面内渲染 LWC？",
    "options": [
      {
        "id": "A",
        "textEn": "Use Lightning Out: include <apex:includeLightning />, create a standalone Aura dependency app (extends=\"ltng:outApp\"), and call $Lightning.use() and $Lightning.createComponent(\"c:orderSummaryLwc\", ...).",
        "text": "使用 Lightning Out：引入 `<apex:includeLightning />`，创建一个独立的 Aura 依赖应用（`extends=\"ltng:outApp\"`），并调用 `$Lightning.use()` 和 `$Lightning.createComponent(\"c:orderSummaryLwc\", ...)`。",
        "whyRightOrWrong": "正确（Correct）！在 Visualforce 或外部网站中挂载 LWC 的标准技术是 Lightning Out（`<apex:includeLightning />` + `ltng:outApp` + `$Lightning.use()` + `$Lightning.createComponent()`）。"
      },
      {
        "id": "B",
        "textEn": "Directly place the <c-order-summary-lwc> HTML tag inside the Visualforce <apex:page>.",
        "text": "直接在 Visualforce `<apex:page>` 内部放置 `<c-order-summary-lwc>` HTML 标签。",
        "whyRightOrWrong": "错误（Incorrect）：Visualforce 服务端编译器不识别 LWC 自定义元素标签，必须通过 Lightning Out JS 引导加载。"
      },
      {
        "id": "C",
        "textEn": "Use <apex:includeLwc componentName=\"orderSummaryLwc\" />.",
        "text": "使用 `<apex:includeLwc componentName=\"orderSummaryLwc\" />`。",
        "whyRightOrWrong": "错误（Incorrect）：Visualforce 不存在 `<apex:includeLwc>` 标签，只有 `<apex:includeLightning />`。"
      },
      {
        "id": "D",
        "textEn": "Import the Visualforce page into the LWC .js-meta.xml target list.",
        "text": "将 Visualforce 页面导入到 LWC 的 .js-meta.xml target 列表中。",
        "whyRightOrWrong": "错误（Incorrect）：.js-meta.xml 中没有 Visualforce 页面内嵌的 target，必须通过 Lightning Out。"
      }
    ],
    "correctOptionIds": [
      "A"
    ],
    "coreTakeaway": "在 Visualforce 页面中嵌入 LWC 的标准三步曲（Lightning Out）：1. 创建 `extends=\"ltng:outApp\"` 的 Aura App 声明 `<aura:dependency resource=\"c:myLwc\"/>`；2. VF 页面引入 `<apex:includeLightning />`；3. JS 调用 `$Lightning.use()` 和 `$Lightning.createComponent()`。",
    "officialDocTopic": "Visualforce Interop: Lightning Out ($Lightning.use)"
  },
  {
    "id": "Q90",
    "certLevel": "PD1",
    "stage": "beginner",
    "domain": "LWC 现代前端组件 (Lightning Web Components)",
    "examDomain": "User Interface (25%)",
    "questionType": "single",
    "selectCount": 1,
    "scenarioEn": "Instead of using a legacy browser `window.confirm()` or building a custom CSS backdrop modal from scratch, which modern standard LWC base class (introduced in Winter '23) should a developer extend to create an accessible, SLDS-compliant modal dialog and open it via `.open()`?",
    "scenario": "为了替代遗留的浏览器原生 `window.confirm()` 或从零手写自定义 CSS 遮罩弹窗，开发人员应该继承哪个现代标准 LWC 基类（Winter '23 引入）来创建符合无障碍规范与 SLDS 标准的模态对话框，并通过 `.open()` 打开它？",
    "options": [
      {
        "id": "A",
        "textEn": "Extend LightningModal imported from \"lightning/modal\", using <lightning-modal-header>, <lightning-modal-body>, and <lightning-modal-footer>, and invoke MyModal.open({ size: \"medium\" }).",
        "text": "继承从 `\"lightning/modal\"` 导入的 `LightningModal`，配合 `<lightning-modal-header>`、`<lightning-modal-body>` 和 `<lightning-modal-footer>`，并通过 `MyModal.open({ size: \"medium\" })` 调用。",
        "whyRightOrWrong": "正确（Correct）！LightningModal 是官方原生提供的模态框基类，自动处理焦点锁定（Focus Trap）、ESC 关闭、遮罩层与 Promise 返回值（this.close(result)）。同样还有 LightningAlert、LightningConfirm、LightningPrompt。"
      },
      {
        "id": "B",
        "textEn": "Extend LightningDialog from \"lightning/dialog\".",
        "text": "继承来自 `\"lightning/dialog\"` 的 `LightningDialog`。",
        "whyRightOrWrong": "错误（Incorrect）：模块名和类名均为 `lightning/modal` 和 `LightningModal`。"
      },
      {
        "id": "C",
        "textEn": "Call window.alert() and window.prompt() directly.",
        "text": "直接调用 `window.alert()` 和 `window.prompt()`。",
        "whyRightOrWrong": "错误（Incorrect）：跨域 iframe 沙箱及现代浏览器正在逐步限制原生阻塞弹窗，Salesforce 官方要求使用 LightningAlert / LightningConfirm / LightningPrompt / LightningModal。"
      },
      {
        "id": "D",
        "textEn": "Dispatch a ShowModalEvent from \"lightning/platformShowToastEvent\".",
        "text": "从 `\"lightning/platformShowToastEvent\"` 派发 `ShowModalEvent`。",
        "whyRightOrWrong": "错误（Incorrect）：platformShowToastEvent 仅提供顶部提示条 ShowToastEvent，不提供模态框。"
      }
    ],
    "correctOptionIds": [
      "A"
    ],
    "coreTakeaway": "现代 LWC 原生弹窗四件套：`LightningAlert.open()`、`LightningConfirm.open()`、`LightningPrompt.open()`，以及自定义复杂弹窗继承 `LightningModal`（`from \"lightning/modal\"`）。",
    "officialDocTopic": "Modern LWC Overlays: LightningModal (lightning/modal)"
  },
  {
    "id": "Q91",
    "certLevel": "PD1",
    "stage": "advanced",
    "domain": "异步 Apex 与集成架构 (Async Apex & Integration)",
    "examDomain": "Process Automation & Logic (28%)",
    "questionType": "single",
    "selectCount": 1,
    "scenarioEn": "How many Queueable jobs can be added to the queue using `System.enqueueJob()` inside a single synchronous transaction versus inside an asynchronous transaction (such as inside a `Batchable.execute()` or `Queueable.execute()` method)?",
    "scenario": "在单次**同步（Synchronous）**事务中，对比在单次**异步（Asynchronous，例如在 `Batchable.execute()` 或 `Queueable.execute()` 方法内部）**事务中，使用 `System.enqueueJob()` 分别最多可以将多少个 Queueable 任务加入队列？",
    "options": [
      {
        "id": "A",
        "textEn": "Up to 50 jobs in a synchronous transaction, and ONLY 1 job in an asynchronous transaction (such as chaining inside Queueable.execute or Batchable.execute).",
        "text": "在同步事务中最多 **50** 个任务，而在异步事务中（如在 Queueable.execute 或 Batchable.execute 内部链式调用）**仅限 1 个**任务！",
        "whyRightOrWrong": "正确（Correct）！这是 PD1/PD2 必考的经典配额对比题：同步上下文 `Limits.getLimitQueueableJobs()` 为 50，但一旦进入异步上下文（Batch、Queueable、Scheduled），单次事务最多只能调用 1 次 `System.enqueueJob()`（调用第 2 次会立即抛出 `System.LimitException: Too many queueable jobs added to the queue: 2`）。"
      },
      {
        "id": "B",
        "textEn": "Up to 50 jobs in a synchronous transaction, and up to 100 jobs in an asynchronous transaction.",
        "text": "同步事务中最多 50 个，异步事务中最多 100 个。",
        "whyRightOrWrong": "错误（Incorrect）：虽然异步事务的 SOQL/CPU 配额比同步高，但为防止无限指数级派生子任务炸毁队列，异步上下文中 enqueueJob 的上限被严格收紧为 1！"
      },
      {
        "id": "C",
        "textEn": "Up to 10 jobs in both synchronous and asynchronous transactions.",
        "text": "同步和异步事务中均最多 10 个。",
        "whyRightOrWrong": "错误（Incorrect）：同步为 50，异步为 1。"
      },
      {
        "id": "D",
        "textEn": "Up to 5 jobs in synchronous and 5 jobs in asynchronous (same as active Batch jobs).",
        "text": "同步 5 个，异步 5 个（与活动 Batch 任务上限相同）。",
        "whyRightOrWrong": "错误（Incorrect）：5 是并发 FlexQueue 活动执行中的 Batch 数量上限，不是 enqueueJob 限制。"
      }
    ],
    "correctOptionIds": [
      "A"
    ],
    "coreTakeaway": "极其经典的反直觉 Governor Limit：大多数配额（SOQL、CPU、Heap）都是异步高于同步，唯独 `System.enqueueJob()` 在同步事务中上限是 **50 次**，而在异步事务（Batch/Queueable）中上限只有 **1 次**！",
    "officialDocTopic": "Async Apex Governor Limits: System.enqueueJob (50 Sync vs 1 Async)"
  },
  {
    "id": "Q92",
    "certLevel": "PD2",
    "stage": "architect",
    "domain": "异步 Apex 与集成架构 (Async Apex & Integration)",
    "examDomain": "Process Automation & Logic (28%)",
    "questionType": "single",
    "selectCount": 1,
    "scenarioEn": "A nightly `Database.Batchable` class processes 2 million financial records. Occasionally, a chunk fails with an unhandled limit exception (such as `System.LimitException: Apex CPU time limit exceeded`), which cannot be caught by a standard `try-catch` block inside `execute()`. How can the architect declaratively or programmatically capture the exact failed record IDs and exception details of any failed batch chunk?",
    "scenario": "一个夜间运行的 `Database.Batchable` 类处理 200 万条财务记录。偶尔某个分片（Chunk）会因未捕获的限制异常（例如 `System.LimitException: Apex CPU time limit exceeded`，无法被 `execute()` 内的常规 `try-catch` 捕获）而失败。架构师如何捕获任何失败批次分片的确切记录 ID 列表和异常详情？",
    "options": [
      {
        "id": "A",
        "textEn": "Implement the Database.RaisesPlatformEvents marker interface on the Batch class and subscribe to the standard BatchApexErrorEvent platform event via an Apex trigger or Flow.",
        "text": "在 Batch 类上实现 `Database.RaisesPlatformEvents` 标记接口，并通过 Apex 触发器或 Flow 订阅标准平台事件 `BatchApexErrorEvent`。",
        "whyRightOrWrong": "正确（Correct）！当 Batch 类实现 `Database.RaisesPlatformEvents` 后，任何分片即使因不可捕获的 LimitException 崩溃，平台也会自动发布 `BatchApexErrorEvent` 事件，其中包含 `JobScope`（失败分片的记录 ID 列表）、`ExceptionType`、`Message` 和 `StackTrace`！"
      },
      {
        "id": "B",
        "textEn": "Wrap the code inside execute() with try { ... } catch (System.LimitException e) { ... }.",
        "text": "在 execute() 内部使用 `try { ... } catch (System.LimitException e) { ... }` 捕获。",
        "whyRightOrWrong": "错误（Incorrect）：Salesforce 铁律——`System.LimitException` 是绝对无法被 `try-catch` 捕获的！"
      },
      {
        "id": "C",
        "textEn": "Query the failed record IDs from AsyncApexJob.FailedRecordIds__c in the finish() method.",
        "text": "在 finish() 方法中从 `AsyncApexJob.FailedRecordIds__c` 查询失败的记录 ID。",
        "whyRightOrWrong": "错误（Incorrect）：AsyncApexJob 仅记录 NumberOfErrors（失败批次计数）和 ExtendedStatus（首个报错摘要），不存储具体失败记录 ID。"
      },
      {
        "id": "D",
        "textEn": "Use @future(callout=true) inside the finish() method to read the debug logs.",
        "text": "在 finish() 方法中使用 `@future(callout=true)` 读取调试日志。",
        "whyRightOrWrong": "错误（Incorrect）：既繁琐又不可靠，生产环境通常不会全天候开启全量 Debug Log。"
      }
    ],
    "correctOptionIds": [
      "A"
    ],
    "coreTakeaway": "监控 Batch Apex 未捕获异常（含 LimitException）的架构级方案：Batch 类实现 `Database.RaisesPlatformEvents` 接口 + 编写 `trigger on BatchApexErrorEvent (after insert)` 读取 `JobScope` 与 `StackTrace`。",
    "officialDocTopic": "Batch Apex Error Monitoring: Database.RaisesPlatformEvents & BatchApexErrorEvent"
  },
  {
    "id": "Q93",
    "certLevel": "PD1",
    "stage": "intermediate",
    "domain": "异步 Apex 与集成架构 (Async Apex & Integration)",
    "examDomain": "Process Automation & Logic (28%)",
    "questionType": "single",
    "selectCount": 1,
    "scenarioEn": "Universal Containers wants to synchronize changes made to `Account` and `Contact` records in real time to an external ERP system, AND also wants an internal asynchronous Apex trigger to run in its own transaction whenever specific fields on `Account` change, without slowing down the user's synchronous save time. Which Salesforce event-driven feature automatically publishes change payloads containing `ChangeEventHeader` (such as `changeType`, `changedFields`, and `recordIds`) upon database DML?",
    "scenario": "Universal Containers 希望将对 `Account` 和 `Contact` 记录所做的更改实时同步到外部 ERP 系统，**并且**希望当 `Account` 上的特定字段发生变化时，在独立事务中运行内部异步 Apex 触发器，而不拖慢用户的同步保存响应时间。哪个 Salesforce 事件驱动功能会在数据库发生 DML 时自动发布包含 `ChangeEventHeader`（如 `changeType`、`changedFields` 和 `recordIds`）的变更载荷？",
    "options": [
      {
        "id": "A",
        "textEn": "Change Data Capture (CDC), subscribing to AccountChangeEvent / ContactChangeEvent via Pub/Sub API externally and an after insert Apex trigger internally.",
        "text": "变更数据捕获（Change Data Capture, CDC），外部通过 Pub/Sub API 订阅，内部通过针对 `AccountChangeEvent` 的 `after insert` Apex 触发器（Async Trigger）处理。",
        "whyRightOrWrong": "正确（Correct）！CDC 启用后无需手动编写 EventBus.publish()，任何 Create/Update/Delete/Undelete 都会在事务提交后自动生成 `<Object>ChangeEvent`（标准对象）或 `<Custom>__ChangeEvent`（自定义对象），其 `after insert` 触发器天然在独立的异步事务中运行！"
      },
      {
        "id": "B",
        "textEn": "Outbound Messaging in Workflow Rules.",
        "text": "工作流规则中的出站消息（Outbound Messaging）。",
        "whyRightOrWrong": "错误（Incorrect）：Outbound Messaging 是旧版 SOAP XML 推送，不支持内部 Async Apex Trigger，也不提供 changedFields 差异头。"
      },
      {
        "id": "C",
        "textEn": "Apex Synchronous before update triggers with HTTP Callouts.",
        "text": "带有 HTTP Callout 的 Apex 同步 before update 触发器。",
        "whyRightOrWrong": "错误（Incorrect）：Trigger 中不能直接发起同步 HTTP Callout。"
      },
      {
        "id": "D",
        "textEn": "Apex Batchable scheduled every 24 hours.",
        "text": "每 24 小时调度一次的 Apex Batchable。",
        "whyRightOrWrong": "错误（Incorrect）：T+1 批处理无法满足实时（Real-time）同步需求。"
      }
    ],
    "correctOptionIds": [
      "A"
    ],
    "coreTakeaway": "CDC (`<Object>ChangeEvent`) vs Platform Events (`__e`)：CDC 由数据库 DML 自动生成，自带 `ChangeEventHeader`（含 `changeType`、`changedFields`、`recordIds`），其 `after insert` 触发器被称为“异步触发器（Async Trigger）”，适合将耗时后置逻辑从主保存事务中剥离！",
    "officialDocTopic": "Event-Driven Architecture: Change Data Capture (CDC) & Async Triggers"
  },
  {
    "id": "Q94",
    "certLevel": "PD1",
    "stage": "intermediate",
    "domain": "异步 Apex 与集成架构 (Async Apex & Integration)",
    "examDomain": "Process Automation & Logic (28%)",
    "questionType": "single",
    "selectCount": 1,
    "scenarioEn": "A developer generated an Apex proxy class from an external enterprise WSDL using `WSDL2Apex` (which uses `WebServiceCallout.invoke` under the hood). When writing an `@IsTest` unit test for this SOAP callout, which mock interface and test method must be used?",
    "scenario": "开发人员使用 `WSDL2Apex` 从外部企业 WSDL 生成了一个 Apex 代理类（底层使用 `WebServiceCallout.invoke`）。在为该 SOAP Callout 编写 `@IsTest` 单元测试时，必须使用哪个 Mock 接口和测试方法？",
    "options": [
      {
        "id": "A",
        "textEn": "Implement the WebServiceMock interface (doInvoke method) and register it via Test.setMock(WebServiceMock.class, new MySoapMock()).",
        "text": "实现 `WebServiceMock` 接口（`doInvoke` 方法），并通过 `Test.setMock(WebServiceMock.class, new MySoapMock())` 注册。",
        "whyRightOrWrong": "正确（Correct）！区分两种 Callout Mock：REST `Http.send()` 使用 `HttpCalloutMock`（实现 `respond(req)`）；而 SOAP `WSDL2Apex`（`WebServiceCallout.invoke`）必须使用 `WebServiceMock`（实现 `doInvoke(...)` 并将模拟响应塞入 `Map<String, Object> response` map 中）！"
      },
      {
        "id": "B",
        "textEn": "Implement the HttpCalloutMock interface (respond method).",
        "text": "实现 `HttpCalloutMock` 接口（`respond` 方法）。",
        "whyRightOrWrong": "错误（Incorrect）：HttpCalloutMock 仅拦截 Http.send()，无法拦截 WSDL2Apex 的 WebServiceCallout.invoke()。"
      },
      {
        "id": "C",
        "textEn": "Annotate the test with @IsTest(SeeAllData=true) to allow live SOAP callouts.",
        "text": "使用 `@IsTest(SeeAllData=true)` 注解测试以允许真实 SOAP Callout。",
        "whyRightOrWrong": "错误（Incorrect）：无论是否开启 SeeAllData，单元测试中严禁发出真实网络请求。"
      },
      {
        "id": "D",
        "textEn": "Use StubProvider and Test.createStub().",
        "text": "使用 `StubProvider` 和 `Test.createStub()`。",
        "whyRightOrWrong": "错误（Incorrect）：WebServiceCallout.invoke 的官方标准测试拦截器是 WebServiceMock。"
      }
    ],
    "correctOptionIds": [
      "A"
    ],
    "coreTakeaway": "Callout 单元测试双生花：REST API (`Http.send`) -> 实现 `HttpCalloutMock`；SOAP WSDL2Apex (`WebServiceCallout.invoke`) -> 实现 `WebServiceMock` (`doInvoke`)。两者均通过 `Test.setMock()` 注册。",
    "officialDocTopic": "SOAP Callout Testing: WSDL2Apex & WebServiceMock"
  },
  {
    "id": "Q95",
    "certLevel": "PD1",
    "stage": "beginner",
    "domain": "异步 Apex 与集成架构 (Async Apex & Integration)",
    "examDomain": "Process Automation & Logic (28%)",
    "questionType": "single",
    "selectCount": 1,
    "scenarioEn": "A business wants customers to be able to send an email with PDF and CSV attachments to a dedicated Salesforce address, and have Apex automatically parse the email subject, body, and binary/text attachments to create a `Claim__c` record and related `ContentVersion` files. Which Apex interface must the developer implement?",
    "scenario": "企业希望客户能够向专用 Salesforce 邮箱发送带有 PDF 和 CSV 附件的电子邮件，并由 Apex 自动解析邮件主题、正文及二进制/文本附件，从而创建 `Claim__c` 记录和关联的 `ContentVersion` 文件。开发人员必须实现哪个 Apex 接口？",
    "options": [
      {
        "id": "A",
        "textEn": "Messaging.InboundEmailHandler (implementing handleInboundEmail(Messaging.InboundEmail email, Messaging.InboundEnvelope envelope)).",
        "text": "`Messaging.InboundEmailHandler`（实现 `handleInboundEmail(Messaging.InboundEmail email, Messaging.InboundEnvelope envelope)` 方法）。",
        "whyRightOrWrong": "正确（Correct）！入站邮件服务（Inbound Email Service）通过实现 `Messaging.InboundEmailHandler` 接口处理外部发入的邮件、二进制附件（`email.binaryAttachments`）和文本附件（`email.textAttachments`），并返回 `Messaging.InboundEmailResult`。"
      },
      {
        "id": "B",
        "textEn": "Messaging.SingleEmailMessage",
        "text": "`Messaging.SingleEmailMessage`",
        "whyRightOrWrong": "错误（Incorrect）：SingleEmailMessage 用于从 Salesforce 向外发送邮件（Outbound Email），不是入站处理器接口。"
      },
      {
        "id": "C",
        "textEn": "Database.EmailBatchable",
        "text": "`Database.EmailBatchable`",
        "whyRightOrWrong": "错误（Incorrect）：Apex 中不存在该接口。"
      },
      {
        "id": "D",
        "textEn": "RestResource with @HttpPost",
        "text": "带有 `@HttpPost` 的 `RestResource`",
        "whyRightOrWrong": "错误（Incorrect）：处理标准 SMTP 入站邮件使用的是 Email Services (`Messaging.InboundEmailHandler`)。"
      }
    ],
    "correctOptionIds": [
      "A"
    ],
    "coreTakeaway": "处理外部发往 Salesforce 的入站邮件及附件：实现 `Messaging.InboundEmailHandler` 接口，在 `handleInboundEmail(email, envelope)` 中读取 `email.subject`、`email.plainTextBody`、`email.binaryAttachments` 并返回 `Messaging.InboundEmailResult`。",
    "officialDocTopic": "Email Services: Messaging.InboundEmailHandler"
  },
  {
    "id": "Q96",
    "certLevel": "PD1",
    "stage": "intermediate",
    "domain": "安全模型与单元测试 (Security & Testing)",
    "examDomain": "Testing, Debugging & Deployment (20%)",
    "questionType": "single",
    "selectCount": 1,
    "scenarioEn": "A developer is writing a unit test for a Batch job that archives `Case` records where `CreatedDate < LAST_N_DAYS:90`. However, `CreatedDate` is a system audit field that defaults to `System.now()` when test records are inserted. How can the developer set `CreatedDate` to 120 days in the past inside an `@IsTest` method?",
    "scenario": "开发人员正在为一个归档 `CreatedDate < LAST_N_DAYS:90` 的 `Case` 记录的 Batch 作业编写单元测试。然而，`CreatedDate` 是系统审计字段，在插入测试记录时默认为 `System.now()`。开发人员如何在 `@IsTest` 方法中将测试记录的 `CreatedDate` 设置为 120 天前？",
    "options": [
      {
        "id": "A",
        "textEn": "Insert the Case record first, then call Test.setCreatedDate(caseRecord.Id, DateTime.now().addDays(-120)).",
        "text": "先 `insert` 该 Case 记录，然后调用 `Test.setCreatedDate(caseRecord.Id, DateTime.now().addDays(-120))`。",
        "whyRightOrWrong": "正确（Correct）！`Test.setCreatedDate(recordId, createdDatetime)` 是专门用于在单元测试中修改已插入记录 `CreatedDate` 的官方测试方法（必须在 insert 拿到 Id 后、且在 Test.startTest() 之前调用）。"
      },
      {
        "id": "B",
        "textEn": "Assign caseRecord.CreatedDate = DateTime.now().addDays(-120) directly before calling insert.",
        "text": "在调用 `insert` 之前直接赋值 `caseRecord.CreatedDate = DateTime.now().addDays(-120)`。",
        "whyRightOrWrong": "错误（Incorrect）：除非在 Org 中开启特殊权限或通过 JSON.deserialize 构造内存对象（不落库），否则直接对实例的只读系统字段 CreatedDate 赋值会报编译错误 `Field is not writeable: Case.CreatedDate`。"
      },
      {
        "id": "C",
        "textEn": "Use @IsTest(SeeAllData=true) to find real old Case records in Production.",
        "text": "使用 `@IsTest(SeeAllData=true)` 在生产环境中查找真实的旧 Case 记录。",
        "whyRightOrWrong": "错误（Incorrect）：违反单元测试数据隔离原则，若新环境没有超过 90 天的真实数据则测试直接失败。"
      },
      {
        "id": "D",
        "textEn": "Pause the test execution for 90 days using a while loop.",
        "text": "使用 while 循环暂停测试执行 90 天。",
        "whyRightOrWrong": "错误（Incorrect）：10 秒就会触发 CPU Time Limit。"
      }
    ],
    "correctOptionIds": [
      "A"
    ],
    "coreTakeaway": "单元测试三大造数神器：`Test.setCreatedDate(id, dt)`（修改测试记录创建时间）、`Test.loadData(SObjectType, staticResourceName)`（从 CSV 静态资源加载数据）、`Test.setFixedSearchResults(idList)`（为 SOSL 指定返回结果）。",
    "officialDocTopic": "Apex Testing Utilities: Test.setCreatedDate(recordId, dt)"
  },
  {
    "id": "Q97",
    "certLevel": "PD1",
    "stage": "intermediate",
    "domain": "安全模型与单元测试 (Security & Testing)",
    "examDomain": "Testing, Debugging & Deployment (20%)",
    "questionType": "single",
    "selectCount": 1,
    "scenarioEn": "In an `@IsTest` method, a developer inserts 50 records, then uses `System.runAs(standardUser) { ... }` to execute a service method that performs 30 SOQL queries, and finally calls `Test.startTest() ... Test.stopTest()`. Which statement is true regarding `System.runAs()` and Governor Limits?",
    "scenario": "在一个 `@IsTest` 方法中，开发人员插入了 50 条记录，然后使用 `System.runAs(standardUser) { ... }` 执行了一个发起 30 次 SOQL 查询的服务方法，最后调用 `Test.startTest() ... Test.stopTest()`。关于 `System.runAs()` 和 Governor Limits，以下哪项描述是正确的？",
    "options": [
      {
        "id": "A",
        "textEn": "Creating or updating test users inside System.runAs() avoids the MIXED_DML_OPERATION error, and System.runAs() does NOT reset Governor Limits (only Test.startTest() grants a fresh set of limits).",
        "text": "使用 `System.runAs()` 切换上下文可避免测试中同时操作 Setup 对象（如 User）与非 Setup 对象引发的 `MIXED_DML_OPERATION` 错误；但 `System.runAs()` **不会**重置 Governor Limits（只有 `Test.startTest()` 才会提供一套全新的配额）。",
        "whyRightOrWrong": "正确（Correct）！考试高频陷阱：很多考生误以为 System.runAs() 会重置 SOQL/DML 配额——实际上 System.runAs() 只切换当前用户的权限与共享上下文（并隔离 Setup/Non-Setup Mixed DML），绝不重置 Governor Limits！重置配额是 Test.startTest() 的职责。"
      },
      {
        "id": "B",
        "textEn": "System.runAs() resets all SOQL and DML governor limits back to zero every time it is called.",
        "text": "每次调用 `System.runAs()` 都会将所有 SOQL 和 DML 限制重置为零。",
        "whyRightOrWrong": "错误（Incorrect）：System.runAs() 不会重置 Governor Limits。"
      },
      {
        "id": "C",
        "textEn": "System.runAs() can be used in production Apex triggers to bypass user permissions.",
        "text": "`System.runAs()` 可以在生产环境的 Apex 触发器中使用以绕过用户权限。",
        "whyRightOrWrong": "错误（Incorrect）：`System.runAs(user)` 只能在 `@IsTest` 测试方法中使用，不可用于生产业务代码（生产中仅支持针对自动化进程或 Platform Event 配置用户）。"
      },
      {
        "id": "D",
        "textEn": "System.runAs() automatically enforces Field-Level Security (FLS) even if the Apex code uses normal SOQL without WITH USER_MODE.",
        "text": "即使 Apex 代码使用不带 WITH USER_MODE 的普通 SOQL，`System.runAs()` 也会自动强制执行字段级安全（FLS）。",
        "whyRightOrWrong": "错误（Incorrect）：System.runAs() 仅影响记录级共享（Record Sharing，前提是类声明了 with sharing），除非代码使用了 WITH USER_MODE / stripInaccessible，否则普通 Apex 仍不校验 FLS。"
      }
    ],
    "correctOptionIds": [
      "A"
    ],
    "coreTakeaway": "`System.runAs(u)` 三大考点：1. 仅限测试方法使用；2. 模拟目标用户的记录级共享权限（Record Sharing）并解决测试中的 `MIXED_DML_OPERATION`（如插入 User 后插入 Account）；3. **不重置** Governor Limits（`Test.startTest()` 才重置）。",
    "officialDocTopic": "Apex Testing Context: System.runAs() & Mixed DML vs Governor Limits"
  },
  {
    "id": "Q98",
    "certLevel": "PD1",
    "stage": "beginner",
    "domain": "安全模型与单元测试 (Security & Testing)",
    "examDomain": "Testing, Debugging & Deployment (20%)",
    "questionType": "single",
    "selectCount": 1,
    "scenarioEn": "While debugging a complex calculation in an Apex class in a Sandbox, a developer wants to inspect the exact state of all objects in Heap memory and local variables at line 85 without adding dozens of `System.debug()` statements or modifying the code. Which Salesforce tool feature allows capturing a heap snapshot at a specific line of Apex code?",
    "scenario": "在 Sandbox 中调试一个 Apex 类中的复杂计算时，开发人员希望在不添加几十条 `System.debug()` 语句也不修改代码的情况下，检查第 85 行处堆内存（Heap）中所有对象和局部变量的确切状态。哪个 Salesforce 工具功能允许在特定代码行捕获堆内存快照？",
    "options": [
      {
        "id": "A",
        "textEn": "Set an Apex Checkpoint on line 85 (up to 5 checkpoints) and inspect the heap dump in the Checkpoints tab or VS Code Apex Replay Debugger.",
        "text": "在第 85 行设置 **Apex Checkpoint**（最多 5 个检查点），并在 Checkpoints 标签页或 VS Code **Apex Replay Debugger** 中检查堆内存快照。",
        "whyRightOrWrong": "正确（Correct）！Apex Checkpoints 允许在代码特定行打点（最多同时激活 5 个），当代码执行流经该行时会自动抓取当前 Heap 内存中的对象图与变量值快照，配合 VS Code Apex Replay Debugger 可离线单步回放调试日志。"
      },
      {
        "id": "B",
        "textEn": "Use Schema.getGlobalDescribe() at runtime.",
        "text": "在运行时使用 `Schema.getGlobalDescribe()`。",
        "whyRightOrWrong": "错误（Incorrect）：这是获取对象元数据的方法，不是调试工具。"
      },
      {
        "id": "C",
        "textEn": "Pause the production database thread with a live breakpoint in Chrome DevTools.",
        "text": "在 Chrome DevTools 中使用实时断点暂停生产数据库线程。",
        "whyRightOrWrong": "错误（Incorrect）：Chrome DevTools 只能调试前端 LWC JavaScript，无法中断服务端多租户 Apex 线程。"
      },
      {
        "id": "D",
        "textEn": "Enable Setup Audit Trail.",
        "text": "启用设置审计跟踪（Setup Audit Trail）。",
        "whyRightOrWrong": "错误（Incorrect）：Setup Audit Trail 记录的是管理员近 6 个月的配置变更历史，不是代码内存快照。"
      }
    ],
    "correctOptionIds": [
      "A"
    ],
    "coreTakeaway": "Apex 调试工具链：在特定行捕获内存变量快照用 **Checkpoints**（最多 5 个）；利用生成的 Debug Log 在本地 VS Code 逐行单步回放用 **Apex Replay Debugger**。",
    "officialDocTopic": "Apex Debugging Tools: Checkpoints & Apex Replay Debugger"
  },
  {
    "id": "Q99",
    "certLevel": "PD1",
    "stage": "beginner",
    "domain": "Apex 核心与面向对象 (Apex & OOP)",
    "examDomain": "Developer Fundamentals (27%)",
    "questionType": "single",
    "selectCount": 1,
    "scenarioEn": "An ISV (Independent Software Vendor) partner is building a Managed Package to distribute on the AppExchange. They want to allow subscriber org developers to call an utility method `TaxEngine.calculate()` from outside the package's namespace. Which access modifier MUST be used on both the `TaxEngine` class and the `calculate()` method?",
    "scenario": "一家 ISV（独立软件开发商）合作伙伴正在构建一个要在 AppExchange 上分发的受管包（Managed Package）。他们希望允许订阅方 Org 的开发人员从该包的命名空间（Namespace）外部调用工具方法 `TaxEngine.calculate()`。在 `TaxEngine` 类和 `calculate()` 方法上**必须**使用哪个访问修饰符？",
    "options": [
      {
        "id": "A",
        "textEn": "global",
        "text": "global",
        "whyRightOrWrong": "正确（Correct）！在 Apex 中，`public` 仅表示在当前同一命名空间（Same Namespace / Org）内可见；如果要跨命名空间暴露给 Managed Package 外部的订阅者调用（或用于 `WebService` SOAP 方法），必须声明为 `global`！"
      },
      {
        "id": "B",
        "textEn": "public",
        "text": "public",
        "whyRightOrWrong": "错误（Incorrect）：与 Java 不同，Apex 的 `public` 仅限当前命名空间内部访问，无法跨越受管包边界。"
      },
      {
        "id": "C",
        "textEn": "protected",
        "text": "protected",
        "whyRightOrWrong": "错误（Incorrect）：protected 仅对内部类或子类可见。"
      },
      {
        "id": "D",
        "textEn": "external",
        "text": "external",
        "whyRightOrWrong": "错误（Incorrect）：Apex 中没有 external 访问修饰符。"
      }
    ],
    "correctOptionIds": [
      "A"
    ],
    "coreTakeaway": "Apex 访问修饰符与 Java 的关键区别：`public` 仅在同一 Namespace 内可见；跨 Namespace（如 Managed Package 暴露 API）或声明 SOAP `webservice` 方法时，必须使用 `global`（注意：一旦作为 Managed Package 正式发布，`global` 方法签名不可随意删除或修改）。",
    "officialDocTopic": "Managed Packages & Namespaces: global vs public Access Modifiers"
  },
  {
    "id": "Q100",
    "certLevel": "PD1",
    "stage": "intermediate",
    "domain": "安全模型与单元测试 (Security & Testing)",
    "examDomain": "Testing, Debugging & Deployment (20%)",
    "questionType": "single",
    "selectCount": 1,
    "scenarioEn": "A DevOps engineer is deploying metadata from a Git repository to a Production org using the Salesforce CLI (`sf project deploy start`). The deployment also needs to permanently delete an obsolete Apex class (`LegacyHelper`) and a custom field (`Account.Old_Code__c`) that already exist in Production. How is metadata deletion performed during a metadata deployment?",
    "scenario": "一名 DevOps 工程师正在使用 Salesforce CLI（`sf project deploy start`）将元数据从 Git 仓库部署到生产环境（Production Org）。此次部署还需要在生产环境中永久删除一个已废弃的 Apex 类（`LegacyHelper`）和一个自定义字段（`Account.Old_Code__c`）。在元数据部署期间如何执行元数据删除？",
    "options": [
      {
        "id": "A",
        "textEn": "Include a destructiveChanges.xml (or destructiveChangesPre.xml / destructiveChangesPost.xml) manifest file listing the components to delete alongside package.xml, or use the --post-destructive-changes flag in sf project deploy start.",
        "text": "随 `package.xml` 一起提供列出待删除组件的 `destructiveChanges.xml`（或 `destructiveChangesPre.xml` / `destructiveChangesPost.xml`）清单文件，或在 `sf project deploy start` 中使用 `--post-destructive-changes` / `--pre-destructive-changes` 参数。",
        "whyRightOrWrong": "正确（Correct）！单纯从源码仓库或 package.xml 中移除某文件并不会删除目标 Org 中已存在的组件；必须通过 Destructive Changes 清单（Pre 在部署新代码前删除，Post 在部署新代码解除依赖后删除）来显式销毁生产环境元数据！"
      },
      {
        "id": "B",
        "textEn": "Simply delete the files from the git branch and run sf project deploy start --manifest package.xml; missing files are deleted automatically.",
        "text": "只需从 Git 分支中删除文件并运行 `sf project deploy start --manifest package.xml`；缺失的文件会自动从生产环境删除。",
        "whyRightOrWrong": "错误（Incorrect）：常规元数据部署是增量更新（Additive），不会因为本地缺少文件就自动删除生产环境中的组件。"
      },
      {
        "id": "C",
        "textEn": "Log into the Production org UI, open Developer Console, and delete the LegacyHelper class directly.",
        "text": "登录生产环境 UI，打开 Developer Console 并直接删除 `LegacyHelper` 类。",
        "whyRightOrWrong": "错误（Incorrect）：Salesforce 生产环境（Production Org）禁止直接在 UI 或 Developer Console 中手动创建、编辑或删除 Apex 代码。"
      },
      {
        "id": "D",
        "textEn": "Execute DELETE FROM ApexClass WHERE Name = 'LegacyHelper' in Anonymous Apex.",
        "text": "在 Anonymous Apex 中执行 `DELETE FROM ApexClass WHERE Name = 'LegacyHelper'`。",
        "whyRightOrWrong": "错误（Incorrect）：ApexClass 元数据表不能通过普通 Apex DML 删除。"
      }
    ],
    "correctOptionIds": [
      "A"
    ],
    "coreTakeaway": "生产环境（Production）不能直接手改或手动删除 Apex 代码；删除废弃的 Apex 类或字段必须通过 `destructiveChangesPre.xml`（部署前删）或 `destructiveChangesPost.xml`（先部署新代码解除引用后再删）配合 Salesforce CLI 部署并跑通测试。",
    "officialDocTopic": "Metadata Deployment: destructiveChanges.xml & Salesforce CLI"
  }
];
