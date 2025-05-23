<template>
  <div
    class="math-grid"
    :style="{
      gridTemplateColumns: `repeat(${cols}, 48px)`,
      gridTemplateRows: `repeat(${rows}, 48px)`,
    }"
  >
    <div
      v-for="(cell, idx) in gridCells"
      :key="cell.id || idx"
      class="grid-cell"
      :class="[
        `cell-type-${cell.type}`,
        cell.highlight ? `cell-hl-${cell.highlight}` : '',
        cell.borderTop ? 'bracket-horizontal' : '',
        cell.borderLeft ? 'bracket-vertical' : '',
        cell.borderBottom ? 'subtraction-line' : '',
        cell.isGraphPaper ? 'graph-paper' : '',
      ]"
      :style="{ gridRow: cell.gridRow, gridColumn: cell.gridColumn }"
    >
      <!-- Render dividend cells (ID starts with 'd-') without animation and always visible if content exists -->
      <span
        v-if="
          cell.id.startsWith('d-') && cell.content !== '' // Changed: No longer uses shouldDisplayCell for dividend
        "
      >
        {{ cell.content }}
      </span>
      <!-- Render other cells with animation -->
      <Motion
        v-else-if="shouldDisplayCell(cell) && cell.content !== ''"
        :key="cell.id"
        :initial="motionInitial"
        :animate="motionAnimate"
        :transition="motionTransition"
      >
        <span>{{ cell.content }}</span>
      </Motion>
      <span
        v-else-if="
          shouldDisplayCell(cell) &&
          cell.content === '' &&
          cell.type !== 'space'
        "
      >
        &nbsp;
      </span>
      <!-- For type 'space', or when shouldDisplayCell is false for empty content, render nothing -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, toRefs } from "vue";
import type { GridCell } from "../composables/useLongDivision";
import { Motion } from "motion-v"; // Import Motion component (Presence removed)

const motionInitial = { opacity: 0, y: 10 };
const motionAnimate = { opacity: 1, y: 0 };
const motionTransition = {
  duration: 0.3,
  type: "spring",
  stiffness: 250,
  damping: 10,
};

const props = defineProps<{
  gridCells: GridCell[];
  rows: number;
  cols: number;
  currentSubStep: number;
}>();

const { currentSubStep } = toRefs(props);

const shouldDisplayCell = (cell: GridCell): boolean => {
  if (cell.revealAtSubStep === undefined) {
    return true;
  }
  return cell.revealAtSubStep <= currentSubStep.value;
};
</script>

<style scoped src="./long-division-styles.css"></style>
