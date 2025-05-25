<script setup lang="ts">
import { ref, computed } from "vue";
import { motion } from "motion-v";
import FractionCircle from "./FractionCircle.vue";

const denominator = ref(10);
const decimalValue = ref(0.1);
const simplifyFraction = ref(false); // New toggle for GCD simplification

const setDenominator = (value: number) => {
  denominator.value = value;
  // Adjust step size for the slider based on denominator
  sliderStep.value = 1 / value;
  // Make sure decimal value is valid for the new denominator
  decimalValue.value = Math.round(decimalValue.value * value) / value;
};

const sliderStep = ref(0.1); // Initial step based on denominator of 10

// Find greatest common divisor (GCD)
const findGCD = (a: number, b: number): number => {
  return b === 0 ? a : findGCD(b, a % b);
};

// Compute the fractional representation
const fraction = computed(() => {
  // Since we know our denominator is 10, 100, or 1000
  // We can directly compute the numerator as a fraction of the selected denominator
  const numerator = Math.round(decimalValue.value * denominator.value);

  if (simplifyFraction.value) {
    // Simplify the fraction using GCD
    const gcd = findGCD(numerator, denominator.value);

    return {
      numerator: numerator / gcd,
      denominator: denominator.value / gcd,
    };
  } else {
    // Return unsimplified fraction
    return {
      numerator: numerator,
      denominator: denominator.value,
    };
  }
});

// Toggle simplification
const toggleSimplify = () => {
  simplifyFraction.value = !simplifyFraction.value;
};
</script>

<template>
  <motion.div
    class="decimal-fraction-container"
    :initial="{ opacity: 0, y: 20 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{
      duration: 0.3,
      ease: 'easeOut',
    }"
  >
    <div class="controls">
      <div class="denominator-controls">
        <h3>Denominator</h3>
        <div class="buttons-group">
          <button
            @click="setDenominator(10)"
            :class="{ active: denominator === 10 }"
          >
            10
          </button>
          <button
            @click="setDenominator(100)"
            :class="{ active: denominator === 100 }"
          >
            100
          </button>
          <button
            @click="setDenominator(1000)"
            :class="{ active: denominator === 1000 }"
          >
            1000
          </button>
        </div>
      </div>

      <div class="slider-container">
        <h3>Decimal Value: {{ decimalValue }}</h3>
        <div class="slider-wrapper">
          <input
            type="range"
            v-model.number="decimalValue"
            :min="0"
            :max="1"
            :step="sliderStep"
            class="decimal-slider"
          />
          <div class="slider-markers">
            <span>0</span>
            <span>0.5</span>
            <span>1</span>
          </div>
        </div>
      </div>
    </div>

    <div class="simplify-option">
      <label class="toggle">
        <input
          type="checkbox"
          v-model="simplifyFraction"
          @click="toggleSimplify"
        />
        <span class="toggle-slider"></span>
      </label>
      <span class="toggle-label">Simplify Fraction</span>
    </div>

    <div class="result-display">
      <div class="decimal-fraction">
        <div class="decimal-value">
          <h3>As Decimal</h3>
          <div class="value-box">{{ decimalValue }}</div>
        </div>
        <div class="equals-sign">=</div>
        <div class="fraction-value">
          <h3>As Fraction</h3>
          <div class="value-box">
            {{ fraction.numerator }} / {{ fraction.denominator }}
          </div>
        </div>
      </div>

      <div class="visualization">
        <FractionCircle
          :numerator="fraction.numerator"
          :denominator="fraction.denominator"
        />
      </div>
    </div>
  </motion.div>
</template>

<style scoped>
.decimal-fraction-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background-color: #f8f8f8;
  padding: 1rem;
  border-radius: 12px;
}

.denominator-controls,
.slider-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.denominator-controls h3,
.slider-container h3 {
  margin: 0;
  color: #42b883;
  font-size: 1.1rem;
}

.buttons-group {
  display: flex;
  gap: 0.5rem;
}

button {
  padding: 0.5rem 1rem;
  background-color: #e0e0e0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

button.active {
  background-color: #42b883;
  color: white;
}

.slider-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.decimal-slider {
  width: 100%;
  margin: 0.5rem 0;
  -webkit-appearance: none;
  appearance: none;
  height: 8px;
  border-radius: 4px;
  background: #d3d3d3;
  outline: none;
}

.decimal-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #42b883;
  cursor: pointer;
}

.slider-markers {
  display: flex;
  justify-content: space-between;
  padding: 0 4px;
  font-size: 0.8rem;
  color: #666;
}

.result-display {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
}

.decimal-fraction {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  width: 100%;
}

.decimal-value,
.fraction-value {
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.decimal-value h3,
.fraction-value h3 {
  margin: 0;
  color: #42b883;
  font-size: 1.1rem;
}

.equals-sign {
  font-size: 2rem;
  font-weight: bold;
  color: #666;
}

.value-box {
  padding: 1rem;
  background-color: #f0f0f0;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: bold;
}

.visualization {
  width: 100%;
  max-width: 300px;
}

.simplify-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: -1rem;
  margin-bottom: -0.5rem;
  justify-content: center;
}

.toggle-label {
  font-size: 1rem;
  color: #444;
  font-weight: 500;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 26px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #42b883;
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

@media (prefers-color-scheme: dark) {
  .controls {
    background-color: #2a2a2a;
  }

  button {
    background-color: #444;
    color: #ddd;
  }

  button.active {
    background-color: #42b883;
    color: white;
  }

  .equals-sign {
    color: #aaa;
  }

  .value-box {
    background-color: #333;
    color: #fff;
  }

  .decimal-slider {
    background: #555;
  }

  .slider-markers {
    color: #aaa;
  }

  .toggle-label {
    color: #ccc;
  }

  .toggle-slider {
    background-color: #555;
  }

  .toggle-slider:before {
    background-color: #ddd;
  }
}

@media (min-width: 640px) {
  .controls {
    flex-direction: row;
    align-items: center;
    padding: 1.5rem;
  }

  .denominator-controls {
    width: 30%;
  }

  .slider-container {
    width: 70%;
  }

  .result-display {
    gap: 2.5rem;
  }
}
</style>
