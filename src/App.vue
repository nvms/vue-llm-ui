<template>
  <div class="app">
    <header class="header">
      <h1>vue-llm-ui</h1>
    </header>

    <main class="main">
      <div class="controls">
        <button @click="startDemo" :disabled="isStreaming" class="demo-button">
          {{ isStreaming ? "Streaming..." : "Start Demo" }}
        </button>
        <button @click="resetDemo" :disabled="isStreaming" class="reset-button">
          Reset
        </button>
        <div class="speed-control">
          <label>Speed: </label>
          <input
            type="range"
            v-model="streamSpeed"
            min="5"
            max="50"
            :disabled="isStreaming"
          />
          <span>{{ streamSpeed }}ms</span>
        </div>
      </div>

      <div class="renderer-container">
        <LLMRenderer :text="streamedText" :blocks="blockSpecs" theme="github-dark" />
      </div>

      <div class="debug-info" v-if="showDebug">
        <details>
          <summary>Debug Info</summary>
          <div class="debug-content">
            <div>
              <strong>Characters streamed:</strong> {{ streamedText.length }} /
              {{ fullDemoText.length }}
            </div>
            <div><strong>Is streaming:</strong> {{ isStreaming }}</div>
            <div>
              <strong>Stream speed:</strong> {{ streamSpeed }}ms per character
            </div>
            <div class="raw-text">
              <strong>Raw text:</strong>
              <pre>{{ streamedText }}</pre>
            </div>
          </div>
        </details>
      </div>
    </main>

    <footer class="footer">
      <label class="debug-toggle">
        <input type="checkbox" v-model="showDebug" />
        Show debug info
      </label>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import LLMRenderer from "./components/LLMRenderer.vue";
import ButtonsComponent from "./components/ButtonsComponent.vue";
import RadioButtonsComponent from "./components/RadioButtonsComponent.vue";

const streamedText = ref("");
const isStreaming = ref(false);
const streamSpeed = ref(0); // milliseconds per character
const showDebug = ref(false);

// Full demo text with embedded blocks
const fullDemoText = `# Welcome to the Vue LLM UI Demo! 🎉

\`\`\`javascript
// Initialize the LLM renderer
import { LLMRenderer } from 'vue-llm-ui'

// Set up your streaming text
const streamedText = ref('')
const blockSpecs = [
  {
    type: 'buttons',
    component: ButtonsComponent
  }
]

// Use in template
// <LLMRenderer :text="streamedText" :blocks="blockSpecs" />
\`\`\`

This library allows you to render **streamed LLM text** with embedded interactive UI components. Let me show you how it works:

## Basic Text Rendering

All regular text is rendered as **Markdown**, so you can use:
- *Italic text*
- **Bold text** 
- \`inline code\`
- [Links](https://vuejs.org)
- And more!

## Interactive Buttons

Here are some interactive buttons embedded in the stream:

【{
  type:"buttons",
  buttons:[
    {text:"Star ⭐",primary:true},
    {text:"Fork 🍴",secondary:true},
    {text:"Download 📥"}
  ]
}】

## Custom Components

You can also create custom block types. Here's a radio button component:

【{
  type:"radio-buttons",
  title:"What's your favorite framework?",
  defaultValue:"vue",
  options:[
    {value:"react",text:"React ⚛️"},
    {value:"vue",text:"Vue.js 💚"},
    {value:"angular",text:"Angular 🅰️"},
    {value:"svelte",text:"Svelte 🧡"}
  ]
}】

## Code Blocks with Syntax Highlighting

The library automatically handles code blocks in markdown with beautiful syntax highlighting.

**Available themes:** rose-pine, rose-pine-moon, rose-pine-dawn, vitesse-dark, vitesse-light, github-dark, github-light, dracula, nord, one-dark-pro

\`\`\`javascript
// Initialize the LLM renderer
import { LLMRenderer } from 'vue-llm-ui'

// Set up your streaming text
const streamedText = ref('')
const blockSpecs = [
  {
    type: 'buttons',
    component: ButtonsComponent
  }
]

// Use in template
// <LLMRenderer :text="streamedText" :blocks="blockSpecs" />
\`\`\`

Here's the same concept in Python for backend integration:

\`\`\`python
# Stream LLM responses with embedded UI blocks
import json
import asyncio

class LLMStreamer:
    def __init__(self):
        self.text_buffer = ""
        self.blocks = []
    
    async def stream_response(self, prompt):
        # Simulate streaming from LLM
        response = 'Here's a button: 【{\"type\":\"buttons\",\"buttons\":[{\"text\":\"Click me\"}]}】'
        
        for char in response:
            self.text_buffer += char
            yield self.text_buffer
            await asyncio.sleep(0.1)

# Usage
streamer = LLMStreamer()
async for partial_text in streamer.stream_response("Hello"):
    print(f"Streamed: {partial_text}")
\`\`\`

## Error Handling

The library gracefully handles malformed JSON. Here's an intentionally broken block:

【{type:"buttons",buttons:[{text:"Broken button"】

And here's a block with an unknown type:

【{type:"unknown-widget",data:"This will show a fallback component"}】

## Streaming Simulation

This demo simulates real-time streaming by gradually revealing the text character by character. In a real application, you'd connect this to your LLM's streaming API.

## Features

- ✅ **Real-time rendering** - Updates as text streams in
- ✅ **JSON repair** - Fixes malformed JSON automatically  
- ✅ **Extensible blocks** - Easy to add custom components
- ✅ **Graceful fallbacks** - Handles unknown/incomplete blocks
- ✅ **Markdown support** - Full markdown rendering for text
- ✅ **TypeScript ready** - Built with TypeScript

That's the demo! Try clicking the buttons above and see how the components work. 🚀`;

// Block specifications for custom components
const blockSpecs = [
  {
    type: "buttons",
    component: ButtonsComponent,
  },
  {
    type: "radio-buttons",
    component: RadioButtonsComponent,
  },
];

let streamInterval: number | null = null;

const startDemo = () => {
  if (isStreaming.value) return;

  isStreaming.value = true;
  streamedText.value = "";

  let currentIndex = 0;

  streamInterval = setInterval(() => {
    if (currentIndex < fullDemoText.length) {
      streamedText.value += fullDemoText[currentIndex];
      currentIndex++;
    } else {
      stopStreaming();
    }
  }, streamSpeed.value);
};

const stopStreaming = () => {
  if (streamInterval) {
    clearInterval(streamInterval);
    streamInterval = null;
  }
  isStreaming.value = false;
};

const resetDemo = () => {
  stopStreaming();
  streamedText.value = "";
};

// Auto-start demo on mount
onMounted(() => {
  setTimeout(() => {
    startDemo();
  }, 500);
});
</script>

<style scoped>
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.6;
}

.header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.header h1 {
  margin-bottom: 8px;
}

.header p {
  font-size: 16px;
}

.main {
  margin-bottom: 30px;
}

.controls {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  flex-wrap: wrap;
}

.demo-button,
.reset-button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.demo-button {
  background: #2196f3;
  color: white;
}

.demo-button:hover:not(:disabled) {
  background: #1976d2;
}

.demo-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.reset-button {
  background: #6c757d;
  color: white;
}

.reset-button:hover:not(:disabled) {
  background: #5a6268;
}

.reset-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.speed-control {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.speed-control input[type="range"] {
  width: 100px;
}

.renderer-container {
  min-height: 200px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: black;
}

.debug-info {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  color: black;
}

.debug-content {
  margin-top: 12px;
  font-size: 14px;
}

.debug-content > div {
  margin-bottom: 8px;
}

.raw-text {
  margin-top: 12px;
}

.raw-text pre {
  background: white;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
  font-size: 12px;
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
}

.footer {
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.debug-toggle {
  display: flex;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
}
</style>
