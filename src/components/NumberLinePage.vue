<script setup lang="ts">
import { ref, computed } from "vue";
import { motion } from "motion-v";

const MIN = -10;
const MAX = 10;
const INITIAL = 5;

// SVG viewBox constants
const SW = 400;
const SH = 90; // viewBox height
const LX1 = 28; // line start x
const LX2 = 372; // line end x
const LY = 55; // line y (shifted down a little for region labels above)
// x position for zero on the number line
const ZERO_X = LX1 + ((0 - MIN) / (MAX - MIN)) * (LX2 - LX1);
// marker vertical center as % of container height
const MARKER_TOP_PCT = (LY / SH) * 100;

function vx(v: number): number {
  return LX1 + ((v - MIN) / (MAX - MIN)) * (LX2 - LX1);
}

// Current state
const currentValue = ref(INITIAL);
const lastOp = ref<{ equation: string; opType: "multiply" | "add" } | null>(
  null
);
const atLimit = ref(false);

// Marker left position as % of container width (centered on value position)
const markerLeftPct = computed(() => (vx(currentValue.value) / SW) * 100);
const initLeftPct = (vx(INITIAL) / SW) * 100;

// Animation state: re-mount marker on each op to retrigger the arc
const prevLeftPct = ref(initLeftPct);
const animKey = ref(0);
// Arc height in pixels (translateY) — negative = upward
const ARC_Y = -55;

// Sign label and class for the value circle
const signLabel = computed(() => {
  if (currentValue.value > 0) return "positive";
  if (currentValue.value < 0) return "negative";
  return "zero";
});

// Tick data (static)
const ticks = Array.from({ length: MAX - MIN + 1 }, (_, i) => {
  const v = MIN + i;
  return { v, x: vx(v), major: v % 5 === 0, isZero: v === 0 };
});
const minorTicks = ticks.filter((t) => !t.major);
const majorTicks = ticks.filter((t) => t.major);

// Tick color by sign (negative = red, positive = green, zero = grey)
function tickFill(v: number): string {
  if (v < 0) return "#e74c3c";
  if (v > 0) return "#42b883";
  return "#7f8c8d";
}

// Operation groups — negative on left, positive on right
const multiplyOps = [
  { key: "mn1" as const, sym: "×", num: "−1", numNeg: true },   // left = negative
  { key: "m1" as const, sym: "×", num: "1", numNeg: false },    // right = positive
];
const addOps = [
  { key: "pn1" as const, sym: "+", num: "(−1)", numNeg: true },  // left = negative
  { key: "p1" as const, sym: "+", num: "1", numNeg: false },     // right = positive
];

type OpKey = "m1" | "mn1" | "p1" | "pn1";

// Format a number for the equation: negative numbers get parentheses
function formatNum(n: number): string {
  if (n < 0) return `(−${Math.abs(n)})`;
  return String(n);
}

function applyOp(key: OpKey) {
  const prev = currentValue.value;
  // Capture position before update so the new marker element can start there
  prevLeftPct.value = (vx(prev) / SW) * 100;
  let next: number;
  let equation: string;
  let opType: "multiply" | "add";

  switch (key) {
    case "m1":
      next = prev * 1;
      equation = `${formatNum(prev)} × 1 = ${formatNum(next)}`;
      opType = "multiply";
      break;
    case "mn1":
      next = prev * -1;
      equation = `${formatNum(prev)} × (−1) = ${formatNum(next)}`;
      opType = "multiply";
      break;
    case "p1":
      next = prev + 1;
      equation = `${formatNum(prev)} + 1 = ${formatNum(next)}`;
      opType = "add";
      break;
    case "pn1":
      next = prev - 1;
      equation = `${formatNum(prev)} + (−1) = ${formatNum(next)}`;
      opType = "add";
      break;
  }

  const clamped = Math.max(MIN, Math.min(MAX, next));
  if (next !== clamped) {
    atLimit.value = true;
    setTimeout(() => (atLimit.value = false), 600);
  }
  currentValue.value = clamped;
  lastOp.value = { equation, opType };
  animKey.value++;
}

function reset() {
  prevLeftPct.value = (vx(currentValue.value) / SW) * 100;
  currentValue.value = INITIAL;
  lastOp.value = null;
  atLimit.value = false;
  animKey.value++;
}
</script>

<template>
  <motion.div
    class="nl-page"
    :initial="{ opacity: 0, y: 20 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.3, ease: 'easeOut' }"
  >
    <!-- Current value display -->
    <div class="nl-value-section">
      <div class="nl-value-label">Current Value</div>
      <div
        class="nl-value-circle"
        :class="{
          'is-negative': currentValue < 0,
          'is-zero': currentValue === 0,
        }"
      >
        <motion.span
          class="nl-value-num"
          :key="currentValue"
          :initial="{ scale: 0.5, opacity: 0 }"
          :animate="{ scale: 1, opacity: 1 }"
          :transition="{ type: 'spring', stiffness: 300, damping: 18 }"
        >
          {{ currentValue }}
        </motion.span>
      </div>
      <div
        class="nl-sign-badge"
        :class="{
          'is-negative': currentValue < 0,
          'is-zero': currentValue === 0,
        }"
      >
        {{ signLabel }}
      </div>
      <!-- Equation display -->
      <div class="nl-equation-wrap">
        <motion.div
          v-if="lastOp"
          class="nl-equation"
          :class="lastOp.opType"
          :key="lastOp.equation"
          :initial="{ opacity: 0, y: -8 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.25 }"
        >
          {{ lastOp.equation }}
        </motion.div>
      </div>
    </div>

    <!-- Number line track -->
    <div class="nl-track-area" :class="{ 'nl-shake': atLimit }">
      <!-- SVG: two-colored line, arrows, ticks, labels -->
      <svg
        class="nl-svg"
        viewBox="0 0 400 90"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <!-- Region labels -->
        <text x="14" y="18" class="nl-region-label" fill="#e74c3c">negative</text>
        <text x="386" y="18" text-anchor="end" class="nl-region-label" fill="#42b883">positive</text>

        <!-- Negative half of line (left → zero) -->
        <line
          :x1="LX1"
          :y1="LY"
          :x2="ZERO_X"
          :y2="LY"
          stroke="#e74c3c"
          stroke-width="2.5"
          stroke-linecap="round"
        />
        <!-- Positive half of line (zero → right) -->
        <line
          :x1="ZERO_X"
          :y1="LY"
          :x2="LX2"
          :y2="LY"
          stroke="#42b883"
          stroke-width="2.5"
          stroke-linecap="round"
        />

        <!-- Arrow left (negative direction) -->
        <polygon
          :points="`${LX1 - 2},${LY - 7} ${LX1 - 15},${LY} ${LX1 - 2},${LY + 7}`"
          fill="#e74c3c"
        />
        <!-- Arrow right (positive direction) -->
        <polygon
          :points="`${LX2 + 2},${LY - 7} ${LX2 + 15},${LY} ${LX2 + 2},${LY + 7}`"
          fill="#42b883"
        />

        <!-- Minor ticks (colored by sign) -->
        <line
          v-for="tick in minorTicks"
          :key="tick.v"
          :x1="tick.x"
          :y1="LY - 5"
          :x2="tick.x"
          :y2="LY + 5"
          :stroke="tickFill(tick.v)"
          stroke-width="1"
          opacity="0.5"
        />

        <!-- Major ticks + labels (colored by sign) -->
        <g v-for="tick in majorTicks" :key="tick.v">
          <line
            :x1="tick.x"
            :y1="LY - (tick.isZero ? 14 : 10)"
            :x2="tick.x"
            :y2="LY + (tick.isZero ? 14 : 10)"
            :stroke="tickFill(tick.v)"
            :stroke-width="tick.isZero ? 3 : 2"
          />
          <text
            :x="tick.x"
            :y="LY + 27"
            text-anchor="middle"
            class="nl-tick-label"
            :fill="tickFill(tick.v)"
          >
            {{ tick.v }}
          </text>
        </g>
      </svg>

      <!-- Animated marker: re-mounts on each op to retrigger the arc -->
      <motion.div
        :key="animKey"
        class="nl-marker"
        :class="{
          'is-negative': currentValue < 0,
          'is-zero': currentValue === 0,
        }"
        :initial="{ left: prevLeftPct + '%', y: 0 }"
        :animate="{
          left: markerLeftPct + '%',
          y: animKey > 0 ? [0, ARC_Y, 0] : 0,
        }"
        :transition="{
          left: { type: 'tween', duration: 0.5, ease: 'easeInOut' },
          y: { duration: 0.5, times: [0, 0.4, 1], ease: 'easeInOut' },
        }"
      >
        {{ currentValue }}
      </motion.div>
    </div>

    <!-- Limit warning -->
    <div class="nl-limit-msg" :class="{ visible: atLimit }">
      Limit reached (−10 to 10)
    </div>

    <!-- ── Multiply group ───────────────────────────── -->
    <div class="nl-ops-group multiply-group">
      <div class="nl-ops-group-header">
        <span class="header-icon">×</span> Multiply
      </div>
      <div class="nl-ops-row">
        <motion.button
          v-for="(op, i) in multiplyOps"
          :key="op.key"
          class="nl-op-btn multiply"
          :class="{ 'btn-neg': op.numNeg }"
          :aria-label="op.numNeg ? 'multiply by negative one' : 'multiply by one'"
          @click="applyOp(op.key)"
          :initial="{ opacity: 0, scale: 0.9 }"
          :animate="{ opacity: 1, scale: 1 }"
          :transition="{ duration: 0.2, delay: 0.05 + i * 0.06 }"
          :while-hover="{ scale: 1.05, y: -2 }"
          :while-tap="{ scale: 0.95, y: 0 }"
        >
          <span class="btn-sym">{{ op.sym }}</span>
          <span class="btn-num" :class="{ neg: op.numNeg }">{{ op.num }}</span>
        </motion.button>
      </div>
    </div>

    <!-- ── Add group ─────────────────────────────────── -->
    <div class="nl-ops-group add-group">
      <div class="nl-ops-group-header">
        <span class="header-icon">+</span> Add
      </div>
      <div class="nl-ops-row">
        <motion.button
          v-for="(op, i) in addOps"
          :key="op.key"
          class="nl-op-btn add"
          :class="{ 'btn-neg': op.numNeg }"
          :aria-label="op.numNeg ? 'add negative one' : 'add one'"
          @click="applyOp(op.key)"
          :initial="{ opacity: 0, scale: 0.9 }"
          :animate="{ opacity: 1, scale: 1 }"
          :transition="{ duration: 0.2, delay: 0.17 + i * 0.06 }"
          :while-hover="{ scale: 1.05, y: -2 }"
          :while-tap="{ scale: 0.95, y: 0 }"
        >
          <span class="btn-sym">{{ op.sym }}</span>
          <span class="btn-num" :class="{ neg: op.numNeg }">{{ op.num }}</span>
        </motion.button>
      </div>
    </div>

    <!-- Reset -->
    <div class="nl-reset-wrap">
      <motion.button
        class="nl-reset-btn"
        @click="reset"
        :while-hover="{ scale: 1.03 }"
        :while-tap="{ scale: 0.97 }"
      >
        Reset to 5
      </motion.button>
    </div>
  </motion.div>
</template>

<style scoped>
/* ── Page wrapper ─────────────────────────────────── */
.nl-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 0.5rem 0 2rem;
}

/* ── Value display ─────────────────────────────────── */
.nl-value-section {
  text-align: center;
  padding: 1.25rem 0 0.5rem;
}

.nl-value-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #888;
  margin-bottom: 0.6rem;
}

.nl-value-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #42b883;
  color: #fff;
  margin-bottom: 0.4rem;
  box-shadow: 0 4px 16px rgba(66, 184, 131, 0.45);
  transition: background 0.35s ease, box-shadow 0.35s ease;
}

.nl-value-circle.is-negative {
  background: #e74c3c;
  box-shadow: 0 4px 16px rgba(231, 76, 60, 0.45);
}

.nl-value-circle.is-zero {
  background: #7f8c8d;
  box-shadow: 0 4px 16px rgba(127, 140, 141, 0.35);
}

.nl-value-num {
  font-size: 2.4rem;
  font-weight: 700;
  line-height: 1;
  display: inline-block;
}

/* Sign badge below the circle */
.nl-sign-badge {
  display: inline-block;
  padding: 0.2rem 0.85rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: #42b88322;
  color: #42b883;
  margin-bottom: 0.6rem;
  transition: background 0.35s ease, color 0.35s ease;
}

.nl-sign-badge.is-negative {
  background: #e74c3c22;
  color: #e74c3c;
}

.nl-sign-badge.is-zero {
  background: #7f8c8d22;
  color: #7f8c8d;
}

.nl-equation-wrap {
  min-height: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Equation color by operation type */
.nl-equation {
  font-size: 1.05rem;
  font-weight: 700;
  padding: 0.2rem 0.75rem;
  border-radius: 8px;
}

.nl-equation.multiply {
  color: #7209b7;
  background: #7209b715;
}

.nl-equation.add {
  color: #2563eb;
  background: #2563eb15;
}

/* ── Number line track ─────────────────────────────── */
.nl-track-area {
  position: relative;
  width: 100%;
  padding-bottom: 22.5%; /* 90/400 ratio */
  /* extra top margin gives the arc room to breathe above the line */
  margin: 2.5rem 0 0.25rem;
  overflow: visible;
}

.nl-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.nl-region-label {
  font-size: 11px;
  font-family: inherit;
  font-weight: 600;
  opacity: 0.75;
}

.nl-tick-label {
  font-size: 13px;
  font-family: inherit;
}

/* ── Animated marker ───────────────────────────────── */
.nl-marker {
  position: absolute;
  /* LY / SH × 100 — computed from MARKER_TOP_PCT constant */
  top: v-bind("MARKER_TOP_PCT + '%'");
  width: 36px;
  height: 36px;
  margin-left: -18px;
  margin-top: -18px;
  border-radius: 50%;
  background: #42b883;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(66, 184, 131, 0.55);
  pointer-events: none;
  z-index: 10;
  transition: background 0.35s ease, box-shadow 0.35s ease;
}

.nl-marker.is-negative {
  background: #e74c3c;
  box-shadow: 0 2px 10px rgba(231, 76, 60, 0.55);
}

.nl-marker.is-zero {
  background: #7f8c8d;
  box-shadow: 0 2px 10px rgba(127, 140, 141, 0.4);
}

/* Limit shake */
@keyframes nl-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

.nl-shake {
  animation: nl-shake 0.5s ease;
}

/* ── Limit message ─────────────────────────────────── */
.nl-limit-msg {
  text-align: center;
  font-size: 0.82rem;
  color: #e74c3c;
  font-weight: 500;
  min-height: 1.25rem;
  opacity: 0;
  transition: opacity 0.2s ease;
  margin-bottom: 0.5rem;
}

.nl-limit-msg.visible {
  opacity: 1;
}

/* ── Operation groups ──────────────────────────────── */
.nl-ops-group {
  border-radius: 16px;
  padding: 0.75rem 0.75rem 0.85rem;
  margin-bottom: 0.75rem;
  border: 2px solid transparent;
}

.multiply-group {
  background: #7209b70a;
  border-color: #7209b730;
}

.add-group {
  background: #2563eb0a;
  border-color: #2563eb30;
}

.nl-ops-group-header {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.6rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.multiply-group .nl-ops-group-header {
  color: #7209b7;
}

.add-group .nl-ops-group-header {
  color: #2563eb;
}

.header-icon {
  font-size: 1rem;
  font-weight: 900;
  line-height: 1;
}

/* ── Operation button rows ─────────────────────────── */
.nl-ops-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.65rem;
}

.nl-op-btn {
  padding: 0.85rem 0.5rem 0.75rem;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.14);
}

/* Operator symbol (× or +) */
.btn-sym {
  font-size: 1.5rem;
  font-weight: 900;
  line-height: 1;
  opacity: 0.9;
}

/* Number part of button */
.btn-num {
  font-size: 1.4rem;
  font-weight: 800;
  line-height: 1;
}

/* Negative number in button = bright amber, stands out on both purple and blue */
.btn-num.neg {
  color: #ffd166;
}

/* Multiply buttons: purple */
.nl-op-btn.multiply {
  background: #7209b7;
  box-shadow: 0 3px 12px rgba(114, 9, 183, 0.35);
}

/* Add positive: deep blue */
.nl-op-btn.add:not(.btn-neg) {
  background: #2563eb;
  box-shadow: 0 3px 12px rgba(37, 99, 235, 0.35);
}

/* Add negative (+ (−1)): coral-red to reinforce "negative" */
.nl-op-btn.add.btn-neg {
  background: #c0392b;
  box-shadow: 0 3px 12px rgba(192, 57, 43, 0.35);
}

/* ── Reset button ──────────────────────────────────── */
.nl-reset-wrap {
  text-align: center;
  margin-top: 0.5rem;
}

.nl-reset-btn {
  padding: 0.7rem 2.25rem;
  border: 2px solid #42b883;
  border-radius: 999px;
  background: transparent;
  color: #42b883;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.nl-reset-btn:hover {
  background: #42b883;
  color: #fff;
}

/* ── Dark mode ─────────────────────────────────────── */
@media (prefers-color-scheme: dark) {
  .nl-value-label {
    color: #999;
  }

  .nl-equation.multiply {
    color: #c77dff;
    background: #7209b720;
  }

  .nl-equation.add {
    color: #93c5fd;
    background: #2563eb20;
  }

  .multiply-group {
    background: #7209b712;
    border-color: #7209b740;
  }

  .add-group {
    background: #2563eb12;
    border-color: #2563eb40;
  }

  .multiply-group .nl-ops-group-header {
    color: #c77dff;
  }

  .add-group .nl-ops-group-header {
    color: #93c5fd;
  }

  .nl-reset-btn {
    color: #5dcfa2;
    border-color: #5dcfa2;
  }

  .nl-reset-btn:hover {
    background: #5dcfa2;
    color: #1a1a1a;
  }
}

/* ── Responsive ────────────────────────────────────── */
@media (max-width: 480px) {
  .nl-value-num {
    font-size: 2rem;
  }

  .nl-value-circle {
    width: 70px;
    height: 70px;
  }

  .btn-sym {
    font-size: 1.3rem;
  }

  .btn-num {
    font-size: 1.2rem;
  }

  .nl-op-btn {
    padding: 0.75rem 0.5rem 0.65rem;
  }
}

@media (min-width: 640px) {
  .btn-sym {
    font-size: 1.7rem;
  }

  .btn-num {
    font-size: 1.6rem;
  }

  .nl-op-btn {
    padding: 1rem 0.5rem 0.9rem;
  }
}
</style>
