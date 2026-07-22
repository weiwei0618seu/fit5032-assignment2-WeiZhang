<script setup>
import { computed, ref } from 'vue'
import { supportLocations } from '../data/supportLocations.js'

const searchQuery = ref('')
const selectedSuburb = ref('All')
const selectedType = ref('All')
const selectedFormat = ref('All')
const expandedLocationId = ref(null)

const uniqueOptions = (key) => [
  'All',
  ...new Set(supportLocations.map((location) => location[key]).sort()),
]

const suburbs = uniqueOptions('suburb')
const serviceTypes = uniqueOptions('serviceType')
const formats = uniqueOptions('format')

const filteredLocations = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return supportLocations.filter((location) => {
    const searchableText = [
      location.name,
      location.suburb,
      location.serviceType,
      location.description,
      ...location.supports,
    ]
      .join(' ')
      .toLowerCase()

    return (
      (!query || searchableText.includes(query)) &&
      (selectedSuburb.value === 'All' || location.suburb === selectedSuburb.value) &&
      (selectedType.value === 'All' || location.serviceType === selectedType.value) &&
      (selectedFormat.value === 'All' || location.format === selectedFormat.value)
    )
  })
})

const hasActiveFilters = computed(
  () =>
    searchQuery.value.trim() ||
    selectedSuburb.value !== 'All' ||
    selectedType.value !== 'All' ||
    selectedFormat.value !== 'All',
)

const clearFilters = () => {
  searchQuery.value = ''
  selectedSuburb.value = 'All'
  selectedType.value = 'All'
  selectedFormat.value = 'All'
}

const toggleLocationDetails = (locationId) => {
  expandedLocationId.value = expandedLocationId.value === locationId ? null : locationId
}
</script>

<template>
  <section class="listing-hero support-hero">
    <div class="container listing-hero-grid">
      <div>
        <p class="eyebrow">Find nearby support</p>
        <h1>Find a support option that feels reachable.</h1>
      </div>
      <p class="page-lead">
        Compare fictional local, hybrid, and online services for young carers. Filter quietly,
        check access details, and choose a next step without making a commitment.
      </p>
    </div>
  </section>

  <section class="support-listing-section" aria-labelledby="support-options-heading">
    <div class="container">
      <div class="support-listing-heading">
        <div>
          <p class="eyebrow">Support directory</p>
          <h2 id="support-options-heading">Local and online options</h2>
          <p class="results-count" aria-live="polite">
            Showing {{ filteredLocations.length }} of {{ supportLocations.length }} fictional services
          </p>
        </div>
        <p>Use filters together to narrow the directory by place, support type, or format.</p>
      </div>

      <div class="support-filter-panel" aria-label="Filter support services">
        <label class="support-search-control">
          <span>Search support</span>
          <input
            v-model="searchQuery"
            type="search"
            maxlength="50"
            placeholder="Try stress, study, or peer support"
          />
        </label>

        <label class="filter-control">
          <span>Suburb</span>
          <select v-model="selectedSuburb">
            <option v-for="suburb in suburbs" :key="suburb" :value="suburb">
              {{ suburb === 'All' ? 'All locations' : suburb }}
            </option>
          </select>
        </label>

        <label class="filter-control">
          <span>Support type</span>
          <select v-model="selectedType">
            <option v-for="serviceType in serviceTypes" :key="serviceType" :value="serviceType">
              {{ serviceType === 'All' ? 'All support types' : serviceType }}
            </option>
          </select>
        </label>

        <label class="filter-control">
          <span>Format</span>
          <select v-model="selectedFormat">
            <option v-for="format in formats" :key="format" :value="format">
              {{ format === 'All' ? 'All formats' : format }}
            </option>
          </select>
        </label>

        <button
          v-if="hasActiveFilters"
          class="support-clear-button"
          type="button"
          @click="clearFilters"
        >
          Clear filters
        </button>
      </div>

      <div v-if="filteredLocations.length" class="support-location-grid">
        <article
          v-for="location in filteredLocations"
          :key="location.id"
          class="resource-card support-location-card"
        >
          <div class="card-topline">
            <span class="format-pill">{{ location.format }}</span>
            <span class="focus-label">{{ location.serviceType }}</span>
          </div>

          <div class="card-content">
            <p class="support-suburb">{{ location.suburb }}</p>
            <h3>{{ location.name }}</h3>
            <p>{{ location.description }}</p>

            <dl class="support-location-summary">
              <div>
                <dt>Available</dt>
                <dd>{{ location.availability }}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{{ location.address }}</dd>
              </div>
            </dl>

            <ul class="tag-list" :aria-label="`Support available at ${location.name}`">
              <li v-for="support in location.supports" :key="support">{{ support }}</li>
            </ul>
          </div>

          <div
            v-if="expandedLocationId === location.id"
            :id="`location-details-${location.id}`"
            class="support-location-details"
          >
            <div>
              <strong>Getting there</strong>
              <p>{{ location.gettingThere }}</p>
            </div>
            <div>
              <strong>Access information</strong>
              <p>{{ location.accessibility }}</p>
            </div>
            <small>Location and travel details are fictional and provided for coursework testing.</small>
          </div>

          <div class="card-footer support-card-footer">
            <button
              class="card-link card-action-button"
              type="button"
              :aria-expanded="expandedLocationId === location.id"
              :aria-controls="`location-details-${location.id}`"
              @click="toggleLocationDetails(location.id)"
            >
              {{ expandedLocationId === location.id ? 'Hide location details' : 'View location details' }}
            </button>
            <RouterLink class="card-link" :to="location.nextStep">
              {{ location.nextStepLabel }} &rarr;
            </RouterLink>
          </div>
        </article>
      </div>

      <div v-else class="empty-state" role="status">
        <h3>No support options match those filters</h3>
        <p>Try a different location, support type, or search term.</p>
        <button class="button button-secondary" type="button" @click="clearFilters">
          Show all support
        </button>
      </div>

      <aside class="support-directory-note">
        <span aria-hidden="true">&#8505;</span>
        <p>
          CareBloom and every listed service are fictional. This directory provides wellbeing
          information only and is not a diagnosis, treatment, emergency, or crisis service.
        </p>
      </aside>
    </div>
  </section>
</template>
