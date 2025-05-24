<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

interface Props {
  dividend: number | null;
  divisor: number | null;
}

const props = defineProps<Props>();

const emit = defineEmits(["update:dividend", "update:divisor"]);

const handleDividendInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:dividend", Number(target.value));
};

const handleDivisorInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:divisor", Number(target.value));
};
</script>

<template>
  <div class="division-input-container">
    <div class="division-input-wrapper">
      <input
        type="number"
        :value="props.divisor"
        @input="handleDivisorInput"
        placeholder="Divisor"
        class="divisor-styled-input styled-input-cell"
        aria-label="Divisor"
      />
      <input
        type="number"
        :value="props.dividend"
        @input="handleDividendInput"
        placeholder="Dividend"
        class="dividend-styled-input styled-input-cell"
        aria-label="Dividend"
      />
    </div>
  </div>
</template>

<style scoped>
.division-input-container {
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: "Comic Sans MS", "Comic Sans", "Chalkboard SE", "Courier New",
    monospace;
}

.division-input-wrapper {
  display: flex;
  align-items: stretch; /* Make inputs the same height */
  background-color: transparent;
  padding: 0;
  border-radius: 0;
  box-shadow: none;
  border: none;
}

.styled-input-cell {
  background: #1e2227;
  border: none; /* No borders by default, will be added specifically */
  color: #e6edf3;
  font-size: 28px;
  font-family: inherit;
  text-align: center;
  border-radius: 0;
  outline: none;
  appearance: textfield;
  -moz-appearance: textfield;
  padding: 10px;
  transition: background-color 0.2s, box-shadow 0.2s, border-color 0.2s;
  box-shadow: none;
  /* height: auto; Let height be determined by content + padding + wrapper stretch */
  box-sizing: border-box;
}

.styled-input-cell::-webkit-outer-spin-button,
.styled-input-cell::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.styled-input-cell::placeholder {
  color: #6a737d;
  font-size: 20px;
  font-style: italic;
}

.divisor-styled-input {
  width: 120px;
  border-right: 4px solid #adbac7; /* This is the vertical arm */
}

.dividend-styled-input {
  width: 180px;
  border-top: 4px solid #adbac7; /* Vinculum */
  /* Text will be 10px below the vinculum due to padding from .styled-input-cell */
}

/* Focus Styles */
.styled-input-cell:focus {
  background-color: #2a2f35;
  /* General focus outline, specific borders will override if needed */
  box-shadow: 0 0 0 2px #34d399cc;
}

.divisor-styled-input:focus {
  border-right-color: #34d399; /* Arm changes color */
}

.dividend-styled-input:focus {
  border-top-color: #34d399; /* Vinculum changes color */
  /* Ensure box-shadow from .styled-input-cell:focus is not overridden if not desired,
     or provide a combined/specific shadow here */
}

/* Dark mode adjustments (styles are already dark-themed) */
@media (prefers-color-scheme: dark) {
  .styled-input-cell {
    background: #1e2227;
    color: #e6edf3;
  }

  .styled-input-cell::placeholder {
    color: #586069;
  }

  .styled-input-cell:focus {
    background-color: #2a2f35;
    box-shadow: 0 0 0 2px #34d399cc;
  }

  .divisor-styled-input {
    border-right-color: #adbac7;
  }
  .divisor-styled-input:focus {
    border-right-color: #34d399;
  }

  .dividend-styled-input {
    border-top-color: #adbac7;
  }
  .dividend-styled-input:focus {
    border-top-color: #34d399;
  }
}
</style>
