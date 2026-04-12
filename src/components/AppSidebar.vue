<template>
  <aside class="sidebar">
    <p class="sidebar-label">Navigation</p>

    <RouterLink
      class="nav-item"
      to="/onboarding"
      active-class="active"
    >
      <span class="nav-item-title">Onboarding</span>
      <span class="nav-item-copy">Prepare new hires for day one</span>
    </RouterLink>

    <RouterLink
      class="nav-item"
      to="/offboarding"
      active-class="active"
    >
      <span class="nav-item-title">Offboarding</span>
      <span class="nav-item-copy">Securely remove access and hand off data</span>
    </RouterLink>
  </aside>
</template>
