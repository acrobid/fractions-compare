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
      <!-- Case 1: Dividend cell that is a source of bring-down and currently animating (hide it) -->
      <span
        v-if="cell.id.startsWith('d-') && isBringDownSourceAndAnimating(cell)"
      >
        &nbsp;
      </span>

      <!-- Case 2: Dividend cell, not animating as source, always visible if content (no animation wrapper) -->
      <span v-else-if="cell.id.startsWith('d-') && cell.content !== ''">
        {{ cell.content }}
      </span>

      <!-- Case 3: Other cells that should display and have content (animated: appear or bring-down) -->
      <Motion
        v-else-if="shouldDisplayCell(cell) && cell.content !== ''"
        :key="cell.id"
        :initial="getAnimationInitialState(cell)"
        :animate="motionAnimateTarget"
        :transition="motionTransition"
      >
        <span>{{ cell.content }}</span>
      </Motion>

      <!-- Case 4: Empty cells that should be displayed (e.g. to maintain grid structure, no animation) -->
      <span
        v-else-if="
          shouldDisplayCell(cell) &&
          cell.content === '' &&
          cell.type !== 'space'
        "
      >
        &nbsp;
      </span>

      <!-- Case 5: Space cells or cells that shouldn't be displayed yet (render nothing) -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, toRefs } from "vue";
import type { GridCell } from "../composables/useLongDivision";
import { Motion } from "motion-v";

const motionInitialAppear = { opacity: 0, y: 10 };
const motionAnimateTarget = { opacity: 1, x: 0, y: 0 }; // Universal target for all animations
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

const { gridCells, currentSubStep } = toRefs(props);

const getCellById = (id: string): GridCell | undefined => {
  return gridCells.value.find((c) => c.id === id);
};

// Determines if a dividend cell is the source of a bring-down animation that is currently active
const isBringDownSourceAndAnimating = (cell: GridCell): boolean => {
  return !!(
    cell.hideIfTargetIsAnimatingAtSubStep &&
    cell.hideIfTargetIsAnimatingAtSubStep.subStep === currentSubStep.value
  );
};

const getAnimationInitialState = (cell: GridCell) => {
  // This function is called when the Motion component for 'cell' is rendered.
  // It determines the starting state for the animation.

  // If this cell is a target of a bring-down animation:
  if (cell.animateFromCellId) {
    const sourceCell = getCellById(cell.animateFromCellId);
    if (sourceCell) {
      const effectiveCellDimension = 49; // 48px cell size + 1px gap
      const deltaX =
        (sourceCell.gridColumn - cell.gridColumn) * effectiveCellDimension;
      const deltaY =
        (sourceCell.gridRow - cell.gridRow) * effectiveCellDimension;
      return { opacity: 0, x: deltaX, y: deltaY }; // Start at source, invisible, then move and fade in
    }
  }
  // Default initial state for standard "appear" animations:
  return motionInitialAppear; // { opacity: 0, y: 10 }
};

const shouldDisplayCell = (cell: GridCell): boolean => {
  // Dividend cells are handled separately for initial visibility (always on if content).
  // Their hiding for animation is handled by `isBringDownSourceAndAnimating`.
  if (cell.id.startsWith("d-")) {
    // For the Motion component, if it's a dividend cell that somehow gets here (it shouldn't due to template structure),
    // its display is dictated by its revealAtSubStep for any *animated* appearance if that were the case.
    // However, dividend cells are not wrapped in Motion unless they are targets of an animation (which they aren't).
    // This path in shouldDisplayCell for a 'd-' cell is unlikely to be hit by a Motion component.
    // Let's assume standard reveal logic if it were to be animated.
    if (cell.revealAtSubStep === undefined) return true;
    return cell.revealAtSubStep <= currentSubStep.value;
  }

  // For non-dividend cells:
  if (cell.revealAtSubStep === undefined) {
    return true; // Always display if no specific reveal step
  }
  return cell.revealAtSubStep <= currentSubStep.value;
};
</script>

<style scoped src="./long-division-styles.css"></style>
