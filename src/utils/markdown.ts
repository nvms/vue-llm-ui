import MarkdownIt from "markdown-it";

let instance: MarkdownIt | null = null;

function getInstance(): MarkdownIt {
  if (!instance) {
    instance = new MarkdownIt({
      html: false,
      linkify: true,
      breaks: false,
    });
  }
  return instance;
}

export function renderMarkdown(source: string): string {
  return getInstance().render(source);
}
