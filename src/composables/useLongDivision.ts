import { ref, computed } from "vue";

export interface GridCell {
  id: string;
  content: string;
  type: "digit" | "operator" | "line" | "space" | "operator-subtract"; // Added 'operator-subtract'
  highlight?: "active" | "result" | "brought-down" | "multiply" | "subtract";
  gridRow: number;
  gridColumn: number;
  borderTop?: boolean;
  borderLeft?: boolean;
  borderBottom?: boolean;
  isGraphPaper?: boolean;
  revealAtSubStep?: number;
}

export interface LongDivisionStep {
  instruction: string;
  highlightCells: string[];
}

export function useLongDivision(dividendInit = "84", divisorInit = "3") {
  const dividend = ref(dividendInit);
  const divisor = ref(divisorInit);
  const gridCells = ref<GridCell[]>([]);
  const rows = ref(0);
  const cols = ref(0);
  const steps = ref<LongDivisionStep[]>([]);
  const currentStep = ref(0);

  function generate() {
    const dvnd = String(dividend.value).trim(); // Ensure dividend.value is a string before trimming
    const dvsr = parseInt(String(divisor.value)); // Ensure divisor.value is a string for parseInt

    if (!dvnd || !/^[0-9]+$/.test(dvnd) || isNaN(dvsr) || dvsr <= 0) {
      gridCells.value = [];
      steps.value = [];
      rows.value = 0;
      cols.value = 0;
      currentStep.value = 0;
      return;
    }

    const digits = dvnd.split("").map((d) => parseInt(d));
    const n = digits.length;
    if (n === 0) {
      // Should be caught by !dvnd but as a safeguard
      gridCells.value = [];
      steps.value = [];
      rows.value = 0;
      cols.value = 0;
      currentStep.value = 0;
      return;
    }

    const dividendStartCol = 3;
    const divisorCol = 1;
    const bracketCol = 2;
    const totalCols = dividendStartCol + n + 1; // +1 for potential extra space or alignment needs

    const qDigits: number[] = [];
    const multVals: number[] = [];
    const rems: number[] = [];
    const actualWorkingNumbers: number[] = []; // Store the number being divided at each step s

    let currentRemainder = 0;
    for (let i = 0; i < n; i++) {
      // i is index for dividend.value.length and also for qDigits
      const currentDividendPortion = currentRemainder * 10 + digits[i];
      actualWorkingNumbers.push(currentDividendPortion);

      const q = Math.floor(currentDividendPortion / dvsr);
      const mult = q * dvsr;
      const rem = currentDividendPortion - mult;

      qDigits.push(q);
      multVals.push(mult);
      rems.push(rem);
      currentRemainder = rem;
    }

    const stepCount = n; // Each dividend digit creates a main step in this model

    const totalRows = 2 + stepCount * 2 + 1;
    rows.value = totalRows;
    cols.value = totalCols;
    const cellMap: Record<string, GridCell> = {};
    let subStepCounter = 0; // Tracks the index for the newStepList

    // --- Populate cellMap (Quotient, Divisor, Dividend rows first) ---
    // Divisor (always visible from step 0)
    cellMap[`2-${divisorCol}`] = {
      id: "divisor",
      content: divisor.value,
      type: "digit",
      gridRow: 2,
      gridColumn: divisorCol,
      isGraphPaper: true,
      revealAtSubStep: 0,
    };
    // Bracket (always visible)
    cellMap[`2-${bracketCol}`] = {
      id: "bracket",
      content: "",
      type: "operator",
      gridRow: 2,
      gridColumn: bracketCol,
      borderTop: true,
      borderLeft: true,
      isGraphPaper: true,
      revealAtSubStep: 0,
    };
    // Dividend digits (revealed one by one during "bring down" steps, or initially for the first working number)
    for (let i = 0; i < n; i++) {
      const col = dividendStartCol + i;
      cellMap[`2-${col}`] = {
        id: `d-${i}`,
        content: digits[i].toString(),
        type: "digit",
        gridRow: 2,
        gridColumn: col,
        borderTop: true,
        isGraphPaper: true,
        // revealAtSubStep will be set more precisely:
        // d-0 is part of the first "Divide" step's working number.
        // d-{i+1} is revealed by the "Bring Down" step of main step 'i'.
      };
    }

    // --- Populate cellMap (Calculation step rows) ---
    // let currentGridRow = 3; // This variable was unused, removing it.

    // --- Generate Step-by-Step Instructions and Highlights (and set revealAtSubStep) ---
    const newStepList: LongDivisionStep[] = [];
    // Initial working number (d-0) is revealed at the first division step.
    if (cellMap[`2-${dividendStartCol}`]) {
      // This is d-0
      cellMap[`2-${dividendStartCol}`].revealAtSubStep = 0;
    }
    // If the first working number involves more than one digit (e.g. 123/13, first working number is 12)
    // This logic would need to be more complex. Assuming one digit at a time for now for simplicity of reveal.
    // For 84/3, d-0 (8) is revealed at subStep 0. d-1 (4) is revealed when it's brought down.

    for (let s = 0; s < stepCount; s++) {
      const workingNumberForThisStep = actualWorkingNumbers[s];
      const workingNumberStr = String(workingNumberForThisStep);
      const displayLength = Math.max(1, workingNumberStr.length);

      let currentWorkingNumberCells: string[] = [];
      if (s === 0) {
        currentWorkingNumberCells.push("d-0");
        const d0CellKey = `2-${dividendStartCol}`;
        if (cellMap[d0CellKey])
          cellMap[d0CellKey].revealAtSubStep = subStepCounter;
      } else {
        const prevRemVal = rems[s - 1];
        const prevWorkingNumVal = actualWorkingNumbers[s - 1];
        const prevDisplayLength = Math.max(1, String(prevWorkingNumVal).length);
        const prevRemPadded = String(prevRemVal).padStart(
          prevDisplayLength,
          " ",
        );
        for (let k = 0; k < prevRemPadded.length; k++) {
          if (prevRemPadded[k] !== " ") {
            const rCellId = `r-${s - 1}-${k}`;
            currentWorkingNumberCells.push(rCellId);
          }
        }
        const bdCellId = `bd-${s - 1}`;
        currentWorkingNumberCells.push(bdCellId);
      }
      currentWorkingNumberCells = currentWorkingNumberCells.filter(
        (id) => id !== undefined,
      );

      // 1. Division Step
      const qCellId = `q-${s}`;
      const qCol = dividendStartCol + s;
      cellMap[`1-${qCol}`] = {
        id: qCellId,
        content: qDigits[s].toString(),
        type: "digit",
        gridRow: 1,
        gridColumn: qCol,
        isGraphPaper: true,
        revealAtSubStep: subStepCounter,
      };
      newStepList.push({
        instruction: `Divide ${workingNumberForThisStep} by ${dvsr}. Quotient is ${qDigits[s]}.`,
        highlightCells: [
          ...currentWorkingNumberCells,
          "divisor",
          qCellId,
        ].filter((id) => id !== undefined),
      });
      subStepCounter++;

      // 2. Multiply Step
      const multStrPadded = String(multVals[s]).padStart(displayLength, " ");
      const productDigitCells: string[] = [];
      const multRowForCellMap = 3 + s * 2;
      const subOpCellId = `subop-${s}`;

      const productLeftmostCol = dividendStartCol + s - (displayLength - 1);
      const subtractionSymbolCol = productLeftmostCol - 1;

      // Corrected condition for placing the subtraction symbol:
      if (subtractionSymbolCol >= 1) {
        cellMap[`${multRowForCellMap}-${subtractionSymbolCol}`] = {
          id: subOpCellId,
          content: "-",
          type: "operator-subtract",
          gridRow: multRowForCellMap,
          gridColumn: subtractionSymbolCol,
          isGraphPaper: true,
          revealAtSubStep: subStepCounter, // Revealed with the product
        };
      } else {
        // If it can't be placed (e.g. product is too far left, subtractionSymbolCol is 0 or less)
        // then subOpCellId might not be in cellMap, and highlighting logic handles this.
      }

      for (let k = 0; k < multStrPadded.length; k++) {
        const char = multStrPadded[k];
        const mCol = dividendStartCol + s - (displayLength - 1) + k;
        if (char !== " ") {
          const mCellId = `m-${s}-${k}`;
          productDigitCells.push(mCellId);
          cellMap[`${multRowForCellMap}-${mCol}`] = {
            id: mCellId,
            content: char,
            type: "digit",
            gridRow: multRowForCellMap,
            gridColumn: mCol,
            borderBottom: true, // This creates the line under the number to be subtracted
            isGraphPaper: true,
            revealAtSubStep: subStepCounter,
          };
        }
      }

      const multiplyStepHighlightCells = [
        "divisor",
        qCellId,
        ...productDigitCells,
      ];

      newStepList.push({
        instruction: `Multiply ${dvsr} × ${qDigits[s]} = ${multVals[s]}.`,
        highlightCells: multiplyStepHighlightCells.filter(
          (id) => id !== undefined,
        ),
      });
      subStepCounter++;

      // 3. Subtract Step
      const remStrPadded = String(rems[s]).padStart(displayLength, " ");
      const remainderDigitCells: string[] = [];
      const remRowForCellMap = 3 + s * 2 + 1;
      for (let k = 0; k < remStrPadded.length; k++) {
        const char = remStrPadded[k];
        const rCol = dividendStartCol + s - (displayLength - 1) + k;
        if (char !== " ") {
          const rCellId = `r-${s}-${k}`;
          remainderDigitCells.push(rCellId);
          cellMap[`${remRowForCellMap}-${rCol}`] = {
            id: rCellId,
            content: char,
            type: "digit",
            gridRow: remRowForCellMap,
            gridColumn: rCol,
            isGraphPaper: true,
            revealAtSubStep: subStepCounter,
          };
        }
      }

      const subtractStepHighlightCells = [
        ...currentWorkingNumberCells,
        ...productDigitCells,
        ...remainderDigitCells,
      ];

      newStepList.push({
        instruction: `Subtract ${workingNumberForThisStep} - ${multVals[s]} = ${rems[s]}.`,
        highlightCells: subtractStepHighlightCells.filter(
          (id) => id !== undefined,
        ),
      });
      subStepCounter++;

      // 4. Bring Down Step (if applicable)
      if (s + 1 < n) {
        const broughtDownDigitOriginalCellId = `d-${s + 1}`;
        const broughtDownDigitDestCellId = `bd-${s}`;
        const currentStepRemainderCells = remainderDigitCells;

        // The original dividend digit d-(s+1) is revealed at this step
        const dOriginalCellKey = `2-${dividendStartCol + s + 1}`;
        if (cellMap[dOriginalCellKey])
          cellMap[dOriginalCellKey].revealAtSubStep = subStepCounter;
        else {
          // It should have been pre-populated, this is a fallback
          cellMap[dOriginalCellKey] = {
            id: broughtDownDigitOriginalCellId,
            content: digits[s + 1].toString(),
            type: "digit",
            gridRow: 2,
            gridColumn: dividendStartCol + s + 1,
            borderTop: true,
            isGraphPaper: true,
            revealAtSubStep: subStepCounter,
          };
        }

        // The cell where it's visually placed after bringing down (bd-s)
        const bdCol = dividendStartCol + (s + 1);
        const bdRow = remRowForCellMap; // Same row as the remainder it joins
        cellMap[`${bdRow}-${bdCol}`] = {
          // Define/update brought-down cell
          id: broughtDownDigitDestCellId,
          content: digits[s + 1].toString(),
          type: "digit",
          gridRow: bdRow,
          gridColumn: bdCol,
          isGraphPaper: true,
          revealAtSubStep: subStepCounter, // Brought-down digit revealed at this step
        };

        newStepList.push({
          instruction: `Bring down the next digit: ${
            digits[s + 1]
          }. New number is ${rems[s]}${digits[s + 1]}.`,
          highlightCells: [
            ...currentStepRemainderCells,
            broughtDownDigitOriginalCellId,
            broughtDownDigitDestCellId,
          ].filter((id) => id !== undefined),
        });
        subStepCounter++;
      } else {
        // No more digits to bring down, this is the final remainder processing
        // If there's a final remainder, it was revealed in the last Subtract step.
        // If it's a non-zero remainder (and it's the last step):
        if (rems[s] !== 0) {
          newStepList.push({
            instruction: `Division complete. Final remainder is ${rems[s]}.`,
            highlightCells: [...remainderDigitCells].filter(
              (id) => id !== undefined,
            ),
          });
          subStepCounter++;
        }
        // If it's a zero remainder (and it's the last step):
        else if (s === stepCount - 1 && rems[s] === 0) {
          newStepList.push({
            instruction: `Division complete. No remainder.`,
            highlightCells: [...remainderDigitCells].filter(
              (id) => id !== undefined,
            ),
          });
          subStepCounter++;
        }
      }
    }
    steps.value = newStepList;

    // Build full grid for display from cellMap
    const finalCells: GridCell[] = [];
    for (let r = 1; r <= rows.value; r++) {
      for (let c = 1; c <= cols.value; c++) {
        const key = `${r}-${c}`;
        if (cellMap[key]) finalCells.push(cellMap[key]);
        else
          finalCells.push({
            id: `s-${r}-${c}`,
            content: "",
            type: "space",
            gridRow: r,
            gridColumn: c,
            isGraphPaper: true,
          });
      }
    }
    gridCells.value = finalCells;

    currentStep.value = 0; // Reset to first step
  }

  function nextStep() {
    if (currentStep.value < steps.value.length - 1) currentStep.value++;
  }
  function prevStep() {
    if (currentStep.value > 0) currentStep.value--;
  }

  // For grid: highlight only cells for current step
  const highlightedCells = computed(() => {
    if (!steps.value.length) return new Set<string>();
    return new Set(steps.value[currentStep.value].highlightCells);
  });

  generate();

  return {
    dividend,
    divisor,
    gridCells,
    rows,
    cols,
    steps,
    currentStep,
    highlightedCells,
    generate,
    nextStep,
    prevStep,
  };
}
