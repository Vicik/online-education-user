<script setup lang="ts">
import CourseHero from '~/features/course/components/CourseHero.vue'
import CourseOutline from '~/features/course/components/CourseOutline.vue'
import { getCourse } from '~/features/course/course.service'
import { breadcrumbSchema, courseSchema } from '~/lib/seo/schema'

const route = useRoute()
const config = useRuntimeConfig()
const slug = computed(() => Array.isArray(route.params.slug) ? route.params.slug[0] ?? '' : route.params.slug ?? '')

const { data: course, error, status, refresh } = await useAsyncData(
  () => `course:${slug.value}`,
  () => getCourse(slug.value),
)

const createCourseNotFoundError = () => createError({
  statusCode: 404,
  statusMessage: '课程不存在或尚未发布',
})

if (error.value?.statusCode === 404) {
  throw createCourseNotFoundError()
}

watch(error, (value) => {
  if (value?.statusCode === 404) {
    showError(createCourseNotFoundError())
  }
})

usePageSeo(computed(() => {
  if (!course.value) {
    return {
      title: '课程详情｜知序学堂',
      description: '查看知序学堂课程详情、适合人群与课程大纲。',
      path: `/course/${encodeURIComponent(slug.value)}`,
      noindex: true,
    }
  }

  const path = `/course/${encodeURIComponent(course.value.slug)}`
  const url = new URL(path, config.public.siteUrl).toString()

  return {
    title: `${course.value.title}｜知序学堂`,
    description: course.value.description,
    path,
    image: course.value.imageUrl,
    schema: [
      courseSchema({
        name: course.value.title,
        description: course.value.description,
        url,
        image: course.value.imageUrl,
        providerName: '知序学堂',
      }),
      breadcrumbSchema([
        { name: '首页', url: new URL('/', config.public.siteUrl).toString() },
        { name: '课程', url: new URL('/course', config.public.siteUrl).toString() },
        { name: course.value.title, url },
      ]),
    ],
  }
}))
</script>

<template>
  <div
    class="course-detail"
    style="width: var(--page-width)"
  >
    <nav
      class="breadcrumbs"
      aria-label="面包屑"
    >
      <NuxtLink to="/">首页</NuxtLink>
      <span aria-hidden="true">/</span>
      <NuxtLink to="/course">课程</NuxtLink>
      <span aria-hidden="true">/</span>
      <span
        v-if="course"
        aria-current="page"
      >{{ course.title }}</span>
    </nav>

    <section
      v-if="error"
      class="course-state"
      role="alert"
    >
      <h1>课程暂时无法加载</h1>
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
      class="course-state"
      aria-live="polite"
    >
      正在加载课程详情…
    </p>
    <template v-else-if="course">
      <CourseHero :course="course" />

      <div class="course-detail-grid">
        <article class="course-overview">
          <header>
            <p>ABOUT THIS COURSE</p>
            <h2>课程概述</h2>
          </header>
          <p class="overview-description">
            {{ course.description }}
          </p>

          <section aria-labelledby="audience-heading">
            <h3 id="audience-heading">
              适合人群
            </h3>
            <ul>
              <li
                v-for="item in course.audience"
                :key="item"
              >
                {{ item }}
              </li>
            </ul>
          </section>
        </article>

        <CourseOutline :sections="course.outline" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.course-detail {
  margin-inline: auto;
  padding: 1.75rem 0 4.5rem;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  margin-bottom: 1.25rem;
  color: #737d88;
  font-size: 0.9rem;
  gap: 0.65rem;
}

.breadcrumbs a:hover {
  color: var(--color-jade);
}

.course-detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(28rem, 0.85fr);
  align-items: start;
  margin-top: 1.5rem;
  gap: 1.5rem;
}

.course-overview {
  min-height: 24rem;
  padding: 2rem;
  border: 1px solid #e7eaed;
  border-radius: 0.4rem;
  background: white;
}

.course-overview header {
  padding-bottom: 1rem;
  border-bottom: 2px solid #e8ecef;
}

.course-overview header p,
.course-overview h2 {
  margin: 0;
}

.course-overview header p {
  color: var(--color-jade);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.course-overview h2 {
  margin-top: 0.25rem;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 1.5rem;
}

.overview-description {
  margin: 1.5rem 0 0;
  color: #3e4854;
  line-height: 1.9;
}

.course-overview section {
  margin-top: 2rem;
}

.course-overview h3 {
  margin: 0;
  font-size: 1rem;
}

.course-overview ul {
  margin: 0.8rem 0 0;
  padding-left: 1.2rem;
  color: var(--color-muted);
  line-height: 1.9;
}

.course-state {
  margin: 4rem 0;
  padding: 3rem;
  border: 1px solid var(--color-line);
  background: white;
  text-align: center;
}

.course-state h1,
.course-state p {
  margin: 0;
}

.course-state p {
  margin-top: 0.5rem;
  color: var(--color-muted);
}

.course-state button {
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

@media (max-width: 78rem) {
  .course-detail {
    width: calc(100% - 2rem) !important;
  }
}

@media (max-width: 64rem) {
  .course-detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 42rem) {
  .course-overview {
    min-height: 0;
    padding: 1rem;
  }
}
</style>
