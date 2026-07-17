<script setup>
defineProps({
  eyebrow: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  stage: { type: String, required: true },
})
</script>

<template>
  <section class="page-hero">
    <div class="container narrow-container">
      <p class="eyebrow">{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
      <p class="page-lead">{{ description }}</p>

      <div class="stage-notice" role="status">
        <span class="stage-icon" aria-hidden="true">&#10047;</span>
        <div>
          <strong>Page structure ready</strong>
          <p>{{ stage }}</p>
        </div>
      </div>

      <RouterLink class="back-link" to="/">&larr; Return to home</RouterLink>
    </div>
  </section>
</template>
