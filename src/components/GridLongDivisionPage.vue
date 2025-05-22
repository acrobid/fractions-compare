<template>
  <div class="long-division-page">
    <div class="page-header">
      <h1>Long Division Explorer</h1>
      <p class="subtitle">
        Explore the long division algorithm step by step with this interactive
        tool
      </p>
    </div>

    <div class="controls-section">
      <div class="input-container">
        <NumberInput
          label="Dividend"
          v-model="dividendInput"
          :min="0"
          :max="9999999"
          id="dividend-input"
          :disabled="problemStarted"
        />
        <div class="division-symbol">÷</div>
        <NumberInput
          label="Divisor"
          v-model="divisorInput"
          :min="1"
          :max="9999"
          id="divisor-input"
          :disabled="problemStarted"
        />
      </div>

      <div class="button-container">
        <button
          v-if="!problemStarted"
          @click="startDivision"
          class="start-button"
          :disabled="!canStart"
        >
          Start Division
        </button>
        <div v-else class="step-controls">
          <button @click="resetDivision" class="reset-button">
            <RefreshIcon />
            Reset
          </button>
          <button @click="nextStep" class="next-button" :disabled="isComplete">
            <span v-if="divisionState?.isQuestionStep">Show Answer</span>
            <span v-else>Next Step</span>
            <ChevronRightIcon />
          </button>
        </div>
      </div>
    </div>

    <!-- Explanation area -->
    <div v-if="problemStarted" class="explanation-container">
      <StepExplanation :explanation="divisionState?.currentExplanation || ''" />
    </div>

    <!-- Grid Division Display -->
    <div class="grid-display-container">
      <GridLongDivisionDisplay
        :state="
          divisionState || { cells: [], dimensions: { columns: 0, rows: 0 } }
        "
        :cell-width="40"
        :cell-height="40"
        :vertical-bar-column="2"
        :divisor-column-width="60"
        :show-subtraction-lines="divisionState?.showSubtractionLines || false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useGridDivision } from "../composables/useGridDivision";
import GridLongDivisionDisplay from "./GridLongDivisionDisplay.vue";
import NumberInput from "./common/NumberInput.vue";
import StepExplanation from "./long-division/StepExplanation.vue";
import ChevronRightIcon from "./long-division/icons/ChevronRightIcon.vue";
import RefreshIcon from "./long-division/icons/RefreshIcon.vue";

// Initialize the division logic
const {
  state: divisionState,
  setInputs,
  startProblem,
  nextStep: goToNextStep,
  resetProblem,
} = useGridDivision();

// Create a computed property to access the state correctly
const isComplete = computed(() => {
  return divisionState.value?.isComplete || false;
});

// UI state
const dividendInput = ref<number | null>(null);
const divisorInput = ref<number | null>(null);
const problemStarted = ref(false);

// Computed properties
const canStart = computed(() => {
  return (
    dividendInput.value !== null &&
    divisorInput.value !== null &&
    divisorInput.value > 0
  );
});

// Methods
const startDivision = () => {
  if (dividendInput.value !== null && divisorInput.value !== null) {
    setInputs(dividendInput.value, divisorInput.value);
    startProblem();
    problemStarted.value = true;
  }
};

const nextStep = () => {
  if (!isComplete.value) {
    goToNextStep();
  }
};

const resetDivision = () => {
  // First indicate that the problem is no longer started
  problemStarted.value = false;

  // Clear inputs
  dividendInput.value = null;
  divisorInput.value = null;

  // Reset the problem state with a slight delay to ensure Vue updates the UI
  setTimeout(() => {
    resetProblem();
  }, 50);
};
</script>

<style scoped>
.long-division-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

h1 {
  font-size: 2.5rem;
  color: var(--heading-color, #333);
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-secondary, #666);
  font-size: 1.1rem;
}

.controls-section {
  margin-bottom: 2rem;
}

.input-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.division-symbol {
  font-size: 2rem;
  font-weight: bold;
  margin: 0 1rem;
  color: var(--text-color, #333);
  padding-top: 1.5rem;
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.start-button,
.next-button,
.reset-button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.start-button {
  background-color: var(--primary-color, #4caf50);
  color: white;
  border: none;
  font-size: 1.1rem;
}

.start-button:hover {
  background-color: var(--primary-hover, #45a049);
}

.start-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.step-controls {
  display: flex;
  gap: 1rem;
}

.next-button {
  background-color: var(--primary-color, #4caf50);
  color: white;
  border: none;
}

.next-button:hover {
  background-color: var(--primary-hover, #45a049);
}

.next-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.reset-button {
  background-color: transparent;
  color: var(--text-color, #333);
  border: 1px solid var(--border-color, #ddd);
}

.reset-button:hover {
  background-color: var(--bg-hover, #f5f5f5);
}

.explanation-container {
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: var(--explanation-bg, #f8f9fa);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.grid-display-container {
  width: 100%;
  overflow-x: auto;
}

@media (prefers-color-scheme: dark) {
  h1 {
    color: var(--heading-color-dark, #eee);
  }

  .subtitle {
    color: var(--text-secondary-dark, #aaa);
  }

  .division-symbol {
    color: var(--text-color-dark, #eee);
  }

  .reset-button {
    color: var(--text-color-dark, #eee);
    border-color: var(--border-color-dark, #444);
  }

  .reset-button:hover {
    background-color: var(--bg-hover-dark, #333);
  }

  .explanation-container {
    background-color: var(--explanation-bg-dark, #2a2a2a);
  }
}
</style>
