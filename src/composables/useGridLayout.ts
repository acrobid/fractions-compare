import { computed } from "vue";
import type { GridDivisionState } from "../composables/useGridDivision";

export function useGridLayout(props: {
  state: GridDivisionState;
  cellWidth: number;
  cellHeight: number;
  divisorColumnWidth: number;
}) {
  // Calculate the container style based on grid dimensions
  const gridContainerStyle = computed(() => {
    const { columns, rows } = props.state.dimensions;
    return {
      width: `${props.divisorColumnWidth + props.cellWidth * columns}px`,
      height: `${props.cellHeight * rows}px`,
      position: "relative" as const,
    };
  });

  return {
    gridContainerStyle,
  };
}
