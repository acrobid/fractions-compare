<template>
  <div class="step-instructions">
    <div v-if="steps.length > 0">
      <div
        v-for="(step, idx) in steps"
        :key="idx"
        class="step-row"
        :class="{ active: idx === currentStep }"
      >
        <span class="step-label">Step {{ idx + 1 }}:</span>
        <span class="step-desc">{{ step.instruction }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

defineProps<{
  steps: { instruction: string }[];
  currentStep: number;
}>();
</script>

<style scoped>
.step-instructions {
  margin-bottom: 1.5rem;
  background: #e3f0ff;
  border-radius: 10px;
  padding: 1rem 1.5rem;
  font-family: "Comic Sans MS", "Comic Sans", "Chalkboard SE", "Courier New",
    monospace;
  font-size: 18px;
  box-shadow: 0 2px 8px #b3c6ff33;
}
.step-row {
  margin-bottom: 0.5rem;
  padding: 0.3rem 0.5rem;
  border-radius: 6px;
  transition: background 0.2s;
}
.step-row.active {
  background: #fff9c4;
  font-weight: bold;
}
.step-label {
  color: #1976d2;
  margin-right: 0.5rem;
}
.step-desc {
  color: #1a237e;
}
</style>
