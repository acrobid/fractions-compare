<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
import { motion } from "motion-v";
import DivisionInput from "./DivisionInput.vue";
import VisualizeButton from "./VisualizeButton.vue";

interface Props {
  dividend: number;
  divisor: number;
  isAnimating?: boolean;
}

interface Emits {
  (e: "update:dividend", value: number): void;
  (e: "update:divisor", value: number): void;
  (e: "visualize"): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

<template>
  <motion.div
    class="controls"
    :initial="{ opacity: 0, y: 20, scale: 0.95 }"
    :animate="{ opacity: 1, y: 0, scale: 1 }"
    :transition="{
      duration: 0.6,
      type: 'spring',
      stiffness: 150,
      damping: 18,
      delay: 0.3,
    }"
  >
    <DivisionInput
      :dividend="dividend"
      :divisor="divisor"
      @update:dividend="$emit('update:dividend', $event)"
      @update:divisor="$emit('update:divisor', $event)"
    />
    <VisualizeButton :is-animating="isAnimating" @click="$emit('visualize')" />
  </motion.div>
</template>

<style scoped>
.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f0f2f5;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .controls {
    gap: 1rem;
    padding: 0.75rem;
    margin-bottom: 1rem;
  }
}

@media (max-width: 480px) {
  .controls {
    flex-direction: column;
    gap: 0.75rem;
  }
}

@media (prefers-color-scheme: dark) {
  .controls {
    background-color: #2a2a2a;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
}
</style>
