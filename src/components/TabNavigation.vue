<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

defineProps<{
  modelValue: string;
}>();

const emit = defineEmits(["update:modelValue"]);

const selectTab = (tab: string) => {
  emit("update:modelValue", tab);
};
</script>

<template>
  <div class="tab-navigation">
    <button
      @click="selectTab('compare')"
      class="tab-button"
      :class="{ active: modelValue === 'compare' }"
    >
      Compare Fractions
    </button>
    <button
      @click="selectTab('decimal')"
      class="tab-button"
      :class="{ active: modelValue === 'decimal' }"
    >
      Decimal to Fraction
    </button>

    <button
      @click="selectTab('gridLongDivision')"
      class="tab-button"
      :class="{ active: modelValue === 'gridLongDivision' }"
    >
      Grid Division (New)
    </button>
  </div>
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
