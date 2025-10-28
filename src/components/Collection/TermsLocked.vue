<template>
    <div class="_direction _comp _item _terms">
        <div v-if="isLoading" class="_skeleton">
        </div>
        <div v-else class="_content">
          <div class="items">

            <div v-for="(item, index) in Terms" :key="index" class="item" @click="useTerm('InviteFriends')">
              <div class="image">
                <img :src="item.image" alt="">
              </div>
              <div class="info">
                <h4>Buy {{ item.title }}</h4>
              </div>
              <div class="button">
                <button :class="{ done: item.success || !NftGetFree }">
                  <div v-if="!item.success && NftGetFree" class="kit-icon" v-html="Icon.ChevroneRight"></div>
                  <div v-if="item.success || !NftGetFree" class="kit-icon" v-html="Icon.Done"></div>
                </button>
              </div>
            </div>

            <!-- <div class="item" @click="useTerm('InviteFriends')">
              <div class="image">
                <img src="https://memgift.codes/s3/soda/HungryDog.svg" alt="">
              </div>
              <div class="info">
                <h4>Buy HungryDog</h4>
              </div>
              <div class="button">
                <button :class="{ done: Terms.ShareChats || !NftGetFree }">
                  <div v-if="!Terms.ShareChats && NftGetFree" class="kit-icon" v-html="Icon.ChevroneRight"></div>
                  <div v-if="Terms.ShareChats || !NftGetFree" class="kit-icon" v-html="Icon.Done"></div>
                </button>
              </div>
            </div>

            <div class="item" @click="useTerm('InviteFriends')">
              <div class="image">
                <img src="https://memgift.codes/s3/soda/HotDog.svg" alt="">
              </div>
              <div class="info">
                <h4>Buy HotDog</h4>
              </div>
              <div class="button">
                <button :class="{ done: Terms.ShareChats || !NftGetFree }">
                  <div v-if="!Terms.ShareChats && NftGetFree" class="kit-icon" v-html="Icon.ChevroneRight"></div>
                  <div v-if="Terms.ShareChats || !NftGetFree" class="kit-icon" v-html="Icon.Done"></div>
                </button>
              </div>
            </div>

            <div class="item" @click="useTerm('InviteFriends')">
              <div class="image">
                <img src="https://memgift.codes/s3/soda/BurningPanties.svg" alt="">
              </div>
              <div class="info">
                <h4>Buy BurningPanties</h4>
              </div>
              <div class="button">
                <button :class="{ done: Terms.ShareChats || !NftGetFree }">
                  <div v-if="!Terms.ShareChats && NftGetFree" class="kit-icon" v-html="Icon.ChevroneRight"></div>
                  <div v-if="Terms.ShareChats || !NftGetFree" class="kit-icon" v-html="Icon.Done"></div>
                </button>
              </div>
            </div> -->

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
        const task = this.storeCache.TasksApp.partners.find(t => t.id === '00580bd6-bd4b-47d4-b811-f6b657597469');
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
      
      async useTerm(type) {
        
      }
    }
  };
  </script>