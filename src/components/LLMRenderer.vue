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
import {
  useSmoothStream,
  type SmoothStreamOptions,
} from "../composables/useSmoothStream";

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
  // smoothed fade-in streaming - `true` for defaults, or an options object to
  // tune it. omitted / false keeps the raw pass-through behaviour
  smooth?: boolean | Partial<SmoothStreamOptions>;
  // blocks that match no registered type render nothing while streaming and
  // only commit to the fallback placeholder once the closing 】 arrives. set
  // this to also suppress that post-commit placeholder, so unknown/malformed
  // blocks are silently dropped entirely
  hideUnknownBlocks?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  blocks: () => [],
  theme: "rose-pine",
  smooth: false,
  hideUnknownBlocks: false,
});

const SMOOTH_DEFAULTS: SmoothStreamOptions = {
  enabled: false,
  settleMs: 260,
  minCps: 22,
  fade: true,
  fadeWindow: 64,
  fadeBlurWindow: 12,
  fadeBlur: 3.5,
};

const smoothOptions = computed<SmoothStreamOptions>(() => {
  const value = props.smooth;
  if (value === true) return { ...SMOOTH_DEFAULTS, enabled: true };
  if (!value) return { ...SMOOTH_DEFAULTS, enabled: false };
  return { ...SMOOTH_DEFAULTS, enabled: true, ...value };
});

const sourceText = computed(() => props.text);
const { displayed, fadeOffset, fadeActive } = useSmoothStream(
  sourceText,
  smoothOptions
);

const activeText = computed(() =>
  smoothOptions.value.enabled ? displayed.value : props.text
);

// in smooth mode code is highlighted to a string so the fade can run through
// it; otherwise code keeps the original streaming-component path untouched
const smoothMode = computed(() => smoothOptions.value.enabled);

// fade props applied only to the live streaming tail (the final markdown chunk)
const fadeBindings = computed(() => {
  const opts = smoothOptions.value;
  if (!opts.enabled || !opts.fade) return null;
  return {
    fade: fadeActive.value,
    fadeWindow: opts.fadeWindow,
    fadeBlurWindow: opts.fadeBlurWindow,
    fadeOffset: fadeOffset.value,
    fadeBlur: opts.fadeBlur,
  };
});

const blockRegistry = computed(() => {
  const registry: Record<string, any> = {};
  props.blocks.forEach((block) => {
    registry[block.type] = block.component;
  });
  return registry;
});

const isInsideCodeBlock = (text: string, position: number): boolean => {
  const beforePosition = text.slice(0, position);

  const inlineCodeMatches = beforePosition.match(/`/g);
  if (inlineCodeMatches && inlineCodeMatches.length % 2 === 1) {
    return true;
  }

  const codeBlockPattern = /```[\s\S]*?```|```[\s\S]*$/g;
  let match;
  while ((match = codeBlockPattern.exec(text)) !== null) {
    if (position >= match.index && position < match.index + match[0].length) {
      return true;
    }
  }

  return false;
};

const renderChunks = computed<RenderChunk[]>(() => {
  const chunks: RenderChunk[] = [];
  const text = activeText.value;

  if (!text) return chunks;

  let currentIndex = 0;
  const blockPattern = /【([^】]*)】?/g;
  let match;

  while ((match = blockPattern.exec(text)) !== null) {
    if (isInsideCodeBlock(text, match.index)) {
      continue;
    }

    const beforeBlock = text.slice(currentIndex, match.index);

    if (beforeBlock.trim()) {
      chunks.push({
        component: MarkdownRenderer,
        props: {
          source: beforeBlock,
          theme: props.theme,
          smoothMode: smoothMode.value,
        },
      });
    }

    const blockContent = match[1];
    const isComplete = match[0].endsWith("】");

    // 】 is the commitment point. before it arrives, an unmatched repair could
    // still resolve into a registered type as more characters stream in, so we
    // never render a fallback placeholder for an in-flight block - registered
    // components still grow in progressively, everything else stays invisible
    if (blockContent) {
      try {
        const repairedJson = jsonrepair(blockContent);
        const blockData = JSON.parse(repairedJson);

        if (blockData.type && blockRegistry.value[blockData.type]) {
          chunks.push({
            component: blockRegistry.value[blockData.type],
            props: { block: blockData },
          });
        } else if (isComplete && !props.hideUnknownBlocks) {
          chunks.push({
            component: GenericBlockComponent,
            props: {
              block: blockData,
              isComplete: true,
              rawContent: blockContent,
            },
          });
        }
      } catch (error) {
        if (isComplete && !props.hideUnknownBlocks) {
          chunks.push({
            component: GenericBlockComponent,
            props: {
              block: null,
              isComplete: true,
              rawContent: blockContent,
              error: error instanceof Error ? error.message : "Parse error",
            },
          });
        }
      }
    }

    currentIndex = match.index + match[0].length;
  }

  // the trailing markdown is the live streaming tail - it carries the fade
  const remainingText = text.slice(currentIndex);
  if (remainingText.trim()) {
    chunks.push({
      component: MarkdownRenderer,
      props: {
        source: remainingText,
        theme: props.theme,
        smoothMode: smoothMode.value,
        ...(fadeBindings.value ?? {}),
      },
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
