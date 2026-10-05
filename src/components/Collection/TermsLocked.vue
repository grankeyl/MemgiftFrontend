<template>
    <div class="_comp _item _terms _termsLocked blockTasks">
        <div v-if="isLoading" class="_skeleton">
            <div class="_section-head">
                <h4>{{ $t('collection.terms.termsTitle') }}</h4>
            </div>
            <div class="_task-list">
                <div class="_task-row" v-for="i in Math.max(items.length || 4, 3)" :key="i">
                    <div class="_task-avatar _load-shimmer"></div>
                    <div class="_task-info">
                        <div class="_title-skel _load-shimmer"></div>
                        <div class="_desc-skel _load-shimmer"></div>
                    </div>
                    <div class="_action-skel _load-shimmer"></div>
                </div>
            </div>
        </div>

        <div v-else class="_content">
            <div class="_section-head">
                <h4>
                    {{ $t('collection.terms.termsTitle') }}
                    <b>{{ doneCount }}/{{ items.length }}</b>
                </h4>
            </div>

            <div class="_task-list">
                <button
                    v-for="item in items"
                    :key="item.key"
                    type="button"
                    class="_task-row"
                    :class="{ done: item.success }"
                    :disabled="item.success"
                    @click="onRowClick(item)"
                >
                    <span class="_task-avatar _rarity" :class="giftRarity(item)">
                        <img :src="item.image" :alt="item.title" loading="lazy" />
                    </span>

                    <span class="_task-info">
                        <span class="_task-title">{{ $t('collection.lockedBuyGift', { name: item.title }) }}</span>
                        <span class="_task-desc">{{ $t('collection.lockedBuyGiftDesc') }}</span>
                    </span>

                    <span class="_task-action">
                        <span v-if="item.success" class="_btn _done">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        </span>
                        <span v-else class="_btn _start">
                            <span>{{ $t('collection.terms.go') }}</span>
                        </span>
                    </span>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { useCacheStore } from '../../stores/pinia/piniaStore';
import { Icon } from '../Icon';

import TelegramModule from '../../hooks/useTelegram';

export default {
    props: {
        Skeleton: { type: Boolean, required: true },
        SkeletonTime: { type: Number, required: true },
        NftKey: { type: String, required: true },
        NftGetFree: { type: Boolean, required: true },
        Terms: { type: Object, required: true },
    },

    data() {
        return {
            storeCache: useCacheStore(),
            isLoading: this.Skeleton,
            Icon,
        };
    },

    mounted() {
        this.loadResources();
    },

    computed: {
        isLoading() {
            return this.Skeleton;
        },
        items() {
            if (!this.Terms) return [];
            return Object.keys(this.Terms).map(key => ({
                key,
                title: this.Terms[key].title,
                image: this.Terms[key].image,
                success: this.Terms[key].success,
            }));
        },
        doneCount() {
            return this.items.filter(i => i.success).length;
        },
        allDone() {
            return this.items.length > 0 && this.doneCount === this.items.length;
        },
    },

    methods: {
        giftRarity(item) {
            const all = this.storeCache.NftsApp;
            if (!all) return '';
            const arr = Array.isArray(all) ? all : Object.values(all);
            const nft = arr.find(g => g && (g.Key === item.key || g.UKey === item.title || g.Name === item.title));
            return nft?.Rarity || '';
        },
        onRowClick(item) {
            if (!item || item.success) return;
            TelegramModule.useSoftHaptic();
            this.$router.push({ name: 'collection', params: { nft: item.title } });
        },
        async loadResources() {
            try {
                await document.fonts.ready;
                this.isLoading = false;
                this.$emit("loadSuccess");
            } catch (error) {
                console.error("Ошибка при загрузке ресурсов:", error);
            }
        },
    }
};
</script>
