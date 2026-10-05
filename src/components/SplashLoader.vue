<script setup lang="ts">
import { onMounted } from 'vue';

import SplashLogo from '@/assets/images/splash-logo.svg';

const emit = defineEmits<{ (e: 'ready'): void }>();

// Ниже этого порога экран не гасим, иначе на быстрой сети он мигает
const MIN_VISIBLE_MS = 700;
// Страховка: сеть может не ответить никогда, зависать на сплэше нельзя
const HARD_TIMEOUT_MS = 12000;

// Все начертания, объявленные в fonts.css. document.fonts.ready ждёт только
// те, что уже понадобились странице, поэтому запрашиваем каждое явно.
const FONT_WEIGHTS = ['100', '300', 'normal', '500', '600', 'bold', '900'];

// Картинки, без которых первый экран выглядит недогруженным
const IMAGES = [
    SplashLogo,
    '/logotype.svg',
    '/gift_bg.png',
    new URL('../assets/images/stars.png', import.meta.url).href,
    new URL('../assets/images/ticket.svg', import.meta.url).href,
    new URL('../assets/images/market/ton.svg', import.meta.url).href,
    new URL('../assets/icons/Ticket.svg', import.meta.url).href,
];

const loadFont = (weight: string) =>
    (document.fonts?.load(`${weight} 16px SFRounded`) ?? Promise.resolve()).catch(() => {});

const loadImage = (src: string) =>
    new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = img.onerror = () => resolve();
        img.src = src;
    });

onMounted(async () => {
    const startedAt = Date.now();

    const work = Promise.all([
        ...FONT_WEIGHTS.map(loadFont),
        ...IMAGES.map(loadImage),
    ]);

    await Promise.race([
        work,
        new Promise(resolve => setTimeout(resolve, HARD_TIMEOUT_MS)),
    ]);

    // ещё и document.fonts.ready — он закрывает начертания,
    // которые подтянулись уже в вёрстке, а не в нашем списке
    await Promise.race([
        (document.fonts?.ready ?? Promise.resolve()) as Promise<unknown>,
        new Promise(resolve => setTimeout(resolve, 2000)),
    ]);

    const elapsed = Date.now() - startedAt;
    setTimeout(() => emit('ready'), Math.max(MIN_VISIBLE_MS - elapsed, 0));
});
</script>

<template>
    <div class="splash">
        <img class="splash__logo" :src="SplashLogo" alt="MemGift" />
        <span class="splash__spinner" aria-label="Loading"></span>
    </div>
</template>

<style lang="sass" scoped>
@use "@/assets/styles/_variables" as *

.splash
    position: fixed
    inset: 0
    left: 50%
    transform: translateX(-50%)
    width: 100%
    max-width: $app-max-preview-width
    height: 100%
    z-index: 9999
    background: $app-background
    overflow: hidden
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center
    gap: 44px

.splash__logo
    width: 84px
    height: auto
    display: block
    animation: splashLogoIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both

.splash__spinner
    width: 28px
    height: 28px
    flex-shrink: 0
    box-sizing: border-box
    border: 2.5px solid rgba($app-text-color, 0.12)
    border-top-color: rgba($app-text-color, 0.55)
    border-radius: 50%
    animation: splashSpin 0.7s linear infinite

@keyframes splashLogoIn
    from
        opacity: 0
        transform: scale(0.94)
    to
        opacity: 1
        transform: scale(1)

@keyframes splashSpin
    to
        transform: rotate(360deg)

@media (prefers-reduced-motion: reduce)
    .splash__logo
        animation: none

    .splash__spinner
        animation-duration: 1.6s
</style>
