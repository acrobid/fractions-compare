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
  background: #1e2227; /* Dark background, same as grid cells */
  border-radius: 10px;
  padding: 1rem 1.5rem;
  font-family: "Comic Sans MS", "Comic Sans", "Chalkboard SE", "Courier New",
    monospace;
  font-size: 0.8em; /* Consistent with grid font size context */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); /* Darker shadow for depth */
  border: 1px solid #34d39966; /* Subtle green border, matching grid lines */
  color: #c9d1d9; /* Default text color, similar to grid text */
}

.step-row {
  margin-bottom: 0.5rem;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  transition: background 0.3s, color 0.3s;
  line-height: 1;
}

.step-row.active {
  background: #2a3b2a; /* Dark green background for active step */
  color: #b2f2bb; /* Lighter green text for active step */
  font-weight: bold;
  box-shadow: 0 0 2px #34d39980;
}

.step-label {
  color: #42b883; /* Bright green for step labels */
  margin-right: 0.75rem;
  font-weight: bold;
}

.step-desc {
  color: #e6edf3; /* Light text for descriptions, matching grid digits */
}

/* Ensure styles apply correctly in dark mode context if needed, though these are already dark-themed */
@media (prefers-color-scheme: dark) {
  .step-row.active {
    background: #275028; /* Slightly adjusted active background for dark mode if needed */
    color: #c1f7c8;
  }
  .step-label {
    color: #48c98d; /* Ensure visibility */
  }
  .step-desc {
    color: #f0f6fc;
  }
}
</style>
