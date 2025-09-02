<template>
    <div class="_direction _comp _item _terms">
        <div v-if="isLoading" class="_skeleton">
        </div>
        <div v-else class="_content">
          <div class="items">

            <div class="item" @click="useTerm('InviteFriends')">
              <div class="icon">
                <Icon class="kit-icon" v-html="Icon.User"></Icon>
              </div>
              <div class="info">
                <h4>{{ $t('collection.terms.inviteFriends') }}</h4>
                <p>{{ $t('collection.terms.inviteFriendsDesc') }}</p>
              </div>
              <div class="button">
                <button :class="{ done: Terms.InviteFriends || !NftGetFree }">
                  <span v-if="!Terms.InviteFriends && NftGetFree">
                    {{ Terms.InviteFriendsCount }} / {{ Terms.InviteFriendsCountNeed }}
                  </span>
                  <div v-if="Terms.InviteFriends || !NftGetFree" class="kit-icon" v-html="Icon.Done"></div>
                </button>
              </div>
            </div>

            <div class="item" @click="useTerm('SendChats')">
              <div class="icon">
                <Icon class="kit-icon" v-html="Icon.Link"></Icon>
              </div>
              <div class="info">
                <h4>{{ $t('collection.terms.shareChats') }}</h4>
                <p>{{ $t('collection.terms.shareChatsDesc') }}</p>
              </div>
              <div class="button">
                <button :class="{ done: Terms.ShareChats || !NftGetFree }">
                  <div v-if="!Terms.ShareChats && NftGetFree" class="kit-icon" v-html="Icon.ChevroneRight"></div>
                  <div v-if="Terms.ShareChats || !NftGetFree" class="kit-icon" v-html="Icon.Done"></div>
                </button>
              </div>
            </div>

            <div class="item" @click="useTerm('SubscribedChannel')">
              <div class="icon">
                <Icon class="kit-icon" v-html="Icon.Love"></Icon>
              </div>
              <div class="info">
                <h4>{{ $t('collection.terms.subscribedChannel') }}</h4>
                <p>{{ $t('collection.terms.subscribedChannelDesc') }}</p>
              </div>
              <div class="button">
                <button :class="{ done: doneSubscribeChannel || !NftGetFree }">
                  <div v-if="!doneSubscribeChannel && NftGetFree && !loadingSubscribeChannel" class="kit-icon" v-html="Icon.ChevroneRight"></div>
                  <div v-if="(doneSubscribeChannel || !NftGetFree) && !loadingSubscribeChannel" class="kit-icon" v-html="Icon.Done"></div>
                  <div v-if="loadingSubscribeChannel" class="load-icon"></div>
                </button>
              </div>
            </div>

          </div>
        </div>
    </div>
  </template>
  
  <script>
  import { checkPriceNumber } from '../../utils/useGift';
  import { unixToRelative } from '../../utils/useApp';
  import { cleanString } from '../../utils/useApp';
  import { useCacheStore } from '../../stores/pinia/piniaStore';
  import { Icon } from '../Icon';

  import TelegramModule from '../../hooks/useTelegram';

  import * as telegramApi from '../../api/telegramApi';
  import * as historyApi from '../../api/historyApi';
  import * as taskApi from '@/api/taskApi';

  import Image_Stars from '@/assets/images/stars.png';

  export default {
    props: {
      Skeleton: {
        type: Boolean,
        required: true,
      },
      SkeletonTime: {
        type: Number,
        required: true,
      },
      NftKey: {
        type: String,
        required: true,
      },
      NftGetFree: {
        type: Boolean,
        required: true,
      },
      Terms: {
        type: Object,
        required: true,
      },
    },
  
    data() {
      return {
        storeCache: useCacheStore(),
        isLoading: this.Skeleton,

        HistoryList: {},

        isCheckSubscribeChannelInterval: false,
        checkSubscribeChannelInterval: false,

        subscribeChannelTask: {
          isLoading: false
        },

        isUseInterval: false,
        useCheckInterval: false,
        useCheckTimeout: false,

        cleanString,
        
        checkPriceNumber,
        unixToRelative,

        Icon,
        Image_Stars,
      };
    },
  
    mounted() {
      this.loadResources();
      this.getHistory(this.$props.NftKey);
      this.getTaskSubscribeChannel();

      this.$watch(() => this.$props.NftKey, () => {
        this.getHistory(this.$props.NftKey);
      });

      this.$watch(() => this.storeCache.TasksApp, () => {
        this.getTaskSubscribeChannel();
      });

      this.$watch(() => this.Terms.InviteFriendsCount, () => {
        if (this.Terms.InviteFriendsCount >= this.Terms.InviteFriendsCountNeed) {
          this.$emit('completeTerm', 'InviteFriends');
        }
      });

      if (this.TasksData) {
        this.TasksData.forEach(task => {
          if (task.user_status === 'in_progress') {
            this.startUse(task.id);
          }
        });
      }

      this.$watch(
        () => this.TasksData,
        () => {
          this.TasksData.forEach(task => {
            if (task.user_status === 'in_progress') {
              this.startUse(task);
            }
          });
        }
      );
    },

    computed: {
      isLoading() {
        return this.Skeleton;
      },
      doneSubscribeChannel() {
        if (!this.subscribeChannelTask) return false;
        if (this.subscribeChannelTask.user_status === 'in_review') {
          this.$emit('completeTerm', 'SubscribedChannel');
          return true
        };
        if (this.subscribeChannelTask.user_status === 'completed') {
          this.$emit('completeTerm', 'SubscribedChannel');
          return true
        };
        return false;
      },
      loadingSubscribeChannel() {
        if (!this.subscribeChannelTask) return false;
        if (this.subscribeChannelTask.isLoading) return true;
        return false;
      }
    },

    methods: {
      async getTaskSubscribeChannel() {
        const task = this.storeCache.TasksApp.partners[1];
        this.subscribeChannelTask = { ...task, isLoading: false };
      },

      async loadResources() {
        try {
          await Promise.all([this.loadFonts(), this.loadIcons()]);
          this.isLoading = false;
          this.$emit("loadSuccess");
        } catch (error) {
          console.error("Ошибка при загрузке ресурсов:", error);
        }
      },

      loadFonts() {
        return document.fonts.ready;
      },

      loadIcons() {
        return new Promise((resolve, reject) => {
          const div = document.createElement("div");
          div.innerHTML = this.Icon;

          const icons = div.querySelectorAll("img, svg");
          const promises = Array.from(icons).map((icon) => {
            if (icon.tagName === "IMG") {
              return new Promise((resolveImage, rejectImage) => {
                const img = new Image();
                img.src = icon.src;
                img.onload = resolveImage;
                img.onerror = rejectImage;
              });
            } else {
              return Promise.resolve();
            }
          });

          Promise.all(promises).then(resolve).catch(reject);
        });
      },

      async getHistory(nftKey) {
        if (!nftKey) return;

        const history = await historyApi.get(nftKey);
        if (!history) return;

        this.HistoryList = history;
        return this.HistoryList;
      },

      startUse(Task) {
        return new Promise((resolve) => {
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
        if (this.useCheckTimeout) clearTimeout(this.useCheckTimeout);
        this.isUseInterval = false;
      },
      
      async useTerm(type) {
        if (!type) return;
        TelegramModule.useMediumHaptic();

        if (type === 'InviteFriends') {
          const link = import.meta.env.VITE_APP_MINI_APP_LINK + `=ref_${this.storeCache.UserData.referral_code}`;
          const preparedMessage = await telegramApi.createPrepareMessageInvite(
            'friends',
            this.storeCache.UserData.user.Tld,
            link,
            this.$i18next.language
          );
          if (!preparedMessage) return;

          TelegramModule.useShareMessage(preparedMessage.prepared_message_id)
            .then(async (sharedMessage) => {
              this.$emit('completeTerm', 'InviteFriends');
            })
            .catch(() => {
            });
        }

        if (type === 'SendChats') {
          const link = import.meta.env.VITE_APP_MINI_APP_LINK + `=ref_${this.storeCache.UserData.referral_code}`;
          const preparedMessage = await telegramApi.createPrepareMessageInvite(
            'chats',
            this.storeCache.UserData.user.Tld,
            link,
            this.$i18next.language
          );
          if (!preparedMessage) return;

          TelegramModule.useShareMessage(preparedMessage.prepared_message_id)
            .then(async (sharedMessage) => {
              this.$emit('completeTerm', 'ShareChats');
            })
            .catch(() => {
            });
        }

        if (type === 'SubscribedChannel') {
          if (!this.subscribeChannelTask) return;
          // TelegramModule.useLink(this.subscribeChannelTask.config.ChannelLink);
          const use = await taskApi.use(this.subscribeChannelTask.id);
          if (use) {
            this.startUse(this.subscribeChannelTask);
          }
        }
      }
    }
  };
  </script>