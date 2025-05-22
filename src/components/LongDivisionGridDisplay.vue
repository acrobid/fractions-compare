<template>
  <div
    class="long-division-grid"
    v-if="gridState && gridState.divisorDigits && gridState.dividendDigits"
  >
    <div class="grid-wrapper">
      <div class="grid-container" :style="gridContainerStyle">
        <!-- Stable layout container to prevent shifts -->
        <div class="stable-layout-container">
          <!-- Divisor -->
          <div
            class="divisor"
            :class="{
              faded: !problemStarted,
              'highlight-operand': gridState.highlightDivisorForMultiplication,
            }"
            :style="divisorStyle"
          >
            {{ gridState.divisorDigits.join("") }}
          </div>

          <!-- New Vinculum: Vertical Bar -->
          <div
            class="vinculum-vertical-bar"
            :style="vinculumVerticalStyle"
          ></div>

          <!-- New Vinculum: Horizontal Bar -->
          <div
            class="vinculum-horizontal-bar"
            :style="vinculumHorizontalStyle"
          ></div>

          <!-- Quotient Digits with operand highlighting -->
          <transition-group name="digit" tag="div" class="quotient-group">
            <div
              v-for="(qInfo, index) in gridState.quotientDigits"
              :key="`q-${index}-${qInfo.columnIndex}`"
              class="grid-cell quotient-digit"
              :class="{
                highlighted: index === gridState.activeQuotientDigitIndex,
                'fade-in': true,
                'highlight-operand': qInfo.isOperand,
              }"
              :style="getQuotientCellStyle(qInfo.columnIndex)"
            >
              {{ qInfo.value }}
            </div>
          </transition-group>

          <!-- Dividend Digits -->
          <div
            v-for="(digit, index) in gridState.dividendDigits"
            :key="`d-${index}`"
            class="grid-cell dividend-digit"
            :class="{
              highlighted: isDividendDigitActive(index),
              'brought-down': isBroughtDownDigit(index),
              'bring-down-active': isCurrentlyBringingDownDigit(index),
              faded: !problemStarted && !isDividendDigitActive(index),
            }"
            :style="getDividendCellStyle(index)"
          >
            {{ digit }}
            <div
              v-if="isBroughtDownDigit(index)"
              class="bring-down-arrow"
              :class="{
                'bring-down-active': isCurrentlyBringingDownDigit(index),
              }"
            >
              ↓
            </div>
          </div>

          <!-- Calculation Lines with Subtraction Support -->
          <div class="calculation-lines-container">
            <transition-group
              name="calc-line"
              tag="div"
              class="calculation-lines-group"
            >
              <div
                v-for="(line, lineIndex) in gridState.calculationLines"
                :key="line.id"
                class="calculation-line-container"
                :data-line-type="line.type"
              >
                <!-- Minus Sign -->
                <div
                  v-if="line.showMinusSign"
                  class="minus-sign"
                  :style="getMinusSignStyle(lineIndex)"
                >
                  −
                </div>

                <!-- Calculation Line Characters -->
                <template
                  v-for="(char, charIndex) in line.value.split('')"
                  :key="`${line.id}-${charIndex}`"
                >
                  <div
                    v-if="char !== ' '"
                    class="grid-cell calc-digit"
                    :class="{
                      'fade-in': true,
                      highlighted:
                        line.id === gridState.activeCalculationLineId,
                      'product-line-char': line.type === 'product',
                      'subtraction-result-char':
                        line.type === 'subtractionResult' &&
                        line.id === gridState.activeCalculationLineId,
                      'brought-down-char':
                        line.type === 'broughtDownNumber' &&
                        isBroughtDownChar(line.id, charIndex),
                      'bring-down-target': isBringDownTarget(
                        line.id,
                        charIndex,
                      ),
                      'highlight-operand': line.isOperand,
                      'highlight-minuend': line.isMinuend,
                      'highlight-subtrahend': line.isSubtrahend,
                    }"
                    :style="getCalcCharStyle(charIndex, lineIndex)"
                  >
                    {{ char }}
                  </div>
                </template>
              </div>
            </transition-group>
          </div>

          <!-- Bring Down Visual Guide -->
          <div
            v-if="gridState.visualBringDownInfo"
            class="bring-down-guide"
            :style="getBringDownGuideStyle()"
          ></div>
        </div>
        <!-- Close stable-layout-container div -->
      </div>
    </div>
  </div>
  <div v-else class="grid-placeholder" :class="{ active: problemStarted }">
    <div class="placeholder-content">
      <svg
        class="placeholder-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12" y2="8"></line>
      </svg>
      <p>
        {{
          problemStarted ? "Loading..." : "Enter dividend and divisor to start"
        }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { GridState } from "../composables/useLongDivision";
import type { CSSProperties } from "vue";
import "./LongDivisionGridDisplayFixes.css";

const props = defineProps<{
  gridState: GridState | null;
  problemStarted: boolean;
}>();

// Grid layout computations
const gridColumns = computed(() => {
  if (!props.gridState) return 0;
  return Math.max(
    props.gridState.dividendDigits.length,
    props.gridState.quotientDigits.length,
    ...props.gridState.calculationLines.map((line) => line.value.length),
    1,
  );
});

const divisorWidth = computed(() =>
  props.gridState ? props.gridState.divisorDigits.length * 20 + 10 : 0,
);

const verticalBarWidth = "10px";

// Calculate the total height needed for all possible calculation steps
const calculateTotalRequiredHeight = () => {
  if (!props.gridState?.divisorDigits || !props.gridState?.dividendDigits) {
    return "200px";
  }

  // We need enough space for all potential calculation lines
  // For long division, the maximum number of lines is roughly 3 per digit in dividend
  // (each digit needs a bring down, multiplication, and subtraction line)
  const dividendLength = props.gridState.dividendDigits.length;
  const estimatedMaxLines = dividendLength * 3;

  // Standard rows + calculated rows (45px per line with some margin)
  return `${(estimatedMaxLines + 4) * 45}px`;
};

const gridContainerStyle = computed(
  (): CSSProperties => ({
    display: "grid",
    gridTemplateColumns: `${divisorWidth.value}px ${verticalBarWidth} repeat(${gridColumns.value}, 40px)`,
    gridTemplateRows: "auto auto auto", // Explicit rows for quotient, vinculum, and dividend
    gap: "2px",
    position: "relative" as const,
    alignItems: "center",
    justifyItems: "stretch", // Make items fill their cells
    minHeight: props.gridState?.calculationLines?.length
      ? `${(props.gridState.calculationLines.length + 4) * 45}px`
      : "200px", // Ensure there's enough vertical space
    // Lock the grid size to prevent layout shifts during animations
    height: calculateTotalRequiredHeight(),
    transition: "height 0.5s ease", // Smooth transition for height changes
  }),
);

const divisorStyle = computed(
  (): CSSProperties => ({
    gridColumn: "1",
    gridRow: "3", // Align with dividend row
    justifySelf: "flex-end",
    paddingRight: "10px",
    fontWeight: "500",
    fontSize: "1.5rem",
    transition: "opacity 0.3s ease",
    alignSelf: "center", // Center vertically
    display: "flex",
    alignItems: "center",
    height: "40px", // Match grid cell height
  }),
);

const vinculumVerticalStyle = computed(
  (): CSSProperties => ({
    gridColumn: "2",
    gridRow: "3",
    width: "2px",
    backgroundColor: "var(--text-color, #000)",
    height: "40px",
    justifySelf: "center",
    zIndex: 10, // Ensure it appears above other elements
  }),
);

const vinculumHorizontalStyle = computed(
  (): CSSProperties => ({
    gridColumn: `3 / span ${gridColumns.value}`,
    gridRow: "2",
    height: "2px",
    backgroundColor: "var(--text-color, #000)",
    alignSelf: "flex-end",
    width: "100%", // Make sure it spans the full width
    zIndex: 10, // Ensure it appears above other elements
    position: "relative", // For the curved part
    marginRight: "-5px", // Extend slightly to the right
  }),
);

// Helper functions for positioning
const getQuotientCellStyle = (columnIndex: number): CSSProperties => ({
  gridColumn: `${columnIndex + 3}`, // Position over the correct dividend digit
  gridRow: "1", // First row
  margin: "0 auto", // Center horizontally
  zIndex: 5, // Ensure it appears above other elements
});

const getDividendCellStyle = (index: number): CSSProperties => ({
  gridColumn: `${index + 3}`, // Position in the grid
  gridRow: "3", // Third row (below the vinculum)
  position: "relative", // For proper arrow positioning
  zIndex: 5, // Ensure visibility
});

const getCalcCharStyle = (
  charIndex: number,
  lineIndex: number,
): CSSProperties => {
  const line = props.gridState?.calculationLines[lineIndex];
  const cellWidth = 40; // Width of each grid cell
  const baseLeftOffset = divisorWidth.value + parseInt(verticalBarWidth); // Base left offset

  // Special handling for brought down numbers
  if (line?.type === "broughtDownNumber") {
    if (line.id.startsWith("broughtdown-")) {
      // Extract the dividend index from the ID (broughtdown-X)
      const broughtDownDigitIndex = parseInt(line.id.split("-")[1]);
      const positionFromEnd = line.value.length - 1 - charIndex;

      // Calculate the position relative to the original dividend positions
      const columnPosition = broughtDownDigitIndex - positionFromEnd;

      if (columnPosition >= 0) {
        // Use absolute positioning to prevent layout shifts
        return {
          position: "absolute",
          top: `${lineIndex * 45}px`, // 45px vertical spacing between lines
          left: `${baseLeftOffset + columnPosition * cellWidth}px`,
          width: `${cellWidth}px`,
          height: `${cellWidth}px`,
          zIndex: 6, // Ensure proper stacking
        };
      }
    }
  }

  // For product lines and subtraction results
  if (
    (line?.type === "product" || line?.type === "subtractionResult") &&
    line.value &&
    props.gridState?.activeDividendDigits
  ) {
    // Find related product/subtraction lines for proper alignment
    const valueTrimmed = line.value.trim();
    const valueLength = valueTrimmed.length;

    // Get the active dividend region
    const { start, end } = props.gridState.activeDividendDigits;

    // If we have an active region narrower than our value, align with the end
    // Otherwise, align with the exact position
    const effectiveEnd = Math.max(start + valueLength - 1, end);

    // For right alignment, we need to start from the effectiveEnd position
    const positionFromEnd = valueLength - 1 - charIndex;

    // This is the crucial adjustment - ensure proper column alignment
    const columnPosition = effectiveEnd - positionFromEnd;

    // Only render non-space characters and ensure we're not positioning off-grid
    if (line.value[charIndex] !== " " && columnPosition >= 0) {
      // Use absolute positioning to prevent layout shifts
      return {
        position: "absolute",
        top: `${lineIndex * 45}px`, // 45px vertical spacing between lines
        left: `${baseLeftOffset + columnPosition * cellWidth}px`,
        width: `${cellWidth}px`,
        height: `${cellWidth}px`,
        zIndex: 5,
      };
    }
  }

  // Default positioning for other calculation lines
  return {
    position: "absolute",
    top: `${lineIndex * 45}px`, // 45px vertical spacing between lines
    left: `${baseLeftOffset + charIndex * cellWidth}px`,
    width: `${cellWidth}px`,
    height: `${cellWidth}px`,
    zIndex: 4,
  };
};

// Additional helper for positioning minus sign
const getMinusSignStyle = (lineIndex: number): CSSProperties => ({
  position: "absolute",
  top: `${lineIndex * 45}px`, // 45px vertical spacing between lines
  left: `${divisorWidth.value + parseInt(verticalBarWidth) - 20}px`, // Left of the first calculation digit
  fontWeight: "bold",
  color: "var(--subtraction-color, #FF5722)",
  zIndex: 5, // Ensure visibility
  width: "20px",
  height: "40px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const isDividendDigitActive = (index: number): boolean => {
  if (!props.gridState?.activeDividendDigits) return false;
  const { start, end } = props.gridState.activeDividendDigits;
  return index >= start && index <= end;
};

const isBroughtDownDigit = (index: number): boolean => {
  if (props.gridState?.activeBroughtDownDividendIndex === undefined)
    return false;
  return props.gridState.activeBroughtDownDividendIndex === index;
};

// Additional helper functions for bring down visualization
const isCurrentlyBringingDownDigit = (index: number): boolean => {
  if (!props.gridState?.visualBringDownInfo) return false;
  return props.gridState.visualBringDownInfo.fromDividendIndex === index;
};

const isBroughtDownChar = (lineId: string, charIndex: number): boolean => {
  if (!props.gridState?.visualBringDownInfo) return false;
  return (
    lineId === props.gridState.visualBringDownInfo.targetLineId &&
    charIndex === props.gridState.visualBringDownInfo.targetCharIndexInLine
  );
};

const isBringDownTarget = (lineId: string, charIndex: number): boolean => {
  if (!props.gridState?.visualBringDownInfo) return false;
  return (
    lineId === props.gridState.visualBringDownInfo.targetLineId &&
    charIndex === props.gridState.visualBringDownInfo.targetCharIndexInLine
  );
};

const getBringDownGuideStyle = (): CSSProperties => {
  if (!props.gridState?.visualBringDownInfo) return {};
  const info = props.gridState.visualBringDownInfo;

  // Find the target calculation line index for precise endpoint
  const targetLineIndex = props.gridState.calculationLines.findIndex(
    (line) => line.id === info.targetLineId,
  );

  // Calculate absolute positions instead of using grid positioning
  const cellWidth = 40;
  const baseLeftOffset = divisorWidth.value + parseInt(verticalBarWidth);
  const leftPosition =
    baseLeftOffset + info.fromDividendIndex * cellWidth + cellWidth / 2 - 1;

  // Calculate the height based on the target line index
  const height =
    targetLineIndex >= 0
      ? targetLineIndex * 45 + 40 // Target line position + height of dividend cell
      : props.gridState.calculationLines.length * 45;

  return {
    position: "absolute",
    left: `${leftPosition}px`,
    top: "120px", // Start after the dividend row (roughly row 3)
    height: `${height}px`,
    opacity: 0.6,
    zIndex: 1, // Behind content
    width: "2px", // Ensure consistent width
    backgroundColor: "var(--success-border, #28a745)",
  };
};
</script>

<style scoped>
.long-division-grid {
  margin: 2rem auto;
  padding: 2rem;
  background-color: var(--fraction-bg, #ffffff);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 15px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
  max-width: 95%;
  overflow-x: auto;
  max-height: 80vh; /* Limit maximum height */
  overflow-y: auto; /* Enable vertical scrolling */
}

.grid-wrapper {
  position: relative;
  min-height: 200px;
  display: flex;
  justify-content: center;
  padding-bottom: 2rem; /* Add padding at the bottom for visibility */
}

.grid-container {
  font-family: "Fira Code", "Roboto Mono", monospace;
  font-size: 1.4rem;
  min-height: 200px;
  padding: 1rem;
  position: relative;
  display: grid;
  grid-auto-flow: dense; /* Ensure grid items are placed efficiently */
  grid-auto-rows: min-content; /* Allow rows to size to content */
  align-items: center; /* Center align items in grid cells */
  gap: 0.5rem; /* Add gap between grid items */
  justify-items: center; /* Center items horizontally */
  will-change: height; /* Optimize for height animations */
}

.grid-cell {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--grid-border-color, #e0e0e0);
  border-radius: 4px;
  transition: all 0.3s ease;
  position: relative;
  background-color: var(--cell-bg, white);
  margin: 0; /* Reset margins */
  box-sizing: border-box; /* Include border in width/height calculation */
  font-feature-settings: "tnum"; /* Use tabular numbers for better alignment */
  font-variant-numeric: tabular-nums; /* Ensure fixed-width numbers */
}

.divisor {
  color: var(--text-color);
}

.highlighted {
  background-color: var(--highlight-bg, #fff3cd);
  border-color: var(--highlight-border, #ffeeba);
  transform: scale(1.05);
  z-index: 1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.brought-down {
  background-color: var(--success-bg, #d4edda);
  border-color: var(--success-border, #c3e6cb);
}

.bring-down-arrow {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  color: var(--success-border, #28a745);
  font-size: 1.2rem;
  animation: bounce 1s ease infinite;
  opacity: 0.5;
  transition: opacity 0.3s ease;
  z-index: 10; /* Ensure it's displayed above other elements */
  pointer-events: none; /* Don't interfere with clicks */
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); /* Add shadow for better visibility */
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bring-down-arrow.bring-down-active {
  opacity: 1;
  animation: activeBounce 1s ease infinite;
  font-size: 1.4rem;
  color: var(--success-border, #28a745);
}

.bring-down-active {
  animation: highlight 1s ease infinite;
}

.brought-down-char {
  color: var(--success-border, #28a745);
  font-weight: 600;
}

/* Transition groups styling */
.calculation-lines-container {
  position: relative;
  grid-column: 1 / -1;
  grid-row: 4 / span 20; /* Reserve space for calculation lines */
  width: 100%;
  height: 100%;
}

.quotient-group {
  display: contents; /* This makes the div not affect the grid layout */
}

.calculation-lines-group {
  display: block; /* Changed from contents to prevent layout shifts */
  position: relative;
  width: 100%;
  height: 100%;
}

.calculation-line-container {
  position: relative; /* Use relative positioning instead of grid positioning */
  width: 100%;
  margin-bottom: 10px; /* Add consistent spacing between lines */
  min-height: 40px;
}

/* Add row separators for better visual grouping */
.calculation-line-container:has(.subtraction-result-char)::after {
  content: "";
  display: block;
  grid-column: 3 / span 20;
  grid-row: auto;
  height: 1px;
  background: var(--grid-border-color, #e0e0e0);
  margin-top: 8px;
  margin-bottom: 8px;
}

.bring-down-target {
  animation: targetPulse 1s ease infinite;
}

.product-line-char {
  color: var(--product-color, #2196f3);
}

.subtraction-result-char {
  color: var(--subtraction-color, #ff5722);
}

.faded {
  opacity: 0.5;
}

.grid-placeholder {
  text-align: center;
  padding: 3rem 2rem;
  background-color: var(--fraction-bg, #f8f9fa);
  border-radius: 12px;
  color: #6c757d;
  margin: 2rem 0;
  border: 2px dashed var(--grid-border-color, #e0e0e0);
  transition: all 0.3s ease;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.placeholder-icon {
  color: #6c757d;
  opacity: 0.5;
}

.bring-down-guide {
  position: absolute;
  width: 2px;
  background-color: var(--success-border, #28a745);
  transform-origin: top;
  animation: guideGrow 0.5s ease-out;
  pointer-events: none; /* Don't interfere with interaction */
}

.minus-sign {
  font-size: 1.4rem;
  padding: 0 0.5rem;
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
}

.highlight-minuend {
  background-color: var(--highlight-minuend-bg, #e3f2fd);
  border-color: var(--highlight-minuend-border, #90caf9);
  font-weight: 600;
  position: relative;
}

/* Add indicator for minuend */
.highlight-minuend::before {
  content: "";
  position: absolute;
  height: 2px;
  background-color: var(--subtraction-color, #ff5722);
  width: 80%;
  bottom: -10px;
  left: 10%;
  opacity: 0.7;
}

.highlight-subtrahend {
  background-color: var(--highlight-subtrahend-bg, #ffebee);
  border-color: var(--highlight-subtrahend-border, #ef9a9a);
  font-weight: 600;
  animation: subtrahendPulse 2s ease-in-out infinite;
}

@keyframes subtrahendPulse {
  0%,
  100% {
    transform: scale(1);
    background-color: var(--highlight-subtrahend-bg, #ffebee);
  }
  50% {
    transform: scale(1.05);
    background-color: var(--highlight-subtrahend-bg-light, #fff3f3);
  }
}

@keyframes guideGrow {
  from {
    transform: scaleY(0);
  }
  to {
    transform: scaleY(1);
  }
}

@keyframes activeBounce {
  0%,
  100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-8px);
  }
}

@keyframes highlight {
  0%,
  100% {
    background-color: var(--success-bg, #d4edda);
    transform: scale(1);
  }
  50% {
    background-color: var(--success-bg, #d4edda);
    transform: scale(1.1);
  }
}

@keyframes targetPulse {
  0%,
  100% {
    transform: scale(1);
    background-color: var(--success-bg, #d4edda);
  }
  50% {
    transform: scale(1.1);
    background-color: var(--success-bg-light, #e8f5e9);
  }
}

.digit-enter-active,
.digit-leave-active {
  transition: all 0.3s ease;
  position: relative;
  z-index: 10;
}

.calc-line-enter-active,
.calc-line-leave-active {
  transition: opacity 0.3s ease; /* Only fade in/out, no movement */
  position: absolute; /* Prevent affecting layout */
  width: 100%;
}

.digit-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.calc-line-enter-from {
  opacity: 0;
}

.digit-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.calc-line-leave-to {
  opacity: 0;
}

.fade-in {
  animation: fadeIn 0.3s ease;
}

.calc-digit.fade-in {
  animation: calcDigitFadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes calcDigitFadeIn {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  70% {
    opacity: 1;
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.highlight-operand {
  background-color: var(--highlight-bg, #fff3cd);
  border-color: var(--highlight-border, #ffeeba);
  font-weight: 600;
  animation: operandPulse 2s ease-in-out infinite;
}

@keyframes operandPulse {
  0%,
  100% {
    transform: scale(1);
    background-color: var(--highlight-bg, #fff3cd);
  }
  50% {
    transform: scale(1.05);
    background-color: var(--highlight-bg-light, #fff9e6);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .long-division-grid {
    background-color: var(--fraction-bg, #2a2a2a);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2), 0 10px 15px rgba(0, 0, 0, 0.1);
  }

  .grid-cell {
    background-color: var(--cell-bg, #1a1a1a);
    border-color: var(--grid-border-color, #404040);
  }

  .divisor {
    color: var(--text-color-dark, #fff);
  }

  .highlighted {
    background-color: var(--highlight-bg-dark, #332701);
    border-color: var(--highlight-border-dark, #856404);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .brought-down {
    background-color: var(--success-bg-dark, #0a2b0d);
    border-color: var(--success-border-dark, #155724);
  }

  .grid-placeholder {
    background-color: var(--fraction-bg, #2a2a2a);
    border-color: var(--grid-border-color, #404040);
    color: #adb5bd;
  }

  .product-line-char {
    color: var(--product-color-dark, #64b5f6);
  }

  .subtraction-result-char {
    color: var(--subtraction-color-dark, #ff8a65);
  }

  .bring-down-guide {
    background-color: var(--success-border-dark, #28a745);
  }

  .bring-down-arrow {
    color: var(--success-border-dark, #28a745);
  }

  .brought-down-char {
    color: var(--success-border-dark, #28a745);
  }

  .bring-down-target {
    animation: targetPulseDark 1s ease infinite;
  }

  .highlight-operand {
    background-color: var(--highlight-bg-dark, #332701);
    border-color: var(--highlight-border-dark, #856404);
  }

  .highlight-minuend {
    background-color: var(--highlight-minuend-bg-dark, #0d47a1);
    border-color: var(--highlight-minuend-border-dark, #1976d2);
  }

  .highlight-subtrahend {
    background-color: var(--highlight-subtrahend-bg-dark, #b71c1c);
    border-color: var(--highlight-subtrahend-border-dark, #d32f2f);
  }

  @keyframes subtrahendPulse {
    0%,
    100% {
      transform: scale(1);
      background-color: var(--highlight-subtrahend-bg-dark, #b71c1c);
    }
    50% {
      transform: scale(1.05);
      background-color: var(--highlight-subtrahend-bg-dark-light, #c62828);
    }
  }

  .minus-sign {
    color: var(--subtraction-color-dark, #ff8a65);
  }

  @keyframes operandPulse {
    0%,
    100% {
      transform: scale(1);
      background-color: var(--highlight-bg-dark, #332701);
    }
    50% {
      transform: scale(1.05);
      background-color: var(--highlight-bg-dark-light, #443601);
    }
  }
}

@keyframes targetPulseDark {
  0%,
  100% {
    transform: scale(1);
    background-color: var(--success-bg-dark, #0a2b0d);
  }
  50% {
    transform: scale(1.1);
    background-color: var(--success-bg-dark-light, #103a14);
  }
}

@media (max-width: 600px) {
  .long-division-grid {
    padding: 1rem;
    margin: 1rem auto;
  }

  .grid-cell {
    width: 32px;
    height: 32px;
    font-size: 1.1rem;
  }

  .divisor {
    font-size: 1.2rem;
    padding-right: 8px;
  }

  .bring-down-arrow {
    font-size: 1rem;
    top: -16px;
  }
}
</style>
