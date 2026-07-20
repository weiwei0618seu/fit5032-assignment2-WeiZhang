<script setup>
import AppFooter from './components/AppFooter.vue'
import AppHeader from './components/AppHeader.vue'
import { initialiseCareBloomData } from './stores/careBloomStore'
import { initialiseAuth } from './stores/authStore'

initialiseCareBloomData()
initialiseAuth()
</script>

<template>
  <div class="site-shell">
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <AppHeader />

    <main id="main-content" class="site-main" tabindex="-1">
      <RouterView />
    </main>

    <AppFooter />
  </div>
</template>
