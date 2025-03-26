<script setup lang="ts">
import { ref, computed } from "vue";
import FractionInput from "./components/FractionInput.vue";
import FractionCircle from "./components/FractionCircle.vue";

const fraction1 = ref({
  numerator: 1,
  denominator: 4,
});

const fraction2 = ref({
  numerator: 8,
  denominator: 32,
});

const areEqual = computed(() => {
  const value1 = fraction1.value.numerator / fraction1.value.denominator;
  const value2 = fraction2.value.numerator / fraction2.value.denominator;
  return Math.abs(value1 - value2) < 0.0001;
});
</script>

<template>
  <div class="container">
    <h1>Fraction Visualizer</h1>

    <div class="fractions">
      <div class="fraction">
        <FractionInput
          label="First Fraction"
          v-model:numerator="fraction1.numerator"
          v-model:denominator="fraction1.denominator"
        />
        <FractionCircle
          :numerator="fraction1.numerator"
          :denominator="fraction1.denominator"
        />
      </div>

      <div class="fraction">
        <FractionInput
          label="Second Fraction"
          v-model:numerator="fraction2.numerator"
          v-model:denominator="fraction2.denominator"
        />
        <FractionCircle
          :numerator="fraction2.numerator"
          :denominator="fraction2.denominator"
        />
      </div>
    </div>

    <div class="result" :class="{ equal: areEqual }">
      <div class="result-text">
        {{ areEqual ? "EQUAL FRACTIONS!" : "These fractions are different." }}
      </div>

      <div v-if="areEqual" class="celebration">
        <div class="confetti-container">
          <div
            v-for="n in 20"
            :key="n"
            class="confetti"
            :style="{
              '--delay': `${Math.random() * 3}s`,
              '--rotation': `${Math.random() * 360}deg`,
              '--position': `${Math.random() * 100}%`,
              '--size': `${Math.random() * 10 + 5}px`,
              '--color': `hsl(${Math.random() * 360}, 90%, 60%)`,
            }"
          ></div>
        </div>
        <div class="shine"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

h1 {
  text-align: center;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #42b883;
}

.fractions {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.fraction {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background-color: #f8f8f8;
  border-radius: 12px;
}

.result {
  text-align: center;
  font-size: 1rem;
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 12px;
  background-color: #f0f0f0;
  position: relative;
  overflow: hidden;
  transition: all 0.5s ease;
}

.result.equal {
  background-color: #7209b7;
  color: white;
  font-weight: bold;
  padding: 1.5rem;
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(114, 9, 183, 0.6), 0 0 60px rgba(114, 9, 183, 0.4);
}

.result-text {
  position: relative;
  z-index: 5;
}

.result.equal .result-text {
  font-size: 1.6rem;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
  animation: bounce 0.5s ease infinite alternate;
}

.celebration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.confetti {
  position: absolute;
  background-color: var(--color);
  width: var(--size);
  height: var(--size);
  top: -20px;
  left: var(--position);
  opacity: 0;
  transform: rotate(var(--rotation));
  animation: confetti 3s ease-in-out infinite;
  animation-delay: var(--delay);
}

.confetti:nth-child(even) {
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
}

.confetti:nth-child(odd) {
  border-radius: 50%;
}

.shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 300%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  animation: shine 2s linear infinite;
}

@keyframes confetti {
  0% {
    transform: translateY(-20px) rotate(var(--rotation));
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  100% {
    transform: translateY(300px) rotate(calc(var(--rotation) + 360deg));
    opacity: 0;
  }
}

@keyframes bounce {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-5px);
  }
}

@keyframes shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@media (prefers-color-scheme: dark) {
  .fraction {
    background-color: #2a2a2a;
  }

  .result {
    background-color: #333333;
  }

  .result.equal {
    background-color: #9d4edd;
  }
}

@media (min-width: 640px) {
  .container {
    padding: 2rem;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 2rem;
  }

  .fraction {
    padding: 1.5rem;
  }

  .result {
    font-size: 1.2rem;
    padding: 1.25rem;
  }

  .result.equal .result-text {
    font-size: 2rem;
  }
}
</style>
