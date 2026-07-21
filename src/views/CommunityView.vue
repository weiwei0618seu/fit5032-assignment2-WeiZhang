<script setup>
import { computed, reactive, ref } from 'vue'
import { joinPeerCircle, useCareBloomData } from '../stores/careBloomStore'
import { useAuth } from '../stores/authStore'

const { state } = useCareBloomData()
const { currentUser, isAuthenticated } = useAuth()
const selectedFormat = ref('All')
const joinFeedback = reactive({})

const dateFormatter = new Intl.DateTimeFormat('en-AU', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

const formats = computed(() => [
  'All',
  ...new Set(state.peerCircles.map((circle) => circle.format)),
])

const filteredCircles = computed(() =>
  state.peerCircles
    .filter(
      (circle) => selectedFormat.value === 'All' || circle.format === selectedFormat.value,
    )
    .sort((first, second) => first.nextMeeting.localeCompare(second.nextMeeting)),
)

const formatDate = (date) => dateFormatter.format(new Date(`${date}T00:00:00`))

const placesRemaining = (circle) => Math.max(circle.capacity - circle.memberCount, 0)

const isJoined = (circleId) =>
  Boolean(currentUser.value?.joinedCircleIds?.includes(circleId))

const handleJoin = (circle) => {
  const result = joinPeerCircle(currentUser.value.id, circle.id)
  joinFeedback[circle.id] = {
    type: result.ok ? 'success' : 'error',
    message: result.message,
  }
}
</script>

<template>
  <section class="listing-hero community-hero">
    <div class="container listing-hero-grid">
      <div>
        <p class="eyebrow">Peer community</p>
        <h1>Meet people who understand the caring journey.</h1>
      </div>
      <p class="page-lead">
        Browse fictional peer circles designed to feel respectful, guided, and low-pressure.
        Young carer accounts can join an available circle and see it in My Account.
      </p>
    </div>
  </section>

  <section class="listing-section" aria-labelledby="circles-heading">
    <div class="container">
      <div class="listing-toolbar">
        <div>
          <p class="eyebrow">Find your people</p>
          <h2 id="circles-heading">Peer support circles</h2>
          <p class="results-count" aria-live="polite">
            Showing {{ filteredCircles.length }} of {{ state.peerCircles.length }} circles
          </p>
        </div>

        <label class="filter-control">
          <span>Circle format</span>
          <select v-model="selectedFormat">
            <option v-for="format in formats" :key="format" :value="format">
              {{ format === 'All' ? 'All formats' : format }}
            </option>
          </select>
        </label>
      </div>

      <div v-if="filteredCircles.length" class="resource-grid">
        <article v-for="circle in filteredCircles" :key="circle.id" class="resource-card circle-card">
          <div class="card-topline">
            <span class="format-pill">{{ circle.format }}</span>
            <span class="focus-label">{{ circle.audience }}</span>
          </div>

          <div class="card-content">
            <h3>{{ circle.name }}</h3>
            <p>{{ circle.description }}</p>

            <dl class="details-list">
              <div>
                <dt>Meets</dt>
                <dd>{{ circle.schedule }}</dd>
              </div>
              <div>
                <dt>Next circle</dt>
                <dd>{{ formatDate(circle.nextMeeting) }}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{{ circle.location }}</dd>
              </div>
              <div>
                <dt>Facilitator</dt>
                <dd>{{ circle.facilitator }}</dd>
              </div>
            </dl>

            <ul class="tag-list" :aria-label="`Topics for ${circle.name}`">
              <li v-for="topic in circle.topics" :key="topic">{{ topic }}</li>
            </ul>
          </div>

          <div class="card-footer">
            <p>
              <strong>{{ placesRemaining(circle) }}</strong>
              {{ placesRemaining(circle) === 1 ? 'place' : 'places' }} remaining
            </p>
            <RouterLink
              v-if="!isAuthenticated"
              class="card-link"
              :to="{ name: 'login', query: { redirect: '/community' } }"
            >
              Log in to join <span aria-hidden="true">&rarr;</span>
            </RouterLink>
            <span v-else-if="currentUser.role !== 'user'" class="card-action-state">
              Young carer accounts only
            </span>
            <RouterLink v-else-if="isJoined(circle.id)" class="card-link booked-link" to="/account">
              Joined &middot; View account
            </RouterLink>
            <button
              v-else
              class="card-link card-action-button"
              type="button"
              :disabled="placesRemaining(circle) === 0"
              @click="handleJoin(circle)"
            >
              {{ placesRemaining(circle) === 0 ? 'Circle full' : 'Join this circle' }}
              <span v-if="placesRemaining(circle) > 0" aria-hidden="true">&rarr;</span>
            </button>
          </div>
          <p
            v-if="joinFeedback[circle.id]"
            class="card-feedback"
            :class="`is-${joinFeedback[circle.id].type}`"
            role="status"
          >
            {{ joinFeedback[circle.id].message }}
          </p>
        </article>
      </div>

      <div v-else class="empty-state" role="status">
        <h3>No circles match this format</h3>
        <p>Choose another format to see the available peer circles.</p>
        <button class="button button-secondary" type="button" @click="selectedFormat = 'All'">
          Show all circles
        </button>
      </div>

      <p v-if="!state.storageAvailable" class="storage-notice" role="status">
        Your browser is not allowing Local Storage. The sample circle data is available for this
        visit, but changes will not persist after the tab is closed.
      </p>
    </div>
  </section>
</template>
