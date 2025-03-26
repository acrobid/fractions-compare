<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  numerator: number;
  denominator: number;
}>();

const segments = computed(() => {
  const result = [];
  for (let i = 0; i < props.denominator; i++) {
    const startAngle = (i * 360) / props.denominator;
    const endAngle = ((i + 1) * 360) / props.denominator;
    const filled = i < props.numerator;
    
    result.push({
      startAngle,
      endAngle,
      filled,
    });
  }
  return result;
});

function polarToCartesian(angle: number): { x: number; y: number } {
  const radians = (angle - 90) * Math.PI / 180;
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
    'M', 100, 100,
    'L', start.x, start.y,
    'A', 90, 90, 0, largeArcFlag, 1, end.x, end.y,
    'Z'
  ].join(' ');
}
</script>

<template>
  <div class="circle-container">
    <svg width="120" height="120" viewBox="0 0 200 200" class="circle">
      <path
        v-for="(segment, index) in segments"
        :key="index"
        :d="createArcPath(segment.startAngle, segment.endAngle)"
        :class="{ filled: segment.filled }"
        class="segment"
      />
    </svg>
    <div class="fraction-text">{{ numerator }}/{{ denominator }}</div>
  </div>
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

.segment.filled {
  fill: #42b883;
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