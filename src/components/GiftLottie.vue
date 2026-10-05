<template>
  <div
    ref="giftLottieContainer"
    class="lottie-gift"
    :style="{ width: animationWidth, height: animationHeight }"
  ></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import lottie from 'lottie-web';
import type { AnimationItem } from 'lottie-web';

const props = defineProps({
  path: {
    type: String,
    required: true,
  },
  loop: {
    type: Boolean,
    required: true,
  },
  width: {
    type: String,
    required: true,
  },
  height: {
    type: String,
    required: true,
  },
  autoplay: {
    type: Boolean,
    default: true,
    required: false,
  },
  renderer: {
    type: String,
    required: false,
  },
});

const giftLottieContainer = ref<HTMLElement | null>(null);
const animationWidth = props.width === '0' ? '100%' : props.width;
const animationHeight = props.height === '0' ? '100%' : props.height;
const rendererType = props.renderer === 'svg' ? 'svg' : 'canvas';

let animationInstance: AnimationItem | null = null;
let observer: IntersectionObserver | null = null;
let jsonCache: Record<string, any> = {};
let playTimers: ReturnType<typeof setTimeout>[] = [];

/** Resolve S3 absolute URLs via same-origin /s3 proxy in dev (CORS blocks localhost → S3). */
const resolveFetchPath = (raw: string): string => {
  if (!raw) return raw;
  const s3 = (import.meta.env.VITE_APP_S3_LINK as string) || '';
  if (s3 && raw.startsWith(s3)) {
    // https://memgift.codes/s3/models/... → /s3/models/...
    try {
      const u = new URL(raw);
      return u.pathname + u.search;
    } catch {
      return raw.replace(/^https?:\/\/[^/]+/, '');
    }
  }
  // Also rewrite bare production S3 host if env link mismatches
  if (raw.startsWith('https://memgift.codes/s3/')) {
    return raw.replace('https://memgift.codes', '');
  }
  return raw;
};

const clearPlayTimers = () => {
  playTimers.forEach((t) => clearTimeout(t));
  playTimers = [];
};

const forcePlay = () => {
  if (!animationInstance || !props.autoplay) return;
  try {
    animationInstance.show();
    animationInstance.play();
  } catch {
    /* ignore */
  }
};

const loadAnimation = async () => {
  if (!giftLottieContainer.value || !props.path) return;

  clearPlayTimers();
  if (animationInstance) {
    animationInstance.destroy();
    animationInstance = null;
  }

  const fetchPath = resolveFetchPath(props.path);

  try {
    let animationJson = jsonCache[fetchPath] || jsonCache[props.path];
    if (!animationJson) {
      const res = await fetch(fetchPath);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${fetchPath}`);
      }
      animationJson = await res.json();
      jsonCache[fetchPath] = animationJson;
    }

    // Ensure container has layout size before canvas measures it
    const el = giftLottieContainer.value;
    if (el.offsetWidth === 0 || el.offsetHeight === 0) {
      el.style.width = el.style.width || '100%';
      el.style.height = el.style.height || '100%';
    }

    animationInstance = lottie.loadAnimation({
      container: el,
      renderer: rendererType,
      loop: props.loop,
      autoplay: props.autoplay,
      animationData: animationJson,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid meet',
        clearCanvas: true,
        progressiveLoad: true,
      },
    });

    // Modals open with transform — force play after layout settles
    if (props.autoplay) {
      forcePlay();
      requestAnimationFrame(() => forcePlay());
      for (const ms of [50, 200, 350, 500]) {
        playTimers.push(setTimeout(forcePlay, ms));
      }
    }

    setupVisibilityObserver();
  } catch (error) {
    console.error('Ошибка загрузки анимации:', error, props.path);
  }
};

const setupVisibilityObserver = () => {
  if (observer) observer.disconnect();
  if (!giftLottieContainer.value || !animationInstance) return;

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (!animationInstance) return;
      if (entry.isIntersecting || entry.intersectionRatio > 0) {
        forcePlay();
      } else if (!props.autoplay) {
        // Only pause when autoplay is off (scroll lists). Autoplays (modals)
        // must keep running — IntersectionObserver is flaky with CSS transforms.
        animationInstance.pause();
      }
    },
    { threshold: [0, 0.01, 0.1, 0.25] }
  );
  observer.observe(giftLottieContainer.value);
};

onMounted(loadAnimation);

watch(() => props.path, () => {
  loadAnimation();
});

onBeforeUnmount(() => {
  clearPlayTimers();
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (animationInstance) {
    animationInstance.destroy();
    animationInstance = null;
  }
});
</script>