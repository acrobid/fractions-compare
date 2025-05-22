// Grid-based Long Division Implementation
import { ref } from "vue";
import type { GridCell } from "./useLongDivision";

export interface GridDivisionState {
  cells: GridCell[];
  dimensions: { columns: number; rows: number };
  activeStep: number;
  isComplete: boolean;
  currentExplanation: string;
  isQuestionStep?: boolean;
  questionType?: "multiplication" | "subtraction" | null;
  showSubtractionLines?: boolean;
}

// Constants for grid layout
export const DIVISOR_ROW = 3; // Row for divisor
export const QUOTIENT_ROW = 1; // Row for quotient digits
export const DIVIDEND_ROW = 3; // Row for dividend digits (same as divisor, but different column)
export const VINCULUM_ROW = 2; // Row for vinculum (division line)
export const FIRST_CALC_ROW = 4; // First row for calculation lines (product, subtraction, etc.)
export const CELL_WIDTH = 40; // Width of each grid cell in pixels
export const CELL_HEIGHT = 40; // Height of each grid cell in pixels
export const VERTICAL_BAR_COLUMN = 2; // Column for vertical bar between divisor and dividend

export function useGridDivision() {
  // Main state
  const state = ref<GridDivisionState>({
    cells: [],
    dimensions: { columns: 0, rows: 0 },
    activeStep: -1,
    isComplete: false,
    currentExplanation: "",
    isQuestionStep: false,
    questionType: null,
    showSubtractionLines: false,
  });

  interface DivisionStep {
    explanation: string;
    cells: GridCell[];
    isQuestion?: boolean;
    questionType?: "multiplication" | "subtraction" | null;
    showSubtractionLines?: boolean;
  }

  // Steps for the division process
  const steps = ref<DivisionStep[]>([]);
  const dividend = ref<number | null>(null);
  const divisor = ref<number | null>(null);
  const quotient = ref<string>("");
  const remainder = ref<number | null>(null);

  // Set up the division problem
  const setInputs = (newDividend: number, newDivisor: number) => {
    if (newDivisor <= 0 || newDividend < 0) {
      throw new Error(
        "Invalid input: divisor must be positive and dividend must be non-negative",
      );
    }

    // Initialize state
    dividend.value = newDividend;
    divisor.value = newDivisor;
    quotient.value = "";
    remainder.value = null;
    steps.value = [];
    state.value = {
      cells: [],
      dimensions: { columns: 0, rows: 0 },
      activeStep: -1,
      isComplete: false,
      currentExplanation: "",
      isQuestionStep: false,
      questionType: null,
      showSubtractionLines: false,
    };

    // Generate grid cells and steps
    generateDivisionSteps(newDividend, newDivisor);
  };

  // Generate all the steps for the division problem
  const generateDivisionSteps = (dividendNum: number, divisorNum: number) => {
    const dividendStr = dividendNum.toString();
    const divisorStr = divisorNum.toString();

    // Initialize the grid
    initializeGrid(dividendStr, divisorStr);

    // Generate steps for the long division process
    generateLongDivisionSteps(dividendNum, divisorNum, dividendStr);
  };

  // Initialize the grid with divisor, dividend, and vinculum
  const initializeGrid = (dividendStr: string, divisorStr: string) => {
    const cells: GridCell[] = [];
    const divisorDigits = divisorStr.split("");
    const dividendDigits = dividendStr.split("");

    // Add divisor cells (left side)
    for (let i = 0; i < divisorDigits.length; i++) {
      cells.push({
        id: `divisor-${i}`,
        value: divisorDigits[i],
        column: 1, // All divisor digits in column 1 (aligned right)
        row: DIVISOR_ROW,
        type: "divisor",
        fadeIn: true,
      });
    }

    // Add vertical vinculum - enhance it by making it more visible
    cells.push({
      id: "vinculum-vertical",
      value: "|", // Use a visible character for better rendering
      column: VERTICAL_BAR_COLUMN,
      row: DIVISOR_ROW,
      type: "vinculum-vertical", // Use a distinct type for vertical vinculum
      fadeIn: true,
    });

    // Add horizontal vinculum
    for (let i = 0; i < dividendDigits.length; i++) {
      cells.push({
        id: `vinculum-horizontal-${i}`,
        value: "",
        column: i + 3, // Starting from column 3
        row: VINCULUM_ROW,
        type: "vinculum",
      });
    }

    // Add dividend cells
    for (let i = 0; i < dividendDigits.length; i++) {
      cells.push({
        id: `dividend-${i}`,
        value: dividendDigits[i],
        column: i + 3, // Starting from column 3
        row: DIVIDEND_ROW,
        type: "dividend",
        fadeIn: true,
      });
    }

    // Calculate dimensions
    const columns = Math.max(
      dividendDigits.length + 3, // +3 for divisor and vertical vinculum
      20, // Minimum width
    );
    const rows = Math.max(
      FIRST_CALC_ROW + 1, // Minimum height
      20, // Default height
    );

    // Update state
    state.value.cells = cells;
    state.value.dimensions = { columns, rows };

    // Create first step
    steps.value.push({
      explanation: `We want to divide ${dividendStr} by ${divisorStr}`,
      cells: [...cells],
    });
  };

  // Generate all steps for the long division algorithm
  const generateLongDivisionSteps = (
    dividendNum: number,
    divisorNum: number,
    dividendStr: string,
  ) => {
    let workingPortion = "";
    let dividendIdx = 0;
    let quotientValue = "";
    let remainderValue = 0;
    const allSteps = [];
    let currentCells = [...state.value.cells];
    let currentRow = FIRST_CALC_ROW;
    // Track which row is used for each working portion
    let workingPortionRow = currentRow;

    // Loop through the dividend digits
    while (
      dividendIdx < dividendStr.length ||
      (workingPortion !== "" && parseInt(workingPortion) >= divisorNum)
    ) {
      // If we're starting a new working portion, place it on the current row
      if (workingPortion === "") {
        workingPortionRow = currentRow;
      }

      // Bring down digits until we have enough to divide
      while (
        (workingPortion === "" || parseInt(workingPortion) < divisorNum) &&
        dividendIdx < dividendStr.length
      ) {
        // If there is a subtraction result on the previous step, we want to place
        // the brought down digits on the same row as the subtraction result
        const subtractionResults = currentCells.filter(
          (cell) =>
            cell.type === "subtractionResult" && cell.row === workingPortionRow,
        );

        // If we're continuing after a subtraction, ensure we're using the subtraction result row
        if (subtractionResults.length > 0 && workingPortion !== "") {
          // We're already on the right row, don't change workingPortionRow
        } else if (workingPortion === "") {
          // Starting fresh - use current row
          workingPortionRow = currentRow;
        }

        if (workingPortion === "") {
          // First digit of a new working portion
          workingPortion = dividendStr[dividendIdx];
        } else {
          // Adding to existing working portion
          workingPortion += dividendStr[dividendIdx];
        }

        // Create a cell for the brought down digit
        const broughtDownCell: GridCell = {
          id: `broughtdown-${dividendIdx}`,
          value: dividendStr[dividendIdx],
          column: dividendIdx + 3, // Same column as the dividend digit
          row: workingPortionRow, // Use the working portion row for all digits in this working portion
          type: "broughtDownNumber",
          fadeIn: true,
          animateIn: true,
          broughtDownFrom: dividendIdx,
        };

        // Add the brought down cell
        currentCells = [...currentCells, broughtDownCell];

        // Create a step for bringing down
        allSteps.push({
          explanation: `Bring down ${dividendStr[dividendIdx]}. Our working number is now ${workingPortion}`,
          cells: [...currentCells],
        });

        dividendIdx++;
      }

      // If we've reached the end of the dividend and still can't divide
      if (parseInt(workingPortion) < divisorNum) {
        // We have a remainder
        remainderValue = parseInt(workingPortion);

        // Add a zero to quotient if needed
        if (quotientValue.length > 0 || dividendNum >= divisorNum) {
          quotientValue += "0";

          // Add quotient digit
          const quotientCell: GridCell = {
            id: `quotient-${quotientValue.length - 1}`,
            value: "0",
            column: dividendIdx - 1 + 3, // Position above the last brought down digit
            row: QUOTIENT_ROW,
            type: "quotient",
            fadeIn: true,
          };

          currentCells = [...currentCells, quotientCell];

          allSteps.push({
            explanation: `${workingPortion} is less than ${divisorNum}, so we write 0 in the quotient`,
            cells: [...currentCells],
          });
        }

        // Stop processing if we've reached the end
        if (dividendIdx >= dividendStr.length) {
          break;
        }

        continue;
      }

      // Calculate quotient digit
      const quotientDigit = Math.floor(parseInt(workingPortion) / divisorNum);
      quotientValue += quotientDigit.toString();

      // Add quotient digit
      const quotientCell: GridCell = {
        id: `quotient-${quotientValue.length - 1}`,
        value: quotientDigit.toString(),
        column: dividendIdx - 1 + 3, // Position above the last brought down digit
        row: QUOTIENT_ROW,
        type: "quotient",
        fadeIn: true,
        isOperand: true, // Highlight for multiplication
      };

      currentCells = [...currentCells, quotientCell];

      // Add step for finding quotient
      allSteps.push({
        explanation: `${divisorNum} goes into ${workingPortion} ${quotientDigit} times`,
        cells: [...currentCells],
      });

      // Calculate product
      const product = quotientDigit * divisorNum;
      currentRow += 1; // Move to next row for product

      // We don't need this code anymore as we're tracking working portion row continuously
      // The working portion row should already be set correctly from previous steps

      // Add product to cells (aligned right under the working portion)
      const productStr = product.toString();
      for (let i = 0; i < productStr.length; i++) {
        const productCell: GridCell = {
          id: `product-${quotientValue.length}-${i}`,
          value: productStr[i],
          column: dividendIdx - productStr.length + i + 3, // Right align under working portion
          row: currentRow,
          type: "product",
          fadeIn: true,
          isSubtrahend: true,
        };
        currentCells = [...currentCells, productCell];
      }

      // Add multiplication operation symbol
      currentCells = [
        ...currentCells,
        {
          id: `operation-mult-${quotientValue.length}`,
          value: "×",
          column: VERTICAL_BAR_COLUMN,
          row: currentRow,
          type: "operation",
          fadeIn: true,
        },
      ];

      // Enhanced: Highlight divisor digits and quotient for multiplication question
      const cellsForQuestion = currentCells.map((cell) => {
        // Highlight the divisor and current quotient digit for the question
        if (
          cell.type === "divisor" ||
          (cell.type === "quotient" &&
            cell.id === `quotient-${quotientValue.length - 1}`)
        ) {
          return { ...cell, isOperand: true };
        }
        return cell;
      });

      // Add question step for multiplication
      allSteps.push({
        explanation: `What is ${quotientDigit} × ${divisorNum}?`,
        cells: [...cellsForQuestion],
        isQuestion: true,
        questionType: "multiplication" as "multiplication",
      });

      // Add answer step for multiplication
      allSteps.push({
        explanation: `${quotientDigit} × ${divisorNum} = ${product}`,
        cells: [...currentCells],
      });

      // Calculate subtraction result
      const subtractResult = parseInt(workingPortion) - product;

      // Use the same row as the product for subtraction result
      // The subtraction result should appear on the same row for clarity

      // Add subtraction operation symbol
      currentCells = [
        ...currentCells,
        {
          id: `operation-sub-${quotientValue.length}`,
          value: "−",
          column: VERTICAL_BAR_COLUMN,
          row: currentRow, // Position on the same row as product
          type: "operation",
          fadeIn: true,
        },
      ];

      // Add subtraction result to cells
      const subtractStr = subtractResult.toString();
      const subtractResultRow = currentRow + 1; // One row below the product

      for (let i = 0; i < subtractStr.length; i++) {
        const subtractCell: GridCell = {
          id: `subtract-${quotientValue.length}-${i}`,
          value: subtractStr[i],
          column: dividendIdx - subtractStr.length + i + 3, // Right align under working portion
          row: subtractResultRow, // One row below the product for visually clear separation
          type: "subtractionResult",
          fadeIn: true,
        };
        currentCells = [...currentCells, subtractCell];
      }

      currentRow += 2; // Move 2 rows down (one for product, one for subtraction)

      // If there's a non-zero subtraction result, it becomes our new working portion
      // Save the subtraction result row as the next working portion row for brought down numbers
      if (subtractResult > 0) {
        workingPortionRow = subtractResultRow; // Use the row of the subtraction result for next brought down digits
      }

      // Enhanced: Highlight the minuend and subtrahend for subtraction question
      const cellsForSubtractionQuestion = currentCells.map((cell) => {
        // Highlight the minuend (brought down numbers/working portion)
        if (cell.type === "broughtDownNumber" && cell.row < currentRow) {
          return { ...cell, isMinuend: true, isOperand: true };
        }
        // Highlight the subtrahend (product)
        else if (cell.type === "product") {
          return { ...cell, isSubtrahend: true, isOperand: true };
        }
        return cell;
      });

      // Add question step for subtraction
      allSteps.push({
        explanation: `What is ${workingPortion} - ${product}?`,
        cells: [...cellsForSubtractionQuestion],
        isQuestion: true,
        questionType: "subtraction" as "subtraction",
      });

      // Add answer step for subtraction with highlighting removed from cells
      const cellsForSubtractionAnswer = currentCells.map((cell) => {
        if (cell.type === "broughtDownNumber" || cell.type === "product") {
          return {
            ...cell,
            isMinuend: false,
            isSubtrahend: false,
            isOperand: false,
          };
        }
        return cell;
      });

      // Add answer step for subtraction
      allSteps.push({
        explanation: `${workingPortion} - ${product} = ${subtractResult}`,
        cells: [...cellsForSubtractionAnswer],
        showSubtractionLines: true,
      });

      // Update working portion for next iteration
      workingPortion = subtractResult === 0 ? "" : subtractResult.toString();
      currentRow += 1; // Move to next row for next operation
    }

    // Set final quotient and remainder
    quotient.value = quotientValue || "0";
    remainder.value = remainderValue;

    // Add final step
    allSteps.push({
      explanation: `The division is complete. ${dividendNum} ÷ ${divisorNum} = ${
        quotient.value
      }${
        remainder.value !== null && remainder.value > 0
          ? ` with remainder ${remainder.value}`
          : ""
      }`,
      cells: [...currentCells],
    });

    // Save all steps
    steps.value = allSteps;
  };

  // Navigate through steps
  const startProblem = () => {
    if (steps.value.length > 0) {
      // Start with cells that don't have animations yet
      const initialCells = steps.value[0].cells.map((cell) => ({
        ...cell,
        fadeIn: false,
        animateIn: false,
      }));

      // Set initial state (without animations)
      state.value.activeStep = 0;
      state.value.cells = initialCells;
      state.value.currentExplanation = steps.value[0].explanation;

      // Enable animations after a short delay
      setTimeout(() => {
        state.value.cells = steps.value[0].cells.map((cell) => ({
          ...cell,
          fadeIn: true,
          animateIn: cell.animateIn || false,
        }));
      }, 50); // Slightly longer delay for initial rendering
    }
  };

  const nextStep = () => {
    if (state.value.activeStep < steps.value.length - 1) {
      state.value.activeStep++;

      const currentStep = steps.value[state.value.activeStep];
      const isQuestionStep = currentStep.isQuestion === true;
      const questionType = currentStep.questionType || null;
      const showSubtractionLines = !!currentStep.showSubtractionLines;

      // Get the current step's cells with animation flags reset
      const newCells = [...currentStep.cells].map((cell) => {
        // Reset any animation flags temporarily
        const isHidden =
          isQuestionStep &&
          ((questionType === "multiplication" && cell.type === "product") ||
            (questionType === "subtraction" &&
              cell.type === "subtractionResult"));

        // Reset all highlighting flags by default
        const resetCell = {
          ...cell,
          fadeIn: false,
          animateIn: false,
          isHidden,
          isOperand: false,
          isMinuend: false,
          isSubtrahend: false,
        };

        // Re-apply highlighting only to cells that should be highlighted in this step
        if (currentStep.explanation.includes("What is") && !isHidden) {
          if (
            cell.isOperand === true ||
            cell.isMinuend === true ||
            cell.isSubtrahend === true
          ) {
            resetCell.isOperand = cell.isOperand === true;
            resetCell.isMinuend = cell.isMinuend === true;
            resetCell.isSubtrahend = cell.isSubtrahend === true;
          }
        }

        return resetCell;
      });

      // Update the state
      state.value.cells = newCells;
      state.value.currentExplanation = currentStep.explanation;
      state.value.isQuestionStep = isQuestionStep;
      state.value.questionType = questionType;
      state.value.showSubtractionLines = showSubtractionLines;

      // Mark as complete if this is the last step
      if (state.value.activeStep === steps.value.length - 1) {
        state.value.isComplete = true;
      }

      // Re-enable animations after a short delay (forces reflow)
      setTimeout(() => {
        state.value.cells = newCells.map((cell) => {
          const shouldAnimate =
            !cell.isHidden && (cell.fadeIn || cell.animateIn);
          if (shouldAnimate) {
            // For cells that should animate and be visible, re-enable their animations
            return {
              ...cell,
              fadeIn: cell.fadeIn || false,
              animateIn: cell.animateIn || false,
            };
          }
          return cell;
        });
      }, 10);
    }
  };

  const resetProblem = () => {
    dividend.value = null;
    divisor.value = null;
    quotient.value = "";
    remainder.value = null;
    steps.value = [];
    state.value = {
      cells: [],
      dimensions: { columns: 0, rows: 0 },
      activeStep: -1,
      isComplete: false,
      currentExplanation: "",
      isQuestionStep: false,
      questionType: null,
      showSubtractionLines: false,
    };
  };

  // Return public API
  return {
    // State
    state,
    dividend,
    divisor,
    quotient,
    remainder,

    // Actions
    setInputs,
    startProblem,
    nextStep,
    resetProblem,

    // Grid constants for consumption by components
    gridConstants: {
      CELL_WIDTH,
      CELL_HEIGHT,
      DIVISOR_ROW,
      QUOTIENT_ROW,
      DIVIDEND_ROW,
      VINCULUM_ROW,
      FIRST_CALC_ROW,
      VERTICAL_BAR_COLUMN,
    },
  };
}
