import { computed } from "vue";
import type { GridCell } from "../composables/useLongDivision";
import { DIVIDEND_ROW } from "./useGridDivision";

export function useGuideLines(state: { cells: GridCell[] }) {
  // Find active bring-down operations for guide lines
  const bringDownGuides = computed(() => {
    const guides = [];

    // Find the dividend cells to get their exact positions
    const dividendCells = state.cells.filter(
      (cell) => cell.type === "dividend",
    );

    // Find cells that are being brought down
    for (const cell of state.cells) {
      if (
        cell.type === "broughtDownNumber" &&
        cell.animateIn &&
        cell.broughtDownFrom !== undefined
      ) {
        // Find the corresponding dividend cell that this number is brought down from
        const sourceDividendCell = dividendCells.find(
          (divCell) => divCell.column === (cell.broughtDownFrom as number) + 3,
        );

        if (sourceDividendCell) {
          guides.push({
            fromColumn: sourceDividendCell.column, // Use the exact column of the dividend cell
            fromRow: DIVIDEND_ROW, // From the dividend row
            toColumn: cell.column, // To the target column of brought-down cell
            toRow: cell.row, // To the target row of brought-down cell
          });
        }
      }
    }

    return guides;
  });

  return {
    bringDownGuides,
  };
}
