<script setup>
import { computed } from 'vue'
import { useAuth } from '../stores/authStore'
import { useCareBloomData } from '../stores/careBloomStore'

const { currentUser } = useAuth()
const { state, collectionCounts } = useCareBloomData()

const overviewCards = computed(() => [
  { label: 'Registered users', value: collectionCounts.value.users, tone: 'sage' },
  { label: 'Support sessions', value: collectionCounts.value.supportSessions, tone: 'coral' },
  { label: 'Peer circles', value: collectionCounts.value.peerCircles, tone: 'cream' },
  { label: 'Bookings', value: collectionCounts.value.bookings, tone: 'sage' },
  { label: 'Ratings', value: collectionCounts.value.ratings, tone: 'coral' },
])

const roleCounts = computed(() => ({
  users: state.users.filter((user) => user.role === 'user').length,
  admins: state.users.filter((user) => user.role === 'admin').length,
}))

const upcomingSessions = computed(() =>
  [...state.supportSessions]
    .sort((first, second) =>
      `${first.date}T${first.time}`.localeCompare(`${second.date}T${second.time}`),
    )
    .slice(0, 3),
)

const dateFormatter = new Intl.DateTimeFormat('en-AU', {
  day: 'numeric',
  month: 'short',
})

const formatDate = (date) => dateFormatter.format(new Date(`${date}T00:00:00`))
</script>

<template>
  <section class="admin-section">
    <div class="container">
      <div class="admin-heading">
        <div>
          <p class="eyebrow">Charity staff workspace</p>
          <h1>CareBloom dashboard</h1>
          <p class="page-lead">
            Welcome, {{ currentUser.displayName }}. Review a high-level snapshot of the fictional
            platform data.
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
          <p>Values are read dynamically from the shared CareBloom data store.</p>
        </div>

        <div class="admin-overview-grid">
          <article
            v-for="card in overviewCards"
            :key="card.label"
            class="admin-stat-card"
            :class="`tone-${card.tone}`"
          >
            <strong>{{ card.value }}</strong>
            <span>{{ card.label }}</span>
          </article>
        </div>
      </section>

      <div class="admin-detail-grid">
        <section class="admin-panel" aria-labelledby="roles-heading">
          <p class="eyebrow">Access roles</p>
          <h2 id="roles-heading">User breakdown</h2>
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
            New registrations always receive the user role. Admin access is not selectable from the
            public registration form.
          </p>
        </section>

        <section class="admin-panel" aria-labelledby="upcoming-heading">
          <p class="eyebrow">Schedule</p>
          <h2 id="upcoming-heading">Next sessions</h2>
          <ul class="admin-session-list">
            <li v-for="session in upcomingSessions" :key="session.id">
              <span class="admin-session-date">{{ formatDate(session.date) }}</span>
              <div>
                <strong>{{ session.title }}</strong>
                <span>{{ session.time }} &middot; {{ session.format }}</span>
              </div>
            </li>
          </ul>
        </section>
      </div>

      <aside class="route-security-note">
        <span aria-hidden="true">&#128274;</span>
        <p>
          This dashboard is protected by both authentication and an <code>admin</code> role check in
          the global Vue Router guard. Hiding its navigation link is only an additional interface
          measure.
        </p>
      </aside>
    </div>
  </section>
</template>
