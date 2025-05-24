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

      <!-- Case 2: Dividend cell with entrance animation if it's the initial entrance -->
      <Motion
        v-else-if="
          cell.id.startsWith('d-') && cell.content !== '' && isInitialEntrance
        "
        :key="`entranced-${cell.id}`"
        :initial="{
          opacity: 0,
          scale: 0.3,
          y: -40,
          rotate: -25,
          filter: 'hue-rotate(120deg) brightness(1.8) blur(2px)',
        }"
        :animate="{
          opacity: 1,
          scale: 1,
          y: 0,
          rotate: 0,
          filter: 'hue-rotate(0deg) brightness(1) blur(0px)',
        }"
        :transition="{
          duration: 0.8,
          type: 'spring',
          stiffness: 150,
          damping: 18,
          delay: parseInt(cell.id.split('-')[1]) * 0.12 + 0.3, // Stagger based on digit index
          filter: { duration: 0.6, ease: 'easeOut' },
        }"
      >
        <span>{{ cell.content }}</span>
      </Motion>

      <!-- Case 3: Divisor cell with entrance animation if it's the initial entrance -->
      <Motion
        v-else-if="
          cell.id === 'divisor' && cell.content !== '' && isInitialEntrance
        "
        :key="`entrance-${cell.id}`"
        :initial="{
          opacity: 0,
          scale: 0.2,
          x: -60,
          rotate: 30,
          filter: 'hue-rotate(240deg) brightness(2.2) blur(3px)',
        }"
        :animate="{
          opacity: 1,
          scale: 1,
          x: 0,
          rotate: 0,
          filter: 'hue-rotate(0deg) brightness(1) blur(0px)',
        }"
        :transition="{
          duration: 1.0,
          type: 'spring',
          stiffness: 120,
          damping: 20,
          delay: 0.1, // Divisor appears first
          filter: { duration: 0.7, ease: 'easeInOut' },
        }"
      >
        <span>{{ cell.content }}</span>
      </Motion>

      <!-- Case 4: Regular dividend/divisor cells without entrance animation -->
      <span
        v-else-if="
          (cell.id.startsWith('d-') || cell.id === 'divisor') &&
          cell.content !== '' &&
          !isInitialEntrance
        "
      >
        {{ cell.content }}
      </span>

      <!-- Case 5: Other cells that should display and have content (animated: appear or bring-down) -->
      <!-- Exclude dividend/divisor cells when isInitialEntrance is true to avoid conflicts -->
      <Motion
        v-else-if="
          shouldDisplayCell(cell) &&
          cell.content !== '' &&
          !(
            isInitialEntrance &&
            (cell.id.startsWith('d-') || cell.id === 'divisor')
          )
        "
        :key="`animation-${cell.id}`"
        :initial="getAnimationInitialState(cell)"
        :animate="{
          ...motionAnimateTarget,
        }"
        :transition="{
          ...motionTransition,
          duration: cell.animateFromCellId ? 0.8 : motionTransition.duration,
          type: cell.animateFromCellId ? 'spring' : motionTransition.type,
          stiffness: cell.animateFromCellId ? 200 : motionTransition.stiffness,
          damping: cell.animateFromCellId ? 20 : motionTransition.damping,
        }"
      >
        <span>{{ cell.content }}</span>
      </Motion>

      <!-- Case 6: Empty cells that should be displayed (e.g. to maintain grid structure, no animation) -->
      <span
        v-else-if="
          shouldDisplayCell(cell) &&
          cell.content === '' &&
          cell.type !== 'space'
        "
      >
        &nbsp;
      </span>

      <!-- Case 7: Space cells or cells that shouldn't be displayed yet (render nothing) -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, toRefs } from "vue";
import type { GridCell } from "../composables/useLongDivision";
import { Motion } from "motion-v";

const motionInitialAppear = {
  opacity: 0,
  y: 25,
  scale: 0.7,
  rotate: -12,
  filter: "hue-rotate(60deg) brightness(0.8) blur(1px)",
};
const motionAnimateTarget = {
  opacity: 1,
  x: 0,
  y: 0,
  scale: 1,
  rotate: 0,
  filter: "hue-rotate(0deg) brightness(1) blur(0px)",
}; // Universal target for all animations
const motionTransition = {
  duration: 0.7,
  type: "spring",
  stiffness: 250,
  damping: 18,
  filter: { duration: 0.5, ease: "easeOut" },
};

const props = defineProps<{
  gridCells: GridCell[];
  rows: number;
  cols: number;
  currentSubStep: number;
  isInitialEntrance?: boolean; // New prop to control entrance animations
}>();

const { gridCells, currentSubStep, isInitialEntrance } = toRefs(props);

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
      return {
        opacity: 1,
        x: deltaX,
        y: deltaY,
        scale: 1.3,
        rotate: 20,
        filter: "hue-rotate(180deg) brightness(1.6) blur(1px)",
      }; // Start at source with magical emphasis
    }
  }
  // Default initial state for standard "appear" animations:
  return motionInitialAppear; // Enhanced initial state
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
