<template>
  <motion.div
    v-if="isVisible"
    class="final-answer-celebration"
    :initial="{
      opacity: 0,
      scale: 0.8,
      y: 30,
      filter: 'blur(3px)',
    }"
    :animate="{
      opacity: 1,
      scale: 1,
      y: 0,
      filter: 'blur(0px)',
    }"
    :transition="{
      duration: 0.6,
      type: 'spring',
      stiffness: 120,
      damping: 15,
      delay: 0.1,
    }"
  >
    <!-- Main Answer Display -->
    <motion.div
      class="answer-container"
      :initial="{ scale: 0, rotate: 180 }"
      :animate="{ scale: 1, rotate: 0 }"
      :transition="{
        duration: 0.8,
        type: 'spring',
        stiffness: 150,
        damping: 12,
        delay: 0.8,
      }"
      :while-hover="{
        scale: 1.05,
        rotate: 2,
        filter: 'hue-rotate(30deg) brightness(1.2)',
      }"
      :style="{
        filter: 'hue-rotate(0deg) brightness(1)',
      }"
    >
      <div class="answer-label">Final Answer:</div>
      <div class="answer-value">{{ answer }}</div>
      <div v-if="remainder" class="remainder-text">
        Remainder: {{ remainder }}
      </div>
    </motion.div>

    <!-- Fireworks -->
    <div class="fireworks-container">
      <motion.div
        v-for="(firework, index) in fireworks"
        :key="`firework-${index}`"
        class="firework"
        :style="{
          left: firework.x + '%',
          top: firework.y + '%',
        }"
        :initial="{
          scale: 0,
          opacity: 0,
          rotate: 0,
        }"
        :animate="{
          scale: [0, 1.5, 0],
          opacity: [0, 1, 0],
          rotate: [0, 180, 360],
        }"
        :transition="{
          duration: 2,
          delay: firework.delay,
          repeat: Infinity,
          repeatDelay: 3,
        }"
      >
        ✨
      </motion.div>
    </div>

    <!-- Popcorn Effect -->
    <div class="popcorn-container">
      <motion.div
        v-for="(popcorn, index) in popcornPieces"
        :key="`popcorn-${index}`"
        class="popcorn"
        :style="{
          left: popcorn.startX + '%',
          color: popcorn.color,
        }"
        :initial="{
          y: 0,
          x: 0,
          scale: 0,
          rotate: 0,
          opacity: 1,
        }"
        :animate="{
          y: [0, -100, -80, -200],
          x: [0, popcorn.drift, popcorn.drift * 1.5, popcorn.drift * 2],
          scale: [0, 1, 0.8, 0],
          rotate: [0, 180, 360, 540],
          opacity: [1, 1, 0.8, 0],
        }"
        :transition="{
          duration: 3,
          delay: popcorn.delay,
          repeat: Infinity,
          repeatDelay: 4,
          ease: [0.25, 0.46, 0.45, 0.94],
        }"
      >
        🍿
      </motion.div>
    </div>

    <!-- Rainbow Shimmer Overlay -->
    <motion.div
      class="rainbow-shimmer"
      :initial="{ opacity: 0 }"
      :animate="{ opacity: [0, 0.3, 0] }"
      :transition="{
        duration: 2,
        repeat: Infinity,
        repeatDelay: 1,
        ease: 'easeInOut',
      }"
    />

    <!-- Sparkle Stars -->
    <div class="sparkles-container">
      <motion.div
        v-for="(sparkle, index) in sparkles"
        :key="`sparkle-${index}`"
        class="sparkle"
        :style="{
          left: sparkle.x + '%',
          top: sparkle.y + '%',
          fontSize: sparkle.size + 'px',
        }"
        :initial="{
          scale: 0,
          opacity: 0,
          rotate: 0,
        }"
        :animate="{
          scale: [0, 1, 0],
          opacity: [0, 1, 0],
          rotate: [0, 360],
        }"
        :transition="{
          duration: 1.5,
          delay: sparkle.delay,
          repeat: Infinity,
          repeatDelay: 2,
          ease: 'easeInOut',
        }"
      >
        ⭐
      </motion.div>
    </div>

    <!-- Confetti Rain -->
    <div class="confetti-container">
      <motion.div
        v-for="(confetti, index) in confettiPieces"
        :key="`confetti-${index}`"
        class="confetti"
        :style="{
          left: confetti.x + '%',
          backgroundColor: confetti.color,
          width: confetti.width + 'px',
          height: confetti.height + 'px',
        }"
        :initial="{
          y: -20,
          rotate: 0,
          opacity: 1,
        }"
        :animate="{
          y: 300,
          rotate: [0, 180, 360, 540],
          opacity: [1, 1, 0.5, 0],
        }"
        :transition="{
          duration: 4,
          delay: confetti.delay,
          repeat: Infinity,
          repeatDelay: 5,
          ease: 'easeIn',
        }"
      />
    </div>
  </motion.div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { motion } from "motion-v";

defineProps<{
  answer: string | number;
  remainder?: string | number;
  isVisible: boolean;
}>();

// Generate random positions and delays for effects
const fireworks = ref(
  Array.from({ length: 8 }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 60 + 10,
    delay: i * 0.3,
  })),
);

const popcornPieces = ref(
  Array.from({ length: 12 }, (_, i) => ({
    startX: Math.random() * 100,
    drift: (Math.random() - 0.5) * 40,
    delay: i * 0.2,
    color: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57"][
      i % 6
    ],
  })),
);

const sparkles = ref(
  Array.from({ length: 15 }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 80 + 10,
    size: Math.random() * 8 + 12,
    delay: i * 0.15,
  })),
);

const confettiPieces = ref(
  Array.from({ length: 20 }, (_, i) => ({
    x: Math.random() * 100,
    color: [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FECA57",
      "#FF9FF3",
      "#54A0FF",
    ][i % 7],
    width: Math.random() * 6 + 4,
    height: Math.random() * 6 + 4,
    delay: i * 0.1,
  })),
);
</script>

<style scoped>
.final-answer-celebration {
  position: relative;
  width: 100%;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 2rem;
  margin-top: 2rem;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3),
    0 0 50px rgba(118, 75, 162, 0.2);
}

.answer-container {
  background: linear-gradient(135deg, #ffffff, #f8f9ff);
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border: 3px solid transparent;
  background-clip: padding-box;
  position: relative;
  z-index: 10;
}

.answer-container::before {
  content: "";
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  background: linear-gradient(
    45deg,
    #ff6b6b,
    #4ecdc4,
    #45b7d1,
    #96ceb4,
    #feca57
  );
  background-size: 400% 400%;
  border-radius: 18px;
  z-index: -1;
  animation: rainbowBorder 3s ease infinite;
}

@keyframes rainbowBorder {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.answer-label {
  font-size: 1.2rem;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.answer-value {
  font-size: 3rem;
  font-weight: 900;
  background: linear-gradient(45deg, #667eea, #764ba2, #ff6b6b, #4ecdc4);
  background-size: 400% 400%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: rainbowText 2s ease-in-out infinite;
  margin-bottom: 0.5rem;
}

@keyframes rainbowText {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.remainder-text {
  font-size: 1.1rem;
  color: #764ba2;
  font-weight: 600;
  margin-top: 0.5rem;
}

.success-message {
  font-size: 1.3rem;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  margin-top: 1.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  z-index: 10;
  position: relative;
}

/* Effect Containers */
.fireworks-container,
.popcorn-container,
.sparkles-container,
.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
}

.firework {
  position: absolute;
  font-size: 24px;
  will-change: transform;
}

.popcorn {
  position: absolute;
  font-size: 20px;
  will-change: transform;
}

.sparkle {
  position: absolute;
  will-change: transform;
}

.confetti {
  position: absolute;
  border-radius: 2px;
  will-change: transform;
}

.rainbow-shimmer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    45deg,
    transparent,
    rgba(255, 107, 107, 0.1),
    rgba(78, 205, 196, 0.1),
    rgba(69, 183, 209, 0.1),
    rgba(150, 206, 180, 0.1),
    rgba(254, 202, 87, 0.1),
    transparent
  );
  background-size: 400% 400%;
  animation: shimmer 3s ease-in-out infinite;
  pointer-events: none;
  border-radius: 20px;
}

@keyframes shimmer {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .final-answer-celebration {
    background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
    box-shadow: 0 10px 30px rgba(44, 62, 80, 0.4),
      0 0 50px rgba(52, 152, 219, 0.3);
  }

  .answer-container {
    background: linear-gradient(135deg, #34495e, #2c3e50);
    color: #ecf0f1;
  }

  .answer-label {
    color: #3498db;
  }

  .remainder-text {
    color: #74b9ff;
  }
}
</style>
