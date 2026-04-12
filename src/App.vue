<template>
  <div class="app-shell">
    <AppNavbar />

    <div class="workspace-layout">
      <AppSidebar />
      <main class="content-area">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import AppNavbar from './components/AppNavbar.vue';
import AppSidebar from './components/AppSidebar.vue';
</script>
