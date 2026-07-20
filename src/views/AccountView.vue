<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../stores/authStore'
import { useCareBloomData } from '../stores/careBloomStore'

const router = useRouter()
const { currentUser, isAuthenticated, logout } = useAuth()
const { state: dataState } = useCareBloomData()

const memberSince = computed(() => {
  if (!currentUser.value?.createdAt) return 'Not available'

  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(currentUser.value.createdAt))
})

const bookingCount = computed(() =>
  currentUser.value
    ? dataState.bookings.filter(
        (booking) =>
          booking.userId === currentUser.value.id && booking.status === 'confirmed',
      ).length
    : 0,
)

const ratingCount = computed(() =>
  currentUser.value
    ? dataState.ratings.filter((rating) => rating.userId === currentUser.value.id).length
    : 0,
)

const roleLabel = computed(() =>
  currentUser.value?.role === 'admin' ? 'Charity staff / admin' : 'Young carer',
)

const handleLogout = async () => {
  logout()
  await router.push('/')
}
</script>

<template>
  <section class="account-section">
    <div v-if="isAuthenticated" class="container account-container">
      <div class="account-heading">
        <div>
          <p class="eyebrow">My account</p>
          <h1>Hello, {{ currentUser.displayName }}.</h1>
          <p class="page-lead">Your profile and CareBloom activity are shown below.</p>
        </div>
        <button class="button button-secondary" type="button" @click="handleLogout">Log out</button>
      </div>

      <div class="account-grid">
        <section class="profile-card" aria-labelledby="profile-heading">
          <div class="profile-card-heading">
            <span class="profile-avatar" aria-hidden="true">
              {{ currentUser.displayName.charAt(0).toUpperCase() }}
            </span>
            <div>
              <p class="eyebrow">Account details</p>
              <h2 id="profile-heading">Your profile</h2>
            </div>
          </div>

          <dl class="profile-details">
            <div>
              <dt>Name</dt>
              <dd>{{ currentUser.displayName }}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{{ currentUser.email }}</dd>
            </div>
            <div>
              <dt>Account type</dt>
              <dd>{{ roleLabel }}</dd>
            </div>
            <div>
              <dt>Suburb</dt>
              <dd>{{ currentUser.suburb || 'Not provided' }}</dd>
            </div>
            <div>
              <dt>Member since</dt>
              <dd>{{ memberSince }}</dd>
            </div>
          </dl>
        </section>

        <aside class="activity-panel" aria-labelledby="activity-heading">
          <p class="eyebrow">At a glance</p>
          <h2 id="activity-heading">Your activity</h2>
          <div class="activity-grid">
            <div>
              <strong>{{ bookingCount }}</strong>
              <span>confirmed bookings</span>
            </div>
            <div>
              <strong>{{ ratingCount }}</strong>
              <span>ratings shared</span>
            </div>
          </div>
          <p class="activity-note">
            Booking and peer-circle management will be connected in the next development stages.
          </p>
        </aside>
      </div>
    </div>

    <div v-else class="container signed-out-account">
      <span class="success-icon signed-out-icon" aria-hidden="true">&#10047;</span>
      <p class="eyebrow">My account</p>
      <h1>Log in to see your CareBloom profile.</h1>
      <p class="page-lead">Your account details and activity are only shown after you log in.</p>
      <div class="button-row">
        <RouterLink class="button" to="/login">Log in</RouterLink>
        <RouterLink class="button button-secondary" to="/register">Create account</RouterLink>
      </div>
    </div>
  </section>
</template>
