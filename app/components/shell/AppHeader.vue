<script setup lang="ts">
import { NAV_ITEMS, SITE_NAME } from '~/config/navigation'

const route = useRoute()
</script>

<template>
  <header class="site-header">
    <div class="header-inner">
      <NuxtLink
        class="brand"
        to="/"
        aria-label="知序学堂首页"
      >
        {{ SITE_NAME }}
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
          :class="{ 'is-active': item.to === '/' ? route.path === '/' : route.path.startsWith(item.to) }"
          :exact="item.to === '/'"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div
        class="header-utilities"
        data-testid="header-utilities"
        aria-hidden="true"
      >
        <span class="search-icon">
          <svg
            viewBox="0 0 24 24"
            focusable="false"
          >
            <circle
              cx="10.8"
              cy="10.8"
              r="5.8"
            />
            <path d="m15.2 15.2 4.1 4.1" />
          </svg>
        </span>
        <span class="account-avatar">
          <svg
            viewBox="0 0 32 32"
            focusable="false"
          >
            <circle
              cx="16"
              cy="12"
              r="6"
            />
            <path d="M6.5 28c.8-6 4.1-9 9.5-9s8.7 3 9.5 9" />
          </svg>
        </span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  z-index: 30;
  top: 0;
  min-height: var(--header-height);
  border-bottom: 1px solid #e8ebef;
  background: var(--color-surface);
  box-shadow: 0 0.18rem 0.8rem rgb(24 36 55 / 5%);
}

.header-inner {
  display: flex;
  align-items: center;
  width: var(--page-width);
  min-height: var(--header-height);
  margin-inline: auto;
}

.brand {
  flex: 0 0 auto;
  margin-right: 1.7rem;
  color: #151b23;
  font-size: 1.45rem;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.desktop-navigation {
  display: flex;
  align-self: stretch;
  align-items: center;
  margin-right: auto;
  gap: 0.35rem;
}

.navigation-link {
  display: grid;
  min-width: 3.5rem;
  height: 3rem;
  place-items: center;
  padding: 0 0.9rem;
  border-radius: 0.3rem;
  color: #202a35;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 160ms ease, color 160ms ease;
}

.navigation-link:hover,
.navigation-link.is-active {
  background: #e9f3ff;
  color: #3974a9;
}

.header-utilities {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: 2rem;
}

.search-icon,
.account-avatar {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 50%;
}

.search-icon {
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid #e2e6eb;
  color: #1f2933;
}

.search-icon svg {
  width: 1.45rem;
  fill: none;
  stroke: currentcolor;
  stroke-linecap: round;
  stroke-width: 2.2;
}

.account-avatar {
  width: 2.5rem;
  height: 2.5rem;
  overflow: hidden;
  background: #efb6c4;
  color: #25364a;
}

.account-avatar svg {
  width: 2rem;
  fill: currentcolor;
}
</style>
