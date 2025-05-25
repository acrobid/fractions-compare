<script setup lang="ts">
import { computed, ref, watch, nextTick } from "vue";
import { useLongDivision } from "../composables/useLongDivision";
import { useFlyingDigitsAnimation } from "../composables/useFlyingDigitsAnimation";
import type { GridCell } from "../composables/useLongDivision";
import LongDivisionControls from "./LongDivisionControls.vue";
import LongDivisionContent from "./LongDivisionContent.vue";
import StepNavigation from "./StepNavigation.vue";
import FlyingDigitsAnimation from "./FlyingDigitsAnimation.vue";
import FinalAnswerCelebration from "./FinalAnswerCelebration.vue";
import { motion } from "motion-v";

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

const { flyingDigits, isAnimating, startAnimation } =
  useFlyingDigitsAnimation();

// Animation state
const showEntranceAnimations = ref(false);

const handleVisualize = async () => {
  await startAnimation(dividend, divisor, generate, showEntranceAnimations);
};

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

// Check if division is complete (on the last step)
const isDivisionComplete = computed(() => {
  return steps.value.length > 0 && currentStep.value === steps.value.length - 1;
});

// Calculate final answer values
const finalQuotient = computed(() => {
  if (!isDivisionComplete.value) return "";

  // Extract quotient digits from grid cells (row 1)
  const quotientCells = gridCells.value
    .filter(
      (cell) =>
        cell.gridRow === 1 &&
        cell.content &&
        cell.content !== "" &&
        cell.type === "digit",
    )
    .sort((a, b) => a.gridColumn - b.gridColumn);

  return quotientCells.map((cell) => cell.content).join("");
});

const finalRemainder = computed(() => {
  if (!isDivisionComplete.value) return "";

  // Find the last remainder cells (highest row number with remainder data)
  const lastRemainderRow = Math.max(
    ...gridCells.value
      .filter((cell) => cell.id.startsWith("r-") && cell.content !== "")
      .map((cell) => cell.gridRow),
  );

  if (lastRemainderRow === -Infinity) return "0";

  const remainderCells = gridCells.value
    .filter(
      (cell) =>
        cell.gridRow === lastRemainderRow &&
        cell.content &&
        cell.content !== "" &&
        cell.type === "digit",
    )
    .sort((a, b) => a.gridColumn - b.gridColumn);

  const remainderValue = remainderCells.map((cell) => cell.content).join("");
  return remainderValue === "0" || remainderValue === "00"
    ? ""
    : remainderValue;
});

// Auto-scroll to celebration when division is complete
watch(isDivisionComplete, async (isComplete) => {
  if (isComplete) {
    // Wait for the celebration component to be rendered
    await nextTick();

    // Short delay to let the container appear, then scroll
    setTimeout(() => {
      const celebrationElement = document.querySelector(
        ".final-answer-celebration",
      );
      if (celebrationElement) {
        celebrationElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }
    }, 400); // Reduced delay so scroll happens before answer animation
  }
});
</script>

<template>
  <div class="long-division-page-container">
    <motion.h2
      :initial="{ opacity: 0, y: -30, scale: 0.8 }"
      :animate="{ opacity: 1, y: 0, scale: 1 }"
      :transition="{
        duration: 0.8,
        type: 'spring',
        stiffness: 120,
        damping: 15,
        delay: 0.1,
      }"
      :while-hover="{
        scale: 1.05,
        rotate: 1,
        filter: 'hue-rotate(15deg) brightness(1.1)',
      }"
    >
      Long Division Explorer
    </motion.h2>
    <LongDivisionControls
      :dividend="Number(dividend)"
      :divisor="Number(divisor)"
      :is-animating="isAnimating"
      @update:dividend="dividend = String($event)"
      @update:divisor="divisor = String($event)"
      @visualize="handleVisualize"
    />

    <!-- Flying Digits Animation Layer -->
    <FlyingDigitsAnimation :flying-digits="flyingDigits" />

    <StepNavigation
      :current-step="currentStep"
      :total-steps="steps.length"
      @prev-step="prevStep"
      @next-step="nextStep"
    />
    <div v-if="steps.length > 0" class="division-area-container">
      <LongDivisionContent
        :grid-cells="displayCells"
        :rows="rows"
        :cols="cols"
        :current-sub-step="currentSubStepForGrid"
        :show-entrance-animations="showEntranceAnimations"
        :visible-instructions="visibleInstructions"
        :current-step="currentStep"
      />

      <!-- Final Answer Celebration -->
      <FinalAnswerCelebration
        :isVisible="isDivisionComplete"
        :answer="finalQuotient"
        :remainder="finalRemainder"
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

<style scoped>
.long-division-page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
}

.long-division-page-container h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #42b883;
  font-size: 1.8em;
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .long-division-page-container {
    max-width: 100%;
    padding: 0.5rem;
  }

  .long-division-page-container h2 {
    font-size: 1.5em;
    margin-bottom: 1rem;
  }
}

@media (max-width: 480px) {
  .long-division-page-container h2 {
    font-size: 1.3em;
    margin-bottom: 0.75rem;
  }
}

.division-area-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.placeholder-text {
  text-align: center;
  margin-top: 2rem;
  font-style: italic;
  color: #555;
}

@media (prefers-color-scheme: dark) {
  .placeholder-text {
    color: #aaa;
  }
}
</style>
