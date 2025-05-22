import { ref, computed } from "vue";

// Types and interfaces
// New grid-based cell model
export interface GridCell {
  id: string;
  value: string;
  column: number; // Fixed column position in the grid
  row: number; // Fixed row position in the grid
  type:
    | "divisor"
    | "dividend"
    | "quotient"
    | "product"
    | "subtractionResult"
    | "broughtDownNumber"
    | "vinculum"
    | "operation";
  isHighlighted?: boolean;
  isOperand?: boolean;
  isMinuend?: boolean;
  isSubtrahend?: boolean;
  showMinusSign?: boolean;
  fadeIn?: boolean; // To control animation
  animateIn?: boolean; // For additional animation effects
  broughtDownFrom?: number; // For tracking bring down origin
  isHidden?: boolean; // To hide cells in question steps
}

// Keep the old interface for backward compatibility during transition
export interface CalculationLine {
  id: string;
  value: string;
  type:
    | "currentDividendPortion"
    | "product"
    | "subtractionResult"
    | "broughtDownNumber";
  isHighlighted?: boolean;
  isOperand?: boolean; // New: for highlighting operands in multiplication/subtraction
  isMinuend?: boolean; // For subtraction step: the number being subtracted from
  isSubtrahend?: boolean; // For subtraction step: the number being subtracted
  showMinusSign?: boolean; // Show minus sign for subtraction
}

interface VisualBringDownInfo {
  digit: string;
  fromDividendIndex: number; // Original column index in dividendDigits
  targetLineId: string; // ID of the CalculationLine it's part of
  targetCharIndexInLine: number; // Index within that line's value string
}

// Define QuotientDigitInfo interface
export interface QuotientDigitInfo {
  value: string;
  columnIndex: number; // The index in the original dividendDigits array above which this quotient digit should appear.
  isOperand?: boolean; // New: for highlighting the quotient digit during multiplication
}

// New grid-based state model
export interface GridState {
  // Original properties for backward compatibility
  divisorDigits: string[];
  dividendDigits: string[];
  quotientDigits: QuotientDigitInfo[]; // Changed from string[]
  calculationLines: CalculationLine[];
  activeDividendDigits?: { start: number; end: number };
  activeQuotientDigitIndex?: number;
  activeCalculationLineId?: string;
  activeBroughtDownDividendIndex?: number;
  visualBringDownInfo?: VisualBringDownInfo;
  highlightDivisorForMultiplication?: boolean; // New: for highlighting the divisor during multiplication

  // New grid-based structure
  gridCells: GridCell[]; // All cells in the grid, positioned absolutely
  gridDimensions: { columns: number; rows: number }; // Current dimensions of the grid
  activeStep?: number; // Current step in animation sequence
  bringDownAnimation?: {
    fromCell: string;
    toCell: string;
    progress: number;
  }; // Track bring-down animations
}

export interface Step {
  explanation: string;
  gridState: GridState;
  workingDividendPortion?: string;
  quotientDigitJustFound?: string;
  product?: string;
  subtractionResult?: string;
}

export function useLongDivision() {
  // State
  const dividend = ref<number | null>(null);
  const divisor = ref<number | null>(null);
  const quotient = ref<string>("");
  const remainder = ref<number | null>(null);
  const steps = ref<Step[]>([]);
  const currentStepIndex = ref<number>(-1);
  const isComplete = ref<boolean>(false);
  const currentExplanation = ref<string>("");

  // Computed state
  const currentStep = computed(() =>
    currentStepIndex.value >= 0 && currentStepIndex.value < steps.value.length
      ? steps.value[currentStepIndex.value]
      : null,
  );

  const currentGridState = computed(() => currentStep.value?.gridState || null);

  // Helper function to pad numbers with spaces for alignment
  const padLeft = (num: string | number, width: number): string => {
    return String(num).padStart(width, " ");
  };

  // Input validation and setup
  const setInputs = (newDividend: number, newDivisor: number) => {
    if (newDivisor <= 0 || newDividend < 0) {
      throw new Error(
        "Invalid input: divisor must be positive and dividend must be non-negative",
      );
    }

    dividend.value = newDividend;
    divisor.value = newDivisor;
    quotient.value = "";
    remainder.value = null;
    steps.value = [];
    currentStepIndex.value = -1;
    isComplete.value = false;
    currentExplanation.value = "";
  };

  // Core division algorithm
  const generateSteps = () => {
    if (dividend.value === null || divisor.value === null) return;

    const dividendStr = dividend.value.toString();
    const divisorNum = divisor.value;

    let currentQuotientDigits: QuotientDigitInfo[] = []; // Changed to let from const
    const currentCalculationLines: CalculationLine[] = [];
    let workingPortion = "";
    let dividendIdx = 0;

    // Initial step
    steps.value.push({
      explanation: `We want to divide ${dividend.value} by ${divisorNum}`,
      gridState: {
        divisorDigits: divisorNum.toString().split(""),
        dividendDigits: dividendStr.split(""),
        quotientDigits: [],
        calculationLines: [],
      },
    });

    while (
      dividendIdx < dividendStr.length ||
      (workingPortion !== "" && parseInt(workingPortion) >= divisorNum)
    ) {
      let broughtDownIndexForThisStep: number | undefined = undefined;
      let currentWorkingPortionStartIndexInDividend =
        dividendIdx - workingPortion.length;

      // Bring down digits until we have enough to divide
      while (
        (workingPortion === "" || parseInt(workingPortion) < divisorNum) &&
        dividendIdx < dividendStr.length
      ) {
        if (workingPortion === "") {
          currentWorkingPortionStartIndexInDividend = dividendIdx;
        }
        workingPortion += dividendStr[dividendIdx];
        broughtDownIndexForThisStep = dividendIdx;

        // Add the bring down step to calculation lines
        const broughtDownLine: CalculationLine = {
          id: `broughtdown-${dividendIdx}`,
          value: workingPortion,
          type: "broughtDownNumber",
          isHighlighted: true,
        };

        steps.value.push({
          explanation: `Bring down ${dividendStr[dividendIdx]}. Our working number is now ${workingPortion}`,
          gridState: {
            divisorDigits: divisorNum.toString().split(""),
            dividendDigits: dividendStr.split(""),
            quotientDigits: [...currentQuotientDigits],
            calculationLines: [...currentCalculationLines, broughtDownLine],
            activeBroughtDownDividendIndex: broughtDownIndexForThisStep,
            activeDividendDigits: {
              start: currentWorkingPortionStartIndexInDividend,
              end: dividendIdx,
            },
            visualBringDownInfo: {
              digit: dividendStr[dividendIdx],
              fromDividendIndex: dividendIdx,
              targetLineId: broughtDownLine.id,
              targetCharIndexInLine: workingPortion.length - 1,
            },
          },
        });

        currentCalculationLines.push(broughtDownLine);
        dividendIdx++;
      }

      // Handle case when working portion is less than divisor
      const workingPortionNum = parseInt(workingPortion);
      if (workingPortionNum < divisorNum) {
        // Add zero to quotient if we've already started division or at the end of dividend
        if (
          currentQuotientDigits.length > 0 ||
          dividend.value >= divisorNum ||
          dividendIdx >= dividendStr.length
        ) {
          currentQuotientDigits.push({
            value: "0",
            columnIndex: dividendIdx - 1,
          });
          steps.value.push({
            explanation: `${workingPortion} is less than ${divisorNum}, so we write 0 in the quotient`,
            gridState: {
              divisorDigits: divisorNum.toString().split(""),
              dividendDigits: dividendStr.split(""),
              quotientDigits: [...currentQuotientDigits],
              calculationLines: [...currentCalculationLines],
              activeQuotientDigitIndex: currentQuotientDigits.length - 1,
              activeDividendDigits: {
                start: currentWorkingPortionStartIndexInDividend,
                end: dividendIdx - 1,
              },
            },
          });
        }

        if (dividendIdx >= dividendStr.length) {
          // We've reached the end with a remainder
          remainder.value = workingPortionNum;
          break;
        }
        continue;
      }

      const qDigitVal = Math.floor(workingPortionNum / divisorNum);
      const qDigitInfo: QuotientDigitInfo = {
        value: qDigitVal.toString(),
        columnIndex: dividendIdx - 1,
        isOperand: true, // Highlight this quotient digit for multiplication
      };
      currentQuotientDigits.push(qDigitInfo);

      steps.value.push({
        explanation: `${divisorNum} goes into ${workingPortion} ${qDigitVal} times`,
        gridState: {
          divisorDigits: divisorNum.toString().split(""),
          dividendDigits: dividendStr.split(""),
          quotientDigits: [...currentQuotientDigits],
          calculationLines: [...currentCalculationLines],
          activeQuotientDigitIndex: currentQuotientDigits.length - 1,
          activeDividendDigits: {
            start: currentWorkingPortionStartIndexInDividend,
            end: dividendIdx - 1,
          },
          highlightDivisorForMultiplication: true, // Highlight divisor for multiplication
        },
      });

      const product = qDigitVal * divisorNum;
      const productLine: CalculationLine = {
        id: `product-${currentQuotientDigits.length}`,
        value: padLeft(product.toString(), workingPortion.length),
        type: "product",
        isHighlighted: true, // Highlight the product line
        isSubtrahend: true, // Mark as subtrahend
        showMinusSign: true, // Show minus sign
      };
      currentCalculationLines.push(productLine);

      // Create or find the minuend line
      const minuendLine = currentCalculationLines.find(
        (line) =>
          line.type === "broughtDownNumber" && line.value === workingPortion,
      );
      if (minuendLine) {
        minuendLine.isMinuend = true;
      }

      steps.value.push({
        explanation: `${qDigitVal} × ${divisorNum} = ${product}`,
        gridState: {
          divisorDigits: divisorNum.toString().split(""),
          dividendDigits: dividendStr.split(""),
          quotientDigits: currentQuotientDigits.map((qd) => ({
            ...qd,
            isOperand: qd === qDigitInfo, // Only highlight the current quotient digit
          })),
          calculationLines: [...currentCalculationLines],
          activeCalculationLineId: productLine.id,
          activeDividendDigits: {
            start: currentWorkingPortionStartIndexInDividend,
            end: dividendIdx - 1,
          },
          highlightDivisorForMultiplication: true,
        },
        product: product.toString(),
      });

      const difference = workingPortionNum - product;
      const differenceLine: CalculationLine = {
        id: `difference-${currentQuotientDigits.length}`,
        value: padLeft(difference.toString(), workingPortion.length),
        type: "subtractionResult",
        isHighlighted: true,
      };
      currentCalculationLines.push(differenceLine);

      steps.value.push({
        explanation: `${workingPortion} - ${product} = ${difference}`,
        gridState: {
          divisorDigits: divisorNum.toString().split(""),
          dividendDigits: dividendStr.split(""),
          quotientDigits: [...currentQuotientDigits],
          calculationLines: [...currentCalculationLines],
          activeCalculationLineId: differenceLine.id,
          activeDividendDigits: {
            start: currentWorkingPortionStartIndexInDividend,
            end: dividendIdx - 1,
          },
        },
        subtractionResult: difference.toString(),
      });

      // Reset the highlighting states
      productLine.isSubtrahend = false;
      productLine.showMinusSign = false;
      if (minuendLine) {
        minuendLine.isMinuend = false;
      }

      // Update working portion, ensuring we handle zero correctly
      workingPortion = difference === 0 ? "" : difference.toString();

      // Reset operand highlighting for subsequent steps
      currentQuotientDigits = currentQuotientDigits.map((qd) => ({
        ...qd,
        isOperand: false,
      }));
    }

    // Final step: ensure proper quotient and remainder
    const finalQuotientString = currentQuotientDigits
      .map((qd) => qd.value)
      .join("");
    quotient.value = finalQuotientString || "0";

    if (remainder.value === null) {
      remainder.value =
        workingPortion === "" ? 0 : parseInt(workingPortion) || 0;
    }

    // Add final explanation step
    steps.value.push({
      explanation: `The division is complete. ${
        dividend.value
      } ÷ ${divisorNum} = ${quotient.value}${
        remainder.value !== null && remainder.value > 0
          ? ` with remainder ${remainder.value}`
          : ""
      }`,
      gridState: {
        divisorDigits: divisorNum.toString().split(""),
        dividendDigits: dividendStr.split(""),
        quotientDigits:
          currentQuotientDigits.length > 0
            ? currentQuotientDigits
            : [{ value: "0", columnIndex: 0 }],
        calculationLines: currentCalculationLines,
      },
    });
  };

  // Control functions
  const startProblem = () => {
    if (dividend.value === null || divisor.value === null) return;

    generateSteps();
    console.log("Generated steps:", steps.value);
    if (steps.value.length > 0) {
      currentStepIndex.value = 0;
      currentExplanation.value = steps.value[0].explanation;
      console.log("First step grid state:", steps.value[0].gridState);
    }
  };

  const nextStep = () => {
    if (currentStepIndex.value < steps.value.length - 1) {
      currentStepIndex.value++;
      currentExplanation.value =
        steps.value[currentStepIndex.value].explanation;

      // Mark as complete if this is the last step
      if (currentStepIndex.value === steps.value.length - 1) {
        isComplete.value = true;
      }

      console.log(
        "Next step index:",
        currentStepIndex.value,
        "Total steps:",
        steps.value.length,
        "Grid state:",
        steps.value[currentStepIndex.value].gridState,
        "Calculation lines:",
        steps.value[currentStepIndex.value].gridState.calculationLines,
      );
    }
  };

  const resetProblem = () => {
    dividend.value = null;
    divisor.value = null;
    quotient.value = "";
    remainder.value = null;
    steps.value = [];
    currentStepIndex.value = -1;
    isComplete.value = false;
    currentExplanation.value = "";
  };

  return {
    // State
    dividend,
    divisor,
    quotient,
    remainder,
    currentStepIndex,
    isComplete,
    currentExplanation,
    currentGridState,

    // Actions
    setInputs,
    startProblem,
    nextStep,
    resetProblem,

    // Helper computed
    canStart: computed(() => dividend.value !== null && divisor.value !== null),
    canNext: computed(
      () =>
        currentStepIndex.value >= 0 &&
        currentStepIndex.value < steps.value.length - 1,
    ),
  };
}
