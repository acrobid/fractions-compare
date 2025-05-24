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
      <!-- New structure for division input -->
      <div class="division-input-wrapper">
        <input type="number" v-model.number="divisor" placeholder="Divisor" class="divisor-styled-input" />
        <span class="division-bracket-arm"></span>
        <input type="number" v-model.number="dividend" placeholder="Dividend" class="dividend-styled-input" />
      </div>
      <button @click="generate">Visualize</button>
    </div>

    <div v-if="steps.length > 0" class="division-area-container">
      <div class="main-content-area">
        <LongDivisionGrid
          v-if="gridCells.length"
          :gridCells="displayCells"
          :rows="rows"
          :cols="cols"
          :currentSubStep="currentSubStepForGrid"
          class="division-grid"
        />
        <LongDivisionInstructions
          :steps="visibleInstructions"
          :currentStep="currentStep"
          class="division-instructions"
        />
      </div>
      <div class="step-nav">
        <button @click="prevStep" :disabled="currentStep === 0">
          Previous
        </button>
        <span>Step {{ currentStep + 1 }} / {{ steps.length }}</span>
        <button @click="nextStep" :disabled="currentStep >= steps.length - 1">
          Next
        </button>
      </div>
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

.division-area-container {
  display: flex;
  flex-direction: column; /* Stack grid/instructions area above nav */
  align-items: center; /* Center the content horizontally */
}

.main-content-area {
  display: flex;
  flex-direction: row; /* Grid and Instructions side-by-side */
  justify-content: center; /* Center them if they don't fill the space */
  align-items: flex-start; /* Align to the top */
  gap: 1.5rem; /* Space between grid and instructions */
  width: 100%; /* Allow it to take full width for responsiveness */
  max-width: 1200px; /* Max width for the content area */
  margin-bottom: 1.5rem; /* Space before step navigation */
}

.division-grid {
  flex-grow: 1; /* Allow grid to take available space */
  /* max-width: 60%; /* Optional: constrain grid width */
}

.division-instructions {
  flex-grow: 1; /* Allow instructions to take available space */
  /* max-width: 40%; /* Optional: constrain instructions width */
  min-width: 300px; /* Minimum width for instructions */
}

.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem; /* Increased gap to accommodate new input style */
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f0f2f5;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* Remove old label styles as they are no longer used */
/*
.controls label {
  font-size: 1em;
  color: #333;
}
*/

/* Remove or adapt old general input styles if they conflict */
/*
.controls input[type="number"] {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1em;
  width: 80px;
  text-align: right;
}
*/

.division-input-wrapper {
  display: flex;
  align-items: center; /* Vertically align items */
  background-color: #fff;
  padding: 0.3rem 0.5rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
}

.divisor-styled-input,
.dividend-styled-input {
  border: none;
  padding: 0.6rem 0.4rem; /* Adjusted padding */
  font-size: 1.2em; /* Larger font size */
  text-align: right;
  background-color: transparent;
  color: #333;
  outline: none; /* Remove focus outline, rely on wrapper or other cues */
}

.divisor-styled-input {
  width: 100px; /* Adjusted width */
}

.dividend-styled-input {
  width: 140px; /* Adjusted width */
  border-top: 2px solid #555; /* Vinculum (bar over dividend) */
  margin-left: -2px; /* Pull closer to the arm if arm has width */
  padding-top: 0.4rem; /* Adjust to align text nicely under the bar */
  border-radius: 0 4px 4px 0; /* Optional: round outer corners */
}

.division-bracket-arm {
  display: inline-block;
  width: 2px;
  background-color: #555;
  height: 2.2em; /* Approximate height, adjust as needed */
  margin: 0 0.2rem; /* Space around the arm */
  align-self: center; /* Ensure it's centered with inputs */
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
  /* Remove old label styles for dark mode */
  /*
  .controls label {
    color: rgba(255, 255, 255, 0.87);
  }
  */

  .division-input-wrapper {
    background-color: #3a3a3a; /* Darker background for the input group */
    border: 1px solid #555;
  }

  .divisor-styled-input,
  .dividend-styled-input {
    color: rgba(255, 255, 255, 0.87);
    background-color: transparent;
  }

  .dividend-styled-input {
    border-top: 2px solid #bbb; /* Lighter bar for dark mode */
  }

  .division-bracket-arm {
    background-color: #bbb; /* Lighter arm for dark mode */
  }
  
  /* Remove or adapt old general input styles for dark mode */
  /*
  .controls input[type="number"] {
    background-color: #333;
    color: rgba(255, 255, 255, 0.87);
    border: 1px solid #555;
  }
  */

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
