<script setup lang="ts">
import { motion, AnimatePresence } from "motion-v";

interface FlyingDigit {
  id: string;
  digit: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
}

interface Props {
  flyingDigits: FlyingDigit[];
}

defineProps<Props>();
</script>

<template>
  <AnimatePresence>
    <div v-if="flyingDigits.length > 0" class="flying-digits-container">
      <motion.div
        v-for="flyingDigit in flyingDigits"
        :key="flyingDigit.id"
        class="flying-digit"
        :initial="{
          x: flyingDigit.startX,
          y: flyingDigit.startY,
          opacity: 1,
          scale: 1,
          rotate: 0,
          filter: 'hue-rotate(0deg) brightness(1) blur(0px)',
        }"
        :animate="{
          x: flyingDigit.targetX,
          y: flyingDigit.targetY,
          opacity: 0,
          scale: 0.3,
          rotate: 720,
          filter: 'hue-rotate(180deg) brightness(1.5) blur(1px)',
        }"
        :exit="{
          opacity: 0,
          scale: 0,
          rotate: 1080,
          filter: 'blur(5px)',
        }"
        :transition="{
          duration: 0.8,
          ease: [0.34, 1.56, 0.64, 1],
          rotate: { duration: 0.8, ease: 'easeOut' },
          filter: { duration: 0.6, ease: 'easeInOut' },
        }"
      >
        {{ flyingDigit.digit }}
      </motion.div>
    </div>
  </AnimatePresence>
</template>

<style scoped>
.flying-digits-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 1000;
}

.flying-digit {
  position: absolute;
  font-size: 32px;
  font-weight: bold;
  color: #42b883;
  text-shadow: 0 0 5px rgba(66, 184, 131, 1), 0 0 15px rgba(66, 184, 131, 0.8),
    0 0 25px rgba(66, 184, 131, 0.6), 0 0 35px rgba(66, 184, 131, 0.4);
  font-family: "Comic Sans MS", "Comic Sans", "Chalkboard SE", "Courier New",
    monospace;
  pointer-events: none;
  will-change: transform, opacity, filter;
  z-index: 1001;
  background: linear-gradient(45deg, #42b883, #36a471, #64ffda);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% 200%;
  animation: gradientShift 2s ease-in-out infinite;
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

@media (max-width: 768px) {
  .flying-digit {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .flying-digit {
    font-size: 20px;
  }
}

@media (prefers-color-scheme: dark) {
  .flying-digit {
    background: linear-gradient(45deg, #64ffda, #42b883, #00e676, #1de9b6);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-size: 200% 200%;
    animation: gradientShift 2s ease-in-out infinite,
      magicPulse 1.5s ease-in-out infinite;
    text-shadow: none;
  }
}

@keyframes magicPulse {
  0%,
  100% {
    text-shadow: 0 0 5px rgba(100, 255, 218, 1),
      0 0 15px rgba(100, 255, 218, 0.8), 0 0 25px rgba(100, 255, 218, 0.6);
  }
  50% {
    text-shadow: 0 0 10px rgba(100, 255, 218, 1),
      0 0 25px rgba(100, 255, 218, 0.9), 0 0 40px rgba(100, 255, 218, 0.7),
      0 0 55px rgba(100, 255, 218, 0.5);
  }
}
</style>
