<script setup lang="ts">
import { NAV_ITEMS, SITE_NAME } from '~/config/navigation'
</script>

<template>
  <header class="site-header">
    <div class="header-inner">
      <NuxtLink
        class="brand"
        to="/"
        aria-label="知序学堂首页"
      >
        <span
          class="brand-mark"
          aria-hidden="true"
        >知</span>
        <span class="brand-copy">
          <strong>{{ SITE_NAME }}</strong>
          <small>循序而学 · 知行相长</small>
        </span>
      </NuxtLink>

      <nav
        class="desktop-navigation"
        data-testid="desktop-navigation"
        aria-label="主导航"
      >
        <NuxtLink
          v-for="item in NAV_ITEMS"
          :key="item.to"
          :to="item.to"
          class="navigation-link"
          active-class="is-active"
          :exact="item.to === '/'"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  z-index: 30;
  top: 0;
  min-height: var(--header-height);
  border-bottom: 1px solid color-mix(in srgb, var(--color-line), transparent 10%);
  background: color-mix(in srgb, var(--color-paper), transparent 6%);
  backdrop-filter: blur(16px);
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: var(--page-width);
  min-height: var(--header-height);
  margin-inline: auto;
  gap: 2rem;
}

.brand {
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 0.7rem;
}

.brand-mark {
  display: grid;
  width: 2.55rem;
  height: 2.85rem;
  place-items: center;
  border-radius: 0.35rem 0.35rem 0.7rem 0.7rem;
  background: var(--color-indigo);
  box-shadow: 0 0.35rem 0 var(--color-amber);
  color: white;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 1.25rem;
  font-weight: 700;
}

.brand-copy {
  display: grid;
  line-height: 1.15;
}

.brand-copy strong {
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 1.12rem;
  letter-spacing: 0.08em;
}

.brand-copy small {
  margin-top: 0.25rem;
  color: var(--color-muted);
  font-size: 0.66rem;
  letter-spacing: 0.08em;
}

.desktop-navigation {
  display: flex;
  align-self: stretch;
  align-items: center;
  gap: 0.25rem;
}

.navigation-link {
  position: relative;
  display: grid;
  height: 100%;
  min-width: 4rem;
  place-items: center;
  padding: 0 0.85rem;
  color: var(--color-muted);
  font-size: 0.94rem;
  font-weight: 600;
  transition: color 160ms ease;
}

.navigation-link::after {
  position: absolute;
  top: 0;
  width: 1.25rem;
  height: 0.32rem;
  border-radius: 0 0 0.3rem 0.3rem;
  background: transparent;
  content: "";
  transition: height 160ms ease, background 160ms ease;
}

.navigation-link:hover,
.navigation-link.is-active {
  color: var(--color-indigo);
}

.navigation-link.is-active::after {
  height: 0.58rem;
  background: var(--color-indigo);
}
</style>
