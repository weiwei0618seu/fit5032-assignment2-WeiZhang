<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../stores/authStore'

const route = useRoute()
const router = useRouter()
const { currentUser, isAuthenticated, logout } = useAuth()
const isMenuOpen = ref(false)

const primaryLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Find support', to: '/support' },
  { label: 'Sessions', to: '/sessions' },
  { label: 'Peer community', to: '/community' },
]

const closeMenu = () => {
  isMenuOpen.value = false
}

const handleEscape = (event) => {
  if (event.key === 'Escape') closeMenu()
}

const handleLogout = async () => {
  logout()
  closeMenu()

  if (route.path === '/account' || route.path.startsWith('/admin')) {
    await router.push('/')
  }
}

watch(() => route.fullPath, closeMenu)
onMounted(() => document.addEventListener('keydown', handleEscape))
onBeforeUnmount(() => document.removeEventListener('keydown', handleEscape))
</script>

<template>
  <header class="site-header">
    <div class="container header-inner">
      <RouterLink class="brand" to="/" aria-label="CareBloom home">
        <span class="brand-mark" aria-hidden="true">
          <span></span><span></span><span></span><span></span>
        </span>
        <span>CareBloom</span>
      </RouterLink>

      <button
        class="menu-button"
        type="button"
        :aria-expanded="isMenuOpen"
        aria-controls="site-navigation"
        :aria-label="isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'"
        @click="isMenuOpen = !isMenuOpen"
      >
        <span></span><span></span><span></span>
      </button>

      <nav
        id="site-navigation"
        class="site-navigation"
        :class="{ 'is-open': isMenuOpen }"
        aria-label="Main navigation"
      >
        <ul class="nav-list">
          <li v-for="link in primaryLinks" :key="link.to">
            <RouterLink :to="link.to">{{ link.label }}</RouterLink>
          </li>
        </ul>

        <div class="nav-actions">
          <template v-if="isAuthenticated">
            <RouterLink class="text-link account-link" to="/account">
              {{ currentUser.displayName }}
            </RouterLink>
            <button class="button button-small button-secondary" type="button" @click="handleLogout">
              Log out
            </button>
          </template>
          <template v-else>
            <RouterLink class="text-link" to="/login">Log in</RouterLink>
            <RouterLink class="button button-small" to="/register">Create account</RouterLink>
          </template>
        </div>
      </nav>
    </div>
  </header>
</template>
