<template>
  <div class="markdown-renderer">
    <component
      v-for="(chunk, index) in renderChunks"
      :key="`chunk-${index}-${chunk.key}`"
      :is="chunk.component"
      v-bind="chunk.props"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import VueMarkdown from "vue-markdown-render";
import { ShikiCachedRenderer } from "shiki-stream/vue";
import { getShikiHighlighter } from "../utils/shikiPlugin";

interface Props {
  source: string;
  theme?: string;
}

const props = withDefaults(defineProps<Props>(), {
  theme: "rose-pine",
});

const highlighter = ref<any>(null);

// Initialize highlighter
onMounted(async () => {
  try {
    highlighter.value = await getShikiHighlighter();
  } catch (error) {
    console.error(error);
  }
});

// Parse markdown into chunks, handling streaming code blocks
const renderChunks = computed(() => {
  const chunks: Array<{ component: any; props: any; key: string }> = [];
  const { source } = props;

  if (!source) return chunks;

  let currentIndex = 0;
  let chunkCounter = 0;

  // Look for code block patterns - both complete and incomplete
  const codeBlockStartRegex = /```(\w+)?/g;
  let match;

  // Reset regex
  codeBlockStartRegex.lastIndex = 0;

  while ((match = codeBlockStartRegex.exec(source)) !== null) {
    const codeBlockStart = match.index;
    const language = match[1] || "text";

    // Add markdown content before the code block
    const beforeCode = source.slice(currentIndex, codeBlockStart);
    if (beforeCode.trim()) {
      chunks.push({
        component: VueMarkdown,
        props: { source: beforeCode },
        key: `md-${chunkCounter++}`,
      });
    }

    // Look for the end of the code block
    const codeStart = match.index + match[0].length;
    const codeEndRegex = /```/g;
    codeEndRegex.lastIndex = codeStart;

    const endMatch = codeEndRegex.exec(source);

    if (endMatch) {
      // Complete code block found
      const codeContent = source.slice(codeStart, endMatch.index);
      // Remove leading newline if present
      const cleanCode = codeContent.startsWith("\n")
        ? codeContent.slice(1)
        : codeContent;

      if (highlighter.value && cleanCode.trim()) {
        chunks.push({
          component: ShikiCachedRenderer,
          props: {
            code: cleanCode,
            lang: language,
            theme: props.theme,
            highlighter: highlighter.value,
          },
          key: `code-${chunkCounter++}`,
        });
      } else {
        // Fallback to regular markdown if highlighter not ready
        chunks.push({
          component: VueMarkdown,
          props: { source: `\`\`\`${language}\n${cleanCode}\n\`\`\`` },
          key: `code-fallback-${chunkCounter++}`,
        });
      }

      currentIndex = endMatch.index + 3; // Move past the closing ```
      codeBlockStartRegex.lastIndex = currentIndex;
    } else {
      // Incomplete code block - still streaming
      const codeContent = source.slice(codeStart);
      // Remove leading newline if present
      const cleanCode = codeContent.startsWith("\n")
        ? codeContent.slice(1)
        : codeContent;

      if (cleanCode.length > 0 && highlighter.value) {
        chunks.push({
          component: ShikiCachedRenderer,
          props: {
            code: cleanCode,
            lang: language,
            theme: props.theme,
            highlighter: highlighter.value,
          },
          key: `streaming-code-${chunkCounter++}`,
        });
      } else if (cleanCode.length > 0) {
        // Fallback for incomplete code block without highlighter
        chunks.push({
          component: VueMarkdown,
          props: { source: `\`\`\`${language}\n${cleanCode}` },
          key: `streaming-fallback-${chunkCounter++}`,
        });
      }

      // We've reached the end of the source
      currentIndex = source.length;
      break;
    }
  }

  // Add any remaining markdown content
  const remainingContent = source.slice(currentIndex);
  if (remainingContent.trim()) {
    chunks.push({
      component: VueMarkdown,
      props: { source: remainingContent },
      key: `md-final-${chunkCounter++}`,
    });
  }

  // If no code blocks found, render entire content as markdown
  if (chunks.length === 0) {
    chunks.push({
      component: VueMarkdown,
      props: { source: source },
      key: `md-only-${chunkCounter++}`,
    });
  }

  return chunks;
});
</script>

<style scoped>
.markdown-renderer {
  line-height: 1.6;
}

.markdown-renderer > * {
  margin-bottom: 0.5rem;
}

.markdown-renderer > *:last-child {
  margin-bottom: 0;
}

/* Style the shiki-stream code blocks */
.markdown-renderer :deep(.shiki) {
  background: #1e1e1e !important;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.markdown-renderer :deep(.shiki code) {
  font-family: "Fira Code", "Monaco", "Cascadia Code", "Roboto Mono", monospace;
  font-size: 0.9rem;
  line-height: 1.5;
}
</style>
