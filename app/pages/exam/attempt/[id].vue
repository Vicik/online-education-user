<script setup lang="ts">
import type { AuthSessionStatus } from '~/middleware/auth'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const attemptId = computed(() => Array.isArray(route.params.id) ? route.params.id[0] ?? '' : route.params.id ?? '')
const sessionStatus = useState<AuthSessionStatus>('auth:session-status', () => 'unknown')

usePageSeo(computed(() => ({
  title: '答题界面｜知序学堂',
  description: '知序学堂考试答题界面。',
  path: `/exam/attempt/${encodeURIComponent(attemptId.value)}`,
  noindex: true,
})))
</script>

<template>
  <div
    class="attempt-shell"
    style="width: var(--page-width)"
  >
    <header v-if="sessionStatus === 'unknown'">
      <h1>正在确认登录状态</h1>
    </header>
    <header v-else-if="sessionStatus === 'authenticated'">
      <p>考试编号：{{ attemptId }}</p>
      <h1>答题界面</h1>
    </header>
    <header v-else>
      <h1>正在前往登录页</h1>
    </header>
    <section
      v-if="sessionStatus === 'unknown'"
      aria-labelledby="attempt-status-heading"
    >
      <h2 id="attempt-status-heading">
        答题内容尚未加载
      </h2>
      <p>登录会话确认完成前不会请求或显示私人答题数据；最终成绩以服务端提交结果为准。</p>
    </section>
    <section
      v-else-if="sessionStatus === 'authenticated'"
      aria-labelledby="attempt-status-heading"
    >
      <h2 id="attempt-status-heading">
        答题内容待会话加载
      </h2>
      <p>登录会话与题目由独立后端提供；最终成绩以服务端提交结果为准。</p>
    </section>
  </div>
</template>

<style scoped>
.attempt-shell { margin-inline: auto; padding: 2rem 0 4rem; }
.attempt-shell header { padding: 2rem; background: var(--color-indigo); color: white; }
.attempt-shell header p, .attempt-shell h1 { margin: 0; }
.attempt-shell h1 { margin-top: 0.35rem; font-family: "Noto Serif SC", "Songti SC", serif; }
.attempt-shell section { margin-top: 1.5rem; padding: 3rem; border: 1px solid var(--color-line); background: white; text-align: center; }
.attempt-shell section h2, .attempt-shell section p { margin: 0; }
.attempt-shell section p { margin-top: 0.75rem; color: var(--color-muted); }
@media (max-width: 78rem) { .attempt-shell { width: calc(100% - 2rem) !important; } }
</style>
