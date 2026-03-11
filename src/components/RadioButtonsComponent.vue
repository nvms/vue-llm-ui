<template>
  <div class="radio-buttons-component">
    <div v-if="block.title" class="title">{{ block.title }}</div>
    <div v-if="block.description" class="description">
      {{ block.description }}
    </div>

    <div class="radio-group">
      <label
        v-for="(option, index) in options"
        :key="index"
        class="radio-option"
        :class="{ selected: selectedValue === option.value }"
      >
        <input
          type="radio"
          :name="radioGroupName"
          :value="option.value"
          v-model="selectedValue"
          @change="handleChange"
        />
        <span class="radio-custom"></span>
        <span class="option-text">{{ option.text || option.value }}</span>
      </label>
    </div>

    <div v-if="selectedValue" class="selection-feedback">
      <span class="feedback-icon">✓</span>
      Selected: <strong>{{ getSelectedOptionText() }}</strong>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

interface RadioOption {
  value: string | number;
  text?: string;
}

interface Props {
  block: {
    type: string;
    options?: RadioOption[];
    title?: string;
    description?: string;
    defaultValue?: string | number;
  };
}

const props = defineProps<Props>();

const selectedValue = ref<string | number | null>(null);

// Generate unique name for radio group
const radioGroupName = `radio-group-${Math.random().toString(36).substring(2, 9)}`;

const options = computed(() => props.block.options || []);

// Track if user has manually made a selection
const userHasSelected = ref(false);

// Function to apply default value if conditions are met
const applyDefaultValueIfValid = () => {
  const defaultVal = props.block.defaultValue;
  if (
    !userHasSelected.value &&
    defaultVal &&
    options.value.some((opt) => opt.value === defaultVal)
  ) {
    selectedValue.value = defaultVal;
  }
};

// Watch for changes to defaultValue
watch(
  () => props.block.defaultValue,
  () => applyDefaultValueIfValid(),
  { immediate: true }
);

// Watch for changes to options (in case defaultValue comes before options)
watch(
  () => props.block.options,
  () => applyDefaultValueIfValid(),
  { immediate: true }
);

const handleChange = () => {
  userHasSelected.value = true;
  console.log("Radio selection changed:", {
    value: selectedValue.value,
    option: options.value.find((opt) => opt.value === selectedValue.value),
  });
};

const getSelectedOptionText = () => {
  const selected = options.value.find(
    (opt) => opt.value === selectedValue.value
  );
  return selected?.text || selectedValue.value;
};
</script>

<style scoped>
.radio-buttons-component {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin: 8px 0;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.description {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.radio-option {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  position: relative;
}

.radio-option:hover {
  background: #f5f5f5;
}

.radio-option.selected {
  background: #e3f2fd;
  border: 1px solid #2196f3;
}

.radio-option input[type="radio"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.radio-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #d0d0d0;
  border-radius: 50%;
  margin-right: 12px;
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.radio-option input[type="radio"]:checked + .radio-custom {
  border-color: #2196f3;
  background: #2196f3;
}

.radio-option input[type="radio"]:checked + .radio-custom::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: white;
}

.option-text {
  font-size: 14px;
  color: #333;
  flex: 1;
}

.selection-feedback {
  margin-top: 12px;
  padding: 8px 12px;
  background: #e8f5e8;
  border: 1px solid #4caf50;
  border-radius: 4px;
  font-size: 13px;
  color: #2e7d32;
  display: flex;
  align-items: center;
  gap: 8px;
}

.feedback-icon {
  color: #4caf50;
  font-weight: bold;
}
</style>
