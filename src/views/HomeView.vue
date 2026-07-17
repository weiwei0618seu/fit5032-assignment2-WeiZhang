<template>
  <section class="hero-section">
    <div class="container hero-grid">
      <div class="hero-copy">
        <p class="eyebrow">Support for young carers</p>
        <h1>Make space for your wellbeing, too.</h1>
        <p class="hero-lead">
          CareBloom helps young people who care for family or friends find gentle support,
          wellbeing sessions, and a community that understands.
        </p>
        <div class="button-row">
          <RouterLink class="button" to="/support">Find support near you</RouterLink>
          <RouterLink class="button button-secondary" to="/about">Learn about young carers</RouterLink>
        </div>
        <p class="privacy-note">
          <span aria-hidden="true">&#10003;</span>
          Private, low-pressure, and designed around your time.
        </p>
      </div>

      <div class="hero-art" aria-label="A calm illustration representing growth and connection" role="img">
        <div class="art-orbit orbit-one"></div>
        <div class="art-orbit orbit-two"></div>
        <div class="art-card art-card-main">
          <span class="art-icon" aria-hidden="true">&#10047;</span>
          <strong>You care for them.</strong>
          <span>We help you care for yourself.</span>
        </div>
        <div class="art-card art-card-small">
          <span class="status-dot" aria-hidden="true"></span>
          Support that fits your day
        </div>
      </div>
    </div>
  </section>

  <section class="pathways-section" aria-labelledby="pathways-title">
    <div class="container">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Start where you feel comfortable</p>
          <h2 id="pathways-title">A few simple ways to feel supported</h2>
        </div>
        <p>No diagnosis, complicated referral, or pressure to share more than you want to.</p>
      </div>

      <div class="pathway-grid">
        <article class="pathway-card">
          <span class="pathway-number">01</span>
          <h3>Find nearby support</h3>
          <p>Explore welcoming services and peer circles in your area.</p>
          <RouterLink to="/support">Explore support <span aria-hidden="true">&rarr;</span></RouterLink>
        </article>

        <article class="pathway-card featured-card">
          <span class="pathway-number">02</span>
          <h3>Book a wellbeing session</h3>
          <p>Choose an online or in-person time that works around your responsibilities.</p>
          <RouterLink to="/sessions">View sessions <span aria-hidden="true">&rarr;</span></RouterLink>
        </article>

        <article class="pathway-card">
          <span class="pathway-number">03</span>
          <h3>Join a peer circle</h3>
          <p>Connect with other young carers in a respectful, guided space.</p>
          <RouterLink to="/community">Meet the community <span aria-hidden="true">&rarr;</span></RouterLink>
        </article>
      </div>
    </div>
  </section>

  <section class="reassurance-section">
    <div class="container reassurance-panel">
      <div class="reassurance-symbol" aria-hidden="true">&#9788;</div>
      <div>
        <p class="eyebrow">You are a person before you are a carer</p>
        <h2>Small moments of support can make a real difference.</h2>
      </div>
      <RouterLink class="button button-light" to="/register">Create your account</RouterLink>
    </div>
  </section>
</template>
