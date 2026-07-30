<template>
  <div
    ref="container"
    class="component-reveal"
    :class="{ 'component-reveal--visible': visible, 'component-reveal--reduced': reducedMotion }"
    :style="containerStyle"
  >
    <div ref="content" class="component-reveal__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  type CSSProperties,
} from "vue";

interface Props {
  duration: number;
  fade: boolean;
  blur: number;
}

const props = defineProps<Props>();

const container = ref<HTMLElement | null>(null);
const content = ref<HTMLElement | null>(null);
const height = ref(0);
const transitionDuration = ref(props.duration);
const visible = ref(false);
const reducedMotion = ref(false);

let observer: ResizeObserver | null = null;
let revealFrame = 0;
let visibleFrame = 0;
let started = false;
let measuredHeight = 0;

const containerStyle = computed<CSSProperties>(() => ({
  height: reducedMotion.value ? "auto" : `${height.value}px`,
  "--component-reveal-duration": `${Math.max(0, transitionDuration.value)}ms`,
  "--component-reveal-blur": props.fade ? `${Math.max(0, props.blur)}px` : "0px",
  opacity: props.fade && !reducedMotion.value && !visible.value ? 0 : 1,
}));

const measure = () => {
  if (!content.value) return;
  const nextHeight = content.value.getBoundingClientRect().height;
  if (started && nextHeight !== measuredHeight) {
    const currentHeight = container.value?.getBoundingClientRect().height ?? height.value;
    const distanceRatio = Math.min(1, Math.abs(nextHeight - currentHeight) / Math.max(nextHeight, 1));
    transitionDuration.value = Math.max(120, props.duration * distanceRatio);
    height.value = currentHeight;
    requestAnimationFrame(() => {
      height.value = nextHeight;
    });
  }
  measuredHeight = nextHeight;
};

onMounted(async () => {
  reducedMotion.value =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion.value) {
    visible.value = true;
    return;
  }

  await nextTick();

  if (typeof ResizeObserver !== "undefined" && content.value) {
    observer = new ResizeObserver(measure);
    observer.observe(content.value);
  }
  measure();

  revealFrame = requestAnimationFrame(() => {
    started = true;
    transitionDuration.value = props.duration;
    height.value = measuredHeight;
    visibleFrame = requestAnimationFrame(() => {
      visible.value = true;
    });
  });
});

onBeforeUnmount(() => {
  observer?.disconnect();
  if (revealFrame) cancelAnimationFrame(revealFrame);
  if (visibleFrame) cancelAnimationFrame(visibleFrame);
});
</script>

<style scoped>
.component-reveal {
  overflow: clip;
  opacity: 0;
  filter: blur(var(--component-reveal-blur));
  transition:
    height var(--component-reveal-duration) cubic-bezier(0.22, 1, 0.36, 1),
    opacity var(--component-reveal-duration) ease-out,
    filter var(--component-reveal-duration) ease-out;
  will-change: height, opacity, filter;
}

.component-reveal--visible {
  filter: blur(0);
}

.component-reveal--reduced {
  overflow: visible;
  filter: none;
  transition: none;
  will-change: auto;
}

.component-reveal__content {
  display: flow-root;
}
</style>
