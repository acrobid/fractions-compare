<template>
  <div class="number-input">
    <label :for="id">
      {{ label }}:
      <input
        :id="id"
        type="number"
        :value="modelValue"
        @input="handleInput"
        :placeholder="placeholder"
        :min="min"
        :disabled="disabled"
        :class="{ error: !!error }"
      />
    </label>
    <span v-if="error" class="error-hint">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  label: string;
  modelValue: number | null;
  placeholder?: string;
  min?: number;
  disabled?: boolean;
  error?: string;
  id: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: number | null): void;
}>();

const handleInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  emit("update:modelValue", value === "" ? null : Number(value));
};
</script>

<style scoped>
.number-input {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

label {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-weight: 500;
}

input {
  width: 120px;
  padding: 0.5rem;
  border: 1.5px solid var(--input-border, #ccc);
  border-radius: 4px;
  font-size: 1rem;
  background-color: var(--input-bg, white);
  color: inherit;
  transition: all 0.2s ease;
}

input:focus {
  outline: none;
  border-color: var(--input-focus, #2196f3);
  box-shadow: 0 0 0 2px var(--input-focus-shadow, rgba(33, 150, 243, 0.1));
}

input:disabled {
  background-color: var(--input-disabled, #e9ecef);
  cursor: not-allowed;
}

input.error {
  border-color: var(--error-color, #dc3545);
}

.error-hint {
  font-size: 0.8rem;
  color: var(--error-color, #dc3545);
  position: absolute;
  bottom: -1.2rem;
  left: 0;
}

@media (prefers-color-scheme: dark) {
  input {
    background-color: var(--input-bg-dark, #1a1a1a);
    border-color: var(--input-border-dark, #404040);
    color: rgba(255, 255, 255, 0.87);
  }

  input:disabled {
    background-color: var(--input-disabled-dark, #333);
  }
}
</style>
