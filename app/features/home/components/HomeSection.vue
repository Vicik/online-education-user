<script setup lang="ts">
defineProps<{
  title: string
  moreHref: string
  moreLabel: string
}>()
</script>

<template>
  <section
    class="home-section"
    style="width: var(--page-width)"
  >
    <header class="section-header">
      <h2>{{ title }}</h2>
      <NuxtLink
        :to="moreHref"
        class="section-more"
      >
        {{ moreLabel }}
        <span aria-hidden="true">→</span>
      </NuxtLink>
    </header>
    <div
      class="section-grid"
      style="grid-template-columns: repeat(4, minmax(0, 1fr))"
    >
      <slot />
    </div>
  </section>
</template>

<style scoped>
.home-section {
  margin: 3.2rem auto 0;
}

.section-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  margin-bottom: 1.15rem;
  gap: 1rem;
}

.section-header h2 {
  margin: 0;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: clamp(1.35rem, 2.5vw, 1.8rem);
  letter-spacing: 0.04em;
}

.section-more {
  color: var(--color-muted);
  font-size: 0.88rem;
  font-weight: 600;
}

.section-more:hover {
  color: var(--color-indigo);
}

.section-grid {
  display: grid;
  gap: 1.25rem;
}
</style>
