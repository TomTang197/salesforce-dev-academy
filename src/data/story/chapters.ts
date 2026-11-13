import type { CharacterId } from './characters';

export type ShelterArea =
  | 'lobby'
  | 'kennels'
  | 'cattery'
  | 'adoption'
  | 'storage'
  | 'yard'
  | 'donation'
  | 'clinic'
  | 'garden';

export interface StoryChapter {
  id: string;
  title: string;
  area: ShelterArea;
  areaLabel: string;
  lessonIds: string[];
}

export interface StoryAnimal {
  id: string;
  name: string;
  species: string;
  portrait: string;
}

export interface LessonStory {
  lessonId: string;
  chapterId: string;
  requesterId: CharacterId;
  animal: StoryAnimal;
  ticketTitleZh: string;
  ticketTitleEn: string;
  intro: string[];
  outro: string;
  newHome: string;
  headline?: string;
}

export const STORY_CHAPTERS: StoryChapter[] = [
  { id: 'prologue', title: '序章 · 门口的纸箱', area: 'lobby', areaLabel: '门厅', lessonIds: ['L00-1', 'L00-2', 'L00-3', 'L00-4'] },
  { id: 'ch1', title: '第一章 · 豆包的档案', area: 'kennels', areaLabel: '犬舍', lessonIds: ['L01', 'L02'] },
  { id: 'ch2', title: '第二章 · 找到每一个家', area: 'cattery', areaLabel: '猫屋', lessonIds: ['L03', 'L04'] },
  { id: 'ch3', title: '第三章 · 重复的申请', area: 'adoption', areaLabel: '领养厅', lessonIds: ['L05', 'L06'] },
  { id: 'ch4', title: '第四章 · 寒潮夜', area: 'storage', areaLabel: '仓库', lessonIds: ['L07', 'L08'] },
  { id: 'ch5', title: '第五章 · 领养日', area: 'yard', areaLabel: '院子', lessonIds: ['L09', 'L10'] },
  { id: 'ch6', title: '第六章 · 捐款人的信', area: 'donation', areaLabel: '捐赠角', lessonIds: ['L11', 'L12'] },
  { id: 'ch7', title: '第七章 · 不再出错', area: 'clinic', areaLabel: '诊室', lessonIds: ['L13', 'L14'] },
  { id: 'finale', title: '终章 · 十年后的窝窝', area: 'garden', areaLabel: '屋顶花园', lessonIds: ['L15', 'L16'] },
];

const animal = (id: string, name: string, species: string): StoryAnimal => ({
  id,
  name,
  species,
  portrait: `/story/animals/${id}.jpg`,
});

export const LESSON_STORIES: LessonStory[] = [
  {
    lessonId: 'L00-1',
    chapterId: 'prologue',
    requesterId: 'alan',
    animal: animal('zhima', '芝麻', '纸箱里的小黑猫'),
    ticketTitleZh: '带我看看这套系统到底长什么样',
    ticketTitleEn: "Map the shelter's org metadata",
    intro: [
      '早上门口又放了一个纸箱，里面是一只小黑猫，我们叫它芝麻。',
      '我想给它建档，可系统里有三个都叫「动物」的对象，我不知道哪个才是真的。',
      '你懂 Object Manager，能帮我理一理，顺便把它们拉到本地看看吗？',
    ],
    outro: '你把旧系统的元数据拉到了本地，理清了真正在用的 Animal__c。芝麻成了新系统里的第一条记录。',
    newHome: '芝麻被隔壁面包店的老板娘领走了，每天在橱窗里晒太阳。',
  },
  {
    lessonId: 'L00-2',
    chapterId: 'prologue',
    requesterId: 'alan',
    animal: animal('tuanzi', '团子', '白色小京巴混种'),
    ticketTitleZh: '前任志愿者留下的代码，我看不懂',
    ticketTitleEn: "Read the old volunteer's Apex",
    intro: [
      '之前帮忙的志愿者回老家了，留下一堆 Apex 代码。',
      '他说跟 Java 差不多，可我看到 Map、Set 就头大。',
      '团子的疫苗提醒就卡在这段代码里，你能先读懂它吗？',
    ],
    outro: '你发现旧代码把 Java 的习惯带进了 Apex，改成了地道写法。团子的疫苗提醒第一次准时发了出去。',
    newHome: '团子去了一对退休教师家，每天傍晚跟着他们在河边散步。',
  },
  {
    lessonId: 'L00-3',
    chapterId: 'prologue',
    requesterId: 'laozhou',
    animal: animal('juzi', '橘子', '胖橘猫'),
    ticketTitleZh: '把入站登记的 Flow 换成 Trigger',
    ticketTitleEn: 'Turn the intake Flow into a Trigger',
    intro: [
      '入站登记的 Flow 越画越大，我已经看不清了。',
      '昨天橘子进来，体重字段又没自动算出来。',
      '你会 SQL 也会 Flow，把它翻成 Trigger 和 SOQL 吧。',
    ],
    outro: 'Flow 里的每一个分支都在 Trigger 里找到了位置。橘子的入站体检单这次一次就填对了。',
    newHome: '橘子被一位程序员领养，现在最爱趴在机械键盘旁边睡觉。',
  },
  {
    lessonId: 'L00-4',
    chapterId: 'prologue',
    requesterId: 'xiaoman',
    animal: animal('huihui', '灰灰', '灰色小兔'),
    ticketTitleZh: '前台想要一个能用的小组件',
    ticketTitleEn: 'Put a simple LWC on the front desk',
    intro: [
      '前台电脑上的页面全是灰色表格，来看动物的人根本找不到想看的。',
      '我想在首页放个小卡片，显示今天刚来的小家伙。',
      '听说你写过 React？那 LWC 应该很快就能上手吧？',
    ],
    outro: '你的第一个 LWC 出现在了前台首页。第一个被它展示出来的，是一只叫灰灰的小兔子。',
    newHome: '灰灰被一个小女孩一眼选中，现在住在洒满阳光的阳台上。',
  },
  {
    lessonId: 'L01',
    chapterId: 'ch1',
    requesterId: 'alan',
    animal: animal('doubao', '豆包', '柴犬'),
    ticketTitleZh: '领养日系统一到高峰就崩',
    ticketTitleEn: 'Stop the org crashing on adoption day',
    intro: [
      '上周末领养日，系统在最忙的时候报错了，一直说什么 101 次查询。',
      '当时豆包的领养手续办到一半，那家人等了很久，最后先走了。',
      '我不想再让它等了。你能查查是哪里出了问题吗？',
    ],
    outro: '你找到了藏在循环里的查询，把它改成了一次批量查询。下一个领养日系统很稳，豆包等到了它的家人。',
    newHome: '豆包跟着一家三口回了家，小男孩给它织了一条歪歪扭扭的围巾。',
  },
  {
    lessonId: 'L02',
    chapterId: 'ch1',
    requesterId: 'laozhou',
    animal: animal('niangao', '年糕', '三花猫'),
    ticketTitleZh: '把病历按动物归好类',
    ticketTitleEn: 'Group medical records by animal',
    intro: [
      '病历一条一条混在一起，查年糕的记录我要翻二十页。',
      '我需要按动物分组，一只一张清单。',
      '还有，那个类没写 sharing，志愿者能看到不该看的东西。',
    ],
    outro: '你用 Map<Id, List<...>> 把病历按动物归了组，还给类补上了共享声明。老周第一次在两秒内找到了年糕的全部病历。',
    newHome: '年糕被一位独居的奶奶领养，每天陪她听收音机。',
  },
  {
    lessonId: 'L03',
    chapterId: 'ch2',
    requesterId: 'laozhou',
    animal: animal('ahui', '阿灰', '灰口鼻的老田园犬'),
    ticketTitleZh: '找出等得太久的老狗',
    ticketTitleEn: 'Find every senior dog waiting too long',
    intro: [
      '阿灰在这里住了两年半了，没人选它，因为它老了。',
      '我想把入站超过一年、年龄超过 8 岁的狗都找出来，单独做一次推荐。',
      '查询里别拼字符串，上次差点被注入。',
    ],
    outro: '你用日期字面量和绑定变量写出了安全的查询，把 11 只被遗忘的老狗列进了「慢慢来」专题。第一位来看的人，就选了阿灰。',
    newHome: '阿灰被一对中年夫妻领走，他们说就想要一只安静的狗陪着慢慢变老。',
  },
  {
    lessonId: 'L04',
    chapterId: 'ch2',
    requesterId: 'xiaoman',
    animal: animal('xiaotudou', '小土豆', '棕色垂耳兔'),
    ticketTitleZh: '把可领养的小家伙做成列表',
    ticketTitleEn: 'Show adoptable animals as a list',
    intro: [
      '来领养的人总问：现在还有哪些小家伙？',
      '我想要一个列表，有照片、名字，没人等待的时候显示一句「它们都找到家啦」。',
      '小土豆在后面笼子里，每次都被人错过。',
    ],
    outro: '你用 lwc:if 和 for:each 做出了可领养列表，空状态也写得很温柔。小土豆第一次出现在了列表的第一页。',
    newHome: '小土豆和一只叫土豆泥的兔子成了室友，主人说它们会一起偷吃菜叶。',
  },
  {
    lessonId: 'L05',
    chapterId: 'ch3',
    requesterId: 'xiaoman',
    animal: animal('buding', '布丁', '金毛幼犬'),
    ticketTitleZh: '能拦住重复的领养申请吗',
    ticketTitleEn: 'Prevent duplicate adoption applications',
    intro: [
      '布丁太可爱了，同一个人一晚上提交了三次申请。',
      '申请一多，布丁就被锁住，别人连看都看不到。',
      '能在保存之前就拦下来吗？最好还能自动把状态填好。',
    ],
    outro: '你在 before 触发器里拦住了重复申请，顺手补全了状态字段，一句 DML 都没多写。布丁迎来了最合适的那一家。',
    newHome: '布丁被一位消防员领养，现在是消防站里最受欢迎的小狗。',
  },
  {
    lessonId: 'L06',
    chapterId: 'ch3',
    requesterId: 'alan',
    animal: animal('kele', '可乐', '黑色拉布拉多'),
    ticketTitleZh: '批量导入时触发器也要扛得住',
    ticketTitleEn: 'Make the trigger safe for bulk imports',
    intro: [
      '市里转来了 300 只动物的档案，要一次导进来。',
      '可导到一半，后面的记录全都没处理，可乐的资料就丢在那一批里。',
      '能让触发器扛住大批量，也不会自己反复触发吗？',
    ],
    outro: '你把逻辑搬进了 Handler，用记录级的 Set<Id> 防递归，300 条一条不落。可乐的档案完整地回来了。',
    newHome: '可乐去了一位导盲犬训练师家，正在学着成为一只工作犬。',
  },
  {
    lessonId: 'L07',
    chapterId: 'ch4',
    requesterId: 'laozhou',
    animal: animal('xueqiu', '雪球', '白色长毛猫'),
    ticketTitleZh: '今晚每个犬舍需要几条毯子',
    ticketTitleEn: 'Count blankets per kennel tonight',
    intro: [
      '今晚零下五度。',
      '我需要知道每个犬舍有几只动物、几只年纪大的，好分毯子。',
      '数据有四万多条，别一下全塞进内存。',
    ],
    outro: '你用 AggregateResult 一次算出了每个犬舍的数量，用 SOQL for 循环稳稳扫完了全部记录。那一夜，雪球裹着最厚的那条毯子睡着了。',
    newHome: '雪球被一位画家领养，成了她新画册的封面。',
  },
  {
    lessonId: 'L08',
    chapterId: 'ch4',
    requesterId: 'alan',
    animal: animal('lizi', '栗子', '爪子冻伤的小土狗'),
    ticketTitleZh: '有一条录错了，别让整批都丢掉',
    ticketTitleEn: 'Save what you can when some records fail',
    intro: [
      '寒潮夜我们临时收进来二十多只，志愿者一口气录入。',
      '其中一条填错了，结果整批都没保存，栗子的冻伤记录也没了。',
      '能不能让对的先存下来，错的单独告诉我？',
    ],
    outro: '你用 Database.insert 的部分成功模式保住了正确的记录，把出错的那条整理成清单发给了阿岚。栗子的爪子得到了及时治疗。',
    newHome: '栗子的爪子完全好了，现在每天跟着新主人晨跑。',
  },
  {
    lessonId: 'L09',
    chapterId: 'ch5',
    requesterId: 'xiaoman',
    animal: animal('tangyuan', '汤圆', '奶牛猫'),
    ticketTitleZh: '让动物卡片和申请表说上话',
    ticketTitleEn: 'Let the cards talk to the adoption form',
    intro: [
      '领养日那天，我希望大家点一下动物卡片，旁边的申请表就自动填好名字。',
      '现在点了没反应，大家还得手抄编号。',
      '汤圆的编号上次就被抄错了……',
    ],
    outro: '你让子组件通过 CustomEvent 把选中的动物告诉父组件，跨区域的部分用了 LMS。汤圆的申请表这次一字不差。',
    newHome: '汤圆被一对新婚夫妻领养，他们说它是家里的第一个成员。',
  },
  {
    lessonId: 'L10',
    chapterId: 'ch5',
    requesterId: 'xiaoman',
    animal: animal('maiya', '麦芽', '柯基'),
    ticketTitleZh: '有动物被领走时，大屏幕要自己刷新',
    ticketTitleEn: 'Refresh the board when an animal is adopted',
    intro: [
      '大屏幕上的动物列表不会自己更新。',
      '麦芽明明已经被领走了，还挂在上面，又有人跑来问。',
      '能不能领养一确认，板子就刷新？',
    ],
    outro: '你用 @wire 绑定了响应式参数，并把完整的 wire 结果交给 refreshApex。麦芽的卡片换成了「已回家」的照片。',
    newHome: '麦芽去了一个有小院子的家，每天巡视三遍菜地。',
  },
  {
    lessonId: 'L11',
    chapterId: 'ch6',
    requesterId: 'qiqi',
    animal: animal('xiaoyugan', '小鱼干', '狸花猫'),
    ticketTitleZh: '夜里慢慢发完所有感谢回执',
    ticketTitleEn: 'Send thank-you receipts overnight',
    intro: [
      '这个月有一千多笔小额捐款，每一笔我都想回一封感谢信。',
      '可一次发系统就超时，上次还漏了好多人。',
      '能不能让它晚上自己慢慢发，还要告诉我一共发了多少？',
    ],
    outro: '你写了一个带 Database.Stateful 的 Batch，夜里分批发送并统计总数，再用 Schedulable 每晚定时启动。第二天早上，七七收到了一份完整的发送报告。',
    newHome: '小鱼干被一位常年小额捐款的读者领养，她说终于见到了「自己捐过的猫」。',
  },
  {
    lessonId: 'L12',
    chapterId: 'ch6',
    requesterId: 'qiqi',
    animal: animal('xingxing', '星星', '失明的老猫'),
    ticketTitleZh: '保护捐款人的隐私',
    ticketTitleEn: 'Keep donor details private',
    intro: [
      '有位捐款人希望匿名，可志愿者在页面上能看到她的电话和地址。',
      '她领养了星星，一只看不见的老猫，她不想被打扰。',
      '能让每个人只看到自己该看的吗？',
    ],
    outro: '你用 WITH USER_MODE 和 Security.stripInaccessible 守住了字段权限。捐款人的信息只在该看到的人面前出现。',
    newHome: '星星和那位匿名的捐款人住在一起，每天靠脚步声认出她回家。',
  },
  {
    lessonId: 'L13',
    chapterId: 'ch7',
    requesterId: 'qiqi',
    animal: animal('maoxian', '毛线', '卷毛混种小狗'),
    ticketTitleZh: '部署之前，先证明捐款逻辑是对的',
    ticketTitleEn: 'Prove the donation logic with tests',
    intro: [
      '上个月有一次改动，把月捐款人全标成了一次性捐款。',
      '我不想再靠运气，部署前能不能先证明它是对的？',
      '毛线的助养人就是那次被弄错的。',
    ],
    outro: '你写了 @TestSetup 和带 startTest/stopTest 的测试，异步逻辑也断言得清清楚楚。之后的每一次部署，七七都先看测试报告。',
    newHome: '毛线的助养人最后决定直接领养它，说「不想再只是每个月看照片了」。',
  },
  {
    lessonId: 'L14',
    chapterId: 'ch7',
    requesterId: 'qiqi',
    animal: animal('dafu', '大福', '三条腿的边牧'),
    ticketTitleZh: '和市宠物登记平台同步',
    ticketTitleEn: 'Sync with the city pet registry',
    intro: [
      '市里要求每只被领养的动物都要同步到宠物登记平台。',
      '直接在触发器里调接口会报错，失败了还没有任何记录。',
      '大福的登记卡了一周，新主人有点着急。',
    ],
    outro: '你用 Named Credential 发起调用，失败时立刻发布 Platform Event 记录，不会被回滚吞掉。大福的登记证第二天就寄到了。',
    newHome: '大福用三条腿跑得比谁都快，现在是社区飞盘队的队员。',
  },
  {
    lessonId: 'L15',
    chapterId: 'finale',
    requesterId: 'laozhou',
    animal: animal('yunduo', '云朵', '萨摩耶'),
    ticketTitleZh: '一百万条记录也要搜得快',
    ticketTitleEn: 'Keep search fast with a million records',
    intro: [
      '这几年，周边三个城市的救助站都接进了我们的系统。',
      '记录过了一百万，搜名字要转半分钟，还经常超时。',
      '云朵是第一只跨城领养的，我想让它的故事能被搜到。',
    ],
    outro: '你改写了高选择性查询，避开了前导通配符，并在并发更新时加上了 FOR UPDATE。搜索又回到了一秒以内。',
    newHome: '云朵被另一座城市的一家人领养，他们开了四个小时的车来接它。',
  },
  {
    lessonId: 'L16',
    chapterId: 'finale',
    requesterId: 'alan',
    animal: animal('wowo', '窝窝', '站里最老的橘猫'),
    ticketTitleZh: '交接之前，给前台组件留一套测试',
    ticketTitleEn: 'Test the front desk before we hand it over',
    intro: [
      '窝窝是这里最老的猫，站名就是跟着它起的。',
      '明年我想把站长交给小满，系统也要交给更多志愿者。',
      '你写的那些前台组件，能留下一套测试吗？这样就算你不在，它们也不会坏。',
    ],
    outro: '你用 Jest 给前台组件写好了测试，Shadow DOM 查询和异步渲染都覆盖到了。交接那天，阿岚说：「窝窝终于有一个不会塌的家了。」',
    newHome: '窝窝没有被领养，它留在了这里。它就是这个家本身。',
    headline: '窝窝有了一个不会塌的家',
  },
];
