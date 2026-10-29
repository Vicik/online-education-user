<script setup lang="ts">
import CourseCard from '~/features/home/components/CourseCard.vue'
import HomeBanner from '~/features/home/components/HomeBanner.vue'
import HomeErrorState from '~/features/home/components/HomeErrorState.vue'
import HomeSection from '~/features/home/components/HomeSection.vue'
import PromotionCard from '~/features/home/components/PromotionCard.vue'
import { getHome } from '~/features/home/home.service'

const { data: home, error, status, refresh } = await useAsyncData('home', getHome)
const countdownNow = useState('home-countdown-now', () => Date.now())

usePageSeo({
  title: '在线课程、考试与学习社区｜知序学堂',
  description: '在知序学堂发现最新课程、精选课程和限时拼团，用清晰的学习路径稳步提升。',
  path: '/',
})
</script>

<template>
  <div class="home-page">
    <div
      v-if="error"
      class="home-state-container"
      style="width: var(--page-width)"
    >
      <HomeErrorState @retry="refresh" />
    </div>

    <div
      v-else-if="status === 'pending'"
      class="home-state-container home-loading"
      style="width: var(--page-width)"
      aria-live="polite"
    >
      正在加载首页内容…
    </div>

    <template v-else-if="home">
      <HomeBanner :banners="home.banners" />

      <h1
        v-if="home.banners.length === 0"
        class="home-fallback-title"
        style="width: var(--page-width)"
      >
        发现适合你的学习路径
      </h1>

      <HomeSection>
        <PromotionCard
          v-for="promotion in home.groupBuys"
          :key="promotion.id"
          :promotion="promotion"
          :initial-now="countdownNow"
        />
        <p
          v-if="home.groupBuys.length === 0"
          class="section-empty"
        >
          暂时没有进行中的拼团。
        </p>
      </HomeSection>

      <HomeSection
        title="最新课程"
        more-href="/course?sort=latest"
        more-label="查看更多课程"
      >
        <CourseCard
          v-for="course in home.latestCourses"
          :key="course.id"
          :course="course"
        />
        <p
          v-if="home.latestCourses.length === 0"
          class="section-empty"
        >
          暂时没有最新课程。
        </p>
      </HomeSection>

      <HomeSection
        title="推荐课程"
        more-href="/course?sort=recommended"
        more-label="查看更多推荐"
      >
        <CourseCard
          v-for="course in home.recommendedCourses"
          :key="course.id"
          :course="course"
        />
        <p
          v-if="home.recommendedCourses.length === 0"
          class="section-empty"
        >
          暂时没有推荐课程。
        </p>
      </HomeSection>
    </template>
  </div>
</template>

<style scoped>
.home-page {
  padding-bottom: 4.5rem;
}

.home-state-container {
  margin-inline: auto;
}

.home-loading {
  margin: 4rem auto;
  color: var(--color-muted);
  text-align: center;
}

.home-fallback-title {
  margin: 3rem auto 0;
  font-family: "Noto Serif SC", "Songti SC", serif;
}

.section-empty {
  grid-column: 1 / -1;
  margin: 0;
  padding: 2rem;
  border: 1px dashed var(--color-line);
  border-radius: 0.6rem;
  color: var(--color-muted);
  text-align: center;
}
</style>
