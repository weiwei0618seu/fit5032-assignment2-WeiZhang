<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../stores/authStore'
import { cancelBooking, useCareBloomData } from '../stores/careBloomStore'

const router = useRouter()
const { currentUser, isAuthenticated, logout } = useAuth()
const { state: dataState } = useCareBloomData()
const accountFeedback = ref('')

const dateFormatter = new Intl.DateTimeFormat('en-AU', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

const formatDate = (date) => dateFormatter.format(new Date(`${date}T00:00:00`))

const memberSince = computed(() => {
  if (!currentUser.value?.createdAt) return 'Not available'

  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(currentUser.value.createdAt))
})

const myBookings = computed(() =>
  currentUser.value
    ? dataState.bookings
        .filter(
          (booking) =>
            booking.userId === currentUser.value.id && booking.status === 'confirmed',
        )
        .map((booking) => ({
          ...booking,
          session: dataState.supportSessions.find((session) => session.id === booking.sessionId),
        }))
        .filter((booking) => booking.session)
        .sort((first, second) =>
          `${first.session.date}T${first.session.time}`.localeCompare(
            `${second.session.date}T${second.session.time}`,
          ),
        )
    : [],
)

const joinedCircles = computed(() => {
  const circleIds = currentUser.value?.joinedCircleIds ?? []
  return circleIds
    .map((circleId) => dataState.peerCircles.find((circle) => circle.id === circleId))
    .filter(Boolean)
    .sort((first, second) => first.nextMeeting.localeCompare(second.nextMeeting))
})

const bookingCount = computed(() => myBookings.value.length)
const circleCount = computed(() => joinedCircles.value.length)

const myRatings = computed(() =>
  currentUser.value
    ? dataState.ratings
        .filter(
          (rating) =>
            rating.userId === currentUser.value.id && rating.targetType === 'peerCircle',
        )
        .map((rating) => ({
          ...rating,
          circle: dataState.peerCircles.find((circle) => circle.id === rating.targetId),
        }))
        .filter((rating) => rating.circle)
    : [],
)

const ratingCount = computed(() => myRatings.value.length)

const roleLabel = computed(() =>
  currentUser.value?.role === 'admin' ? 'Charity staff / admin' : 'Young carer',
)

const handleLogout = async () => {
  logout()
  await router.push('/')
}

const handleCancellation = (bookingId) => {
  const result = cancelBooking(currentUser.value.id, bookingId)
  accountFeedback.value = result.message
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
            <div>
              <strong>{{ circleCount }}</strong>
              <span>peer circles joined</span>
            </div>
          </div>
          <p class="activity-note">
            Your activity is saved in this browser for the CareBloom course prototype.
          </p>
        </aside>
      </div>

      <p v-if="accountFeedback" class="account-feedback" role="status">
        {{ accountFeedback }}
      </p>

      <div class="account-management-grid">
        <section class="management-card" aria-labelledby="bookings-heading">
          <div class="management-heading">
            <div>
              <p class="eyebrow">My Bookings</p>
              <h2 id="bookings-heading">Upcoming sessions</h2>
            </div>
            <span>{{ myBookings.length }}</span>
          </div>

          <div v-if="myBookings.length" class="management-list">
            <article v-for="booking in myBookings" :key="booking.id" class="management-item">
              <div>
                <span class="management-kicker">
                  {{ formatDate(booking.session.date) }} at {{ booking.session.time }}
                </span>
                <h3>{{ booking.session.title }}</h3>
                <p>{{ booking.session.format }} &middot; {{ booking.session.location }}</p>
              </div>
              <button
                class="danger-link"
                type="button"
                :aria-label="`Cancel booking for ${booking.session.title}`"
                @click="handleCancellation(booking.id)"
              >
                Cancel booking
              </button>
            </article>
          </div>

          <div v-else class="management-empty">
            <p>You do not have any confirmed session bookings.</p>
            <RouterLink class="card-link" to="/sessions">Browse sessions &rarr;</RouterLink>
          </div>
        </section>

        <section class="management-card" aria-labelledby="joined-circles-heading">
          <div class="management-heading">
            <div>
              <p class="eyebrow">My community</p>
              <h2 id="joined-circles-heading">Joined peer circles</h2>
            </div>
            <span>{{ joinedCircles.length }}</span>
          </div>

          <div v-if="joinedCircles.length" class="management-list">
            <article v-for="circle in joinedCircles" :key="circle.id" class="management-item circle-item">
              <div>
                <span class="management-kicker">Next: {{ formatDate(circle.nextMeeting) }}</span>
                <h3>{{ circle.name }}</h3>
                <p>{{ circle.schedule }} &middot; {{ circle.location }}</p>
              </div>
              <RouterLink class="card-link" to="/community">View circles</RouterLink>
            </article>
          </div>

          <div v-else class="management-empty">
            <p>You have not joined a peer support circle yet.</p>
            <RouterLink class="card-link" to="/community">Explore peer circles &rarr;</RouterLink>
          </div>
        </section>

        <section class="management-card ratings-management-card" aria-labelledby="my-ratings-heading">
          <div class="management-heading">
            <div>
              <p class="eyebrow">My feedback</p>
              <h2 id="my-ratings-heading">Ratings shared</h2>
            </div>
            <span>{{ myRatings.length }}</span>
          </div>

          <div v-if="myRatings.length" class="management-list ratings-list">
            <article v-for="rating in myRatings" :key="rating.id" class="management-item">
              <div>
                <span class="management-kicker">Peer circle rating</span>
                <h3>{{ rating.circle.name }}</h3>
                <p>You can update this rating at any time from Peer Community.</p>
              </div>
              <strong class="account-rating-score">
                {{ rating.score }}<span aria-hidden="true">&#9733;</span>
                <span class="visually-hidden"> out of 5</span>
              </strong>
            </article>
          </div>

          <div v-else class="management-empty">
            <p>You have not rated a peer support circle yet.</p>
            <RouterLink class="card-link" to="/community">Rate a peer circle &rarr;</RouterLink>
          </div>
        </section>
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
