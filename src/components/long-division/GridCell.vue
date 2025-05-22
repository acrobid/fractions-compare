<template>
  <div class="grid-cell" :class="cellClasses" :style="cellStyle">
    {{ cell.value }}
  </div>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from "vue";
import type { GridCell } from "../../composables/useLongDivision";

const props = defineProps<{
  cell: GridCell;
  cellWidth: number;
  cellHeight: number;
  verticalBarColumn: number;
  divisorColumnWidth: number;
  showSubtractionLines?: boolean;
}>();

// Get style for a cell based on its column and row
const cellStyle = computed((): CSSProperties => {
  // Special column value of 1 means it's in the divisor column
  const leftPosition =
    props.cell.column === 1
      ? props.divisorColumnWidth - props.cellWidth
      : (props.cell.column - 1) * props.cellWidth;

  // Special handling for operation symbols
  if (props.cell.type === "operation") {
    if (props.cell.value === "×" || props.cell.value === "−") {
      return {
        position: "absolute",
        left: `${(props.verticalBarColumn - 1) * props.cellWidth + 10}px`,
        top: `${
          (props.cell.row - 1) * props.cellHeight + props.cellHeight / 2 - 10
        }px`,
        width: "20px",
        height: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.2rem",
        fontWeight: "bold",
      };
    }
  }

  // Default cell styling
  return {
    position: "absolute",
    left: `${leftPosition}px`,
    top: `${(props.cell.row - 1) * props.cellHeight}px`,
    width: `${props.cellWidth}px`,
    height: `${props.cellHeight}px`,
  };
});

// Get classes for a cell based on its type and step state
const cellClasses = computed(() => {
  // Basic cell type classes
  return {
    "cell-divisor": props.cell.type === "divisor",
    "cell-dividend": props.cell.type === "dividend",
    "cell-quotient": props.cell.type === "quotient",
    "cell-product": props.cell.type === "product",
    "cell-subtraction": props.cell.type === "subtractionResult",
    "cell-broughtdown": props.cell.type === "broughtDownNumber",
    "cell-operation": props.cell.type === "operation",
    "with-subtraction-line":
      props.cell.type === "product" && props.showSubtractionLines,
    "is-hidden": props.cell.isHidden || props.cell.type === "vinculum", // Hide vinculum cells - using CSS borders instead
    // Highlight only the relevant numbers in the current operation
    "current-step":
      props.cell.isOperand === true ||
      props.cell.isMinuend === true ||
      props.cell.isSubtrahend === true,
  };
});
</script>

<style scoped>
.grid-cell {
  /* Base styling for all cells */
  border: 1px solid var(--grid-border-color, #e0e0e0);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--cell-bg, white);
  box-sizing: border-box;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}

/* Cell type styling */
.cell-divisor {
  font-weight: 500;
  color: var(--text-color);
  position: relative;
}

/* Create a stronger and more visible division bracket using borders */
.cell-divisor:last-of-type::after {
  content: "";
  position: absolute;
  top: -1px;
  right: -2px;
  width: 3px; /* Make wider for better visibility */
  height: 400px; /* Fixed height that should cover most division problems */
  background-color: var(--text-color, #000);
  z-index: 5;
}

/* Add the horizontal component of the division bracket */
.cell-divisor:last-of-type::before {
  content: "";
  position: absolute;
  top: -1px;
  right: -12px;
  width: 12px; /* Horizontal extension of the division bracket */
  height: 3px; /* Make it thicker */
  background-color: var(--text-color, #000);
  z-index: 5;
}

/* Add a horizontal vinculum on top of the dividend */
.cell-dividend {
  position: relative;
  border-top: 2px solid var(--text-color, #000);
}

/* Add a clearer horizontal division line */
.cell-dividend:first-of-type::before {
  content: "";
  position: absolute;
  left: -10px; /* Extend left to connect with vertical bar */
  top: -2px;
  width: 15px; /* Horizontal extension of bracket */
  height: 2px;
  background-color: var(--text-color, #000);
  z-index: 5;
}

/* Value-based cell styling */
.cell-quotient {
  color: var(--quotient-color, #4caf50);
  position: relative;
  top: 5px; /* Position quotient cells a bit lower */
  z-index: 4;
}

.cell-product {
  color: var(--product-color, #2196f3);
}

/* Conditional styling for product cells with subtraction line */
.cell-product.with-subtraction-line {
  border-bottom: 2px solid var(--text-color, #000);
  padding-bottom: 2px;
  margin-bottom: 2px;
}

.cell-subtraction {
  color: var(--subtraction-color, #ff5722);
}

.cell-broughtdown {
  color: var(--success-border, #28a745);
  font-weight: 600;
}

.cell-operation {
  border: none;
  background-color: transparent;
  font-weight: bold;
}

/* State classes */
.current-step {
  background-color: var(--highlight-bg, #fff3cd);
  border-color: var(--highlight-border, #ffeeba);
  box-shadow: 0 0 0 2px var(--highlight-border, #ffeeba);
  z-index: 10;
}

.is-hidden {
  opacity: 0;
  visibility: hidden;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .cell-divisor {
    color: var(--text-color-dark, #fff);
  }

  /* All value-specific colors adjusted for dark mode */
  .cell-product {
    color: var(--product-color-dark, #64b5f6);
  }

  .cell-subtraction {
    color: var(--subtraction-color-dark, #ff8a65);
  }

  .cell-broughtdown {
    color: var(--success-border-dark, #28a745);
  }

  .current-step {
    background-color: var(--highlight-bg-dark, #332701);
    border-color: var(--highlight-border-dark, #856404);
    box-shadow: 0 0 0 2px var(--highlight-border-dark, #856404);
  }
}
</style>
