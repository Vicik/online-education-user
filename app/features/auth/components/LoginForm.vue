<script setup lang="ts">
import { reactive, ref } from 'vue'
import { normalizeApiError } from '~/lib/api/api-error'
import { resolveSafeRedirect } from '../auth.service'
import { useSessionStore } from '../stores/session'

const props = withDefaults(defineProps<{
  redirect?: string
}>(), {
  redirect: '/',
})

const sessionStore = useSessionStore()
const credentials = reactive({
  email: '',
  password: '',
})
const pending = ref(false)
const formError = ref('')
const fieldErrors = ref<Record<string, string[]>>({})

async function submitLogin() {
  pending.value = true
  formError.value = ''
  fieldErrors.value = {}

  try {
    await sessionStore.authenticate({ ...credentials })
    credentials.password = ''
    await navigateTo(resolveSafeRedirect(props.redirect))
  }
  catch (error: unknown) {
    const normalized = normalizeApiError(error)
    formError.value = normalized.message
    fieldErrors.value = normalized.fieldErrors ?? {}
  }
  finally {
    credentials.password = ''
    pending.value = false
  }
}
</script>

<template>
  <form
    class="login-form"
    aria-label="账号登录"
    @submit.prevent="submitLogin"
  >
    <div class="login-field">
      <label for="login-email">邮箱地址</label>
      <input
        id="login-email"
        v-model.trim="credentials.email"
        name="email"
        type="email"
        autocomplete="username"
        required
        :aria-invalid="fieldErrors.email?.length ? 'true' : undefined"
        :aria-describedby="fieldErrors.email?.length ? 'login-email-error' : undefined"
      >
      <p
        v-if="fieldErrors.email?.length"
        id="login-email-error"
        class="field-error"
      >
        {{ fieldErrors.email[0] }}
      </p>
    </div>

    <div class="login-field">
      <label for="login-password">密码</label>
      <input
        id="login-password"
        v-model="credentials.password"
        name="password"
        type="password"
        autocomplete="current-password"
        required
        :aria-invalid="fieldErrors.password?.length ? 'true' : undefined"
        :aria-describedby="fieldErrors.password?.length ? 'login-password-error' : undefined"
      >
      <p
        v-if="fieldErrors.password?.length"
        id="login-password-error"
        class="field-error"
      >
        {{ fieldErrors.password[0] }}
      </p>
    </div>

    <p
      v-if="formError"
      class="form-error"
      role="alert"
    >
      {{ formError }}
    </p>

    <button
      type="submit"
      :disabled="pending"
    >
      {{ pending ? '正在登录…' : '登录' }}
    </button>
  </form>
</template>

<style scoped>
.login-form {
  display: grid;
  gap: 1.25rem;
}

.login-field {
  display: grid;
  gap: 0.45rem;
}

.login-field label {
  font-weight: 700;
}

.login-field input {
  min-height: 2.9rem;
  padding: 0 0.8rem;
  border: 1px solid var(--color-line);
  border-radius: 0.3rem;
  background: white;
  color: var(--color-ink);
  font: inherit;
}

.login-field input[aria-invalid="true"] {
  border-color: #b42318;
}

.field-error,
.form-error {
  margin: 0;
  color: #9f1d16;
  font-size: 0.9rem;
}

.form-error {
  padding: 0.8rem;
  border-left: 3px solid #b42318;
  background: #fff1f0;
}

.login-form button {
  min-height: 2.9rem;
  border: 0;
  border-radius: 0.3rem;
  background: var(--color-jade);
  color: white;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}

.login-form button:disabled {
  cursor: wait;
  opacity: 0.68;
}
</style>
