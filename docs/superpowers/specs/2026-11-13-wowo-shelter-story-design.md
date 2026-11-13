# 窝窝救助站 · INFP 叙事激励层设计 (Wowo Shelter Story Layer)

- 日期：2026-11-13
- 状态：已获用户确认（方案 B · 工单驱动 + 水彩动物画像）
- 适用项目：ForceCraft（`salesforce-dev-academy`）

## 1. 背景与目标

用户为 INFP：被意义、真实的人与情感连接驱动，对排名、差距、连续打卡这类外部压力型激励容易产生倦怠甚至逃避。现有系统偏「精确的考试工作台」，缺少情感投入点。

**目标**：在不改动任何课程、编程题与 100 道考题正确性的前提下，为系统加一层「现实职场剧」叙事：用户入职流浪动物救助站「窝窝」，每天的学习任务变成同事发来的真实工单，每学完一讲就帮一只具体的小动物找到家。

**成功标准**
1. 打开系统的第一屏是「窝窝」救助站，而不是数字与差距。
2. 20 讲每一讲都有课前工单与课后结局，各对应一只有名字、有画像的小动物。
3. 今日任务全部以工单形式呈现，点击后跳转行为与现在一致。
4. 界面上不再出现连续打卡天数与「距及格线差 X%」。
5. 可随时切换回「专注备考模式」（现有工作台视图）。

**非目标（YAGNI）**
- 不改写编程题、SOQL 沙盒数据模型与考题内容（方案 C，后续可选）。
- 不做声音、动画剧情、多结局分支、社交分享。

## 2. 世界观与角色

窝窝救助站位于海边小城。几年前上了 Salesforce，但系统由志愿者东拼西凑：领养高峰就崩、申请重复、捐款对不上账。用户带着 ADM 证以技术志愿者身份入职，成长为站里的正式开发者。站名来自站里最老的橘猫「窝窝」。

| ID | 同事 | 身份与性格 | 主要发来的工单领域 |
|---|---|---|---|
| `alan` | 阿岚 | 站长，温和、疲惫、从不放弃 | 主线、流程自动化、Trigger、异步 |
| `xiaoman` | 小满 | 领养专员，热情、话多 | LWC、前台体验 |
| `laozhou` | 老周 | 兽医，寡言、严谨 | SOQL、数据建模、海量数据 |
| `qiqi` | 七七 | 捐赠与财务，谨慎 | 安全、测试、外部集成 |

头像使用文字首字母圆块（`岚` `满` `周` `七`），不使用 emoji。

## 3. 章节与动物（20 讲全覆盖）

| 章节 | 课程 | 动物（id · 名字 · 描述） | 发件人 | 工单英文标题 |
|---|---|---|---|---|
| 序章 · 门口的纸箱 | L00-1 | `zhima` 芝麻 · 纸箱里的小黑猫 | 阿岚 | Map the shelter's org metadata |
| | L00-2 | `tuanzi` 团子 · 白色小京巴混种 | 阿岚 | Read the old volunteer's Apex |
| | L00-3 | `juzi` 橘子 · 胖橘猫 | 老周 | Turn the intake Flow into a Trigger |
| | L00-4 | `huihui` 灰灰 · 灰色小兔 | 小满 | Put a simple LWC on the front desk |
| 一 · 豆包的档案 | L01 | `doubao` 豆包 · 柴犬 | 阿岚 | Stop the org crashing on adoption day |
| | L02 | `niangao` 年糕 · 三花猫 | 老周 | Group medical records by animal |
| 二 · 找到每一个家 | L03 | `ahui` 阿灰 · 灰口鼻老田园犬 | 老周 | Find every senior dog waiting too long |
| | L04 | `xiaotudou` 小土豆 · 棕色垂耳兔 | 小满 | Show adoptable animals as a list |
| 三 · 重复的申请 | L05 | `buding` 布丁 · 金毛幼犬 | 小满 | Prevent duplicate adoption applications |
| | L06 | `kele` 可乐 · 黑色拉布拉多 | 阿岚 | Make the trigger safe for bulk imports |
| 四 · 寒潮夜 | L07 | `xueqiu` 雪球 · 白色长毛猫 | 老周 | Count blankets per kennel tonight |
| | L08 | `lizi` 栗子 · 爪子冻伤的小土狗 | 阿岚 | Save what you can when some records fail |
| 五 · 领养日 | L09 | `tangyuan` 汤圆 · 奶牛猫 | 小满 | Let the cards talk to the adoption form |
| | L10 | `maiya` 麦芽 · 柯基 | 小满 | Refresh the board when an animal is adopted |
| 六 · 捐款人的信 | L11 | `xiaoyugan` 小鱼干 · 狸花猫 | 七七 | Send thank-you receipts overnight |
| | L12 | `xingxing` 星星 · 失明的老猫 | 七七 | Keep donor details private |
| 七 · 不再出错 | L13 | `maoxian` 毛线 · 卷毛混种小狗 | 七七 | Prove the donation logic with tests |
| | L14 | `dafu` 大福 · 三条腿的边牧 | 七七 | Sync with the city pet registry |
| 终章 · 十年后的窝窝 | L15 | `yunduo` 云朵 · 萨摩耶 | 老周 | Keep search fast with a million records |
| | L16 | `wowo` 窝窝 · 站里最老的橘猫 | 阿岚 | Test the front desk before we hand it over |

每讲剧情由两段构成：
- **课前 `intro`**：发件人的工单正文，2–4 句中文对话，交代这讲要解决的现实问题（技术概念自然融入，不硬讲）。
- **课后 `outro`**：1–3 句结局 + 动物状态变化（被领养 / 康复 / 进入寄养家庭），以及新家的一句话描述。

章节完成时点亮救助站对应区域：序章=门厅，一=犬舍，二=猫屋，三=领养厅，四=仓库，五=院子，六=捐赠角，七=诊室，终章=屋顶小花园。

## 4. 工单队列（改写今日任务）

- `buildElasticDailyPlan` 不变；新增纯函数 `ticketsFromPlan(plan, state)` 把每个 `ElasticDailyTaskItem` 映射为 `StoryTicket`：
  - `lesson` 任务：使用该讲的 `intro`、发件人、动物与英文标题。
  - `challenge` 任务：发件人沿用对应课程，标题模板「上次那个需求，能写出来跑一遍吗？· *Ship it: {C-id}*」。
  - `questions` 任务：七七发来「站里要做年度系统审查，想先请你过几道题」。有错题时改为「上次审查有几处没对上，再看看？」。
  - `flashcards` 任务：阿岚发来「去喂喂猫吧，顺手翻几张卡」。
- 工单卡显示：首字母头像、发件人名、中文一句话、英文斜体标题、底部小字 `L05 · Trigger 上下文 · 30m`。
- 队列中第一个未完成工单使用唯一主按钮（延续 unslop 规则）。
- 「专注备考模式」开关（`storyMode=false`）位于顶栏，关闭后首页回到现有 `ElasticPlannerView` 工作台、工单退回原任务卡、导航顺序恢复原样。

## 5. 救助站首页 `ShelterHomeView`

新默认标签「窝窝」，位于导航首位。布局：
1. **页头**：「早上好 / 晚上好」+ 当前章节名 + 一句话正向进度：「已帮 6 只小动物找到家」。
2. **救助站平面图**（全系统唯一丰富视觉时刻）：CSS Grid + SVG 绘制的 9 个区域，未点亮区域为暗色线稿，点亮区域为暖色描边与区域名；当前章节区域有柔和高亮。
3. **今日工单**：`TicketQueue`（最多 3 张，可展开）。
4. **领养墙**：已完成课程对应动物的水彩画像卡片（拍立得样式：奶油色内框 + 名字 + 新家一句话）；未完成的动物显示为灰度半透明画像 + 「还在等你」，让用户看到正在等待的具体小动物。
5. **陪伴日志**：`CompanionLog` 点阵日历（近 12 周）。

备考准备度数字保留在侧栏，文案改为「考场准备度 2% · 通过线 68%」，不出现「差」。

## 6. 陪伴日志与状态签到

- 移除顶栏与任何位置的 `streakDays` 展示（字段保留以兼容旧存档）。
- `MoodCheckInDialog`：当天首次打开且 `lastCheckInDate !== today` 时以 `showModal()` 打开，`closedby="any"`，可直接关闭。
  - 有点累 → `todayAvailableMinutesOverride=20`（实际推荐闪卡优先）；阿岚：「累了就去喂喂猫吧，看几张卡就好。」
  - 平静 → 45；小满：「今天也来啦，我把豆包的事攒着等你。」
  - 有劲 → 90；老周：「好。今天可以啃硬骨头。」
  - 想放空 → 不改预算，首页滚动到领养墙；阿岚：「那就只是来坐坐，看看它们也很好。」
- 学习计时与课程完成时写入 `companionLog[today]`（分钟数累加、心情、是否完成课程）。
- 点阵日历只表达「来过」，不计算连续天数，不显示中断。
- `StoryUnlockDialog`：在课程从未完成切换为完成时弹出，展示动物画像、`outro`、以及可选输入框「想对 {名字} 或自己说一句话」，保存到 `reflections[lessonId]`；同时把 lessonId 加入 `seenStoryBeats`，避免重复弹出。

## 7. 数据与代码结构

新增文件：
- `src/data/story/characters.ts`：`Character { id, name, initial, role, voice }`
- `src/data/story/chapters.ts`：`StoryChapter { id, title, area, lessonIds }`、`LessonStory { lessonId, chapterId, requesterId, animal: { id, name, species, portrait }, ticketTitleZh, ticketTitleEn, intro, outro, newHome }`
- `src/utils/story.ts`：`getLessonStory`、`getChapterProgress`、`getAdoptedAnimals`、`ticketsFromPlan`、`getGreeting`
- `src/components/story/ShelterHomeView.tsx`、`TicketQueue.tsx`、`ShelterMap.tsx`、`AdoptionWall.tsx`、`CompanionLog.tsx`、`MoodCheckInDialog.tsx`、`StoryUnlockDialog.tsx`
- `public/story/animals/{animalId}.jpg`：20 张水彩画像（统一风格：温暖水彩、奶油色纸张纹理、正方形、单只动物居中、柔和自然光、无文字；统一缩放为 512×512 JPEG 以控制仓库体积）

`UserAppState` 新增字段（`loadAppState` 已用默认值合并旧存档，旧进度不受影响）：
```ts
storyMode: boolean;                       // 默认 true
companionLog: Record<string, { minutes: number; mood?: Mood; completedLessonIds: string[] }>;
seenStoryBeats: string[];
lastCheckInDate: string | null;
reflections: Record<string, string>;
```
`type Mood = 'tired' | 'calm' | 'energized' | 'drift'`。

`App.tsx` 改动：新增 `'shelter'` 标签并在 `storyMode` 下设为默认；`handleToggleLessonComplete` 在新完成时触发 `StoryUnlockDialog`；顶栏移除打卡天数并加入模式开关；挂载签到弹窗。

## 8. 视觉规范

延续现有 unslop Graphite 体系。叙事层只新增一种暖色作为「被点亮 / 被领养」的语义色：`--color-warm: #e8b77a`（低饱和琥珀），仅用于救助站平面图的点亮区域与领养卡片描边。水彩画像是界面上唯一的位图插画。不使用 emoji、渐变或发光效果。

## 9. 测试

- 引入 `vitest`（devDependency）与 `npm test` 脚本。
- `src/utils/story.test.ts`：
  1. `CURRICULUM_LESSONS` 中每个 id 都有 `LessonStory`，且动物 id 唯一。
  2. 每章 `lessonIds` 合并后恰好等于全部 20 讲。
  3. `ticketsFromPlan` 对四种任务类型都返回带发件人与双语标题的工单，`targetId` 与原任务一致。
  4. `getChapterProgress` 在部分完成时正确返回点亮区域。
  5. 每个 `portrait` 路径对应 `public/` 中真实存在的文件。
- `npm run build` 0 错误；无头 Chrome 截图验证首页渲染。

## 10. 风险

- 水彩画像风格不统一 → 所有画像使用同一份风格提示词，并逐张检视，必要时重生成。
- 剧情过长打断学习 → 课前 ≤ 4 句、课后 ≤ 3 句；弹窗均可一键关闭。
- 考前冲刺期叙事干扰 → 「专注备考模式」一键切换。
