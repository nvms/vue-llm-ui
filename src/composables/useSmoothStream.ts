import { ref, watch, onScopeDispose, type Ref } from "vue";

export interface SmoothStreamOptions {
  // when false the source text is mirrored through untouched
  enabled: boolean;
  // time, in ms, to drain the current backlog of unrevealed text. this also
  // bounds how far behind the real stream the pacer can fall - a fast stream
  // is never stretched into a long animation, it just gets a brief tail
  settleMs: number;
  // how long, in ms, the source must be idle after the pacer catches up before
  // the trail starts settling toward opaque. brief burst gaps under this
  // threshold leave the active fade in place so the trail does not visibly
  // cycle between tokens
  settleHoldMs: number;
  // floor on reveal speed, in characters per second, so the final handful of
  // characters always finishes promptly
  minCps: number;
  // whether revealed text fades in character by character
  fade: boolean;
  // number of trailing characters covered by the opacity ramp
  fadeWindow: number;
  // number of trailing characters covered by the blur ramp (kept tight so the
  // blur hugs the frontier rather than smearing the whole opacity ramp)
  fadeBlurWindow: number;
  // blur applied to the newest character, in pixels
  fadeBlur: number;
}

export interface SmoothStream {
  displayed: Ref<string>;
  fadeOffset: Ref<number>;
  fadeActive: Ref<boolean>;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// converts an irregularly-growing source string into a smoothly-growing
// `displayed` string. the source can arrive in bursts of any size at any
// interval - the pacer drains its backlog at an adaptive, eased rate so the
// reveal looks consistent regardless of how the underlying stream behaves.
export function useSmoothStream(
  source: Ref<string>,
  options: Ref<SmoothStreamOptions>
): SmoothStream {
  const displayed = ref(source.value);
  const fadeOffset = ref(0);
  const fadeActive = ref(false);

  // shown is fractional - the integer floor is what actually reaches the DOM
  let shown = source.value.length;
  let cps = 0;
  let postroll = 0;
  let raf = 0;
  let lastT = 0;
  let lastGrowAt = 0;
  let idleTimer = 0;

  const reduced = prefersReducedMotion();

  const clearIdle = () => {
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = 0;
    }
  };

  const stop = () => {
    clearIdle();
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  const settle = () => {
    stop();
    shown = source.value.length;
    postroll = 0;
    cps = 0;
    displayed.value = source.value;
    fadeOffset.value = 0;
    fadeActive.value = false;
  };

  const frame = (now: number) => {
    const opts = options.value;
    const dt = Math.min((now - lastT) / 1000, 0.05);
    lastT = now;
    const target = source.value.length;

    if (shown < target) {
      const remaining = target - shown;
      // aim to drain the whole backlog within settleMs - bigger backlog means
      // proportionally faster reveal. there is no speed ceiling, so a stream
      // that arrives all at once is revealed in ~settleMs rather than being
      // dragged out; the pacer only ever smooths jitter and a short tail
      const desired = Math.max(
        remaining / (opts.settleMs / 1000),
        opts.minCps
      );
      // ease the rate itself so bursts don't produce visible speed jumps
      cps += (desired - cps) * 0.12;
      shown = Math.min(target, shown + cps * dt);
      displayed.value = source.value.slice(0, Math.floor(shown));
      fadeOffset.value = 0;
      fadeActive.value = opts.fade;
      raf = requestAnimationFrame(frame);
      return;
    }

    displayed.value = source.value;

    // pacer is caught up. brief burst gaps under settleHoldMs are treated as
    // "still streaming" so the trail keeps its active fade. only after a real
    // idle period do we start settling the trail toward opaque
    const idleMs = now - lastGrowAt;
    if (idleMs < opts.settleHoldMs) {
      fadeOffset.value = 0;
      fadeActive.value = opts.fade;
      raf = 0;
      const delay = Math.max(16, opts.settleHoldMs - idleMs);
      idleTimer = window.setTimeout(() => {
        idleTimer = 0;
        lastT = performance.now();
        raf = requestAnimationFrame(frame);
      }, delay);
      return;
    }

    // truly idle - postroll advances the frontier past the text end so the
    // trailing window of characters finishes settling without a pop
    if (opts.fade && postroll < opts.fadeWindow) {
      const drainCps = opts.fadeWindow / (opts.settleMs / 1000);
      postroll = Math.min(opts.fadeWindow, postroll + drainCps * dt);
      fadeOffset.value = postroll;
      fadeActive.value = true;
      raf = requestAnimationFrame(frame);
      return;
    }

    // fully settled - park fadeOffset at fadeWindow so the live chunk stays in
    // the same per-character render path even when more content arrives later
    if (opts.fade) fadeOffset.value = opts.fadeWindow;
    raf = 0;
  };

  const start = () => {
    if (raf) return;
    lastT = performance.now();
    raf = requestAnimationFrame(frame);
  };

  watch(source, (next) => {
    if (!options.value.enabled || reduced) {
      settle();
      return;
    }
    lastGrowAt = performance.now();
    // the source diverged from what we've shown - treat it as a fresh stream
    if (!next.startsWith(displayed.value)) {
      shown = 0;
      cps = 0;
      displayed.value = "";
    }
    if (shown < next.length) {
      postroll = 0;
      clearIdle();
      start();
    }
  });

  watch(
    () => options.value.enabled,
    (enabled) => {
      if (!enabled || reduced) settle();
    }
  );

  if (!options.value.enabled || reduced) {
    settle();
  } else if (source.value) {
    // content was already present at mount - stream it in from the start
    shown = 0;
    displayed.value = "";
    lastGrowAt = performance.now();
    start();
  }

  onScopeDispose(stop);

  return { displayed, fadeOffset, fadeActive };
}
