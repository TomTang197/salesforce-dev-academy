import { CurriculumLesson } from '../types';

export interface RosettaStoneItem {
  id: string;
  category: 'Automation & Logic' | 'Database & Query' | 'Security & Permissions' | 'Frontend UI (LWC)' | 'DevOps & Tooling';
  titleZh: string;
  titleEn: string;
  adminWorld: {
    badge: string;
    concept: string;
    howYouDidItAsAdmin: string;
    limitationWhyCodeNeeded: string;
  };
  generalCoderWorld: {
    badge: string;
    concept: string;
    familiarCodeOrPattern: string;
    salesforceDifferenceWarning: string;
  };
  salesforceDevWorld: {
    badge: string;
    concept: string;
    codeSnippet: string;
    examKeyTakeaway: string;
  };
}

export interface CoderMindsetShift {
  id: string;
  titleZh: string;
  titleEn: string;
  yourOldInstinct: string;
  salesforceReality: string;
  codeProof: string;
}

/**
 * 4 Foundational Bridge Lessons (L00-1 ~ L00-4)
 * Specifically designed for learners with ADM-201 + Programming Background (JS/TS/Java/SQL)
 */
export const BRIDGE_LESSONS: CurriculumLesson[] = [
  {
    id: 'L00-1',
    daySuggested: 0,
    stage: 'bridge',
    domain: 'Apex 核心与面向对象 (Apex & OOP)',
    examDomain: 'Developer Fundamentals (27%)',
    title: '【先导破冰 01】从 ADM Object Manager 到 SFDX 工程与 sObject 内存模型',
    titleEn: 'Bridge 01: From Admin Object Manager to SFDX Project & sObject Memory Model',
    subtitle: '把你在 Setup 界面配过的 Object、Field、Lookup、15/18位 ID 一一映射为 VS Code 里的源码与内存对象',
    subtitleEn: 'Mapping Setup Objects, Fields, Lookups & 15/18-Char IDs directly to VS Code SFDX Source & Apex sObjects',
    estimatedMinutes: 30,
    examFrequency: '极高频必考 (High-Yield)',
    summary:
      '既然你已经拿下了 ADM 认证又懂编程，你完全不需要再学“什么是客户表、什么是主详关系”。本节直接带你打通任督二脉：揭秘你在浏览器 Object Manager 里点的每一个按钮，在本地 VS Code SFDX 工程里对应哪个目录，以及在 Apex 内存中如何变成强类型的 sObject 实例。',
    summaryEn:
      'Since you already hold ADM-201 and know programming, skip the basics! This bridge lesson maps every click in Setup Object Manager directly to SFDX directories in VS Code and strongly-typed sObject instances in Apex memory.',
    examGlossary: [
      {
        termEn: 'sObject (Standard & Custom Object Type)',
        meaningZh: '所有 Salesforce 数据库表记录在 Apex 中的基类（类似 ORM Entity 基类）',
        examSignalPhraseEn: 'generic sObject variable / casting sObject to Account / Schema.SObjectType',
      },
      {
        termEn: '15-char (Case-Sensitive) vs 18-char (Case-Safe) Record Id',
        meaningZh: '15位区分大小写 ID（UI/报表常见）与 18位不区分大小写安全 ID（API/Apex 默认）',
        examSignalPhraseEn: 'Id data type automatically converts 15-character ID to 18-character case-insensitive ID',
      },
      {
        termEn: '__c (Custom Field/Object) vs __r (Custom Relationship Pointer)',
        meaningZh: '__c 代表存储外键 ID 的值字段或表本身；__r 代表指向关联对象实例的引用指针',
        examSignalPhraseEn: 'traverse custom parent relationship using __r / child relationship subquery __r',
      },
    ],
    coreConcepts: [
      {
        heading: '1. ADM 视角 vs 程序员视角：Object Manager 就是你的 ORM Schema 生成器！',
        content: `在传统全栈开发中（如 Node.js + Prisma/TypeORM 或 Java + Hibernate），你在代码里手写 \`CREATE TABLE\` 迁移脚本并定义 \`class AccountEntity\`。
而在 Salesforce 中，**你在 ADM 熟悉的 Object Manager 里创建的对象和字段，会自动在 Apex 编译器底层实时生成对应的强类型 Class！**
- **标准对象（Standard Objects）**：直接用原名作为类名，如 \`Account\`、\`Contact\`、\`Opportunity\`、\`Case\`。
- **自定义对象与字段（Custom Objects & Fields）**：全部带 \`__c\` 后缀，如 \`Invoice__c\`、\`Amount__c\`。
- **多态基类 \`sObject\`**：就像 TypeScript 里的基础接口或 Java 的 \`Object\`，任何 \`Account\`、\`Invoice__c\` 都是 \`sObject\` 的子类，可以向上转型放入 \`List<SObject>\` 中混合执行 DML！`,
        codeSnippet: `// 1. 强类型实例化（就像在 JS/Java 中初始化对象，支持命名参数构造器！）
Account acc = new Account(
    Name = 'Acme Cloud Corp',
    Rating = 'Hot',
    AnnualRevenue = 5000000
);

// 2. 多态基类 sObject（动态编程时极常用）
sObject genericRecord = new Invoice__c(Status__c = 'Paid');
// 使用 .put(fieldName, value) 和 .get(fieldName) 动态读写字段（类似 JS 的 obj['field']）
genericRecord.put('Amount__c', 12800.50);
Decimal amt = (Decimal) genericRecord.get('Amount__c');`,
        language: 'apex',
      },
      {
        heading: '2. 彻底搞懂 __c 与 __r 的本质区别（指针 vs 外键 ID 值）',
        content: `很多初学者背口诀总是混，但你懂编程，用**内存引用（Pointer/Reference）**一眼就能看穿：
假设自定义子对象 \`Invoice__c\` 上有一个指向自定义父对象 \`Client__c\` 的 Lookup 字段：
1. **\`inv.Client__c\`（带 \`__c\`）**：它是一个 **\`Id\` 类型的原始值（Primitive Value）**，存的是 18 位字符串 ID（例如 \`'a018d00000X9Y01AAF'\`）。给它赋值用于绑定外键。
2. **\`inv.Client__r\`（带 \`__r\`）**：它是一个 **指向父级 \`Client__c\` 对象实例的内存指针（Object Reference）**！当你通过 \`inv.Client__r.VIP_Level__c\` 跨表读取父字段时，访问的是引用对象，因此必须用 \`__r\`！
*(注：如果是标准关系字段，如 \`Contact.AccountId\`，则 \`c.AccountId\` 存 ID 值，而去掉 Id 的 \`c.Account.Name\` 是对象指针)*`,
        codeSnippet: `Invoice__c inv = [
    SELECT Id, Name,
           Client__c,              // 外键 ID 值 -> 'a018d00000X9Y01AAF'
           Client__r.Name,         // 通过 __r 指针读取父对象名称 -> 'Global Tech'
           Client__r.VIP_Tier__c   // 通过 __r 指针读取父对象自定义字段
    FROM Invoice__c
    LIMIT 1
];

Id parentId = inv.Client__c;               // 类型是 Id
String parentName = inv.Client__r.Name;    // 类型是 String`,
        language: 'apex',
      },
      {
        heading: '3. ADM 考过的 15 位 vs 18 位 ID，在 Apex 代码里怎么表现？',
        content: `你在考 ADM 时一定背过：Salesforce URL 和老式报表导出的是 **15 位区分大小写（Case-Sensitive）** 的 ID，而在 Excel VLOOKUP 中需要用 \`CASESAFEID()\` 转成 **18 位不区分大小写（Case-Safe）** 的 ID（末尾 3 位是前 15 位大小写的校验码）。
- 在 Apex 中，专门有一个内置原始数据类型叫 **\`Id\`**（注意不是普通 \`String\`，虽然它可以和 \`String\` 互相隐式转换）。
- **程序员必知特性**：只要你把一个合法的 15 位 ID 字符串赋值给 \`Id\` 类型变量，Apex 运行时会自动为你计算出后 3 位校验码并转换为 **18 位 ID**！而且在 Apex 中用 \`==\` 比较两个 \`Id\` 变量时，平台会自动把 15 位与对应的 18 位视为相等！`,
        codeSnippet: `Id recordId15 = '0018d00000A1B2C'; // 赋入 15 位 ID
System.debug(recordId15);           // 自动补齐输出 18 位: '0018d00000A1B2CAAV'

// 如果把非法格式的字符串赋给 Id 类型，会直接抛出 System.StringException: Invalid id!`,
        language: 'apex',
      },
      {
        heading: '4. 本地 VS Code + Salesforce CLI (sf) 工程目录全景图',
        content: `作为管理员，你以前在浏览器 Setup 里点点点；作为开发者，我们在 VS Code 中使用 SFDX 标准目录结构 \`force-app/main/default/\`，你熟知的 ADM 组件全都变成了本地 XML 和源码文件：
- \`objects/Account/fields/VIP_Score__c.field-meta.xml\` → 你在 Object Manager 建的自定义字段
- \`flows/Order_After_Save.flow-meta.xml\` → 你在 Flow Builder 画的流
- \`classes/OrderService.cls\` (+ \`.cls-meta.xml\`) → **Apex 类（类似 Java 的 .java 文件）**
- \`triggers/OrderTrigger.trigger\` (+ \`.trigger-meta.xml\`) → **Apex 数据库触发器**
- \`lwc/orderTracker/\` (\`.html\`, \`.js\`, \`.css\`, \`.js-meta.xml\`) → **Lightning Web Component 前端组件包**`,
        codeSnippet: `# 常用 Salesforce CLI (v2 'sf' 命令) 速查：
sf org login web --alias MyDevSandbox          # 浏览器授权登录沙盒或 Developer Org
sf project deploy start --source-dir force-app # 将本地 VS Code 代码推送到云端 Org
sf project retrieve start --metadata ApexClass # 将云端修改拉取回本地 Git 仓库
sf apex run test --test-level RunLocalTests    # 运行云端 Apex 单元测试`,
        language: 'apex',
      },
    ],
    codeComparison: {
      title: '硬编码 RecordTypeId (Admin 习惯) vs 使用 Schema Describe 动态获取 (Developer 规范)',
      antiPatternLabel: '❌ 初学者把 Sandbox 里的 18位 RecordTypeId 硬编码进代码（部署到生产必崩）',
      antiPatternCode: `public class AccountFactory {
    public static Account createPartnerAccount(String name) {
        // 灾难：沙盒里新建的 RecordType ID 部署到 Production 后 ID 会变！
        return new Account(
            Name = name,
            RecordTypeId = '0128d000000X999AAK'
        );
    }
}`,
      bestPracticeLabel: '✅ 使用 Schema.SObjectType 按 DeveloperName 从内存缓存获取（0 SOQL 消耗）',
      bestPracticeCode: `public inherited sharing class AccountFactory {
    public static Account createPartnerAccount(String name) {
        // 0 次 SOQL！直接按不变的 DeveloperName 从 Schema 缓存读取
        Id partnerRtId = Schema.SObjectType.Account
            .getRecordTypeInfosByDeveloperName()
            .get('Partner_Account')
            .getRecordTypeId();

        return new Account(
            Name = name,
            RecordTypeId = partnerRtId
        );
    }
}`,
      explanation:
        '你在考 ADM 时就知道不要在验证规则或 Flow 里硬编码 ID。在 Apex 中，更不要用 `[SELECT Id FROM RecordType WHERE DeveloperName = ...]` 白白浪费 1 次 SOQL 配额——直接用 `Schema.SObjectType.<Object>.getRecordTypeInfosByDeveloperName()` 是 0 SOQL 的标准满分写法！',
    },
    examTraps: [
      'Exam Trap (考场陷阱): 查询 RecordType ID 时，如果选项里同时出现 `SELECT Id FROM RecordType` 和 `Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName()`，永远选后者，因为它不消耗任何 SOQL 查询配额！',
      'Exam Trap (考场陷阱): 自定义关联字段做跨表查询时，外键 ID 字段本身是 `Custom_Lookup__c`，但一旦用点号跨表读父对象的字段（如 `.Name`），中间必须变成 `Custom_Lookup__r.Name`！',
    ],
    linkedChallengeId: 'C01',
    linkedQuestionIds: ['Q49', 'Q50', 'Q51', 'Q56'],
  },

  {
    id: 'L00-2',
    daySuggested: 0,
    stage: 'bridge',
    domain: 'Apex 核心与面向对象 (Apex & OOP)',
    examDomain: 'Developer Fundamentals (27%)',
    title: '【先导破冰 02】写给有编程功底者的 Apex 速通：与 Java/TS 的 5 大反直觉差异',
    titleEn: 'Bridge 02: Apex for Experienced Programmers — 5 Counter-Intuitive Differences vs Java/TS',
    subtitle: '跳过基础语法，直击大小写不敏感、== 值相等、货币 Decimal 以及最颠覆直觉的 Static 事务生命周期',
    subtitleEn: 'Skip basic syntax: master Case-Insensitivity, == Value Equality, Decimal Currency, and Transaction-Scoped Static Variables',
    estimatedMinutes: 30,
    examFrequency: '极高频必考 (High-Yield)',
    summary:
      '如果你写过 Java、C# 或 TypeScript，你看到 Apex 代码的第一反应会是“这不就是 Java 吗？”。慢着！正是因为 Apex 外表像极了 Java，有经验的程序员反而最容易在『static 变量生命周期』、『字符串 == 比较』和『未查询字段读取』上栽大跟头。',
    summaryEn:
      'If you know Java, C#, or TypeScript, Apex looks 95% familiar. However, that 5% difference—especially transaction-scoped static variables, case-insensitive string equality, and SObjectException on unqueried fields—is where experienced programmers get trapped.',
    examGlossary: [
      {
        termEn: 'Transaction-Scoped Static Variable (事务级静态变量)',
        meaningZh: 'Apex 的 static 变量仅在单次请求事务内有效，绝不会跨用户或跨请求保留！',
        examSignalPhraseEn: 'static variable scope is limited to a single execution context / transaction',
      },
      {
        termEn: 'Case-Insensitive Language (大小写不敏感语言)',
        meaningZh: 'Apex 的类名、方法名、变量名以及字符串 == 比较均默认不区分大小写（Set<String> 却是大小写敏感的！）',
        examSignalPhraseEn: 'Apex is case-insensitive / Set<String> contains case-sensitive elements',
      },
      {
        termEn: 'System.SObjectException (未查询字段访问异常)',
        meaningZh: '读取 SOQL 未显式 SELECT 出来的字段时不会返回 null，而是直接抛运行时异常！',
        examSignalPhraseEn: 'SObject row was retrieved via SOQL without querying the requested field',
      },
    ],
    coreConcepts: [
      {
        heading: '1. 颠覆认知第一条：Apex 的 static 变量不是“全服单例”，而是“单次请求完即焚”！',
        content: `在 Java / C# / Node.js 中，如果你写一个 \`public static Map<String, Object> cache\`，它会一直驻留在服务器 JVM/V8 进程内存中，所有用户的请求都能共享它。
**但在 Salesforce 多租户架构中，没有属于你自己的常驻进程！**
- **Apex 中 \`static\` 变量的生命周期 = 单次数据库事务（Single Transaction）**！
- 当用户点击一次保存按钮，从 \`before trigger\` → \`after trigger\` → \`After-Save Flow（或旧版 Workflow 字段更新）再次更新记录而重跑 trigger\`，这整个链条属于同一个事务，此时 \`static\` 变量是共享的（因此常用来做 **Trigger 防递归锁** 或 **事务内缓存**）。
- 一旦这次点击请求结束返回浏览器，或者开启了一个异步任务（\`@future\` / \`Queueable\`），**所有 \`static\` 变量全部清零重置！**（若需跨事务缓存，必须用 **Platform Cache**）。`,
        codeSnippet: `public class TransactionStateDemo {
    // 注意：这个 count 绝对不会在两个不同用户的请求之间累加！
    // 它只在当前这一次点击触发的同一个 Transaction 内部存活。
    public static Integer triggerExecutionCount = 0;
}`,
        language: 'apex',
      },
      {
        heading: '2. 颠覆认知第二条：字符串比较直接用 ==（不区分大小写且防空指针），但 Set/Map 键却区分大小写！',
        content: `在 Java 中，老手都知道比较字符串不能用 \`==\`（比较内存地址），必须写 \`"Hot".equals(acc.Rating)\`。在 JS/TS 中你习惯写 \`===\`。
**但在 Apex 中：**
1. **\`==\` 对 String、sObject、集合做值相等比较（Value Equality）**（注意：自定义 Apex 类的实例默认按引用比较，除非你重写了 \`equals()\` / \`hashCode()\`），而且 **两边哪怕有一边是 \`null\` 也绝不会报 \`NullPointerException\`**！
2. **String 的 \`==\` 默认不区分大小写（Case-Insensitive）**：在 Apex 里 \`'abc' == 'ABC'\` 的结果是 **\`true\`**！（若需严格区分大小写才调用 \`'abc'.equals('ABC')\`）。
3. **⚠️ 超级大坑：\`Set<String>\` 和 \`Map<String, Object>\` 的 Key 是区分大小写的！**
   如果你往 \`Set<String>\` 里放了 \`'abc'\` 和 \`'ABC'\`，Set 的 \`.size()\` 会是 **2**！因此用 String 做 Map 的 Key 时，务必养成统一 \`.toLowerCase()\` 的习惯！`,
        codeSnippet: `String a = 'Closed Won';
String b = 'CLOSED WON';
String emptyStr = null;

Boolean isSame = (a == b);        // true! (Apex == 对字符串不区分大小写)
Boolean isSafe = (a == emptyStr); // false! (不会抛 NullPointerException)

Set<String> names = new Set<String>{ 'acme', 'ACME' };
System.debug(names.size());       // 输出 2！(Set<String> 和 Map<String, V> 的 Key 区分大小写！)`,
        language: 'apex',
      },
      {
        heading: '3. 颠覆认知第三条：访问 SOQL 没查出来的字段，不是返回 null，而是直接崩！',
        content: `在 TypeScript / JavaScript 或许多 ORM 中，如果数据库查询只查了 \`SELECT id, name\`，当你访问 \`user.phone\` 时，最多返回 \`undefined\` 或 \`null\`。
**但在 Apex 中：**
如果一条 \`Account\` 记录是从 SOQL 查询出来的：\`Account acc = [SELECT Id, Name FROM Account LIMIT 1];\`，此时你只要写一行 \`String p = acc.Phone;\`（因为 \`Phone\` 没写在 \`SELECT\` 列表里），Apex 会在运行时当场爆炸抛出：
**\`System.SObjectException: SObject row was retrieved via SOQL without querying the requested field: Account.Phone\`**！`,
        codeSnippet: `Account acc = [SELECT Id, Name FROM Account LIMIT 1];
// ❌ 下面这行在运行时直接抛 System.SObjectException 崩溃（编译期不报错！）
// String industry = acc.Industry;

// ✅ 如果不确定某字段是否已被 SOQL 查询，可用 acc.isSet('Industry') 或 getPopulatedFieldsAsMap() 检查
if (acc.isSet('Industry')) {
    System.debug(acc.Industry);
}`,
        language: 'apex',
      },
      {
        heading: '4. 财务与数值类型：永远用 Decimal 处理金额（与 ADM 公式字段无缝对应）',
        content: `在 JS/TS 中所有数字都是 IEEE 754 浮点数 \`number\`（容易出现 \`0.1 + 0.2 = 0.30000000000000004\`）。
在 Apex 中，你在 ADM 里创建的 **Currency（货币）** 和 **Percent（百分比）** 以及带小数的 **Number** 字段，在 Apex 里对应的类型全部是高精度定点数 **\`Decimal\`**（自带 \`.setScale(2, RoundingMode.HALF_UP)\` 方法），彻底杜绝浮点精度丢失！`,
        codeSnippet: `Decimal amount = 199.995;
Decimal rounded = amount.setScale(2, System.RoundingMode.HALF_UP); // 200.00`,
        language: 'apex',
      },
    ],
    codeComparison: {
      title: 'Java/JS 程序员直觉写法 vs 纯正 Apex Idiomatic 写法',
      antiPatternLabel: '❌ 带着 Java/JS 习惯写 Apex（冗余或埋下大小写/未查询字段隐患）',
      antiPatternCode: `public class AccountHelper {
    public static void checkAccounts(List<Account> accs) {
        Map<String, Account> nameMap = new Map<String, Account>();
        for (Account a : accs) {
            // 隐患1：如果 a.Name 为 null，a.Name.equals() 会抛 NullPointerException
            if (a.Name.equals('Acme')) {
                System.debug('Found');
            }
            // 隐患2：Map<String, Account> 的 Key 区分大小写，'Acme' 和 'ACME' 会变成两个键
            nameMap.put(a.Name, a);
        }
    }
}`,
      bestPracticeLabel: '✅ 地道 Apex 写法（== 安全判等 + Map Key 统一转小写）',
      bestPracticeCode: `public inherited sharing class AccountHelper {
    public static void checkAccounts(List<Account> accs) {
        Map<String, Account> nameMap = new Map<String, Account>();
        for (Account a : accs) {
            // 1. 直接用 ==，既防 null 又自动忽略大小写
            if (a.Name == 'Acme') {
                System.debug('Found');
            }
            // 2. 用 String 做 Map Key 时统一转小写
            if (String.isNotBlank(a.Name)) {
                nameMap.put(a.Name.toLowerCase(), a);
            }
        }
    }
}`,
      explanation:
        '善用 `String.isBlank(str)` / `String.isNotBlank(str)`（同时检查 null、空字符串 `""` 和纯空格 `"   "`），这是 Apex 最常用的内置工具方法。',
    },
    examTraps: [
      'Exam Trap (考场陷阱): 考题如果问“一个类里有 `public static Integer counter = 0;`，两个用户同时点击按钮各触发一次，counter 最终是多少？”，答案永远是 **各自为 1**，因为 static 变量绝不跨事务共享！',
      'Exam Trap (考场陷阱): 只要代码里出现查询 `[SELECT Id FROM Account]` 后接着读取 `acc.Name`，必选抛出 `System.SObjectException`！',
    ],
    linkedChallengeId: 'C02',
    linkedQuestionIds: ['Q01', 'Q02', 'Q55', 'Q56', 'Q57'],
  },

  {
    id: 'L00-3',
    daySuggested: 0,
    stage: 'bridge',
    domain: 'Trigger 与执行顺序 (Triggers & Order of Execution)',
    examDomain: 'Process Automation & Logic (28%)',
    title: '【先导破冰 03】把 ADM Flow 画布与 SQL 翻译成 Apex Trigger 与 SOQL',
    titleEn: 'Bridge 03: Translating Admin Record-Triggered Flows & SQL into Apex Triggers & SOQL',
    subtitle: '$Record 就是 Trigger.new，Fast Field Updates 就是 before trigger，Lookup 就是免 JOIN 的关系查询',
    subtitleEn: '$Record is Trigger.new, Fast Field Updates is a before trigger, and Lookups replace SQL JOINs',
    estimatedMinutes: 35,
    examFrequency: '极高频必考 (High-Yield)',
    summary:
      '作为持有 ADM 证的管理员，你对 Record-Triggered Flow（记录触发流）和 Validation Rule 一定了如指掌！实际上，Apex Trigger 的设计哲学与 Record-Triggered Flow 是 100% 同构的！本节用一张“Flow 元素 -> Apex 代码”对照表，让你在 15 分钟内彻底学会写 Trigger 和 SOQL。',
    summaryEn:
      'As a Certified Admin, you already know Record-Triggered Flows and Validation Rules inside out. Apex Triggers share the exact same mental model! This lesson translates every Flow element and SQL JOIN directly into Apex Triggers and SOQL.',
    examGlossary: [
      {
        termEn: 'Fast Field Updates (Before-Save Flow) <-> before trigger',
        meaningZh: 'Flow 的“快速字段更新”对应 Apex 的 before trigger：均在记录落库前直接修改自身字段，无需额外 DML',
        examSignalPhraseEn: 'update fields on the triggering record before it is saved to the database',
      },
      {
        termEn: 'Actions and Related Records (After-Save Flow) <-> after trigger',
        meaningZh: 'Flow 的“操作与相关记录”对应 Apex 的 after trigger：记录已生成 Id，适合插入/更新关联表或发通知',
        examSignalPhraseEn: 'access the system-generated Record Id or update related records',
      },
      {
        termEn: '$Record & $Record__Prior <-> Trigger.new & Trigger.oldMap',
        meaningZh: 'Flow 中的当前记录与修改前旧记录，对应 Apex 中的新记录列表与旧记录字典',
        examSignalPhraseEn: 'compare new field value in Trigger.new against old value in Trigger.oldMap',
      },
    ],
    coreConcepts: [
      {
        heading: '1. ADM Flow 画布与 Apex Trigger 的 1:1 完美镜像映射',
        content: `回想你在 Flow Builder 里创建一个 **Record-Triggered Flow** 时做的每一步选择，在 Apex Trigger 里都有一模一样的对应物：
1. **选择触发时机（Optimize the Flow for...）**：
   - Flow 选 **Fast Field Updates (Before-Save)** ↔ Apex 写 **\`before insert, before update\`**（修改当前记录自身字段，直接赋值 \`acc.Rating = 'Hot'\`，不写 \`update acc\`！）。
   - Flow 选 **Actions and Related Records (After-Save)** ↔ Apex 写 **\`after insert, after update\`**（此时 \`acc.Id\` 已经生成！可以去 \`insert new Task(WhatId = acc.Id)\`）。
2. **全局变量对比**：
   - Flow 里的 **\`{!$Record}\`** ↔ Apex 里的 **\`Trigger.new\`**（注意：Trigger 天然是批量化的，所以它是 \`List<Account>\` 而不是单条记录！）。
   - Flow 里的 **\`{!$Record__Prior}\`** ↔ Apex 里的 **\`Trigger.oldMap.get(acc.Id)\`**。
   - Flow 里的 **\`IsChanged\` 操作符** ↔ Apex 里的 **\`acc.StageName != Trigger.oldMap.get(acc.Id).StageName\`**。
   - Flow 里的 **\`Custom Error\` 元素 / Validation Rule** ↔ Apex 里的 **\`acc.addError('报错提示文案')\`**！`,
        codeSnippet: `// 把你在 Flow 里配的逻辑直接“翻译”成 Apex Trigger：
trigger OpportunityTrigger on Opportunity (before insert, before update, after update) {
    if (Trigger.isBefore && (Trigger.isInsert || Trigger.isUpdate)) {
        // 对应 Flow: Fast Field Updates (Before-Save)
        for (Opportunity opp : Trigger.new) { // 遍历 $Record 集合
            if (opp.Amount != null && opp.Amount >= 100000) {
                opp.Description = 'VIP High-Value Deal'; // 直接改自身字段，无需 DML！
            }
        }
    }

    if (Trigger.isAfter && Trigger.isUpdate) {
        // 对应 Flow: Actions and Related Records (After-Save)
        List<Task> followUpTasks = new List<Task>();
        for (Opportunity opp : Trigger.new) {
            Opportunity priorOpp = Trigger.oldMap.get(opp.Id); // 获取 $Record__Prior
            // 判断 StageName IsChanged 且变为 Closed Won
            if (opp.StageName == 'Closed Won' && priorOpp.StageName != 'Closed Won') {
                followUpTasks.add(new Task(
                    Subject = 'Onboarding Kickoff',
                    WhatId = opp.Id,
                    OwnerId = opp.OwnerId
                ));
            }
        }
        if (!followUpTasks.isEmpty()) {
            insert followUpTasks; // 对应 Flow 的 Create Records 元素（批量一次性插入）
        }
    }
}`,
        language: 'apex',
      },
      {
        heading: '2. 写给懂 SQL 的你：为什么 SOQL 没有 JOIN 关键字？因为你在 ADM 里已经建好 Lookup 了！',
        content: `如果你熟悉 MySQL / PostgreSQL，刚写 SOQL 时一定会纳闷：“怎么没有 \`INNER JOIN\` 和 \`LEFT JOIN ON a.id = b.account_id\`？”。
答案非常简单：**因为你在 Object Manager 创建 Lookup 或 Master-Detail 字段时，Salesforce 已经在元数据层把外键关系固定下来了！**
因此 SOQL 不需要你临时写 \`ON a.id = b.account_id\`，而是提供了两种极其优雅的语法：
1. **子查父（Many-to-One，替代 SQL 向上 JOIN）——直接打点（Dot Notation）**：
   \`SELECT Id, Name, Account.Name, Account.Industry FROM Contact\`
2. **父查子（One-to-Many，替代 SQL LEFT OUTER JOIN 聚合子表）——在 SELECT 里写括号子查询**：
   \`SELECT Id, Name, (SELECT Id, LastName FROM Contacts) FROM Account\``,
        codeSnippet: `-- 传统 SQL 写法：
-- SELECT c.Id, c.LastName, a.Name AS AccountName
-- FROM Contact c LEFT JOIN Account a ON c.AccountId = a.Id WHERE a.Rating = 'Hot'

-- Salesforce SOQL 等价写法（利用已知关系直接打点，天然支持最多向上穿透 5 层）：
SELECT Id, LastName, Account.Name, Account.Owner.Email
FROM Contact
WHERE Account.Rating = 'Hot'`,
        language: 'soql',
      },
    ],
    codeComparison: {
      title: 'Flow 思维的“逐条处理” vs Apex Trigger 的“集合批量化 (Bulkification)”',
      antiPatternLabel: '❌ 把单条记录思维带进代码（循环内查数据库 + 循环内 insert）',
      antiPatternCode: `// 如果一次通过 Data Loader 更新 200 条商机，这段代码跑第 151 条时就会因 DML 超限崩溃！
for (Opportunity opp : Trigger.new) {
    if (opp.StageName == 'Closed Won') {
        Task t = new Task(Subject = 'Follow up', WhatId = opp.Id);
        insert t; // ❌ 循环内 DML！
    }
}`,
      bestPracticeLabel: '✅ 先用 List 收集待操作记录，循环外一次性执行 DML',
      bestPracticeCode: `List<Task> tasksToInsert = new List<Task>();
for (Opportunity opp : Trigger.new) {
    if (opp.StageName == 'Closed Won') {
        tasksToInsert.add(new Task(Subject = 'Follow up', WhatId = opp.Id));
    }
}
// ✅ 无论 Trigger.new 有 1 条还是 200 条，永远只消耗 1 次 DML 语句！
if (!tasksToInsert.isEmpty()) {
    insert tasksToInsert;
}`,
      explanation:
        '在 Flow 中，当你在 Loop 里放了一个 Create Records 元素，Flow 也会弹出红字警告你不要在循环里做粉红色的数据库操作。在 Apex 中同理：永远“循环外查 Map，循环内塞 List，循环后单次 DML”！',
    },
    examTraps: [
      'Exam Trap (考场陷阱): 在 `before insert` 中，`Trigger.new` 还没有生成 `Id`，所以 `Trigger.newMap` 和 `Trigger.oldMap` 都是 **null**！千万不要在 `before insert` 中访问 `Trigger.newMap`！',
      'Exam Trap (考场陷阱): 同一个对象的更新需求，如果考题中同时给出“Record-Triggered Flow (Before-Save)”和“Apex Trigger”，当逻辑无需复杂跨表算法时，Salesforce 官方考试遵循“Declarative First（声明式优先）”原则，优先选 Before-Save Flow；但若涉及跨多层无关对象复杂集合运算或自定义异常控制，则选 Apex！',
    ],
    linkedChallengeId: 'C05',
    linkedQuestionIds: ['Q07', 'Q08', 'Q13', 'Q14', 'Q15'],
  },

  {
    id: 'L00-4',
    daySuggested: 0,
    stage: 'bridge',
    domain: 'LWC 现代前端组件 (Lightning Web Components)',
    examDomain: 'User Interface (25%)',
    title: '【先导破冰 04】写给 React/现代前端与 ADM 的 LWC 速通：从组件开发到 App Builder 拖拽上架',
    titleEn: 'Bridge 04: LWC for React/JS Developers & Admins — From Code Bundle to Lightning App Builder',
    subtitle: '把 React 的 Props/State/Hooks 映射为 @api/@track/@wire，并用 .js-meta.xml 把组件上架到你熟悉的记录页',
    subtitleEn: 'Map React Props/State/Hooks to @api/@track/@wire, and expose your LWC on Lightning Record Pages via .js-meta.xml',
    estimatedMinutes: 35,
    examFrequency: '极高频必考 (High-Yield)',
    summary:
      '作为既有编程功底（熟悉 HTML/JS/React/Vue）又懂 ADM（熟悉 Lightning App Builder 拖拽配页面）的学习者，学 LWC 对你来说简直是降维打击！本节带你一次性看懂：一个 LWC 文件夹里的 4 个文件分别干什么、React 概念如何秒切 LWC、以及当你把组件拖进 Account 详情页时，平台是如何自动把当前记录 ID 注入给你的代码的！',
    summaryEn:
      'With your JS/React skills and Admin experience in Lightning App Builder, LWC is a breeze! Learn how the 4 files in an LWC bundle work together, how React Hooks map to LWC decorators, and how Lightning pages auto-inject @api recordId.',
    examGlossary: [
      {
        termEn: '@api recordId & @api objectApiName',
        meaningZh: '当 LWC 放在 Lightning Record Page 上时，平台会自动把当前页面的记录 ID 和对象名注入这两个公共属性',
        examSignalPhraseEn: 'automatically receive the current record ID and object API name on a Lightning Record Page',
      },
      {
        termEn: '.js-meta.xml (isExposed & targets)',
        meaningZh: '决定 LWC 能否出现在管理员的 Lightning App Builder 左侧组件面板或 Screen Flow 中的配置文件',
        examSignalPhraseEn: 'make a Lightning Web Component available in Lightning App Builder on a Record Page',
      },
      {
        termEn: '@wire Service (Reactive Data Provisioning)',
        meaningZh: '类似 React TanStack Query (useQuery) 的声明式响应式数据流，当 $ 参数变化时自动重新拉取缓存或服务端数据',
        examSignalPhraseEn: 'provision immutable data reactively from Lightning Data Service or cacheable Apex',
      },
    ],
    coreConcepts: [
      {
        heading: '1. React / Vue 开发者秒懂 LWC 对照表',
        content: `LWC 基于浏览器原生 W3C Web Components 标准（Custom Elements + Shadow DOM），语法极其清爽：
- **组件基类**：\`export default class MyCard extends LightningElement {}\`
- **父传子 Props (\`props.title\`)** ↔ **\`@api title;\`**（在子组件属性前加 \`@api\` 即可接收父组件传参）。
- **组件内部状态 (\`useState\`)** ↔ 直接声明类属性 \`count = 0;\`（原始类型重新赋值自动触发重绘；若需原地修改深层对象/数组 \`this.filter.status = 'Open'\`，则加 **\`@track filter = {}\`**）。
- **挂载生命周期 (\`useEffect(..., [])\`)** ↔ **\`connectedCallback()\`**（进入 DOM 时触发）与 **\`disconnectedCallback()\`**（卸载时触发）。
- **条件与列表渲染**：
  - React 的 \`{isLoaded ? <A/> : <B/>}\` ↔ LWC 的 **\`<template lwc:if={isLoaded}>...<template lwc:else>...\`**
  - React 的 \`{items.map(item => <li key={item.Id}>)}\` ↔ LWC 的 **\`<template for:each={items} for:item="item"><li key={item.Id}>\`**`,
        codeSnippet: `// accountQuickCard.js
import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import NAME_FIELD from '@salesforce/schema/Account.Name';
import REVENUE_FIELD from '@salesforce/schema/Account.AnnualRevenue';

export default class AccountQuickCard extends LightningElement {
    // 1. 当管理员把组件拖到 Account Record Page 上时，平台自动注入当前记录 ID！
    @api recordId;

    // 2. 类似 React useQuery：一旦 recordId 就绪，自动通过 LDS 拉取字段（无需写一行 Apex！）
    @wire(getRecord, { recordId: '$recordId', fields: [NAME_FIELD, REVENUE_FIELD] })
    account;

    get accountName() {
        return getFieldValue(this.account.data, NAME_FIELD);
    }
}`,
        language: 'javascript',
      },
      {
        heading: '2. 打通 ADM 与 LWC 的桥梁：.js-meta.xml 是如何让组件出现在 App Builder 里的？',
        content: `你当管理员时，经常打开 **Setup -> Edit Page (Lightning App Builder)**，从左侧面板拖拽组件到页面画布上，并在右侧面板填写组件属性。
你写的 LWC 默认是私有的（只能在其他代码组件里通过 \`<c-account-quick-card>\` 引用）。要想让管理员在 App Builder 里看到并拖拽它，只需在同名的 **\`.js-meta.xml\`** 文件里配置三件事：
1. **\`<isExposed>true</isExposed>\`**：公开上架！
2. **\`<targets>\`**：指定允许拖到哪种页面（如 \`lightning__RecordPage\` 记录详情页、\`lightning__AppPage\`、\`lightning__HomePage\`、\`lightning__FlowScreen\` 屏幕流）。
3. **\`<targetConfigs>\`**：把代码里的 \`@api\` 属性暴露成管理员右侧面板的输入框，甚至限制该组件只允许放在 \`Account\` 对象的页面上！`,
        codeSnippet: `<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>61.0</apiVersion>
    <!-- 1. 设为 true 才能在 App Builder 左侧列表中看到 -->
    <isExposed>true</isExposed>
    <masterLabel>客户高管速览卡片 (Account Quick Card)</masterLabel>
    <!-- 2. 允许管理员拖放到记录页、主页和 Screen Flow 中 -->
    <targets>
        <target>lightning__RecordPage</target>
        <target>lightning__HomePage</target>
        <target>lightning__FlowScreen</target>
    </targets>
    <!-- 3. 配置管理员在 App Builder 右侧属性栏可见的字段与对象限制 -->
    <targetConfigs>
        <targetConfig targets="lightning__RecordPage">
            <objects>
                <object>Account</object>
            </objects>
        </targetConfig>
    </targetConfigs>
</LightningComponentBundle>`,
        language: 'xml',
      },
    ],
    codeComparison: {
      title: 'React JSX 思维误区 vs LWC 模板标准写法',
      antiPatternLabel: '❌ 在 LWC 模板里直接写 JS 表达式或用驼峰命名事件（编译直接报错）',
      antiPatternCode: `<!-- ❌ 错误1：LWC 模板严禁在 {} 里写三元运算或函数调用表达式！ -->
<!-- ❌ 错误2：LWC 事件绑定一律全小写 onclick，不能写 React 的 onClick！ -->
<template>
    <div>{amount > 1000 ? 'VIP' : 'Normal'}</div>
    <lightning-button label="Save" onClick={handleSave(recordId)}></lightning-button>
</template>`,
      bestPracticeLabel: '✅ 计算逻辑放入 JS Getter，事件使用全小写 onclick + data-* 属性传参',
      bestPracticeCode: `<!-- ✅ 正确：模板中只绑定简单的属性或 JS getter 名称，事件使用 onclick -->
<template>
    <div>{customerTierLabel}</div>
    <lightning-button
        label="Save"
        data-id={recordId}
        onclick={handleSave}>
    </lightning-button>
</template>`,
      explanation:
        'LWC 为了极致的安全与渲染可预测性，禁止在 HTML 模板的 `{}` 中编写任意 JS 表达式（如 `{a + b}` 或 `{fn()}`）。任何计算属性一律在 `.js` 类中定义为 `get customerTierLabel() { return this.amount > 1000 ? "VIP" : "Normal"; }`！',
    },
    examTraps: [
      'Exam Trap (考场陷阱): 记住驼峰命名转换铁律：文件夹名叫 `orderStatusTracker`（小驼峰 camelCase），在 HTML 模板里引用时必须写成 `<c-order-status-tracker>`（短横线 kebab-case）！',
      'Exam Trap (考场陷阱): 当考题问“如何让 LWC 只允许被管理员拖放到 Account 和 Opportunity 的记录详情页，而不能拖放到 Case 页面？”时，答案永远是在 `.js-meta.xml` 的 `<targetConfig targets="lightning__RecordPage">` 下配置 `<objects><object>Account</object><object>Opportunity</object></objects>`！',
    ],
    linkedChallengeId: 'C07',
    linkedQuestionIds: ['Q19', 'Q20', 'Q22', 'Q24', 'Q86'],
  },
];

/**
 * Interactive 3-Way Rosetta Stone Mappings:
 * [ADM-201 Admin Knowledge] <-> [React/Java/SQL Programmer Knowledge] <-> [Salesforce Developer Implementation]
 */
export const ROSETTA_MAPPINGS: RosettaStoneItem[] = [
  {
    id: 'R01',
    category: 'Automation & Logic',
    titleZh: '1. 记录保存前字段自动计算与赋默认值',
    titleEn: '1. Pre-Save Field Calculation & Defaulting',
    adminWorld: {
      badge: 'ADM-201 管理员视角',
      concept: 'Record-Triggered Flow (Fast Field Updates / Before-Save)',
      howYouDidItAsAdmin:
        '在 Flow Builder 中选择 Fast Field Updates，使用 Assignment 元素直接给 {!$Record.Rating} 赋值为 "Hot"，无需添加 Update Records 元素。',
      limitationWhyCodeNeeded:
        '当逻辑涉及跨多个无直接关联对象的复杂集合比对、动态 Schema 反射或需要高度复用的 OOP 策略模式时，Flow 画布会变得极其臃肿难维护。',
    },
    generalCoderWorld: {
      badge: 'Java / Node / SQL 视角',
      concept: 'ORM @BeforeInsert / @BeforeUpdate Hook 或 DB Before Trigger',
      familiarCodeOrPattern:
        '在 TypeORM / Hibernate 的 @BeforeInsert 钩子中直接修改实体属性 `entity.rating = "Hot"`，框架随后将其一并写入 INSERT SQL。',
      salesforceDifferenceWarning:
        '千万不要在 Salesforce 的 before trigger 中调用 `update Trigger.new;`！因为记录此时还没落库，直接改内存属性就会自动随本次保存落库。',
    },
    salesforceDevWorld: {
      badge: 'Salesforce Developer 写法',
      concept: 'Apex before insert / before update Trigger',
      codeSnippet: `trigger AccountTrigger on Account (before insert, before update) {
    for (Account acc : Trigger.new) { // 遍历批量提交的 $Record
        if (acc.AnnualRevenue != null && acc.AnnualRevenue >= 5000000) {
            acc.Rating = 'Hot'; // 直接修改内存引用，0 DML 消耗！
        }
    }
}`,
      examKeyTakeaway:
        '修改当前触发记录（Trigger.new）自身的字段，99% 选 before trigger（或 Before-Save Flow），且严禁在其中写 DML 语句！',
    },
  },
  {
    id: 'R02',
    category: 'Automation & Logic',
    titleZh: '2. 检测字段值变更并创建关联子记录',
    titleEn: '2. Detecting Field Change & Creating Child Records',
    adminWorld: {
      badge: 'ADM-201 管理员视角',
      concept: 'Record-Triggered Flow (Actions and Related Records) + IsChanged',
      howYouDidItAsAdmin:
        '选择 After-Save Flow，在条件中比较 `{!$Record.StageName} != {!$Record__Prior.StageName}`，然后放一个 Create Records 元素创建 Task，设置 `WhatId = {!$Record.Id}`。',
      limitationWhyCodeNeeded:
        '当需要同时更新/插入多层级的复杂关联子表、精准控制部分成功（Database.insert(list, false)）或自定义事务回滚点（Savepoint）时，需要使用 Apex。',
    },
    generalCoderWorld: {
      badge: 'Java / Node / SQL 视角',
      concept: 'Event Listener / Audit Log Hook Comparing Old vs New Snapshot',
      familiarCodeOrPattern:
        '在 update 接口中先查出旧记录 `oldObj`，对比 `newObj.stage !== oldObj.stage`，然后插入子表记录。',
      salesforceDifferenceWarning:
        '在 Apex Trigger 中不需要你自己发 SOQL 去查修改前的旧值！平台已经免费把旧版本快照装进了 `Trigger.oldMap` 字典里！',
    },
    salesforceDevWorld: {
      badge: 'Salesforce Developer 写法',
      concept: 'Apex after update Trigger + Trigger.oldMap',
      codeSnippet: `trigger OpportunityTrigger on Opportunity (after update) {
    List<Task> tasksToCreate = new List<Task>();
    for (Opportunity opp : Trigger.new) {
        Opportunity oldOpp = Trigger.oldMap.get(opp.Id); // O(1) 读取 $Record__Prior
        if (opp.StageName == 'Closed Won' && oldOpp.StageName != 'Closed Won') {
            tasksToCreate.add(new Task(
                Subject = 'Contract Handover',
                WhatId = opp.Id // 在 after trigger 中 opp.Id 已生成
            ));
        }
    }
    if (!tasksToCreate.isEmpty()) {
        insert tasksToCreate; // 循环外单次批量插入
    }
}`,
      examKeyTakeaway:
        '凡是需要读取新生成的 Record Id（`Trigger.new[i].Id`）或操作其他表（DML），必须使用 `after` trigger！判断字段是否变化一律对比 `Trigger.new` 与 `Trigger.oldMap.get(id)`。',
    },
  },
  {
    id: 'R03',
    category: 'Automation & Logic',
    titleZh: '3. 复杂业务校验阻断保存并在页面字段旁标红报错',
    titleEn: '3. Blocking Record Save with Field-Level Error Message',
    adminWorld: {
      badge: 'ADM-201 管理员视角',
      concept: 'Validation Rule (验证规则) 或 Flow Custom Error 元素',
      howYouDidItAsAdmin:
        '编写公式 `AND(ISPICKVAL(StageName, "Closed Lost"), ISBLANK(Loss_Reason__c))`，并指定错误显示在 `Loss_Reason__c` 字段下方。',
      limitationWhyCodeNeeded:
        '验证规则公式无法发起跨无直接关系表的复杂聚合查询（例如“检查该客户在另一个自定义归档表里是否有未结清的欠款”），此类校验必须用 Apex。',
    },
    generalCoderWorld: {
      badge: 'Java / Node / SQL 视角',
      concept: 'throw new ValidationException("Error message")',
      familiarCodeOrPattern:
        '校验不通过时直接 `throw new BadRequestException()` 中断整个函数调用栈。',
      salesforceDifferenceWarning:
        '在 Trigger 里直接 `throw new MyException()` 会导致整批 200 条记录全部粗暴崩溃且在 UI 上显示难看的堆栈信息；使用 `record.addError()` 才能精准定位到字段并支持 `Database.insert(list, false)` 部分成功！',
    },
    salesforceDevWorld: {
      badge: 'Salesforce Developer 写法',
      concept: 'sObject.addError() (Record-level or Field-level)',
      codeSnippet: `for (Opportunity opp : Trigger.new) {
    if (opp.StageName == 'Closed Lost' && String.isBlank(opp.Loss_Reason__c)) {
        // 精准在具体字段旁标红报错，并阻止该记录保存！
        opp.Loss_Reason__c.addError('When Stage is Closed Lost, Loss Reason is required.');
    }
}`,
      examKeyTakeaway:
        '在 Trigger 中阻止保存或阻止删除（`before delete`），标准答案永远是调用 `record.addError(msg)`！',
    },
  },
  {
    id: 'R04',
    category: 'Database & Query',
    titleZh: '4. 多表关联查询（子查父 & 父查子一对多）',
    titleEn: '4. Relational Queries (Child-to-Parent & Parent-to-Child)',
    adminWorld: {
      badge: 'ADM-201 管理员视角',
      concept: 'Lookup / Master-Detail 跨对象公式字段 & Roll-Up Summary',
      howYouDidItAsAdmin:
        '在公式编辑器里通过 `Account.Owner.Email` 跨对象取父级字段，或在相关列表（Related Lists）里查看子表 `Contacts` 和 `Invoices__r`。',
      limitationWhyCodeNeeded:
        '公式字段不能一次拉取一对多子集合列表供复杂算法或自定义前端表格消费。',
    },
    generalCoderWorld: {
      badge: 'Java / Node / SQL 视角',
      concept: 'SQL INNER JOIN / LEFT OUTER JOIN',
      familiarCodeOrPattern:
        '`SELECT a.Id, a.Name, c.LastName FROM Account a LEFT JOIN Contact c ON c.AccountId = a.Id`',
      salesforceDifferenceWarning:
        'SOQL 严禁写 `SELECT *`，也没有 `JOIN ... ON` 关键字！因为外键已在 ADM Object Manager 中预定义好，直接用点号（向上）或括号子查询（向下）即可。',
    },
    salesforceDevWorld: {
      badge: 'Salesforce Developer 写法',
      concept: 'SOQL Dot Notation & Child Relationship Subquery (__r)',
      codeSnippet: `// 1次 SOQL 同时完成：主表查询 + 向上跨父表 (Owner.Email) + 向下拉取两个子表集合！
List<Account> accs = [
    SELECT Id, Name, Owner.Email,
           (SELECT Id, LastName, Email FROM Contacts),
           (SELECT Id, Amount__c FROM Invoices__r WHERE Status__c = 'Unpaid')
    FROM Account
    WHERE Rating = 'Hot'
    WITH USER_MODE
];`,
      examKeyTakeaway:
        '父查子子查询（Left Outer Join）中，FROM 后面必须写“子关系复数名”：标准对象如 `Contacts`，自定义关系必须加 `__r`（如 `Invoices__r`），绝不能写 `__c`！',
    },
  },
  {
    id: 'R05',
    category: 'Security & Permissions',
    titleZh: '5. 记录级共享权限 (OWD/Sharing) vs 对象与字段级权限 (CRUD/FLS)',
    titleEn: '5. Record-Level Sharing vs Object/Field Security (CRUD/FLS)',
    adminWorld: {
      badge: 'ADM-201 管理员视角',
      concept: 'Sharing Settings (OWD + Role Hierarchy + Sharing Rules) vs Profiles/Permission Sets',
      howYouDidItAsAdmin:
        '在 ADM 中你学过“权限双塔”：Profile/Permission Set 决定你能不能看到这张表和这个字段（CRUD/FLS）；OWD + 角色层级 + 共享规则决定你能看到哪几行记录（Record Sharing）。',
      limitationWhyCodeNeeded:
        '自定义 Apex 传统上（API v66.0 及更早）默认运行在 System Mode（系统模式）下，如果不显式声明安全策略，普通销售员调用你的代码就能看到全公司所有高管薪资字段！（API v67.0 起新编译的类默认 user mode + with sharing，但考试与存量代码仍以显式声明为准。）',
    },
    generalCoderWorld: {
      badge: 'Java / Node / SQL 视角',
      concept: 'RBAC Middleware + Postgres Row-Level Security (RLS)',
      familiarCodeOrPattern:
        '在传统后端你需要自己写 `WHERE owner_id = :currentUserId` 过滤行，并在 DTO 序列化时手动过滤敏感字段。',
      salesforceDifferenceWarning:
        '很多程序员误以为在类上写了 `with sharing` 就万事大吉了——错！`with sharing` 只管“哪几行记录可见（OWD/Sharing）”，完全不管“哪个字段可读可改（FLS/CRUD）”！',
    },
    salesforceDevWorld: {
      badge: 'Salesforce Developer 写法',
      concept: 'inherited sharing + WITH USER_MODE / Security.stripInaccessible',
      codeSnippet: `// 1. 类头声明 inherited sharing：尊重当前用户的 OWD 与共享规则（管“行”）
public inherited sharing class CompensationController {
    @AuraEnabled(cacheable=true)
    public static List<Employee__c> getTeamMembers() {
        // 2. SOQL 加上 WITH USER_MODE：同时强制校验 CRUD + FLS（管“表和列”）+ Sharing（管“行”）！
        return [
            SELECT Id, Name, Base_Salary__c
            FROM Employee__c
            WITH USER_MODE
            LIMIT 50
        ];
    }
}`,
      examKeyTakeaway:
        '把 ADM 的“两套权限”刻进 DNA：管行级可见性用类修饰符 `with sharing / inherited sharing`；管表与字段权限（CRUD/FLS）用 `WITH USER_MODE` 或 `Security.stripInaccessible()`！',
    },
  },
  {
    id: 'R06',
    category: 'Frontend UI (LWC)',
    titleZh: '6. 前端组件状态、属性传参与服务端数据拉取',
    titleEn: '6. Component Props, State & Declarative Server Data Fetching',
    adminWorld: {
      badge: 'ADM-201 管理员视角',
      concept: 'Lightning App Builder 画布组件与右侧属性面板',
      howYouDidItAsAdmin:
        '将组件拖入 Account 记录详情页（Record Page），组件自动识别当前正在查看哪条 Account，无需手动输入 ID。',
      limitationWhyCodeNeeded:
        '标准 Dynamic Forms 和 Related Lists 无法实现高度定制的多步交互看板、实时外部库存比对或复杂图表。',
    },
    generalCoderWorld: {
      badge: 'React / TypeScript 视角',
      concept: 'Props + useState + TanStack Query (useQuery)',
      familiarCodeOrPattern:
        '`function DealCard({ recordId }: Props) { const { data, refetch } = useQuery(["deal", recordId], () => fetchDeal(recordId)); }`',
      salesforceDifferenceWarning:
        '在 LWC 中，响应式参数必须写成带 `$` 的字符串 `\'$recordId\'`；且手动刷新 `@wire` 缓存必须保存完整的 `wiredResult` 传给 `refreshApex(this.wiredResult)`！',
    },
    salesforceDevWorld: {
      badge: 'Salesforce Developer 写法',
      concept: 'LWC @api + @wire + refreshApex()',
      codeSnippet: `import { LightningElement, api, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getRelatedDeals from '@salesforce/apex/DealController.getRelatedDeals';

export default class DealBoard extends LightningElement {
    @api recordId; // 自动由 Lightning Record Page 注入当前记录 ID
    wiredDealsResult; // 保存完整 wire 结果以供 refreshApex 使用
    deals = [];

    @wire(getRelatedDeals, { accountId: '$recordId' })
    wiredDeals(result) {
        this.wiredDealsResult = result;
        if (result.data) this.deals = result.data;
    }

    async handleRefresh() {
        await refreshApex(this.wiredDealsResult); // 强制重新拉取最新数据
    }
}`,
      examKeyTakeaway:
        '凡是供 `@wire` 调用的 Apex 方法，必须加 `@AuraEnabled(cacheable=true)` 且只读无 DML；需要修改数据库时，用普通 `async/await` 命令式调用 `@AuraEnabled` 方法，随后调用 `refreshApex()`！',
    },
  },
  {
    id: 'R07',
    category: 'Frontend UI (LWC)',
    titleZh: '7. 跨组件通信（父子传值 vs 同页无关联组件协同）',
    titleEn: '7. Component Communication (Parent-Child vs Unrelated Siblings)',
    adminWorld: {
      badge: 'ADM-201 管理员视角',
      concept: 'Dynamic Interactions (动态交互) 在 App Builder 中的源组件与目标组件联动',
      howYouDidItAsAdmin:
        '在 App Builder 中将左侧列表组件的“选中行事件”连接到右侧地图组件的刷新属性上。',
      limitationWhyCodeNeeded:
        '需要在代码中定义自定义事件载荷，或者让页面上的 LWC 与老旧的 Aura 组件、Visualforce 页面实时互通消息。',
    },
    generalCoderWorld: {
      badge: 'React / TypeScript 视角',
      concept: 'Callback Props (`onSelect`) vs Global EventBus / Zustand / Context',
      familiarCodeOrPattern:
        '子传父调用 `props.onSelect(item)`；跨无关联组件使用全局 Pub/Sub 或 Context。',
      salesforceDifferenceWarning:
        'LWC 严禁把函数作为 `@api` 回调直接传给子组件当事件用，而是遵循浏览器标准派发 `new CustomEvent(\'select\', { detail })`；跨 DOM 树通信必须用官方的 Lightning Message Service (LMS)！',
    },
    salesforceDevWorld: {
      badge: 'Salesforce Developer 写法',
      concept: 'DOM CustomEvent (子传父) vs Lightning Message Service (跨组件)',
      codeSnippet: `// 1. 子传父：在子组件中派发标准 CustomEvent（父组件用 ondealselect={handleSelect} 监听）
this.dispatchEvent(new CustomEvent('dealselect', {
    detail: { dealId: this.selectedId }
}));

// 2. 同页无父子关系组件（含跨 LWC/Aura/VF）：使用 Lightning Message Service (LMS)
import { publish, subscribe, MessageContext } from 'lightning/messageService';
import DEAL_CHANNEL from '@salesforce/messageChannel/DealSelected__c';`,
      examKeyTakeaway:
        '考场铁律：父传子用 `@api`；子传父用 `CustomEvent`；同一页面没有嵌套关系的组件（尤其是 LWC 与 Aura/VF 之间）通信，必选 **Lightning Message Service (LMS)**！',
    },
  },
  {
    id: 'R08',
    category: 'DevOps & Tooling',
    titleZh: '8. 配置表与环境开关迁移（告别硬编码与手动导数据）',
    titleEn: '8. Migrating App Configuration & Feature Flags Across Environments',
    adminWorld: {
      badge: 'ADM-201 管理员视角',
      concept: 'Custom Metadata Types (__mdt) vs Custom Settings (__c)',
      howYouDidItAsAdmin:
        '在 Setup 中创建 Custom Metadata Type 并在验证规则或 Flow 中通过 `$CustomMetadata` 引用，用 Change Set 部署时发现记录会自动跟着过去！',
      limitationWhyCodeNeeded:
        '在 Apex 代码中需要根据当前环境读取 API 密钥、折扣阈值或插件类名，且不能消耗宝贵的 100 次 SOQL 配额。',
    },
    generalCoderWorld: {
      badge: 'Java / Node / SQL 视角',
      concept: '`.env` Environment Variables / Config JSON Files vs Redis Feature Flags',
      familiarCodeOrPattern:
        '`process.env.TAX_RATE` 或在 JSON 配置文件中管理常量，随 Git 部署。',
      salesforceDifferenceWarning:
        'Salesforce 没有 `.env` 文件！使用 `Custom_Config__mdt.getInstance(\'US_Tax\')` 既能像代码一样随包部署，又能让管理员在生产 Setup 界面随时热修改，且消耗 0 次 SOQL！',
    },
    salesforceDevWorld: {
      badge: 'Salesforce Developer 写法',
      concept: 'Custom Metadata getAll() / getInstance() & Hierarchy Custom Settings',
      codeSnippet: `// 1. 读取可随包部署的自定义元数据记录（0 次 SOQL，直接读缓存！）
Tax_Rule__mdt usRule = Tax_Rule__mdt.getInstance('US_California');
Decimal rate = usRule.Tax_Rate__c;

// 2. 读取按当前登录用户的 Profile/User 个性化覆写的层级设置（0 次 SOQL！）
Trigger_Switch__c sw = Trigger_Switch__c.getInstance(UserInfo.getUserId());
if (sw.Bypass_Account_Trigger__c) return;`,
      examKeyTakeaway:
        '看到“配置数据需要随 Package / Change Set 一起部署迁移”必选 **Custom Metadata Types (`__mdt`)**；看到“根据不同 Profile 或特定 User 动态开启/关闭某功能”必选 **Hierarchy Custom Settings**！',
    },
  },
];

/**
 * 6 Counter-Intuitive Mindset Shifts for Experienced Programmers
 */
export const CODER_MINDSET_SHIFTS: CoderMindsetShift[] = [
  {
    id: 'MS01',
    titleZh: '陷阱 1：以为 static 变量像 Java/Node 一样常驻服务器内存',
    titleEn: 'Shift 1: Static Variables Are Per-Transaction, NOT Per-Server',
    yourOldInstinct:
      '在 Java / C# / Node.js 中，`static` 变量存放在进程内存中，User A 请求修改了 `static count++`，User B 接着请求能读到累加后的值。',
    salesforceReality:
      'Apex 的 `static` 变量生命周期严格绑定在**单次请求事务（Single Transaction）**内！请求一结束立即销毁。更致命的是：当 Apex 代码用一条 DML 语句一次插入 1,000 条记录时，这 1,000 条记录会拆成 5 批（每批 200 条）在**同一个事务**里连续触发 5 次 Trigger——如果你用简单的 `static Boolean hasRun = true` 防递归，后 800 条记录会被直接吞掉不执行！',
    codeProof: `// ❌ 错误防递归（会吞掉 >200 条以后的所有批次）：
public static Boolean hasRun = false;

// ✅ 正确防递归（按已处理的记录 ID 集合拦截）：
public static Set<Id> processedIds = new Set<Id>();`,
  },
  {
    id: 'MS02',
    titleZh: '陷阱 2：习惯在代码里写 SQL JOIN 或未 SELECT 字段直接当 null 读',
    titleEn: 'Shift 2: No SQL JOINs & Unqueried Fields Throw SObjectException',
    yourOldInstinct:
      '在 SQL 里随便 `SELECT *` 或 `LEFT JOIN`；在 JS 里访问对象没查出来的属性顶多返回 `undefined`。',
    salesforceReality:
      'SOQL 严禁 `SELECT *`，也没有 `JOIN` 关键字（改用点号向上穿透父表 `Account.Name`，或括号子查询向下拉子表 `(SELECT Id FROM Contacts)`）。而且只要你读取了未在 `SELECT` 中显式列出的字段，运行时会立即抛出 `System.SObjectException`！',
    codeProof: `Account a = [SELECT Id FROM Account LIMIT 1];
// ❌ 运行时立即崩溃：SObject row was retrieved via SOQL without querying Account.Name
String n = a.Name;`,
  },
  {
    id: 'MS03',
    titleZh: '陷阱 3：在数据库操作（DML）之后发起同步 HTTP 接口调用',
    titleEn: 'Shift 3: Never Make an HTTP Callout After a DML Statement',
    yourOldInstinct:
      '在传统 Web 后端（Spring Boot / Express）中，先 `db.save(order)` 保存订单，紧接着 `await axios.post("https://erp.com/sync")` 同步给外部系统是再正常不过的代码。',
    salesforceReality:
      '在 Salesforce 中，一旦执行了 `insert / update / delete`，当前事务就持有了多租户数据库连接池的行锁。如果此时去等待外部缓慢的 HTTP 响应，会拖垮共享连接池！因此平台会当场抛出 `System.CalloutException: You have uncommitted work pending`。',
    codeProof: `// ✅ 铁律：同一同步事务中，必须【先发所有 HTTP Callout，最后再执行 DML】！
// 或者将 HTTP Callout 剥离到 @future(callout=true) / Queueable 异步任务中执行。`,
  },
  {
    id: 'MS04',
    titleZh: '陷阱 4：以为 try-catch (Exception e) 能捕获所有异常做降级',
    titleEn: 'Shift 4: System.LimitException CANNOT Be Caught by try-catch',
    yourOldInstinct:
      '在 Java / JS 中，只要最外层包一个 `try { ... } catch (Exception e) { ... }`，任何运行时错误都能被兜住并优雅返回错误码。',
    salesforceReality:
      'Salesforce 的 Governor Limits（如 101 次 SOQL、151 次 DML、10 秒 CPU 超时、6MB 堆内存溢出）一旦触发 `System.LimitException`，**任何 `try-catch` 都无法捕获**，虚拟机会直接强制杀死当前事务并全部回滚！',
    codeProof: `// ✅ 预防胜于治疗：在可能超限的场景使用 Limits 类提前检查剩余配额
if (Limits.getQueries() < Limits.getLimitQueries()) {
    // 安全执行查询
}`,
  },
  {
    id: 'MS05',
    titleZh: '陷阱 5：在 LWC 模板的 {} 中直接写三元运算或带参函数调用',
    titleEn: 'Shift 5: LWC HTML Templates Forbid Inline JS Expressions',
    yourOldInstinct:
      '在 React JSX 或 Vue 模板中，随手写 `{items.length > 0 ? "有数据" : "空"}` 或 `onClick={() => handleDelete(item.id)}`。',
    salesforceReality:
      'LWC 模板编译器严禁在 `{}` 内出现任何运算符、三元表达式或函数调用括号！所有派生状态必须在 `.js` 类中写成 `get hasItems() { return this.items.length > 0; }`，列表项传参则通过 `data-id={item.Id}` + `event.currentTarget.dataset.id` 获取。',
    codeProof: `// LWC JS Controller:
get hasItems() { return this.items && this.items.length > 0; }
handleDelete(event) { const id = event.currentTarget.dataset.id; }`,
  },
  {
    id: 'MS06',
    titleZh: '陷阱 6：以为单元测试可以直接连沙盒已有数据或真实发网络请求',
    titleEn: 'Shift 6: Unit Tests Are 100% Isolated from Org Data & Network',
    yourOldInstinct:
      '在本地跑集成测试时，直接查开发库里现成的测试数据，或者在测试里直接请求测试环境的外部 API。',
    salesforceReality:
      'Apex `@IsTest` 默认处于完全隔离的空白沙箱（`SeeAllData=false`），Org 里的真实业务表在测试中查出来全是 0 条（必须用 `@TestSetup` 自己造数）；且测试中严禁发出真实网络请求（必须使用 `Test.setMock(HttpCalloutMock.class, ...)`），SOSL 全文检索也必须调用 `Test.setFixedSearchResults()` 才有返回值！',
    codeProof: `@IsTest
static void testCalloutAndSosl() {
    Test.setFixedSearchResults(new List<Id>{ testAcc.Id });
    Test.setMock(HttpCalloutMock.class, new MyMockResponse());
}`,
  },
];
