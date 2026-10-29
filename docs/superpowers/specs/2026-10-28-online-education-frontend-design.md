# 在线教育前端设计基线

## 意图

建设一个面向中国用户的在线教育公开网站。主导航包含首页、考试、拼团、秒杀、社区和课程；公开内容需要被搜索引擎稳定抓取，业务后端作为独立 REST API 服务维护。

## 目标

- 使用 Nuxt 4、Vue 3 和 TypeScript 建设支持 SSR 的前端项目。
- 首页包含 Banner 轮播、拼团列表、最新课程和推荐课程。
- 提供考试、拼团、秒杀、社区和课程的公开列表与详情入口。
- 公开正文在初始 HTML 中可见，并具备 title、description、canonical、结构化数据、robots 和 sitemap。
- 建立统一 REST API 客户端、错误模型、领域类型和服务层。
- 前端可独立构建、测试和部署，通过配置连接外部 REST API。

## 非目标

- 本仓库不实现数据库、业务 API、管理后台、支付、库存扣减、判卷或内容审核。
- 第一阶段不实现完整交易闭环、直播、即时通信和复杂防作弊。
- 不把 Nuxt `server/api` 当作业务后端或 BFF 使用。

## 全局约束

- 框架使用稳定版 Nuxt 4.x、Vue 3 和 TypeScript strict 模式。
- 包管理使用 pnpm；运行环境使用 Node.js 24 LTS。
- UI 使用 Nuxt UI 4 和 Tailwind CSS。
- 客户端状态使用 Pinia；服务端远程数据优先使用 `useFetch`、`useAsyncData` 和 `$fetch`。
- REST API 通过运行时配置连接；公开地址与 SSR 内网地址分开配置。
- 认证信息使用后端签发的 HttpOnly、Secure Cookie；不把长期令牌保存到 localStorage。
- 所有公开内容页默认 SSR；私有页和正式答题页使用 `noindex`。
- 页面不得在公共缓存中混入用户身份、订单、价格权益或答题数据。
- 关键行为采用 Vitest、Vue Test Utils、Nuxt Test Utils 和 Playwright 验证。
- 本仓库当前为空且尚未初始化 Git；初始化项目时一并建立 Git 仓库。

## 架构

Nuxt 作为独立前端渲染服务运行。首次访问时，Nitro 在服务端调用外部 REST API 并输出完整 HTML；浏览器激活后继续使用同一服务层请求 API。Nginx 在生产环境把 `/` 转发给 Nuxt，把 `/api/` 转发给独立后端，从而保持同源并简化 Cookie 与 CORS。

`app/services` 负责业务接口，`app/composables/useApi.ts` 负责传输、凭证、超时和错误标准化，页面只消费领域类型。公共列表和详情页采用 SSR 与短时缓存；登录、个人中心和答题会话不进入公共缓存。

## 路由与首期范围

- `/`：Banner、进行中的拼团、最新课程、推荐课程。
- `/course`、`/course/[slug]`：课程列表与详情。
- `/exam`、`/exam/[slug]`：考试列表与公开介绍。
- `/exam/attempt/[id]`：答题界面骨架，要求登录并 `noindex`。
- `/group-buy`、`/group-buy/[slug]`：拼团列表与详情。
- `/flash-sale`、`/flash-sale/[slug]`：秒杀列表与详情。
- `/community`、`/community/[slug]`：帖子列表与详情。
- `/login`：登录界面；认证由独立后端完成。

## REST API 前端契约

首期前端按下列读取接口组织服务，后端可通过网关把实际地址映射到这些路径：

- `GET /v1/home`
- `GET /v1/courses`、`GET /v1/courses/{slug}`
- `GET /v1/exams`、`GET /v1/exams/{slug}`
- `GET /v1/group-buys`、`GET /v1/group-buys/{slug}`
- `GET /v1/flash-sales`、`GET /v1/flash-sales/{slug}`
- `GET /v1/posts`、`GET /v1/posts/{slug}`

列表统一返回 `{ items, page, pageSize, total }`。错误统一映射为 `{ code, message, status, fieldErrors?, requestId? }`。如果后端返回不同格式，只在 `useApi` 的适配层转换，不让页面感知传输差异。

## SEO 策略

- 列表和详情正文必须由 SSR 输出，不把关键内容放在仅客户端渲染组件中。
- 课程详情输出 `Course` 和 `BreadcrumbList`；社区详情输出 `Article` 或 `DiscussionForumPosting`；全站输出 `Organization`。
- 筛选组合页使用 canonical 或 `noindex`，分页使用可抓取链接。
- sitemap 按课程、考试、活动和社区拆分；删除内容返回真实 404，迁移内容使用 301。
- Banner 首图不懒加载，其余图片设置尺寸、懒加载和替代文本。

## 已选方案与取舍

- 选择 Nuxt 4，而不是纯 Vue SPA：增加 Node SSR 运维成本，换取稳定的初始 HTML、SEO 和混合渲染能力。
- 选择 Nuxt UI，而不是 Element Plus：优先用户端视觉可塑性、无障碍和 Tailwind 集成；管理后台不在本仓库范围内。
- 选择直接调用独立 REST API，而不是 Nuxt BFF：保持前后端职责清晰；同源代理、Cookie 和 CORS 由部署层处理。
- 选择 `$fetch` 与 Nuxt 数据工具，而不是默认引入 Axios：减少依赖并保持 SSR 数据生命周期一致。

## 留给实施者的选择

- 具体品牌色、字体和插画在 UI 实施前通过 `frontend-design` 确定。
- 后端具备 OpenAPI 时，可用 `openapi-typescript` 替代手写传输类型，但领域接口名称保持不变。
- 生产缓存存储和 CDN 厂商由部署环境决定，不写死到应用代码。
