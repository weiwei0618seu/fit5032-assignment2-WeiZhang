<script setup>
import { computed } from 'vue'
import { useAuth } from '../stores/authStore'
import { getRatingSummary, useCareBloomData } from '../stores/careBloomStore'

const { currentUser } = useAuth()
const { state } = useCareBloomData()

const roleCounts = computed(() => ({
  users: state.users.filter((user) => user.role === 'user').length,
  admins: state.users.filter((user) => user.role === 'admin').length,
}))

const confirmedBookingCount = computed(
  () => state.bookings.filter((booking) => booking.status === 'confirmed').length,
)

const cancelledBookingCount = computed(
  () => state.bookings.filter((booking) => booking.status === 'cancelled').length,
)

const validRatings = computed(() =>
  state.ratings.filter(
    (rating) => Number.isInteger(rating.score) && rating.score >= 1 && rating.score <= 5,
  ),
)

const overallRating = computed(() => {
  if (validRatings.value.length === 0) return null

  const total = validRatings.value.reduce((sum, rating) => sum + rating.score, 0)
  return total / validRatings.value.length
})

const ratedCircleCount = computed(
  () =>
    new Set(
      validRatings.value
        .filter((rating) => rating.targetType === 'peerCircle')
        .map((rating) => rating.targetId),
    ).size,
)

const totalCircleMembers = computed(() =>
  state.peerCircles.reduce((total, circle) => total + circle.memberCount, 0),
)

const overviewCards = computed(() => [
  { label: 'Registered users', value: state.users.length, detail: 'All account roles', tone: 'sage' },
  {
    label: 'Young carer accounts',
    value: roleCounts.value.users,
    detail: `${roleCounts.value.admins} charity staff`,
    tone: 'cream',
  },
  {
    label: 'Confirmed bookings',
    value: confirmedBookingCount.value,
    detail: `${cancelledBookingCount.value} cancelled`,
    tone: 'coral',
  },
  {
    label: 'Circle memberships',
    value: totalCircleMembers.value,
    detail: `Across ${state.peerCircles.length} circles`,
    tone: 'sage',
  },
  {
    label: 'Average rating',
    value: overallRating.value === null ? '—' : overallRating.value.toFixed(1),
    detail:
      validRatings.value.length === 1
        ? 'From 1 rating'
        : `From ${validRatings.value.length} ratings`,
    tone: 'coral',
  },
])

const bookingRows = computed(() =>
  state.bookings
    .map((booking) => ({
      ...booking,
      user: state.users.find((user) => user.id === booking.userId),
      session: state.supportSessions.find((session) => session.id === booking.sessionId),
    }))
    .sort((first, second) => {
      const firstDate = first.session
        ? `${first.session.date}T${first.session.time}`
        : first.bookedAt
      const secondDate = second.session
        ? `${second.session.date}T${second.session.time}`
        : second.bookedAt
      return firstDate.localeCompare(secondDate)
    }),
)

const circleRows = computed(() =>
  [...state.peerCircles]
    .sort((first, second) => first.nextMeeting.localeCompare(second.nextMeeting))
    .map((circle) => {
      const summary = getRatingSummary('peerCircle', circle.id)
      const registeredMembers = state.users.filter((user) =>
        user.joinedCircleIds?.includes(circle.id),
      ).length

      return {
        ...circle,
        registeredMembers,
        placesRemaining: Math.max(circle.capacity - circle.memberCount, 0),
        occupancy: circle.capacity > 0
          ? Math.min(Math.round((circle.memberCount / circle.capacity) * 100), 100)
          : 0,
        ratingAverage: summary.average,
        ratingCount: summary.count,
      }
    }),
)

const dateFormatter = new Intl.DateTimeFormat('en-AU', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

const formatDate = (date) =>
  date ? dateFormatter.format(new Date(`${date}T00:00:00`)) : 'Date unavailable'

const bookingStatusLabel = (status) =>
  status === 'confirmed' ? 'Confirmed' : status === 'cancelled' ? 'Cancelled' : 'Unknown'
</script>

<template>
  <section class="admin-section">
    <div class="container">
      <div class="admin-heading">
        <div>
          <p class="eyebrow">Charity staff workspace</p>
          <h1>CareBloom dashboard</h1>
          <p class="page-lead">
            Welcome, {{ currentUser.displayName }}. Review users, bookings, circle participation,
            and community feedback from the fictional platform data.
          </p>
        </div>
        <span class="admin-role-badge">
          <span aria-hidden="true">&#10003;</span>
          Authorised admin
        </span>
      </div>

      <section aria-labelledby="overview-heading">
        <div class="admin-section-heading">
          <div>
            <p class="eyebrow">Platform overview</p>
            <h2 id="overview-heading">Current activity</h2>
          </div>
          <p>All values are calculated dynamically from the shared CareBloom data store.</p>
        </div>

        <div class="admin-overview-grid">
          <article
            v-for="card in overviewCards"
            :key="card.label"
            class="admin-stat-card"
            :class="`tone-${card.tone}`"
          >
            <strong>{{ card.value }}</strong>
            <div>
              <span>{{ card.label }}</span>
              <small>{{ card.detail }}</small>
            </div>
          </article>
        </div>
      </section>

      <div class="admin-detail-grid admin-insight-grid">
        <section class="admin-panel" aria-labelledby="roles-heading">
          <p class="eyebrow">Access roles</p>
          <h2 id="roles-heading">User role distribution</h2>
          <div class="role-breakdown">
            <div>
              <span>Young carers</span>
              <strong>{{ roleCounts.users }}</strong>
            </div>
            <div>
              <span>Charity staff</span>
              <strong>{{ roleCounts.admins }}</strong>
            </div>
          </div>
          <p class="admin-panel-note">
            New public registrations receive the user role. Admin access cannot be selected during
            registration.
          </p>
        </section>

        <section class="admin-panel" aria-labelledby="feedback-heading">
          <p class="eyebrow">Community feedback</p>
          <h2 id="feedback-heading">Rating overview</h2>
          <div v-if="overallRating !== null" class="admin-rating-overview">
            <div>
              <strong>{{ overallRating.toFixed(1) }}</strong>
              <span aria-hidden="true">&#9733;</span>
              <small>out of 5</small>
            </div>
            <dl>
              <div>
                <dt>Ratings submitted</dt>
                <dd>{{ validRatings.length }}</dd>
              </div>
              <div>
                <dt>Circles rated</dt>
                <dd>{{ ratedCircleCount }} / {{ state.peerCircles.length }}</dd>
              </div>
            </dl>
          </div>
          <div v-else class="admin-empty-state" role="status">
            <strong>No ratings submitted</strong>
            <p>The average will appear after an authenticated user rates a peer circle.</p>
          </div>
        </section>
      </div>

      <section class="admin-data-section" aria-labelledby="bookings-admin-heading">
        <div class="admin-section-heading">
          <div>
            <p class="eyebrow">Support activity</p>
            <h2 id="bookings-admin-heading">Booking list</h2>
          </div>
          <p>
            {{ confirmedBookingCount }} confirmed &middot;
            {{ cancelledBookingCount }} cancelled
          </p>
        </div>

        <div v-if="bookingRows.length" class="admin-booking-list">
          <article v-for="booking in bookingRows" :key="booking.id" class="admin-booking-row">
            <div class="admin-booking-person">
              <span aria-hidden="true">
                {{ booking.user?.displayName?.charAt(0).toUpperCase() ?? '?' }}
              </span>
              <div>
                <strong>{{ booking.user?.displayName ?? 'Unknown account' }}</strong>
                <small>{{ booking.user?.role === 'admin' ? 'Charity staff' : 'Young carer' }}</small>
              </div>
            </div>
            <div class="admin-booking-session">
              <span>Session</span>
              <strong>{{ booking.session?.title ?? 'Unavailable session' }}</strong>
            </div>
            <div class="admin-booking-schedule">
              <span>Date and format</span>
              <strong>{{ formatDate(booking.session?.date) }}</strong>
              <small v-if="booking.session">
                {{ booking.session.time }} &middot; {{ booking.session.format }}
              </small>
            </div>
            <span class="booking-status" :class="`is-${booking.status}`">
              {{ bookingStatusLabel(booking.status) }}
            </span>
          </article>
        </div>

        <div v-else class="admin-empty-state admin-wide-empty" role="status">
          <strong>No bookings recorded</strong>
          <p>Bookings will appear here after a young carer reserves a support session.</p>
        </div>
      </section>

      <section class="admin-data-section" aria-labelledby="circles-admin-heading">
        <div class="admin-section-heading">
          <div>
            <p class="eyebrow">Peer support</p>
            <h2 id="circles-admin-heading">Circle participation and ratings</h2>
          </div>
          <p>{{ totalCircleMembers }} memberships across {{ state.peerCircles.length }} circles</p>
        </div>

        <div v-if="circleRows.length" class="admin-circle-list">
          <article v-for="circle in circleRows" :key="circle.id" class="admin-circle-row">
            <div class="admin-circle-name">
              <span>{{ circle.format }}</span>
              <h3>{{ circle.name }}</h3>
              <p>{{ circle.audience }}</p>
            </div>

            <div class="admin-participation">
              <div>
                <span>Participation</span>
                <strong>{{ circle.memberCount }} / {{ circle.capacity }}</strong>
              </div>
              <div
                class="participation-track"
                role="progressbar"
                :aria-label="`${circle.name} participation`"
                :aria-valuenow="circle.memberCount"
                aria-valuemin="0"
                :aria-valuemax="circle.capacity"
              >
                <span :style="{ width: `${circle.occupancy}%` }"></span>
              </div>
              <small>
                {{ circle.placesRemaining }} places remaining &middot;
                {{ circle.registeredMembers }} registered account members
              </small>
            </div>

            <div class="admin-circle-rating">
              <span>Average rating</span>
              <template v-if="circle.ratingCount > 0">
                <strong>{{ circle.ratingAverage.toFixed(1) }} <span aria-hidden="true">&#9733;</span></strong>
                <small>
                  {{ circle.ratingCount }} {{ circle.ratingCount === 1 ? 'rating' : 'ratings' }}
                </small>
              </template>
              <template v-else>
                <strong class="no-rating-value">Not rated</strong>
                <small>No ratings yet</small>
              </template>
            </div>
          </article>
        </div>

        <div v-else class="admin-empty-state admin-wide-empty" role="status">
          <strong>No peer circles available</strong>
          <p>Participation and rating summaries will appear after circles are added.</p>
        </div>
      </section>

      <aside class="route-security-note">
        <span aria-hidden="true">&#128274;</span>
        <p>
          This read-only dashboard is protected by authentication and an <code>admin</code> role
          check in the global Vue Router guard. Hiding its navigation link is only an additional
          interface measure.
        </p>
      </aside>
    </div>
  </section>
</template>
