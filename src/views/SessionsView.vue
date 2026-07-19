<script setup>
import { computed, ref } from 'vue'
import { useCareBloomData } from '../stores/careBloomStore'

const { state } = useCareBloomData()
const selectedFormat = ref('All')

const dateFormatter = new Intl.DateTimeFormat('en-AU', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

const formats = computed(() => [
  'All',
  ...new Set(state.supportSessions.map((session) => session.format)),
])

const filteredSessions = computed(() =>
  state.supportSessions
    .filter(
      (session) => selectedFormat.value === 'All' || session.format === selectedFormat.value,
    )
    .sort((first, second) =>
      `${first.date}T${first.time}`.localeCompare(`${second.date}T${second.time}`),
    ),
)

const formatDate = (date) => dateFormatter.format(new Date(`${date}T00:00:00`))

const placesRemaining = (session) => {
  const confirmedBookings = state.bookings.filter(
    (booking) => booking.sessionId === session.id && booking.status === 'confirmed',
  ).length

  return Math.max(session.capacity - confirmedBookings, 0)
}
</script>

<template>
  <section class="listing-hero">
    <div class="container listing-hero-grid">
      <div>
        <p class="eyebrow">Wellbeing support sessions</p>
        <h1>Choose support that fits around your caring role.</h1>
      </div>
      <p class="page-lead">
        Explore fictional online, phone, and in-person sessions. Booking will become available
        after the authentication stage.
      </p>
    </div>
  </section>

  <section class="listing-section" aria-labelledby="sessions-heading">
    <div class="container">
      <div class="listing-toolbar">
        <div>
          <p class="eyebrow">Upcoming support</p>
          <h2 id="sessions-heading">Available sessions</h2>
          <p class="results-count" aria-live="polite">
            Showing {{ filteredSessions.length }} of {{ state.supportSessions.length }} sessions
          </p>
        </div>

        <label class="filter-control">
          <span>Session format</span>
          <select v-model="selectedFormat">
            <option v-for="format in formats" :key="format" :value="format">
              {{ format === 'All' ? 'All formats' : format }}
            </option>
          </select>
        </label>
      </div>

      <div v-if="filteredSessions.length" class="resource-grid">
        <article v-for="session in filteredSessions" :key="session.id" class="resource-card">
          <div class="card-topline">
            <span class="format-pill">{{ session.format }}</span>
            <span class="focus-label">{{ session.focus }}</span>
          </div>

          <div class="card-content">
            <h3>{{ session.title }}</h3>
            <p>{{ session.description }}</p>

            <dl class="details-list">
              <div>
                <dt>Date</dt>
                <dd>{{ formatDate(session.date) }} at {{ session.time }}</dd>
              </div>
              <div>
                <dt>Duration</dt>
                <dd>{{ session.durationMinutes }} minutes</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{{ session.location }}</dd>
              </div>
              <div>
                <dt>Facilitator</dt>
                <dd>{{ session.facilitator }}</dd>
              </div>
            </dl>

            <ul class="tag-list" :aria-label="`Accessibility for ${session.title}`">
              <li v-for="feature in session.accessibility" :key="feature">{{ feature }}</li>
            </ul>
          </div>

          <div class="card-footer">
            <p>
              <strong>{{ placesRemaining(session) }}</strong>
              {{ placesRemaining(session) === 1 ? 'place' : 'places' }} remaining
            </p>
            <RouterLink class="card-link" to="/login">
              Log in to book <span aria-hidden="true">&rarr;</span>
            </RouterLink>
          </div>
        </article>
      </div>

      <div v-else class="empty-state" role="status">
        <h3>No sessions match this format</h3>
        <p>Choose another format to see the available support sessions.</p>
        <button class="button button-secondary" type="button" @click="selectedFormat = 'All'">
          Show all sessions
        </button>
      </div>

      <p v-if="!state.storageAvailable" class="storage-notice" role="status">
        Your browser is not allowing Local Storage. The sample session data is available for this
        visit, but changes will not persist after the tab is closed.
      </p>
    </div>
  </section>
</template>
