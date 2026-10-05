<template>
    <div class="_comp _item _terms blockTasks">
        <div v-if="isLoading" class="_skeleton">
            <div class="_section-head">
                <h4>{{ $t('collection.terms.termsTitle') }}</h4>
            </div>
            <div class="_task-list">
                <div class="_task-row" v-for="i in defaultRowsCount" :key="i">
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
                    <b>{{ doneCount }}/{{ termsList.length }}</b>
                </h4>
            </div>

            <div class="_task-list">
                <button
                    v-for="term in termsList"
                    :key="term.type"
                    type="button"
                    class="_task-row"
                    :class="{ done: term.done }"
                    :disabled="term.done || term.loading"
                    @click="onRowClick(term)"
                >
                    <span class="_task-avatar" :class="`type-${term.type}`">
                        <img v-if="term.image" :src="term.image" :alt="term.type" />
                        <span v-else class="kit-icon" v-html="Icon[term.icon]"></span>
                    </span>

                    <span class="_task-info">
                        <span class="_task-title">{{ $t(term.titleKey) }}</span>
                        <span class="_task-desc">{{ $t(term.descKey) }}</span>
                    </span>

                    <span class="_task-action">
                        <span v-if="term.loading" class="_btn _loading">
                            <span class="_spinner"></span>
                        </span>
                        <span v-else-if="term.done" class="_btn _done">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        </span>
                        <span v-else-if="term.progress" class="_btn _count">
                            <span>{{ term.progress }}</span>
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
import { checkPriceNumber } from '../../utils/useGift';
import { unixToRelative, cleanString } from '../../utils/useApp';
import { useCacheStore } from '../../stores/pinia/piniaStore';
import { Icon } from '../Icon';

import TelegramModule from '../../hooks/useTelegram';

import * as telegramApi from '../../api/telegramApi';
import * as taskApi from '@/api/taskApi';
import * as nftApi from '@/api/nftApi';

import Image_Stars from '@/assets/images/stars.png';

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

            subscribeChannelTask: {
                isLoading: false,
            },

            isUseInterval: false,
            useCheckInterval: false,

            vpnLoading: false,
            vpnCheckInterval: null,
            vpnDone: false,
            onVisibility: null,

            cleanString,
            checkPriceNumber,
            unixToRelative,

            Icon,
            Image_Stars,
        };
    },

    mounted() {
        this.loadResources();

        // опрос в фоне только жжёт батарею и трафик
        this.onVisibility = () => {
            if (document.hidden) {
                this.stopUse();
                this.stopVpnPolling();
            } else if (this.isScooby && !this.vpnDone) {
                this.startVpnPolling();
            }
        };
        document.addEventListener('visibilitychange', this.onVisibility);

        if (this.isScooby) {
            this.startVpnPolling();
        } else {
            this.getTaskSubscribeChannel();
        }

        this.$watch(() => this.isScooby, (val) => {
            if (val && !this.vpnDone && !this.vpnCheckInterval) {
                this.startVpnPolling();
            }
        });

        this.$watch(() => this.storeCache.TasksApp, () => {
            if (!this.isScooby) this.getTaskSubscribeChannel();
        });

        this.$watch(() => this.doneSubscribeChannel, (done) => {
            if (done) this.$emit('completeTerm', 'SubscribedChannel');
        }, { immediate: true });

        this.$watch(() => this.Terms.InviteFriendsCount, () => {
            if (this.Terms.InviteFriendsCount >= this.Terms.InviteFriendsCountNeed) {
                this.$emit('completeTerm', 'InviteFriends');
            }
        });
    },

    beforeUnmount() {
        this.stopUse();
        this.stopVpnPolling();
        document.removeEventListener('visibilitychange', this.onVisibility);
    },

    computed: {
        isScooby() {
            return this.NftKey === 'nft_scooby';
        },
        isLoading() {
            return this.Skeleton;
        },
        // чистое вычисление: сообщение наверх ушло в watcher,
        // раньше $emit стоял прямо здесь и стрелял на каждом пересчёте
        doneSubscribeChannel() {
            const status = this.subscribeChannelTask?.user_status;
            return status === 'in_review' || status === 'completed';
        },
        loadingSubscribeChannel() {
            if (!this.subscribeChannelTask) return false;
            if (this.subscribeChannelTask.isLoading) return true;
            return false;
        },
        termsList() {
            if (this.isScooby) {
                return [
                    {
                        type: 'VpnSubscription',
                        icon: 'Shield',
                        image: '/scooby_vpn.png',
                        titleKey: 'collection.terms.vpnSubscription',
                        descKey: 'collection.terms.vpnSubscriptionDesc',
                        done: this.vpnDone || !this.NftGetFree,
                        loading: this.vpnLoading,
                        action: 'VpnSubscription',
                    },
                    {
                        type: 'ShareChats',
                        icon: 'ShareFill',
                        titleKey: 'collection.terms.shareChatsScooby',
                        descKey: 'collection.terms.shareChatsScoobyDesc',
                        done: this.Terms.ShareChats || !this.NftGetFree,
                        loading: false,
                        action: 'SendChats',
                    },
                ];
            }
            return [
                {
                    type: 'InviteFriends',
                    icon: 'User',
                    titleKey: 'collection.terms.inviteFriends',
                    descKey: 'collection.terms.inviteFriendsDesc',
                    done: this.Terms.InviteFriends || !this.NftGetFree,
                    loading: false,
                    // счётчик показывается вместо кнопки, пока условие не закрыто
                    progress: `${this.Terms.InviteFriendsCount || 0}/${this.Terms.InviteFriendsCountNeed || 5}`,
                    action: 'InviteFriends',
                },
                {
                    type: 'ShareChats',
                    icon: 'ShareFill',
                    titleKey: 'collection.terms.shareChats',
                    descKey: 'collection.terms.shareChatsDesc',
                    done: this.Terms.ShareChats || !this.NftGetFree,
                    loading: false,
                    action: 'SendChats',
                },
                {
                    type: 'SubscribedChannel',
                    icon: 'Love',
                    titleKey: 'collection.terms.subscribedChannel',
                    descKey: 'collection.terms.subscribedChannelDesc',
                    done: this.doneSubscribeChannel || !this.NftGetFree,
                    loading: this.loadingSubscribeChannel,
                    action: 'SubscribedChannel',
                },
            ];
        },
        doneCount() {
            return this.termsList.filter(t => t.done).length;
        },
        allDone() {
            return this.termsList.length > 0 && this.doneCount === this.termsList.length;
        },
        defaultRowsCount() {
            return this.isScooby ? 2 : 3;
        },
    },

    methods: {
        onRowClick(term) {
            if (!term || term.done || term.loading) return;
            TelegramModule.useMediumHaptic();
            this.useTerm(term.action);
        },

        async getTaskSubscribeChannel() {
            const task = this.storeCache.TasksApp.partners.find(t => t.id === '00580bd6-bd4b-47d4-b811-f6b657597469');
            this.subscribeChannelTask = { ...task, isLoading: false };
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

        startUse(Task) {
            return new Promise((resolve) => {
                // без этого повторный запуск оставлял предыдущий таймер крутиться
                this.stopUse();
                this.isUseInterval = true;
                this.useCheckInterval = setInterval(async () => {
                    Task.isLoading = true;
                    const data = await taskApi.getAll();
                    const task = data.partners.find(task => task.id === Task.id);

                    if (task && task.user_status === 'in_review') {
                        Task.user_status = task.user_status;
                        Task.isLoading = false;
                        this.stopUse();
                        resolve(true);
                        this.$emit('completeTerm', 'SubscribedChannel');
                    }
                }, 5000);
            });
        },

        stopUse() {
            if (this.useCheckInterval) clearInterval(this.useCheckInterval);
            this.isUseInterval = false;
        },

        async startVpnPolling() {
            const first = await nftApi.checkScoobyVpn();
            if (first && first.has_subscription) {
                this.vpnDone = true;
                this.$emit('completeTerm', 'VpnSubscription');
                return;
            }

            this.stopVpnPolling();
            this.vpnLoading = true;
            this.vpnCheckInterval = setInterval(async () => {
                const data = await nftApi.checkScoobyVpn();
                if (data && data.has_subscription) {
                    this.vpnLoading = false;
                    this.vpnDone = true;
                    clearInterval(this.vpnCheckInterval);
                    this.$emit('completeTerm', 'VpnSubscription');
                }
            }, 5000);
        },

        stopVpnPolling() {
            if (this.vpnCheckInterval) clearInterval(this.vpnCheckInterval);
            this.vpnLoading = false;
        },

        async useTerm(type) {
            if (!type) return;

            if (type === 'VpnSubscription') {
                TelegramModule.useLink('https://t.me/ScoobyVpnBot?start=e81566f4');
                this.startVpnPolling();
                return;
            }

            if (type === 'InviteFriends') {
                const link = import.meta.env.VITE_APP_MINI_APP_LINK + `=ref_${this.storeCache.UserData.user.Code}`;
                const preparedMessage = await telegramApi.createPrepareMessageInvite(
                    'friends',
                    this.storeCache.UserData.user.Tld,
                    link,
                    this.$i18next.language
                );
                if (!preparedMessage) return;

                TelegramModule.useShareMessage(preparedMessage.prepared_message_id)
                    .then(async () => {})
                    .catch(() => {});
            }

            if (type === 'SendChats') {
                const link = import.meta.env.VITE_APP_MINI_APP_LINK + `=ref_${this.storeCache.UserData.user.Code}`;
                const preparedMessage = await telegramApi.createPrepareMessageInvite(
                    'chats',
                    this.storeCache.UserData.user.Tld,
                    link,
                    this.$i18next.language
                );
                if (!preparedMessage) return;

                TelegramModule.useShareMessage(preparedMessage.prepared_message_id)
                    .then(async () => {
                        this.$emit('completeTerm', 'ShareChats');
                    })
                    .catch(() => {});
            }

            if (type === 'SubscribedChannel') {
                if (!this.subscribeChannelTask) return;
                TelegramModule.useLink(this.subscribeChannelTask.config.ChannelLink);
                const use = await taskApi.use(this.subscribeChannelTask.id);
                if (use) {
                    this.startUse(this.subscribeChannelTask);
                }
            }
        }
    }
};
</script>
