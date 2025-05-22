<template>
  <div class="bring-down-guide" :style="guideStyle"></div>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from "vue";

const props = defineProps<{
  guide: {
    fromColumn: number;
    fromRow: number;
    toColumn: number;
    toRow: number;
  };
  cellWidth: number;
  cellHeight: number;
}>();

// Get style for bring-down guides
const guideStyle = computed((): CSSProperties => {
  const startX =
    (props.guide.fromColumn - 1) * props.cellWidth + props.cellWidth / 2;
  const startY =
    (props.guide.fromRow - 1) * props.cellHeight + props.cellHeight;

  // Calculate the endpoint based on the target column and row
  const endX =
    (props.guide.toColumn - 1) * props.cellWidth + props.cellWidth / 2;
  const endY = (props.guide.toRow - 1) * props.cellHeight;

  // Determine if we need to create a diagonal or vertical line
  if (startX === endX) {
    // Vertical line
    return {
      position: "absolute",
      left: `${startX}px`,
      top: `${startY}px`,
      width: "2px",
      height: `${endY - startY}px`,
      backgroundColor: "var(--accent-color, #4caf50)",
      opacity: 0.6,
      animation: "guideGrow 0.5s ease-out forwards",
    };
  } else {
    // Diagonal line (using transform for a slanted line)
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);
    const length = Math.sqrt(width * width + height * height);
    const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);

    return {
      position: "absolute",
      left: `${startX}px`,
      top: `${startY}px`,
      width: `${length}px`,
      height: "2px",
      backgroundColor: "var(--accent-color, #4caf50)",
      opacity: 0.6,
      transformOrigin: "left center",
      transform: `rotate(${angle}deg)`,
      animation: "guideGrow 0.5s ease-out forwards",
    };
  }
});
</script>

<style scoped>
.bring-down-guide {
  background-color: var(--accent-color, #4caf50);
  opacity: 0.6;
}

@keyframes guideGrow {
  from {
    transform: scaleY(0) scaleX(0);
    opacity: 0;
  }
  to {
    transform: scaleY(1) scaleX(1);
    opacity: 0.7;
  }
}
</style>
