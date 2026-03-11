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

the LLM writes these inline with its response. during streaming, incomplete blocks show a loading state. malformed JSON gets auto-repaired where possible, with a fallback error state if it can't be fixed.

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

available themes: `rose-pine`, `rose-pine-moon`, `rose-pine-dawn`, `vitesse-dark`, `vitesse-light`, `github-dark`, `github-light`, `dracula`, `nord`, `one-dark-pro`

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
  getShikiHighlighter,
} from 'vue-llm-ui'
```

## license

MIT
