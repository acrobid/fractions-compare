<template>
  <div class="step-instructions">
    <motion.div
      v-if="steps.length > 0"
      :initial="{ opacity: 0, scale: 0.9 }"
      :animate="{ opacity: 1, scale: 1 }"
      :transition="{
        duration: 0.5,
        type: 'spring',
        stiffness: 200,
        damping: 20,
      }"
    >
      <motion.div
        v-for="(step, idx) in steps"
        :key="idx"
        class="step-row"
        :class="{ active: idx === currentStep }"
        :initial="{
          opacity: 0,
          x: -30,
          scale: 0.95,
          paddingTop: '0.6rem',
          paddingBottom: '0.6rem',
          paddingLeft: '0.8rem',
          paddingRight: '0.8rem',
          filter: 'blur(2px) brightness(0.7) hue-rotate(0deg)',
        }"
        :animate="{
          opacity: 1,
          x: 0,
          scale: idx === currentStep ? 1.05 : idx < currentStep ? 0.85 : 1,
          paddingTop: idx < currentStep ? '0.2rem' : '0.6rem',
          paddingBottom: idx < currentStep ? '0.2rem' : '0.6rem',
          paddingLeft: idx < currentStep ? '0.4rem' : '0.8rem',
          paddingRight: idx < currentStep ? '0.4rem' : '0.8rem',
          filter:
            idx === currentStep
              ? 'blur(0px) brightness(1.1) hue-rotate(5deg)'
              : idx < currentStep
              ? 'blur(0px) brightness(0.8) hue-rotate(0deg)'
              : 'blur(0px) brightness(1) hue-rotate(0deg)',
        }"
        :style="{
          transformOrigin: 'left center',
        }"
        :transition="{
          duration: 0.6,
          type: 'spring',
          stiffness: 180,
          damping: 18,
          delay: idx * 0.1,
          filter: { duration: 0.4, ease: 'easeInOut' },
        }"
        :while-hover="{
          scale: 1.03,
          x: 5,
          filter: 'brightness(1.2) hue-rotate(10deg) blur(0px)',
        }"
      >
        <motion.span
          class="step-label"
          :initial="{ scale: 0.8, rotate: -10 }"
          :animate="{ scale: 1, rotate: 0 }"
          :transition="{
            duration: 0.5,
            type: 'spring',
            stiffness: 300,
            damping: 20,
            delay: idx * 0.1 + 0.2,
          }"
          :while-hover="{
            scale: 1.1,
            rotate: 2,
            filter: 'hue-rotate(30deg) brightness(1.3) blur(0px)',
          }"
          :style="{
            filter: 'hue-rotate(0deg) brightness(1) blur(0px)',
          }"
        >
          Step {{ idx + 1 }}:
        </motion.span>
        <motion.span
          class="step-desc"
          :initial="{ opacity: 0, y: 10 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{
            duration: 0.4,
            ease: 'easeOut',
            delay: idx * 0.1 + 0.3,
          }"
        >
          {{ step.instruction }}
        </motion.span>
      </motion.div>
    </motion.div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { motion } from "motion-v";

defineProps<{
  steps: { instruction: string }[];
  currentStep: number;
}>();
</script>

<style scoped>
.step-instructions {
  margin-bottom: 1.5rem;
  background: linear-gradient(
    135deg,
    #1e2227,
    #252a30
  ); /* Gradient background */
  border-radius: 12px;
  padding: 1.5rem;
  font-family: "Comic Sans MS", "Comic Sans", "Chalkboard SE", "Courier New",
    monospace;
  font-size: 0.85em;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1); /* Multi-layer shadow for depth */
  border: 1px solid #34d39966;
  color: #c9d1d9;
  position: relative;
  overflow: hidden;
}

.step-instructions::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(52, 211, 153, 0.1),
    transparent
  );
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  50% {
    left: 100%;
  }
  100% {
    left: 100%;
  }
}

.step-row {
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  border: 2px solid transparent;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.05),
    rgba(255, 255, 255, 0.02)
  );
}

.step-row:hover {
  background: linear-gradient(
    135deg,
    rgba(66, 184, 131, 0.1),
    rgba(66, 184, 131, 0.05)
  );
  border-color: rgba(66, 184, 131, 0.3);
  transform: translateX(3px);
}

.step-row.active {
  background: linear-gradient(135deg, #2a3b2a, #1f4f20);
  color: #b2f2bb;
  font-weight: bold;
  box-shadow: 0 0 15px rgba(52, 211, 153, 0.3), 0 0 5px rgba(52, 211, 153, 0.5),
    inset 0 1px 0 rgba(178, 242, 187, 0.2);
  border-color: #34d399;
  transform: scale(1.02);
}

.step-row.active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #42b883, #34d399, #10b981);
  border-radius: 0 4px 4px 0;
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    box-shadow: 0 0 5px #42b883;
  }
  to {
    box-shadow: 0 0 15px #42b883, 0 0 25px #42b883;
  }
}

.step-label {
  color: #42b883;
  margin-right: 0.75rem;
  font-weight: bold;
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.9em;
  position: relative;
}

.step-label::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #42b883, #34d399);
  transition: width 0.3s ease;
}

.step-row:hover .step-label::after,
.step-row.active .step-label::after {
  width: 100%;
}

.step-desc {
  color: #e6edf3;
  font-size: 0.95em;
  line-height: 1.5;
  display: inline-block;
}

.step-row.active .step-desc {
  color: #f0f9ff;
  text-shadow: 0 0 8px rgba(178, 242, 187, 0.3);
}

/* Enhanced dark mode styles */
@media (prefers-color-scheme: dark) {
  .step-instructions {
    background: linear-gradient(135deg, #1a1f24, #21262d);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.6), 0 3px 8px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

  .step-row.active {
    background: linear-gradient(135deg, #275028, #1e3f1f);
    color: #c1f7c8;
    box-shadow: 0 0 20px rgba(72, 201, 141, 0.4),
      0 0 8px rgba(72, 201, 141, 0.6), inset 0 1px 0 rgba(193, 247, 200, 0.2);
  }

  .step-label {
    color: #48c98d;
  }

  .step-desc {
    color: #f0f6fc;
  }

  .step-row.active .step-desc {
    color: #ffffff;
    text-shadow: 0 0 10px rgba(193, 247, 200, 0.4);
  }
}
</style>
