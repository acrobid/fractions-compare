<script setup lang="ts">
import { ref, computed } from "vue";
import { motion } from "motion-v";

const MIN = -10;
const MAX = 10;
const INITIAL = 5;

// SVG viewBox constants
const SW = 400;
const LX1 = 28; // line start x
const LX2 = 372; // line end x
const LY = 50; // line y

function vx(v: number): number {
  return LX1 + ((v - MIN) / (MAX - MIN)) * (LX2 - LX1);
}

// Current state
const currentValue = ref(INITIAL);
const lastEquation = ref("");
const atLimit = ref(false);

// Marker left position as % of container width (centered on value position)
const markerLeftPct = computed(() => (vx(currentValue.value) / SW) * 100);
const initLeftPct = (vx(INITIAL) / SW) * 100;

// Tick data (static)
const ticks = Array.from({ length: MAX - MIN + 1 }, (_, i) => {
  const v = MIN + i;
  return { v, x: vx(v), major: v % 5 === 0, isZero: v === 0 };
});
const minorTicks = ticks.filter((t) => !t.major);
const majorTicks = ticks.filter((t) => t.major);

// Operations
const ops = [
  { key: "m1", label: "× 1", sym: "×", arg: "1", type: "multiply" },
  { key: "mn1", label: "× −1", sym: "×", arg: "−1", type: "multiply" },
  { key: "p1", label: "+ 1", sym: "+", arg: "1", type: "add" },
  { key: "s1", label: "− 1", sym: "−", arg: "1", type: "subtract" },
] as const;

type OpKey = (typeof ops)[number]["key"];

function applyOp(key: OpKey) {
  const prev = currentValue.value;
  let next: number;

  switch (key) {
    case "m1":
      next = prev * 1;
      lastEquation.value = `${prev} × 1 = ${prev * 1}`;
      break;
    case "mn1":
      next = prev * -1;
      lastEquation.value = `${prev} × −1 = ${prev * -1}`;
      break;
    case "p1":
      next = prev + 1;
      lastEquation.value = `${prev} + 1 = ${prev + 1}`;
      break;
    case "s1":
      next = prev - 1;
      lastEquation.value = `${prev} − 1 = ${prev - 1}`;
      break;
  }

  const clamped = Math.max(MIN, Math.min(MAX, next));
  if (next !== clamped) {
    atLimit.value = true;
    setTimeout(() => (atLimit.value = false), 600);
  }
  currentValue.value = clamped;
}

function reset() {
  currentValue.value = INITIAL;
  lastEquation.value = "";
  atLimit.value = false;
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
      <div class="nl-equation-wrap">
        <motion.span
          v-if="lastEquation"
          class="nl-equation"
          :key="lastEquation"
          :initial="{ opacity: 0, y: -8 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.25 }"
        >
          {{ lastEquation }}
        </motion.span>
      </div>
    </div>

    <!-- Number line track -->
    <div class="nl-track-area" :class="{ 'nl-shake': atLimit }">
      <!-- Static SVG: line, arrows, ticks, labels -->
      <svg
        class="nl-svg"
        viewBox="0 0 400 90"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <!-- Positive region highlight -->
        <rect
          :x="vx(0)"
          :y="LY - 2"
          :width="vx(MAX) - vx(0)"
          height="4"
          fill="#42b88326"
          rx="2"
        />

        <!-- Main line -->
        <line
          :x1="LX1"
          :y1="LY"
          :x2="LX2"
          :y2="LY"
          stroke="#42b883"
          stroke-width="2.5"
          stroke-linecap="round"
        />

        <!-- Arrow left -->
        <polygon
          :points="`${LX1 - 2},${LY - 7} ${LX1 - 15},${LY} ${LX1 - 2},${LY + 7}`"
          fill="#42b883"
        />
        <!-- Arrow right -->
        <polygon
          :points="`${LX2 + 2},${LY - 7} ${LX2 + 15},${LY} ${LX2 + 2},${LY + 7}`"
          fill="#42b883"
        />

        <!-- Minor ticks -->
        <line
          v-for="tick in minorTicks"
          :key="tick.v"
          :x1="tick.x"
          :y1="LY - 5"
          :x2="tick.x"
          :y2="LY + 5"
          stroke="#42b883"
          stroke-width="1"
          opacity="0.45"
        />

        <!-- Major ticks + labels -->
        <g v-for="tick in majorTicks" :key="tick.v">
          <line
            :x1="tick.x"
            :y1="LY - (tick.isZero ? 14 : 10)"
            :x2="tick.x"
            :y2="LY + (tick.isZero ? 14 : 10)"
            stroke="#42b883"
            :stroke-width="tick.isZero ? 3 : 2"
          />
          <text
            :x="tick.x"
            :y="LY + 27"
            text-anchor="middle"
            class="nl-tick-label"
          >
            {{ tick.v }}
          </text>
        </g>
      </svg>

      <!-- Animated marker -->
      <motion.div
        class="nl-marker"
        :class="{
          'is-negative': currentValue < 0,
          'is-zero': currentValue === 0,
        }"
        :initial="{ left: initLeftPct + '%' }"
        :animate="{ left: markerLeftPct + '%' }"
        :transition="{ type: 'spring', stiffness: 90, damping: 13 }"
      >
        {{ currentValue }}
      </motion.div>
    </div>

    <!-- Limit warning -->
    <div class="nl-limit-msg" :class="{ visible: atLimit }">
      Limit reached (−10 to 10)
    </div>

    <!-- Operation buttons -->
    <div class="nl-ops-grid">
      <motion.button
        v-for="(op, i) in ops"
        :key="op.key"
        class="nl-op-btn"
        :class="op.type"
        @click="applyOp(op.key)"
        :initial="{ opacity: 0, scale: 0.9 }"
        :animate="{ opacity: 1, scale: 1 }"
        :transition="{ duration: 0.2, delay: 0.05 + i * 0.05 }"
        :while-hover="{ scale: 1.05, y: -2 }"
        :while-tap="{ scale: 0.95, y: 0 }"
      >
        {{ op.label }}
      </motion.button>
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
  padding: 1.25rem 0 0.75rem;
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
  margin-bottom: 0.75rem;
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

.nl-equation-wrap {
  min-height: 1.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nl-equation {
  font-size: 1rem;
  font-weight: 600;
  color: #42b883;
}

/* ── Number line track ─────────────────────────────── */
.nl-track-area {
  position: relative;
  width: 100%;
  /* Maintain SVG aspect ratio: SH/SW = 90/400 = 22.5% */
  padding-bottom: 22.5%;
  margin: 1.25rem 0 0.5rem;
}

.nl-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.nl-tick-label {
  font-size: 13px;
  fill: #666;
  font-family: inherit;
}

/* ── Animated marker ───────────────────────────────── */
.nl-marker {
  position: absolute;
  top: 55.56%; /* LY / SH = 50/90 */
  width: 36px;
  height: 36px;
  margin-left: -18px; /* center on the left position */
  margin-top: -18px; /* center vertically on line */
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
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-6px);
  }
  40% {
    transform: translateX(6px);
  }
  60% {
    transform: translateX(-4px);
  }
  80% {
    transform: translateX(4px);
  }
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
  margin-bottom: 0.25rem;
}

.nl-limit-msg.visible {
  opacity: 1;
}

/* ── Operation buttons ─────────────────────────────── */
.nl-ops-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin: 0.75rem 0 1.25rem;
}

.nl-op-btn {
  padding: 1.1rem 0.5rem;
  border: none;
  border-radius: 14px;
  font-size: 1.3rem;
  font-weight: 700;
  cursor: pointer;
  color: #fff;
  letter-spacing: 0.02em;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
  transition: box-shadow 0.15s ease;
}

.nl-op-btn.multiply {
  background: #42b883;
  box-shadow: 0 3px 10px rgba(66, 184, 131, 0.35);
}

.nl-op-btn.add {
  background: #3498db;
  box-shadow: 0 3px 10px rgba(52, 152, 219, 0.35);
}

.nl-op-btn.subtract {
  background: #e74c3c;
  box-shadow: 0 3px 10px rgba(231, 76, 60, 0.35);
}

/* ── Reset button ──────────────────────────────────── */
.nl-reset-wrap {
  text-align: center;
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

  .nl-tick-label {
    fill: #aaa;
  }

  .nl-equation {
    color: #5dcfa2;
  }

  .nl-reset-btn {
    color: #5dcfa2;
    border-color: #5dcfa2;
  }

  .nl-reset-btn:hover {
    background: #5dcfa2;
    color: #1a1a1a;
  }

  .nl-op-btn {
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.35);
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

  .nl-op-btn {
    font-size: 1.15rem;
    padding: 1rem 0.5rem;
  }
}

@media (min-width: 640px) {
  .nl-op-btn {
    font-size: 1.4rem;
    padding: 1.2rem 0.5rem;
  }
}
</style>
