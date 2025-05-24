<script setup lang="ts">
import { computed, ref, watch, nextTick } from "vue";
import { useLongDivision } from "../composables/useLongDivision";
import type { GridCell } from "../composables/useLongDivision";
import LongDivisionGrid from "./LongDivisionGrid.vue";
import LongDivisionInstructions from "./LongDivisionInstructions.vue";
import DivisionInput from "./DivisionInput.vue"; // Import the new component
import FinalAnswerCelebration from "./FinalAnswerCelebration.vue";
import { motion, AnimatePresence } from "motion-v";

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

// Animation state
const isAnimating = ref(false);
const showEntranceAnimations = ref(false);
const flyingDigits = ref<
  Array<{
    id: string;
    digit: string;
    startX: number;
    startY: number;
    targetX: number;
    targetY: number;
  }>
>([]);
// Enhanced generate function with animation
const handleVisualize = async () => {
  if (isAnimating.value) return;

  isAnimating.value = true;

  // Create flying digit animations
  const inputContainer = document.querySelector(".division-input-container");
  const gridContainer = document.querySelector(".division-grid");

  if (inputContainer && gridContainer) {
    const inputRect = inputContainer.getBoundingClientRect();
    const gridRect = gridContainer.getBoundingClientRect();

    // Create flying digits for dividend and divisor
    const newFlyingDigits = [];

    // Add divisor digit(s)
    const divisorStr = String(divisor.value);
    for (let i = 0; i < divisorStr.length; i++) {
      newFlyingDigits.push({
        id: `flying-divisor-${i}`,
        digit: divisorStr[i],
        startX: inputRect.left + 60, // Approximate divisor input position
        startY: inputRect.top + 20,
        targetX: gridRect.left + 50 + Math.random() * 100, // Random spread in grid area
        targetY: gridRect.top + 50 + Math.random() * 100,
      });
    }

    // Add dividend digit(s)
    const dividendStr = String(dividend.value);
    for (let i = 0; i < dividendStr.length; i++) {
      newFlyingDigits.push({
        id: `flying-dividend-${i}`,
        digit: dividendStr[i],
        startX: inputRect.left + 240, // Approximate dividend input position
        startY: inputRect.top + 20,
        targetX: gridRect.left + 100 + Math.random() * 150, // Random spread in grid area
        targetY: gridRect.top + 80 + Math.random() * 120,
      });
    }

    flyingDigits.value = newFlyingDigits;

    // Trigger entrance animations simultaneously with flying digits
    showEntranceAnimations.value = true;
    generate();

    // Wait for both animations to complete, then clean up
    await new Promise((resolve) => setTimeout(resolve, 1000));
    flyingDigits.value = [];

    // Reset entrance animation flag after the animations complete
    setTimeout(() => {
      showEntranceAnimations.value = false;
    }, 500); // Short delay to let entrance animations finish
  } else {
    // Fallback if elements not found
    generate();
  }

  isAnimating.value = false;
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
    <motion.div
      class="controls"
      :initial="{ opacity: 0, y: 20, scale: 0.95 }"
      :animate="{ opacity: 1, y: 0, scale: 1 }"
      :transition="{
        duration: 0.6,
        type: 'spring',
        stiffness: 150,
        damping: 18,
        delay: 0.3,
      }"
    >
      <!-- Use the new DivisionInput component -->
      <DivisionInput
        :dividend="Number(dividend)"
        :divisor="Number(divisor)"
        @update:dividend="dividend = $event"
        @update:divisor="divisor = $event"
      />
      <motion.button
        @click="handleVisualize"
        :disabled="isAnimating"
        :while-hover="{ scale: 1.05 }"
        :while-press="{ scale: 0.95 }"
        class="visualize-button"
        :class="{ animating: isAnimating }"
      >
        {{ isAnimating ? "Go!" : "Visualize" }}
      </motion.button>
    </motion.div>

    <!-- Flying Digits Animation Layer -->
    <AnimatePresence>
      <div v-if="flyingDigits.length > 0" class="flying-digits-container">
        <motion.div
          v-for="flyingDigit in flyingDigits"
          :key="flyingDigit.id"
          class="flying-digit"
          :initial="{
            x: flyingDigit.startX,
            y: flyingDigit.startY,
            opacity: 1,
            scale: 1,
            rotate: 0,
            filter: 'hue-rotate(0deg) brightness(1) blur(0px)',
          }"
          :animate="{
            x: flyingDigit.targetX,
            y: flyingDigit.targetY,
            opacity: 0,
            scale: 0.3,
            rotate: 720,
            filter: 'hue-rotate(180deg) brightness(1.5) blur(1px)',
          }"
          :exit="{
            opacity: 0,
            scale: 0,
            rotate: 1080,
            filter: 'blur(5px)',
          }"
          :transition="{
            duration: 0.8,
            ease: [0.34, 1.56, 0.64, 1],
            rotate: { duration: 0.8, ease: 'easeOut' },
            filter: { duration: 0.6, ease: 'easeInOut' },
          }"
        >
          {{ flyingDigit.digit }}
        </motion.div>
      </div>
    </AnimatePresence>

    <div class="step-nav">
      <motion.button
        @click="prevStep"
        :disabled="currentStep === 0"
        :while-hover="{ scale: 1.1, rotate: -2, filter: 'brightness(1.1)' }"
        :while-tap="{ scale: 0.95, rotate: 2 }"
        :transition="{ type: 'spring', stiffness: 400, damping: 15 }"
      >
        Previous
      </motion.button>
      <motion.span
        :key="currentStep"
        :initial="{ scale: 0.8, opacity: 0, y: -10 }"
        :animate="{ scale: 1, opacity: 1, y: 0 }"
        :transition="{ type: 'spring', stiffness: 300, damping: 20 }"
      >
        Step {{ currentStep + 1 }} / {{ steps.length }}
      </motion.span>
      <motion.button
        @click="nextStep"
        :disabled="currentStep >= steps.length - 1"
        :while-hover="{ scale: 1.1, rotate: 2, filter: 'brightness(1.1)' }"
        :while-tap="{ scale: 0.95, rotate: -2 }"
        :transition="{ type: 'spring', stiffness: 400, damping: 15 }"
      >
        Next
      </motion.button>
    </div>
    <div v-if="steps.length > 0" class="division-area-container">
      <div class="main-content-area">
        <motion.div
          v-if="gridCells.length"
          class="grid-wrapper"
          :initial="{
            opacity: 0,
            scale: 0.6,
            y: 80,
            rotate: -5,
            filter: 'blur(3px) brightness(0.8)',
          }"
          :animate="{
            opacity: 1,
            scale: 1,
            y: 0,
            rotate: 0,
            filter: 'blur(0px) brightness(1)',
          }"
          :transition="{
            duration: 1.2,
            type: 'spring',
            stiffness: 80,
            damping: 20,
            delay: 0.2,
            filter: { duration: 0.8, ease: 'easeOut' },
          }"
        >
          <LongDivisionGrid
            :gridCells="displayCells"
            :rows="rows"
            :cols="cols"
            :currentSubStep="currentSubStepForGrid"
            :isInitialEntrance="showEntranceAnimations"
            class="division-grid"
          />
        </motion.div>
        <motion.div
          class="instructions-wrapper"
          :initial="{
            opacity: 0,
            x: 80,
            scale: 0.9,
            rotate: 3,
            filter: 'hue-rotate(45deg) brightness(0.7)',
          }"
          :animate="{
            opacity: 1,
            x: 0,
            scale: 1,
            rotate: 0,
            filter: 'hue-rotate(0deg) brightness(1)',
          }"
          :transition="{
            duration: 1.0,
            type: 'spring',
            stiffness: 120,
            damping: 18,
            delay: 0.6,
            filter: { duration: 0.7, ease: 'easeInOut' },
          }"
        >
          <LongDivisionInstructions
            :steps="visibleInstructions"
            :currentStep="currentStep"
            class="division-instructions"
          />
        </motion.div>
      </div>

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

/* Styles for .division-input-wrapper, .divisor-styled-input, 
   .dividend-styled-input, and .division-bracket-arm 
   are now in DivisionInput.vue and can be removed from here. */

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

.visualize-button {
  position: relative;
  overflow: hidden;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #42b883, #36a471, #2d8a5f);
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
  box-shadow: 0 4px 15px rgba(66, 184, 131, 0.3);
  border-radius: 8px;
}

.visualize-button.animating {
  background: linear-gradient(135deg, #ff6b6b, #ffa500, #ff1493);
  background-size: 200% 200%;
  animation: magicGradient 1s ease infinite;
  box-shadow: 0 0 20px rgba(255, 107, 107, 0.5), 0 0 40px rgba(255, 165, 0, 0.3);
}

.visualize-button:disabled {
  cursor: not-allowed;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes gradientFlow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes magicPulse {
  0% {
    text-shadow: 0 0 5px rgba(100, 255, 218, 1),
      0 0 15px rgba(100, 255, 218, 0.8), 0 0 25px rgba(100, 255, 218, 0.6);
  }
  50% {
    text-shadow: 0 0 10px rgba(100, 255, 218, 1),
      0 0 25px rgba(100, 255, 218, 0.9), 0 0 40px rgba(100, 255, 218, 0.7),
      0 0 55px rgba(100, 255, 218, 0.5);
  }
  100% {
    text-shadow: 0 0 5px rgba(100, 255, 218, 1),
      0 0 15px rgba(100, 255, 218, 0.8), 0 0 25px rgba(100, 255, 218, 0.6);
  }
}

/* Flying Digits Styles */
.flying-digits-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 1000;
}

.flying-digit {
  position: absolute;
  font-size: 32px;
  font-weight: bold;
  color: #42b883;
  text-shadow: 0 0 5px rgba(66, 184, 131, 1), 0 0 15px rgba(66, 184, 131, 0.8),
    0 0 25px rgba(66, 184, 131, 0.6), 0 0 35px rgba(66, 184, 131, 0.4);
  font-family: "Comic Sans MS", "Comic Sans", "Chalkboard SE", "Courier New",
    monospace;
  pointer-events: none;
  will-change: transform, opacity, filter;
  z-index: 1001;
  background: linear-gradient(45deg, #42b883, #36a471, #64ffda);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% 200%;
  animation: gradientFlow 2s ease-in-out infinite;
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

  /* Dark mode styles for .division-input-wrapper, .divisor-styled-input, 
     .dividend-styled-input, and .division-bracket-arm 
     are now in DivisionInput.vue and can be removed from here. */

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

  .visualize-button {
    background: linear-gradient(135deg, #42b883, #36a471, #2d8a5f);
    box-shadow: 0 4px 15px rgba(66, 184, 131, 0.4);
  }

  .visualize-button.animating {
    background: linear-gradient(135deg, #ff6b6b, #ffa500, #ff1493);
    box-shadow: 0 0 25px rgba(255, 107, 107, 0.6),
      0 0 45px rgba(255, 165, 0, 0.4);
  }

  .flying-digit {
    background: linear-gradient(45deg, #64ffda, #42b883, #00e676, #1de9b6);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-size: 200% 200%;
    animation: gradientFlow 2s ease-in-out infinite,
      magicPulse 1.5s ease-in-out infinite;
    text-shadow: none; /* Remove text-shadow since we're using background-clip */
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
  background: linear-gradient(
    135deg,
    #e6f4ea,
    #d1ecd5
  ); /* Gradient background */
  color: #2a663e; /* Darker green text */
  border: 2px solid #a5d6b8; /* Greenish border */
  border-radius: 12px; /* More rounded for playfulness */
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(165, 214, 184, 0.3);
}

.step-nav button::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  transition: left 0.5s;
}

.step-nav button:hover:not(:disabled)::before {
  left: 100%;
}

.step-nav button:hover:not(:disabled) {
  background: linear-gradient(135deg, #d1ecd5, #b8e6c1);
  border-color: #8ccaa1;
  box-shadow: 0 4px 15px rgba(165, 214, 184, 0.5);
  transform: translateY(-1px);
}

.step-nav button:disabled {
  background: #e0e0e0;
  color: #888;
  border-color: #ccc;
  cursor: not-allowed;
}

@media (prefers-color-scheme: dark) {
  .step-nav button {
    background: linear-gradient(
      135deg,
      #2c4c3b,
      #355a46
    ); /* Dark gradient background */
    color: #b0e6c2; /* Lighter green text */
    border-color: #3e7050;
    box-shadow: 0 2px 8px rgba(62, 112, 80, 0.4);
  }
  .step-nav button::before {
    background: linear-gradient(
      90deg,
      transparent,
      rgba(176, 230, 194, 0.2),
      transparent
    );
  }
  .step-nav button:hover:not(:disabled) {
    background: linear-gradient(135deg, #355a46, #4a855f);
    border-color: #4a855f;
    box-shadow: 0 4px 15px rgba(62, 112, 80, 0.6);
  }
  .step-nav button:disabled {
    background: linear-gradient(135deg, #333, #2a2a2a);
    color: #777;
    border-color: #555;
    box-shadow: none;
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
