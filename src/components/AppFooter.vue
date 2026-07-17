<template>
  <footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-intro">
        <RouterLink class="brand brand-footer" to="/" aria-label="CareBloom home">
          <span class="brand-mark" aria-hidden="true">
            <span></span><span></span><span></span><span></span>
          </span>
          <span>CareBloom</span>
        </RouterLink>
        <p>Gentle wellbeing support for young people who care for someone important to them.</p>
      </div>

      <div>
        <h2 class="footer-heading">Explore</h2>
        <ul class="footer-links">
          <li><RouterLink to="/about">About young carers</RouterLink></li>
          <li><RouterLink to="/support">Find support</RouterLink></li>
          <li><RouterLink to="/sessions">Wellbeing sessions</RouterLink></li>
          <li><RouterLink to="/community">Peer community</RouterLink></li>
        </ul>
      </div>

      <div>
        <h2 class="footer-heading">Account</h2>
        <ul class="footer-links">
          <li><RouterLink to="/login">Log in</RouterLink></li>
          <li><RouterLink to="/register">Create account</RouterLink></li>
          <li><RouterLink to="/account">My account</RouterLink></li>
          <li><RouterLink to="/admin">Staff dashboard</RouterLink></li>
        </ul>
      </div>
    </div>

    <div class="container footer-bottom">
      <p>CareBloom is a fictional student project. It does not provide diagnosis, treatment, or emergency support.</p>
      <p>&copy; {{ new Date().getFullYear() }} CareBloom</p>
    </div>
  </footer>
</template>
