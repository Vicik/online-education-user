<script setup lang="ts">
import PostContent from '~/features/community/components/PostContent.vue'
import PostMeta from '~/features/community/components/PostMeta.vue'
import { getPost } from '~/features/community/community.service'
import { articleSchema, breadcrumbSchema } from '~/lib/seo/schema'

const route = useRoute()
const config = useRuntimeConfig()
const slug = computed(() => Array.isArray(route.params.slug) ? route.params.slug[0] ?? '' : route.params.slug ?? '')

const { data: post, error, status, refresh } = await useAsyncData(
  () => `community-post:${slug.value}`,
  () => getPost(slug.value),
)

const createPostNotFoundError = () => createError({
  statusCode: 404,
  statusMessage: '帖子不存在或尚未发布',
})

if (error.value?.statusCode === 404) {
  throw createPostNotFoundError()
}

watch(error, (value) => {
  if (value?.statusCode === 404) {
    showError(createPostNotFoundError())
  }
})

usePageSeo(computed(() => {
  if (!post.value) {
    return {
      title: '社区帖子｜知序学堂',
      description: '查看知序学堂学习社区的公开帖子。',
      path: `/community/${encodeURIComponent(slug.value)}`,
      noindex: true,
    }
  }

  const path = `/community/${encodeURIComponent(post.value.slug)}`
  const url = new URL(path, config.public.siteUrl).toString()
  const forumSchema = {
    ...articleSchema({
      headline: post.value.title,
      description: post.value.excerpt,
      url,
      authorName: post.value.author.name,
      datePublished: post.value.publishedAt,
      dateModified: post.value.updatedAt,
      image: post.value.coverImageUrl,
    }),
    '@type': 'DiscussionForumPosting',
  }

  return {
    title: `${post.value.title}｜知序学堂`,
    description: post.value.excerpt,
    path,
    image: post.value.coverImageUrl,
    schema: [
      forumSchema,
      breadcrumbSchema([
        { name: '首页', url: new URL('/', config.public.siteUrl).toString() },
        { name: '社区', url: new URL('/community', config.public.siteUrl).toString() },
        { name: post.value.title, url },
      ]),
    ],
  }
}))
</script>

<template>
  <div
    class="post-page"
    style="width: var(--page-width)"
  >
    <nav
      class="breadcrumbs"
      aria-label="面包屑"
    >
      <NuxtLink to="/">首页</NuxtLink>
      <span aria-hidden="true">/</span>
      <NuxtLink to="/community">社区</NuxtLink>
      <span aria-hidden="true">/</span>
      <span
        v-if="post"
        aria-current="page"
      >{{ post.title }}</span>
    </nav>

    <section
      v-if="error"
      class="post-state"
      role="alert"
    >
      <h1>帖子暂时无法加载</h1>
      <p>请检查网络连接后重试。</p>
      <button
        type="button"
        @click="() => refresh()"
      >
        重新加载
      </button>
    </section>
    <p
      v-else-if="status === 'pending'"
      class="post-state"
      aria-live="polite"
    >
      正在加载帖子…
    </p>
    <article
      v-else-if="post"
      class="post-article"
    >
      <header class="post-header">
        <p class="post-kicker">COMMUNITY NOTE</p>
        <h1>{{ post.title }}</h1>
        <p class="post-deck">{{ post.excerpt }}</p>
        <PostMeta
          :author="post.author"
          :published-at="post.publishedAt"
        />
      </header>

      <figure
        v-if="post.coverImageUrl"
        class="post-hero"
      >
        <img
          :src="post.coverImageUrl"
          :alt="post.coverImageAlt || ''"
          width="1120"
          height="630"
        >
      </figure>

      <PostContent :content="post.content" />
    </article>
  </div>
</template>

<style scoped>
.post-page {
  margin-inline: auto;
  padding: 1.75rem 0 4.5rem;
}

.breadcrumbs {
  display: flex;
  overflow: hidden;
  align-items: center;
  margin-bottom: 1.25rem;
  color: #737d88;
  font-size: 0.9rem;
  gap: 0.65rem;
  white-space: nowrap;
}

.breadcrumbs span:last-child {
  overflow: hidden;
  text-overflow: ellipsis;
}

.breadcrumbs a:hover {
  color: var(--color-jade);
}

.post-article {
  padding: 3.5rem 5rem 5rem;
  border: 1px solid #e0e5e2;
  background: white;
  box-shadow: 0 0.75rem 2rem rgb(24 36 55 / 6%);
}

.post-header {
  max-width: 56rem;
  margin: 0 auto 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e4e9e6;
}

.post-kicker {
  margin: 0;
  color: var(--color-jade);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.post-header h1 {
  margin: 0.8rem 0 0;
  color: var(--color-ink);
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 2.4rem;
  line-height: 1.35;
}

.post-deck {
  margin: 1rem 0 1.5rem;
  color: var(--color-muted);
  font-size: 1.05rem;
  line-height: 1.8;
}

.post-hero {
  overflow: hidden;
  max-width: 62rem;
  margin: 0 auto 2.75rem;
  background: #e7ece9;
}

.post-hero img {
  display: block;
  width: 100%;
  height: auto;
}

.post-article :deep(.post-content) {
  max-width: 56rem;
  margin-inline: auto;
}

.post-state {
  margin: 4rem 0;
  padding: 3rem;
  border: 1px solid var(--color-line);
  background: white;
  text-align: center;
}

.post-state h1,
.post-state p {
  margin: 0;
}

.post-state p {
  margin-top: 0.5rem;
  color: var(--color-muted);
}

.post-state button {
  margin-top: 1.2rem;
  padding: 0.65rem 1rem;
  border: 0;
  border-radius: 0.25rem;
  background: var(--color-jade);
  color: white;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}
</style>
