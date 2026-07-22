<script setup>
const caringResponsibilities = [
  'Helping with medication routines or appointments',
  'Providing emotional reassurance and company',
  'Supporting mobility, communication, or daily tasks',
  'Managing household responsibilities or looking after siblings',
]

const wellbeingPressures = [
  {
    symbol: '01',
    title: 'Rest and energy',
    description:
      'Unpredictable routines and night-time responsibilities can make proper rest difficult.',
  },
  {
    symbol: '02',
    title: 'Study and work',
    description:
      'Deadlines, attendance, and paid work may be harder to balance alongside caring tasks.',
  },
  {
    symbol: '03',
    title: 'Emotional wellbeing',
    description:
      'Worry, guilt, frustration, and tiredness can exist together without meaning someone is failing.',
  },
  {
    symbol: '04',
    title: 'Friends and identity',
    description:
      'Less free time can make it harder to stay connected or make space for personal goals.',
  },
]

const supportPathways = [
  {
    number: '01',
    title: 'Find a welcoming place',
    description: 'Compare fictional local, hybrid, and online support options at your own pace.',
    label: 'Find nearby support',
    to: '/support',
  },
  {
    number: '02',
    title: 'Choose a wellbeing session',
    description: 'Book a practical, low-pressure session around study, work, and caring time.',
    label: 'Browse sessions',
    to: '/sessions',
  },
  {
    number: '03',
    title: 'Connect with peers',
    description: 'Explore facilitated circles with people who understand caring responsibilities.',
    label: 'Explore the community',
    to: '/community',
  },
]
</script>

<template>
  <section class="listing-hero about-hero">
    <div class="container listing-hero-grid">
      <div>
        <p class="eyebrow">About young carers</p>
        <h1>Caring is part of your life, not all of who you are.</h1>
      </div>
      <p class="page-lead">
        Young carers provide unpaid help to someone important to them who lives with illness,
        disability, mental health challenges, or another ongoing support need.
      </p>
    </div>
  </section>

  <section class="about-intro-section" aria-labelledby="young-carer-heading">
    <div class="container about-intro-grid">
      <div>
        <p class="eyebrow">Recognising the role</p>
        <h2 id="young-carer-heading">There is no single young carer experience.</h2>
        <p>
          Some people have cared for years; others are adjusting to a recent change. The person
          receiving care might be a parent, sibling, partner, relative, or friend. Caring can feel
          meaningful while also being tiring, isolating, or difficult to explain.
        </p>
        <p>
          You do not need to use a particular label or wait until things feel overwhelming before
          exploring support.
        </p>
      </div>

      <aside class="about-definition-card" aria-labelledby="responsibilities-heading">
        <span class="about-card-symbol" aria-hidden="true">&#10047;</span>
        <div>
          <p class="eyebrow">Caring can include</p>
          <h3 id="responsibilities-heading">Everyday responsibilities</h3>
          <ul class="about-responsibility-list">
            <li v-for="responsibility in caringResponsibilities" :key="responsibility">
              <span aria-hidden="true">&#10003;</span>
              {{ responsibility }}
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </section>

  <section class="wellbeing-impact-section" aria-labelledby="wellbeing-impact-heading">
    <div class="container">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Your wellbeing matters</p>
          <h2 id="wellbeing-impact-heading">Caring pressure can show up in different ways.</h2>
        </div>
        <p>
          These experiences are not diagnoses. They are signs that more support, rest, or
          understanding could be helpful.
        </p>
      </div>

      <div class="wellbeing-impact-grid">
        <article v-for="pressure in wellbeingPressures" :key="pressure.title" class="wellbeing-impact-card">
          <span>{{ pressure.symbol }}</span>
          <h3>{{ pressure.title }}</h3>
          <p>{{ pressure.description }}</p>
        </article>
      </div>
    </div>
  </section>

  <section class="about-support-section" aria-labelledby="carebloom-support-heading">
    <div class="container">
      <div class="section-heading">
        <div>
          <p class="eyebrow">How CareBloom helps</p>
          <h2 id="carebloom-support-heading">Start with one manageable next step.</h2>
        </div>
        <p>Browse first, decide in your own time, and share only what feels comfortable.</p>
      </div>

      <div class="about-support-grid">
        <article v-for="pathway in supportPathways" :key="pathway.number" class="about-support-card">
          <span>{{ pathway.number }}</span>
          <h3>{{ pathway.title }}</h3>
          <p>{{ pathway.description }}</p>
          <RouterLink :to="pathway.to">{{ pathway.label }} &rarr;</RouterLink>
        </article>
      </div>

      <aside class="support-boundary-note">
        <span aria-hidden="true">&#128274;</span>
        <div>
          <strong>Support without pressure</strong>
          <p>
            CareBloom is a fictional wellbeing-support prototype. It does not diagnose conditions,
            provide formal treatment, or replace emergency and crisis services.
          </p>
        </div>
      </aside>
    </div>
  </section>
</template>
