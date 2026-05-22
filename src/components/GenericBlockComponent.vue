<template>
  <div class="generic-block" :class="{ 'is-error': error }">
    <div v-if="loading" class="gb-pending">
      <span class="gb-pulse" />
      <span class="gb-pending-text">Receiving block</span>
    </div>

    <div v-else-if="error" class="gb-body">
      <div class="gb-label">Block could not be parsed</div>
      <p class="gb-message">{{ error }}</p>
      <pre v-if="rawContent" class="gb-code">{{ rawContent }}</pre>
    </div>

    <div v-else-if="block" class="gb-body">
      <div class="gb-label">
        Unrecognized block
        <code class="gb-type">{{ block.type || "untyped" }}</code>
      </div>
      <pre class="gb-code">{{ formatted }}</pre>
    </div>

    <div v-else class="gb-pending">
      <span class="gb-pulse" />
      <span class="gb-pending-text">Receiving block</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  block?: any;
  isComplete?: boolean;
  rawContent?: string;
  error?: string;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  block: null,
  isComplete: false,
  rawContent: "",
  error: "",
  loading: false,
});

const formatted = computed(() => {
  try {
    return JSON.stringify(props.block, null, 2);
  } catch {
    return String(props.block);
  }
});
</script>

<style scoped>
.generic-block {
  border: 1px solid #e6e6e1;
  border-radius: 10px;
  padding: 14px 16px;
  margin: 8px 0;
  background: #fbfbf9;
  font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
  font-size: 14px;
  color: #2a2a26;
}

.generic-block.is-error {
  border-color: #e7cdc8;
  background: #fcf6f5;
}

.gb-pending {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #8a8a80;
}

.gb-pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #b6b6ab;
  flex-shrink: 0;
  animation: gb-pulse 1.1s ease-in-out infinite;
}

@keyframes gb-pulse {
  0%,
  100% {
    opacity: 0.25;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

.gb-pending-text {
  font-size: 13px;
  letter-spacing: 0.01em;
}

.gb-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.gb-label {
  font-weight: 600;
  font-size: 13px;
  color: #44443e;
  display: flex;
  align-items: center;
  gap: 8px;
}

.is-error .gb-label {
  color: #a4453a;
}

.gb-type {
  font-family: "Fira Code", "SF Mono", "Cascadia Code", monospace;
  font-size: 12px;
  font-weight: 500;
  background: #efefe9;
  border: 1px solid #e3e3db;
  border-radius: 4px;
  padding: 1px 6px;
  color: #55554d;
}

.gb-message {
  margin: 0;
  font-size: 13px;
  color: #6b6b62;
}

.gb-code {
  margin: 0;
  font-family: "Fira Code", "SF Mono", "Cascadia Code", monospace;
  font-size: 12px;
  line-height: 1.5;
  color: #55554d;
  background: #f3f3ee;
  border: 1px solid #e6e6df;
  border-radius: 6px;
  padding: 10px 12px;
  overflow: auto;
  max-height: 180px;
}
</style>
