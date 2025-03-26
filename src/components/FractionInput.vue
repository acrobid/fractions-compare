<script setup lang="ts">
defineProps<{
  label: string;
  numerator: number;
  denominator: number;
}>();

defineEmits<{
  (e: 'update:numerator', value: number): void;
  (e: 'update:denominator', value: number): void;
}>();
</script>

<template>
  <div class="fraction-input">
    <h3>{{ label }}</h3>
    <div class="inputs">
      <div class="input-group">
        <button 
          class="btn" 
          @click="$emit('update:numerator', Math.max(0, numerator - 1))"
          aria-label="Decrease numerator"
        >−</button>
        <input
          type="number"
          min="0"
          :value="numerator"
          @input="$emit('update:numerator', +($event.target as HTMLInputElement).value)"
          placeholder="Numerator"
        />
        <button 
          class="btn" 
          @click="$emit('update:numerator', numerator + 1)"
          aria-label="Increase numerator"
        >+</button>
      </div>
      <div class="fraction-line"></div>
      <div class="input-group">
        <button 
          class="btn" 
          @click="$emit('update:denominator', Math.max(1, denominator - 1))"
          aria-label="Decrease denominator"
        >−</button>
        <input
          type="number"
          min="1"
          :value="denominator"
          @input="$emit('update:denominator', +($event.target as HTMLInputElement).value)"
          placeholder="Denominator"
        />
        <button 
          class="btn" 
          @click="$emit('update:denominator', denominator + 1)"
          aria-label="Increase denominator"
        >+</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fraction-input {
  margin: 0;
}

h3 {
  font-size: 0.9rem;
  margin: 0 0 0.75rem;
  color: #42b883;
  text-align: center;
}

.inputs {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 160px;
}

input {
  width: 60px;
  height: 44px;
  padding: 0.25rem;
  text-align: center;
  border: 2px solid #42b883;
  border-radius: 8px;
  background-color: transparent;
  color: #42b883;
  font-size: 1rem;
  -moz-appearance: textfield;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 0 0 2px rgba(66, 184, 131, 0.2);
}

.btn {
  width: 44px;
  height: 44px;
  padding: 0;
  border: 2px solid #42b883;
  border-radius: 8px;
  background-color: transparent;
  color: #42b883;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;
  transition: all 0.2s ease;
}

.btn:active {
  background-color: rgba(66, 184, 131, 0.1);
  transform: scale(0.95);
}

.fraction-line {
  width: 100%;
  height: 2px;
  background-color: #42b883;
  margin: 0.25rem 0;
}

@media (min-width: 640px) {
  .fraction-input {
    margin: 1rem;
  }

  h3 {
    font-size: 1rem;
    margin-bottom: 1rem;
  }

  .input-group {
    width: 180px;
    gap: 0.75rem;
  }

  input {
    width: 70px;
    height: 48px;
    padding: 0.5rem;
    font-size: 1.1rem;
  }

  .btn {
    width: 48px;
    height: 48px;
    font-size: 1.6rem;
  }
}
</style>