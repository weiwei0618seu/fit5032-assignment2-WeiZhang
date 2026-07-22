<script setup>
import { nextTick, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../stores/authStore'
import { validateRegistration } from '../utils/validation.js'

const router = useRouter()
const { register } = useAuth()

const form = reactive({
  displayName: '',
  email: '',
  suburb: '',
  password: '',
  confirmPassword: '',
})

const errors = reactive({})
const authError = ref('')
const isSubmitting = ref(false)
const showPasswords = ref(false)

const replaceErrors = (newErrors) => {
  Object.keys(errors).forEach((key) => delete errors[key])
  Object.assign(errors, newErrors)
}

const validateField = (field) => {
  const fieldErrors = validateRegistration(form)
  errors[field] = fieldErrors[field] ?? ''

  if (field === 'password' && form.confirmPassword) {
    errors.confirmPassword = fieldErrors.confirmPassword ?? ''
  }
}

const focusField = async (field) => {
  await nextTick()
  document.querySelector(`[name="${field}"]`)?.focus()
}

const handleSubmit = async () => {
  authError.value = ''
  const validationErrors = validateRegistration(form)
  replaceErrors(validationErrors)

  const firstInvalidField = Object.keys(validationErrors)[0]
  if (firstInvalidField) {
    await focusField(firstInvalidField)
    return
  }

  isSubmitting.value = true

  try {
    const result = await register(form)

    if (!result.ok) {
      if (result.field) {
        errors[result.field] = result.message
        await focusField(result.field)
      } else {
        authError.value = result.message
      }
      return
    }

    await router.push('/account')
  } catch {
    authError.value = 'Your account could not be created. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="auth-section">
    <div class="container auth-layout">
      <div class="auth-intro">
        <p class="eyebrow">Create an account</p>
        <h1>Keep your support in one calm place.</h1>
        <p class="page-lead">
          Create a fictional CareBloom account to manage sessions, peer circles, and your profile.
        </p>

        <div class="privacy-panel">
          <span class="privacy-panel-icon" aria-hidden="true">&#10003;</span>
          <div>
            <strong>Designed for this course prototype</strong>
            <p>Use fictional details and a test password rather than personal or sensitive information.</p>
          </div>
        </div>
      </div>

      <div class="form-card">
        <div class="form-heading">
          <h2>Create your account</h2>
          <p>Already registered? <RouterLink to="/login">Log in</RouterLink></p>
        </div>

        <p v-if="authError" class="form-alert" role="alert">{{ authError }}</p>

        <form novalidate @submit.prevent="handleSubmit">
          <div class="form-field">
            <label for="register-name">Name <span aria-hidden="true">*</span></label>
            <input
              id="register-name"
              v-model="form.displayName"
              name="displayName"
              type="text"
              autocomplete="name"
              required
              minlength="2"
              maxlength="50"
              :aria-invalid="Boolean(errors.displayName)"
              :aria-describedby="errors.displayName ? 'register-name-error' : undefined"
              @blur="validateField('displayName')"
              @input="errors.displayName = ''"
            />
            <p v-if="errors.displayName" id="register-name-error" class="field-error">
              {{ errors.displayName }}
            </p>
          </div>

          <div class="form-field">
            <label for="register-email">Email <span aria-hidden="true">*</span></label>
            <input
              id="register-email"
              v-model="form.email"
              name="email"
              type="email"
              inputmode="email"
              autocomplete="email"
              required
              maxlength="100"
              :aria-invalid="Boolean(errors.email)"
              :aria-describedby="errors.email ? 'register-email-error' : undefined"
              @blur="validateField('email')"
              @input="errors.email = ''"
            />
            <p v-if="errors.email" id="register-email-error" class="field-error">
              {{ errors.email }}
            </p>
          </div>

          <div class="form-field">
            <label for="register-suburb">Suburb <span class="optional-label">Optional</span></label>
            <input
              id="register-suburb"
              v-model="form.suburb"
              name="suburb"
              type="text"
              autocomplete="address-level2"
              maxlength="50"
              :aria-invalid="Boolean(errors.suburb)"
              :aria-describedby="errors.suburb ? 'register-suburb-error' : undefined"
              @blur="validateField('suburb')"
              @input="errors.suburb = ''"
            />
            <p v-if="errors.suburb" id="register-suburb-error" class="field-error">
              {{ errors.suburb }}
            </p>
          </div>

          <div class="form-field">
            <label for="register-password">Password <span aria-hidden="true">*</span></label>
            <input
              id="register-password"
              v-model="form.password"
              name="password"
              :type="showPasswords ? 'text' : 'password'"
              autocomplete="new-password"
              required
              minlength="8"
              maxlength="64"
              :aria-invalid="Boolean(errors.password)"
              :aria-describedby="errors.password ? 'register-password-error' : 'password-hint'"
              @blur="validateField('password')"
              @input="errors.password = ''"
            />
            <p id="password-hint" class="field-hint">Use 8–64 characters with at least one letter and number.</p>
            <p v-if="errors.password" id="register-password-error" class="field-error">
              {{ errors.password }}
            </p>
          </div>

          <div class="form-field">
            <label for="register-confirm">Confirm password <span aria-hidden="true">*</span></label>
            <input
              id="register-confirm"
              v-model="form.confirmPassword"
              name="confirmPassword"
              :type="showPasswords ? 'text' : 'password'"
              autocomplete="new-password"
              required
              minlength="8"
              maxlength="64"
              :aria-invalid="Boolean(errors.confirmPassword)"
              :aria-describedby="errors.confirmPassword ? 'register-confirm-error' : undefined"
              @blur="validateField('confirmPassword')"
              @input="errors.confirmPassword = ''"
            />
            <p v-if="errors.confirmPassword" id="register-confirm-error" class="field-error">
              {{ errors.confirmPassword }}
            </p>
          </div>

          <label class="checkbox-field">
            <input v-model="showPasswords" type="checkbox" />
            <span>Show passwords</span>
          </label>

          <button class="button form-submit" type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Creating account…' : 'Create account' }}
          </button>
        </form>

        <p class="prototype-note">
          Passwords are stored as one-way digests in this browser. This remains a client-side
          prototype, not production authentication.
        </p>
      </div>
    </div>
  </section>
</template>
