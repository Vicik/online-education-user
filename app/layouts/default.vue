<script setup lang="ts">
import AppFooter from '~/components/shell/AppFooter.vue'
import AppHeader from '~/components/shell/AppHeader.vue'
</script>

<template>
  <div class="site-shell">
    <a
      class="skip-link"
      href="#main-content"
    >
      跳到主要内容
    </a>
    <AppHeader />
    <main
      id="main-content"
      class="site-main"
      tabindex="-1"
    >
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.site-shell {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}

.site-main {
  width: 100%;
  flex: 1;
}

.skip-link {
  position: fixed;
  z-index: 100;
  top: 0.75rem;
  left: 0.75rem;
  padding: 0.6rem 0.8rem;
  border-radius: 0.45rem;
  background: var(--color-ink);
  color: white;
  transform: translateY(-180%);
  transition: transform 120ms ease;
}

.skip-link:focus {
  transform: translateY(0);
}
</style>
