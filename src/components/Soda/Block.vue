<template>
  <div class="_direction _comp _item _block" :class="Key">
      <div v-if="isLoading" class="_skeleton">
          <div class="_image"></div>
      </div>
      <div v-else class="_content">
        <div class="task" @click="useTask">
          <div class="backdrop">
            <img :src="BluredTask" alt="">
          </div>
          <div class="content">
            <div class="title">
              <h4>{{ $t('soda.block.getTickets') }}</h4>
            </div>
            <div class="tickets">
              <img :src="Image_Ticket" alt="button" />
              <h4>{{ storeCache.UserSodaEvent.tickets || 0 }}</h4>
            </div>
          </div>
          <div class="button">
            <button v-if="!storeCache.UserSodaEvent || !storeCache?.UserSodaEvent?.mission">
              <div class="kit-icon" v-html="Icon.ChevroneRight"></div>
            </button>
            <button v-if="storeCache.UserSodaEvent && storeCache.UserSodaEvent.mission" class="done">
              <div class="kit-icon" v-html="Icon.Done"></div>
            </button>
          </div>
        </div>

        <div class="border"></div>


        <div class="gifts">
          <div 
            v-for="(item, index) in GiftsList"
            :key="item.uuid" 
            @click="openCollection(item.gift_ukey)"
            class="item"
          >
            <div v-if="item.upgraded && !item.market" class="mark">
              <p>#{{ item.upgrade.seq }}</p>
            </div>
            <div v-if="item.upgraded && item.market" class="mark">
              <img :src="StoreImg" alt="store" />
              <p>{{ $t('profile.market') }}</p>
            </div>

            <div
              v-if="item.upgraded && item.upgrade"
              class="background upg"
              :style="{
                '--center-color': item.upgrade.background_colors_center,
                '--around-color': item.upgrade.background_colors_around,
              }"
            ></div>
            <div
              v-else
              class="background no-upg"
              :class="storeCache.NftsAppData[item.gift_ukey]?.Rarity"
            ></div>

            <div v-if="item.upgraded" class="symbol upg">
              <img :src="item.upgrade.symbol_image" :alt="item.upgrade.symbol_name" />
            </div>
            <div v-else class="symbol no-upg">
              <img src="/gift_bg.png" alt="gift_bg" />
            </div>

            <div class="model">
              <div v-if="item.upgraded" class="upg">
                <div v-if="item.gift_media === 'svg'" class="image">
                  <img :src="item.upgrade.nft_image" alt="model" />
                </div>
                <div v-if="item.gift_media === 'lottie'" class="image">
                  <img :src="getUpgradedModel(item.gift_ukey, item.upgrade.nft_name, 'svg')" alt="model" />
                </div>
              </div>
              <div v-else class="no-upg">
                <div class="image">
                  <img :src="item.gift_image" alt="model" />
                </div>
              </div>
            </div>
            <div class="button">
              <button v-if="!item.market">
                <h5>{{ $t('soda.block.getTicket', { ticket: item.purchase_price }) }}</h5>
                <img :src="Image_Ticket" alt="stars" />
              </button>
              <button v-if="item.market">
                <h5>{{ cutNumber(item.market.price_ton) }}</h5>
                <img :src="TonImg" alt="svg" />
              </button>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { Icon } from '../Icon';
import { useCacheStore } from '../../stores/pinia/piniaStore';
import { checkRarity, checkRariryNumber, pluralizeGift, getUpgradedModel, getUpgradedSymbol, clearBackgroundName } from '../../utils/useGift';
import { checkRarityImage } from '../../utils/useGift';
import { getImageUrl, getUserLanguage, splitCamelCase } from '../../utils/useApp';
import { shootConfetti } from '../../utils/useConfetti';

import * as nftApi from '../../api/nftApi';

import TelegramModule from '../../hooks/useTelegram';

import Image_Ticket from '@/assets/images/soda-ticket.svg';
import HeadImage from '@/assets/images/soda/head.png';
import BluredTask from '@/assets/images/soda/blured-task.png';

export default {
  setup() {
  },

  props: {
  },

  components: {
  },

  data() {
    return {
      storeCache: useCacheStore(),

      Image_Ticket,
      HeadImage,
      BluredTask,

      checkRarity,
      checkRariryNumber,
      checkRarityImage,
      getImageUrl,
      splitCamelCase,
      pluralizeGift,
      getUpgradedModel,
      getUpgradedSymbol,
      clearBackgroundName,
      
      Icon,

      GiftsList: [
        {
          "purchase_price": 1,
          "gift_id": 26,
          "gift_name": "Soda",
          "gift_image": "https://memgift.codes/s3/soda/Soda.svg",
          "gift_ukey": "Soda",
          "gift_media": "lottie",
        },
        {
          "purchase_price": 2,
          "gift_name": "HungryDog",
          "gift_image": "https://memgift.codes/s3/soda/HungryDog.svg",
          "gift_ukey": "HungryDog",
          "gift_media": "lottie",
        },
        {
          "purchase_price": 3,
          "gift_name": "BurningPanties",
          "gift_image": "https://memgift.codes/s3/soda/BurningPanties.svg",
          "gift_ukey": "BurningPanties",
          "gift_media": "lottie",
        },
        {
          "purchase_price": 4,
          "gift_name": "HotDog",
          "gift_image": "https://memgift.codes/s3/soda/HotDog.svg",
          "gift_ukey": "HotDog",
          "gift_media": "lottie",
        },
        {
          "purchase_price": 5,
          "gift_name": "Swipee",
          "gift_image": "https://memgift.codes/s3/soda/Swipee.svg",
          "gift_ukey": "Swipee",
          "gift_media": "lottie",
        },
      ]
    };
  },

  mounted() {
  },

  computed: {
  },
  
  methods: {
    openCollection(UKey) {
      TelegramModule.useSoftHaptic();
      this.$router.push({ 
        name: 'collection', 
        params: { nft: UKey }
      });
    },

    async useTask() {
      TelegramModule.useShareStorySoda('https://memgift.codes/s3/soda/sodaluv.png');

      setTimeout(async () => {
        const res = await nftApi.sodaEventConfirm();
        if (!res) return;
        if (res) {
          this.storeCache.UserSodaEvent.mission = res.mission;
          shootConfetti();
        }
      }, 7000);
    },
  },
};
</script>

<style lang="sass" scoped>
@use "@/assets/styles/soda/_comp.sass"
</style>