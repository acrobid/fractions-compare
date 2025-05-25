import { ref, Ref } from "vue";

export interface FlyingDigit {
  id: string;
  digit: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
}

export function useFlyingDigitsAnimation() {
  const flyingDigits = ref<FlyingDigit[]>([]);
  const isAnimating = ref(false);

  const createFlyingDigits = async (
    dividend: Ref<string>,
    divisor: Ref<string>,
  ) => {
    const inputContainer = document.querySelector(".division-input-container");
    const gridContainer = document.querySelector(".division-grid");

    if (!inputContainer || !gridContainer) {
      return false;
    }

    const inputRect = inputContainer.getBoundingClientRect();
    const gridRect = gridContainer.getBoundingClientRect();

    const newFlyingDigits: FlyingDigit[] = [];

    // Add divisor digit(s)
    const divisorStr = String(divisor.value);
    for (let i = 0; i < divisorStr.length; i++) {
      newFlyingDigits.push({
        id: `flying-divisor-${i}`,
        digit: divisorStr[i],
        startX: inputRect.left + 60, // Approximate divisor input position
        startY: inputRect.top + 20,
        targetX: gridRect.left + 50 + Math.random() * 100, // Random spread in grid area
        targetY: gridRect.top + 50 + Math.random() * 100,
      });
    }

    // Add dividend digit(s)
    const dividendStr = String(dividend.value);
    for (let i = 0; i < dividendStr.length; i++) {
      newFlyingDigits.push({
        id: `flying-dividend-${i}`,
        digit: dividendStr[i],
        startX: inputRect.left + 240, // Approximate dividend input position
        startY: inputRect.top + 20,
        targetX: gridRect.left + 100 + Math.random() * 150, // Random spread in grid area
        targetY: gridRect.top + 80 + Math.random() * 120,
      });
    }

    flyingDigits.value = newFlyingDigits;

    // Wait for animations to complete, then clean up
    await new Promise((resolve) => setTimeout(resolve, 1000));
    flyingDigits.value = [];

    return true;
  };

  const startAnimation = async (
    dividend: Ref<string>,
    divisor: Ref<string>,
    generate: () => void,
    showEntranceAnimations: Ref<boolean>,
  ) => {
    if (isAnimating.value) return;

    isAnimating.value = true;

    const flyingAnimationSuccessful = await createFlyingDigits(
      dividend,
      divisor,
    );

    // Trigger entrance animations simultaneously with flying digits
    showEntranceAnimations.value = true;
    generate();

    if (!flyingAnimationSuccessful) {
      // Fallback if elements not found
      generate();
    }

    // Reset entrance animation flag after the animations complete
    setTimeout(() => {
      showEntranceAnimations.value = false;
    }, 500); // Short delay to let entrance animations finish

    isAnimating.value = false;
  };

  return {
    flyingDigits,
    isAnimating,
    startAnimation,
  };
}
