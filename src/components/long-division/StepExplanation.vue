<template>
  <div class="step-explanation" v-if="explanation">
    <div class="explanation-card">
      <div class="explanation-content">
        <InfoIcon />
        {{ explanation }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import InfoIcon from "./icons/InfoIcon.vue";

defineProps<{
  explanation: string | null;
}>();
</script>

<style scoped>
.step-explanation {
  margin: 1.5rem 0;
}

.explanation-card {
  background-color: var(--fraction-bg, #f8f9fa);
  border-radius: 12px;
  padding: 1rem;
  margin: 1.5rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.explanation-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.1rem;
  line-height: 1.5;
  color: var(--text-color, #213547);
}

@media (prefers-color-scheme: dark) {
  .explanation-card {
    background-color: var(--fraction-bg, #2a2a2a);
  }

  .explanation-content {
    color: var(--text-color, #fff);
  }
}
</style>
