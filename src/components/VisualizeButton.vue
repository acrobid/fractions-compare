<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
import { motion } from "motion-v";

interface Props {
  isAnimating?: boolean;
  disabled?: boolean;
}

interface Emits {
  (e: "click"): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

<template>
  <motion.button
    @click="$emit('click')"
    :disabled="disabled || isAnimating"
    :while-hover="{ scale: 1.05 }"
    :while-press="{ scale: 0.95 }"
    class="visualize-button"
    :class="{ animating: isAnimating }"
  >
    {{ isAnimating ? "Go!" : "Visualize" }}
  </motion.button>
</template>

<style scoped>
.visualize-button {
  position: relative;
  overflow: hidden;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #42b883, #36a471, #2d8a5f);
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
  box-shadow: 0 4px 15px rgba(66, 184, 131, 0.3);
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-size: 1em;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

.visualize-button.animating {
  background: linear-gradient(135deg, #ff6b6b, #ffa500, #ff1493);
  background-size: 200% 200%;
  animation: magicGradient 1s ease infinite;
  box-shadow: 0 0 20px rgba(255, 107, 107, 0.5), 0 0 40px rgba(255, 165, 0, 0.3);
}

.visualize-button:disabled {
  cursor: not-allowed;
}

.visualize-button:hover:not(:disabled) {
  background-color: #36a471;
}

@keyframes gradientShift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes magicGradient {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@media (max-width: 768px) {
  .visualize-button {
    padding: 0.5rem 1rem;
    font-size: 0.9em;
    letter-spacing: 0.5px;
  }
}

@media (max-width: 480px) {
  .visualize-button {
    padding: 0.45rem 0.9rem;
    font-size: 0.85em;
    letter-spacing: 0.3px;
  }
}

@media (prefers-color-scheme: dark) {
  .visualize-button {
    background: linear-gradient(135deg, #42b883, #36a471, #2d8a5f);
    box-shadow: 0 4px 15px rgba(66, 184, 131, 0.4);
  }

  .visualize-button.animating {
    background: linear-gradient(135deg, #ff6b6b, #ffa500, #ff1493);
    box-shadow: 0 0 25px rgba(255, 107, 107, 0.6),
      0 0 45px rgba(255, 165, 0, 0.4);
  }
}
</style>
