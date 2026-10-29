<script setup lang="ts">
import { nextTick, ref } from 'vue'
import type { BannerItem } from '../home.types'

const props = defineProps<{
  banners: BannerItem[]
}>()

const activeIndex = ref(0)

function focusActiveSlide(): void {
  if (typeof document === 'undefined') {
    return
  }

  const activeSlide = document.querySelector<HTMLElement>('.home-banner .banner-slide.is-active')
  activeSlide?.focus()
}

function showPrevious(moveFocus = false): void {
  activeIndex.value = (activeIndex.value - 1 + props.banners.length) % props.banners.length
  if (moveFocus) {
    void nextTick(focusActiveSlide)
  }
}

function showNext(moveFocus = false): void {
  activeIndex.value = (activeIndex.value + 1) % props.banners.length
  if (moveFocus) {
    void nextTick(focusActiveSlide)
  }
}

function showSlide(index: number): void {
  activeIndex.value = index
}
</script>

<template>
  <section
    v-if="banners.length > 0"
    class="home-banner"
    style="width: var(--page-width)"
    role="region"
    aria-roledescription="轮播图"
    aria-label="精选学习内容"
  >
    <div class="banner-viewport">
      <NuxtLink
        v-for="(banner, index) in banners"
        :key="banner.id"
        :to="banner.href"
        class="banner-slide"
        :class="{ 'is-active': index === activeIndex }"
        :aria-hidden="index === activeIndex ? undefined : 'true'"
        :tabindex="index === activeIndex ? undefined : -1"
        @keydown.left.prevent="showPrevious(true)"
        @keydown.right.prevent="showNext(true)"
      >
        <img
          :src="banner.imageUrl"
          :alt="banner.imageAlt"
          :width="banner.width"
          :height="banner.height"
          :loading="index === 0 ? 'eager' : 'lazy'"
          :fetchpriority="index === 0 ? 'high' : 'auto'"
        >
        <span class="banner-shade" />
        <span class="banner-copy">
          <span class="banner-kicker">知序精选</span>
          <h1
            v-if="index === activeIndex"
          >{{ banner.title }}</h1>
          <span
            v-else
            class="banner-title"
          >{{ banner.title }}</span>
          <span
            v-if="banner.description"
            class="banner-description"
          >
            {{ banner.description }}
          </span>
          <span class="banner-action">开始学习 <span aria-hidden="true">→</span></span>
        </span>
      </NuxtLink>
    </div>

    <template v-if="banners.length > 1">
      <button
        class="banner-arrow banner-arrow-previous"
        type="button"
        aria-label="上一张横幅"
        @click="showPrevious()"
      >
        <span aria-hidden="true">‹</span>
      </button>
      <button
        class="banner-arrow banner-arrow-next"
        type="button"
        aria-label="下一张横幅"
        @click="showNext()"
      >
        <span aria-hidden="true">›</span>
      </button>
      <div
        class="banner-dots"
        aria-label="选择横幅"
      >
        <button
          v-for="(banner, index) in banners"
          :key="`dot-${banner.id}`"
          type="button"
          :class="{ 'is-active': index === activeIndex }"
          :aria-label="`查看第 ${index + 1} 张横幅：${banner.title}`"
          :aria-current="index === activeIndex ? 'true' : undefined"
          @click="showSlide(index)"
        />
      </div>
    </template>
  </section>
</template>

<style scoped>
.home-banner {
  position: relative;
  margin: 1.5rem auto 0;
  overflow: hidden;
  border-radius: 1.15rem;
  background: var(--color-indigo);
  box-shadow: var(--shadow-soft);
}

.banner-viewport {
  position: relative;
  aspect-ratio: 5 / 2;
}

.banner-slide {
  position: absolute;
  inset: 0;
  display: block;
  opacity: 0;
  pointer-events: none;
  transition: opacity 300ms ease;
}

.banner-slide.is-active {
  z-index: 1;
  opacity: 1;
  pointer-events: auto;
}

.banner-slide:focus-visible {
  outline: none;
}

.banner-slide:focus-visible::after {
  position: absolute;
  z-index: 5;
  inset: 0.45rem;
  border: 3px solid white;
  border-radius: 0.75rem;
  content: "";
  pointer-events: none;
}

.banner-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgb(16 27 47 / 86%) 0%, rgb(16 27 47 / 54%) 42%, transparent 72%);
}

.banner-copy {
  position: absolute;
  z-index: 2;
  top: 50%;
  left: clamp(1.5rem, 6vw, 5rem);
  display: grid;
  width: min(32rem, 70%);
  color: white;
  transform: translateY(-50%);
}

.banner-kicker {
  margin-bottom: 0.65rem;
  color: #f3c86f;
  font-size: 0.78rem;
  font-weight: 750;
  letter-spacing: 0.2em;
}

.banner-copy h1,
.banner-title {
  margin: 0;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: clamp(1.5rem, 4vw, 3rem);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0.02em;
}

.banner-description {
  margin-top: 0.8rem;
  color: rgb(255 255 255 / 82%);
  font-size: clamp(0.82rem, 1.5vw, 1rem);
}

.banner-action {
  width: max-content;
  margin-top: 1.4rem;
  padding-bottom: 0.18rem;
  border-bottom: 1px solid rgb(255 255 255 / 70%);
  font-size: 0.9rem;
  font-weight: 700;
}

.banner-arrow {
  position: absolute;
  z-index: 4;
  top: 50%;
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border: 1px solid rgb(255 255 255 / 35%);
  border-radius: 50%;
  background: rgb(16 27 47 / 38%);
  color: white;
  cursor: pointer;
  font-size: 1.7rem;
  place-items: center;
  transform: translateY(-50%);
}

.banner-arrow-previous { left: 1rem; }
.banner-arrow-next { right: 1rem; }

.banner-dots {
  position: absolute;
  z-index: 4;
  right: 1.5rem;
  bottom: 1.2rem;
  display: flex;
  gap: 0.5rem;
}

.banner-dots button {
  width: 0.55rem;
  height: 0.55rem;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: rgb(255 255 255 / 52%);
  cursor: pointer;
  transition: width 180ms ease, background 180ms ease;
}

.banner-dots button.is-active {
  width: 1.65rem;
  background: white;
}
</style>
