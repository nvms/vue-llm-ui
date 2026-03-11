<template>
  <div class="generic-block" :class="{ loading: loading, error: error }">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <span>Loading block...</span>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <div class="error-content">
        <div class="error-title">Block Parse Error</div>
        <div class="error-message">{{ error }}</div>
        <details class="raw-content">
          <summary>Raw content</summary>
          <pre>{{ rawContent }}</pre>
        </details>
      </div>
    </div>

    <div v-else-if="block" class="unknown-type">
      <div class="unknown-icon">🔧</div>
      <div class="unknown-content">
        <div class="unknown-title">
          Unknown block type: <code>{{ block.type || "undefined" }}</code>
        </div>
        <div class="block-preview">
          <details>
            <summary>Block data</summary>
            <pre>{{ JSON.stringify(block, null, 2) }}</pre>
          </details>
        </div>
      </div>
    </div>

    <div v-else class="incomplete-block">
      <div class="incomplete-icon">⏳</div>
      <div class="incomplete-content">
        <div class="incomplete-title">Parsing block...</div>
        <div class="incomplete-preview" v-if="rawContent">
          <code>【{{ rawContent }}{{ isComplete ? "" : "..." }}</code>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  block?: any;
  isComplete?: boolean;
  rawContent?: string;
  error?: string;
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  block: null,
  isComplete: false,
  rawContent: "",
  error: "",
  loading: false,
});
</script>

<style scoped>
.generic-block {
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin: 8px 0;
  background: #fafafa;
  font-family: system-ui, -apple-system, sans-serif;
}

.generic-block.loading {
  border-color: #2196f3;
  background: #f3f9ff;
}

.generic-block.error {
  border-color: #f44336;
  background: #fff5f5;
}

.loading-state,
.error-state,
.unknown-type,
.incomplete-block {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e0e0e0;
  border-top: 2px solid #2196f3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-icon,
.unknown-icon,
.incomplete-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.error-content,
.unknown-content,
.incomplete-content {
  flex: 1;
  min-width: 0;
}

.error-title,
.unknown-title,
.incomplete-title {
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
}

.error-message {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
}

.raw-content,
.block-preview {
  margin-top: 8px;
}

.raw-content summary,
.block-preview summary {
  cursor: pointer;
  font-size: 12px;
  color: #666;
  user-select: none;
}

.raw-content pre,
.block-preview pre {
  background: #f0f0f0;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
  margin: 4px 0 0 0;
}

.incomplete-preview {
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 12px;
  color: #666;
  background: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
  margin-top: 4px;
}

code {
  background: #f0f0f0;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 13px;
}
</style>
