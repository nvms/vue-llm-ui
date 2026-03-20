import { createHighlighter, createJavaScriptRegexEngine } from "shiki";

let highlighterInstance: any = null;
let initPromise: Promise<any> | null = null;

export async function getShikiHighlighter() {
  if (highlighterInstance) {
    return highlighterInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      highlighterInstance = await createHighlighter({
        themes: [
          "rose-pine",
          "rose-pine-moon",
          "rose-pine-dawn",
          "vitesse-dark",
          "vitesse-light",
          "github-dark",
          "github-light",
          "dracula",
          "nord",
          "one-dark-pro",
        ],
        langs: [
          "javascript",
          "typescript",
          "python",
          "json",
          "markdown",
          "html",
          "css",
          "vue",
          "bash",
          "go",
          "rust",
          "java",
          "c",
          "cpp",
          "ruby",
          "swift",
          "sql",
          "yaml",
          "toml",
          "dockerfile",
          "scss",
          "graphql",
          "lua",
          "php",
          "r",
          "elixir",
          "kotlin",
          "scala",
          "zig",
          "nix",
          "terraform",
          "prisma",
          "proto",
        ],
        engine: createJavaScriptRegexEngine(),
      });

      return highlighterInstance;
    } catch (error) {
      console.error("Shiki highlighter init failure:", error);
      return null;
    }
  })();

  return initPromise;
}

