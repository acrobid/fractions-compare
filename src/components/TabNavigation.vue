<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
import { motion } from "motion-v";

defineProps<{
  modelValue: string;
}>();

const emit = defineEmits(["update:modelValue"]);

const selectTab = (tab: string) => {
  emit("update:modelValue", tab);
};
</script>

<template>
  <motion.div
    class="tab-navigation"
    :initial="{ opacity: 0, y: -10, scale: 0.98 }"
    :animate="{ opacity: 1, y: 0, scale: 1 }"
    :transition="{
      duration: 0.2,
      ease: 'easeOut',
    }"
  >
    <motion.button
      @click="selectTab('compare')"
      class="tab-button"
      :class="{ active: modelValue === 'compare' }"
      :initial="{ opacity: 0, x: -15, scale: 0.95 }"
      :animate="{ opacity: 1, x: 0, scale: 1 }"
      :transition="{
        duration: 0.15,
        ease: 'easeOut',
        delay: 0.05,
      }"
      :while-hover="{
        scale: 1.02,
        y: -1,
      }"
      :while-tap="{ scale: 0.98, y: 0 }"
    >
      Compare Fractions
    </motion.button>
    <motion.button
      @click="selectTab('decimal')"
      class="tab-button"
      :class="{ active: modelValue === 'decimal' }"
      :initial="{ opacity: 0, x: -8, scale: 0.95 }"
      :animate="{ opacity: 1, x: 0, scale: 1 }"
      :transition="{
        duration: 0.15,
        ease: 'easeOut',
        delay: 0.08,
      }"
      :while-hover="{
        scale: 1.02,
        y: -1,
      }"
      :while-tap="{ scale: 0.98, y: 0 }"
    >
      Decimal to Fraction
    </motion.button>
    <motion.button
      @click="selectTab('division')"
      class="tab-button"
      :class="{ active: modelValue === 'division' }"
      :initial="{ opacity: 0, x: 8, scale: 0.95 }"
      :animate="{ opacity: 1, x: 0, scale: 1 }"
      :transition="{
        duration: 0.15,
        ease: 'easeOut',
        delay: 0.1,
      }"
      :while-hover="{
        scale: 1.02,
        y: -1,
      }"
      :while-tap="{ scale: 0.98, y: 0 }"
    >
      Long Division
    </motion.button>
  </motion.div>
</template>

<style scoped>
.tab-navigation {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.tab-button {
  padding: 0.75rem 1.25rem;
  border: none;
  background: none;
  font-size: 1rem;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s ease;
}

.tab-button.active {
  color: #42b883;
  border-bottom-color: #42b883;
}

.tab-button:hover:not(.active) {
  color: #444;
  border-bottom-color: #ccc;
}

@media (prefers-color-scheme: dark) {
  .tab-navigation {
    border-bottom-color: #444;
  }

  .tab-button {
    color: #aaa;
  }

  .tab-button:hover:not(.active) {
    color: #ddd;
    border-bottom-color: #555;
  }
}
</style>
