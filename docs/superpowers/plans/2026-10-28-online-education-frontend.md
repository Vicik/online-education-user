# Online Education Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready Nuxt 4 frontend for a Chinese online-education site with SSR SEO, a typed external REST API layer, and public home, course, exam, promotion, and community experiences.

**Architecture:** Nuxt runs only as the frontend rendering service; it calls an independently deployed REST backend and contains no business API routes or database access. Feature folders own their domain types, services, components, and tests, while shared API and SEO utilities provide consistent SSR behavior across routes.

**Tech Stack:** Nuxt 4, Vue 3, TypeScript, Nuxt UI 4, Tailwind CSS, Pinia, `$fetch`, Zod, Vitest, Vue Test Utils, Nuxt Test Utils, Playwright, pnpm, Node.js 24 LTS.

**Spec:** `docs/superpowers/specs/2026-10-28-online-education-frontend-design.md`

## Global Constraints

- Use stable Nuxt 4.x, Vue 3, and TypeScript strict mode.
- Use pnpm and Node.js 24 LTS.
- Use Nuxt UI 4 and Tailwind CSS for the public site.
- Use Pinia only for client/user workflow state; remote SSR data stays in Nuxt data utilities.
- Connect to the independent REST backend through runtime configuration; keep public and SSR-internal base URLs separate.
- Use backend-issued HttpOnly, Secure cookies; never persist long-lived tokens in localStorage.
- Render all public content routes with SSR; mark private and exam-attempt routes `noindex`.
- Never place identity, order, entitlement, or exam-attempt data in shared public caches.
- Do not create `server/api` business routes, database code, payment logic, inventory logic, grading logic, or moderation logic in this repository.
- Every task follows TDD where behavior is testable and ends with the listed focused verification before commit.

## Review Focus

- REST API timeout or unavailability: public pages show a recoverable error state and do not render misleading empty content; pinned by Task 2 and Task 4 tests.
- Unknown or unpublished detail slug: Nuxt returns a real HTTP 404 and an index-safe error page; pinned by Tasks 5–8 tests.
- Invalid pagination such as `page=0`, negative, or nonnumeric: normalize to page 1 and keep one canonical URL; pinned by Task 5 tests.
- Expired or sold-out promotion: the detail remains readable but the action button is disabled with the correct state; pinned by Task 7 tests.
- Authenticated request data leaking through caching: private and attempt routes send `noindex` and no shared-cache rule; pinned by Task 9 tests.

---

### Task 1: Project foundation and application shell

**Files:**
- Create: `package.json`
- Create: `nuxt.config.ts`
- Create: `tsconfig.json`
- Create: `eslint.config.mjs`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `app/app.vue`
- Create: `app/assets/css/main.css`
- Create: `app/config/navigation.ts`
- Create: `app/layouts/default.vue`
- Create: `app/components/shell/AppHeader.vue`
- Create: `app/components/shell/AppFooter.vue`
- Test: `tests/unit/shell/AppHeader.spec.ts`
- Test: `tests/unit/shell/AppFooter.spec.ts`

**Interfaces:**
- Produces: `NAV_ITEMS: readonly { label: string; to: string }[]` with 首页 `/`, 考试 `/exam`, 拼团 `/group-buy`, 秒杀 `/flash-sale`, 社区 `/community`, 课程 `/course`.
- Produces: default layout slots all later pages render inside.

- [ ] **Step 1: Scaffold the Nuxt 4 project and initialize Git**

Use pnpm/Nuxi without deleting `docs/`; enable TypeScript strict mode, Nuxt UI, Pinia, global CSS, Vitest, Nuxt Test Utils, Vue Test Utils, Playwright, ESLint, and the SEO modules used in Task 3. Run `git init` if the scaffold command does not do so.

- [ ] **Step 2: Write the failing navigation tests**

Assert `AppHeader` renders the six labels in the exact order from `NAV_ITEMS`, each with the expected route, and `AppFooter` renders the site name and current-year text without hydration-dependent markup.

- [ ] **Step 3: Run the focused tests and verify failure**

Run: `pnpm vitest run tests/unit/shell`

Expected: FAIL because the shell components and navigation config do not exist.

- [ ] **Step 4: Implement the minimal application shell**

Create `NAV_ITEMS`, an accessible header with a mobile menu, the default layout, footer, base typography, focus styles, container widths, and a skip-to-content link. Keep brand tokens in CSS variables; do not choose final artwork in this task.

- [ ] **Step 5: Verify the foundation**

Run: `pnpm vitest run tests/unit/shell && pnpm nuxi typecheck && pnpm build`

Expected: all shell tests PASS, typecheck exits 0, production build completes.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml nuxt.config.ts tsconfig.json eslint.config.mjs .gitignore .env.example app tests docs
git commit -m "chore: scaffold Nuxt education frontend"
```

---

### Task 2: Typed REST client and normalized error model

**Files:**
- Modify: `nuxt.config.ts`
- Create: `app/lib/api/api.types.ts`
- Create: `app/lib/api/api-error.ts`
- Create: `app/composables/useApi.ts`
- Test: `tests/unit/api/api-error.spec.ts`
- Test: `tests/unit/api/useApi.spec.ts`

**Interfaces:**
- Produces: `ApiList<T> = { items: T[]; page: number; pageSize: number; total: number }`.
- Produces: `ApiErrorShape = { code: string; message: string; status: number; fieldErrors?: Record<string, string[]>; requestId?: string }`.
- Produces: `normalizeApiError(error: unknown): ApiErrorShape`.
- Produces: `ApiRequestOptions` extending fetch options with `auth?: 'public' | 'session'`; the default is `public`.
- Produces: `apiRequest<T>(path: string, options?: ApiRequestOptions): Promise<T>`.
- Produces: `useApiData<T>(key: string, path: MaybeRefOrGetter<string>, options?: ApiDataOptions<T>): AsyncData<T | null, ApiErrorShape | null>`.

- [ ] **Step 1: Write failing error-normalization tests**

Cover a structured 422 response with `fieldErrors`, a 401 response, an abort/timeout, and an unstructured network exception. Assert every result contains a stable `code`, user-safe `message`, numeric `status`, and optional `requestId`.

- [ ] **Step 2: Run the error tests and verify failure**

Run: `pnpm vitest run tests/unit/api/api-error.spec.ts`

Expected: FAIL because `normalizeApiError` does not exist.

- [ ] **Step 3: Implement the error types and normalizer**

Keep transport-specific property inspection inside `api-error.ts`; never expose raw backend stacks or HTML error bodies to components.

- [ ] **Step 4: Write failing REST-client tests**

Mock Nuxt runtime config and fetch. Assert server calls use `apiBaseInternal`, browser calls use `public.apiBase`, public requests do not forward cookies, `auth: 'session'` requests include credentials and SSR request cookies, timeout is 10 seconds, and failures are converted by `normalizeApiError`.

- [ ] **Step 5: Implement `apiRequest` and `useApiData`**

Use plain `$fetch` for public SSR requests so user cookies cannot influence shared content. Use `useRequestFetch()` only for `auth: 'session'` SSR requests so allowed request headers/cookies can be forwarded; use credentialed `$fetch` for session requests in the browser. Do not add Axios or create a Nuxt business API proxy.

- [ ] **Step 6: Verify the API layer**

Run: `pnpm vitest run tests/unit/api && pnpm nuxi typecheck`

Expected: API tests PASS and typecheck exits 0.

- [ ] **Step 7: Commit**

```bash
git add nuxt.config.ts app/lib/api app/composables/useApi.ts tests/unit/api .env.example
git commit -m "feat: add typed REST API client"
```

---

### Task 3: Shared SEO, status handling, and indexing controls

**Files:**
- Modify: `nuxt.config.ts`
- Create: `app/lib/seo/seo.types.ts`
- Create: `app/lib/seo/schema.ts`
- Create: `app/lib/seo/sitemap.ts`
- Create: `app/composables/usePageSeo.ts`
- Create: `app/utils/normalizePage.ts`
- Create: `app/error.vue`
- Test: `tests/unit/seo/usePageSeo.spec.ts`
- Test: `tests/unit/seo/schema.spec.ts`
- Test: `tests/unit/seo/sitemap.spec.ts`
- Test: `tests/unit/utils/normalizePage.spec.ts`

**Interfaces:**
- Produces: `usePageSeo(input: PageSeoInput): void`, where `PageSeoInput` includes `title`, `description`, `path`, `image?`, `noindex?`, and `schema?`.
- Produces: `courseSchema(course: CourseSeoSource): Record<string, unknown>`.
- Produces: `articleSchema(article: ArticleSeoSource): Record<string, unknown>`.
- Produces: `breadcrumbSchema(items: BreadcrumbItem[]): Record<string, unknown>`.
- Produces: `getSitemapSources(apiBase?: string): SitemapSource[]` as typed descriptors of the approved course, exam, promotion, and community public API paths. These descriptors are not passed directly to `@nuxtjs/sitemap` because the APIs return `ApiList<T>`, not sitemap URL arrays.
- Produces: `collectSitemapUrls<T>(fetchPage, toEntry): Promise<SitemapUrlEntry[]>`, a domain-neutral paginator that follows `ApiList<T>.page/pageSize/total`, stops safely on an empty page, and delegates domain route mapping to Tasks 5–8.
- Produces: `normalizePage(value: unknown): number`, returning 1 for invalid values.
- Defers: dynamic sitemap URL projection and source wiring to Tasks 5–8, where each domain's `slug`, optional `updatedAt`, public route prefix, and pagination contract are defined.

- [ ] **Step 1: Write failing SEO utility tests**

Assert canonical URLs are absolute and query-free unless explicitly supplied, `noindex` produces `robots: noindex, nofollow`, JSON-LD contains the required schema type, the four sitemap descriptors contain only approved public API paths, invalid pagination values normalize to 1, and `collectSitemapUrls` exhausts every `ApiList` page without looping after an empty page. Do not treat a paginated `ApiList<T>` endpoint as a module-ready sitemap source.

- [ ] **Step 2: Run the SEO tests and verify failure**

Run: `pnpm vitest run tests/unit/seo tests/unit/utils/normalizePage.spec.ts`

Expected: FAIL because SEO utilities do not exist.

- [ ] **Step 3: Implement the SEO utilities and modules**

Configure site URL/name, robots, named course/exam/promotion/community sitemap definitions without dynamic sources yet, and Schema.org support. Add a global `Organization` node and an error page that preserves real 404/500 status semantics. Keep the Organization URL runtime-resolvable from site config instead of freezing the build-time fallback into the identity object.

- [ ] **Step 4: Verify emitted head content**

Run: `pnpm vitest run tests/unit/seo tests/unit/utils/normalizePage.spec.ts && pnpm nuxi typecheck`

Expected: tests PASS; generated head data contains title, description, canonical, robots, and JSON-LD.

- [ ] **Step 5: Commit**

```bash
git add nuxt.config.ts app/lib/seo app/composables/usePageSeo.ts app/utils/normalizePage.ts app/error.vue tests/unit/seo tests/unit/utils
git commit -m "feat: establish SSR SEO foundation"
```

---

### Task 4: Home page vertical slice

**Files:**
- Create: `app/features/home/home.types.ts`
- Create: `app/features/home/home.service.ts`
- Create: `app/features/home/components/HomeBanner.vue`
- Create: `app/features/home/components/HomeSection.vue`
- Create: `app/features/home/components/CourseCard.vue`
- Create: `app/features/home/components/PromotionCard.vue`
- Create: `app/features/home/components/HomeErrorState.vue`
- Create: `app/pages/index.vue`
- Test: `tests/unit/home/home.service.spec.ts`
- Test: `tests/unit/home/HomeBanner.spec.ts`
- Test: `tests/unit/home/index.spec.ts`

**Interfaces:**
- Produces: `CourseSummary`, `PromotionSummary`, `BannerItem`, and `HomeResponse`.
- Produces: `getHome(): Promise<HomeResponse>` using `GET /v1/home`.
- Consumes: `apiRequest`, `usePageSeo`, and shared application shell.

- [ ] **Step 1: Write failing service and page tests**

Assert `getHome` calls `/v1/home`; the page renders Banner、正在拼团、最新课程、推荐课程 from SSR data; Banner has accessible names and controls; API failure renders a retry state instead of four empty sections.

- [ ] **Step 2: Run the home tests and verify failure**

Run: `pnpm vitest run tests/unit/home`

Expected: FAIL because the feature does not exist.

- [ ] **Step 3: Implement the home service, domain summaries, and components**

Render the first Banner image eagerly with explicit dimensions; lazy-load later images. Keep carousel enhancement client-interactive while retaining meaningful SSR markup for the first slide and links.

- [ ] **Step 4: Implement the SSR home page**

Fetch with `useAsyncData('home', getHome)`, set page SEO, render section headings and real links, and configure a public SWR route rule of 300 seconds for `/`.

- [ ] **Step 5: Verify the vertical slice**

Run: `pnpm vitest run tests/unit/home && pnpm nuxi typecheck && pnpm build`

Expected: home tests PASS; build completes; server-rendered output contains all four section headings.

- [ ] **Step 6: Commit**

```bash
git add app/features/home app/pages/index.vue nuxt.config.ts tests/unit/home
git commit -m "feat: build SSR education home page"
```

---

### Task 5: Course catalogue and course detail

**Files:**
- Modify: `nuxt.config.ts`
- Create: `app/features/course/course.types.ts`
- Create: `app/features/course/course.service.ts`
- Create: `app/features/course/course.sitemap.ts`
- Create: `app/features/course/components/CourseFilters.vue`
- Create: `app/features/course/components/CourseGrid.vue`
- Create: `app/features/course/components/CourseHero.vue`
- Create: `app/features/course/components/CourseOutline.vue`
- Create: `app/components/common/AppPagination.vue`
- Create: `app/pages/course/index.vue`
- Create: `app/pages/course/[slug].vue`
- Create: `server/routes/__sitemap__/courses.ts`
- Test: `tests/unit/course/course.service.spec.ts`
- Test: `tests/unit/course/course-pages.spec.ts`
- Test: `tests/unit/course/course-sitemap.spec.ts`
- Test: `tests/unit/common/AppPagination.spec.ts`

**Interfaces:**
- Produces: `CourseDetail extends CourseSummary` with teacher, audience, outline, publishedAt, and updatedAt.
- Produces: `getCourses(query: CourseQuery): Promise<ApiList<CourseSummary>>` and `getCourse(slug: string): Promise<CourseDetail>`.
- Produces: crawlable `AppPagination` links.
- Produces: `/__sitemap__/courses`, returning `{ loc: '/course/<encoded-slug>', lastmod?: updatedAt }[]`, and wires it only to the named `courses` sitemap.
- Consumes: `normalizePage`, `courseSchema`, `breadcrumbSchema`, `usePageSeo`, and `collectSitemapUrls` from Task 3.

- [ ] **Step 1: Write failing course service tests**

Assert list parameters serialize page/category/keyword, detail uses encoded slug, and an API 404 is preserved for the page layer. For sitemap collection, assert all `ApiList` pages are fetched exactly once, an empty page terminates safely, slugs are URL-encoded, `updatedAt` maps to `lastmod`, and the public API request path cannot inherit Cookie or Authorization headers.

- [ ] **Step 2: Write failing page and pagination tests**

Assert `page=0`, `page=-2`, and `page=abc` become page 1; pagination renders anchor links; detail emits `Course` and breadcrumb JSON-LD; unknown slug triggers `createError({ statusCode: 404 })`; the course sitemap source returns every public course detail URL and no list/filter URLs.

- [ ] **Step 3: Run course tests and verify failure**

Run: `pnpm vitest run tests/unit/course tests/unit/common/AppPagination.spec.ts`

Expected: FAIL because course files do not exist.

- [ ] **Step 4: Implement course services, sitemap projection, list page, detail page, and components**

Keep filter state in the URL. Use a canonical URL without empty/default query parameters and SSR all indexable course text. Implement the internal `/__sitemap__/courses` route with `defineSitemapEventHandler`; it is an SEO projection only, must return sitemap URL entries rather than proxying business payloads, and must read the independent backend through the public no-credential API path. Wire that internal route to the named `courses` sitemap.

- [ ] **Step 5: Verify course routes**

Run: `pnpm vitest run tests/unit/course tests/unit/common/AppPagination.spec.ts tests/unit/seo/sitemap.spec.ts && pnpm nuxi typecheck`

Expected: tests PASS and typecheck exits 0.

- [ ] **Step 6: Commit**

```bash
git add nuxt.config.ts app/features/course app/components/common/AppPagination.vue app/pages/course server/routes/__sitemap__/courses.ts tests/unit/course tests/unit/common
git commit -m "feat: add course catalogue and detail pages"
```

---

### Task 6: Exam discovery and protected attempt shell

**Files:**
- Modify: `nuxt.config.ts`
- Create: `app/features/exam/exam.types.ts`
- Create: `app/features/exam/exam.service.ts`
- Create: `app/features/exam/exam.sitemap.ts`
- Create: `app/features/exam/components/ExamCard.vue`
- Create: `app/features/exam/components/ExamOverview.vue`
- Create: `app/features/exam/components/QuestionNavigator.vue`
- Create: `app/features/exam/stores/attempt.ts`
- Create: `app/middleware/auth.ts`
- Create: `app/pages/exam/index.vue`
- Create: `app/pages/exam/[slug].vue`
- Create: `app/pages/exam/attempt/[id].vue`
- Create: `server/routes/__sitemap__/exams.ts`
- Test: `tests/unit/exam/exam-pages.spec.ts`
- Test: `tests/unit/exam/exam-sitemap.spec.ts`
- Test: `tests/unit/exam/attempt-store.spec.ts`
- Test: `tests/unit/middleware/auth.spec.ts`

**Interfaces:**
- Produces: `getExams(query): Promise<ApiList<ExamSummary>>`, `getExam(slug): Promise<ExamDetail>`.
- Produces: `useAttemptStore()` for local answer draft, current question, and completion state only; grading remains backend-owned.
- Produces: `/__sitemap__/exams`, returning every public `/exam/<encoded-slug>` URL with optional `lastmod`, and wires it only to the named `exams` sitemap.
- Consumes: API client, SEO utilities, shared pagination, backend auth cookie/session endpoint.
- Consumes: `collectSitemapUrls` from Task 3; sitemap reads remain public and must not carry the authenticated attempt session.

- [ ] **Step 1: Write failing exam route tests**

Assert public exam pages SSR their title/rules, unknown slug returns 404, attempt route emits `noindex`, and unauthenticated navigation redirects to `/login?redirect=<encoded path>`. Assert the exam sitemap paginates through all public summaries, URL-encodes each slug, excludes `/exam/attempt/**`, and never uses session authentication.

- [ ] **Step 2: Write failing attempt-store tests**

Assert answers can be set and cleared, current question stays in bounds, and no score or authoritative grading method exists in the store.

- [ ] **Step 3: Implement exam discovery, sitemap projection, auth middleware, and attempt shell**

Do not implement grading or anti-cheating. The attempt page may render questions supplied by the backend but must treat submission results as authoritative backend responses. Implement `/__sitemap__/exams` as an SEO-only projection through the public API client and wire it to the named `exams` sitemap.

- [ ] **Step 4: Verify exam behavior**

Run: `pnpm vitest run tests/unit/exam tests/unit/middleware/auth.spec.ts && pnpm nuxi typecheck`

Expected: tests PASS and typecheck exits 0.

- [ ] **Step 5: Commit**

```bash
git add nuxt.config.ts app/features/exam app/middleware/auth.ts app/pages/exam server/routes/__sitemap__/exams.ts tests/unit/exam tests/unit/middleware
git commit -m "feat: add exam discovery and attempt shell"
```

---

### Task 7: Group-buy and flash-sale promotions

**Files:**
- Modify: `nuxt.config.ts`
- Create: `app/features/promotion/promotion.types.ts`
- Create: `app/features/promotion/promotion.service.ts`
- Create: `app/features/promotion/promotion-state.ts`
- Create: `app/features/promotion/promotion.sitemap.ts`
- Create: `app/features/promotion/components/PromotionGrid.vue`
- Create: `app/features/promotion/components/PromotionHero.vue`
- Create: `app/features/promotion/components/PromotionCountdown.vue`
- Create: `app/pages/group-buy/index.vue`
- Create: `app/pages/group-buy/[slug].vue`
- Create: `app/pages/flash-sale/index.vue`
- Create: `app/pages/flash-sale/[slug].vue`
- Create: `server/routes/__sitemap__/promotions.ts`
- Test: `tests/unit/promotion/promotion-state.spec.ts`
- Test: `tests/unit/promotion/promotion-pages.spec.ts`
- Test: `tests/unit/promotion/promotion-sitemap.spec.ts`

**Interfaces:**
- Produces: `getGroupBuys`, `getGroupBuy`, `getFlashSales`, `getFlashSale` returning typed summaries/details.
- Produces: `promotionState(now, startsAt, endsAt, remaining): 'upcoming' | 'active' | 'sold-out' | 'ended'`.
- Produces: `/__sitemap__/promotions`, combining every public `/group-buy/<encoded-slug>` and `/flash-sale/<encoded-slug>` URL with optional `lastmod`, and wires it only to the named `promotions` sitemap.
- Consumes: API client, SEO utilities, shared pagination.
- Consumes: `collectSitemapUrls` from Task 3; both source lists are fetched publicly without user credentials.

- [ ] **Step 1: Write failing promotion-state tests**

Use a fixed clock and assert boundary behavior at exact start/end timestamps, zero remaining inventory, and invalid date input.

- [ ] **Step 2: Write failing promotion-page tests**

Assert active promotions enable the CTA; upcoming, sold-out, and ended promotions disable it with distinct text; expired detail remains SSR-readable; unknown slug returns 404. Assert the promotion sitemap exhausts both paginated APIs, keeps the group-buy and flash-sale route prefixes distinct, URL-encodes slugs, and does not infer purchase eligibility or inventory from sitemap generation.

- [ ] **Step 3: Implement shared promotion components, sitemap projection, and the four routes**

SSR the authoritative start/end time and current state. Hydrate only the countdown display; never perform inventory deduction or trust the browser clock for purchase eligibility. Implement the combined `/__sitemap__/promotions` SEO projection through public API calls and wire it to the named `promotions` sitemap.

- [ ] **Step 4: Verify promotions**

Run: `pnpm vitest run tests/unit/promotion && pnpm nuxi typecheck`

Expected: tests PASS and typecheck exits 0.

- [ ] **Step 5: Commit**

```bash
git add nuxt.config.ts app/features/promotion app/pages/group-buy app/pages/flash-sale server/routes/__sitemap__/promotions.ts tests/unit/promotion
git commit -m "feat: add group-buy and flash-sale pages"
```

---

### Task 8: Community listing and article detail

**Files:**
- Modify: `nuxt.config.ts`
- Create: `app/features/community/community.types.ts`
- Create: `app/features/community/community.service.ts`
- Create: `app/features/community/community.sitemap.ts`
- Create: `app/features/community/components/PostCard.vue`
- Create: `app/features/community/components/PostContent.vue`
- Create: `app/features/community/components/PostMeta.vue`
- Create: `app/pages/community/index.vue`
- Create: `app/pages/community/[slug].vue`
- Create: `server/routes/__sitemap__/community.ts`
- Test: `tests/unit/community/community.service.spec.ts`
- Test: `tests/unit/community/community-pages.spec.ts`
- Test: `tests/unit/community/community-sitemap.spec.ts`

**Interfaces:**
- Produces: `getPosts(query): Promise<ApiList<PostSummary>>`, `getPost(slug): Promise<PostDetail>`.
- Produces: `/__sitemap__/community`, returning every published `/community/<encoded-slug>` URL with optional `lastmod`, and wires it only to the named `community` sitemap.
- Consumes: `articleSchema`, `breadcrumbSchema`, `usePageSeo`, API client, pagination.
- Consumes: `collectSitemapUrls` from Task 3; unpublished posts must be absent from the public list contract rather than filtered from sensitive data in Nuxt.

- [ ] **Step 1: Write failing community tests**

Assert the list uses crawlable pagination, detail SSR-renders sanitized content and author/date metadata, JSON-LD uses `DiscussionForumPosting`, and unknown/unpublished slug returns 404. Assert the community sitemap paginates through every public post, maps only published post slugs to `/community/<encoded-slug>`, carries `updatedAt` as `lastmod`, and never exposes unpublished records.

- [ ] **Step 2: Run the tests and verify failure**

Run: `pnpm vitest run tests/unit/community`

Expected: FAIL because the community feature does not exist.

- [ ] **Step 3: Implement community sitemap projection and pages**

Render only backend-sanitized HTML or a typed safe-content format. Do not add a client-side sanitizer as a substitute for backend sanitization; preserve semantic heading and link markup. Implement `/__sitemap__/community` as an SEO-only projection through public API calls and wire it to the named `community` sitemap.

- [ ] **Step 4: Verify community routes**

Run: `pnpm vitest run tests/unit/community && pnpm nuxi typecheck`

Expected: tests PASS and typecheck exits 0.

- [ ] **Step 5: Commit**

```bash
git add nuxt.config.ts app/features/community app/pages/community server/routes/__sitemap__/community.ts tests/unit/community
git commit -m "feat: add SSR community pages"
```

---

### Task 9: Authentication UI and cache-safety rules

**Files:**
- Create: `app/features/auth/auth.types.ts`
- Create: `app/features/auth/auth.service.ts`
- Create: `app/features/auth/stores/session.ts`
- Create: `app/features/auth/components/LoginForm.vue`
- Create: `app/pages/login.vue`
- Modify: `nuxt.config.ts`
- Test: `tests/unit/auth/login.spec.ts`
- Test: `tests/unit/auth/session.spec.ts`
- Test: `tests/unit/config/route-rules.spec.ts`

**Interfaces:**
- Produces: `getSession(): Promise<Session | null>`, `login(credentials): Promise<Session>`, and `logout(): Promise<void>` against the independent backend.
- Produces: `useSessionStore()` containing only the current session projection, never the raw credential.
- Consumes: normalized API errors and auth middleware.

- [ ] **Step 1: Write failing auth tests**

Assert login displays normalized field errors, never writes tokens to localStorage, preserves a safe same-origin redirect, and rejects external/open-redirect values.

- [ ] **Step 2: Write failing route-rule tests**

Assert `/exam/attempt/**`, `/login`, and future `/account/**` routes have `noindex`; private routes have no ISR/SWR/public cache rule; public home/detail rules do not vary on user cookies.

- [ ] **Step 3: Implement auth UI, store, and safe redirect helper**

Use `credentials: include` and backend cookies. Keep the login page `noindex`; clear only local session projection on logout.

- [ ] **Step 4: Implement and verify cache-safety configuration**

Run: `pnpm vitest run tests/unit/auth tests/unit/config/route-rules.spec.ts && pnpm nuxi typecheck`

Expected: tests PASS; private route assertions prove no shared cache configuration.

- [ ] **Step 5: Commit**

```bash
git add app/features/auth app/pages/login.vue nuxt.config.ts tests/unit/auth tests/unit/config
git commit -m "feat: add cookie-based frontend authentication"
```

---

### Task 10: End-to-end fixtures, SEO smoke tests, and deployment packaging

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/fixtures/api-server.mjs`
- Create: `tests/e2e/navigation.spec.ts`
- Create: `tests/e2e/seo.spec.ts`
- Create: `tests/e2e/error-states.spec.ts`
- Create: `Dockerfile`
- Create: `.dockerignore`
- Create: `deploy/nginx.conf.example`
- Create: `README.md`
- Modify: `package.json`

**Interfaces:**
- Consumes: every public route, REST contract, route rules, and SEO utilities.
- Produces: `pnpm test`, `pnpm test:e2e`, `pnpm typecheck`, and `pnpm verify` scripts.

- [ ] **Step 1: Create the deterministic REST fixture server**

Implement only the GET endpoints from the design spec plus controlled 404, 422, timeout, and 500 fixtures. Bind it to localhost during tests and never ship it in the production image.

- [ ] **Step 2: Write failing end-to-end navigation tests**

Assert all six header destinations load, mobile navigation is keyboard-operable, public list/detail pages render fixture content, and the attempt route redirects when unauthenticated.

- [ ] **Step 3: Write failing SEO and failure-state tests**

For each public route assert nonempty title/description/canonical, one H1, indexable initial HTML, correct JSON-LD type, and real 404 status for unknown slugs. Assert the sitemap index exposes the pages, courses, exams, promotions, and community child sitemaps; each domain sitemap contains every fixture detail URL across multiple API pages, excludes filter/private/unpublished URLs, and remains identical when the incoming request carries a test Cookie. Assert API timeout displays the retry state and never a false “暂无内容”.

- [ ] **Step 4: Run end-to-end tests and fix only integration gaps**

Run: `pnpm test:e2e`

Expected: all navigation, SEO, sitemap, 404, auth-redirect, and timeout scenarios PASS.

- [ ] **Step 5: Add production packaging and operator documentation**

Create a multi-stage Node.js 24 image for `.output`, document `NUXT_PUBLIC_API_BASE`, `NUXT_API_BASE_INTERNAL`, and `NUXT_PUBLIC_SITE_URL`, and provide an Nginx example mapping `/` to Nuxt and `/api/` to the independent backend. Document that permanent content moves must be represented as explicit 301 rules at the gateway (or as backend-provided redirect targets handled by Nuxt), never as a 200 page with changed canonical. State explicitly that production requires the external backend and contains no embedded business API.

- [ ] **Step 6: Run the complete verification suite**

Run: `pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e && pnpm build`

Expected: every command exits 0; no hydration warnings; production output is created under `.output/`.

- [ ] **Step 7: Commit**

```bash
git add playwright.config.ts tests Dockerfile .dockerignore deploy README.md package.json pnpm-lock.yaml
git commit -m "test: verify and package education frontend"
```

---

## Milestone Gates

1. After Task 4, review the first vertical slice before expanding the same patterns to other domains.
2. After Task 6, verify the public/private route boundary and confirm the backend authentication contract.
3. After Task 8, verify all four dynamic sitemap projections exhaust pagination, map only public detail routes, and never vary by user Cookie.
4. After Task 9, run a security-focused review of cookies, redirects, caching, and rendered user data.
5. After Task 10, run `superpowers:verification-before-completion`, then `superpowers:requesting-code-review` before declaring the implementation complete.

## Deferred Follow-up Plans

Create separate design and implementation plans before adding payment, order creation, inventory reservation, exam grading/anti-cheating, post creation/moderation, live classes, chat, or a management console. Those are independent systems and are intentionally outside this frontend MVP.
