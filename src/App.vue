<script setup lang="ts">
import { ref, computed } from 'vue';
import FractionInput from './components/FractionInput.vue';
import FractionCircle from './components/FractionCircle.vue';

const fraction1 = ref({
  numerator: 1,
  denominator: 4
});

const fraction2 = ref({
  numerator: 8,
  denominator: 32
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
      {{ areEqual ? 'These fractions are equal!' : 'These fractions are different.' }}
    </div>
  </div>
</template>

<style scoped>

  :root {
  --fraction-bg: #f8f8f8;
  --result-bg: #f0f0f0;
  --equal-bg: #ddb883ff;
  --equal-text: #42b883;
}
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
  background-color: var(--fraction-bg);
  border-radius: 12px;
}

.result {
  text-align: center;
  font-size: 1rem;
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 12px;
  background-color: var(--result-bg);
}

.result.equal {
  background-color: white var(--equal-bg);
  color: var(--equal-text);
}



@media (prefers-color-scheme: dark) {
  :root {
    --fraction-bg: #2a2a2a;
    --result-bg: #333333;
    --equal-bg: #eeb88322;
    --equal-text: #42b883;
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
}
</style>