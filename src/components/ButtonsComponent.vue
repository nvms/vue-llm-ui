<template>
  <div class="buttons-component">
    <div class="buttons-container">
      <button
        v-for="(button, index) in buttons"
        :key="index"
        class="button"
        :class="{
          primary: button.primary,
          secondary: button.secondary,
          danger: button.danger,
        }"
        :disabled="button.disabled"
        @click="handleButtonClick(button, index)"
      >
        {{ button.text || button.label || `Button ${index + 1}` }}
      </button>
    </div>

    <!-- Show click feedback -->
    <div v-if="lastClicked" class="click-feedback">
      <span class="feedback-text">
        Clicked: "{{ lastClicked.text || lastClicked.label }}"
      </span>
      <button class="clear-feedback" @click="clearFeedback">×</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

interface Button {
  text?: string;
  label?: string;
  primary?: boolean;
  secondary?: boolean;
  danger?: boolean;
  disabled?: boolean;
  action?: string;
  data?: any;
}

interface Props {
  block: {
    type: string;
    buttons?: Button[];
    title?: string;
    description?: string;
  };
}

const props = defineProps<Props>();

const lastClicked = ref<Button | null>(null);

const buttons = computed(() => props.block.buttons || []);

const handleButtonClick = (button: Button, index: number) => {
  lastClicked.value = button;

  // Emit custom event or handle action
  console.log("Button clicked:", {
    button,
    index,
    action: button.action,
    data: button.data,
  });

  // Auto-clear feedback after 3 seconds
  setTimeout(() => {
    if (lastClicked.value === button) {
      lastClicked.value = null;
    }
  }, 3000);
};

const clearFeedback = () => {
  lastClicked.value = null;
};
</script>

<style scoped>
.buttons-component {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin: 8px 0;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.buttons-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.button {
  padding: 8px 16px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  background: white;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.button:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #b0b0b0;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.button.primary {
  background: #2196f3;
  color: white;
  border-color: #1976d2;
}

.button.primary:hover:not(:disabled) {
  background: #1976d2;
  border-color: #1565c0;
}

.button.secondary {
  background: #6c757d;
  color: white;
  border-color: #5a6268;
}

.button.secondary:hover:not(:disabled) {
  background: #5a6268;
  border-color: #495057;
}

.button.danger {
  background: #f44336;
  color: white;
  border-color: #d32f2f;
}

.button.danger:hover:not(:disabled) {
  background: #d32f2f;
  border-color: #c62828;
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.click-feedback {
  margin-top: 12px;
  padding: 8px 12px;
  background: #e8f5e8;
  border: 1px solid #4caf50;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: #2e7d32;
}

.feedback-text {
  flex: 1;
}

.clear-feedback {
  background: none;
  border: none;
  color: #2e7d32;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  padding: 0;
  margin-left: 8px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.clear-feedback:hover {
  background: rgba(46, 125, 50, 0.1);
}
</style>
