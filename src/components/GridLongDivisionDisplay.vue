<template>
  <div
    class="long-division-grid-container"
    :class="{ empty: !state.cells.length }"
  >
    <div
      v-if="state.cells.length"
      class="grid-display"
      :style="gridContainerStyle"
    >
      <!-- Each cell is absolutely positioned based on its column/row -->
      <GridCell
        v-for="cell in state.cells"
        :key="cell.id"
        :cell="cell"
        :cell-width="cellWidth"
        :cell-height="cellHeight"
        :vertical-bar-column="verticalBarColumn"
        :divisor-column-width="divisorColumnWidth"
        :show-subtraction-lines="showSubtractionLines"
      />

      <!-- Optional guide lines for bring-down operations -->
      <GuideLines
        v-for="(guide, index) in bringDownGuides"
        :key="`guide-${index}-${state.activeStep}`"
        :guide="guide"
        :cell-width="cellWidth"
        :cell-height="cellHeight"
      />
    </div>
    <GridPlaceholder v-else message="Enter dividend and divisor to start" />
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { GridDivisionState } from "../composables/useGridDivision";
import { useGridLayout } from "../composables/useGridLayout";
import { useGuideLines } from "../composables/useGuideLines";
import GridCell from "./long-division/GridCell.vue";
import GuideLines from "./long-division/GuideLines.vue";
import GridPlaceholder from "./long-division/GridPlaceholder.vue";

// Props
const props = defineProps({
  state: {
    type: Object as PropType<GridDivisionState>,
    required: true,
  },
  cellWidth: {
    type: Number,
    default: 40,
  },
  cellHeight: {
    type: Number,
    default: 40,
  },
  verticalBarColumn: {
    type: Number,
    default: 2,
  },
  divisorColumnWidth: {
    type: Number,
    default: 60,
  },
  showSubtractionLines: {
    type: Boolean,
    default: false,
  },
});

// Use composables for grid layout and guides
const { gridContainerStyle } = useGridLayout(props);
const { bringDownGuides } = useGuideLines(props.state);
</script>

<style scoped>
.long-division-grid-container {
  margin: 2rem auto;
  padding: 2rem;
  background-color: var(--fraction-bg, #ffffff);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 15px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
  max-width: 95%;
  overflow-x: auto;
  min-height: 200px;
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  justify-content: center;
}

.grid-display {
  font-family: "Fira Code", "Roboto Mono", monospace;
  font-size: 1.4rem;
  position: relative;
  margin: 0 auto;
  transform-style: preserve-3d; /* Enable hardware acceleration */
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .long-division-grid-container {
    background-color: var(--fraction-bg, #2a2a2a);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2), 0 10px 15px rgba(0, 0, 0, 0.1);
  }
}

/* Responsive design */
@media (max-width: 600px) {
  .long-division-grid-container {
    padding: 1rem;
    margin: 1rem auto;
  }
}
</style>
