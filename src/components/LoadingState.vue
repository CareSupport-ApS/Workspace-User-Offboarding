<template>
  <div class="flex min-h-full flex-col items-center justify-center gap-4 py-10 text-center">
    <ProgressSpinner
      stroke-width="4"
      style="width: 2.5rem; height: 2.5rem"
    />
    <div class="space-y-1">
      <h3 class="m-0">{{ title }}</h3>
      <p class="m-0 text-slate-500">{{ description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  description: string;
  title: string;
}>();
</script>
