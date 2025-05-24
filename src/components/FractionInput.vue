<script setup lang="ts">
import { motion } from "motion-v";

defineProps<{
  label: string;
  numerator: number;
  denominator: number;
}>();

defineEmits<{
  (e: "update:numerator", value: number): void;
  (e: "update:denominator", value: number): void;
}>();
</script>

<template>
  <motion.div
    class="fraction-input"
    :initial="{ opacity: 0, x: -20, scale: 0.95 }"
    :animate="{ opacity: 1, x: 0, scale: 1 }"
    :transition="{
      duration: 0.2,
      ease: 'easeOut',
    }"
  >
    <motion.h3
      :initial="{ opacity: 0, y: -8, scale: 0.9 }"
      :animate="{ opacity: 1, y: 0, scale: 1 }"
      :transition="{
        duration: 0.15,
        ease: 'easeOut',
        delay: 0.05,
      }"
      :while-hover="{
        scale: 1.02,
      }"
    >
      {{ label }}
    </motion.h3>
    <motion.div
      class="inputs"
      :initial="{ opacity: 0, y: 10, scale: 0.98 }"
      :animate="{ opacity: 1, y: 0, scale: 1 }"
      :transition="{
        duration: 0.15,
        ease: 'easeOut',
        delay: 0.08,
      }"
    >
      <motion.div
        class="input-group"
        :initial="{ opacity: 0, scale: 0.9, rotate: -3 }"
        :animate="{ opacity: 1, scale: 1, rotate: 0 }"
        :transition="{
          duration: 0.12,
          ease: 'easeOut',
          delay: 0.1,
        }"
      >
        <motion.button
          class="btn"
          @click="$emit('update:numerator', Math.max(0, numerator - 1))"
          aria-label="Decrease numerator"
          :while-hover="{ scale: 1.05 }"
          :while-tap="{ scale: 0.95 }"
          :transition="{ duration: 0.1 }"
          >−</motion.button
        >
        <motion.input
          type="number"
          min="0"
          :value="numerator"
          @input="
            $emit(
              'update:numerator',
              +($event.target as HTMLInputElement).value,
            )
          "
          placeholder="Numerator"
          :while-focus="{
            scale: 1.05,
            filter: 'brightness(1.1) hue-rotate(5deg)',
          }"
          :style="{
            filter: 'brightness(1) hue-rotate(0deg)',
          }"
        />
        <motion.button
          class="btn"
          @click="$emit('update:numerator', numerator + 1)"
          aria-label="Increase numerator"
          :while-hover="{
            scale: 1.1,
            rotate: 5,
            filter: 'brightness(1.2) hue-rotate(10deg)',
          }"
          :while-tap="{ scale: 0.9, rotate: -5 }"
          :transition="{ type: 'spring', stiffness: 400, damping: 15 }"
          :style="{
            filter: 'brightness(1) hue-rotate(0deg)',
          }"
          >+</motion.button
        >
      </motion.div>
      <motion.div
        class="fraction-line"
        :initial="{ scaleX: 0, opacity: 0 }"
        :animate="{ scaleX: 1, opacity: 1 }"
        :transition="{
          duration: 0.6,
          ease: 'easeOut',
          delay: 0.6,
        }"
        :while-hover="{
          scaleY: 1.5,
          filter: 'brightness(1.3) hue-rotate(15deg)',
        }"
        :style="{
          transformOrigin: 'center',
          filter: 'brightness(1) hue-rotate(0deg)',
        }"
      ></motion.div>
      <motion.div
        class="input-group"
        :initial="{ opacity: 0, scale: 0.8, rotate: 5 }"
        :animate="{ opacity: 1, scale: 1, rotate: 0 }"
        :transition="{
          duration: 0.5,
          type: 'spring',
          stiffness: 180,
          damping: 20,
          delay: 0.7,
        }"
      >
        <motion.button
          class="btn"
          @click="$emit('update:denominator', Math.max(1, denominator - 1))"
          aria-label="Decrease denominator"
          :while-hover="{
            scale: 1.1,
            rotate: -5,
            filter: 'brightness(1.2) hue-rotate(10deg)',
          }"
          :while-tap="{ scale: 0.9, rotate: 5 }"
          :transition="{ type: 'spring', stiffness: 400, damping: 15 }"
          :style="{
            filter: 'brightness(1) hue-rotate(0deg)',
          }"
          >−</motion.button
        >
        <motion.input
          type="number"
          min="1"
          :value="denominator"
          @input="
            $emit(
              'update:denominator',
              +($event.target as HTMLInputElement).value,
            )
          "
          placeholder="Denominator"
          :while-focus="{
            scale: 1.05,
            filter: 'brightness(1.1) hue-rotate(5deg)',
          }"
          :style="{
            filter: 'brightness(1) hue-rotate(0deg)',
          }"
        />
        <motion.button
          class="btn"
          @click="$emit('update:denominator', denominator + 1)"
          aria-label="Increase denominator"
          :while-hover="{
            scale: 1.1,
            rotate: 5,
            filter: 'brightness(1.2) hue-rotate(10deg)',
          }"
          :while-tap="{ scale: 0.9, rotate: -5 }"
          :transition="{ type: 'spring', stiffness: 400, damping: 15 }"
          :style="{
            filter: 'brightness(1) hue-rotate(0deg)',
          }"
          >+</motion.button
        >
      </motion.div>
    </motion.div>
  </motion.div>
</template>

<style scoped>
.fraction-input {
  margin: 0;
}

h3 {
  font-size: 0.9rem;
  margin: 0 0 0.75rem;
  color: #42b883;
  text-align: center;
}

.inputs {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 160px;
}

input {
  width: 60px;
  height: 44px;
  padding: 0.25rem;
  text-align: center;
  border: 2px solid #42b883;
  border-radius: 8px;
  background-color: transparent;
  color: #42b883;
  font-size: 1rem;
  -moz-appearance: textfield;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 0 0 2px rgba(66, 184, 131, 0.2);
}

.btn {
  width: 44px;
  height: 44px;
  padding: 0;
  border: 2px solid #42b883;
  border-radius: 8px;
  background-color: transparent;
  color: #42b883;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;
  transition: all 0.2s ease;
}

.btn:active {
  background-color: rgba(66, 184, 131, 0.1);
  transform: scale(0.95);
}

.fraction-line {
  width: 100%;
  height: 2px;
  background-color: #42b883;
  margin: 0.25rem 0;
}

@media (min-width: 640px) {
  .fraction-input {
    margin: 1rem;
  }

  h3 {
    font-size: 1rem;
    margin-bottom: 1rem;
  }

  .input-group {
    width: 180px;
    gap: 0.75rem;
  }

  input {
    width: 70px;
    height: 48px;
    padding: 0.5rem;
    font-size: 1.1rem;
  }

  .btn {
    width: 48px;
    height: 48px;
    font-size: 1.6rem;
  }
}
</style>
