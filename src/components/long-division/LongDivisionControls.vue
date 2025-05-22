<template>
  <div class="controls-section">
    <div class="controls">
      <button
        @click="$emit('start')"
        :disabled="!canStart || problemStarted"
        class="control-button start-button"
      >
        <span class="button-content">
          <PlayIcon />
          Start Problem
        </span>
      </button>
      <button
        @click="$emit('next')"
        :disabled="!canNext || !problemStarted"
        class="control-button next-button"
      >
        <span class="button-content">
          Next Step
          <ChevronRightIcon />
        </span>
      </button>
      <button @click="$emit('reset')" class="control-button reset-button">
        <span class="button-content">
          <RefreshIcon />
          Reset
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import PlayIcon from "./icons/PlayIcon.vue";
import ChevronRightIcon from "./icons/ChevronRightIcon.vue";
import RefreshIcon from "./icons/RefreshIcon.vue";

defineProps<{
  canStart: boolean;
  canNext: boolean;
  problemStarted: boolean;
}>();

defineEmits<{
  (e: "start"): void;
  (e: "next"): void;
  (e: "reset"): void;
}>();
</script>

<style scoped>
.controls-section {
  margin: 1.5rem 0;
}

.controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.control-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 120px;
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.start-button {
  background-color: #4caf50;
  color: white;
}

.start-button:hover:not(:disabled) {
  background-color: #45a049;
  transform: translateY(-1px);
}

.next-button {
  background-color: #2196f3;
  color: white;
}

.next-button:hover:not(:disabled) {
  background-color: #1976d2;
  transform: translateY(-1px);
}

.reset-button {
  background-color: #ffc107;
  color: #000;
}

.reset-button:hover {
  background-color: #ffa000;
  transform: translateY(-1px);
}

.control-button:disabled {
  background-color: #e0e0e0;
  color: #9e9e9e;
  cursor: not-allowed;
  transform: none;
}

@media (prefers-color-scheme: dark) {
  .reset-button {
    background-color: #ffa000;
    color: #000;
  }

  .reset-button:hover {
    background-color: #ff8f00;
  }
}

@media (max-width: 600px) {
  .controls {
    flex-direction: column;
    align-items: stretch;
  }

  .control-button {
    width: 100%;
  }
}
</style>
