<script setup lang="ts">
import { SITE_NAME } from '~/config/navigation'

const currentYear = useState('site-footer-year', () => new Date().getFullYear())
</script>

<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <div>
        <p class="footer-brand">
          {{ SITE_NAME }}
        </p>
        <p class="footer-note">
          为每一次认真学习，建立清晰的知识路径。
        </p>
      </div>
      <p class="copyright">
        © {{ currentYear }} {{ SITE_NAME }}
      </p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  margin-top: auto;
  border-top: 1px solid var(--color-line);
  background: var(--color-surface);
}

.footer-inner {
  display: flex;
  align-items: end;
  justify-content: space-between;
  width: var(--page-width);
  margin-inline: auto;
  padding-block: 2.5rem;
  gap: 2rem;
}

.footer-brand,
.footer-note,
.copyright {
  margin: 0;
}

.footer-brand {
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.footer-note,
.copyright {
  color: var(--color-muted);
  font-size: 0.82rem;
}

.footer-note {
  margin-top: 0.45rem;
}
</style>
