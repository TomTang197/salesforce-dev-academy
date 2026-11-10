import { ExamQuestion } from '../types';

export const QUESTIONS_PART_2: ExamQuestion[] = [
  // ==================== Data Modeling, Custom Metadata, Custom Settings & Data Tools ====================
  {
    id: 'Q49',
    certLevel: 'PD1',
    stage: 'beginner',
    domain: 'Apex 核心与面向对象 (Apex & OOP)',
    examDomain: 'Data Management & SOQL (25%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'Universal Containers needs to model a Many-to-Many (M:N) relationship between `Bug__c` and `Case`. How should the developer configure the data model in Salesforce?',
    scenario:
      'Universal Containers 需要在 `Bug__c` 和 `Case` 之间建立多对多（Many-to-Many）关联关系。开发者应该如何在 Salesforce 中配置数据模型？',
    options: [
      {
        id: 'A',
        textEn: 'Create a custom Junction Object (e.g., `Case_Bug__c`) with two Master-Detail relationship fields—one pointing to `Bug__c` and one pointing to `Case`.',
        text: '创建一个自定义中间连接对象（Junction Object，如 `Case_Bug__c`），并在其上创建两个 Master-Detail 字段分别指向 `Bug__c` 和 `Case`。',
        whyRightOrWrong: '✅ Correct (正确): A Many-to-Many relationship in Salesforce is implemented using a Junction Object with 2 Master-Detail fields.',
      },
      {
        id: 'B',
        textEn: 'Create a Many-to-Many field directly on `Case` pointing to `Bug__c`.',
        text: '直接在 `Case` 上创建一个多对多字段指向 `Bug__c`。',
        whyRightOrWrong: '❌ Incorrect (错误): Salesforce does not have a direct Many-to-Many field type.',
      },
      {
        id: 'C',
        textEn: 'Create a Master-Detail field on `Case` pointing to `Bug__c`, and a Master-Detail field on `Bug__c` pointing to `Case`.',
        text: '在 `Case` 上建一个指向 `Bug__c` 的主详字段，同时在 `Bug__c` 上建一个指向 `Case` 的主详字段。',
        whyRightOrWrong: '❌ Incorrect (错误): Standard objects (`Case`) cannot be on the Detail side of a Master-Detail relationship, and circular Master-Detail relationships are forbidden.',
      },
      {
        id: 'D',
        textEn: 'Use a Hierarchical Relationship field on `Bug__c`.',
        text: '在 `Bug__c` 上使用 Hierarchical（层级）关系字段。',
        whyRightOrWrong: '❌ Incorrect (错误): Hierarchical relationships are ONLY available on the standard `User` object!',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'Many-to-Many = Junction Object with 2 Master-Detail fields. Note: The FIRST Master-Detail field created on the Junction Object becomes the Primary Master (controls Look & Feel / Owner inheritance).',
    officialDocTopic: 'Create a Many-to-Many Object Relationship',
  },
  {
    id: 'Q50',
    certLevel: 'PD1',
    stage: 'beginner',
    domain: 'Apex 核心与面向对象 (Apex & OOP)',
    examDomain: 'Data Management & SOQL (25%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'On which object can a developer create a **Hierarchical Relationship** field in Salesforce?',
    scenario:
      '在 Salesforce 中，开发者可以在哪个对象上创建 **Hierarchical Relationship（层级关系）** 字段？',
    options: [
      {
        id: 'A',
        textEn: 'Only on the standard `User` object (pointing to another `User`).',
        text: '仅限标准 `User` 对象（指向另一个 `User`）。',
        whyRightOrWrong: '✅ Correct (正确): Hierarchical Relationship is a special relationship type available exclusively on the `User` object.',
      },
      {
        id: 'B',
        textEn: 'On `Account` and `User` objects.',
        text: '在 `Account` 和 `User` 对象上均可。',
        whyRightOrWrong: '❌ Incorrect (错误): `Account` uses a standard self-Lookup (`ParentId`), not the special Hierarchical Relationship field type.',
      },
      {
        id: 'C',
        textEn: 'On any custom object (`__c`).',
        text: '在任意自定义对象（`__c`）上。',
        whyRightOrWrong: '❌ Incorrect (错误): Custom objects use self-Lookups, not Hierarchical Relationships.',
      },
      {
        id: 'D',
        textEn: 'On `Role` and `Profile` objects.',
        text: '在 `Role` 和 `Profile` 对象上。',
        whyRightOrWrong: '❌ Incorrect (错误): Only `User` supports Hierarchical Relationship fields.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'Hierarchical Relationship field type is ONLY available on the `User` object! Other objects use a self-Lookup.',
    officialDocTopic: 'Object Relationships Overview',
  },
  {
    id: 'Q51',
    certLevel: 'PD1',
    stage: 'beginner',
    domain: 'Apex 核心与面向对象 (Apex & OOP)',
    examDomain: 'Data Management & SOQL (25%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'Can a standard object (such as `Account` or `Opportunity`) be on the **Detail (child)** side of a Master-Detail relationship with a custom object?',
    scenario:
      '标准对象（如 `Account` 或 `Opportunity`）能否作为与自定义对象建立 Master-Detail（主详关系）时的 **Detail（子对象）** 一方？',
    options: [
      {
        id: 'A',
        textEn: 'No. A standard object can NEVER be on the Detail side of a custom object in a Master-Detail relationship.',
        text: '不能。标准对象永远不能作为自定义对象的 Master-Detail 子对象（Detail side）。',
        whyRightOrWrong: '✅ Correct (正确): Standard objects can only be on the Master side, never on the Detail side of a custom object.',
      },
      {
        id: 'B',
        textEn: 'Yes, up to 2 times per standard object.',
        text: '可以，每个标准对象最多 2 次。',
        whyRightOrWrong: '❌ Incorrect (错误): You cannot create a Master-Detail field on a standard object.',
      },
      {
        id: 'C',
        textEn: 'Yes, if `Allow Reparenting` is enabled.',
        text: '可以，只要勾选了 Allow Reparenting。',
        whyRightOrWrong: '❌ Incorrect (错误): Still prohibited.',
      },
      {
        id: 'D',
        textEn: 'Yes, for `Case` and `Contact` only.',
        text: '仅 `Case` 和 `Contact` 可以。',
        whyRightOrWrong: '❌ Incorrect (错误).',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'Standard objects can NEVER be on the Detail side of a custom object in a Master-Detail relationship.',
    officialDocTopic: 'Considerations for Object Relationships',
  },
  {
    id: 'Q52',
    certLevel: 'PD1',
    stage: 'intermediate',
    domain: 'Apex 核心与面向对象 (Apex & OOP)',
    examDomain: 'Process Automation & Logic (30%)',
    questionType: 'multiple',
    selectCount: 2,
    scenarioEn:
      'A developer needs to store tax rate configuration records that must be deployed from Sandbox to Production via Change Sets or SFDX packages alongside Apex code, and read in Apex without consuming any SOQL query governor limits. Which two statements describe the best solution? (Choose 2 answers)',
    scenario:
      '开发者需要存储税率配置记录，要求这些记录能够随 Change Sets 或 SFDX 包直接从 Sandbox 部署到 Production，并且在 Apex 中读取时不消耗任何 SOQL 查询配额。哪两项描述了最佳方案？（请选择 2 项）',
    options: [
      {
        id: 'A',
        textEn: 'Use a **Custom Metadata Type (`__mdt`)**, because its records are metadata and can be deployed via packages or Change Sets.',
        text: '使用 **Custom Metadata Type (`__mdt`)**，因为它的记录本身就是元数据，可通过 Change Sets 或包直接部署（无需 Data Loader 重新导入）。',
        whyRightOrWrong: '✅ Correct (正确): Custom Metadata Type records are deployable metadata, unlike Custom Settings whose data records must be migrated manually.',
      },
      {
        id: 'B',
        textEn: 'Retrieve records in Apex using `Tax_Rate__mdt.getAll()` or `Tax_Rate__mdt.getInstance(\'NZ_GST\')`, which consumes **0 SOQL queries**.',
        text: '在 Apex 中使用 `Tax_Rate__mdt.getAll()` 或 `Tax_Rate__mdt.getInstance(\'NZ_GST\')` 读取，消耗 **0 次 SOQL 查询配额**。',
        whyRightOrWrong: '✅ Correct (正确): `getAll()` and `getInstance()` read directly from application cache and do not count toward the 100 SOQL query limit.',
      },
      {
        id: 'C',
        textEn: 'Use a Hierarchy Custom Setting (`__c`), because its data records are automatically included in Change Sets.',
        text: '使用 Hierarchy Custom Setting (`__c`)，因为其数据记录会自动包含在 Change Sets 中。',
        whyRightOrWrong: '❌ Incorrect (错误): Custom Settings definitions deploy as metadata, but their *data records* are NOT included in Change Sets!',
      },
      {
        id: 'D',
        textEn: 'Perform DML `update` statements directly on `Tax_Rate__mdt` inside an Apex Trigger.',
        text: '在 Apex Trigger 中直接对 `Tax_Rate__mdt` 执行标准 `update` DML 语句。',
        whyRightOrWrong: '❌ Incorrect (错误): Custom Metadata records cannot be modified using standard DML (`insert`/`update`); they require the asynchronous `Metadata.Operations.enqueueDeployment` API.',
      },
    ],
    correctOptionIds: ['A', 'B'],
    coreTakeaway: 'Custom Metadata (`__mdt`) vs. Custom Settings (`__c`): `__mdt` records are deployable in Change Sets/Packages AND visible in Apex tests even with `SeeAllData=false`! Use `Hierarchy Custom Settings` only when you need personalized overrides per User or Profile (`SetupOwnerId`).',
    officialDocTopic: 'Custom Metadata Types vs Custom Settings',
  },
  {
    id: 'Q53',
    certLevel: 'PD1',
    stage: 'intermediate',
    domain: 'Apex 核心与面向对象 (Apex & OOP)',
    examDomain: 'Process Automation & Logic (30%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'Universal Containers wants to configure a maximum discount percentage that has a default org-wide value of 10%, a Sales VP Profile override of 25%, and a specific User override of 40%, accessible in both Formula fields (`$Setup`) and Apex without SOQL. Which feature should be used?',
    scenario:
      '公司需要配置一个最高折扣率参数：全组织默认 10%、销售 VP 简档（Profile）默认 25%、特定用户（User）特批 40%，且支持在公式字段（`$Setup`）和 Apex 中免 SOQL 读取。应选用什么特性？',
    options: [
      {
        id: 'A',
        textEn: 'Hierarchy Custom Setting (`Discount_Config__c.getInstance()`).',
        text: 'Hierarchy Custom Setting（层级自定义设置，`Discount_Config__c.getInstance()`）。',
        whyRightOrWrong: '✅ Correct (正确): Hierarchy Custom Settings natively support 3-tier personalization (Organization → Profile → User) and `$Setup` formula access.',
      },
      {
        id: 'B',
        textEn: 'List Custom Setting.',
        text: 'List Custom Setting（列表自定义设置）。',
        whyRightOrWrong: '❌ Incorrect (错误): List Custom Settings store flat named rows (like country codes) and do not resolve by User/Profile hierarchy.',
      },
      {
        id: 'C',
        textEn: 'Custom Label.',
        text: 'Custom Label（自定义标签）。',
        whyRightOrWrong: '❌ Incorrect (错误): Custom Labels are for multilingual text translation (`$Label`), not Profile/User numeric overrides.',
      },
      {
        id: 'D',
        textEn: 'Static Resource.',
        text: 'Static Resource（静态资源）。',
        whyRightOrWrong: '❌ Incorrect (错误): Static Resources store files (JS, CSS, ZIP, CSV).',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'Exam keyword cue: "Different values by Organization, Profile, and specific User" → **Hierarchy Custom Setting** (`getInstance()`).',
    officialDocTopic: 'Hierarchy Custom Settings',
  },
  {
    id: 'Q54',
    certLevel: 'PD1',
    stage: 'beginner',
    domain: 'Apex 核心与面向对象 (Apex & OOP)',
    examDomain: 'Data Management & SOQL (25%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'An administrator needs to import **250,000 `Opportunity` records** from a CSV file on a nightly schedule. Why is the **Data Import Wizard** NOT suitable, and which tool should be used instead?',
    scenario:
      '管理员需要每晚定时从 CSV 文件导入 **250,000 条 `Opportunity` 记录**。为什么不能使用 **Data Import Wizard**？应该改用什么工具？',
    options: [
      {
        id: 'A',
        textEn: 'Data Import Wizard only supports up to 50,000 records, does NOT support the `Opportunity` object, and cannot be scheduled via CLI; **Data Loader** (supports up to 5 million records and CLI automation) should be used.',
        text: 'Data Import Wizard 最多只支持 50,000 条记录、**不支持 `Opportunity` 对象**且不支持命令行定时调度；应使用 **Data Loader**（支持最高 500 万条及 CLI 自动调度）。',
        whyRightOrWrong: '✅ Correct (正确): Three classic exam facts: Data Import Wizard max = 50,000 rows, does NOT support `Opportunity` or `Case`, and has no CLI batch mode.',
      },
      {
        id: 'B',
        textEn: 'Data Import Wizard only supports Custom Objects.',
        text: 'Data Import Wizard 只支持自定义对象。',
        whyRightOrWrong: '❌ Incorrect (错误): It supports Accounts, Contacts, Leads, Solutions, Campaign Members, and Custom Objects.',
      },
      {
        id: 'C',
        textEn: 'Data Loader only supports up to 50,000 records.',
        text: 'Data Loader 最多只支持 50,000 条记录。',
        whyRightOrWrong: '❌ Incorrect (错误): Data Loader supports up to 5,000,000 records.',
      },
      {
        id: 'D',
        textEn: 'Use Schema Builder to import the CSV.',
        text: '使用 Schema Builder 导入 CSV。',
        whyRightOrWrong: '❌ Incorrect (错误): Schema Builder is for data model design, not data import.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'Data Import Wizard (<= 50k rows, NO Opportunity/Case, browser UI only) vs. Data Loader (up to 5M rows, all objects including Opportunity, supports CLI scheduling & SOAP/Bulk API).',
    officialDocTopic: 'Data Import Wizard vs Data Loader',
  },

  // ==================== Apex OOP, Exceptions, Custom Set/Map Keys & Dynamic Describe ====================
  {
    id: 'Q55',
    certLevel: 'PD1',
    stage: 'intermediate',
    domain: 'Apex 核心与面向对象 (Apex & OOP)',
    examDomain: 'Process Automation & Logic (30%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'A developer wants to create a base class `PaymentProcessor` that provides a default implementation of `process()`, while allowing subclasses like `CreditCardProcessor` to extend `PaymentProcessor` and override `process()`. Which keywords are required on the base class, base method, and subclass method?',
    scenario:
      '开发者希望创建一个基类 `PaymentProcessor` 并提供 `process()` 方法的默认实现，同时允许子类继承该基类并重写 `process()`。基类、基类方法和子类方法分别需要使用什么关键字？',
    options: [
      {
        id: 'A',
        textEn: 'Base class: `virtual`, Base method: `virtual`, Subclass method: `override` (`public class CreditCardProcessor extends PaymentProcessor`).',
        text: '基类：`virtual`，基类方法：`virtual`，子类方法：`override`（使用 `extends` 继承）。',
        whyRightOrWrong: '✅ Correct (正确): In Apex, a class cannot be extended unless marked `virtual` or `abstract`, and a method with a body can only be overridden if marked `virtual` (and `override` in the subclass).',
      },
      {
        id: 'B',
        textEn: 'Base class: `abstract`, Base method: `abstract` (with a default body).',
        text: '基类：`abstract`，基类方法：`abstract`（带默认方法体）。',
        whyRightOrWrong: '❌ Incorrect (错误): `abstract` methods cannot have a method body `{ ... }`!',
      },
      {
        id: 'C',
        textEn: 'No extra keywords are needed; all Apex classes and methods are extensible by default like Java.',
        text: '不需要额外关键字，Apex 类和方法默认像 Java 一样可直接继承重写。',
        whyRightOrWrong: '❌ Incorrect (错误): Unlike Java, Apex classes and methods are `final` (non-extensible) by default unless explicitly marked `virtual` or `abstract`!',
      },
      {
        id: 'D',
        textEn: 'Use `implements PaymentProcessor` on the subclass.',
        text: '在子类上使用 `implements PaymentProcessor`。',
        whyRightOrWrong: '❌ Incorrect (错误): `implements` is for `interface`, while `extends` is for `virtual` / `abstract` classes.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'In Apex, classes and methods are non-virtual by default! To allow inheritance and overriding a method with a default body, mark the parent class & method `virtual` and the child method `override`.',
    officialDocTopic: 'Extending a Class (virtual, abstract, override)',
  },
  {
    id: 'Q56',
    certLevel: 'PD1',
    stage: 'intermediate',
    domain: 'Apex 核心与面向对象 (Apex & OOP)',
    examDomain: 'Process Automation & Logic (30%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'A developer needs to define a custom exception class in Apex so they can throw `new InsufficientInventoryException(\'Out of stock\')`. Which class declaration is valid?',
    scenario:
      '开发者需要在 Apex 中定义一个自定义异常类以便抛出 `new InsufficientInventoryException(\'Out of stock\')`。以下哪个类定义是合法的？',
    options: [
      {
        id: 'A',
        textEn: 'public class InsufficientInventoryException extends Exception {}',
        text: 'public class InsufficientInventoryException extends Exception {}',
        whyRightOrWrong: '✅ Correct (正确): All custom exception classes in Apex MUST end with the word `Exception` and extend the built-in `Exception` class (or another custom exception class).',
      },
      {
        id: 'B',
        textEn: 'public class InsufficientInventoryError extends Exception {}',
        text: 'public class InsufficientInventoryError extends Exception {}',
        whyRightOrWrong: '❌ Incorrect (错误): Custom exception class names MUST end with the exact suffix `Exception`, otherwise compilation fails!',
      },
      {
        id: 'C',
        textEn: 'public class InsufficientInventoryException implements Throwable {}',
        text: 'public class InsufficientInventoryException implements Throwable {}',
        whyRightOrWrong: '❌ Incorrect (错误): Must use `extends Exception`.',
      },
      {
        id: 'D',
        textEn: 'public exception InsufficientInventoryException {}',
        text: 'public exception InsufficientInventoryException {}',
        whyRightOrWrong: '❌ Incorrect (错误): Invalid syntax.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'Custom Exception rules in Apex: 1) Class name MUST end with `Exception`; 2) Must `extends Exception`; 3) Automatically inheritsconstructors like `new MyException(String msg)`.',
    officialDocTopic: 'Create Custom Exceptions',
  },
  {
    id: 'Q57',
    certLevel: 'PD1',
    stage: 'intermediate',
    domain: 'Apex 核心与面向对象 (Apex & OOP)',
    examDomain: 'Process Automation & Logic (30%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'A developer executes `Account acc = [SELECT Id, Name FROM Account LIMIT 1];` and then on the next line writes `String ind = acc.Industry;`. What happens at runtime?',
    scenario:
      '开发者执行了 `Account acc = [SELECT Id, Name FROM Account LIMIT 1];`，随后在下一行写 `String ind = acc.Industry;`（注意 `Industry` 未包含在 SELECT 子句中）。运行时会发生什么？',
    options: [
      {
        id: 'A',
        textEn: 'A `System.SObjectException: SObject row was retrieved via SOQL without querying the requested field: Account.Industry` is thrown.',
        text: '抛出 `System.SObjectException: SObject row was retrieved via SOQL without querying the requested field: Account.Industry` 异常。',
        whyRightOrWrong: '✅ Correct (正确): Accessing any field on a SOQL-retrieved sObject that was NOT included in the `SELECT` clause throws `System.SObjectException`!',
      },
      {
        id: 'B',
        textEn: '`ind` is assigned `null` without any error.',
        text: '`ind` 被赋值为 `null`，不会报错。',
        whyRightOrWrong: '❌ Incorrect (错误): It only returns `null` on an in-memory `new Account()`, NOT on a record retrieved via SOQL that omitted the field.',
      },
      {
        id: 'C',
        textEn: 'Apex automatically issues a lazy-load SOQL query to fetch `Industry`.',
        text: 'Apex 自动发起一次延迟加载 SOQL 去查询 `Industry`。',
        whyRightOrWrong: '❌ Incorrect (错误): Apex never lazy-loads unqueried fields.',
      },
      {
        id: 'D',
        textEn: 'A `System.NullPointerException` is thrown.',
        text: '抛出 `System.NullPointerException`。',
        whyRightOrWrong: '❌ Incorrect (错误): `acc` is not null; the exception is specifically `System.SObjectException`.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'Reading a field that was omitted from the `SELECT` clause on a queried sObject throws **`System.SObjectException`**! Querying with `LIMIT 1` when 0 rows match and assigning to a single `sObject` throws **`System.QueryException: List has no rows for assignment to SObject`**.',
    officialDocTopic: 'SObjectException and QueryException',
  },
  {
    id: 'Q58',
    certLevel: 'PD2',
    stage: 'advanced',
    domain: 'Apex 核心与面向对象 (Apex & OOP)',
    examDomain: 'Process Automation & Logic (30%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'A developer creates a custom Apex wrapper class `CoordinateWrapper` and wants to use instances of `CoordinateWrapper` inside a `Set<CoordinateWrapper>` or as keys in a `Map<CoordinateWrapper, String>` to ensure duplicate coordinates are properly identified. Which two methods MUST be implemented on `CoordinateWrapper`?',
    scenario:
      '开发者编写了一个自定义包装类 `CoordinateWrapper`，希望将其放入 `Set<CoordinateWrapper>` 或作为 `Map<CoordinateWrapper, String>` 的 Key 并准确识别重复键值。必须在 `CoordinateWrapper` 类中实现哪两个方法？',
    options: [
      {
        id: 'A',
        textEn: 'public Boolean equals(Object obj) and public Integer hashCode()',
        text: 'public Boolean equals(Object obj) 与 public Integer hashCode()',
        whyRightOrWrong: '✅ Correct (正确): Custom Apex classes used in `Set` or as `Map` keys MUST implement both `equals(Object)` and `hashCode()` to ensure deterministic hashing and equality.',
      },
      {
        id: 'B',
        textEn: 'public Integer compareTo(Object obj) (implementing `Comparable`)',
        text: 'public Integer compareTo(Object obj)（实现 `Comparable` 接口）',
        whyRightOrWrong: '❌ Incorrect (错误): `Comparable` (`compareTo`) is used for `List.sort()`, NOT for `Set` uniqueness or `Map` keys!',
      },
      {
        id: 'C',
        textEn: 'public String toString() and public Id getId()',
        text: 'public String toString() 与 public Id getId()',
        whyRightOrWrong: '❌ Incorrect (错误): Not used by hash collections.',
      },
      {
        id: 'D',
        textEn: 'public Object clone()',
        text: 'public Object clone()',
        whyRightOrWrong: '❌ Incorrect (错误).',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'Custom Apex class in `Set<T>` or `Map<T, V>` key → implement `equals(Object)` and `hashCode()`. Custom Apex class in `List<T>.sort()` → implement `Comparable` (`compareTo(Object)`).',
    officialDocTopic: 'Using Custom Types in Map Keys and Sets',
  },
  {
    id: 'Q59',
    certLevel: 'PD1',
    stage: 'intermediate',
    domain: 'Apex 核心与面向对象 (Apex & OOP)',
    examDomain: 'Process Automation & Logic (30%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'An administrator wants to call a custom Apex method from a **Record-Triggered Flow** or **Screen Flow** to perform complex territory assignment. Which annotation must the developer place on the Apex method, and what are its constraints?',
    scenario:
      '管理员希望在 **Flow（流）** 中调用自定义 Apex 方法执行复杂区域分配。开发者必须在 Apex 方法上添加什么注解？该注解有什么语法约束？',
    options: [
      {
        id: 'A',
        textEn: '`@InvocableMethod`; there can be at most ONE `@InvocableMethod` per Apex class, and its parameter/return type must be a `List` (bulkified).',
        text: '`@InvocableMethod`；每个 Apex 类最多只能有 **1 个** `@InvocableMethod` 方法，且其入参和返回值必须是 `List` 列表类型（强制批量化）。',
        whyRightOrWrong: '✅ Correct (正确): `@InvocableMethod` exposes Apex to Flows/Process Builder, allows only 1 invocable method per class, and requires `List<T>` inputs/outputs to support bulkified Flow interviews.',
      },
      {
        id: 'B',
        textEn: '`@AuraEnabled(flow=true)`; multiple methods per class are allowed.',
        text: '`@AuraEnabled(flow=true)`；一个类中允许定义多个。',
        whyRightOrWrong: '❌ Incorrect (错误): `@AuraEnabled` is for LWC/Aura components, not Flow Action elements.',
      },
      {
        id: 'C',
        textEn: '`@FlowAction`; accepts a single `sObject` parameter.',
        text: '`@FlowAction`；接收单个 `sObject` 参数。',
        whyRightOrWrong: '❌ Incorrect (错误): `@FlowAction` does not exist.',
      },
      {
        id: 'D',
        textEn: '`@RemoteAction`; must be `global static`.',
        text: '`@RemoteAction`；必须是 `global static`。',
        whyRightOrWrong: '❌ Incorrect (错误): `@RemoteAction` is for Visualforce JS Remoting.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'Flow calls Apex via **`@InvocableMethod`** (and custom wrapper fields use **`@InvocableVariable`**). Only 1 `@InvocableMethod` per class, and inputs/outputs must be `List<...>`.',
    officialDocTopic: 'InvocableMethod Annotation',
  },
  {
    id: 'Q60',
    certLevel: 'PD2',
    stage: 'advanced',
    domain: '安全模型与单元测试 (Security & Testing)',
    examDomain: 'Process Automation & Logic (30%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'Universal Containers has `Project__c` set to `Private` Organization-Wide Default (OWD). When a `Project_Auditor__c` lookup field is populated on `Project__c`, the developer must programmatically grant that user Read/Write access to the `Project__c` record via **Apex Managed Sharing** and ensure the share is NOT deleted when the record owner changes. How should this be implemented?',
    scenario:
      '`Project__c` 的组织级默认共享（OWD）设为 `Private`。当 `Project__c` 上的审计员字段被填写时，需要通过 **Apex Managed Sharing（Apex 托管共享）** 编程授予该用户读写权限，并确保当记录 Owner 变更时该共享不会被系统自动删除。应如何实现？',
    options: [
      {
        id: 'A',
        textEn: 'Define an Apex Sharing Reason on `Project__c`, and insert a `Project__Share` record with `ParentId`, `UserOrGroupId`, `AccessLevel = \'Edit\'`, and `RowCause = Schema.Project__Share.RowCause.Auditor_Access__c`.',
        text: '在 `Project__c` 上创建自定义 Apex Sharing Reason，并插入一条 `Project__Share` 记录，指定 `ParentId`、`UserOrGroupId`、`AccessLevel = \'Edit\'` 以及 `RowCause = Schema.Project__Share.RowCause.Auditor_Access__c`。',
        whyRightOrWrong: '✅ Correct (正确): Using a custom Apex Sharing Reason (`RowCause`) creates Apex Managed Sharing, which persists across record Owner changes (unlike `RowCause.Manual` which is wiped when Owner changes)!',
      },
      {
        id: 'B',
        textEn: 'Insert a `Project__Share` record with `RowCause = Schema.Project__Share.RowCause.Manual`.',
        text: '插入 `Project__Share` 记录并设置 `RowCause = Schema.Project__Share.RowCause.Manual`。',
        whyRightOrWrong: '❌ Incorrect (错误): Manual shares (`RowCause.Manual`) are automatically deleted whenever the record\'s `OwnerId` changes!',
      },
      {
        id: 'C',
        textEn: 'Insert a `Project_Share__c` custom object record.',
        text: '插入 `Project_Share__c` 自定义对象记录。',
        whyRightOrWrong: '❌ Incorrect (错误): System share tables for custom objects end in `__Share` (e.g., `Project__Share`), and for standard objects end in `Share` (e.g., `AccountShare`).',
      },
      {
        id: 'D',
        textEn: 'Apex Managed Sharing works even if `Project__c` is a Detail object in a Master-Detail relationship.',
        text: '即使 `Project__c` 是 Master-Detail 的子对象，也能使用 `Project__Share`。',
        whyRightOrWrong: '❌ Incorrect (错误): Detail objects in a Master-Detail relationship do NOT have a `__Share` table because sharing is controlled by the Master object.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'Sharing Table rules: Standard object = `AccountShare` (`AccountId`, `AccountAccessLevel`); Custom object = `MyObj__Share` (`ParentId`, `AccessLevel`). `RowCause.Manual` is deleted on Owner change; custom `RowCause.My_Reason__c` (Apex Managed Sharing) survives Owner changes!',
    officialDocTopic: 'Apex Managed Sharing',
  },

  // ==================== LWC Deep Dive: Static Resources, Labels, Navigation, Wire & Continuation ====================
  {
    id: 'Q61',
    certLevel: 'PD1',
    stage: 'intermediate',
    domain: 'LWC 现代前端组件 (Lightning Web Components)',
    examDomain: 'User Interface / LWC (25%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'A developer needs to load a third-party charting library (`ChartJS`) uploaded as a Static Resource in an LWC component and initialize the chart on a `<canvas lwc:dom="manual">` element. Which module and lifecycle hook should be used?',
    scenario:
      '开发者需要在 LWC 组件中加载上传为 Static Resource（静态资源）的第三方图表库 `ChartJS` 并在 `<canvas>` 上初始化。应该导入哪个模块，并在哪个生命周期钩子中调用？',
    options: [
      {
        id: 'A',
        textEn: 'Import `loadScript` from `lightning/platformResourceLoader` and the URL from `@salesforce/resourceUrl/ChartJS`; call `loadScript()` inside `renderedCallback()` guarded by a boolean flag `if (this.chartInitialized) return;`.',
        text: '从 `lightning/platformResourceLoader` 导入 `loadScript` 并从 `@salesforce/resourceUrl/ChartJS` 导入路径；在 `renderedCallback()` 中配合布尔锁 `if (this.chartInitialized) return;` 调用。',
        whyRightOrWrong: '✅ Correct (正确): Chart libraries require the `<canvas>` DOM element to exist, so `loadScript` is called once inside `renderedCallback()` guarded by a boolean flag.',
      },
      {
        id: 'B',
        textEn: 'Add a `<script src="...">` tag directly inside the LWC `.html` template.',
        text: '直接在 LWC 的 `.html` 模板中编写 `<script src="...">` 标签。',
        whyRightOrWrong: '❌ Incorrect (错误): LWC templates strictly forbid `<script>` tags for security reasons.',
      },
      {
        id: 'C',
        textEn: 'Call `loadScript()` inside `constructor()` before `super()`.',
        text: '在 `constructor()` 的 `super()` 之前调用 `loadScript()`。',
        whyRightOrWrong: '❌ Incorrect (错误): DOM elements do not exist in `constructor()`, and `super()` must always be the first line.',
      },
      {
        id: 'D',
        textEn: 'Import `ChartJS` from `@salesforce/staticResource/ChartJS`.',
        text: '从 `@salesforce/staticResource/ChartJS` 导入。',
        whyRightOrWrong: '❌ Incorrect (错误): The correct scoped module is `@salesforce/resourceUrl/<resourceName>`.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'Loading third-party JS/CSS in LWC: `import myResource from \'@salesforce/resourceUrl/myResource\'` + `import { loadScript, loadStyle } from \'lightning/platformResourceLoader\'` + call inside `renderedCallback()` with a boolean guard!',
    officialDocTopic: 'Use Third-Party JavaScript Libraries in LWC',
  },
  {
    id: 'Q62',
    certLevel: 'PD1',
    stage: 'intermediate',
    domain: 'LWC 现代前端组件 (Lightning Web Components)',
    examDomain: 'User Interface / LWC (25%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'An LWC component needs to navigate the user to a newly created `Account` record\'s standard View page after saving. Which module and syntax should the developer use?',
    scenario:
      'LWC 组件需要在保存成功后将用户跳转到新创建的 `Account` 记录详情页。应该使用哪个模块和语法？',
    options: [
      {
        id: 'A',
        textEn: 'Import `NavigationMixin` from `lightning/navigation`, extend `NavigationMixin(LightningElement)`, and call `this[NavigationMixin.Navigate]({ type: \'standard__recordPage\', attributes: { recordId, actionName: \'view\' } })`.',
        text: '从 `lightning/navigation` 导入 `NavigationMixin`，继承 `NavigationMixin(LightningElement)`，并调用 `this[NavigationMixin.Navigate]({ type: \'standard__recordPage\', attributes: { recordId, actionName: \'view\' } })`。',
        whyRightOrWrong: '✅ Correct (正确): `NavigationMixin` is the standard LWC API for navigating to record pages, object home pages, tabs, and external URLs without full page reloads.',
      },
      {
        id: 'B',
        textEn: 'Assign `window.location.href = \'https://...\' + recordId;`.',
        text: '直接赋值 `window.location.href = \'https://...\' + recordId;`。',
        whyRightOrWrong: '❌ Incorrect (错误): Hardcoding URLs breaks across Experience Cloud, Mobile App, and Console workspaces.',
      },
      {
        id: 'C',
        textEn: 'Fire `$A.get(\'e.force:navigateToSObject\').fire()` inside the LWC.',
        text: '在 LWC 中调用 `$A.get(\'e.force:navigateToSObject\').fire()`。',
        whyRightOrWrong: '❌ Incorrect (错误): `$A` is legacy Aura syntax and is not accessible in LWC.',
      },
      {
        id: 'D',
        textEn: 'Use `lightning/router`.',
        text: '使用 `lightning/router`。',
        whyRightOrWrong: '❌ Incorrect (错误): Module does not exist.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'Always use `NavigationMixin` from `lightning/navigation` (`export default class MyComp extends NavigationMixin(LightningElement)`) for page navigation in LWC.',
    officialDocTopic: 'Navigate to Different Page Types (NavigationMixin)',
  },
  {
    id: 'Q63',
    certLevel: 'PD1',
    stage: 'intermediate',
    domain: 'LWC 现代前端组件 (Lightning Web Components)',
    examDomain: 'User Interface / LWC (25%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'When importing Object and Field references in an LWC component to pass to `getRecord` or `lightning-record-form`, why is `import ACCOUNT_NAME_FIELD from \'@salesforce/schema/Account.Name\';` strongly preferred over passing the hardcoded string `\'Account.Name\'`?',
    scenario:
      '在 LWC 中引用对象和字段时，为什么官方强烈推荐使用 `import ACCOUNT_NAME_FIELD from \'@salesforce/schema/Account.Name\';` 而不是直接写硬编码字符串 `\'Account.Name\'`？',
    options: [
      {
        id: 'A',
        textEn: 'It provides compile-time referential integrity: Salesforce prevents administrators from deleting a field or object that is imported via `@salesforce/schema`, and automatically cascades field API name renames.',
        text: '它提供编译期引用完整性保护（Referential Integrity）：阻止管理员误删被组件引用的字段，且当字段重命名时能自动同步。',
        whyRightOrWrong: '✅ Correct (正确): Importing from `@salesforce/schema` registers metadata dependencies so admins cannot accidentally delete referenced fields.',
      },
      {
        id: 'B',
        textEn: 'It bypasses Field-Level Security (FLS) for the current user.',
        text: '它可以绕过当前用户的字段级安全（FLS）。',
        whyRightOrWrong: '❌ Incorrect (错误): LDS always enforces FLS.',
      },
      {
        id: 'C',
        textEn: 'Hardcoded field strings are not supported in JavaScript.',
        text: 'JavaScript 不支持字符串字面量。',
        whyRightOrWrong: '❌ Incorrect (错误).',
      },
      {
        id: 'D',
        textEn: 'It increases the SOQL row limit to 100,000.',
        text: '它能将 SOQL 行数上限提升至 100,000。',
        whyRightOrWrong: '❌ Incorrect (错误).',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'Importing from `@salesforce/schema/Object.Field` ensures compile-time validation and prevents accidental deletion of referenced objects/fields in the org.',
    officialDocTopic: 'Import Object and Field References (@salesforce/schema)',
  },
  {
    id: 'Q64',
    certLevel: 'PD2',
    stage: 'architect',
    domain: '异步 Apex 与集成架构 (Async Apex & Integration)',
    examDomain: 'Process Automation & Logic (30%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'An LWC component calls an external legacy banking web service that takes **12 seconds** to respond. Because synchronous Apex transactions lasting longer than 5 seconds are capped at **10 concurrent long-running requests** across the entire org, users encounter `ConcurrentPerOrgLongTxn Limit Exceeded` during peak hours. How should the architect redesign this callout from LWC?',
    scenario:
      '某 LWC 组件需要调用一个响应耗时达 **12 秒** 的外部银行接口。由于超过 5 秒的同步请求在整个组织内受限于 **最多 10 个并发长请求（Concurrent Long-Running Apex Limit）**，高峰期频繁报错。架构师应如何重构该 LWC 调用？',
    options: [
      {
        id: 'A',
        textEn: 'Use an Asynchronous Callout with the **`Continuation`** class (`@AuraEnabled(continuation=true)`), which suspends the request without holding an Apex server thread or counting toward the 10-concurrent long-running request limit.',
        text: '使用 **`Continuation`** 类配合 `@AuraEnabled(continuation=true)` 发起异步连续调用，它不会占用同步应用服务器线程，也不计入 10 个并发长请求上限！',
        whyRightOrWrong: '✅ Correct (正确): `Continuation` is specifically designed for UI-initiated long-running callouts in LWC/Aura/Visualforce so they don\'t exhaust the 10 concurrent synchronous request limit!',
      },
      {
        id: 'B',
        textEn: 'Increase `req.setTimeout(120000)` on the synchronous `HttpRequest`.',
        text: '在同步 `HttpRequest` 上调大 `req.setTimeout(120000)`。',
        whyRightOrWrong: '❌ Incorrect (错误): A synchronous callout >5s still consumes one of the 10 concurrent long-running request slots.',
      },
      {
        id: 'C',
        textEn: 'Use a `Batch Apex` job triggered by the button click.',
        text: '点击按钮时启动一个 `Batch Apex` 任务。',
        whyRightOrWrong: '❌ Incorrect (错误): Batch Apex is queued asynchronously and does not directly return the HTTP response payload to the LWC caller.',
      },
      {
        id: 'D',
        textEn: 'Call `Test.setMock()` in production.',
        text: '在生产环境中调用 `Test.setMock()`。',
        whyRightOrWrong: '❌ Incorrect (错误): Only for unit tests.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'PD2 High-Yield: Whenever an LWC or Visualforce page makes a slow external HTTP callout (>5 seconds) and hits the **10 concurrent long-running Apex limit**, the answer is **`Continuation` (`@AuraEnabled(continuation=true)`)**!',
    officialDocTopic: 'Make Long-Running Callouts with Continuations',
  },
  {
    id: 'Q65',
    certLevel: 'PD2',
    stage: 'advanced',
    domain: 'LWC 现代前端组件 (Lightning Web Components)',
    examDomain: 'User Interface / LWC (25%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'An LWC component updates an `Account` record using an **imperative Apex DML method** (rather than LDS). How should the developer notify Lightning Data Service (LDS) so that standard record pages and `@wire(getRecord)` components on the screen immediately refresh their cached copy of that `Account`?',
    scenario:
      '某 LWC 组件通过 **命令式 Apex 方法** 更新了一条 `Account` 记录（未经过 LDS）。开发者应调用哪个现代 API 通知 Lightning Data Service (LDS)，使页面上的标准详情组件和其他 `@wire(getRecord)` 组件立即刷新该记录缓存？',
    options: [
      {
        id: 'A',
        textEn: 'Call `await notifyRecordUpdateAvailable([{ recordId: this.recordId }])` imported from `lightning/uiRecordApi`.',
        text: '调用从 `lightning/uiRecordApi` 导入的 `await notifyRecordUpdateAvailable([{ recordId: this.recordId }])`。',
        whyRightOrWrong: '✅ Correct (正确): `notifyRecordUpdateAvailable()` (which replaced the deprecated `getRecordNotifyChange`) tells LDS to re-fetch the specified record IDs.',
      },
      {
        id: 'B',
        textEn: 'Call `refreshApex(this.recordId)`.',
        text: '调用 `refreshApex(this.recordId)`。',
        whyRightOrWrong: '❌ Incorrect (错误): `refreshApex` refreshes a specific `@wire` Apex provision, whereas `notifyRecordUpdateAvailable` refreshes the global LDS record cache after imperative Apex DML.',
      },
      {
        id: 'C',
        textEn: 'Call `window.location.reload()`.',
        text: '调用 `window.location.reload()`。',
        whyRightOrWrong: '❌ Incorrect (错误): Full page reloads are an anti-pattern in Lightning.',
      },
      {
        id: 'D',
        textEn: 'Dispatch a `ShowToastEvent`.',
        text: '派发一个 `ShowToastEvent`。',
        whyRightOrWrong: '❌ Incorrect (错误): Shows a notification banner, does not refresh LDS cache.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'Refresh `@wire(apexMethod)` cache → `refreshApex(wiredResult)`. Refresh LDS (`getRecord` / standard record page) after imperative Apex DML → `notifyRecordUpdateAvailable([{ recordId }])`.',
    officialDocTopic: 'notifyRecordUpdateAvailable (lightning/uiRecordApi)',
  },

  // ==================== Testing Special Cases: SOSL, Static Resource CSV, CreatedDate, Callout + DML ====================
  {
    id: 'Q66',
    certLevel: 'PD1',
    stage: 'advanced',
    domain: '安全模型与单元测试 (Security & Testing)',
    examDomain: 'Testing, Debugging & Deployment (20%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'A developer writes a unit test that inserts a `Contact` record and then calls a method that executes a **SOSL `FIND` search** for that Contact. However, the SOSL search always returns an empty list during `@isTest` execution! Why does this happen, and how is it fixed?',
    scenario:
      '开发者在单元测试中先 `insert` 了一条 `Contact` 记录，紧接着调用包含 **SOSL (`FIND ...`)** 搜索的方法，但测试中 SOSL 永远返回空列表！原因及修复方法是什么？',
    options: [
      {
        id: 'A',
        textEn: 'SOSL queries in unit tests return empty results by default; the developer must call `Test.setFixedSearchResults(new List<Id>{ testContact.Id })` before executing the SOSL search.',
        text: '单元测试中 SOSL 默认返回空结果；必须在调用被测方法前执行 `Test.setFixedSearchResults(new List<Id>{ testContact.Id })` 显式指定 SOSL 返回的记录 ID 列表！',
        whyRightOrWrong: '✅ Correct (正确): Because full-text search indexing is asynchronous, SOSL queries in Apex tests always return empty results unless `Test.setFixedSearchResults(fixedSearchResults)` is called first!',
      },
      {
        id: 'B',
        textEn: 'Add `@isTest(SeeAllData=true)` to the test method.',
        text: '添加 `@isTest(SeeAllData=true)`。',
        whyRightOrWrong: '❌ Incorrect (错误): Even with `SeeAllData=true`, newly inserted test records are not indexed for SOSL without `Test.setFixedSearchResults()`.',
      },
      {
        id: 'C',
        textEn: 'Wrap the `insert` inside `Test.startTest()` and `Test.stopTest()`.',
        text: '用 `Test.startTest()` 和 `Test.stopTest()` 包裹 `insert`。',
        whyRightOrWrong: '❌ Incorrect (错误): `stopTest()` does not populate SOSL results without `Test.setFixedSearchResults()`.',
      },
      {
        id: 'D',
        textEn: 'Use `Test.setMock(SoslMock.class, ...)`',
        text: '使用 `Test.setMock(SoslMock.class, ...)`。',
        whyRightOrWrong: '❌ Incorrect (错误): `SoslMock` does not exist; the method is `Test.setFixedSearchResults()`.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'High-Yield Exam Fact: To test a **SOSL** query in an `@isTest` method, you MUST call **`Test.setFixedSearchResults(List<Id>)`**!',
    officialDocTopic: 'Adding SOSL Queries to Unit Tests (Test.setFixedSearchResults)',
  },
  {
    id: 'Q67',
    certLevel: 'PD1',
    stage: 'advanced',
    domain: '安全模型与单元测试 (Security & Testing)',
    examDomain: 'Testing, Debugging & Deployment (20%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'A developer wants to populate 150 test `Account` records in an `@TestSetup` method by loading them from a CSV file uploaded as a Static Resource named `TestAccountsCSV`, without writing 150 `new Account(...)` statements. Which method should be used?',
    scenario:
      '开发者希望在 `@TestSetup` 中直接从名为 `TestAccountsCSV` 的静态资源 CSV 文件加载并插入 150 条测试 `Account` 记录。应使用哪个标准 `Test` 方法？',
    options: [
      {
        id: 'A',
        textEn: 'List<sObject> accs = Test.loadData(Account.sObjectType, \'TestAccountsCSV\');',
        text: 'List<sObject> accs = Test.loadData(Account.sObjectType, \'TestAccountsCSV\');',
        whyRightOrWrong: '✅ Correct (正确): `Test.loadData(Schema.SObjectType, String staticResourceName)` parses the CSV static resource and inserts the test records into the database automatically!',
      },
      {
        id: 'B',
        textEn: 'List<Account> accs = StaticResource.loadCsv(\'TestAccountsCSV\');',
        text: 'List<Account> accs = StaticResource.loadCsv(\'TestAccountsCSV\');',
        whyRightOrWrong: '❌ Incorrect (错误): Method does not exist.',
      },
      {
        id: 'C',
        textEn: 'Database.importCsv(Account.class, \'TestAccountsCSV\');',
        text: 'Database.importCsv(Account.class, \'TestAccountsCSV\');',
        whyRightOrWrong: '❌ Incorrect (错误): Method does not exist.',
      },
      {
        id: 'D',
        textEn: 'Test.setMock(StaticResourceCalloutMock.class, \'TestAccountsCSV\');',
        text: 'Test.setMock(StaticResourceCalloutMock.class, \'TestAccountsCSV\');',
        whyRightOrWrong: '❌ Incorrect (错误): `StaticResourceCalloutMock` mocks HTTP responses, whereas `Test.loadData()` inserts sObject test rows from a CSV.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'Load test records from a CSV Static Resource → **`Test.loadData(Account.sObjectType, \'ResourceName\')`**. Set a historical `CreatedDate` on a test record → **`Test.setCreatedDate(recordId, Datetime)`**.',
    officialDocTopic: 'Loading Test Data from Static Resources (Test.loadData)',
  },
  {
    id: 'Q68',
    certLevel: 'PD1',
    stage: 'advanced',
    domain: '异步 Apex 与集成架构 (Async Apex & Integration)',
    examDomain: 'Process Automation & Logic (30%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'A developer writes a method that first executes `insert new Account(Name = \'Acme\');` and then on the very next line executes `new Http().send(req);` in the same transaction. At runtime, an exception is thrown: `System.CalloutException: You have uncommitted work pending. Please commit or rollback before calling out`. How should this be fixed?',
    scenario:
      '开发者在同一个方法中先执行了 `insert new Account(Name = \'Acme\');`，紧接着在下一行执行外部请求 `new Http().send(req);`，结果抛出 `System.CalloutException: You have uncommitted work pending. Please commit or rollback before calling out`。应如何修复？',
    options: [
      {
        id: 'A',
        textEn: 'Execute all HTTP Callouts BEFORE performing any DML operations (`insert`/`update`/`delete`), or move the HTTP Callout into a separate asynchronous transaction (`@future(callout=true)` or `Queueable`).',
        text: '将所有 HTTP Callout 放在任何 DML 语句**之前**执行；或者将 HTTP Callout 拆分到独立的异步事务（`@future(callout=true)` 或 `Queueable`）中执行。',
        whyRightOrWrong: '✅ Correct (正确): Salesforce forbids making an HTTP callout after uncommitted DML (or active Savepoint) in the same transaction. Always **Callout FIRST, then DML**, or split into async!',
      },
      {
        id: 'B',
        textEn: 'Call `Database.commit()` between the `insert` and the `Http().send(req)`.',
        text: '在 `insert` 和 `Http().send(req)` 之间调用 `Database.commit()`。',
        whyRightOrWrong: '❌ Incorrect (错误): Apex does not have a `Database.commit()` method; transactions only commit when the entire execution completes.',
      },
      {
        id: 'C',
        textEn: 'Call `Database.setSavepoint()` before the callout.',
        text: '在 Callout 之前调用 `Database.setSavepoint()`。',
        whyRightOrWrong: '❌ Incorrect (错误): Calling `Database.setSavepoint()` itself counts as uncommitted DML work and ALSO triggers `You have uncommitted work pending` if a callout follows!',
      },
      {
        id: 'D',
        textEn: 'Use `Database.insert(acc, false)` before the callout.',
        text: '在 Callout 前改用 `Database.insert(acc, false)`。',
        whyRightOrWrong: '❌ Incorrect (错误): Still leaves uncommitted DML work pending in the transaction.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'Golden Callout Rule: **Callout FIRST, DML SECOND!** Never perform DML (or `Database.setSavepoint()`) before an HTTP Callout in the same transaction (`You have uncommitted work pending`).',
    officialDocTopic: 'Callout Limits and Uncommitted Work Pending',
  },
  {
    id: 'Q69',
    certLevel: 'PD2',
    stage: 'advanced',
    domain: '异步 Apex 与集成架构 (Async Apex & Integration)',
    examDomain: 'Process Automation & Logic (30%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'An `after insert` Apex Trigger on a Platform Event (`Order_Event__e`) encounters a temporary record lock or external resource issue and needs the EventBus to pause and **retry delivering the same batch of events** (up to 9 times) rather than dropping the events. What should the developer do inside the Platform Event trigger?',
    scenario:
      '平台事件（`Order_Event__e`）的 `after insert` 触发器在消费消息时遇到临时行锁冲突，希望 EventBus 稍后**自动重试投递同一批事件**（最多重试 9 次）而不是直接丢弃该批事件。开发者应在触发器中怎么做？',
    options: [
      {
        id: 'A',
        textEn: 'Throw `new EventBus.RetryableException(\'Temporary lock, retry later\')`.',
        text: '抛出 `throw new EventBus.RetryableException(\'Temporary lock, retry later\');`。',
        whyRightOrWrong: '✅ Correct (正确): Throwing `EventBus.RetryableException` rolls back the trigger progress and instructs the EventBus to redeliver the events up to 9 times (`EventBus.TriggerContext.currentContext().retries`).',
      },
      {
        id: 'B',
        textEn: 'Throw a standard `DmlException`.',
        text: '抛出普通的 `DmlException`。',
        whyRightOrWrong: '❌ Incorrect (错误): Throwing a standard unhandled exception in a Platform Event trigger aborts the trigger without retrying and moves the replay ID forward, dropping the batch.',
      },
      {
        id: 'C',
        textEn: 'Call `EventBus.publish(Trigger.new)` again inside the trigger.',
        text: '在触发器中重新调用 `EventBus.publish(Trigger.new)`。',
        whyRightOrWrong: '❌ Incorrect (错误): Wastes daily event publishing allocations and can cause infinite loops.',
      },
      {
        id: 'D',
        textEn: 'Use `addError()` on the Platform Event record.',
        text: '在平台事件记录上调用 `addError()`。',
        whyRightOrWrong: '❌ Incorrect (错误): `addError()` is not used to retry Platform Event delivery.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'PD2 High-Yield: To retry a failed Platform Event trigger batch (up to 9 retries), `throw new EventBus.RetryableException(...)` and check `EventBus.TriggerContext.currentContext().retries`. To control checkpoint progress on partial batch processing, use `EventBus.TriggerContext.currentContext().setResumeCheckpoint(replayId)`.',
    officialDocTopic: 'Retry Platform Event Triggers with EventBus.RetryableException',
  },
  {
    id: 'Q70',
    certLevel: 'PD1',
    stage: 'beginner',
    domain: '安全模型与单元测试 (Security & Testing)',
    examDomain: 'Testing, Debugging & Deployment (20%)',
    questionType: 'single',
    selectCount: 1,
    scenarioEn:
      'Universal Containers needs to create a Sandbox for **full end-to-end performance and load testing (staging)** that contains a complete replica of all Production data and metadata. Which Sandbox type must be used, and what is its standard refresh interval?',
    scenario:
      '公司需要创建一个用于**全量性能压测与准生产演练（Staging）**的 Sandbox，要求包含生产环境的全部业务数据与元数据副本。必须选用哪种类型的 Sandbox？其刷新间隔是多少？',
    options: [
      {
        id: 'A',
        textEn: '**Full Sandbox** (Refreshes every 29 days; contains 100% of production metadata and data).',
        text: '**Full Sandbox（全量沙盒）**（每 29 天可刷新一次，包含生产全部元数据与业务数据，唯一支持性能与负载压测的沙盒）。',
        whyRightOrWrong: '✅ Correct (正确): Only a Full Sandbox supports performance/load testing and contains a full copy of production data (29-day refresh interval).',
      },
      {
        id: 'B',
        textEn: '**Partial Copy Sandbox** (Refreshes every 5 days; 5 GB data limit based on a Sandbox Template).',
        text: '**Partial Copy Sandbox（部分副本沙盒）**（每 5 天刷新一次，最多 5 GB 采样数据，适合 UAT/集成测试）。',
        whyRightOrWrong: '❌ Incorrect (错误): Partial Copy is great for UAT with up to 5 GB of sample data (each object capped at 10,000 rows), not full load testing.',
      },
      {
        id: 'C',
        textEn: '**Developer Pro Sandbox** (Refreshes every 1 day; 1 GB data limit, metadata only on creation).',
        text: '**Developer Pro Sandbox**（每 1 天刷新一次，1 GB 数据空间，创建时仅含元数据）。',
        whyRightOrWrong: '❌ Incorrect (错误): Developer Pro copies metadata only (1 GB storage).',
      },
      {
        id: 'D',
        textEn: '**Developer Sandbox** (Refreshes every 1 day; 200 MB data limit, metadata only).',
        text: '**Developer Sandbox**（每 1 天刷新一次，200 MB 数据空间，仅含元数据）。',
        whyRightOrWrong: '❌ Incorrect (错误): For individual coding/unit testing only.',
      },
    ],
    correctOptionIds: ['A'],
    coreTakeaway: 'Four Sandbox Types: 1) `Developer` (200 MB data, 1-day refresh, metadata only); 2) `Developer Pro` (1 GB data, 1-day refresh, metadata only); 3) `Partial Copy` (5 GB data via Sandbox Template, 5-day refresh, UAT); 4) `Full` (Production storage match, 29-day refresh, Load/Performance Testing & Staging).',
    officialDocTopic: 'Sandbox Licenses and Storage Limits by Type',
  },
];
