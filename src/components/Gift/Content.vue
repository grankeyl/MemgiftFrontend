<template>
  <div 
    class="_direction _comp _item _pageGiftContext"
    :class="[Key]"
  >
      <div 
        v-if="isLoading" 
        class="_skeleton"
      >
        <div 
          class="_pageGiftContent" 
        >
          <div class="_pageGiftContentImage">
          </div>

          <div class="_pageGiftContentTitle">
            <h4></h4>
          </div>

          <div class="_pageGiftContentButtons">
            <button></button>
            <button></button>
          </div>
        </div>

        <div class="_pageGiftContentTable">
          <div class="_pageGiftContentTableRow">
            <div class="profile_gift_preview_table_item">
            </div>
            <div class="profile_gift_preview_table_item">
            </div>
            <div class="profile_gift_preview_table_item">
            </div>
            <div class="profile_gift_preview_table_item">
            </div>
          </div>
        </div>
      </div>
      <div 
        v-if="!isLoading" 
        class="_content"
      >
        <div 
          class="_pageGiftContent" 
          :class="NftData.NftRarity"
        >
          <div 
            v-if="NftData.upgraded" 
            class="_pageGiftContentGradient"
            :style="{
              '--center-color': NftData.BackgroundColors?.Center,
              '--around-color': NftData.BackgroundColors?.Around
            }"
          ></div>
          <div class="_symbols">
            <img :src="Image_GiftBg" :class="{ _show: !NftData.upgraded }" alt="symbols" />
            <img :src="NftData?.SymbolImage" :class="{ _show: NftData.upgraded }" alt="symbols" />
          </div>
          <div class="_pageGiftContentImage">
            <img 
              v-if="NftData.NftKey && NftData.NftMedia === 'svg'"
              :src="NftData.NftImage"
              alt="nft"
              class="modalImage"
              v-bind:class="{ _hide: NftData.upgraded }"
            />
            <GiftLottie
              v-if="NftData.NftKey && NftData.NftMedia === 'lottie'"
              v-bind:class="{ _loading: isLoadingUpgradeImage, _hide: NftData.upgraded }"
              class="_lottie"
              :path="NftData?.NftImage"
              :loop="true"
              width="25"
              height="25"
              renderer="svg"
            />
            <img 
              v-if="NftData.NftKey && NftData.NftMedia === 'svg'"
              v-bind:class="{ _loading: isLoadingUpgradeImage, _show: NftData.upgraded }"
              :src="NftData?.ModelImage"
              alt="nft"
              class="upgradedImage"
            />
            <GiftLottie
              v-if="NftData.NftKey && NftData.NftMedia === 'lottie'"
              v-bind:class="{ _loading: isLoadingUpgradeImage, _show: NftData.upgraded }"
              class="_lottie upgraded"
              :path="NftData?.ModelImage"
              :loop="true"
              width="25"
              height="25"
              renderer="svg"
            />
          </div>

          <div 
            v-if="NftData.upgraded"
            class="_number"
          >
            <span>#{{ NftData?.ModelNumber }}</span>
          </div>

          <div class="_pageGiftContentTitle">
            <h4 v-if="!NftData.upgraded">{{ NftData.NftName }}</h4>
            <h4 v-if="NftData.upgraded">{{ NftData?.ModelName }}</h4>
          </div>

          <div class="_pageGiftContentButtons">
            <button @click="shareGiftLink">
              <Icon class="kit-icon" v-html="Icon.Link"></Icon>
              <span>
                {{ $t('profile.profileShare') }}
              </span>
            </button>
            <button @click="openProfile">
              <Icon class="kit-icon" v-html="Icon.Profile"></Icon>
              <span>
                {{ $t('profile.profileProfile') }}
              </span>
            </button>
          </div>
        </div>

        <div class="_pageGiftContentTable" :class="{ _show: !NftData.upgraded }">
          <div class="_pageGiftContentTableRow">
            <div class="profile_gift_preview_table_item">
              <div class="profile_gift_preview_table_item_left">
                <h4>{{ $t('profile.profileGiftPreviewTableItem1') }}</h4>
              </div>
              <div class="profile_gift_preview_table_item_right">
                <span>{{ Table?.OwnerName }}</span>
                <div
                  v-if="Table?.OwnerAvatar"
                  class="avatar_null"
                >
                  <img 
                    @load="Table.OwnerAvatarLoading = false"
                    @error="OwnerImage = false"
                    :src="Table?.OwnerAvatar"
                    alt="avatar" 
                  />
                </div>
                <div v-else class="avatar_null">
                  <h4 v-if="Table.OwnerName">{{ Table.OwnerName[0] }}</h4>
                </div>
              </div>
            </div>
            <div class="profile_gift_preview_table_item">
              <div class="profile_gift_preview_table_item_left">
                <h4>{{ $t('profile.profileGiftPreviewTableItem2') }}</h4>
              </div>
              <div class="profile_gift_preview_table_item_right">
                <p>{{ Table?.NftDate }}</p>
              </div>
            </div>
            <div class="profile_gift_preview_table_item">
              <div class="profile_gift_preview_table_item_left">
                <h4>{{ $t('profile.profileGiftPreviewTableItem3') }}</h4>
              </div>
              <div class="profile_gift_preview_table_item_right">
                <p>{{ Table?.NftPrice }}</p>
                <img loading="lazy" class="_stars" :src="Image_Stars" alt="avatar" />
              </div>
            </div>
            <div class="profile_gift_preview_table_item">
              <div class="profile_gift_preview_table_item_left last">
                <h4>{{ $t('profile.profileGiftPreviewTableItem4') }}</h4>
              </div>
              <div class="profile_gift_preview_table_item_right last">
                <p>{{ Table?.NftSupply }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="_pageGiftContentTable" :class="{ _show: NftData.upgraded }">
          <div class="_pageGiftContentTableRow">
            <div class="profile_gift_preview_table_item">
              <div class="profile_gift_preview_table_item_left">
                <h4>{{ $t('profile.profileGiftPreviewTableItem1') }}</h4>
              </div>
              <div v-if="Table.OwnerName" class="profile_gift_preview_table_item_right">
                <span>{{ Table.OwnerName }}</span>
                <div
                  v-if="Table.OwnerAvatar && OwnerImage"
                  class="avatar_null"
                >
                  <img 
                    @load="Table.OwnerAvatarLoading = false"
                    @error="OwnerImage = false"
                    :src="Table.OwnerAvatar"
                    alt="avatar" 
                  />
                </div>
                <div v-else class="avatar_null">
                  <h4>{{ Table.OwnerName[0] }}</h4>
                </div>
              </div>
            </div>
            <div class="profile_gift_preview_table_item">
              <div class="profile_gift_preview_table_item_left">
                <h4>Модель</h4>
              </div>
              <div class="profile_gift_preview_table_item_right">
                <p>{{ NftData?.ModelName }}</p>
                <span>{{ NftData?.ModelDropRate }}%</span>
              </div>
            </div>
            <div class="profile_gift_preview_table_item">
              <div class="profile_gift_preview_table_item_left">
                <h4>Символ</h4>
              </div>
              <div class="profile_gift_preview_table_item_right">
                <p>{{ NftData?.SymbolName }}</p>
                <span>{{ NftData?.SymbolDropRate }}%</span>
              </div>
            </div>
            <div class="profile_gift_preview_table_item">
              <div class="profile_gift_preview_table_item_left">
                <h4>Фон</h4>
              </div>
              <div class="profile_gift_preview_table_item_right">
                <p>{{ NftData?.BackgroundName }}</p>
                <span>{{ NftData?.BackgroundDropRate }}%</span>
              </div>
            </div>
            <div class="profile_gift_preview_table_item">
              <div class="profile_gift_preview_table_item_left last">
                <h4>{{ $t('profile.profileGiftPreviewTableItem4') }}</h4>
              </div>
              <div class="profile_gift_preview_table_item_right last">
                <p>{{ Table.NftSupply }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>
  
  <script>
  import { checkPriceNumber, clearBackgroundName } from '../../utils/useGift';
  import { cleanString } from '../../utils/useApp';
  import { Icon } from '../Icon';
  import { getImageUrl, unixToRelative } from '../../utils/useApp';
  import { useCacheStore } from '../../stores/pinia/piniaStore';

  import TelegramModule from '../../hooks/useTelegram';

  import GiftLottie from '../GiftLottie.vue';

  import Image_Stars from '@/assets/images/stars.png';
  import Image_GiftBg from '@/assets/gifts/png/gift_bg.png';

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
      NftData: {
        type: Object,
        required: true,
      },
      Table: {
        type: Object,
        required: true,
      },
    },

    components: {
      GiftLottie,
    },

    data() {
      return {
        storeCache: useCacheStore(),

        isLoading: this.Skeleton,

        cleanString,
        
        checkPriceNumber,
        unixToRelative,
        getImageUrl,

        Icon,
        Image_Stars,
        Image_GiftBg,
      };
    },

    computed: {
      isLoading() {
        return this.Skeleton;
      },
    },
  
    mounted() {
      this.loadResources();
    },

    methods: {
      async loadResources() {
        try {
          await Promise.all([this.loadFonts(), this.loadIcons()]);
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

      shareGiftLink() {
        const url = import.meta.env.VITE_APP_MINI_APP_LINK + `=gift_${this.NftData.id}`;
        const message = `I recommend checking out "${this.NftData.NftName}" NFT.`;
        TelegramModule.useShare(url, message);
      },

      openProfile() {
        this.$router.push({
          name: 'view',
          params: { id: this.NftData.user_id },
          query: {
            type: 'giftPage',
            key: this.NftData.id,
          },
        });
      },
    }
  };
  </script>