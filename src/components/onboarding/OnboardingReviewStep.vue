<template>
  <div>
    <div class="summary-header">
      <h3>Summary</h3>
      <Button label="Reset" severity="secondary" outlined @click="$emit('reset')" />
    </div>

    <p class="summary-copy">{{ summary }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  summary: string;
}>();

defineEmits<{
  reset: [];
}>();
</script>
