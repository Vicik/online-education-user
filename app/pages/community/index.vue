<script setup lang="ts">
import AppPagination from '~/components/common/AppPagination.vue'
import AppErrorState from '~/components/common/AppErrorState.vue'
import PostCard from '~/features/community/components/PostCard.vue'
import { getPosts } from '~/features/community/community.service'
import { normalizePage } from '~/utils/normalizePage'

const PAGE_SIZE = 10
const route = useRoute()

const page = computed(() => normalizePage(Array.isArray(route.query.page) ? route.query.page[0] : route.query.page))
const { data: postList, error, status, refresh } = await useAsyncData(
  () => `community:${page.value}`,
  () => getPosts({ page: page.value, pageSize: PAGE_SIZE }),
  { watch: [page] },
)

usePageSeo(computed(() => ({
  title: page.value > 1
    ? `学习社区第 ${page.value} 页｜知序学堂`
    : '学习社区｜知序学堂',
  description: '浏览知序学堂学习社区的公开帖子、学习笔记和经验分享。',
  path: page.value > 1 ? `/community?page=${page.value}` : '/community',
})))
</script>

<template>
  <div
    class="community-page"
    style="width: var(--page-width)"
  >
    <nav
      class="breadcrumbs"
      aria-label="面包屑"
    >
      <NuxtLink to="/">首页</NuxtLink>
      <span aria-hidden="true">/</span>
      <span aria-current="page">社区</span>
    </nav>

    <h1 class="sr-only">
      学习社区
    </h1>

    <AppErrorState
      v-if="error"
      title="社区帖子暂时无法加载"
      message="请检查网络连接后重试。"
      @retry="refresh"
    />
    <p
      v-else-if="status === 'pending'"
      class="community-state"
      aria-live="polite"
    >
      正在加载社区帖子…
    </p>
    <template v-else-if="postList">
      <section
        v-if="postList.items.length"
        class="post-list"
        aria-label="社区帖子"
      >
        <PostCard
          v-for="post in postList.items"
          :key="post.id"
          :post="post"
        />
      </section>
      <section
        v-else
        class="community-state"
      >
        <h2>暂时还没有公开帖子</h2>
        <p>稍后再来看看新的学习分享。</p>
      </section>
      <AppPagination
        :page="postList.page"
        :page-size="postList.pageSize"
        :total="postList.total"
        path="/community"
        aria-label="社区分页"
      />
    </template>
  </div>
</template>

<style scoped>
.community-page {
  margin-inline: auto;
  padding: 1.75rem 0 4.5rem;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  color: #737d88;
  font-size: 0.9rem;
  gap: 0.7rem;
}

.breadcrumbs a:hover {
  color: var(--color-jade);
}

.post-list {
  border: 1px solid #e0e5e2;
  border-bottom: 0;
  background: white;
  box-shadow: 0 0.75rem 2rem rgb(24 36 55 / 6%);
}

.community-state {
  margin: 2rem 0;
  padding: 4rem;
  border: 1px solid var(--color-line);
  background: white;
  text-align: center;
}

.community-state h2,
.community-state p {
  margin: 0;
}

.community-state p {
  margin-top: 0.5rem;
  color: var(--color-muted);
}
</style>
