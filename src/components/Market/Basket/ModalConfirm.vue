<template>
  <div class="overlay" :class="{ 'is-open is-dark': ModalActive }" @click="cancel" />

  <div class="_direction _comp modal confirm" :class="[Key]">
    <!-- SKELETON -->
    <div v-if="isLoading" class="_skeleton" :class="{ hide: !ModalActive }">
      <div @click="cancel" class="close"></div>
    </div>

    <!-- CONTENT -->
    <div v-else class="_content" :class="{ hide: !ModalActive }">
      <div class="head">
        <div v-if="buyType !== 'success'" class="nothing">
          <div class="centered">
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.669 6.73583H13.3532L10.6489 2.69371C10.444 2.39344 10.0342 2.30829 9.7292 2.50996C9.42869 2.70714 9.34219 3.11046 9.54252 3.4107L11.7734 6.73583H5.22643L7.45733 3.4107C7.65766 3.11046 7.57115 2.70713 7.27065 2.50996C6.96561 2.30829 6.55585 2.39344 6.35099 2.69371L3.6466 6.73583H2.33082C1.9666 6.73583 1.67065 7.02712 1.67065 7.38562C1.67065 7.74861 1.9666 8.03988 2.33082 8.03988H2.62674L3.6466 12.5794C3.85146 13.4802 4.64821 14.1076 5.58609 14.1076H11.4138C12.3516 14.1076 13.1484 13.4802 13.3532 12.5794Л14.3731 8.03988H14.669C15.0332 8.03988 15.3292 7.74861 15.3292 7.38562C15.3292 7.02712 15.0332 6.73583 14.669 6.73583ZM6.9565 11.4591C6.9565 11.8176 6.66059 12.1089 6.29634 12.1089C5.93211 12.1089 5.6362 11.8176 5.6362 11.4591V9.38875C5.6362 9.03025 5.93211 8.73896 6.29634 8.73896C6.66059 8.73896 6.9565 9.03025 6.9565 9.38875V11.4591ZM9.16009 11.4591C9.16009 11.8176 8.86415 12.1089 8.49992 12.1089C8.1357 12.1089 7.83976 11.8176 7.83976 11.4591V9.38875C7.83976 9.03025 8.1357 8.73896 8.49992 8.73896C8.86415 8.73896 9.16009 9.03025 9.16009 9.38875V11.4591ZM11.3637 11.4591C11.3637 11.8176 11.0677 12.1089 10.7035 12.1089C10.3393 12.1089 10.0433 11.8176 10.0433 11.4591V9.38875C10.0433 9.03025 10.3393 8.73896 10.7035 8.73896C11.0677 8.73896 11.3637 9.03025 11.3637 9.38875V11.4591Z" fill="#98989D"/>
            </svg>
            <h4>{{ $t('market.basket.confirm.title') }}</h4>
          </div>
        </div>

        <div v-else class="successed">
          <div class="centered">
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.669 6.73583H13.3532L10.6489 2.69371C10.444 2.39344 10.0342 2.30829 9.7292 2.50996C9.42869 2.70714 9.34219 3.11046 9.54252 3.4107L11.7734 6.73583H5.22643L7.45733 3.4107C7.65766 3.11046 7.57115 2.70713 7.27065 2.50996C6.96561 2.30829 6.55585 2.39344 6.35099 2.69371L3.6466 6.73583H2.33082C1.9666 6.73583 1.67065 7.02712 1.67065 7.38562C1.67065 7.74861 1.9666 8.03988 2.33082 8.03988H2.62674L3.6466 12.5794C3.85146 13.4802 4.64821 14.1076 5.58609 14.1076H11.4138C12.3516 14.1076 13.1484 13.4802 13.3532 12.5794Л14.3731 8.03988H14.669C15.0332 8.03988 15.3292 7.74861 15.3292 7.38562C15.3292 7.02712 15.0332 6.73583 14.669 6.73583ZM6.9565 11.4591C6.9565 11.8176 6.66059 12.1089 6.29634 12.1089C5.93211 12.1089 5.6362 11.8176 5.6362 11.4591V9.38875C5.6362 9.03025 5.93211 8.73896 6.29634 8.73896C6.66059 8.73896 6.9565 9.03025 6.9565 9.38875V11.4591ZM9.16009 11.4591C9.16009 11.8176 8.86415 12.1089 8.49992 12.1089C8.1357 12.1089 7.83976 11.8176 7.83976 11.4591V9.38875C7.83976 9.03025 8.1357 8.73896 8.49992 8.73896C8.86415 8.73896 9.16009 9.03025 9.16009 9.38875V11.4591ZM11.3637 11.4591C11.3637 11.8176 11.0677 12.1089 10.7035 12.1089C10.3393 12.1089 10.0433 11.8176 10.0433 11.4591V9.38875C10.0433 9.03025 10.3393 8.73896 10.7035 8.73896C11.0677 8.73896 11.3637 9.03025 11.3637 9.38875V11.4591Z" fill="#98989D"/>
            </svg>
            <h4>{{ $t('market.basket.confirm.sucessfulyBought') }}</h4>
          </div>
          <div class="description">
            <p>{{ $t('market.basket.confirm.sucessfulyBoughtDescription') }}</p>
          </div>
        </div>

        <div @click="cancel" class="close">
          <div class="kit-icon" v-html="Icon.Close"></div>
        </div>
      </div>

      <div class="items">
        <div
          v-for="item in sortedSellList"
          :key="item.id"
          class="item"
        >
          <div class="nft">
            <div
              class="background upg"
              :style="{
                '--center-color': item.core.upgrade.background.colors_center,
                '--around-color': item.core.upgrade.background.colors_around,
              }"
            ></div>

            <div class="symbol upg">
              <img :src="item.core.upgrade.symbol.image" :alt="item.core.upgrade.symbol.name" />
            </div>

            <div class="model">
              <div class="upg">
                <div v-if="item.core.gift.media === 'svg'" class="image">
                  <img :src="item.core.upgrade.nft_name.image" alt="model" />
                </div>
                <div v-if="item.core.gift.media === 'lottie'" class="image">
                  <img :src="getUpgradedModel(item.core.gift.u_key, item.core.upgrade.nft_name.name, 'svg')" alt="model" />
                </div>
              </div>
            </div>
          </div>

          <div class="context">
            <div class="head">
              <h4>{{ item.core.upgrade.nft_name.name }}</h4>
              <p>#{{ item.core.upgrade.seq }}</p>
            </div>
          </div>

          <div class="price">
            <h4>{{ cutNumber(item.price_ton) }}</h4>
            <img :src="TonImg" alt="ton" />
          </div>
        </div>
      </div>

      <div class="blocker">
        <div class="summary">
          <div class="left"><h4>{{ $t('market.basket.confirm.summary') }}</h4></div>
          <div class="right">
            <h4>{{ cutNumber(summaryTon) }}</h4>
            <img :src="TonImg" alt="ton" />
          </div>
        </div>

        <div class="buttons" :class="buyType">
          <button @click="cancel"><h4>{{ $t('market.basket.confirm.buttons.cancel') }}</h4></button>
          <button @click="apply">
            <h4>{{ $t('market.basket.confirm.buttons.buy') }}</h4>
            <IOSLoader />
            <img :src="DoneImg" alt="done" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from '../../Icon';
import { useCacheStore } from '../../../stores/pinia/piniaStore';
import { shootConfetti } from '../../../utils/useConfetti';
import { getUpgradedModel } from '../../../utils/useGift';
import { cutNumber } from '../../../utils/useTon';
import { showToast } from '../../../utils/toastManager';

import * as MarketLotApi from '@/api/market/lots';

import Lottie from '../../Lottie.vue';
import IOSLoader from '../../IOSLoader.vue';

// Images
import TonImg from '@/assets/images/market/ton.svg';
import DoneImg from '@/assets/images/market/done.svg';

export default {
  name: 'ModalConfirm',
  props: {
    Skeleton: { type: Boolean, required: true },
    SkeletonTime: { type: Number, required: true },
    ModalActive: { type: Boolean, required: true },
    ModalSellList: { type: Array, required: true }, // [{ id, price_ton, ... }]
    Selected: { type: Array, required: true },      // [ids]
    Key: { type: String, default: '' },
  },
  components: { Lottie, IOSLoader },
  data() {
    return {
      TonImg,
      DoneImg,

      storeCache: useCacheStore(),
      buyType: 'notactive',   // notactive | processed | success
      Icon,
      isLoading: true,
      localSelected: [],
      getUpgradedModel,
      cutNumber,
    };
  },
  watch: {
    ModalActive(val) {
      if (val) this.localSelected = Array.isArray(this.Selected) ? [...this.Selected] : [];
    },
  },
  mounted() {
    this.loadResources();
  },
  computed: {
    isSkeleton() {
      return this.Skeleton;
    },
    // 1) только выбранные, 2) сортировка по price_ton DESC
    sortedSellList() {
      const list = Array.isArray(this.ModalSellList) ? this.ModalSellList : [];
      const selectedIds = new Set(
        (Array.isArray(this.Selected) ? this.Selected : []).map(v => String(v))
      );

      const filtered = list.filter(
        i => i && Object.prototype.hasOwnProperty.call(i, 'id') && selectedIds.has(String(i.id))
      );

      return filtered
        .slice() // не мутируем исходный массив
        .sort((a, b) => {
          const pa = Number(a?.price_ton ?? 0);
          const pb = Number(b?.price_ton ?? 0);
          return pb - pa; // DESC
        });
    },
    summaryTon() {
      return this.sortedSellList.reduce((sum, it) => sum + (Number(it?.price_ton) || 0), 0);
    },
  },
  methods: {
    async loadResources() {
      try {
        await this.loadFonts();
        this.isLoading = false;
        this.$emit('loadSuccess');
      } catch (error) {
        console.error('Ошибка при загрузке ресурсов:', error);
        this.isLoading = false;
      }
    },
    loadFonts() {
      return document?.fonts?.ready || Promise.resolve();
    },
    async apply() {
      const lots = this.ModalSellList.map(item => item.id)
      if (!lots) {
        showToast("Don't lots!", "error")
      }

      this.buyType = 'processed';

      const res = await MarketLotApi.buy(
        '',
        lots
      );
      if (!res) return;

      if (res.ok) {
        setTimeout(() => {
          shootConfetti();
          if (this.storeCache.UserData.user.Balance.balance_ton) {
            this.storeCache.UserData.user.Balance.balance_ton = res.new_balance_ton;
          };
          this.cancel();
          this.$emit('BUYED', { items: this.sortedSellList, total: this.summaryTon });
        }, 1200);
      } else {
        if (res.error === 'notfound_lots') {
          showToast(`Not found ${res.sold_ids.length} lots`, 'error');
          this.$emit('deleteLots', res.sold_ids);
        } else {
          showToast(res.error, 'error');
        }
        this.buyType = 'notactive';
      }
    },
    cancel() {
      this.$emit('closeModal');
    },
  },
};
</script>

<style lang="sass" scoped>
@use "./ModalConfirm.sass"
</style>