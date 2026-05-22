<template>
  <div class="app">
    <div class="bar">
      <button class="replay" @click="startDemo">
        <span class="replay-glyph" :class="{ spinning: isStreaming }">↻</span>
        {{ isStreaming ? "Streaming" : "Replay" }}
      </button>

      <label class="toggle">
        <input type="checkbox" v-model="smooth" />
        <span class="track"><span class="thumb" /></span>
        <span class="toggle-text">Smoothed streaming</span>
      </label>
    </div>

    <p class="hint">
      Tokens arrive in bursts at uneven intervals. With smoothing on, they are
      paced out and faded in at a steady rate - toggle it mid-replay to
      feel the difference.
    </p>

    <div class="surface">
      <LLMRenderer
        :text="streamedText"
        :blocks="blockSpecs"
        :smooth="smooth"
        theme="github-light"
      />
      <span v-if="!streamedText" class="placeholder">Waiting to stream&hellip;</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import LLMRenderer from "./components/LLMRenderer.vue";
import ButtonsComponent from "./components/ButtonsComponent.vue";
import RadioButtonsComponent from "./components/RadioButtonsComponent.vue";

const streamedText = ref("");
const isStreaming = ref(false);
const smooth = ref(true);

const fullDemoText = `Debouncing delays a function call until a set amount of time has passed without that function being called again. It is the right tool whenever a cheap event fires far more often than the work behind it should run - typing in a search field, resizing a window, or reacting to scroll.

## The core idea

Each call resets a timer. The wrapped function only runs once that timer completes without being interrupted.

\`\`\`javascript
function debounce(fn, delay) {
  let timer

  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}
\`\`\`

Wrap any function you want to rate-limit, then call the result instead of the original:

\`\`\`javascript
const onSearch = debounce((query) => {
  fetchResults(query)
}, 300)

input.addEventListener("input", (event) => {
  onSearch(event.target.value)
})
\`\`\`

## Debounce or throttle?

The two are easy to mix up:

- **Debounce** waits for a gap in activity, then runs once.
- **Throttle** runs on a fixed cadence while activity continues.

Reach for \`debounce\` when only the final state matters - the last thing the user typed. Reach for \`throttle\` when you want steady updates *during* an interaction, like a scroll indicator.

Did that make sense so far?

【{
  type:"buttons",
  buttons:[
    {text:"Yes, keep going",primary:true},
    {text:"Show another example"},
    {text:"Explain it differently"}
  ]
}】

If you want to go further, pick where to take it next:

【{
  type:"radio-buttons",
  title:"What should we cover next?",
  defaultValue:"leading",
  options:[
    {value:"leading",text:"A leading-edge variant that fires immediately"},
    {value:"cancel",text:"Adding a cancel method to stop a pending call"},
    {value:"hook",text:"Turning it into a reusable hook"}
  ]
}】

Here is the leading-edge version. It runs on the very first call, then stays quiet until activity settles down again:

\`\`\`javascript
function debounce(fn, delay, { leading = false } = {}) {
  let timer = null

  return function (...args) {
    const callNow = leading && timer === null

    clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      if (!leading) fn.apply(this, args)
    }, delay)

    if (callNow) fn.apply(this, args)
  }
}
\`\`\`

Small, composable, and easy to adapt - that is the whole pattern.

## When a block does not fit

Not every block arrives clean. When a block's type has no registered component, the renderer falls back to a readable summary instead of breaking the response:

【{type:"timeline",events:["draft","review","ship"]}】

And when a block's data is genuinely malformed, the problem is surfaced rather than silently swallowed:

【{type:"buttons" label "Retry" action retry}】`;

const blockSpecs = [
  { type: "buttons", component: ButtonsComponent },
  { type: "radio-buttons", component: RadioButtonsComponent },
];

let timer: number | null = null;
let cursor = 0;

// simulate a real LLM stream: chunks of a few characters arriving at uneven
// intervals, with the occasional longer stall
const pump = () => {
  if (cursor >= fullDemoText.length) {
    isStreaming.value = false;
    timer = null;
    return;
  }
  const chunk = 2 + Math.floor(Math.random() * 7);
  cursor = Math.min(fullDemoText.length, cursor + chunk);
  streamedText.value = fullDemoText.slice(0, cursor);

  const stall = Math.random() < 0.1 ? 160 + Math.random() * 280 : 0;
  const delay = 12 + Math.random() * 38 + stall;
  timer = window.setTimeout(pump, delay);
};

const startDemo = () => {
  if (timer) clearTimeout(timer);
  streamedText.value = "";
  cursor = 0;
  isStreaming.value = true;
  timer = window.setTimeout(pump, 80);
};

// replay whenever the toggle flips so the effect is visible immediately
watch(smooth, () => startDemo());

onMounted(() => {
  setTimeout(startDemo, 400);
});

onUnmounted(() => {
  if (timer) clearTimeout(timer);
});
</script>

<style scoped>
.app {
  max-width: 720px;
  margin: 0 auto;
  padding: 56px 24px 80px;
}

.bar {
  display: flex;
  align-items: center;
  gap: 18px;
}

.replay {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 550;
  color: #2a2a26;
  background: #fff;
  border: 1px solid #dcdcd4;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.replay:hover {
  background: #fbfbf9;
  border-color: #c4c4ba;
}

.replay-glyph {
  font-size: 14px;
  line-height: 1;
}

.replay-glyph.spinning {
  animation: spin 1.1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.toggle {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
  user-select: none;
}

.toggle input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.track {
  width: 38px;
  height: 22px;
  border-radius: 999px;
  background: #d8d8d0;
  padding: 2px;
  transition: background 0.18s ease;
}

.thumb {
  display: block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
  transition: transform 0.18s ease;
}

.toggle input:checked + .track {
  background: #1d1d1a;
}

.toggle input:checked + .track .thumb {
  transform: translateX(16px);
}

.toggle input:focus-visible + .track {
  outline: 2px solid #3056d3;
  outline-offset: 2px;
}

.toggle-text {
  font-size: 13px;
  font-weight: 550;
  color: #44443e;
}

.hint {
  margin: 14px 0 22px;
  font-size: 13px;
  line-height: 1.6;
  color: #8a8a80;
  max-width: 56ch;
}

.surface {
  position: relative;
  min-height: 240px;
  background: #fff;
  border: 1px solid #e6e6df;
  border-radius: 14px;
  padding: 30px 34px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03), 0 8px 24px rgba(0, 0, 0, 0.04);
}

.placeholder {
  color: #b5b5ab;
  font-size: 14px;
}
</style>
