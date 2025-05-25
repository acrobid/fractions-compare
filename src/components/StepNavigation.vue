<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
import { motion } from "motion-v";

interface Props {
  currentStep: number;
  totalSteps: number;
  disabled?: boolean;
}

interface Emits {
  (e: "prev-step"): void;
  (e: "next-step"): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

<template>
  <div class="step-nav">
    <motion.button
      @click="$emit('prev-step')"
      :disabled="disabled || currentStep === 0"
      :while-hover="{ scale: 1.1, rotate: -2, filter: 'brightness(1.1)' }"
      :while-tap="{ scale: 0.95, rotate: 2 }"
      :transition="{ type: 'spring', stiffness: 400, damping: 15 }"
    >
      Previous
    </motion.button>
    <motion.span
      :key="currentStep"
      :initial="{ scale: 0.8, opacity: 0, y: -10 }"
      :animate="{ scale: 1, opacity: 1, y: 0 }"
      :transition="{ type: 'spring', stiffness: 300, damping: 20 }"
    >
      Step {{ currentStep + 1 }} / {{ totalSteps }}
    </motion.span>
    <motion.button
      @click="$emit('next-step')"
      :disabled="disabled || currentStep >= totalSteps - 1"
      :while-hover="{ scale: 1.1, rotate: 2, filter: 'brightness(1.1)' }"
      :while-tap="{ scale: 0.95, rotate: -2 }"
      :transition="{ type: 'spring', stiffness: 400, damping: 15 }"
    >
      Next
    </motion.button>
  </div>
</template>

<style scoped>
.step-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  font-family: "Comic Sans MS", "Comic Sans", "Chalkboard SE", "Courier New",
    monospace;
  font-size: 1em;
  flex-wrap: wrap;
}

.step-nav button {
  padding: 0.5rem 1rem;
  font-size: 0.95em;
  background: linear-gradient(135deg, #e6f4ea, #d1ecd5);
  color: #2a663e;
  border: 2px solid #a5d6b8;
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(165, 214, 184, 0.3);
}

.step-nav button::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  transition: left 0.5s;
}

.step-nav button:hover:not(:disabled)::before {
  left: 100%;
}

.step-nav button:hover:not(:disabled) {
  background: linear-gradient(135deg, #d1ecd5, #b8e6c1);
  border-color: #8ccaa1;
  box-shadow: 0 4px 15px rgba(165, 214, 184, 0.5);
  transform: translateY(-1px);
}

.step-nav button:disabled {
  background: #e0e0e0;
  color: #888;
  border-color: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .step-nav {
    gap: 0.75rem;
    margin-top: 0.75rem;
    margin-bottom: 1rem;
    font-size: 0.9em;
  }

  .step-nav button {
    padding: 0.4rem 0.8rem;
    font-size: 0.9em;
    border-radius: 10px;
  }
}

@media (max-width: 480px) {
  .step-nav {
    gap: 0.5rem;
    font-size: 0.85em;
  }

  .step-nav button {
    padding: 0.35rem 0.7rem;
    font-size: 0.85em;
    border-radius: 8px;
  }
}

@media (prefers-color-scheme: dark) {
  .step-nav button {
    background: linear-gradient(135deg, #2c4c3b, #355a46);
    color: #b0e6c2;
    border-color: #3e7050;
    box-shadow: 0 2px 8px rgba(62, 112, 80, 0.4);
  }

  .step-nav button::before {
    background: linear-gradient(
      90deg,
      transparent,
      rgba(176, 230, 194, 0.2),
      transparent
    );
  }

  .step-nav button:hover:not(:disabled) {
    background: linear-gradient(135deg, #355a46, #4a855f);
    border-color: #4a855f;
    box-shadow: 0 4px 15px rgba(62, 112, 80, 0.6);
  }

  .step-nav button:disabled {
    background: linear-gradient(135deg, #333, #2a2a2a);
    color: #777;
    border-color: #555;
    box-shadow: none;
  }
}
</style>
