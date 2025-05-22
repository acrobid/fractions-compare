<template>
  <div class="grid-placeholder">
    <div class="placeholder-content">
      <svg
        class="placeholder-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12" y2="8"></line>
      </svg>
      <p>{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string;
}>();
</script>

<style scoped>
.grid-placeholder {
  text-align: center;
  padding: 3rem 2rem;
  color: #6c757d;
  margin: 2rem 0;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.placeholder-icon {
  color: #6c757d;
  opacity: 0.5;
}

@media (prefers-color-scheme: dark) {
  .grid-placeholder {
    color: #aaa;
  }

  .placeholder-icon {
    color: #aaa;
  }
}
</style>
