<script setup>
import { useAuth } from '../stores/authStore'

const { currentUser, isAuthenticated } = useAuth()
</script>

<template>
  <section class="access-denied-section">
    <div class="container access-denied-card">
      <span class="access-code" aria-hidden="true">403</span>
      <span class="access-icon" aria-hidden="true">&#128274;</span>
      <p class="eyebrow">Access denied</p>
      <h1>This area is for authorised charity staff.</h1>
      <p v-if="isAuthenticated" class="page-lead">
        {{ currentUser.displayName }}, your {{ currentUser.role }} account does not have permission
        to open the CareBloom administration dashboard.
      </p>
      <p v-else class="page-lead">Log in with an authorised staff account to continue.</p>

      <div class="button-row access-actions">
        <RouterLink class="button" to="/account">Return to my account</RouterLink>
        <RouterLink class="button button-secondary" to="/">Go to home</RouterLink>
      </div>
    </div>
  </section>
</template>
