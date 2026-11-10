import { CodingChallenge } from '../types';

export const CODING_CHALLENGES: CodingChallenge[] = [
  // ==================== C01: Bulkification (Apex + SOQL) ====================
  {
    id: 'C01',
    titleEn: "Refactor SOQL Inside Loop: Bulk Sync Contact Phone via Map<Id, Account>",
    scenarioEn: "A junior developer wrote ContactPhoneSync with a SOQL query inside a for-loop, causing System.LimitException: Too many SOQL queries: 101 when 200 Contacts are imported via Data Loader. Refactor the method to follow Salesforce Bulkification best practices.",
    title: '重构循环内 SOQL：使用 Map<Id, Account> 批量同步联系人电话',
    stage: 'beginner',
    category: 'Apex',
    domain: 'Apex 核心与面向对象 (Apex & OOP)',
    estimatedMinutes: 20,
    scenario:
      '某初级开发者编写了 ContactPhoneSync 类，在遍历 Contact 列表时直接在 for 循环内部查询关联的 Account 电话，导致 Data Loader 导入 200 条联系人时抛出 System.LimitException: Too many SOQL queries: 101。请将其重构为符合 Salesforce 批量化（Bulkification）规范的代码。',
    taskRequirements: [
      '使用 Set<Id> 收集所有非空的 Contact.AccountId',
      '使用 Map<Id, Account> 配合 WHERE Id IN :accountIds 一次性完成查询（仅消耗 1 次 SOQL）',
      '遍历 contacts，若 accountMap 包含对应的 AccountId，则将 Contact.Phone 赋值为父级 Account.Phone',
      '严禁在 for 循环内部出现 [SELECT 查询语句',
    ],
    starterCode: `public inherited sharing class ContactPhoneSync {
    public static void syncPhoneFromAccount(List<Contact> contacts) {
        // TODO 1: 定义 Set<Id> accountIds 收集非空的 c.AccountId
        
        // TODO 2: 将 SOQL 查询结果装入 Map<Id, Account> accountMap
        
        // TODO 3: 再次遍历 contacts，从 accountMap 中安全读取 Phone 并赋值
    }
}`,
    hints: [
      '第一步：先创建一个 Set<Id> accountIds = new Set<Id>(); 遍历 contacts，判断 if (c.AccountId != null) 时调用 accountIds.add(c.AccountId);',
      '第二步：使用 Map 快捷构造函数：Map<Id, Account> accountMap = new Map<Id, Account>([SELECT Id, Phone FROM Account WHERE Id IN :accountIds]);',
      '第三步：遍历 contacts，使用 accountMap.containsKey(c.AccountId) 获取对应的 Account，设置 c.Phone = accountMap.get(c.AccountId).Phone;',
    ],
    acceptanceRules: [
      {
        id: 'r1',
        label: '定义 Set<Id> 收集外键集合',
        description: '必须声明 Set<Id> 并调用 .add(',
        mustMatch: ['Set\\s*<\\s*Id\\s*>', '\\.add\\s*\\('],
      },
      {
        id: 'r2',
        label: '使用 Map<Id, Account> 配合 IN : 绑定变量查询',
        description: '使用 Map<Id, Account> 和 WHERE Id IN :',
        mustMatch: ['Map\\s*<\\s*Id\\s*,\\s*Account\\s*>', 'SELECT[\\s\\S]*FROM\\s+Account[\\s\\S]*WHERE\\s+Id\\s+IN\\s*:'],
      },
      {
        id: 'r3',
        label: '通过 Map.get() 赋值 Contact.Phone',
        description: '调用 .get(c.AccountId) 或类似方式读取父级 Phone',
        mustMatch: ['\\.get\\s*\\(', '\\.Phone'],
      },
    ],
    referenceSolution: `public inherited sharing class ContactPhoneSync {
    public static void syncPhoneFromAccount(List<Contact> contacts) {
        Set<Id> accountIds = new Set<Id>();
        for (Contact c : contacts) {
            if (c.AccountId != null) {
                accountIds.add(c.AccountId);
            }
        }
        if (accountIds.isEmpty()) {
            return;
        }

        Map<Id, Account> accountMap = new Map<Id, Account>(
            [SELECT Id, Phone FROM Account WHERE Id IN :accountIds WITH USER_MODE]
        );

        for (Contact c : contacts) {
            if (accountMap.containsKey(c.AccountId)) {
                c.Phone = accountMap.get(c.AccountId).Phone;
            }
        }
    }
}`,
    solutionWalkthrough: [
      {
        lineOrBlock: 'Set<Id> accountIds = new Set<Id>();',
        explanation: '利用 Set 自动去重特性收集所有外键 AccountId，避免重复查询同一个父客户。',
      },
      {
        lineOrBlock: 'Map<Id, Account> accountMap = new Map<Id, Account>([SELECT ... WHERE Id IN :accountIds]);',
        explanation: 'Apex 核心技巧：直接将 SOQL 列表传入 Map<Id, sObject> 构造器，时间复杂度 O(1) 构建索引字典，永远只消耗 1 次 SOQL。',
      },
      {
        lineOrBlock: 'if (accountMap.containsKey(c.AccountId))',
        explanation: '在内存中完成关联匹配，避免 NullPointerException，200 条记录耗时 < 2ms。',
      },
    ],
    governorLimitImpact: 'SOQL 消耗从 O(N) (200次 → 崩溃) 降至 O(1) (1次 / 100上限)，CPU 耗时降低 98%。',
    mockOutputPreview: {
      type: 'logs',
      logs: [
        '12:00:01.012 | SOQL_EXECUTE_BEGIN | [14] SELECT Id, Phone FROM Account WHERE Id IN :tmpVar1',
        '12:00:01.028 | SOQL_EXECUTE_END   | Rows: 45 | Queries used: 1 / 100',
        '12:00:01.031 | USER_DEBUG         | Successfully synced Phone for 200 Contact records.',
        '12:00:01.032 | CUMULATIVE_LIMIT_USAGE | SOQL queries: 1/100 | DML statements: 0/150 | Heap: 4,120/6,000,000 bytes',
      ],
    },
  },

  // ==================== C02: Apex Map Grouping & Sharing ====================
  {
    id: 'C02',
    titleEn: "Build One-to-Many Index Map: Group Opportunities by AccountId (Map<Id, List<Opportunity>>)",
    scenarioEn: "Group a flat List<Opportunity> by AccountId into a Map<Id, List<Opportunity>> lookup structure in memory while declaring the class with inherited sharing to pass AppExchange security review.",
    title: '构建一对多索引字典：Map<Id, List<Opportunity>> 按客户分组商机',
    stage: 'beginner',
    category: 'Apex',
    domain: 'Apex 核心与面向对象 (Apex & OOP)',
    estimatedMinutes: 20,
    scenario:
      '在复杂业务计算中，我们经常需要将子记录列表按父记录 ID 聚合为 Map<Id, List<Opportunity>> 结构，同时确保类声明为 inherited sharing 以通过安全合规审查。',
    taskRequirements: [
      '将类声明为 public inherited sharing class OpportunityGrouper',
      '定义返回值类型为 Map<Id, List<Opportunity>>',
      '遍历传入的 List<Opportunity> opps，忽略 AccountId == null 的记录',
      '如果 Map 中尚不存在该 AccountId 键，先初始化 new List<Opportunity>()，再将当前商机加入列表',
    ],
    starterCode: `// TODO: 将类声明补充完整（需包含 inherited sharing）
public class OpportunityGrouper {
    public static Map<Id, List<Opportunity>> groupByAccount(List<Opportunity> opps) {
        Map<Id, List<Opportunity>> oppsByAccountId = new Map<Id, List<Opportunity>>();
        // TODO: 遍历 opps 并按 AccountId 分组装入 oppsByAccountId
        
        return oppsByAccountId;
    }
}`,
    hints: [
      '类头应写为：public inherited sharing class OpportunityGrouper',
      '在循环中先检查 if (opp.AccountId != null)，然后检查 if (!oppsByAccountId.containsKey(opp.AccountId))',
      '当 key 不存在时执行 oppsByAccountId.put(opp.AccountId, new List<Opportunity>()); 随后调用 oppsByAccountId.get(opp.AccountId).add(opp);',
    ],
    acceptanceRules: [
      {
        id: 'r1',
        label: '显式声明 inherited sharing',
        description: '类定义中包含 inherited sharing',
        mustMatch: ['inherited\\s+sharing\\s+class\\s+OpportunityGrouper'],
      },
      {
        id: 'r2',
        label: '检查并初始化 Map<Id, List<Opportunity>> 桶',
        description: '使用 containsKey 和 put 初始化新列表',
        mustMatch: ['containsKey', 'put\\s*\\(', 'new\\s+List\\s*<\\s*Opportunity\\s*>'],
      },
      {
        id: 'r3',
        label: '向对应 AccountId 桶添加 Opportunity',
        description: '调用 .get(...).add(...)',
        mustMatch: ['\\.get\\s*\\([^)]+\\)\\s*\\.add\\s*\\('],
      },
    ],
    referenceSolution: `public inherited sharing class OpportunityGrouper {
    public static Map<Id, List<Opportunity>> groupByAccount(List<Opportunity> opps) {
        Map<Id, List<Opportunity>> oppsByAccountId = new Map<Id, List<Opportunity>>();
        if (opps == null) return oppsByAccountId;

        for (Opportunity opp : opps) {
            if (opp.AccountId != null) {
                if (!oppsByAccountId.containsKey(opp.AccountId)) {
                    oppsByAccountId.put(opp.AccountId, new List<Opportunity>());
                }
                oppsByAccountId.get(opp.AccountId).add(opp);
            }
        }
        return oppsByAccountId;
    }
}`,
    solutionWalkthrough: [
      {
        lineOrBlock: 'public inherited sharing class OpportunityGrouper',
        explanation: '遵循最小权限原则，动态继承调用方共享上下文，顶层调用时自动强制 with sharing。',
      },
      {
        lineOrBlock: 'if (!oppsByAccountId.containsKey(opp.AccountId))',
        explanation: '经典的 Map<Id, List<sObject>> 分桶模式，是 Salesforce 内存一对多关联处理的标准范式。',
      },
    ],
    governorLimitImpact: '纯内存哈希分桶 O(N)，0 次 SOQL，0 次 DML。',
    mockOutputPreview: {
      type: 'logs',
      logs: [
        '12:01:10.005 | USER_DEBUG | Grouped 12 Opportunities across 4 unique Accounts',
        '12:01:10.006 | USER_DEBUG | Account 0018d00000A1B2C => 4 Opportunities ($1,240,000)',
        '12:01:10.007 | USER_DEBUG | Account 0018d00000D3E4F => 3 Opportunities ($680,000)',
      ],
    },
  },

  // ==================== C03: SOQL Relationships & Date Literals ====================
  {
    id: 'C03',
    titleEn: "SOQL Relationship Queries: Parent-to-Child Subquery & Child-to-Parent Dot Notation",
    scenarioEn: "Write a single bulkified SOQL query that retrieves Accounts along with their related Contacts subquery (Contacts) and custom Invoices subquery (Invoices__r) using WITH USER_MODE.",
    title: '编写多表关联 SOQL：子查父与日期字面量过滤高价值商机',
    stage: 'beginner',
    category: 'SOQL',
    domain: 'SOQL & SOSL 数据查询 (Data Query)',
    estimatedMinutes: 15,
    scenario:
      '销售总监需要查询本年度（THIS_YEAR）预计成交、金额大于 100,000、且阶段不是 Closed Lost 的所有商机（Opportunity），同时拉取父客户的名称（Account.Name）和行业（Account.Industry），按金额降序排列，最多返回 25 条。',
    taskRequirements: [
      'SELECT 子句需包含 Id, Name, Amount, StageName 以及父级字段 Account.Name, Account.Industry',
      'FROM Opportunity 对象',
      'WHERE 条件包含 Amount > 100000、StageName != \'Closed Lost\' 以及 CloseDate = THIS_YEAR',
      '使用 ORDER BY Amount DESC 并加上 LIMIT 25',
    ],
    starterCode: `-- 请直接编写标准 SOQL 查询语句：
SELECT Id, Name, Amount, StageName
FROM Opportunity
-- TODO: 补充 Account 父级字段、WHERE 过滤条件、ORDER BY 与 LIMIT
`,
    hints: [
      '在 SELECT 中通过点号向上穿透父对象：SELECT Id, Name, Amount, StageName, Account.Name, Account.Industry',
      '在 WHERE 中使用日期字面量：WHERE Amount > 100000 AND StageName != \'Closed Lost\' AND CloseDate = THIS_YEAR',
      '排序与分页：ORDER BY Amount DESC LIMIT 25',
    ],
    acceptanceRules: [
      {
        id: 'r1',
        label: '包含子查父字段 Account.Name 与 Account.Industry',
        description: 'SELECT 子句中查询 Account.Name 和 Account.Industry',
        mustMatch: ['Account\\.Name', 'Account\\.Industry'],
      },
      {
        id: 'r2',
        label: '使用日期字面量 CloseDate = THIS_YEAR 与金额过滤',
        description: 'WHERE 子句包含 CloseDate = THIS_YEAR 和 Amount > 100000',
        mustMatch: ['CloseDate\\s*=\\s*THIS_YEAR', 'Amount\\s*>\\s*100000'],
      },
      {
        id: 'r3',
        label: '按金额降序 ORDER BY Amount DESC 且 LIMIT 25',
        description: '包含 ORDER BY Amount DESC 和 LIMIT 25',
        mustMatch: ['ORDER\\s+BY\\s+Amount\\s+DESC', 'LIMIT\\s+25'],
      },
    ],
    referenceSolution: `SELECT Id, Name, Amount, StageName, CloseDate, Account.Name, Account.Industry
FROM Opportunity
WHERE Amount > 100000
  AND StageName != 'Closed Lost'
  AND CloseDate = THIS_YEAR
ORDER BY Amount DESC NULLS LAST
LIMIT 25`,
    solutionWalkthrough: [
      {
        lineOrBlock: 'Account.Name, Account.Industry',
        explanation: 'Child-to-Parent（子查父）点号语法，无需编写 JOIN，最多支持向上穿透 5 层父级关系。',
      },
      {
        lineOrBlock: 'CloseDate = THIS_YEAR',
        explanation: '使用原生 SOQL Date Literal，自动适配当前用户的 Locale 时区，无需在 Apex 中拼接 Date.newInstance。',
      },
    ],
    governorLimitImpact: '单次 SOQL 查询，LIMIT 25 严格控制返回行数（仅占 50,000 配额的 0.05%）。',
    mockOutputPreview: {
      type: 'table',
      columns: ['Id', 'Name', 'Amount', 'StageName', 'Account.Name', 'Account.Industry'],
      rows: [
        {
          Id: '0068d000009X1aA',
          Name: 'Cloud Core Enterprise License',
          Amount: '$850,000',
          StageName: 'Negotiation/Review',
          'Account.Name': 'Burlington Textiles Corp',
          'Account.Industry': 'Apparel',
        },
        {
          Id: '0068d000009X2bB',
          Name: 'AI Service Cloud Expansion',
          Amount: '$420,000',
          StageName: 'Proposal/Price Quote',
          'Account.Name': 'United Oil & Gas Corp',
          'Account.Industry': 'Energy',
        },
        {
          Id: '0068d000009X3cC',
          Name: 'Global LWC Portal Rollout',
          Amount: '$265,000',
          StageName: 'Value Proposition',
          'Account.Name': 'GenePoint Biotech',
          'Account.Industry': 'Biotechnology',
        },
      ],
    },
  },

  // ==================== C04: LWC Conditional & Iterator ====================
  {
    id: 'C04',
    titleEn: "SOQL Aggregate Queries: GROUP BY AccountId, HAVING Filter & AggregateResult Casting",
    scenarioEn: "Use an AggregateResult SOQL query with SUM(Amount), COUNT(Id), GROUP BY AccountId, and HAVING SUM(Amount) > :minTotal to identify high-value accounts without hitting the 50,000 SOQL row limit.",
    title: 'LWC 现代模板指令：使用 lwc:if 与 iterator:it 渲染商机排行榜',
    stage: 'beginner',
    category: 'LWC',
    domain: 'LWC 现代前端组件 (Lightning Web Components)',
    estimatedMinutes: 20,
    scenario:
      '你需要编写一个 LWC 组件模板，当 hasDeals 为 true 时使用 iterator:it 遍历 deals 数组；在第一项（it.first）展示皇冠标记，在每一项绑定唯一的 key={it.value.Id}，当没有数据时通过 lwc:else 显示空状态提示。',
    taskRequirements: [
      '使用现代条件指令 lwc:if={hasDeals} 和 lwc:else（严禁使用已废弃的 if:true / if:false）',
      '使用 iterator:it={deals} 遍历列表，并在外层节点绑定 key={it.value.Id}',
      '在循环内部使用 lwc:if={it.first} 标记榜首第一项',
    ],
    starterCode: `<template>
    <div class="leaderboard-card">
        <!-- TODO 1: 使用 lwc:if 判断 hasDeals -->
        
            <!-- TODO 2: 使用 iterator:it={deals} 循环渲染，绑定 key={it.value.Id} -->
            
                <!-- TODO 3: 当 it.first 为真时显示 Top 1 标签 -->
                
        <!-- TODO 4: 使用 lwc:else 渲染空状态提示 -->
    </div>
</template>`,
    hints: [
      '外层使用 <template lwc:if={hasDeals}> ... </template><template lwc:else> ... </template>',
      '列表遍历使用 <template iterator:it={deals}><div key={it.value.Id}>...</div></template>',
      '在循环项内部写 <template lwc:if={it.first}><span>TOP 1</span></template> 并通过 {it.value.Name} 读取名称',
    ],
    acceptanceRules: [
      {
        id: 'r1',
        label: '使用现代指令 lwc:if 与 lwc:else',
        description: '模板包含 lwc:if={hasDeals} 与 lwc:else',
        mustMatch: ['lwc:if=\\{hasDeals\\}', 'lwc:else'],
      },
      {
        id: 'r2',
        label: '使用 iterator:it={deals} 与 key={it.value.Id}',
        description: '包含 iterator:it={deals} 和 key={it.value.Id}',
        mustMatch: ['iterator:it=\\{deals\\}', 'key=\\{it\\.value\\.Id\\}'],
      },
      {
        id: 'r3',
        label: '利用 it.first 识别首项记录',
        description: '包含 it.first',
        mustMatch: ['it\\.first'],
      },
    ],
    referenceSolution: `<template>
    <div class="leaderboard-card">
        <template lwc:if={hasDeals}>
            <ul class="deal-list">
                <template iterator:it={deals}>
                    <li key={it.value.Id} class="deal-row">
                        <template lwc:if={it.first}>
                            <span class="crown-badge">🏆 TOP 1 榜首商机</span>
                        </template>
                        <span class="deal-name">{it.value.Name}</span>
                        <span class="deal-amount">{it.value.Amount}</span>
                    </li>
                </template>
            </ul>
        </template>
        <template lwc:else>
            <p class="empty-state">当前季度暂无进行中的商机记录。</p>
        </template>
    </div>
</template>`,
    solutionWalkthrough: [
      {
        lineOrBlock: '<template lwc:if={hasDeals}> ... <template lwc:else>',
        explanation: 'lwc:if 是替代 if:true 的现代标准指令，支持 lwc:elseif 链式分支且渲染性能更佳。',
      },
      {
        lineOrBlock: '<template iterator:it={deals}>',
        explanation: '相比 for:each，iterator:it 额外暴露了 it.first 和 it.last 布尔属性，专用于首尾项差异化 UI 渲染。',
      },
    ],
    governorLimitImpact: '纯客户端 Web Components 渲染，零服务端配额消耗。',
    mockOutputPreview: {
      type: 'lwc-preview',
      componentSummary: '渲染出带 🏆 TOP 1 皇冠徽章的商机排行榜组件，首项高亮展示 Cloud Core Enterprise ($850,000)。',
    },
  },

  // ==================== C05: Before Update Trigger & addError ====================
  {
    id: 'C05',
    titleEn: "Before Trigger Validation & Defaulting: Prevent High-Value Opportunity Deletion & Auto-Fill CloseDate",
    scenarioEn: "Implement an Opportunity Trigger Handler that sets default CloseDate in before insert without extra DML, and blocks deleting Closed Won opportunities over $100,000 in before delete using record.addError().",
    title: 'Before Trigger 状态防回退校验与自动字段填充',
    stage: 'intermediate',
    category: 'Apex',
    domain: 'Trigger 与执行顺序 (Triggers & Order of Execution)',
    estimatedMinutes: 25,
    scenario:
      '业务合规要求：在 Opportunity 更新前（before update），如果旧记录（Trigger.oldMap）的 StageName 已经是 "Closed Won"，严禁将其修改为其他阶段（需调用 addError 阻止保存）；同时如果新记录的 StageName 变为 "Closed Won" 且 CloseDate 为空，自动将 CloseDate 设为 Date.today()。',
    taskRequirements: [
      '从 Trigger.oldMap.get(opp.Id) 获取更新前的旧商机快照',
      '若旧记录 StageName 为 \'Closed Won\' 且新记录 StageName != \'Closed Won\'，调用 opp.addError(...) 拦截',
      '若新记录 StageName == \'Closed Won\' 且 opp.CloseDate == null，直接赋值 opp.CloseDate = Date.today()（无需执行 DML）',
    ],
    starterCode: `public inherited sharing class OpportunityBeforeUpdateHandler {
    public static void validateAndPopulate(List<Opportunity> newOpps, Map<Id, Opportunity> oldMap) {
        for (Opportunity opp : newOpps) {
            Opportunity oldOpp = oldMap.get(opp.Id);
            // TODO 1: 如果 oldOpp.StageName == 'Closed Won' 且新状态改变，调用 opp.addError()
            
            // TODO 2: 如果 opp.StageName == 'Closed Won' 且 opp.CloseDate == null，赋值为 Date.today()
        }
    }
}`,
    hints: [
      '判断状态回退：if (oldOpp.StageName == \'Closed Won\' && opp.StageName != \'Closed Won\') { opp.addError(\'已赢单商机不可回退阶段\'); }',
      '自动填充日期：if (opp.StageName == \'Closed Won\' && opp.CloseDate == null) { opp.CloseDate = Date.today(); }',
      '切记：Before Trigger 中修改当前记录字段绝对不要写 update newOpps;！',
    ],
    acceptanceRules: [
      {
        id: 'r1',
        label: '使用 oldMap.get(opp.Id) 对比新旧 StageName',
        description: '读取 oldMap 并对比 Closed Won 状态',
        mustMatch: ['oldMap\\.get\\s*\\(\\s*opp\\.Id\\s*\\)', 'Closed Won'],
      },
      {
        id: 'r2',
        label: '调用 addError 阻止非法修改',
        description: '调用 .addError(',
        mustMatch: ['\\.addError\\s*\\('],
      },
      {
        id: 'r3',
        label: '使用 Date.today() 自动填充 CloseDate（无多余 DML）',
        description: '赋值 Date.today()',
        mustMatch: ['CloseDate\\s*=\\s*Date\\.today\\s*\\(\\s*\\)'],
      },
    ],
    referenceSolution: `public inherited sharing class OpportunityBeforeUpdateHandler {
    public static void validateAndPopulate(List<Opportunity> newOpps, Map<Id, Opportunity> oldMap) {
        for (Opportunity opp : newOpps) {
            Opportunity oldOpp = oldMap.get(opp.Id);
            if (oldOpp != null && oldOpp.StageName == 'Closed Won' && opp.StageName != 'Closed Won') {
                opp.addError('合规拦截：已赢单（Closed Won）商机严禁回退到其他阶段。');
            }
            if (opp.StageName == 'Closed Won' && opp.CloseDate == null) {
                opp.CloseDate = Date.today();
            }
        }
    }
}`,
    solutionWalkthrough: [
      {
        lineOrBlock: 'opp.addError(...)',
        explanation: '在 Before Trigger 中调用 addError 会标记该单条记录保存失败并在 UI 表单字段旁展示红字报错，同时回滚该记录的更改。',
      },
      {
        lineOrBlock: 'opp.CloseDate = Date.today();',
        explanation: 'Before Trigger 在记录写入数据库（Step 7）之前执行，直接修改 Trigger.new 引用即可随事务自动持久化，0 DML 消耗。',
      },
    ],
    governorLimitImpact: '0 SOQL，0 额外 DML，在 Order of Execution 第 4 步高速完成。',
    mockOutputPreview: {
      type: 'logs',
      logs: [
        '12:02:11.102 | CODE_UNIT_STARTED | OpportunityTrigger on Opportunity trigger event BeforeUpdate',
        '12:02:11.105 | VALIDATION_FAIL   | Record 0068d000001: 合规拦截：已赢单（Closed Won）商机严禁回退到其他阶段。',
        '12:02:11.106 | FIELD_ASSIGNMENT  | Record 0068d000002: CloseDate auto-populated to 2026-11-06',
      ],
    },
  },

  // ==================== C06: Recursion-Safe Trigger Handler ====================
  {
    id: 'C06',
    titleEn: "After Update Trigger & Set<Id> Recursion Guard: Auto-Create Follow-Up Tasks on Stage Change",
    scenarioEn: "Detect when an Opportunity transitions to Closed Won by comparing Trigger.oldMap and Trigger.new, guard against multi-chunk recursion using a static Set<Id> processedIds, and bulk-insert follow-up Tasks.",
    title: '防递归与 >200 条分块安全的 Trigger Handler 设计',
    stage: 'intermediate',
    category: 'Apex',
    domain: 'Trigger 与执行顺序 (Triggers & Order of Execution)',
    estimatedMinutes: 25,
    scenario:
      '当 Case 的 Priority 首次升级为 "High" 时，需要在 After Update 中自动创建一条关联的跟进 Task。为防止工作流二次触发导致无限递归（或 Data Loader 导入 500 条记录分 3 批执行时被简单的 boolean 锁误杀），请使用 static Set<Id> processedIds 实现精准防递归。',
    taskRequirements: [
      '声明 private static Set<Id> processedCaseIds = new Set<Id>()',
      '仅当 c.Priority == \'High\' 且 oldCase.Priority != \'High\' 且 !processedCaseIds.contains(c.Id) 时处理',
      '将已处理的 c.Id 加入 processedCaseIds，并构建 Task 列表在循环外一次性 insert',
    ],
    starterCode: `public inherited sharing class CaseEscalationHandler {
    // TODO 1: 定义静态 Set<Id> processedCaseIds
    

    public static void handleAfterUpdate(List<Case> newCases, Map<Id, Case> oldMap) {
        List<Task> tasksToInsert = new List<Task>();
        for (Case c : newCases) {
            Case oldCase = oldMap.get(c.Id);
            // TODO 2: 判断优先级刚变为 'High' 且未在 processedCaseIds 中
            
        }
        // TODO 3: 循环外批量插入 tasksToInsert
    }
}`,
    hints: [
      '定义静态集合：private static Set<Id> processedCaseIds = new Set<Id>();',
      '条件判断：if (c.Priority == \'High\' && oldCase.Priority != \'High\' && !processedCaseIds.contains(c.Id))',
      '在 if 块内调用 processedCaseIds.add(c.Id); 并 tasksToInsert.add(new Task(WhatId = c.Id, Subject = \'Follow up High Priority Case\')); 最后 if (!tasksToInsert.isEmpty()) insert tasksToInsert;',
    ],
    acceptanceRules: [
      {
        id: 'r1',
        label: '使用 static Set<Id> 而非脆弱的 static Boolean',
        description: '声明 static Set<Id>',
        mustMatch: ['static\\s+Set\\s*<\\s*Id\\s*>'],
      },
      {
        id: 'r2',
        label: '检查 !processedCaseIds.contains(c.Id) 并记录 c.Id',
        description: '调用 contains 和 add',
        mustMatch: ['contains\\s*\\(\\s*c\\.Id\\s*\\)', 'add\\s*\\(\\s*c\\.Id\\s*\\)'],
      },
      {
        id: 'r3',
        label: '循环外批量执行 insert tasksToInsert',
        description: '判断 !tasksToInsert.isEmpty() 后执行 insert',
        mustMatch: ['tasksToInsert\\.isEmpty\\s*\\(\\s*\\)', 'insert\\s+'],
      },
    ],
    referenceSolution: `public inherited sharing class CaseEscalationHandler {
    private static Set<Id> processedCaseIds = new Set<Id>();

    public static void handleAfterUpdate(List<Case> newCases, Map<Id, Case> oldMap) {
        List<Task> tasksToInsert = new List<Task>();

        for (Case c : newCases) {
            Case oldCase = oldMap.get(c.Id);
            if (c.Priority == 'High' &&
                oldCase.Priority != 'High' &&
                !processedCaseIds.contains(c.Id)) {
                processedCaseIds.add(c.Id);
                tasksToInsert.add(new Task(
                    WhatId = c.Id,
                    Subject = '紧急跟进高优工单: ' + c.CaseNumber,
                    Priority = 'High',
                    Status = 'Not Started'
                ));
            }
        }

        if (!tasksToInsert.isEmpty()) {
            insert as user tasksToInsert;
        }
    }
}`,
    solutionWalkthrough: [
      {
        lineOrBlock: 'private static Set<Id> processedCaseIds = new Set<Id>();',
        explanation: '即使 1,000 条记录在同一事务中被拆分为 5 个 200 条的批次，每个批次的新记录 ID 都不在 Set 中，不会漏掉任何一批，同时又能防止同一条记录在同一事务内重复生成 Task。',
      },
    ],
    governorLimitImpact: '支持单事务 1,000+ 条记录分块安全执行，避免 Trigger depth > 16 崩溃。',
    mockOutputPreview: {
      type: 'logs',
      logs: [
        '12:03:00.010 | CHUNK_1 (Records 1-200)   | Matched 35 High Priority Cases -> Inserted 35 Tasks',
        '12:03:00.045 | WORKFLOW_RETRIGGER        | Re-entering AfterUpdate for Chunk 1 -> 0 new matches (Blocked by Set<Id>)',
        '12:03:00.080 | CHUNK_2 (Records 201-400) | Matched 28 High Priority Cases -> Inserted 28 Tasks',
      ],
    },
  },

  // ==================== C07: Aggregate SOQL & Rollup ====================
  {
    id: 'C07',
    titleEn: "LWC Reactive Data Table: @wire with Reactive \"$searchKey\" & Client-Side Filtering",
    scenarioEn: "Build an LWC controller that uses @wire(searchAccounts, { searchKey: \"$searchKey\" }) to reactively load data and renders a lightning-datatable with search input.",
    title: '使用 AggregateResult 聚合查询实现 Lookup 关系汇总统计',
    stage: 'intermediate',
    category: 'SOQL',
    domain: 'SOQL & SOSL 数据查询 (Data Query)',
    estimatedMinutes: 25,
    scenario:
      '由于标准 Roll-Up Summary 字段仅支持 Master-Detail 关系，当自定义对象 Project__c 与 Account 是 Lookup 关系时，我们需要使用 GROUP BY 聚合查询统计每个 Account 下状态为 "Active" 的项目总预算（SUM(Budget__c)）与项目数量（COUNT(Id)）。',
    taskRequirements: [
      '编写返回 List<AggregateResult> 的聚合 SOQL 查询',
      'SELECT Account__c, COUNT(Id) projectCount, SUM(Budget__c) totalBudget FROM Project__c',
      'WHERE Account__c IN :accountIds AND Status__c = \'Active\' GROUP BY Account__c',
      '遍历 AggregateResult，使用 ar.get(\'totalBudget\') 读取汇总值并更新 Account',
    ],
    starterCode: `public inherited sharing class ProjectRollupService {
    public static List<Account> calculateActiveProjectBudget(Set<Id> accountIds) {
        // TODO 1: 编写 GROUP BY Account__c 的 AggregateResult 查询
        List<AggregateResult> groupedResults = [
            SELECT Account__c
            FROM Project__c
            WHERE Account__c IN :accountIds
            GROUP BY Account__c
        ];

        List<Account> accountsToUpdate = new List<Account>();
        // TODO 2: 遍历 groupedResults，使用 (Decimal) ar.get('totalBudget') 构建 Account 更新列表
        
        return accountsToUpdate;
    }
}`,
    hints: [
      '在 SELECT 中为聚合函数起别名：SELECT Account__c, COUNT(Id) projectCount, SUM(Budget__c) totalBudget',
      '在 WHERE 中加入 Status__c = \'Active\'，然后 GROUP BY Account__c',
      '遍历时：Id accId = (Id) ar.get(\'Account__c\'); Decimal total = (Decimal) ar.get(\'totalBudget\');',
    ],
    acceptanceRules: [
      {
        id: 'r1',
        label: '使用 SUM(Budget__c) 与 COUNT(Id) 聚合函数及别名',
        description: '包含 SUM(Budget__c) totalBudget 和 GROUP BY Account__c',
        mustMatch: ['SUM\\s*\\(\\s*Budget__c\\s*\\)\\s+totalBudget', 'GROUP\\s+BY\\s+Account__c'],
      },
      {
        id: 'r2',
        label: '使用 ar.get(\'totalBudget\') 提取聚合结果',
        description: '调用 .get(\'totalBudget\')',
        mustMatch: ['\\.get\\s*\\(\\s*[\'"]totalBudget[\'"]\\s*\\)'],
      },
    ],
    referenceSolution: `public inherited sharing class ProjectRollupService {
    public static List<Account> calculateActiveProjectBudget(Set<Id> accountIds) {
        List<AggregateResult> groupedResults = [
            SELECT Account__c, COUNT(Id) projectCount, SUM(Budget__c) totalBudget
            FROM Project__c
            WHERE Account__c IN :accountIds
              AND Status__c = 'Active'
            GROUP BY Account__c
        ];

        List<Account> accountsToUpdate = new List<Account>();
        for (AggregateResult ar : groupedResults) {
            Id accId = (Id) ar.get('Account__c');
            Decimal totalBudget = (Decimal) ar.get('totalBudget');
            accountsToUpdate.add(new Account(
                Id = accId,
                AnnualRevenue = totalBudget
            ));
        }
        return accountsToUpdate;
    }
}`,
    solutionWalkthrough: [
      {
        lineOrBlock: 'SELECT Account__c, COUNT(Id) projectCount, SUM(Budget__c) totalBudget ... GROUP BY Account__c',
        explanation: '数据库引擎在底层直接完成分组汇总，避免将成千上万条子记录拉回 Apex 内存累加，极大节省 Heap Size 与 CPU 时间。',
      },
      {
        lineOrBlock: '(Decimal) ar.get(\'totalBudget\')',
        explanation: 'AggregateResult.get() 返回 Object 类型，必须显式向下转型为对应的 Decimal、Integer 或 Id。',
      },
    ],
    governorLimitImpact: '将原本需拉取数千行的子表查询压缩为几行 AggregateResult，大幅降低 Heap 内存占用。',
    mockOutputPreview: {
      type: 'table',
      columns: ['Account__c', 'projectCount (COUNT)', 'totalBudget (SUM)'],
      rows: [
        { Account__c: '0018d00000A1B2C', 'projectCount (COUNT)': 6, 'totalBudget (SUM)': '$1,480,000' },
        { Account__c: '0018d00000D3E4F', 'projectCount (COUNT)': 3, 'totalBudget (SUM)': '$620,000' },
      ],
    },
  },

  // ==================== C08: Database.insert Partial Success ====================
  {
    id: 'C08',
    titleEn: "LWC Child-to-Parent Communication: Dispatching CustomEvent & Refreshing Wire Cache via refreshApex",
    scenarioEn: "Implement child-to-parent communication using this.dispatchEvent(new CustomEvent(\"statuschange\", { detail })) and refresh the parent @wire cache using refreshApex(this.wiredResult).",
    title: 'Database.insert(list, false) 部分成功容错与错误收集',
    stage: 'intermediate',
    category: 'Apex',
    domain: 'Apex 核心与面向对象 (Apex & OOP)',
    estimatedMinutes: 20,
    scenario:
      '外部 ERP 批量同步一批 Contact 记录到 Salesforce。业务要求：如果其中少数记录因为邮箱格式错误或缺少必填字段失败，不能影响其余合法记录的入库（Partial Success），并收集所有失败记录的错误消息返回给调用方。',
    taskRequirements: [
      '使用 Database.insert(contacts, false) 执行非全有或全无（allOrNone = false）插入',
      '遍历返回的 List<Database.SaveResult>',
      '当 !sr.isSuccess() 时，遍历 sr.getErrors() 并将 err.getMessage() 加入 errorMessages 列表',
    ],
    starterCode: `public inherited sharing class ContactBulkImporter {
    public static List<String> importContactsPartial(List<Contact> contacts) {
        List<String> errorMessages = new List<String>();
        // TODO 1: 调用 Database.insert(contacts, false) 获取 SaveResult 列表
        
        // TODO 2: 遍历 SaveResult，检查 !sr.isSuccess() 并提取 sr.getErrors()
        
        return errorMessages;
    }
}`,
    hints: [
      '调用方式：List<Database.SaveResult> results = Database.insert(contacts, false);',
      '遍历 results：for (Database.SaveResult sr : results) { if (!sr.isSuccess()) { ... } }',
      '内层遍历错误：for (Database.Error err : sr.getErrors()) { errorMessages.add(err.getMessage()); }',
    ],
    acceptanceRules: [
      {
        id: 'r1',
        label: '调用 Database.insert(contacts, false) 启用部分成功',
        description: '使用 Database.insert(..., false)',
        mustMatch: ['Database\\.insert\\s*\\(\\s*contacts\\s*,\\s*false\\s*\\)'],
      },
      {
        id: 'r2',
        label: '检查 SaveResult.isSuccess() 与 getErrors()',
        description: '调用 isSuccess() 和 getErrors()',
        mustMatch: ['isSuccess\\s*\\(\\s*\\)', 'getErrors\\s*\\(\\s*\\)'],
      },
    ],
    referenceSolution: `public inherited sharing class ContactBulkImporter {
    public static List<String> importContactsPartial(List<Contact> contacts) {
        List<String> errorMessages = new List<String>();
        List<Database.SaveResult> results = Database.insert(contacts, false);

        for (Database.SaveResult sr : results) {
            if (!sr.isSuccess()) {
                for (Database.Error err : sr.getErrors()) {
                    errorMessages.add(err.getStatusCode() + ': ' + err.getMessage());
                }
            }
        }
        return errorMessages;
    }
}`,
    solutionWalkthrough: [
      {
        lineOrBlock: 'Database.insert(contacts, false)',
        explanation: '第二个参数 allOrNone 设为 false 后，即使有记录失败也不会抛出 DmlException，合法记录正常入库。',
      },
      {
        lineOrBlock: 'for (Database.Error err : sr.getErrors())',
        explanation: '每条失败的记录可能违反了多条校验规则，通过 getErrors() 可获取完整的 StatusCode、Message 和 Fields。',
      },
    ],
    governorLimitImpact: '消耗 1 次 DML 配额，避免因单条脏数据导致整批 200 条记录全部回滚重跑。',
    mockOutputPreview: {
      type: 'logs',
      logs: [
        '12:04:15.020 | DML_BEGIN | Op: Insert | Type: Contact | Rows: 50',
        '12:04:15.088 | DML_END   | Succeeded: 48 | Failed: 2 (Partial commit succeeded)',
        '12:04:15.090 | ERROR_LOG | REQUIRED_FIELD_MISSING: Required fields are missing: [LastName]',
        '12:04:15.091 | ERROR_LOG | INVALID_EMAIL_ADDRESS: Email: invalid email address: bad-email@',
      ],
    },
  },

  // ==================== C09: LWC CustomEvent Child-to-Parent ====================
  {
    id: 'C09',
    titleEn: "Queueable Apex & Job Chaining: Async Account Tier Calculation with sObject Payload",
    scenarioEn: "Implement the Queueable interface to process a List<Account> asynchronously, update their Tier__c field, and chain a follow-up Queueable job when not running inside a test.",
    title: 'LWC 子传父通信：使用 CustomEvent 与 detail 载荷通知父组件',
    stage: 'intermediate',
    category: 'LWC',
    domain: 'LWC 现代前端组件 (Lightning Web Components)',
    estimatedMinutes: 20,
    scenario:
      '你正在开发商机卡片子组件 c-deal-card。当用户点击“标记赢单”按钮时，子组件绝不能直接修改 @api deal 属性，而必须派发一个名为 dealwon 的 CustomEvent，并在 detail 中携带 { dealId: this.deal.Id, amount: this.deal.Amount } 通知父组件更新。',
    taskRequirements: [
      '使用 @api 装饰器声明公开属性 deal',
      '在 handleWinClick 方法中创建 new CustomEvent(\'dealwon\', { detail: ... })',
      '在 detail 对象中包含 dealId 和 amount 属性，并调用 this.dispatchEvent(...)',
    ],
    starterCode: `import { LightningElement, api } from 'lwc';

export default class DealCard extends LightningElement {
    // TODO 1: 使用 @api 声明 deal 属性
    

    handleWinClick() {
        // TODO 2: 创建名为 'dealwon' 的 CustomEvent，在 detail 中传入 dealId 和 amount
        
        // TODO 3: 调用 this.dispatchEvent 派发事件
    }
}`,
    hints: [
      '声明公开属性：@api deal;',
      '创建事件：const winEvent = new CustomEvent(\'dealwon\', { detail: { dealId: this.deal.Id, amount: this.deal.Amount } });',
      '派发事件：this.dispatchEvent(winEvent);',
    ],
    acceptanceRules: [
      {
        id: 'r1',
        label: '使用 @api 声明 deal 公开属性',
        description: '包含 @api deal',
        mustMatch: ['@api\\s+deal'],
      },
      {
        id: 'r2',
        label: '构造 new CustomEvent(\'dealwon\', { detail: ... })',
        description: '使用 CustomEvent 且包含 detail 载荷',
        mustMatch: ['new\\s+CustomEvent\\s*\\(\\s*[\'"]dealwon[\'"]', 'detail\\s*:'],
      },
      {
        id: 'r3',
        label: '调用 this.dispatchEvent 派发事件',
        description: '调用 this.dispatchEvent(',
        mustMatch: ['this\\.dispatchEvent\\s*\\('],
      },
    ],
    referenceSolution: `import { LightningElement, api } from 'lwc';

export default class DealCard extends LightningElement {
    @api deal;

    handleWinClick() {
        const winEvent = new CustomEvent('dealwon', {
            detail: {
                dealId: this.deal.Id,
                amount: this.deal.Amount
            }
        });
        this.dispatchEvent(winEvent);
    }
}`,
    solutionWalkthrough: [
      {
        lineOrBlock: "new CustomEvent('dealwon', { detail: { ... } })",
        explanation: '事件名全小写无 on 前缀；父组件在 HTML 模板中通过 <c-deal-card ondealwon={handleDealWon}> 监听，并从 event.detail.dealId 取值。',
      },
    ],
    governorLimitImpact: '纯浏览器 DOM 原生事件派发，遵循 LWC 单向数据流（One-Way Data Binding）。',
    mockOutputPreview: {
      type: 'lwc-preview',
      componentSummary: 'CustomEvent("dealwon") 派发成功！父组件捕获到 event.detail = { dealId: "0068d000009X1aA", amount: 850000 }。',
    },
  },

  // ==================== C10: LWC @wire & refreshApex ====================
  {
    id: 'C10',
    titleEn: "Batch Apex & Database.Stateful: Process Millions of Stale Opportunities & Summarize Totals",
    scenarioEn: "Implement Database.Batchable<SObject> and Database.Stateful to query up to 50 million records via Database.getQueryLocator, accumulate total revenue across chunks, and send a summary in finish().",
    title: 'LWC @wire 响应式绑定 $recordId 与 refreshApex 缓存刷新',
    stage: 'intermediate',
    category: 'LWC',
    domain: 'LWC 现代前端组件 (Lightning Web Components)',
    estimatedMinutes: 25,
    scenario:
      '在客户详情页组件中，你需要使用 @wire 根据当前页面的 $recordId 响应式获取关联联系人，并在点击刷新按钮或新增联系人后，正确调用 refreshApex() 强制更新 @wire 缓存数据。',
    taskRequirements: [
      '在 @wire(getContactsByAccount, { accountId: \'$recordId\' }) 中使用 $ 前缀绑定响应式参数',
      '在 wiredContacts(result) 回调中将完整的 result 对象赋给 this.wiredContactsResult（切勿在参数中直接解构导致丢失句柄）',
      '在 handleRefresh 方法中调用 refreshApex(this.wiredContactsResult)',
    ],
    starterCode: `import { LightningElement, api, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getContactsByAccount from '@salesforce/apex/ContactController.getContactsByAccount';

export default class AccountContactManager extends LightningElement {
    @api recordId;
    contacts = [];
    error;
    wiredContactsResult;

    // TODO 1: 使用 @wire 调用 getContactsByAccount，传入响应式参数 { accountId: '$recordId' }
    wiredContacts(result) {
        // TODO 2: 保存完整 result 到 this.wiredContactsResult，并分别处理 result.data 和 result.error
    }

    async handleRefresh() {
        // TODO 3: 调用 refreshApex 刷新缓存
    }
}`,
    hints: [
      '装饰器写法：@wire(getContactsByAccount, { accountId: \'$recordId\' })',
      '在 wiredContacts(result) 内部：this.wiredContactsResult = result; if (result.data) { this.contacts = result.data; } else if (result.error) { this.error = result.error; }',
      '刷新缓存：await refreshApex(this.wiredContactsResult);',
    ],
    acceptanceRules: [
      {
        id: 'r1',
        label: '使用 @wire 且参数带响应式前缀 \'$recordId\'',
        description: '包含 @wire 和 \'$recordId\'',
        mustMatch: ['@wire\\s*\\(\\s*getContactsByAccount', '[\'"]\\$recordId[\'"]'],
      },
      {
        id: 'r2',
        label: '保存完整 wire 结果引用 this.wiredContactsResult = result',
        description: '将完整 result 赋值给 wiredContactsResult',
        mustMatch: ['this\\.wiredContactsResult\\s*=\\s*result'],
      },
      {
        id: 'r3',
        label: '调用 refreshApex(this.wiredContactsResult)',
        description: '调用 refreshApex(this.wiredContactsResult)',
        mustMatch: ['refreshApex\\s*\\(\\s*this\\.wiredContactsResult\\s*\\)'],
      },
    ],
    referenceSolution: `import { LightningElement, api, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getContactsByAccount from '@salesforce/apex/ContactController.getContactsByAccount';

export default class AccountContactManager extends LightningElement {
    @api recordId;
    contacts = [];
    error;
    wiredContactsResult;

    @wire(getContactsByAccount, { accountId: '$recordId' })
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

    async handleRefresh() {
        await refreshApex(this.wiredContactsResult);
    }
}`,
    solutionWalkthrough: [
      {
        lineOrBlock: "{ accountId: '$recordId' }",
        explanation: '字符串内的 $ 前缀告诉 LWC Wire Service 监听 this.recordId 的变化，一旦变化自动重新拉取数据。',
      },
      {
        lineOrBlock: 'this.wiredContactsResult = result;',
        explanation: 'refreshApex 必须接收 @wire 注入的完整 provisioned object，若只传入解构后的 result.data 将无法刷新服务端缓存。',
      },
    ],
    governorLimitImpact: '利用客户端 Lightning Data Service 缓存，大幅减少重复 Apex 调用次数。',
    mockOutputPreview: {
      type: 'lwc-preview',
      componentSummary: '@wire 响应式监听已激活：$recordId 变更及 refreshApex(this.wiredContactsResult) 缓存重验证通过。',
    },
  },

  // ==================== C11: Stateful Batch Apex ====================
  {
    id: 'C11',
    titleEn: "REST Callout with Named Credentials & HttpCalloutMock Unit Test",
    scenarioEn: "Make a secure outbound HTTP GET callout using a Named Credential endpoint (\"callout:ERP_Inventory_API/...\") and deserialize the JSON response without hardcoding credentials.",
    title: '编写跨批次保留状态的 Batch Apex (Database.Batchable + Database.Stateful)',
    stage: 'advanced',
    category: 'Apex',
    domain: '异步 Apex 与集成架构 (Async Apex & Integration)',
    estimatedMinutes: 30,
    scenario:
      '公司有 200 万条历史休眠客户记录需要批量归档，并在整个 Batch 跑完后的 finish() 方法中打印出总共处理了多少条记录。请实现 Database.Batchable<sObject> 和 Database.Stateful 接口。',
    taskRequirements: [
      '类声明同时实现 Database.Batchable<sObject> 与 Database.Stateful',
      '在 start() 方法中返回 Database.getQueryLocator([...])（从而支持最高 5,000 万行）',
      '在 execute() 方法中累加成员变量 recordsProcessed 并执行 update scope',
      '实现 finish(Database.BatchableContext bc) 方法',
    ],
    starterCode: `// TODO 1: 实现 Database.Batchable<sObject> 和 Database.Stateful 接口
public inherited sharing class ArchiveInactiveAccountsBatch {
    public Integer recordsProcessed = 0;

    // TODO 2: 编写 start 方法，返回 Database.getQueryLocator
    

    // TODO 3: 编写 execute 方法，更新 Status 并累加 recordsProcessed
    

    // TODO 4: 编写 finish 方法
}`,
    hints: [
      '类头：public inherited sharing class ArchiveInactiveAccountsBatch implements Database.Batchable<sObject>, Database.Stateful',
      'start 方法：public Database.QueryLocator start(Database.BatchableContext bc) { return Database.getQueryLocator([SELECT Id, Type FROM Account WHERE Active__c = \'No\']); }',
      'execute 方法中遍历 scope，累加 recordsProcessed++，然后 update scope;',
    ],
    acceptanceRules: [
      {
        id: 'r1',
        label: '同时实现 Database.Batchable<sObject> 与 Database.Stateful',
        description: 'implements 包含 Batchable 和 Stateful',
        mustMatch: ['Database\\.Batchable\\s*<\\s*sObject\\s*>', 'Database\\.Stateful'],
      },
      {
        id: 'r2',
        label: '使用 Database.getQueryLocator 突破 5000 万行上限',
        description: '调用 Database.getQueryLocator',
        mustMatch: ['Database\\.getQueryLocator'],
      },
      {
        id: 'r3',
        label: '完整实现 start、execute、finish 三个生命周期方法',
        description: '包含 start, execute, finish 方法定义',
        mustMatch: ['start\\s*\\(', 'execute\\s*\\(', 'finish\\s*\\('],
      },
    ],
    referenceSolution: `public inherited sharing class ArchiveInactiveAccountsBatch implements Database.Batchable<sObject>, Database.Stateful {
    public Integer recordsProcessed = 0;

    public Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator([
            SELECT Id, Description
            FROM Account
            WHERE Rating = 'Cold'
        ]);
    }

    public void execute(Database.BatchableContext bc, List<Account> scope) {
        for (Account acc : scope) {
            acc.Description = 'Archived by Nightly Batch';
            recordsProcessed++;
        }
        update scope;
    }

    public void finish(Database.BatchableContext bc) {
        System.debug('Batch completed! Total archived records: ' + recordsProcessed);
    }
}`,
    solutionWalkthrough: [
      {
        lineOrBlock: 'implements Database.Batchable<sObject>, Database.Stateful',
        explanation: '如果不加 Database.Stateful，每个 execute 批次结束后实例变量都会被重置为 0，finish 中拿到的 recordsProcessed 将永远是 0！',
      },
      {
        lineOrBlock: 'Database.getQueryLocator([...])',
        explanation: '使用 QueryLocator 时，SOQL 的 50,000 行限制被放宽至 50,000,000（5000 万）行。',
      },
    ],
    governorLimitImpact: '每个 execute(200条) 批次独享全新的 200 次异步 SOQL、150 次 DML 与 60 秒 CPU 配额。',
    mockOutputPreview: {
      type: 'logs',
      logs: [
        '02:00:00.100 | BATCH_START   | QueryLocator initialized: 1,250,000 matching rows',
        '02:00:01.400 | BATCH_EXECUTE | Batch 1..6250 (Scope 200 each) completed with independent Governor Limits',
        '02:04:12.890 | BATCH_FINISH  | Batch completed! Total archived records: 1250000',
      ],
    },
  },

  // ==================== C12: Security WITH USER_MODE & stripInaccessible ====================
  {
    id: 'C12',
    titleEn: "Security & Apex Unit Testing: WITH USER_MODE, Security.stripInaccessible & 100% Coverage Test",
    scenarioEn: "Enforce CRUD and Field-Level Security (FLS) using Security.stripInaccessible(AccessType.UPDATABLE, records) and write an @IsTest method using @TestSetup, System.runAs(), and Test.startTest()/stopTest().",
    title: '使用 WITH USER_MODE 与 Security.stripInaccessible 加固数据安全',
    stage: 'advanced',
    category: 'Apex',
    domain: '安全模型与单元测试 (Security & Testing)',
    estimatedMinutes: 20,
    scenario:
      '安全审计团队发现你的 LWC 后端控制器在查询与更新 Opportunity 时运行在默认的 System Mode 下，存在越权访问与修改未授权字段的漏洞。请使用 WITH USER_MODE 查询，并在更新前使用 Security.stripInaccessible(AccessType.UPDATABLE, ...) 剥离用户无权修改的字段。',
    taskRequirements: [
      '在 SOQL 查询末尾添加 WITH USER_MODE 强制执行 CRUD、FLS 和 Sharing',
      '在保存更新前调用 Security.stripInaccessible(AccessType.UPDATABLE, opps)',
      '通过 decision.getRecords() 获取净化后的安全记录列表并执行 update',
    ],
    starterCode: `public inherited sharing class SecureOpportunityController {
    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getMyOpportunities() {
        // TODO 1: 在 SOQL 中加入 WITH USER_MODE
        return [
            SELECT Id, Name, Amount, StageName
            FROM Opportunity
            ORDER BY CreatedDate DESC
            LIMIT 20
        ];
    }

    @AuraEnabled
    public static void updateOpportunitiesSafely(List<Opportunity> opps) {
        // TODO 2: 调用 Security.stripInaccessible(AccessType.UPDATABLE, opps)
        
        // TODO 3: 对 decision.getRecords() 执行 update
    }
}`,
    hints: [
      '在 LIMIT 20 之后加上 WITH USER_MODE',
      '调用脱敏方法：SObjectAccessDecision decision = Security.stripInaccessible(AccessType.UPDATABLE, opps);',
      '更新安全列表：update decision.getRecords();',
    ],
    acceptanceRules: [
      {
        id: 'r1',
        label: '在 SOQL 查询中使用 WITH USER_MODE',
        description: '包含 WITH USER_MODE',
        mustMatch: ['WITH\\s+USER_MODE'],
      },
      {
        id: 'r2',
        label: '调用 Security.stripInaccessible(AccessType.UPDATABLE, ...)',
        description: '使用 Security.stripInaccessible 和 AccessType.UPDATABLE',
        mustMatch: ['Security\\.stripInaccessible', 'AccessType\\.UPDATABLE'],
      },
      {
        id: 'r3',
        label: '调用 decision.getRecords() 获取净化后的记录',
        description: '调用 getRecords()',
        mustMatch: ['getRecords\\s*\\(\\s*\\)'],
      },
    ],
    referenceSolution: `public inherited sharing class SecureOpportunityController {
    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getMyOpportunities() {
        return [
            SELECT Id, Name, Amount, StageName
            FROM Opportunity
            WITH USER_MODE
            ORDER BY CreatedDate DESC
            LIMIT 20
        ];
    }

    @AuraEnabled
    public static void updateOpportunitiesSafely(List<Opportunity> opps) {
        SObjectAccessDecision decision = Security.stripInaccessible(
            AccessType.UPDATABLE,
            opps
        );
        update as user decision.getRecords();
    }
}`,
    solutionWalkthrough: [
      {
        lineOrBlock: 'WITH USER_MODE',
        explanation: '一次性强制检查当前用户的 Object CRUD、Field-Level Security (FLS) 以及 Sharing Rules。',
      },
      {
        lineOrBlock: 'Security.stripInaccessible(AccessType.UPDATABLE, opps)',
        explanation: '当客户端传入的 JSON 包含只读或无权限字段时，自动静默剥离这些非法字段而不让整个保存操作崩溃，是 AppExchange 安全审查的首选方案。',
      },
    ],
    governorLimitImpact: '原生 C++ 层安全过滤，零额外 SOQL 消耗。',
    mockOutputPreview: {
      type: 'logs',
      logs: [
        '12:05:10.011 | SECURITY_CHECK | WITH USER_MODE enforced on Opportunity query (CRUD + FLS + Sharing verified)',
        '12:05:10.025 | STRIP_INACCESSIBLE | Removed unauthorized field [Manager_Override_Discount__c] before DML update',
        '12:05:10.040 | DML_END | Successfully updated 5 Opportunity records in User Mode',
      ],
    },
  },

  // ==================== C13: Apex Unit Testing (@TestSetup & startTest/stopTest) ====================
  {
    id: 'C13',
    titleEn: "Platform Events Publish & Subscribe: Publish Order_Event__e & Bulk Subscribe in After Insert Trigger",
    scenarioEn: "Publish high-volume Platform Events via EventBus.publish() and write a bulkified after insert trigger on Order_Event__e that handles EventBus.RetryableException.",
    title: '编写标准 Apex 单元测试：@TestSetup、startTest/stopTest 与 Assert',
    stage: 'advanced',
    category: 'Apex',
    domain: '安全模型与单元测试 (Security & Testing)',
    estimatedMinutes: 25,
    scenario:
      '请为异步客户评级服务 AccountRatingQueueable 编写符合生产规范的单元测试类。要求使用 @TestSetup 准备测试数据，使用 Test.startTest() 和 Test.stopTest() 强制异步 Queueable 任务同步执行完成，并使用 Assert.areEqual 検証更新结果。',
    taskRequirements: [
      '使用 @TestSetup 创建并 insert 测试 Account 记录',
      '在测试方法中调用 Test.startTest()、System.enqueueJob(...) 和 Test.stopTest()',
      '在 Test.stopTest() 之后查询数据库并调用 Assert.areEqual（或 System.assertEquals）验证结果',
    ],
    starterCode: `@isTest
private class AccountRatingQueueableTest {
    // TODO 1: 使用 @TestSetup 创建测试 Account 数据
    

    @isTest
    static void testQueueableExecution() {
        List<Account> accs = [SELECT Id, Name, AnnualRevenue FROM Account];
        // TODO 2: 使用 Test.startTest() 和 Test.stopTest() 包裹 System.enqueueJob
        
        // TODO 3: 在 stopTest() 之后查询并调用 Assert.areEqual 断言结果
    }
}`,
    hints: [
      '@TestSetup static void setup() { insert new Account(Name = \'Test Corp\', AnnualRevenue = 6000000); }',
      'Test.startTest(); System.enqueueJob(new AccountRatingQueueable(accs)); Test.stopTest();',
      'Account updated = [SELECT Rating FROM Account LIMIT 1]; Assert.areEqual(\'Hot\', updated.Rating);',
    ],
    acceptanceRules: [
      {
        id: 'r1',
        label: '使用 @TestSetup 初始化测试数据',
        description: '包含 @TestSetup 注解',
        mustMatch: ['@TestSetup'],
      },
      {
        id: 'r2',
        label: '使用 Test.startTest() 与 Test.stopTest() 同步化异步任务',
        description: '包含 Test.startTest() 和 Test.stopTest()',
        mustMatch: ['Test\\.startTest\\s*\\(\\s*\\)', 'Test\\.stopTest\\s*\\(\\s*\\)'],
      },
      {
        id: 'r3',
        label: '使用 Assert.areEqual 或 System.assertEquals 验证业务结果',
        description: '包含 Assert.areEqual 或 System.assertEquals',
        mustMatch: ['(Assert\\.areEqual|System\\.assertEquals)\\s*\\('],
      },
    ],
    referenceSolution: `@isTest
private class AccountRatingQueueableTest {
    @TestSetup
    static void setupData() {
        List<Account> testAccounts = new List<Account>();
        for (Integer i = 0; i < 50; i++) {
            testAccounts.add(new Account(
                Name = 'Enterprise Test ' + i,
                AnnualRevenue = 6000000
            ));
        }
        insert testAccounts;
    }

    @isTest
    static void testQueueableExecution() {
        List<Account> accs = [SELECT Id, Name, AnnualRevenue FROM Account];

        Test.startTest();
        Id jobId = System.enqueueJob(new AccountRatingQueueable(accs));
        Test.stopTest();

        List<Account> updatedAccs = [SELECT Id, Rating FROM Account WHERE Rating = 'Hot'];
        Assert.areEqual(50, updatedAccs.size(), '全部高营收客户在 stopTest 后应被异步更新为 Hot');
    }
}`,
    solutionWalkthrough: [
      {
        lineOrBlock: '@TestSetup static void setupData()',
        explanation: '整个测试类只执行一次数据插入，每个 @isTest 方法结束后自动回滚修改，兼顾测试隔离性与执行速度。',
      },
      {
        lineOrBlock: 'Test.stopTest();',
        explanation: '重置 Governor Limits 并强制队列中的 Queueable 任务立刻同步跑完，使得下一行的 SOQL 能立即查到异步更新后的 Rating。',
      },
    ],
    governorLimitImpact: 'startTest/stopTest 内部独享一套全新的 100 SOQL / 150 DML 测试配额。',
    mockOutputPreview: {
      type: 'logs',
      logs: [
        '12:06:01.005 | TEST_SETUP_START | Inserted 50 Account test records',
        '12:06:01.080 | TEST_START       | AccountRatingQueueableTest.testQueueableExecution',
        '12:06:01.150 | TEST_STOP        | Flushed async job 7078d00000Xyz -> 50 records updated',
        '12:06:01.165 | TEST_PASS        | Assert.areEqual(50, 50) PASSED (Code Coverage: 100%)',
      ],
    },
  },

  // ==================== C14: Platform Events & Named Credentials ====================
  {
    id: 'C14',
    titleEn: "Lightning Message Service (LMS): Cross-DOM Sibling Component Pub/Sub Communication",
    scenarioEn: "Use @wire(MessageContext), subscribe(), publish(), and unsubscribe() from lightning/messageService to synchronize selected Account records between unrelated LWC components on a Lightning page.",
    title: '使用 Named Credential 发起 Callout 与发布 Platform Event',
    stage: 'advanced',
    category: 'Apex',
    domain: '异步 Apex 与集成架构 (Async Apex & Integration)',
    estimatedMinutes: 25,
    scenario:
      '当订单支付成功时，需要通过 Named Credential (callout:Stripe_Gateway/v1/charges) 发起外部 POST 请求（避免硬编码 URL 和密钥），并在遇到异常时通过 EventBus.publish 发布一条 Error_Log__e 平台事件确保错误日志不随事务回滚丢失。',
    taskRequirements: [
      '使用 req.setEndpoint(\'callout:Stripe_Gateway/v1/charges\') 配置 Named Credential 终点',
      '在 catch 块中创建 Error_Log__e 实例并调用 EventBus.publish(...) 发布事件',
    ],
    starterCode: `public inherited sharing class PaymentGatewayService {
    public static void chargeOrder(String payloadJson) {
        try {
            HttpRequest req = new HttpRequest();
            // TODO 1: 使用 Named Credential 设置 Endpoint 为 'callout:Stripe_Gateway/v1/charges'
            
            req.setMethod('POST');
            req.setBody(payloadJson);
            HttpResponse res = new Http().send(req);
        } catch (Exception e) {
            // TODO 2: 使用 EventBus.publish 发布 Error_Log__e 平台事件
            
            throw e;
        }
    }
}`,
    hints: [
      'Named Credential 语法：req.setEndpoint(\'callout:Stripe_Gateway/v1/charges\');',
      '发布平台事件：EventBus.publish(new Error_Log__e(Message__c = e.getMessage()));',
      '注意平台事件对象名以 __e 结尾，发布后继续 throw e; 也不会导致 Publish Immediately 事件回滚。',
    ],
    acceptanceRules: [
      {
        id: 'r1',
        label: '使用 callout:Named_Credential 语法设置 Endpoint',
        description: '调用 setEndpoint(\'callout:Stripe_Gateway/v1/charges\')',
        mustMatch: ['setEndpoint\\s*\\(\\s*[\'"]callout:Stripe_Gateway'],
      },
      {
        id: 'r2',
        label: '调用 EventBus.publish 发布平台事件 (__e)',
        description: '调用 EventBus.publish 和 Error_Log__e',
        mustMatch: ['EventBus\\.publish\\s*\\(', 'Error_Log__e'],
      },
    ],
    referenceSolution: `public inherited sharing class PaymentGatewayService {
    public static void chargeOrder(String payloadJson) {
        try {
            HttpRequest req = new HttpRequest();
            req.setEndpoint('callout:Stripe_Gateway/v1/charges');
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');
            req.setBody(payloadJson);
            HttpResponse res = new Http().send(req);
        } catch (Exception e) {
            EventBus.publish(new Error_Log__e(
                Message__c = e.getMessage()
            ));
            throw e;
        }
    }
}`,
    solutionWalkthrough: [
      {
        lineOrBlock: "req.setEndpoint('callout:Stripe_Gateway/v1/charges');",
        explanation: '使用 callout: 前缀引用 Named Credential，由 Salesforce 平台自动托管终点地址与 OAuth/API Key 鉴权。',
      },
      {
        lineOrBlock: 'EventBus.publish(new Error_Log__e(...));',
        explanation: '配置为 Publish Immediately 的平台事件不会随后续 throw e 导致的数据库事务回滚而丢失，是持久化异常审计日志的标准架构模式。',
      },
    ],
    governorLimitImpact: '消耗 1 次 Callout (上限 100) 与 1 次 EventBus 发布。',
    mockOutputPreview: {
      type: 'logs',
      logs: [
        '12:07:05.012 | CALLOUT_REQUEST  | Endpoint=callout:Stripe_Gateway/v1/charges Method=POST',
        '12:07:05.340 | EVENTBUS_PUBLISH | Published Error_Log__e (Publish Immediately - immune to transaction rollback)',
      ],
    },
  },

  // ==================== C15: Selective SOQL & FOR UPDATE (Architect) ====================
  {
    id: 'C15',
    titleEn: "Enterprise Trigger Handler & Unit of Work: Bulk Savepoint, Partial DML & Error Logging",
    scenarioEn: "Combine Database.setSavepoint(), Database.update(records, false) partial commit, and Database.SaveResult inspection to record granular field errors without losing valid updates.",
    title: '海量数据 (LDV) 调优：改写高选择性 SOQL 并添加 FOR UPDATE 行锁',
    stage: 'architect',
    category: 'SOQL',
    domain: 'SOQL & SOSL 数据查询 (Data Query)',
    estimatedMinutes: 20,
    scenario:
      '某拥有 800 万条 Case 的大型企业组织频繁出现 Non-selective query 超时与并发更新冲突。请将原本包含 Status != \'Closed\' 和 LIKE \'%VIP%\' 的反模式查询，重构为使用索引外键 AccountId IN :accountIds、正向状态集合 Status IN :openStatuses 以及末尾带 FOR UPDATE 行级悲观锁的高选择性查询。',
    taskRequirements: [
      '使用索引外键过滤 WHERE AccountId IN :accountIds',
      '将 != 负向条件改为正向集合过滤 AND Status IN :openStatuses',
      '在查询末尾添加 FOR UPDATE 锁定记录防止并发覆盖',
    ],
    starterCode: `-- 请将以下反模式查询改写为高选择性（Selective）加锁查询：
SELECT Id, CaseNumber, Status, Priority
FROM Case
-- TODO: 使用 AccountId IN :accountIds、Status IN :openStatuses 并在末尾添加 FOR UPDATE
`,
    hints: [
      'WHERE 子句写法：WHERE AccountId IN :accountIds AND Status IN :openStatuses',
      '在查询最后一行添加 FOR UPDATE 关键字',
      '完整结构：SELECT Id, CaseNumber, Status, Priority FROM Case WHERE AccountId IN :accountIds AND Status IN :openStatuses FOR UPDATE',
    ],
    acceptanceRules: [
      {
        id: 'r1',
        label: '使用标准外键索引 AccountId IN :accountIds',
        description: '包含 AccountId IN :accountIds',
        mustMatch: ['AccountId\\s+IN\\s*:accountIds'],
      },
      {
        id: 'r2',
        label: '使用正向集合过滤 Status IN :openStatuses（避免 !=）',
        description: '包含 Status IN :openStatuses',
        mustMatch: ['Status\\s+IN\\s*:openStatuses'],
      },
      {
        id: 'r3',
        label: '使用 FOR UPDATE 获取数据库行锁',
        description: '包含 FOR UPDATE',
        mustMatch: ['FOR\\s+UPDATE'],
      },
    ],
    referenceSolution: `SELECT Id, CaseNumber, Status, Priority
FROM Case
WHERE AccountId IN :accountIds
  AND Status IN :openStatuses
FOR UPDATE`,
    solutionWalkthrough: [
      {
        lineOrBlock: 'WHERE AccountId IN :accountIds AND Status IN :openStatuses',
        explanation: 'AccountId 是标准 Lookup 外键，自带底层数据库索引；配合正向 IN 过滤使 Query Plan Cost 降至 0.04（远低于 1.0 阈值）。',
      },
      {
        lineOrBlock: 'FOR UPDATE',
        explanation: '在当前事务完成前锁定选中的 Case 行，阻止其他并发线程或集成接口同时修改同一工单造成数据覆盖。',
      },
    ],
    governorLimitImpact: 'Query Plan Cost 从 2.85 (Full Table Scan 超时) 降至 0.04 (Index Scan < 15ms)。',
    mockOutputPreview: {
      type: 'table',
      columns: ['Leading Operation Type', 'Cardinality', 'sObject Total', 'Relative Cost', 'Row Lock'],
      rows: [
        {
          'Leading Operation Type': 'Index (AccountId)',
          Cardinality: 42,
          'sObject Total': '8,200,000',
          'Relative Cost': '0.04 (Selective ✅)',
          'Row Lock': 'FOR UPDATE Active 🔒',
        },
      ],
    },
  },

  // ==================== C16: LWC Jest Unit Testing ====================
  {
    id: 'C16',
    titleEn: "LWC Jest Unit Testing: Mocking @wire Adapter & Asserting Shadow DOM Re-render",
    scenarioEn: "Write an LWC Jest test using createElement, emit mock data via a wire adapter, wait for the microtask queue with Promise.resolve(), and assert the rendered Shadow DOM elements.",
    title: 'LWC Jest 单元测试：Shadow DOM 查询与微任务异步断言',
    stage: 'architect',
    category: 'LWC',
    domain: '安全模型与单元测试 (Security & Testing)',
    estimatedMinutes: 25,
    scenario:
      '请补全 c-status-banner 组件的 Jest 单元测试：使用 createElement 挂载组件，点击 Shadow DOM 内部的按钮触发状态变更，通过 await Promise.resolve() 等待微任务重绘完成，最后断言 .status-text 元素的文本内容。',
    taskRequirements: [
      '使用 element.shadowRoot.querySelector(\'button\') 获取组件内部按钮并调用 .click()',
      '使用 await Promise.resolve() 等待 LWC 响应式 DOM 更新完成',
      '使用 element.shadowRoot.querySelector(\'.status-text\') 获取文本节点并调用 expect(...).toBe(\'Approved\')',
    ],
    starterCode: `import { createElement } from 'lwc';
import StatusBanner from 'c/statusBanner';

describe('c-status-banner', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('updates status text to Approved when button is clicked', async () => {
        const element = createElement('c-status-banner', { is: StatusBanner });
        document.body.appendChild(element);

        // TODO 1: 通过 element.shadowRoot.querySelector('button') 找到按钮并触发 .click()
        
        // TODO 2: 等待 Promise.resolve() 微任务刷新 DOM
        
        // TODO 3: 查询 element.shadowRoot.querySelector('.status-text') 并断言 textContent 为 'Approved'
    });
});`,
    hints: [
      '点击按钮：const btn = element.shadowRoot.querySelector(\'button\'); btn.click();',
      '等待 DOM 重绘：await Promise.resolve();',
      '断言文本：const txt = element.shadowRoot.querySelector(\'.status-text\'); expect(txt.textContent).toBe(\'Approved\');',
    ],
    acceptanceRules: [
      {
        id: 'r1',
        label: '使用 element.shadowRoot.querySelector 访问封装 DOM',
        description: '调用 element.shadowRoot.querySelector',
        mustMatch: ['element\\.shadowRoot\\.querySelector'],
      },
      {
        id: 'r2',
        label: '调用 await Promise.resolve() 等待响应式重渲染',
        description: '包含 await Promise.resolve()',
        mustMatch: ['await\\s+Promise\\.resolve\\s*\\(\\s*\\)'],
      },
      {
        id: 'r3',
        label: '使用 expect(...).toBe(\'Approved\') 完成断言',
        description: '包含 expect 和 .toBe(\'Approved\')',
        mustMatch: ['expect\\s*\\(', 'toBe\\s*\\(\\s*[\'"]Approved[\'"]\\s*\\)'],
      },
    ],
    referenceSolution: `import { createElement } from 'lwc';
import StatusBanner from 'c/statusBanner';

describe('c-status-banner', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('updates status text to Approved when button is clicked', async () => {
        const element = createElement('c-status-banner', { is: StatusBanner });
        document.body.appendChild(element);

        const buttonEl = element.shadowRoot.querySelector('button');
        buttonEl.click();

        await Promise.resolve();

        const statusTextEl = element.shadowRoot.querySelector('.status-text');
        expect(statusTextEl.textContent).toBe('Approved');
    });
});`,
    solutionWalkthrough: [
      {
        lineOrBlock: 'element.shadowRoot.querySelector(...)',
        explanation: '在 Jest 测试外部访问 LWC 组件内部节点，必须通过 element.shadowRoot 而非 document.querySelector。',
      },
      {
        lineOrBlock: 'await Promise.resolve();',
        explanation: 'LWC 将状态变更后的 DOM 重绘放入异步微任务队列（Microtask Queue），await Promise.resolve() 可确保断言时新 DOM 已渲染完毕。',
      },
    ],
    governorLimitImpact: '本地 Node.js JSDOM 极速运行（单测耗时 ~18ms），无需部署到 Salesforce Org。',
    mockOutputPreview: {
      type: 'logs',
      logs: [
        'PASS  force-app/main/default/lwc/statusBanner/__tests__/statusBanner.test.js',
        '  c-status-banner',
        '    ✓ updates status text to Approved when button is clicked (16 ms)',
        'Test Suites: 1 passed, 1 total | Tests: 1 passed, 1 total',
      ],
    },
  },
];
