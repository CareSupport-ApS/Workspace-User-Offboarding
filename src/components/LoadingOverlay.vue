<template>
  <div v-if="visible" class="modal-overlay active">
    <div class="modal-content">
      <div class="spinner" />
      <div class="processing-text">Processing...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean;
}>();
</script>
