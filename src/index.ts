export { default as LLMRenderer } from './components/LLMRenderer.vue'
export { default as MarkdownRenderer } from './components/MarkdownRenderer.vue'
export { default as GenericBlockComponent } from './components/GenericBlockComponent.vue'
export { default as ButtonsComponent } from './components/ButtonsComponent.vue'
export { default as RadioButtonsComponent } from './components/RadioButtonsComponent.vue'

export { getShikiHighlighter } from './utils/shikiPlugin'
export { renderMarkdown } from './utils/markdown'
export { applyFade, type FadeOptions } from './utils/fade'
export {
  useSmoothStream,
  type SmoothStreamOptions,
  type SmoothStream,
} from './composables/useSmoothStream'

export interface BlockSpec {
  type: string
  component: any
}

export interface RenderChunk {
  component: any
  props: Record<string, any>
}
