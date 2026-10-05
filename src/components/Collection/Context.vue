<template>
    <div class="_comp _item _context">
        <div v-if="isLoading" class="_skeleton">
            <div class="_headline">
                <div class="_title-skel _load-shimmer"></div>
                <div class="_acts-skel _load-shimmer"></div>
            </div>
        </div>

        <div v-else class="_content">
            <div class="_headline">
                <h2 class="_title">{{ NftName }}</h2>

                <!-- материал кнопок со страницы заданий: ._btn -->
                <div class="_acts">
                    <button
                        type="button"
                        class="_btn"
                        :aria-label="$t('collection.actions.emoji')"
                        @click="useEmoji(NftCustomEmoji)"
                    >
                        <span class="kit-icon _ico-emoji" v-html="Icon.EmojiFill"></span>
                    </button>

                    <button
                        type="button"
                        class="_btn"
                        :aria-label="$t('collection.actions.share')"
                        @click="useShareCollection()"
                    >
                        <span class="kit-icon _ico-share" v-html="Icon.ShareFill"></span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { shootConfetti } from '../../utils/useConfetti';
import { Icon } from '../Icon';

import TelegramModule from '../../hooks/useTelegram';

export default {
    props: {
        Skeleton: { type: Boolean, required: true },
        SkeletonTime: { type: Number, required: true },
        NftName: { type: String, required: true },
        NftCustomEmoji: { type: String, required: true },
    },

    data() {
        return {
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
    },

    methods: {
        async loadResources() {
            try {
                await document.fonts.ready;
                this.$emit('loadSuccess');
            } catch (error) {
                console.error('Ошибка при загрузке ресурсов:', error);
            }
        },

        useEmoji(emoji) {
            TelegramModule.useMediumHaptic();
            TelegramModule.useSetEmoji(emoji)
                .then(() => {
                    shootConfetti();
                })
                .catch(() => {});
        },

        useShareCollection() {
            TelegramModule.useSoftHaptic();
            const url = import.meta.env.VITE_APP_MINI_APP_LINK + `=cln_${this.NftName.replaceAll(' ', '')}`;
            const message = `Check out the "${this.NftName}" collection!`;
            TelegramModule.useShare(url, message);
        },
    },
};
</script>
