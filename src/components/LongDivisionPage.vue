<script setup lang="ts">
import { computed } from "vue";
import { useLongDivision } from "../composables/useLongDivision";
import type { GridCell } from "../composables/useLongDivision";
import LongDivisionGrid from "./LongDivisionGrid.vue";
import LongDivisionInstructions from "./LongDivisionInstructions.vue";

const {
  dividend,
  divisor,
  gridCells,
  rows,
  cols,
  steps,
  currentStep, // This is the sub-step index now
  highlightedCells,
  generate,
  nextStep,
  prevStep,
} = useLongDivision();

const displayCells = computed(() =>
  gridCells.value.map((cell) => {
    if (highlightedCells.value.has(cell.id)) {
      return {
        ...cell,
        highlight: "active" as GridCell["highlight"],
        // border: "2px solid #ff9800", // Border highlighting is in CSS now
      };
    }
    return cell;
  }),
);

// currentStep from useLongDivision is effectively the currentSubStep for the grid
const currentSubStepForGrid = currentStep;

const visibleInstructions = computed(() =>
  steps.value.slice(0, currentStep.value + 1),
);
</script>

<template>
  <div class="long-division-page-container">
    <h2>Long Division Explorer</h2>
    <div class="controls">
      <label>Dividend: <input type="number" v-model.number="dividend" /></label>
      <label>Divisor: <input type="number" v-model.number="divisor" /></label>
      <button @click="generate">Visualize</button>
    </div>

    <div v-if="steps.length > 0">
      <div class="step-nav">
        <button @click="prevStep" :disabled="currentStep === 0">
          Previous
        </button>
        <span>Step {{ currentStep + 1 }} / {{ steps.length }}</span>
        <button @click="nextStep" :disabled="currentStep >= steps.length - 1">
          <!-- Fixed condition here -->
          Next
        </button>
      </div>
      <LongDivisionGrid
        v-if="gridCells.length"
        :gridCells="displayCells"
        :rows="rows"
        :cols="cols"
        :currentSubStep="currentSubStepForGrid"
      />
      <LongDivisionInstructions
        :steps="visibleInstructions"
        :currentStep="currentStep"
      />
    </div>
    <div
      v-else-if="dividend !== null && divisor !== null"
      class="placeholder-text"
    >
      Enter a dividend and divisor, then click "Visualize" to see the steps.
    </div>
  </div>
</template>

<style scoped src="./long-division-styles.css"></style>
<style scoped>
.long-division-page-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
}

.long-division-page-container h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #42b883; /* App.vue h1 color */
  font-size: 1.8em;
}

/* Dark mode for h2 is handled by global styles if body color changes, 
   but we can be explicit if needed or if it's different from body text */
@media (prefers-color-scheme: dark) {
  .long-division-page-container h2 {
    color: #42b883; /* Keep green in dark mode, or adjust if too bright */
  }
}

.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f0f2f5; /* Lighter, neutral background */
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.controls label {
  font-size: 1em;
  color: #333;
}

.controls input[type="number"] {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1em;
  width: 80px;
  text-align: right;
}

.controls button {
  padding: 0.6rem 1.2rem;
  font-size: 1em;
  background-color: #42b883; /* Green button */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.controls button:hover {
  background-color: #36a471; /* Darker green on hover */
}

@media (prefers-color-scheme: dark) {
  .controls {
    background-color: #2a2a2a;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
  .controls label {
    color: rgba(255, 255, 255, 0.87);
  }
  .controls input[type="number"] {
    background-color: #333;
    color: rgba(255, 255, 255, 0.87);
    border: 1px solid #555;
  }
  .controls button {
    background-color: #42b883; /* Green button in dark mode */
  }
  .controls button:hover {
    background-color: #36a471;
  }
}

.step-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  font-family: "Comic Sans MS", "Comic Sans", "Chalkboard SE", "Courier New",
    /* Keeping this distinct for now */ monospace;
  font-size: 1em;
}

.step-nav button {
  padding: 0.5rem 1rem;
  font-size: 0.95em;
  background: #e6f4ea; /* Light green background */
  color: #2a663e; /* Darker green text */
  border: 2px solid #a5d6b8; /* Greenish border */
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}

.step-nav button:hover:not(:disabled) {
  background: #d1ecd5;
  border-color: #8ccaa1;
}

.step-nav button:disabled {
  background: #e0e0e0;
  color: #888;
  border-color: #ccc;
  cursor: not-allowed;
}

@media (prefers-color-scheme: dark) {
  .step-nav button {
    background: #2c4c3b; /* Dark green background */
    color: #b0e6c2; /* Lighter green text */
    border-color: #3e7050;
  }
  .step-nav button:hover:not(:disabled) {
    background: #355a46;
    border-color: #4a855f;
  }
  .step-nav button:disabled {
    background: #333;
    color: #777;
    border-color: #555;
  }
}

.placeholder-text {
  text-align: center;
  margin-top: 2rem;
  font-style: italic;
  color: #555; /* Slightly darker for better readability */
}

@media (prefers-color-scheme: dark) {
  .placeholder-text {
    color: #aaa;
  }
}
</style>
