# Desktop-only Fixed-width Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the shared shell and Task 4 home page render as a centered, fixed `1200px` desktop website at every browser width.

**Architecture:** Keep `--page-width: 75rem` as the single width token, set the document minimum width from that token, and make shell/home containers consume that exact width. Remove mobile-only markup and breakpoint overrides so narrow viewports scroll horizontally instead of changing component structure.

**Tech Stack:** Nuxt 4, Vue 3, TypeScript, scoped CSS, Vitest, Nuxt Test Utils

**Spec:** `docs/superpowers/specs/2026-10-29-desktop-only-layout-design.md`

## Global Constraints

- The content, header inner area, and footer inner area are exactly `1200px` wide and horizontally centered.
- The page never switches to mobile navigation or one/two-column home lists.
- Preserve keyboard focus, skip-link behavior, SSR, SEO, API, and SWR behavior.
- Add no dependencies and do not commit, push, or deploy without separate authorization.

## Review Focus

- At a viewport narrower than `1200px`, the document must retain a `1200px` desktop canvas instead of reflowing.
- The six navigation destinations must remain in the approved order and the mobile menu must be absent.
- Home list sections must retain four equal columns at all viewport widths.
- Header, Banner, sections, and footer must align to the same width token.
- Reduced-motion and visible-focus behavior must remain intact after responsive CSS removal.

---

### Task 1: Lock the shared shell to the desktop canvas

**Files:**
- Modify: `tests/unit/shell/AppHeader.spec.ts`
- Modify: `tests/unit/shell/DefaultLayout.spec.ts`
- Modify: `app/assets/css/main.css`
- Modify: `app/components/shell/AppHeader.vue`
- Modify: `app/components/shell/AppFooter.vue`

**Interfaces:**
- Consumes: CSS custom property `--page-width: 75rem` and `NAV_ITEMS`.
- Produces: a single desktop navigation and shared `1200px` shell alignment.

- [ ] **Step 1: Write failing shell tests**

  Assert that `AppHeader` renders the six desktop links and no `[data-testid="mobile-navigation"]`. Assert that the layout exposes the desktop page-width contract through the rendered shell classes without a mobile navigation branch.

- [ ] **Step 2: Run the shell tests and verify RED**

  Run: `pnpm vitest run tests/unit/shell/AppHeader.spec.ts tests/unit/shell/DefaultLayout.spec.ts`

  Expected: failure because the mobile menu still exists and the fixed desktop contract is not present.

- [ ] **Step 3: Implement the minimal shell change**

  Set `body` to `min-width: var(--page-width)`. Make `.header-inner` and `.footer-inner` exactly `var(--page-width)` wide and centered. Remove mobile navigation markup/styles and footer mobile stacking rules.

- [ ] **Step 4: Run the shell tests and verify GREEN**

  Run: `pnpm vitest run tests/unit/shell/AppHeader.spec.ts tests/unit/shell/DefaultLayout.spec.ts`

  Expected: both suites pass.

### Task 2: Lock Task 4 home content to four-column desktop layout

**Files:**
- Modify: `tests/unit/home/index.spec.ts`
- Modify: `app/features/home/components/HomeBanner.vue`
- Modify: `app/features/home/components/HomeSection.vue`

**Interfaces:**
- Consumes: `--page-width: 75rem` from global CSS.
- Produces: a `1200px` Banner and home sections whose grids always use four columns.

- [ ] **Step 1: Write a failing home desktop-layout test**

  Assert that the rendered Banner and every home section expose the fixed desktop container classes, and add a source-level assertion that no home layout breakpoint changes the Banner aspect ratio or section grid column count.

- [ ] **Step 2: Run the focused home test and verify RED**

  Run: `pnpm vitest run tests/unit/home/index.spec.ts`

  Expected: failure while responsive breakpoint rules remain.

- [ ] **Step 3: Implement the minimal home layout change**

  Make `.home-banner` and `.home-section` exactly `var(--page-width)` wide and centered. Remove mobile Banner overrides and the two-column/one-column section breakpoints while retaining four `minmax(0, 1fr)` columns.

- [ ] **Step 4: Run the focused home test and verify GREEN**

  Run: `pnpm vitest run tests/unit/home/index.spec.ts`

  Expected: the focused suite passes.

- [ ] **Step 5: Run complete verification**

  Run serially: `pnpm lint`, `pnpm test`, `pnpm nuxi typecheck`, `pnpm build`.

  Expected: all commands exit `0`. Then inspect `http://localhost:3000/` in a viewport narrower than `1200px` and confirm the desktop navigation and four-column grids remain visible on the fixed canvas with horizontal scrolling.

- [ ] **Step 6: Inspect scope and stop**

  Run: `git diff --check` and `git status --short`. Confirm no unrelated files changed and do not commit, push, deploy, or start another Task.
