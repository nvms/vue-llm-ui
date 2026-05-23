export interface FadeOptions {
  // number of trailing characters covered by the opacity ramp
  size: number;
  // number of trailing characters covered by the blur ramp (<= size) - kept
  // tight so the blur hugs the frontier instead of smearing the whole ramp
  blurSize: number;
  // how far the reveal frontier sits past the end of the text (0..size)
  offset: number;
  // blur applied to the newest character, in pixels
  maxBlur: number;
}

function clamp(value: number, lo: number, hi: number): number {
  return value < lo ? lo : value > hi ? hi : value;
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

// counts visible text characters in an HTML fragment, ignoring tags. used to
// decide how far back the fade window reaches across adjacent chunks
export function measureRenderedText(html: string): number {
  if (typeof DOMParser === "undefined") return 0;
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent?.length ?? 0;
}

// wraps the last `size` rendered characters of an HTML fragment in spans with a
// left-to-right opacity ramp, so freshly revealed text fades in. operates on a
// detached document so it never touches vue's live DOM
export function applyFade(html: string, opts: FadeOptions): string {
  if (typeof DOMParser === "undefined" || opts.size <= 0) return html;
  // frontier sits at or past total + size -> nothing falls within the window,
  // skip the parse/serialize cycle entirely
  if (opts.offset >= opts.size) return html;

  const doc = new DOMParser().parseFromString(html, "text/html");
  const body = doc.body;

  const walker = doc.createTreeWalker(body, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let current: Node | null;
  while ((current = walker.nextNode())) {
    textNodes.push(current as Text);
  }

  let total = 0;
  for (const node of textNodes) total += node.data.length;
  if (total === 0) return html;

  const frontier = total + opts.offset;
  const windowStart = frontier - opts.size;

  let globalIndex = 0;
  for (const textNode of textNodes) {
    const text = textNode.data;
    const nodeEnd = globalIndex + text.length;

    // entirely settled - leave the node untouched
    if (nodeEnd <= windowStart) {
      globalIndex = nodeEnd;
      continue;
    }

    const fragment = doc.createDocumentFragment();
    let plain = "";
    const flushPlain = () => {
      if (plain) {
        fragment.appendChild(doc.createTextNode(plain));
        plain = "";
      }
    };

    for (let i = 0; i < text.length; i++) {
      const gi = globalIndex + i;
      if (gi < windowStart) {
        plain += text[i];
        continue;
      }
      flushPlain();
      const distance = frontier - gi;
      const opacity = smoothstep(clamp(distance / opts.size, 0, 1));
      const span = doc.createElement("span");
      span.textContent = text[i];
      span.style.opacity = opacity.toFixed(3);
      if (opts.blurSize > 0 && opts.maxBlur > 0) {
        const sharpness = smoothstep(clamp(distance / opts.blurSize, 0, 1));
        const blur = (1 - sharpness) * opts.maxBlur;
        if (blur > 0.05) {
          span.style.filter = `blur(${blur.toFixed(2)}px)`;
        }
      }
      fragment.appendChild(span);
    }
    flushPlain();

    textNode.parentNode?.replaceChild(fragment, textNode);
    globalIndex = nodeEnd;
  }

  return body.innerHTML;
}
