<script setup>
import { nextTick, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../stores/authStore'
import { validateLogin } from '../utils/validation.js'

const router = useRouter()
const { currentUser, isAuthenticated, login } = useAuth()

const form = reactive({ email: '', password: '' })
const errors = reactive({})
const authError = ref('')
const isSubmitting = ref(false)
const showPassword = ref(false)

const demos = {
  user: { email: 'mia.chen@example.org', password: 'CareBloom1!' },
  admin: { email: 'priya.nair@example.org', password: 'CareBloomAdmin1!' },
}

const replaceErrors = (newErrors) => {
  Object.keys(errors).forEach((key) => delete errors[key])
  Object.assign(errors, newErrors)
}

const validateField = (field) => {
  errors[field] = validateLogin(form)[field] ?? ''
}

const fillDemo = (type) => {
  Object.assign(form, demos[type])
  replaceErrors({})
  authError.value = ''
}

const handleSubmit = async () => {
  authError.value = ''
  const validationErrors = validateLogin(form)
  replaceErrors(validationErrors)

  const firstInvalidField = Object.keys(validationErrors)[0]
  if (firstInvalidField) {
    await nextTick()
    document.querySelector(`[name="${firstInvalidField}"]`)?.focus()
    return
  }

  isSubmitting.value = true

  try {
    const result = await login(form)
    if (!result.ok) {
      authError.value = result.message
      return
    }

    await router.push('/account')
  } catch {
    authError.value = 'CareBloom could not log you in. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="auth-section">
    <div class="container auth-layout">
      <div class="auth-intro">
        <p class="eyebrow">Welcome back</p>
        <h1>Your support space is ready when you are.</h1>
        <p class="page-lead">
          Log in to view your profile and keep your CareBloom activity together.
        </p>

        <div class="demo-panel" aria-labelledby="demo-heading">
          <h2 id="demo-heading">Demo accounts</h2>
          <p>Use fictional accounts to test both user types.</p>
          <div class="demo-actions">
            <button type="button" @click="fillDemo('user')">Use young carer account</button>
            <button type="button" @click="fillDemo('admin')">Use staff account</button>
          </div>
        </div>
      </div>

      <div class="form-card">
        <template v-if="isAuthenticated">
          <div class="signed-in-message">
            <span class="success-icon" aria-hidden="true">&#10003;</span>
            <p class="eyebrow">Already logged in</p>
            <h2>Hello, {{ currentUser.displayName }}.</h2>
            <p>You can continue to your account without logging in again.</p>
            <RouterLink class="button form-submit" to="/account">Go to my account</RouterLink>
          </div>
        </template>

        <template v-else>
          <div class="form-heading">
            <h2>Log in</h2>
            <p>New to CareBloom? <RouterLink to="/register">Create an account</RouterLink></p>
          </div>

          <p v-if="authError" class="form-alert" role="alert">{{ authError }}</p>

          <form novalidate @submit.prevent="handleSubmit">
            <div class="form-field">
              <label for="login-email">Email <span aria-hidden="true">*</span></label>
              <input
                id="login-email"
                v-model="form.email"
                name="email"
                type="email"
                inputmode="email"
                autocomplete="email"
                maxlength="100"
                :aria-invalid="Boolean(errors.email)"
                :aria-describedby="errors.email ? 'login-email-error' : undefined"
                @blur="validateField('email')"
                @input="errors.email = ''"
              />
              <p v-if="errors.email" id="login-email-error" class="field-error">
                {{ errors.email }}
              </p>
            </div>

            <div class="form-field">
              <label for="login-password">Password <span aria-hidden="true">*</span></label>
              <input
                id="login-password"
                v-model="form.password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                maxlength="64"
                :aria-invalid="Boolean(errors.password)"
                :aria-describedby="errors.password ? 'login-password-error' : undefined"
                @blur="validateField('password')"
                @input="errors.password = ''"
              />
              <p v-if="errors.password" id="login-password-error" class="field-error">
                {{ errors.password }}
              </p>
            </div>

            <label class="checkbox-field">
              <input v-model="showPassword" type="checkbox" />
              <span>Show password</span>
            </label>

            <button class="button form-submit" type="submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Logging in…' : 'Log in' }}
            </button>
          </form>
        </template>
      </div>
    </div>
  </section>
</template>
