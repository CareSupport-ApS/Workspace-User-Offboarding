<template>
  <div class="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.9fr)]">
    <Card class="split-panel-card overflow-hidden">
      <template #content>
        <slot name="left" />
      </template>
    </Card>

    <Card class="split-panel-card overflow-hidden">
      <template #content>
        <slot name="right" />
      </template>
    </Card>
  </div>
</template>

<style scoped>
:deep(.split-panel-card.p-card) {
  height: 100%;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 18px;
  box-shadow: none;
}

:deep(.split-panel-card .p-card-body) {
  height: 100%;
}
</style>
