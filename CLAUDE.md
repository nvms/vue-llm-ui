# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (runs TypeScript check then Vite build)
- `npm run preview` - Preview production build locally

## Releases

npm publishing uses GitHub Actions trusted publishing through `.github/workflows/publish.yml`; no `NPM_TOKEN` is required. To release:

1. Update the version in `package.json` and `package-lock.json`.
2. Run `npm run build` and `npm run build:lib`.
3. Commit and push the release.
4. Create and push an annotated `v<version>` tag.

Pushing the tag triggers the workflow, which builds and publishes the package to npm with the `latest` tag. The trusted publisher on npm is configured for GitHub user `nvms`, repository `vue-llm-ui`, and workflow `publish.yml`.

## Project Architecture

This is a Vue 3 + TypeScript + Vite application that provides an LLM streaming UI renderer with embedded interactive components. The core architecture consists of:

### Core Components

**LLMRenderer** (`src/components/LLMRenderer.vue`)
- Main component that parses streamed text and renders chunks
- Handles block pattern matching using `【{...}】` syntax
- Manages component registry for custom block types
- Implements JSON repair for malformed embedded data
- Distinguishes between code blocks and interactive blocks

**MarkdownRenderer** (`src/components/MarkdownRenderer.vue`)
- Renders markdown content with syntax highlighting
- Integrates with Shiki highlighter for code blocks
- Handles streaming code blocks (incomplete ```` blocks)
- Falls back to vue-markdown-render when Shiki unavailable

**Block Components**
- `ButtonsComponent.vue` - Renders interactive button blocks
- `RadioButtonsComponent.vue` - Renders radio button form blocks
- `GenericBlockComponent.vue` - Fallback for unknown/malformed blocks

### Key Technologies

- **Shiki** (`shiki-stream/vue`) - Syntax highlighting with streaming support
- **vue-markdown-render** - Markdown rendering fallback
- **jsonrepair** - Automatic JSON repair for malformed block data
- **Shiki highlighter singleton** (`src/utils/shikiPlugin.ts`) - Cached highlighter instance

### Block System

The application uses a custom block syntax: `【{type:"buttons",data:{...}}】`
- Blocks are parsed from streamed text in real-time
- Block registry maps types to Vue components
- Supports incomplete blocks during streaming
- JSON repair handles malformed streaming data
- Code blocks are excluded from block parsing

### Streaming Architecture

- Text is streamed character by character
- Components update reactively as text chunks arrive
- Incomplete blocks show loading states
- Code blocks maintain syntax highlighting during streaming
- Markdown content is rendered between blocks

## Available Themes

Shiki themes configured: rose-pine, rose-pine-moon, rose-pine-dawn, vitesse-dark, vitesse-light, github-dark, github-light, dracula, nord, one-dark-pro

## Development Notes

- The demo auto-starts on component mount with a 500ms delay
- Block parsing specifically excludes content inside markdown code blocks
- Shiki highlighter is initialized asynchronously and cached as singleton
- All components use TypeScript with proper interfaces
- Styling uses scoped CSS with dark theme support
