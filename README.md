# ForceCraft — Salesforce PD1 · PD2 Developer Workbench

专为准备 **Salesforce Certified Platform Developer I (PD1)** 与 **Platform Developer II (PD2)** 认证打造的本地中英双语备考与实战工作台。特别针对持有 **ADM-201 管理员认证** 且具备 **通用编程基础（JS / React / Java / SQL）** 的跨界开发者设计。

## 快速启动

```bash
npm install
npm run dev
```

浏览器访问 `http://localhost:5188/`。在 macOS 上运行 `./build_macos_app.sh` 会生成桌面与启动台应用 `ForceCraft Studio.app`：它以打包后的生产版本（`vite preview`）启动，源码有改动时自动重新打包，并始终使用 5188 端口（学习数据保存在该端口的浏览器存储中）。

```bash
npm test          # vitest：剧情数据、间隔复习、模考组卷、判题器
npm run org-bridge # 可选：连接你自己的 Developer Edition org
```

## 核心模块

1. **每日弹性学习计划 (Elastic Daily Study Planner)**
   - 支持 **30m / 60m / 120m / 周末弹性** 四档节奏与 `20m–140m` 实时预算滑块。
   - 支持忙碌日一键压缩顺延（`20m` 保温）与深度冲刺（`110m`），实时对标 PD1/PD2 四大官方计分域与 `68%` 认证及格线。

2. **ADM + 编程功底 · Stage 0 零基础跃迁先导营**
   - **三界罗塞塔转换器（8 大核心场景）**：将 `ADM 声明式配置 (Flow / Object Manager / OWD)` ↔ `通用编程 (SQL / React / Java)` ↔ `Salesforce 代码 (Apex / SOQL / LWC)` 进行一对一对照映射。
   - **6 大多租户反直觉认知陷阱** 与 **4 节破冰先导课（`L00-1` 至 `L00-4`）**。

3. **全套中英双语课程库（20 讲）**
   - 从先导破冰、入门筑基、核心进阶到 PD2 高级架构，涵盖 Governor Limits、Trigger 20 步执行顺序、异步 Apex 四大机制、`WITH USER_MODE`、LDV 索引选择性、Platform Events 与 LWC Jest 测试。
   - 支持全局 **中英双语 / EN 考场 / 中文精析** 一键切换，内置考场英文题干信号词（Signal Phrases）词典与本地随堂笔记。

4. **交互式编程实验室 & 实时 SOQL 沙盒**
   - **16 道闯关编程题**：支持快捷键 `⌘Enter` 自动规则判题、3 阶渐进提示、标准参考答案与逐行复杂度拆解。
   - **SOQL 查询沙盒**：内置模拟 Org 对象字典与索引标记，实时诊断 Query Plan 选择性与全表扫描风险。

5. **100% 考纲覆盖双语题库（100 题 + 自定义录题）**
   - 内置 `Q01–Q124` 共 **124 道中英双语题（PD1 108 道 / PD2 16 道）**，按当前官方 Platform Developer 考纲归类：Developer Fundamentals 27% · Process Automation & Logic 28% · User Interface 25% · Testing, Debugging & Deployment 20%，并按 Summer '26（API v67.0）核对过内容。
   - 支持 `15 / 30 / 60` 题计时模考、错题本自动收录与销项、全英考场模式下按需查看中文对照，以及自定义双语录题。

6. **间隔重复记忆闪卡（20 张）& 考前速查手册**
   - 基于原生 `<details name="sf-cheatsheet">` 实现支持浏览器 `⌘F` 自动展开检索的互斥速查表。

## 可选：在自己的 Developer Org 里真实运行

编程实验室的「我的 Org」页可以通过本地连接桥执行真实 SOQL 与匿名 Apex：

1. 注册免费的 Developer Edition org：https://developer.salesforce.com/signup
2. `npm install -g @salesforce/cli`
3. `sf org login web --alias forcecraft`
4. `npm run org-bridge`（保持窗口打开）

连接桥（`bridge/org-bridge.mjs`，无第三方依赖）只监听 `127.0.0.1:5199`，只接受来自 ForceCraft 页面的请求。匿名 Apex 会在 org 中真实执行，请只连接 Developer Edition 或 scratch org。

## 界面设计与致谢

- 技术栈：React 19 + TypeScript + Vite + 原生 CSS Design Tokens（`localStorage` 离线持久化）。
- UI 设计体系基于 [unslop](https://github.com/TomTang197/unslop)（原作者 Damir Sokolovsky [`@heydamir`](https://x.com/heydamir)，采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可）完成 9 轮系统化精修。
