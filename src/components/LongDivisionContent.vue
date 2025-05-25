<script setup lang="ts">
import { defineProps } from "vue";
import { motion } from "motion-v";
import type {
  GridCell,
  LongDivisionStep,
} from "../composables/useLongDivision";
import LongDivisionGrid from "./LongDivisionGrid.vue";
import LongDivisionInstructions from "./LongDivisionInstructions.vue";

interface Props {
  gridCells: GridCell[];
  rows: number;
  cols: number;
  currentSubStep: number;
  showEntranceAnimations: boolean;
  visibleInstructions: LongDivisionStep[];
  currentStep: number;
}

defineProps<Props>();
</script>

<template>
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
        :gridCells="gridCells"
        :rows="rows"
        :cols="cols"
        :currentSubStep="currentSubStep"
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
</template>

<style scoped>
.main-content-area {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  gap: 1.5rem;
  width: 100%;
  max-width: 1200px;
  margin-bottom: 1.5rem;
}

.division-grid {
  flex-grow: 1;
}

.division-instructions {
  flex-grow: 1;
  min-width: 300px;
}

@media (max-width: 768px) {
  .main-content-area {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .division-grid,
  .division-instructions {
    width: 100%;
    max-width: 100%;
    min-width: auto;
    flex-grow: 0;
  }
}
</style>
