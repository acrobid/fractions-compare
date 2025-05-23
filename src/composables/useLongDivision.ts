import { ref, computed } from "vue";

export interface GridCell {
  id: string;
  content: string;
  type: "digit" | "operator" | "line" | "space" | "operator-subtract";
  highlight?: "active" | "result" | "brought-down" | "multiply" | "subtract";
  gridRow: number;
  gridColumn: number;
  borderTop?: boolean;
  borderLeft?: boolean;
  borderBottom?: boolean;
  isGraphPaper?: boolean;
  revealAtSubStep?: number;
  animateFromCellId?: string; // For target cell: ID of cell to animate from
  hideIfTargetIsAnimatingAtSubStep?: {
    // For source cell: info to hide it
    targetCellId: string;
    subStep: number;
  };
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
    const dvnd = String(dividend.value).trim();
    const dvsr = parseInt(String(divisor.value));

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
    const totalCols = dividendStartCol + n + 1;

    const qDigits: number[] = [];
    const multVals: number[] = [];
    const rems: number[] = [];
    const actualWorkingNumbers: number[] = [];

    let currentRemainder = 0;
    for (let i = 0; i < n; i++) {
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

    const stepCount = n;
    const totalRows = 2 + stepCount * 2 + 1;
    rows.value = totalRows;
    cols.value = totalCols;
    const cellMap: Record<string, GridCell> = {};
    let subStepCounter = 0;

    // Divisor
    cellMap[`2-${divisorCol}`] = {
      id: "divisor",
      content: divisor.value,
      type: "digit",
      gridRow: 2,
      gridColumn: divisorCol,
      isGraphPaper: true,
      revealAtSubStep: 0,
    };
    // Bracket
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

    // Dividend digits pre-population
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
        // revealAtSubStep for d-0 is 0. Others are revealed by default (no revealAtSubStep or revealAtSubStep: 0)
        // hideIfTargetIsAnimatingAtSubStep will be set if it becomes a source for bring down
      };
    }
    // Ensure d-0 (first dividend digit) is revealed at the start of the process if not part of a multi-digit initial number.
    if (cellMap[`2-${dividendStartCol}`]) {
      // This is d-0
      cellMap[`2-${dividendStartCol}`].revealAtSubStep = 0;
    }

    const newStepList: LongDivisionStep[] = [];

    for (let s = 0; s < stepCount; s++) {
      const workingNumberForThisStep = actualWorkingNumbers[s];
      const workingNumberStr = String(workingNumberForThisStep);
      const displayLength = Math.max(1, workingNumberStr.length); // For current number being divided/subtracted from.

      let currentWorkingNumberCells: string[] = [];
      if (s === 0) {
        currentWorkingNumberCells.push("d-0");
        // Ensure d-0 is revealed at this step if not already set
        const d0CellKey = `2-${dividendStartCol}`;
        if (
          cellMap[d0CellKey] &&
          cellMap[d0CellKey].revealAtSubStep === undefined
        ) {
          cellMap[d0CellKey].revealAtSubStep = subStepCounter;
        }
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
      const productDigitCells: string[] = []; // Ensure this is string[]
      const multRowForCellMap = 3 + s * 2;
      const subOpCellId = `subop-${s}`;
      const productLeftmostCol = dividendStartCol + s - (displayLength - 1);
      const subtractionSymbolCol = productLeftmostCol - 1;
      if (subtractionSymbolCol >= 1) {
        cellMap[`${multRowForCellMap}-${subtractionSymbolCol}`] = {
          id: subOpCellId,
          content: "-",
          type: "operator-subtract",
          gridRow: multRowForCellMap,
          gridColumn: subtractionSymbolCol,
          isGraphPaper: true,
          revealAtSubStep: subStepCounter,
        };
      }
      for (let k = 0; k < multStrPadded.length; k++) {
        const char = multStrPadded[k];
        const mCol = productLeftmostCol + k;
        if (char !== " ") {
          const mCellId = `m-${s}-${k}`;
          productDigitCells.push(mCellId); // mCellId is a string
          cellMap[`${multRowForCellMap}-${mCol}`] = {
            id: mCellId,
            content: char,
            type: "digit",
            gridRow: multRowForCellMap,
            gridColumn: mCol,
            borderBottom: true,
            isGraphPaper: true,
            revealAtSubStep: subStepCounter,
          };
        }
      }
      newStepList.push({
        instruction: `Multiply ${dvsr} × ${qDigits[s]} = ${multVals[s]}.`,
        highlightCells: ["divisor", qCellId, ...productDigitCells].filter(
          (id) => id !== undefined,
        ),
      });
      subStepCounter++;

      // 3. Subtract Step
      const remStrPadded = String(rems[s]).padStart(displayLength, " ");
      const remainderDigitCells: string[] = []; // Ensure this is string[]
      const remRowForCellMap = 3 + s * 2 + 1;
      for (let k = 0; k < remStrPadded.length; k++) {
        const char = remStrPadded[k];
        const rCol = productLeftmostCol + k; // Remainder aligns with product digits
        if (char !== " ") {
          const rCellId = `r-${s}-${k}`;
          remainderDigitCells.push(rCellId); // rCellId is a string
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
      newStepList.push({
        instruction: `Subtract ${workingNumberForThisStep} - ${multVals[s]} = ${rems[s]}.`,
        highlightCells: [
          ...currentWorkingNumberCells,
          ...productDigitCells,
          ...remainderDigitCells,
        ].filter((id) => id !== undefined),
      });
      subStepCounter++;

      // 4. Bring Down Step (if applicable)
      if (s + 1 < n) {
        const broughtDownDigitOriginalCellId = `d-${s + 1}`;
        const broughtDownDigitDestCellId = `bd-${s}`;
        // currentStepRemainderCells should be accurately populated from the subtract step
        const currentStepRemainderCells = remainderDigitCells;

        const dOriginalCellKey = `2-${dividendStartCol + s + 1}`;

        // Calculate column for the brought-down digit (destination)
        const remainderValueStr = String(rems[s]);
        const remainderActualLength = remainderValueStr.length;

        // Determine the column where the first digit of the current remainder (rems[s]) was placed.
        // remStrPadded was String(rems[s]).padStart(displayLength, " ");
        // The remainder digits were placed starting at rCol = productLeftmostCol + k;
        // The first non-space char of remStrPadded is at index (displayLength - remainderActualLength).
        const firstRemainderDigitOffset = displayLength - remainderActualLength;
        const actualRemainderStartCol =
          productLeftmostCol + firstRemainderDigitOffset;

        // The brought-down digit goes to the right of the last digit of the remainder.
        const finalBdCol = actualRemainderStartCol + remainderActualLength;

        const bdRow = remRowForCellMap; // Same row as the remainder it joins
        const bdCellKey = `${bdRow}-${finalBdCol}`;

        // Configure the original dividend cell to hide during animation
        if (cellMap[dOriginalCellKey]) {
          cellMap[dOriginalCellKey].hideIfTargetIsAnimatingAtSubStep = {
            targetCellId: broughtDownDigitDestCellId,
            subStep: subStepCounter,
          };
        } else {
          cellMap[dOriginalCellKey] = {
            id: broughtDownDigitOriginalCellId,
            content: digits[s + 1].toString(),
            type: "digit",
            gridRow: 2,
            gridColumn: dividendStartCol + s + 1,
            borderTop: true,
            isGraphPaper: true,
            hideIfTargetIsAnimatingAtSubStep: {
              targetCellId: broughtDownDigitDestCellId,
              subStep: subStepCounter,
            },
          };
        }

        // Define/update the brought-down cell (destination)
        // Ensure this doesn't overwrite an existing remainder digit if remainder is multi-digit and bd somehow lands on it.
        // The finalBdCol calculation should place it *after* the remainder.
        if (
          cellMap[bdCellKey] &&
          cellMap[bdCellKey].type === "digit" &&
          !cellMap[bdCellKey].id.startsWith("bd-")
        ) {
          // This case would be problematic, indicating an overlap.
          // For now, we assume finalBdCol is correctly calculated to avoid this.
        }

        cellMap[bdCellKey] = {
          id: broughtDownDigitDestCellId,
          content: digits[s + 1].toString(),
          type: "digit",
          gridRow: bdRow,
          gridColumn: finalBdCol,
          isGraphPaper: true,
          revealAtSubStep: subStepCounter,
          animateFromCellId: broughtDownDigitOriginalCellId,
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
        // Final remainder/completion steps
        if (s === stepCount - 1) {
          // Only add completion step if it's the last main step
          if (rems[s] !== 0) {
            newStepList.push({
              instruction: `Division complete. Final remainder is ${rems[s]}.`,
              highlightCells: [...remainderDigitCells].filter(
                (id) => id !== undefined,
              ),
            });
            subStepCounter++;
          } else {
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
    }
    steps.value = newStepList;

    const finalCells: GridCell[] = [];
    for (let r = 1; r <= rows.value; r++) {
      for (let c = 1; c <= cols.value; c++) {
        const key = `${r}-${c}`;
        if (cellMap[key]) {
          finalCells.push(cellMap[key]);
        } else {
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
    }
    gridCells.value = finalCells;
    currentStep.value = 0;
  }

  function nextStep() {
    if (currentStep.value < steps.value.length - 1) currentStep.value++;
  }
  function prevStep() {
    if (currentStep.value > 0) currentStep.value--;
  }

  const highlightedCells = computed(() => {
    if (!steps.value.length || !steps.value[currentStep.value])
      return new Set<string>();
    return new Set(steps.value[currentStep.value].highlightCells);
  });

  generate(); // Initial generation

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
