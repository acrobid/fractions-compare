<template>
  <div class="division-setup">
    <div class="input-group">
      <NumberInput
        id="dividend"
        label="Dividend"
        v-model="inputDividend"
        placeholder="e.g., 123"
        :min="0"
        :disabled="!enabled"
        :error="dividendError"
      />
      <NumberInput
        id="divisor"
        label="Divisor"
        v-model="inputDivisor"
        placeholder="e.g., 4"
        :min="1"
        :disabled="!enabled"
        :error="divisorError"
      />
      <button
        @click="submitInputs"
        :disabled="!isValid || !enabled"
        class="submit-button"
      >
        Set Problem
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import NumberInput from "./common/NumberInput.vue";

defineProps<{
  enabled: boolean;
}>();

const emit = defineEmits<{
  (e: "inputs-ready", data: { dividend: number; divisor: number }): void;
}>();

const inputDividend = ref<number | null>(null);
const inputDivisor = ref<number | null>(null);

const dividendError = computed(() => {
  if (inputDividend.value === null) return undefined;
  if (inputDividend.value < 0) return "Must be non-negative";
  return undefined;
});

const divisorError = computed(() => {
  if (inputDivisor.value === null) return undefined;
  if (inputDivisor.value <= 0) return "Must be positive";
  return undefined;
});

const isValid = computed(
  () =>
    inputDividend.value !== null &&
    inputDividend.value >= 0 &&
    inputDivisor.value !== null &&
    inputDivisor.value > 0,
);

const submitInputs = () => {
  if (
    isValid.value &&
    inputDividend.value !== null &&
    inputDivisor.value !== null
  ) {
    emit("inputs-ready", {
      dividend: inputDividend.value,
      divisor: inputDivisor.value,
    });
  }
};
</script>

<style scoped>
.division-setup {
  margin: 2rem 0;
  padding: 1.5rem;
  background-color: var(--fraction-bg, #f8f9fa);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.input-group {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.submit-button {
  margin-top: 1.5rem;
  padding: 0.5rem 1.25rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.submit-button:hover:not(:disabled) {
  background-color: #45a049;
  transform: translateY(-1px);
}

.submit-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

@media (prefers-color-scheme: dark) {
  .division-setup {
    background-color: var(--fraction-bg, #2a2a2a);
  }
}

@media (max-width: 600px) {
  .input-group {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
}
</style>
