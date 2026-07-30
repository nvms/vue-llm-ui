# vue-llm-ui

a Vue 3 component that renders streamed LLM text with embedded interactive blocks. markdown flows normally, and when the LLM emits a block like `【{type:"chart", ...}】`, it gets swapped out for a real Vue component with the parsed JSON as props.

handles partial/malformed JSON during streaming gracefully via automatic repair.

## install

```
npm install vue-llm-ui
```

## usage

```vue
<script setup>
import { ref } from 'vue'
import { LLMRenderer } from 'vue-llm-ui'
import 'vue-llm-ui/style.css'
import MyChartComponent from './components/MyChart.vue'

const streamedText = ref('')

const blocks = [
  { type: 'chart', component: MyChartComponent },
]
</script>

<template>
  <LLMRenderer :text="streamedText" :blocks="blocks" />
</template>
```

as text streams in character by character, `LLMRenderer` parses it in real time. regular text renders as markdown with syntax-highlighted code blocks (via shiki). when it encounters a block delimiter, it looks up the `type` in your registry and renders your component, passing the full parsed JSON object as a `block` prop.

## block syntax

blocks are delimited with full-width brackets:

```
【{type:"buttons", buttons:[{text:"Click me", primary:true}]}】
```

the LLM writes these inline with its response. while a block is still streaming, registered components grow in progressively as their JSON fills out; anything that hasn't matched a registered type yet stays invisible. once the closing `】` arrives, an unmatched block commits to a fallback placeholder (unknown type or parse error), which you can suppress entirely with `hideUnknownBlocks`. JSON is auto-repaired where possible.

blocks inside markdown code fences are left alone - they won't be parsed.

## writing block components

a block component receives one prop - `block` - which is the parsed JSON object:

```vue
<script setup>
const props = defineProps<{
  block: {
    type: string
    title?: string
    datasetId?: string
  }
}>()
</script>

<template>
  <div>{{ block.title }}</div>
</template>
```

## props

| prop | type | default | description |
|------|------|---------|-------------|
| `text` | `string` | required | the streamed text to render |
| `blocks` | `BlockSpec[]` | `[]` | component registry mapping types to Vue components |
| `theme` | `string` | `'rose-pine'` | shiki theme for code highlighting |
| `smooth` | `boolean \| Partial<SmoothStreamOptions>` | `false` | enable smoothed pacing and per-character fade-in. pass an object to tune (see below) |
| `hideUnknownBlocks` | `boolean` | `false` | also suppress the fallback placeholder that appears when a block commits with an unknown type or malformed data |

available themes: `rose-pine`, `rose-pine-moon`, `rose-pine-dawn`, `vitesse-dark`, `vitesse-light`, `github-dark`, `github-light`, `dracula`, `nord`, `one-dark-pro`

## smoothed streaming

LLM streams arrive in irregular bursts - tokens land in clusters at uneven intervals. set `smooth` to render text at a steady, paced rate with a per-character fade-in:

```vue
<LLMRenderer :text="streamedText" :blocks="blocks" smooth />
```

a `requestAnimationFrame` pacer drains the backlog within `settleMs`, bounding how far behind the real stream it can fall. a fast stream stays fast - it gets a brief tail, not an inflated animation. on top of the pacing, trailing characters carry an opacity ramp with a tighter blur ramp at the very frontier.

code blocks fade in too: in smooth mode, shiki output is highlighted to a string so the same per-character ramp runs through it. rendered block components reveal from zero to their natural height with matching fade and blur, and continue animating smoothly if their content changes height. with `smooth` off, code and components render without these transitions.

pass an object to tune:

| option | default | description |
|--------|---------|-------------|
| `settleMs` | `260` | time to drain the current backlog, in ms. also bounds how far behind the stream the pacer can fall |
| `settleHoldMs` | `600` | how long the source must be idle after the pacer catches up before the trail starts settling toward opaque. brief burst gaps under this threshold leave the active fade in place |
| `minCps` | `22` | floor on reveal speed in chars/sec, so the final characters always finish promptly |
| `fade` | `true` | whether trailing characters fade in |
| `fadeWindow` | `64` | width of the opacity ramp, in characters |
| `fadeBlurWindow` | `12` | width of the blur ramp, in characters (kept tighter than the opacity ramp so blur hugs the frontier) |
| `fadeBlur` | `3.5` | blur on the newest character, in pixels |

respects `prefers-reduced-motion`. `useSmoothStream` is also exported if you want to drive your own UI from a paced text ref.

## included components

the library ships with a couple of example block components you can use directly or reference when building your own:

- `ButtonsComponent` - interactive button group
- `RadioButtonsComponent` - radio button form

```js
import { ButtonsComponent, RadioButtonsComponent } from 'vue-llm-ui'
```

## exports

```js
import {
  LLMRenderer,
  MarkdownRenderer,
  GenericBlockComponent,
  ButtonsComponent,
  RadioButtonsComponent,
  useSmoothStream,
  applyFade,
  renderMarkdown,
  getShikiHighlighter,
} from 'vue-llm-ui'
```

## license

MIT
