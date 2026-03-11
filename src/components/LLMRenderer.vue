<template>
  <div class="llm-renderer">
    <component
      v-for="(chunk, index) in renderChunks"
      :key="`chunk-${index}`"
      :is="chunk.component"
      v-bind="chunk.props"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { jsonrepair } from "jsonrepair";
import MarkdownRenderer from "./MarkdownRenderer.vue";
import GenericBlockComponent from "./GenericBlockComponent.vue";

interface BlockSpec {
  type: string;
  component: any;
}

interface RenderChunk {
  component: any;
  props: Record<string, any>;
}

interface Props {
  text: string;
  blocks?: BlockSpec[];
  theme?: string;
}

const props = withDefaults(defineProps<Props>(), {
  blocks: () => [],
  theme: "rose-pine",
});

// Create a registry of block components
const blockRegistry = computed(() => {
  const registry: Record<string, any> = {};
  props.blocks.forEach((block) => {
    registry[block.type] = block.component;
  });
  return registry;
});

// Helper function to check if a position is inside a code block
const isInsideCodeBlock = (text: string, position: number): boolean => {
  const beforePosition = text.slice(0, position);

  // Check for inline code (backticks)
  const inlineCodeMatches = beforePosition.match(/`/g);
  if (inlineCodeMatches && inlineCodeMatches.length % 2 === 1) {
    return true;
  }

  // Check for code blocks (triple backticks)
  const codeBlockPattern = /```[\s\S]*?```|```[\s\S]*$/g;
  let match;
  while ((match = codeBlockPattern.exec(text)) !== null) {
    if (position >= match.index && position < match.index + match[0].length) {
      return true;
    }
  }

  return false;
};

// Parse the text into chunks (markdown text and blocks)
const renderChunks = computed<RenderChunk[]>(() => {
  const chunks: RenderChunk[] = [];
  const { text } = props;

  if (!text) return chunks;

  let currentIndex = 0;
  const blockPattern = /【([^】]*)】?/g;
  let match;

  // Reset regex lastIndex
  blockPattern.lastIndex = 0;

  while ((match = blockPattern.exec(text)) !== null) {
    // Skip if this match is inside a code block
    if (isInsideCodeBlock(text, match.index)) {
      continue;
    }

    const beforeBlock = text.slice(currentIndex, match.index);

    // Add markdown chunk before the block if there's content
    if (beforeBlock.trim()) {
      chunks.push({
        component: MarkdownRenderer,
        props: { source: beforeBlock, theme: props.theme },
      });
    }

    // Process the block content
    const blockContent = match[1];
    const isComplete = match[0].endsWith("】");

    if (blockContent) {
      try {
        // Use jsonrepair to fix potentially malformed JSON
        const repairedJson = jsonrepair(blockContent);
        const blockData = JSON.parse(repairedJson);

        // Check if we have a type and matching component
        if (blockData.type && blockRegistry.value[blockData.type]) {
          chunks.push({
            component: blockRegistry.value[blockData.type],
            props: { block: blockData },
          });
        } else {
          // Use generic component for unknown types or incomplete blocks
          chunks.push({
            component: GenericBlockComponent,
            props: {
              block: blockData,
              isComplete,
              rawContent: blockContent,
            },
          });
        }
      } catch (error) {
        // If JSON repair fails, show generic component with raw content
        chunks.push({
          component: GenericBlockComponent,
          props: {
            block: null,
            isComplete,
            rawContent: blockContent,
            error: error instanceof Error ? error.message : "Parse error",
          },
        });
      }
    } else if (!isComplete) {
      // Empty incomplete block - show loading state
      chunks.push({
        component: GenericBlockComponent,
        props: {
          block: null,
          isComplete: false,
          rawContent: "",
          loading: true,
        },
      });
    }

    currentIndex = match.index + match[0].length;
  }

  // Add any remaining text as markdown
  const remainingText = text.slice(currentIndex);
  if (remainingText.trim()) {
    chunks.push({
      component: MarkdownRenderer,
      props: { source: remainingText, theme: props.theme },
    });
  }

  return chunks;
});
</script>

<style scoped>
.llm-renderer {
  line-height: 1.6;
}

.llm-renderer > * {
  margin-bottom: 0.5rem;
}

.llm-renderer > *:last-child {
  margin-bottom: 0;
}
</style>
