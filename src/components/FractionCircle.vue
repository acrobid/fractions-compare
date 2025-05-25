<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from "vue";
import { motion } from "motion-v";

const props = defineProps<{
  numerator: number;
  denominator: number;
}>();

// Generate unique ID for this component instance
const componentId = Math.random().toString(36).substr(2, 9);

// Control animation state - only animate on first mount
const hasAnimated = ref(false);
const previousNumerator = ref(props.numerator);
const isDestructing = ref(false);
const destructionTimer = ref<number | NodeJS.Timeout | null>(null);

onMounted(() => {
  // Mark as animated after mount to prevent re-animation on prop changes
  hasAnimated.value = true;
});

onUnmounted(() => {
  // Clean up any pending timers
  if (destructionTimer.value) {
    clearTimeout(destructionTimer.value);
  }
});

// Watch for decreases in numerator to trigger destruction animation
watch(
  () => props.numerator,
  (newVal, oldVal) => {
    // Clear any existing timer
    if (destructionTimer.value) {
      clearTimeout(destructionTimer.value);
      destructionTimer.value = null;
    }

    if (newVal < oldVal) {
      isDestructing.value = true;
      // Wait for destruction animation to complete before resetting
      destructionTimer.value = setTimeout(() => {
        isDestructing.value = false;
        previousNumerator.value = newVal;
        destructionTimer.value = null;
      }, 900); // Wait for full 800ms destruction animation + buffer
    } else {
      // For increases, update immediately
      isDestructing.value = false;
      previousNumerator.value = newVal;
    }
  },
);

const segments = computed(() => {
  const result = [];
  const currentNum = isDestructing.value
    ? previousNumerator.value
    : props.numerator;

  for (let i = 0; i < props.denominator; i++) {
    const startAngle = (i * 360) / props.denominator;
    const endAngle = ((i + 1) * 360) / props.denominator;
    const filled = i < currentNum;
    const shouldDestruct =
      isDestructing.value &&
      i >= props.numerator &&
      i < previousNumerator.value;

    result.push({
      startAngle,
      endAngle,
      filled,
      shouldDestruct,
    });
  }
  return result;
});

// Adaptive timing based on denominator

function polarToCartesian(angle: number): { x: number; y: number } {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: 100 + 90 * Math.cos(radians),
    y: 100 + 90 * Math.sin(radians),
  };
}

function createArcPath(startAngle: number, endAngle: number): string {
  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    "M",
    100,
    100,
    "L",
    start.x,
    start.y,
    "A",
    90,
    90,
    0,
    largeArcFlag,
    1,
    end.x,
    end.y,
    "Z",
  ].join(" ");
}
</script>

<template>
  <motion.div
    class="circle-container"
    :initial="!hasAnimated ? { opacity: 0, scale: 0.8 } : false"
    :animate="{ opacity: 1, scale: 1 }"
    :transition="{
      duration: 0.3,
      ease: 'easeOut',
    }"
  >
    <motion.svg
      width="120"
      height="120"
      viewBox="0 0 200 200"
      class="circle"
      initial="hidden"
      animate="visible"
    >
      <!-- @vue-expect-error some reason index is not recognized as being used -->
      <template v-for="(segment, index) in segments" :key="`bg-${index}`">
        <path
          :d="createArcPath(segment.startAngle, segment.endAngle)"
          class="segment segment-background"
        />
      </template>
      <!-- Filled segments with path drawing animation -->
      <template v-for="(segment, index) in segments" :key="`filled-${index}`">
        <motion.g
          v-if="segment.filled && !segment.shouldDestruct"
          :initial="{
            x: 60,
            y: 60,
            scale: 0.4,
            opacity: 0,
          }"
          :animate="{
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
          }"
          :transition="{
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94], // Smooth entrance
          }"
          :style="{
            transformOrigin: '100px 100px',
          }"
        >
          <!-- Animated fill using clipPath for dramatic reveal -->
          <defs>
            <clipPath :id="`clip-${componentId}-${index}`">
              <motion.path
                :d="createArcPath(segment.startAngle, segment.endAngle)"
                :initial="{ pathLength: 0 }"
                :animate="{ pathLength: 1 }"
                :transition="{
                  duration: 0.5,
                  ease: 'easeInOut',
                  delay: 0.1,
                }"
              />
            </clipPath>
          </defs>
          <!-- Full fill that gets revealed by clipPath -->
          <path
            :d="createArcPath(segment.startAngle, segment.endAngle)"
            class="segment filled-bg"
            :clip-path="`url(#clip-${componentId}-${index})`"
            :style="{
              fill: 'rgba(66, 184, 131, 0.9)',
              stroke: '#42b883',
              strokeWidth: '3',
            }"
          />
          <!-- Enhanced stroke that appears on top -->
          <motion.path
            :d="createArcPath(segment.startAngle, segment.endAngle)"
            class="segment filled-stroke"
            :initial="{
              pathLength: 0,
              strokeWidth: 8,
            }"
            :animate="{
              pathLength: 1,
              strokeWidth: 4,
            }"
            :transition="{
              pathLength: {
                duration: 0.5,
                ease: 'easeInOut',
                delay: 0.1,
              },
              strokeWidth: {
                duration: 0.3,
                ease: 'easeOut',
                delay: 0.3,
              },
            }"
            :style="{
              fill: 'transparent',
              stroke: '#2d8f5f',
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            }"
          />
        </motion.g>
        <!-- Dramatic destruction animation - color change and fall away -->
        <motion.path
          v-if="segment.shouldDestruct"
          :d="createArcPath(segment.startAngle, segment.endAngle)"
          :animate="{
            y: [0, 80],
            x: [0, Math.random() * 40 - 20], // Random horizontal drift
            scale: [1, 0.8, 0.3],
            opacity: [1, 0.8, 0],
            rotate: [0, Math.random() * 360 - 180], // Random rotation as it falls
          }"
          :transition="{
            duration: 0.8,
            delay: (previousNumerator - 1 - index) * 0.1,
            ease: [0.25, 0.46, 0.45, 0.94], // Gravity-like easing
          }"
          fill="#e74c3c"
          stroke="#c0392b"
          stroke-width="3"
          style="transform-origin: 100px 100px"
        />
      </template>
    </motion.svg>
    <motion.div
      class="fraction-text"
      :initial="!hasAnimated ? { opacity: 0, y: 10 } : false"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{
        duration: 0.2,
        ease: 'easeOut',
        delay: hasAnimated ? 0 : 0.4,
      }"
    >
      {{ numerator }}/{{ denominator }}
    </motion.div>
  </motion.div>
</template>

<style scoped>
.circle-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
}

.circle {
  display: block;
}

.segment {
  stroke: #42b883;
  stroke-width: 1;
  fill: rgba(66, 184, 131, 0.1);
  transition: fill 0.2s ease;
}

.segment-background {
  stroke: #e2e8f0;
  stroke-width: 1;
  fill: rgba(226, 232, 240, 0.1);
}

.fraction-text {
  text-align: center;
  font-size: 0.9rem;
  margin-top: 0.25rem;
  color: #42b883;
}

@media (min-width: 640px) {
  .circle-container {
    padding: 1rem;
  }

  .circle {
    width: 160px;
    height: 160px;
  }

  .fraction-text {
    font-size: 1.2rem;
    margin-top: 0.5rem;
  }
}
</style>
