<script setup lang="ts">
defineEmits<{
  retry: []
}>()
</script>

<template>
  <section
    class="home-error"
    role="alert"
  >
    <span
      class="error-mark"
      aria-hidden="true"
    >!</span>
    <div>
      <h1>首页内容暂时无法加载</h1>
      <p>请检查网络连接后重试，课程内容不会因此丢失。</p>
      <button
        type="button"
        @click="$emit('retry')"
      >
        重新加载
      </button>
    </div>
  </section>
</template>

<style scoped>
.home-error {
  display: flex;
  align-items: flex-start;
  width: min(calc(100% - 2rem), 46rem);
  margin: 5rem auto;
  padding: 2rem;
  border: 1px solid color-mix(in srgb, #df4d55, transparent 60%);
  border-radius: 1rem;
  background: var(--color-surface);
  box-shadow: var(--shadow-soft);
  gap: 1rem;
}

.error-mark {
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #fff0f1;
  color: #b93640;
  font-size: 1.25rem;
  font-weight: 850;
  place-items: center;
}

.home-error h1,
.home-error p {
  margin: 0;
}

.home-error h1 {
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 1.35rem;
}

.home-error p {
  margin-top: 0.45rem;
  color: var(--color-muted);
}

.home-error button {
  margin-top: 1.2rem;
  padding: 0.65rem 1rem;
  border: 0;
  border-radius: 0.45rem;
  background: var(--color-indigo);
  color: white;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}
</style>
