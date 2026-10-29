# AGENTS.md

本文件是本仓库的持久执行约定，适用于仓库根目录及所有子目录。开始任何工作前，先阅读本文件及与当前任务相关的设计、计划和代码。

## 项目目标

本仓库建设一个面向中国用户的在线教育前端网站，主导航包含：首页、考试、拼团、秒杀、社区和课程。

首期目标：

- 使用 Nuxt 4、Vue 3 和 TypeScript 构建支持 SSR 的公开网站。
- 首页提供 Banner 轮播、拼团列表、最新课程和推荐课程。
- 提供课程、考试、拼团、秒杀和社区的公开列表与详情入口。
- 保证公开内容在初始 HTML 中可见，并具备可验证的 SEO 元数据。
- 通过统一、类型安全的客户端调用独立 REST API。
- 保持前端可独立构建、测试和部署。

## 权威上下文

实施前按以下顺序读取：

1. 本文件：`AGENTS.md`
2. 设计基线：`docs/superpowers/specs/2026-10-28-online-education-frontend-design.md`
3. 实施计划：`docs/superpowers/plans/2026-10-28-online-education-frontend.md`
4. 当前任务涉及的现有代码、测试和配置

设计基线定义目标、边界和架构；实施计划定义任务接口、文件范围、测试与验收步骤；实时仓库内容是当前实现状态的事实来源。

如果三者冲突：

- 用户在当前对话中的明确指示优先。
- 未被用户覆盖的范围，以设计基线为准。
- 实施细节以计划为准，但不得覆盖已存在且经过验证的仓库约定。
- 发现冲突时先报告，不得自行扩大或重写需求。

## 人工执行门禁

- 不得自行开始实施计划中的任何 Task 或 Step。
- 只有用户明确指定 Task、Step 或文件范围后，才可修改对应内容。
- 用户可以调整任务顺序；执行前先进行只读依赖检查，并说明缺失依赖。
- 如果指定任务依赖尚未完成，不得偷偷补做其他任务；先报告最小依赖并等待用户决定。
- 每次只完成用户批准的范围，验证并汇报后立即停止。
- 不得自动进入下一 Task、下一 Step 或“顺手”实现相邻功能。
- 安装依赖、初始化 Git、创建分支、提交、推送、部署、访问凭证或修改外部系统都需要各自明确授权。
- 即使实施计划列出了 commit 步骤，也不能将“执行某个 Task”自动解释为允许提交或推送。

## 实施路线图（查阅用）

本节是实施计划的仓库内快速索引，不代表任何步骤已经获批或完成。用户明确指定 Task、Step 或自定义范围后才能执行。精确文件列表、接口签名、测试断言和预期结果仍以 `docs/superpowers/plans/2026-10-28-online-education-frontend.md` 为准。

### Task 1：项目基础与应用外壳

**前置条件：** 无。初始化 Git、安装依赖和创建提交仍需用户分别授权。

1. 使用 pnpm/Nuxi 初始化 Nuxt 4，保留现有 `docs/` 和 `AGENTS.md`。
2. 配置 TypeScript strict、Nuxt UI、Tailwind、Pinia、ESLint、Vitest、Nuxt Test Utils、Vue Test Utils、Playwright 和 SEO 模块。
3. 建立 `app/app.vue`、全局 CSS、默认布局、页头、页脚和导航配置。
4. 导航顺序固定为：首页、考试、拼团、秒杀、社区、课程。
5. 为桌面和移动导航编写失败测试，再实现键盘操作、可见焦点和跳到正文链接。
6. 运行：`pnpm vitest run tests/unit/shell`、`pnpm nuxi typecheck`、`pnpm build`。
7. 汇报结果并停止，不自动进入 Task 2。

**完成产物：** 可构建的 Nuxt 4 骨架、共享布局和通过测试的六项导航。

### Task 2：统一 REST API 客户端与错误模型

**前置条件：** Task 1 的 Nuxt 与测试环境可用。

1. 定义 `ApiList<T>`、`ApiErrorShape` 和 `ApiRequestOptions`。
2. 先测试 422 字段错误、401、超时、网络异常和未知异常的标准化结果。
3. 实现 `normalizeApiError(error: unknown)`，不暴露后端堆栈或 HTML 错误页。
4. 先测试公开/会话请求、服务端/浏览器基础地址、10 秒超时和 Cookie 转发边界。
5. 实现 `apiRequest<T>()` 与 `useApiData<T>()`。
6. 公开 SSR 请求使用内网 API 且不转发用户 Cookie；只有 `auth: 'session'` 才能携带会话。
7. 运行：`pnpm vitest run tests/unit/api`、`pnpm nuxi typecheck`。
8. 汇报结果并停止。

**完成产物：** 所有 feature 可复用的类型安全请求入口和统一错误格式。

### Task 3：SEO、状态码与索引控制

**前置条件：** Task 1；动态 sitemap 接口接入时还依赖 Task 2。

1. 定义页面 SEO、面包屑、课程和文章结构化数据类型。
2. 先测试 canonical、`noindex`、JSON-LD、分页归一化和四类 sitemap 来源。
3. 实现 `usePageSeo()`、`courseSchema()`、`articleSchema()`、`breadcrumbSchema()` 和 `normalizePage()`。
4. 配置站点信息、robots、课程/考试/活动/社区 sitemap 和全站 `Organization` JSON-LD。
5. 建立保留真实 404/500 状态的 `app/error.vue`。
6. 运行：`pnpm vitest run tests/unit/seo tests/unit/utils/normalizePage.spec.ts`、`pnpm nuxi typecheck`。
7. 汇报结果并停止。

**完成产物：** 可供所有公开路由使用的 SSR SEO 基础设施。

### Task 4：首页垂直切片

**前置条件：** Task 1、Task 2、Task 3。

1. 定义 `BannerItem`、`CourseSummary`、`PromotionSummary` 和 `HomeResponse`。
2. 为 `GET /v1/home` 服务调用、四个首页区域、轮播无障碍和接口失败状态编写失败测试。
3. 实现 Banner、通用首页分区、课程卡、活动卡和可重试错误状态。
4. Banner 首图使用明确尺寸并立即加载；后续图片懒加载。
5. 在 `/` 使用 SSR 获取数据，输出页面 SEO、真实链接和四个区域标题。
6. 仅为公共首页设置 300 秒 SWR，不允许用户 Cookie 影响结果。
7. 运行：`pnpm vitest run tests/unit/home`、`pnpm nuxi typecheck`、`pnpm build`。
8. 完成后进行首个垂直切片评审并停止。

**完成产物：** 可独立演示和验证 SEO 的首页。

### Task 5：课程列表与详情

**前置条件：** Task 2、Task 3；复用 Task 4 的课程摘要类型或在实施时无重复地迁移到 course feature。

1. 定义课程查询、教师、适用人群、课程大纲和课程详情类型。
2. 为 `GET /v1/courses`、`GET /v1/courses/{slug}`、参数序列化和 404 保留编写失败测试。
3. 实现课程 service、筛选器、课程网格、详情头部和大纲组件。
4. 筛选状态保存在 URL；`page=0`、负数或非数字统一归一为 1。
5. 分页使用真实 `<a>` 链接；canonical 去除空参数和默认参数。
6. 详情页 SSR 输出课程正文、`Course` 和 `BreadcrumbList` JSON-LD。
7. 未知或未发布 slug 使用真实 HTTP 404。
8. 运行：`pnpm vitest run tests/unit/course tests/unit/common/AppPagination.spec.ts`、`pnpm nuxi typecheck`。
9. 汇报结果并停止。

**完成产物：** 可抓取、可筛选、可分页的课程目录与课程详情。

### Task 6：考试发现与答题界面骨架

**前置条件：** Task 2、Task 3；正式验证登录保护需要 Task 9 的会话接口。

1. 定义考试摘要、公开规则、题目导航和答题草稿类型。
2. 为考试列表/详情 SSR、未知 slug 404、答题页 `noindex` 和未登录跳转编写失败测试。
3. 为 Pinia 答题草稿测试设置答案、清除答案和题号边界。
4. 实现考试卡片、考试介绍、题目导航、公开列表与详情。
5. 实现答题 shell 和 auth middleware；若 Task 9 未执行，只建立计划约定的会话接口，不伪造真实认证。
6. 不在前端实现判分、防作弊或权威成绩计算。
7. 运行：`pnpm vitest run tests/unit/exam tests/unit/middleware/auth.spec.ts`、`pnpm nuxi typecheck`。
8. 汇报登录契约依赖并停止。

**完成产物：** 可收录的考试介绍页和受保护、不可索引的答题界面骨架。

### Task 7：拼团与秒杀

**前置条件：** Task 2、Task 3；复用 Task 4 的活动摘要类型或无重复迁移到 promotion feature。

1. 定义拼团、秒杀、库存展示、开始/结束时间和详情类型。
2. 使用固定时钟测试开始时刻、结束时刻、售罄和非法日期。
3. 实现 `promotionState()`，返回 `upcoming`、`active`、`sold-out` 或 `ended`。
4. 测试活动状态对应的按钮可用性、提示文字、详情可读性和 404。
5. 实现共享活动网格、详情头部、倒计时，以及拼团/秒杀列表和详情路由。
6. SSR 输出后端权威状态；客户端只刷新倒计时展示，不决定购买资格或扣减库存。
7. 运行：`pnpm vitest run tests/unit/promotion`、`pnpm nuxi typecheck`。
8. 汇报结果并停止。

**完成产物：** 状态边界明确的拼团和秒杀公开页面。

### Task 8：社区列表与帖子详情

**前置条件：** Task 2、Task 3、共享分页组件。

1. 定义帖子摘要、作者信息、发布时间和安全正文类型。
2. 测试 `GET /v1/posts`、`GET /v1/posts/{slug}`、可抓取分页、结构化数据和未知/未发布 404。
3. 实现帖子卡片、元信息、正文组件、社区列表和详情页。
4. 只渲染后端已清洗 HTML 或明确的安全内容格式。
5. 详情 SSR 输出作者、日期、正文、`DiscussionForumPosting` 和 `BreadcrumbList`。
6. 运行：`pnpm vitest run tests/unit/community`、`pnpm nuxi typecheck`。
7. 汇报结果并停止。

**完成产物：** 支持长尾 SEO 的社区列表和帖子详情。

### Task 9：认证界面与缓存安全

**前置条件：** Task 2；会影响 Task 6 的答题保护验证。

1. 定义 `Session`、登录参数以及 `getSession()`、`login()`、`logout()` 接口。
2. 测试字段错误、Cookie 会话、禁止 localStorage 令牌和安全同源 redirect。
3. 测试 `/login`、`/exam/attempt/**`、未来 `/account/**` 的 `noindex` 与无公共缓存规则。
4. 实现 session store，只保存当前用户投影，不保存原始凭证。
5. 实现登录表单、登录页、退出本地状态和开放重定向防护。
6. 私有请求明确使用 `auth: 'session'`；公共路由不得因用户 Cookie 改变缓存内容。
7. 运行：`pnpm vitest run tests/unit/auth tests/unit/config/route-rules.spec.ts`、`pnpm nuxi typecheck`。
8. 完成后进行 Cookie、重定向、缓存和服务端渲染数据专项评审，并停止。

**完成产物：** 基于后端 HttpOnly Cookie 的前端认证层和可证明的缓存隔离。

### Task 10：端到端验证与部署包装

**前置条件：** 只验证已获批且已完成的功能；完整执行需 Task 1–9 完成。

1. 建立只用于测试的本地 REST fixture server，覆盖正常、404、422、超时和 500。
2. 编写 Playwright 导航测试，覆盖六项导航、移动端键盘操作、公开页面和未登录跳转。
3. 编写 SEO 测试，覆盖初始 HTML、title、description、canonical、H1、JSON-LD 和真实 404。
4. 编写失败状态测试，确认 API 超时显示重试，而不是“暂无内容”。
5. 运行 `pnpm test:e2e`，只修复当前批准范围内的集成问题。
6. 在用户明确授权后，添加 Node.js 24 多阶段 Dockerfile、`.dockerignore`、Nginx 示例和运行说明。
7. 文档说明 `/` 指向 Nuxt、`/api/` 指向独立后端，永久迁移使用 301。
8. 最终运行：`pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e && pnpm build`。
9. 使用 `superpowers:verification-before-completion`，再按授权进行代码审查。
10. 汇报证据、未验证项和剩余风险；不得自动提交、推送或部署。

**完成产物：** 可重复的测试环境、完整验证证据和经授权的部署包装。

### 推荐依赖顺序

```text
Task 1
  ├─ Task 2 ─┬─ Task 4 ── Task 5
  │          ├─ Task 6 ── Task 9 联合验证
  │          ├─ Task 7
  │          └─ Task 8
  └─ Task 3 ─┴─ 所有公开页面 SEO

已完成且获批的功能 ── Task 10
```

这只是依赖关系，不是自动执行顺序。用户可以指定其他顺序；遇到未满足依赖时，只报告并等待决定。

## 仓库边界

本仓库只负责前端、SSR 渲染和 SEO，不负责业务后端。

禁止在本仓库实现：

- 数据库访问或数据持久化
- 业务 REST API 或把 Nuxt `server/api` 用作业务 BFF
- 支付、订单结算或库存扣减
- 考试判分、防作弊或权威成绩计算
- 社区内容审核
- 管理后台
- 直播、即时通信或复杂交易闭环

Nuxt/Nitro 可以作为前端 SSR 运行时调用独立后端，但不得承载上述业务逻辑。测试专用的本地 REST fixture server 只能位于 `tests/fixtures/`，不得进入生产输出。

## 技术约束

- Nuxt 4.x 稳定版
- Vue 3
- TypeScript strict 模式
- Node.js 24 LTS
- pnpm
- Nuxt UI 4 与 Tailwind CSS
- Pinia 仅管理客户端或用户工作流状态
- 远程 SSR 数据使用 Nuxt 数据工具和 `$fetch`
- 默认不引入 Axios
- 单元测试使用 Vitest、Vue Test Utils 和 Nuxt Test Utils
- 端到端测试使用 Playwright

引入新依赖前，说明现有技术栈为何不能合理完成需求，并取得用户批准。锁定文件必须随获批的依赖变更更新。

## 目录与职责

计划采用以下结构：

```text
app/
  components/       跨功能共享组件
  composables/      Nuxt 组合式入口，如 useApi、usePageSeo
  config/           导航等稳定配置
  features/         按 home、course、exam、promotion、community、auth 分域
  layouts/          页面布局
  lib/              API、SEO 等无界面基础能力
  middleware/       路由守卫
  pages/            文件路由，仅编排页面级数据和组件
  stores/           仅放真正跨功能的客户端状态
  utils/            小型纯函数
tests/
  unit/             单元和组件测试
  e2e/              Playwright 测试
  fixtures/         测试专用数据和本地 API 服务
docs/superpowers/   已批准的设计与实施计划
```

文件应职责单一。业务类型、服务和组件优先与所属 feature 共置，不要创建无边界的 `helpers.ts`、`utils.ts` 或巨型全局 store。

## REST API 规则

- 所有接口调用通过统一 API 层和 feature service；页面与组件不得直接拼接 API 基础地址。
- 公共地址使用 `NUXT_PUBLIC_API_BASE`，SSR 内网地址使用 `NUXT_API_BASE_INTERNAL`，站点地址使用 `NUXT_PUBLIC_SITE_URL`。
- 公开请求默认不携带用户 Cookie，避免用户数据影响可共享页面和缓存。
- 只有明确声明为 `auth: 'session'` 的请求才能携带后端会话 Cookie。
- 后端签发 HttpOnly、Secure Cookie；不得把长期令牌写入 localStorage。
- 列表统一适配为 `{ items, page, pageSize, total }`。
- 错误统一适配为 `{ code, message, status, fieldErrors?, requestId? }`。
- 后端响应差异只在 API 适配层处理，页面不得感知原始传输格式。
- 不在日志、错误提示或测试快照中暴露 Cookie、令牌、密码、后端堆栈或敏感响应体。

计划中的首期读取接口为：

- `GET /v1/home`
- `GET /v1/courses`、`GET /v1/courses/{slug}`
- `GET /v1/exams`、`GET /v1/exams/{slug}`
- `GET /v1/group-buys`、`GET /v1/group-buys/{slug}`
- `GET /v1/flash-sales`、`GET /v1/flash-sales/{slug}`
- `GET /v1/posts`、`GET /v1/posts/{slug}`

新增或改变接口契约前先确认独立后端的配合方式，不得凭空扩展后端能力。

## SSR、缓存与安全

- 所有公开列表和详情页默认 SSR，正文必须存在于初始 HTML。
- 登录、个人数据和正式答题页必须 `noindex`，且不得使用 ISR、SWR 或公共缓存。
- 公共缓存不得包含身份、订单、权益、个性化价格或答题数据。
- 秒杀、拼团、成绩、库存和购买资格以后端响应为准；前端倒计时仅用于展示。
- 未知或未发布的详情 slug 必须返回真实 HTTP 404，不得返回带错误文案的 200 页面。
- 永久迁移使用 301；不得用改变 canonical 的 200 页面代替重定向。
- 登录 redirect 只允许安全的同源路径，必须拒绝开放重定向。
- 社区富文本必须由后端清洗或使用明确的安全内容格式；客户端清洗不能替代后端安全边界。

## SEO 规则

- 每个公开页面必须具有唯一且非空的 title、description 和 canonical。
- 页面使用一个语义明确的 H1，保持可访问的标题层级和真实链接。
- 课程详情输出 `Course` 与 `BreadcrumbList` JSON-LD。
- 社区详情输出 `Article` 或 `DiscussionForumPosting` 与 `BreadcrumbList` JSON-LD。
- 全站输出 `Organization` JSON-LD。
- sitemap 按课程、考试、活动和社区拆分。
- 筛选组合页使用 canonical 或 `noindex`；分页必须提供可抓取的 `<a>` 链接。
- Banner 首图不懒加载并明确尺寸；其他图片使用合理懒加载、尺寸和 alt 文本。
- SEO 相关行为必须通过 SSR 输出或端到端测试验证，不能只检查客户端 DOM。

## UI 与无障碍

- 面向中国用户，默认界面文案使用简体中文。
- 使用 Nuxt UI 和 Tailwind 构建一致的设计系统，不混入另一套完整 UI 框架。
- 交互组件必须支持键盘操作、可见焦点、可读标签和合理的 ARIA 语义。
- 响应式布局至少覆盖手机和桌面宽度。
- 不用纯颜色表达状态；加载、空状态、错误和不可用状态必须有明确文字。
- API 失败时展示可恢复错误与重试入口，不得伪装成“暂无内容”。
- 未经用户指定，不生成或替换品牌资产；视觉方向应先按 `frontend-design` 工作流确认。

## 编码规范

- 使用 TypeScript 明确公共接口；避免 `any`，必要时从 `unknown` 开始收窄。
- Vue 组件使用 Composition API 与 `<script setup lang="ts">`。
- 页面只负责路由参数、数据获取、SEO 和功能组件编排；复杂逻辑下沉到 feature 或纯函数。
- 服务层返回领域类型，不把原始 `$fetch` 错误传播给组件。
- 时间相关逻辑接受可注入的当前时间，测试使用固定时钟。
- URL 查询参数必须规范化；无效页码归一为 1。
- 不复制已存在的类型、常量、错误处理或 SEO 逻辑。
- 遵循 DRY、YAGNI 和最小变更原则，不做当前批准范围之外的重构。

## 测试与验证

对可测试行为使用红—绿—重构流程：

1. 编写能证明目标行为的失败测试。
2. 运行聚焦测试并确认因预期原因失败。
3. 实现满足测试的最小代码。
4. 再次运行聚焦测试并确认通过。
5. 在批准范围内重构，再运行相关测试。

测试必须覆盖当前计划指定的关键风险：

- API 超时、网络异常和结构化错误
- 真实 404 与未发布内容
- 非法分页参数
- 拼团/秒杀开始、售罄和结束边界
- 登录重定向与开放重定向防护
- 私有路由 `noindex` 与无公共缓存
- SSR 初始 HTML、canonical、JSON-LD 与标题层级
- 移动端导航和键盘操作

项目脚本建立后，按变更风险选择验证，并优先使用计划给出的命令：

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

不得声称测试、构建、SEO、性能或集成通过，除非实际运行并看到成功输出。无法运行时，明确列出未验证内容和原因。

## 任务执行流程

收到用户指定的 Task 或 Step 后：

1. 只读检查相关计划、现有文件、依赖和未提交变更。
2. 复述本次获批范围、明确非目标，并指出依赖或冲突。
3. 只修改该范围要求的最少文件，保护用户已有变更。
4. 按计划执行聚焦测试和适当的更广验证。
5. 检查差异，确认没有越界文件或意外生成物。
6. 汇报修改文件、验证证据、未验证项、风险与后续依赖。
7. 停止并等待用户指定下一步。

如果计划步骤与当前代码已经不匹配，先说明差异并提出最小调整；未经批准，不得自行重写计划或扩大实现。

## 完成标准

一个获批任务只有在以下条件满足时才能报告完成：

- 用户指定的验收行为已实现。
- 计划要求的聚焦测试已通过。
- 类型检查和必要的更广验证已实际运行，或已明确说明无法运行的原因。
- 未引入本仓库禁止的后端职责。
- 未泄露敏感数据或把用户数据放入公共缓存。
- 变更范围与用户批准范围一致。
- 没有自动开始下一个任务。

提交、推送和部署不属于默认完成标准，必须由用户另行明确授权。
