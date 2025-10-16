<template>
  <div 
    class="_direction _comp _item _profileGiftModal"
    :class="[Key]"
  >
      <div 
        v-if="isLoading" 
        class="_skeleton"
        :class="{ hide: !ModalActive }"
        @touchstart.passive="onTouchStart($event, 'skeleton')"
        @touchmove.prevent="onTouchMove"
        @touchend="onTouchEnd"
        :style="sheetStyleSkeleton"
      >
        <div @click="closeModal" class="_profileGiftModalClose"></div>
        <div class="_profileGiftModalContent">
          <div class="_profileGiftModalContentImage"></div>
          <div class="_profileGiftModalContentTitle"></div>
        </div>
        <div class="_profileGiftModalTable">
          <div class="_profileGiftModalTableRow"></div>
        </div>
        <div class="_profileGiftModalButtons">
          <div class="_profileGiftModalButtonsCollectable"></div>
          <div class="_profileGiftModalButtonsSend"></div>
        </div>
      </div>
      <div 
        v-if="!isLoading" 
        class="_content"
        :class="{ hide: !ModalActive }"
        @touchstart.passive="onTouchStart($event, 'content')"
        @touchmove.prevent="onTouchMove"
        @touchend="onTouchEnd"
        :style="sheetStyleContent"
      >
        <div @click="closeModal" class="_profileGiftModalClose">
          <div class="kit-icon" v-html="Icon.Close"></div>
        </div>
        <div 
          class="_profileGiftModalContent" 
          :class="ModalComp.NftRarity"
        >
          <div 
            v-if="isUpgraded" 
            class="_profileGiftModalGradient"
            :style="{
              '--center-color': UpgradedNft?.BackgroundColors?.Center,
              '--around-color': UpgradedNft?.BackgroundColors?.Around
            }"
          ></div>
          <div class="_symbols">
            <img :src="Image_GiftBg" :class="{ _show: !isUpgraded }" alt="rarity" />
             <img :src="UpgradedNft?.SymbolImage" :class="{ _show: isUpgraded }" alt="rarity" />
          </div>
          <div class="_profileGiftModalContentImage">
            <img 
              v-if="ModalComp.NftKey && ModalComp.NftMedia === 'svg'"
              :src="ModalComp.NftImage"
              alt="nft"
              class="modalImage"
              v-bind:class="{ _hide: isUpgraded }"
            />
            <GiftLottie
              v-if="ModalComp.NftKey && ModalComp.NftMedia === 'lottie'"
              v-bind:class="{ _loading: isLoadingUpgradeImage, _hide: isUpgraded }"
              class="_lottie"
              :path="`/gifts/lottie/${ModalComp.NftKey}.json`"
              :loop="true"
              width="25"
              height="25"
              renderer="svg"
            />
            <img 
              v-if="ModalComp.NftKey && ModalComp.NftMedia === 'svg'"
              v-bind:class="{ _loading: isLoadingUpgradeImage, _show: isUpgraded }"
              :src="UpgradedNft?.ModelImage"
              alt="nft"
              class="upgradedImage"
            />
            <GiftLottie
              v-if="ModalComp.NftKey && ModalComp.NftMedia === 'lottie'"
              v-bind:class="{ _loading: isLoadingUpgradeImage, _show: isUpgraded }"
              class="_lottie upgraded"
              :path="UpgradedNft?.ModelImage"
              :loop="true"
              width="25"
              height="25"
              renderer="svg"
            />
          </div>

          <div class="_profileGiftModalContentTitle">
            <h4 v-if="!isUpgraded">{{ ModalComp.NftName }}</h4>
            <h4 v-if="isUpgraded">{{ UpgradedNft?.ModelName }}</h4>
          </div>

          <div v-if="isUpgraded" class="_profileGiftModalContentNumber">
            <h4>#{{ UpgradedNft?.ModelNumber }}</h4>
          </div>

          <div class="_profileGiftModalContentButtons">
            <button 
              v-if="ModalComp.NftStatus === 'received' && !ModalComp.NftUpgraded" 
              @click="upgradeNft(ModalComp.NftId)"
              :disabled="!ModalComp.NftUpgradeSupport"
            >
              <img src="/upgrade.svg" alt="upgrade" />
              <span>
                {{ $t('profile.profileMint') }}
              </span>
            </button>
            <button v-if="ModalComp.NftStatus !== 'received'" @click="transferNft">
              <img src="/move.svg" alt="move" />
              <span>
                {{ $t('profile.profileTransfer') }}
              </span>
            </button>
            <button v-if="isUpgraded && !ModalComp.Market.MarketOn" @click="sellGift">
              <img :src="MarketImg" alt="market" />
              <span>
                {{ $t('profile.profileSell') }}
              </span>
            </button>
            <button @click="shareGiftLink">
              <img src="/forward.svg" alt="forward" />
              <span>
                {{ $t('profile.profileShare') }}
              </span>
            </button>
            <button @click="copyGiftLink">
              <img src="/copy.svg" alt="market" />
              <span>
                {{ $t('profile.profileLink') }}
              </span>
            </button>
          </div>
        </div>
        <div class="_profileGiftModalTable" :class="{ _show: !isUpgraded }">
          <div class="_profileGiftModalTableRow">
            <div class="profile_gift_preview_table_item">
              <div class="profile_gift_preview_table_item_left">
                <h4>{{ $t('profile.profileGiftPreviewTableItem1') }}</h4>
              </div>
              <div class="profile_gift_preview_table_item_right">
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
                <span>{{ Table.OwnerName }}</span>
              </div>
            </div>
            <div v-if="Table.NftOldOwner.user_full_name" class="profile_gift_preview_table_item">
              <div class="profile_gift_preview_table_item_left">
                <h4>{{ $t('profile.profileGiftPreviewTableItem0') }}</h4>
              </div>
              <div class="profile_gift_preview_table_item_right">
                <span>{{ Table.NftOldOwner.user_full_name }}</span>
                <div
                  v-if="Table.NftOldOwner.user_photo && OwnerImage"
                  class="avatar_null"
                >
                  <img 
                    @load="Table.OwnerAvatarLoading = false"
                    @error="OwnerImage = false"
                    :src="Table.NftOldOwner.user_photo"
                    alt="avatar" 
                  />
                </div>
                <div v-else class="avatar_null">
                  <h4>{{ Table.NftOldOwner.user_full_name[0] }}</h4>
                </div>
              </div>
            </div>
            <div class="profile_gift_preview_table_item">
              <div class="profile_gift_preview_table_item_left">
                <h4>{{ $t('profile.profileGiftPreviewTableItem2') }}</h4>
              </div>
              <div class="profile_gift_preview_table_item_right">
                <p>{{ Table.NftDate }}</p>
              </div>
            </div>
            <div class="profile_gift_preview_table_item">
              <div class="profile_gift_preview_table_item_left">
                <h4>{{ $t('profile.profileGiftPreviewTableItem3') }}</h4>
              </div>
              <div class="profile_gift_preview_table_item_right">
                <p>{{ Table.NftPrice }}</p>
                <img loading="lazy" class="_stars" :src="Image_Stars" alt="avatar" />
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
        <div class="_profileGiftModalTable" :class="{ _show: isUpgraded }">
          <div class="_profileGiftModalTableRow">
            <div class="profile_gift_preview_table_item">
              <div class="profile_gift_preview_table_item_left">
                <h4>{{ $t('profile.profileGiftPreviewTableItem1') }}</h4>
              </div>
              <div class="profile_gift_preview_table_item_right">
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
                <h4>{{ $t('profile.profileGiftPreviewTableMintedItem1') }}</h4>
              </div>
              <div class="profile_gift_preview_table_item_right">
                <p>{{ UpgradedNft?.ModelName }}</p>
                <span>{{ UpgradedNft?.ModelDropRate }}%</span>
              </div>
            </div>
            <div class="profile_gift_preview_table_item">
              <div class="profile_gift_preview_table_item_left">
                <h4>{{ $t('profile.profileGiftPreviewTableMintedItem2') }}</h4>
              </div>
              <div class="profile_gift_preview_table_item_right">
                <p>{{ UpgradedNft?.SymbolName }}</p>
                <span>{{ UpgradedNft?.SymbolDropRate }}%</span>
              </div>
            </div>
            <div class="profile_gift_preview_table_item">
              <div class="profile_gift_preview_table_item_left">
                <h4>{{ $t('profile.profileGiftPreviewTableMintedItem3') }}</h4>
              </div>
              <div class="profile_gift_preview_table_item_right">
                <p>{{ UpgradedNft?.BackgroundName }}</p>
                <span>{{ UpgradedNft?.BackgroundDropRate }}%</span>
              </div>
            </div>
            <div v-if="ModalComp.Market.MarketOn" class="profile_gift_preview_table_item">
              <div class="profile_gift_preview_table_item_left">
                <div class="marker">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.9389 5.335L14.0091 2.96973C13.8712 2.61904 13.8023 2.44367 13.6912 2.31496C13.5931 2.20119 13.4719 2.11406 13.3373 2.06055C13.1851 2 13.0101 2 12.6601 2H6.33999C5.98999 2 5.81499 2 5.66273 2.06055C5.52816 2.11406 5.40695 2.20119 5.30882 2.31496C5.19779 2.44368 5.12886 2.61903 4.99099 2.96973L4.06114 5.335H14.9389Z" fill="#6691FF"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M4.91357 8.26029C5.16377 8.36037 5.43412 8.415 5.71619 8.415C6.18083 8.415 6.61405 8.26632 6.97747 8.01087C7.34089 8.26632 7.77411 8.415 8.23875 8.415C8.70339 8.415 9.13661 8.26632 9.50003 8.01087C9.86345 8.26632 10.2967 8.415 10.7613 8.415C11.2259 8.415 11.6592 8.26632 12.0226 8.01087C12.386 8.26632 12.8192 8.415 13.2839 8.415C13.5659 8.415 13.8363 8.36037 14.0865 8.26029V11.4C14.0865 11.9601 14.0865 12.2401 13.9865 12.454C13.8986 12.6422 13.7583 12.7951 13.5857 12.891C13.3894 13 13.1326 13 12.6188 13H6.38124C5.8675 13 5.61064 13 5.41442 12.891C5.24182 12.7951 5.10149 12.6422 5.01354 12.454C4.91357 12.2401 4.91357 11.9601 4.91357 11.4V8.26029ZM5.83084 10.3C5.83084 10.02 5.83084 9.87996 5.88083 9.773C5.9248 9.67892 5.99496 9.60243 6.08126 9.5545C6.17937 9.5 6.3078 9.5 6.56467 9.5H8.30753C8.5644 9.5 8.69283 9.5 8.79094 9.5545C8.87724 9.60243 8.9474 9.67892 8.99137 9.773C9.04136 9.87996 9.04136 10.02 9.04136 10.3V11.2C9.04136 11.48 9.04136 11.62 8.99137 11.727C8.9474 11.8211 8.87724 11.8976 8.79094 11.9455C8.69283 12 8.5644 12 8.30753 12H6.56467C6.3078 12 6.17937 12 6.08126 11.9455C5.99496 11.8976 5.9248 11.8211 5.88083 11.727C5.83084 11.62 5.83084 11.48 5.83084 11.2V10.3Z" fill="#6691FF"/>
                    <path d="M5.71616 7.75C4.80481 7.75 4.059 6.97725 4 6H15C14.941 6.97725 14.1952 7.75 13.2838 7.75C12.7855 7.75 12.3367 7.51896 12.0226 7.14977C11.7084 7.51896 11.2596 7.75 10.7613 7.75C10.2629 7.75 9.81412 7.51896 9.5 7.14977C9.18589 7.51896 8.73705 7.75 8.23872 7.75C7.74039 7.75 7.29156 7.51896 6.97744 7.14977C6.66333 7.51896 6.2145 7.75 5.71616 7.75Z" fill="#6691FF"/>
                  </svg>
                  <p>{{ $t('profile.market') }}</p>
                  <Icon class="kit-icon" v-html="Icon.ChevroneRight"></Icon>
                </div>
              </div>
              <div class="profile_gift_preview_table_item_right">
                <p>{{ $t('profile.sellFor') }} {{ cutNumber(ModalComp.Market.TonPrice) }}</p>
                <img :src="TonImg" alt="ton" />
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

        <div v-if="ModalComp.NftStatus === 'received'" class="_profileGiftModalButtons">
          <div @click="closeModal()" class="_profileGiftModalButtonsClose">
            <button :class="{ _loading: ActiveButton }">
              <h4>{{ $t('profile.profileGiftButtonOk') }}</h4>
              <Lottie 
                class="lt" 
                slug="loading-spin" 
                :loop="true"
                width="75"
                height="75"
                renderer="svg"
              />
            </button>
          </div>
          <div v-if="!ModalComp.Market.MarketOn" @click="useTransferModal" class="_profileGiftModalButtonsSend">
            <button :class="{ _loading: ActiveButton }">
              <div class="kit-icon" v-html="Icon.Gift"></div>
              <h4>{{ $t('profile.profileGiftPreviewButtonSend') }}</h4>
              <Lottie 
                class="lt" 
                slug="loading-spin" 
                :loop="true"
                width="75"
                height="75"
                renderer="svg"
              />
            </button>
          </div>
          <div v-if="ModalComp.Market.MarketOn" class="_profileGiftModalButtonsSend remove">
            <button :class="{ _loading: ActiveButton }" @click="removeGiftLot">
              <div class="kit-icon" v-html="Icon.Close"></div>
              <h4>{{ $t('profile.removeListing') }}</h4>
              <Lottie 
                class="lt" 
                slug="loading-spin" 
                :loop="true"
                width="75"
                height="75"
                renderer="svg"
              />
            </button>
          </div>
        </div>
        <div v-if="['sended', 'purchased'].includes(ModalComp.NftStatus)" class="_profileGiftModalButtons">
          <div @click="closeModal()" class="_profileGiftModalButtonsClose">
            <button :class="{ _loading: ActiveButton }">
              <h4>{{ $t('profile.profileGiftButtonOk') }}</h4>
              <Lottie 
                class="lt" 
                slug="loading-spin" 
                :loop="true"
                width="75"
                height="75"
                renderer="svg"
              />
            </button>
          </div>
          <div @click="sendNft" class="_profileGiftModalButtonsSend">
            <button :class="{ _loading: ActiveButton }">
              <h4>{{ $t('profile.profileGiftPreviewButtonSend') }}</h4>
              <Lottie 
                class="lt" 
                slug="loading-spin" 
                :loop="true"
                width="75"
                height="75"
                renderer="svg"
              />
              <div class="tickets">
                <p>+{{ storeCache.NftsAppData[ModalComp.NftUniqueKey]?.Tickets }}</p>
                <img src="/profile/ticket.svg" alt="tickets" />
              </div>
            </button>
          </div>
        </div>
      </div>
  </div>
  
  <div 
    class="_direction _comp _item _profileGiftModal _modalTransfer"
    :class="[Key]"
  >
      <div 
        v-if="isLoading" 
        class="_skeleton"
        :class="{ hide: !ModalTransferActive }"
      >
        <div @click="closeModal" class="_profileGiftModalClose"></div>
        <div class="_profileGiftModalContent">
          <div class="_profileGiftModalContentImage"></div>
          <div class="_profileGiftModalContentTitle"></div>
        </div>
        <div class="_profileGiftModalTable">
          <div class="_profileGiftModalTableRow"></div>
        </div>
        <div class="_profileGiftModalButtons">
          <div class="_profileGiftModalButtonsCollectable"></div>
          <div class="_profileGiftModalButtonsSend"></div>
        </div>
      </div>
      <div 
        v-if="!isLoading"
        class="_content"
        :class="{ hide: !ModalTransferActive }"
      >
        <div @click="closeTransferModal" class="_profileGiftModalClose">
          <div class="kit-icon" v-html="Icon.Close"></div>
        </div>
        <div 
          class="_profileGiftModalContent" 
          :class="ModalComp.NftRarity"
        >
          <div 
            v-if="isUpgraded" 
            class="_profileGiftModalGradient"
            :style="{
              '--center-color': UpgradedNft?.BackgroundColors?.Center,
              '--around-color': UpgradedNft?.BackgroundColors?.Around
            }"
          ></div>
          <div class="_symbols">
            <img :src="Image_GiftBg" :class="{ _show: !isUpgraded }" alt="rarity" />
             <img :src="UpgradedNft?.SymbolImage" :class="{ _show: isUpgraded }" alt="rarity" />
          </div>
          <div 
            v-if="isUpgraded"
            class="_number"
          >
            <span>#{{ UpgradedNft?.ModelNumber }}</span>
          </div>
          <div class="_profileGiftModalContentImage">
            <img 
              v-if="ModalComp.NftKey && ModalComp.NftMedia === 'svg'"
              :src="ModalComp.NftImage"
              alt="nft"
              class="modalImage"
              v-bind:class="{ _hide: isUpgraded }"
            />
            <GiftLottie
              v-if="ModalComp.NftKey && ModalComp.NftMedia === 'lottie'"
              v-bind:class="{ _hide: isUpgraded }"
              class="_lottie"
              :path="`/gifts/lottie/${ModalComp.NftKey}.json`"
              :loop="true"
              width="25"
              height="25"
              renderer="svg"
            />
            <img 
              v-if="ModalComp.NftKey && ModalComp.NftMedia === 'svg'"
              v-bind:class="{ _loading: isLoadingUpgradeImage, _show: isUpgraded }"
              :src="UpgradedNft?.ModelImage"
              alt="nft"
              class="upgradedImage"
            />
            <GiftLottie
              v-if="ModalComp.NftKey && ModalComp.NftMedia === 'lottie'"
              v-bind:class="{ _loading: isLoadingUpgradeImage, _show: isUpgraded }"
              class="_lottie upgraded"
              :path="UpgradedNft?.ModelImage"
              :loop="true"
              width="25"
              height="25"
              renderer="svg"
            />
          </div>
          <div class="_profileGiftModalContentTitle">
            <h4 v-if="!isUpgraded">{{ ModalComp.NftName }}</h4>
            <h4 v-if="isUpgraded">{{ UpgradedNft?.ModelName }}</h4>
          </div>
        </div>
        <div class="_profileGiftModalSearch">
          <div class="_profileGiftModalSearchFlexed">
            <label>{{ $t('profile.profileTransferLabel') }}</label>
            <p></p>
          </div>
          <div class="_profileGiftModalSections">
            <div 
              v-for="section in transferSections.items" 
              @click="setActiveTransferTab(section.value)"
              class="_profileGiftModalSection" 
              :class="{ active: transferSections.active.value === section.value }"
            >
              <h4>{{ section.label }}</h4>
            </div>
          </div>

          <div v-if="transferYourselfError" class="error">
            <p>{{ $t('profile.profileGiftModalTransferError') }}</p>
          </div>

          <div class="_profileGiftModalButtonsInput">
            <div v-if="isTransferInputSuccess" class="_profileGiftModalButtonsInputContent">
              
              <img 
                v-if="transferData.avatar && !showDefaultAvatar" 
                :src="transferData.avatar" 
                alt="avatar"
                @error="showDefaultAvatar = true"
              />
              <div v-else class="avatar_null">
                <h4 v-if="transferData.name">{{ transferData.name[0] }}</h4>
              </div>
              
              <h4>{{ transferData.name }}</h4>
              <div @click="closeTransferData" class="kit-icon" v-html="Icon.Close"></div>
            </div>

            <input 
              ref="transferInput"
              :class="{ noPlaceholder: isTransferInputSuccess }"
              type="text"
              :placeholder="$t('profile.profileTransferInputPlaceholder') + ' ' + transferSections.active.label"
              @input="keyTransferInput"
              @blur="blurTransferInput"
              @keyup.enter="blurTransferInput"
            />
          </div>

          <div class="_profileGiftModalUsers">
            <div 
              v-for="user in transferUsers" 
              @click="selectTransferUser(user)"
              class="_profileGiftModalUser" 
              :class="{ active: transferUserSelected === user.user_id }"
            >
              <img :src="user.user_photo" alt="avatar" />
              <h4>{{ user.name }}</h4>
            </div>
          </div>

        </div>
        <div class="_profileGiftModalButtons">
          <div @click="transferGift()" class="_profileGiftModalButtonsSend">
            <button :class="{ _loading: ActiveButton }" :disabled="!transferData.success">
              <h4>{{ $t('profile.profileGiftPreviewButtonSendFor') }}</h4>
              <div class="stars">
                <img :src="Image_StarsWhite" alt="avatar" />
                <span v-if="ModalComp.NftStatus === 'received'">25</span>
                <span v-else>0</span>
              </div>
              <Lottie 
                class="lt"
                slug="loading-spin" 
                :loop="true"
                width="75"
                height="75"
                renderer="svg"
              />
            </button>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
import * as nftApi from '../../api/nftApi';
import * as telegramApi from '../../api/telegramApi';
import * as invoiceApi from '../../api/invoiceApi';
import * as userApi from '../../api/userApi';

import * as MarketLotsApi from '../../api/market/lots';

import { Icon } from '../Icon';
import { useCacheStore } from '../../stores/pinia/piniaStore';
import { fireFromBottom, shootConfetti } from '../../utils/useConfetti';
import { getUpgradedModel, getUpgradedSymbol } from '../../utils/useGift';
import { showToast } from '../../utils/toastManager';
import { copyToClipboard } from '../../utils/copyToClipboard';
import { cutNumber } from '../../utils/useTon';

import TelegramModule from '../../hooks/useTelegram';

import Image_Stars from '@/assets/images/stars.png';
import Image_StarsWhite from '@/assets/images/stars-white.png';
import Image_GiftBg from '@/assets/gifts/png/gift_bg.png';
import Lottie from '../Lottie.vue';
import GiftLottie from '../GiftLottie.vue';
import Notiflix from 'notiflix';

// Images
import MarketImg from '@/assets/images/market.svg';
import TonImg from '@/assets/images/market/ton.svg';

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
    ModalActive: {
      type: Boolean,
      required: true,
    },
    ModalTransferActive: {
      type: Boolean,
      required: true,
    },
    ModalComp: {
      type: Object,
      required: true,
    },
    UpgradedNft: {
      type: Object,
      required: true,
    },
    Table: {
      type: Object,
      required: true,
    },
  },

  components: {
    Lottie,
    GiftLottie,
  },

  data() {
    return {
      MarketImg,
      TonImg,

      storeCache: useCacheStore(),

      isLoading: this.$props.Skeleton,
      isLoadingModalImage: true,

      isTransferOpen: false,
      isTransferInputSuccess: false,
      isTransferSuccess: false,
      transferTimeout: null,

      showDefaultAvatar: false,
      transferUsers: [],
      transferUserSelected: null,
      transferData: { query: null, userId: null, avatar: null, name: null, success: false },
      transferYourselfError: false,
      transferSections: {
        active: {
          label: this.$t('profile.profileTransferSections.name'),
          value: 'name'
        },
        items: [
          { label: this.$t('profile.profileTransferSections.name'), value: 'name' },
          { label: this.$t('profile.profileTransferSections.username'), value: 'username' },
          { label: this.$t('profile.profileTransferSections.telegram_id'), value: 'telegram_id' },
        ]
      },

      keyboardHeight: 0,

      OwnerImage: true,
      ActiveButton: false,

      isLoadingUpgrade: false,
      isLoadingUpgradeImage: false,
      isUpgraded: false,

      dragY: 0,
      startY: 0,
      startX: 0,
      isDragging: false,
      dragFrom: null,
      startTimeMs: 0,
      lastY: 0,
      
      Icon,
      Image_Stars,
      Image_StarsWhite,
      Image_GiftBg,

      getUpgradedModel,
      cutNumber,
    };
  },

  mounted() {
    this.loadResources();
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },

  computed: {
    isLoading() {
      return this.Skeleton;
    },
    isUpgraded() {
      if (!this.ModalComp.NftUpgraded) return false;
      return true;
    },
    sheetStyleContent() {
      if (!this.isDragging || !this.ModalActive || this.dragFrom !== 'content') return null;
      return {
        transform: `translate(-50%, ${Math.max(0, this.dragY)}px)`,
        transition: 'none',
        willChange: 'transform',
      };
    },
    sheetStyleSkeleton() {
      if (!this.isDragging || !this.ModalActive || this.dragFrom !== 'skeleton') return null;
      return {
        transform: `translateY(${Math.max(0, this.dragY)}px)`,
        transition: 'none',
        willChange: 'transform',
      };
    },
  },

  watch: {
    isLoadingUpgradeImage(newValue) {
      if (newValue === false) {
        this.isUpgraded = true;
        this.ModalComp.NftUpgraded = true;
        this.$emit(
          'upgradedNftModal', 
          this.ModalComp.NftId, 
          this.UpgradedNft.ModelName, 
          this.UpgradedNft.SymbolName, 
          this.UpgradedNft.BackgroundName,
          this.UpgradedNft.ModelNumber
        );
      }
    }
  },
  
  methods: {
    handleClickOutside(event) {
      if (!this.$refs.transferInput.contains(event.target)) {
        this.blurTransferInput();
      }
    },

    async loadResources() {
      try {
        await Promise.all([this.loadFonts(), this.loadImages()]);
        this.isLoading = false;
        this.$emit("loadSuccess");
      } catch (error) {
        console.error("Ошибка при загрузке ресурсов:", error);
      }
    },

    loadFonts() {
      return document.fonts.ready;
    },

    loadImages() {
      const staticImages = [
        Image_Stars
      ].map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      return Promise.all([...staticImages]);
    },

    closeModal() {
      this.$emit('closeModal');
    },

    handleResize() {
      const viewportHeight = window.innerHeight;
      const fullHeight = document.documentElement.clientHeight;
      this.keyboardHeight = fullHeight - viewportHeight;
    },

    async transferNft() {
      if (!this.ModalComp.NftUuid) return;
      
      Notiflix.Confirm.show(
        this.$t('profile.profileConfirmTransfer.title'),
        this.$t('profile.profileConfirmTransfer.descr'),
        this.$t('profile.profileConfirmTransfer.button'),
        this.$t('profile.profileConfirmTransfer.buttonCancel'),
        async () => {
          const UUIDs = [this.ModalComp.NftUuid];
          const updateNft = await nftApi.swap(UUIDs);
          if (!updateNft) return;
          if (updateNft.status === 'received') {
            this.closeModal();
          };

          this.$emit('transferNft');
          this.closeModal();
        },
        () => {
          // cancel
        }
      );
    },

    async sendNft(giftUniqueKey, giftUuid) {
      if (!this.ModalComp.NftId) return;
      this.useTransferModal();
    },

    useTransferModal() {
      this.closeModal();
      this.$emit('useTransferModal');
    },

    closeTransferModal() {
      this.closeModal();
      this.$emit('closeTransferModal');
    },

    clearTransferData() {
      try {
        this.transferData = {
          query: null,
          avatar: null,
          name: null,
          success: false
        };
      } catch {}
    },

    closeTransferData() {
      this.clearTransferData();
      this.transferUserSelected = null;
      this.isTransferInputSuccess = false;
    },

    keyTransferInput(event) {
      document.addEventListener('click', this.handleClickOutside);

      const eventText = event.target.value.trim();
      this.transferYourselfError = false;

      if (eventText !== "") {
        if (eventText.startsWith("@")) {
          this.setActiveTransferTab("username");
          if (eventText === '@' + this.storeCache.UserData.user.Username) {
            this.transferYourselfError = true;
            return;
          };
        } else if (!isNaN(eventText)) {
          this.setActiveTransferTab("telegram_id");
          if (eventText === this.storeCache.UserData.user.Tld.toString()) {
            this.transferYourselfError = true;
            return;
          };
        } else {
          this.setActiveTransferTab("name");
          if ((eventText.toLowerCase() === this.storeCache.UserData.user.Name.toLowerCase()) || (eventText.toLowerCase() === this.storeCache.UserData.user.Username.toLowerCase())) {
            this.transferYourselfError = true;
            return;
          };
        }

        this.transferData.query = eventText;

        if (this.transferTimeout) {
          clearTimeout(this.transferTimeout);
        }

        this.transferTimeout = setTimeout(() => {
          this.getTransferData();
        }, 1500);
      } else {
        this.transferUsers = [];
        this.transferUserSelected = null;
        this.isTransferInputSuccess = false;
        this.clearTransferData();
      }
    },

    async blurTransferInput(event) {
      this.keyTransferInput(event);
      if (this.transferData.query) { await this.getTransferData(); }
    },

    async getTransferData() {
      if (!this.transferData.query) return;
      if (this.transferData.query === this.storeCache.UserData.user.Tld.toString()) {
        this.transferYourselfError = true;
        return;
      };
      if (this.transferData.query.startsWith("@")) {
        this.transferData.query = this.transferData.query.slice(1);
      }
      const response = await userApi.searchUser(this.transferData.query);
      if (response) {
        this.transferUsers = response;
      } else {
        this.transferData.success = false;
      }
    },

    async transferGift() {
      if (!this.transferData.success) return;

      const data = await this.transferInvoiceSendGift();
    },

    async transferInvoiceSendGift() {
      if (!this.transferData.success) return;
      if (parseInt(this.transferData.userId) === parseInt(this.storeCache.TelegramData.user.id)) {
        this.transferYourselfError = true;
        return;
      };

      if (this.ModalComp.NftStatus === 'purchased' || this.ModalComp.NftStatus === 'sended') {
        this.ActiveButton = true;
        const nftsToTransfer = [this.ModalComp.NftUuid]
        const transfer = await nftApi.transfer(nftsToTransfer, this.transferData.userId);
        if (!transfer) {
          showToast('Error transfering gift', 'error');
          this.ActiveButton = false;
        };

        this.ActiveButton = false;
        this.storeCache.UserData.sent_user++;

        if (transfer.tickets_rewarded) {
          this.storeCache.UserData.user.Tickets += transfer.tickets_rewarded;
        }

        this.$emit('useTransfered', nftsToTransfer[0]);
        this.closeTransferModal();
      };

      if (this.ModalComp.NftStatus === 'received') {
        this.ActiveButton = true;

        const invoice = await invoiceApi.createInvoiceNftTransfer(
          this.ModalComp.NftUuid,
          this.ModalComp.NftUniqueKey,
          this.transferData.userId,
        );

        TelegramModule.useInvoice(
          invoice.link, 
          () => {
            this.ActiveButton = false;
            this.storeCache.UserData.sent_user++;
            this.$emit('useTransfered', this.ModalComp.NftUuid);
            this.closeTransferModal();
          }, 
          () => {
          }
        );
      }
    },

    async checkUpgradedNft() {
      if (this.UpgradedNft.ModelImage) {
        this.isUpgraded = true;
      };
    },

    async upgradeNft(NftId) {
      if (this.isLoadingUpgrade) return;
      if (!this.ModalComp.NftUpgradeSupport) return;
      if (!this.ModalComp.NftUuid || !this.ModalComp.NftUpgradePrice) return;

      this.isUpgraded = false;
      this.isLoadingUpgrade = true;

      const invoice = await invoiceApi.createInvoiceNftUpgrade(this.ModalComp.NftUuid);
      const paymentId = invoice.payment_upgrade_id;

      if (!invoice.success) {
          const webSocketLink = import.meta.env.VITE_APP_SOCKET_URL;
          const idDontSuccess = invoice?.payment_upgrade_id || invoice?.UUID;
          if (!idDontSuccess) return;

          const socket = new WebSocket(`${webSocketLink}/payments/ws/${idDontSuccess}`);

          socket.onopen = () => {};
          socket.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            if (!data.nft_id) return;
            if (data.nft_id === this.ModalComp.NftUuid && data.actual_amount === this.ModalComp.NftUpgradePrice) {
              const upgrade = await nftApi.upgrade(idDontSuccess);
              if (!upgrade) return;
              if (upgrade.ok) {
                const upgradeData = upgrade.data;
                this.$emit("UPGRADE", { 
                  GiftUuid: this.ModalComp.NftId,
                  GiftMedia: this.ModalComp.NftMedia,
                  ...upgradeData
                });

                setTimeout(() => {
                  this.isLoadingUpgrade = false;
                  this.isLoadingUpgradeImage = false;
                  this.isUpgraded = true;
                  this.ModalComp.NftUpgraded = true;
                  this.$emit(
                    'upgradedNftModal', 
                    this.ModalComp.NftId, 
                    this.UpgradedNft.ModelName, 
                    this.UpgradedNft.SymbolName, 
                    this.UpgradedNft.BackgroundName,
                    this.UpgradedNft.ModelNumber
                  );
                  fireFromBottom();
                }, 400);
              }
            }
          };
          socket.onclose = () => { console.log("❌ WebSocket closed"); };
          socket.onerror = (err) => { console.error("⚠️ WebSocket error:", err); };
      }

      TelegramModule.useInvoice(
        invoice.link, 
        async () => {
          const webSocketLink = import.meta.env.VITE_APP_SOCKET_URL;
          const socket = new WebSocket(`${webSocketLink}/payments/ws/${paymentId}`);

          socket.onopen = () => {};
          socket.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            if (!data.nft_id) return;
            if (data.nft_id === this.ModalComp.NftUuid && data.actual_amount === this.ModalComp.NftUpgradePrice) {
              const upgrade = await nftApi.upgrade(paymentId);
              if (!upgrade) return;
              if (upgrade.ok) {
                const upgradeData = upgrade.data;
                this.$emit("UPGRADE", { 
                  GiftUuid: this.ModalComp.NftId,
                  GiftMedia: this.ModalComp.NftMedia,
                  ...upgradeData
                });

                setTimeout(() => {
                  this.isLoadingUpgrade = false;
                  this.isLoadingUpgradeImage = false;
                  this.isUpgraded = true;
                  this.ModalComp.NftUpgraded = true;
                  this.$emit(
                    'upgradedNftModal', 
                    this.ModalComp.NftId, 
                    this.UpgradedNft.ModelName, 
                    this.UpgradedNft.SymbolName, 
                    this.UpgradedNft.BackgroundName,
                    this.UpgradedNft.ModelNumber
                  );
                  fireFromBottom();
                }, 400);
              }
            }
          };
          socket.onclose = () => { console.log("❌ WebSocket closed"); };
          socket.onerror = (err) => { console.error("⚠️ WebSocket error:", err); };
        }, 
        () => {
          this.isUpgraded = false;
          this.isLoadingUpgrade = false;
        }
      );
    },

    shareGiftLink() {
      const url = import.meta.env.VITE_APP_MINI_APP_LINK + `=gift_${this.ModalComp.NftId}`;
      const message = `I recommend checking out "${this.ModalComp.NftName ?? this.UpgradedNft?.ModelName}" NFT.`;
      TelegramModule.useShare(url, message);
    },

    copyGiftLink() {
      const url = import.meta.env.VITE_APP_MINI_APP_LINK + `=gift_${this.ModalComp.NftId}`;
      copyToClipboard(url);
      showToast(this.$t('profile.profileCopiedLink'), 'success');
    },

    setActiveTransferTab(value) {
      this.transferSections.active.label = this.transferSections.items.find(item => item.value === value).label;
      this.transferSections.active.value = value;
      this.transferUsers = [];
      this.transferUserSelected = null;
      this.isTransferInputSuccess = false;
      this.clearTransferData();
    },

    selectTransferUser(user) {
      this.transferUserSelected = user.user_id;
      this.transferData.userId = Number(user.user_id);
      this.transferData.avatar = user.user_photo;
      this.transferData.name = user.name;
      this.transferData.success = true;
      this.$refs.transferInput?.blur();
      this.isTransferInputSuccess = true;
      document.removeEventListener('click', this.handleClickOutside);
    },
    
    onTouchStart(e, from) {
      if (!this.ModalActive) return;
      const t = e.touches?.[0] ?? e;
      this.dragFrom = from;
      this.isDragging = true;
      this.startY = t.clientY;
      this.startX = t.clientX;
      this.lastY = t.clientY;
      this.dragY = 0;
      this.startTimeMs = performance.now();
    },

    onTouchMove(e) {
      if (!this.isDragging) return;
      const t = e.touches?.[0] ?? e;
      const dy = t.clientY - this.startY;
      const dx = Math.abs(t.clientX - this.startX);

      // Игнорим горизонтальные жесты
      if (dx > Math.abs(dy)) return;

      // Тянем только вниз
      this.dragY = dy > 0 ? dy : 0;
      this.lastY = t.clientY;
    },

    onTouchEnd() {
      if (!this.isDragging) return;

      // Порог/скорость для закрытия
      const elapsed = Math.max(1, performance.now() - this.startTimeMs); // ms
      const distance = Math.max(0, this.dragY); // px
      const velocity = distance / elapsed; // px/ms

      // контентная высота ~ 86vh, возьмём безопасный порог
      const CLOSE_DISTANCE = 120;   // px
      const CLOSE_VELOCITY = 0.6;   // px/ms (~быстрый "флик")

      const shouldClose = distance > CLOSE_DISTANCE || velocity > CLOSE_VELOCITY;

      // Сброс инлайна — вернёт CSS-анимацию
      this.isDragging = false;

      if (shouldClose) {
        this.closeModal();
      } else {
        // Отпружиниваем назад (CSS сам вернёт по transition)
        this.dragY = 0;
        // Небольшой тик, чтобы убрать инлайн-стили после кадра
        requestAnimationFrame(() => {
          this.dragFrom = null;
        });
      }
    },

    sellGift() {
      if (!this.ModalComp.NftUpgraded) return;
      this.closeModal();
      const obj = { 
        ton_price: 0,
        gift_media: this.ModalComp.NftMedia,
        gift_ukey: this.ModalComp.NftUniqueKey,
        gift_uuid: this.ModalComp.NftUuid, 
        ...this.ModalComp.NftUpgraded 
      }
      this.$emit('openSellModal', obj);
    },

    async removeGiftLot() {
      console.log(this.ModalComp)
      if (!this.ModalComp.Market.LotId) return;
      const res = await MarketLotsApi.remove(this.ModalComp.Market.LotId);
      if (!res) return;
      this.$emit('removeGiftLot', this.ModalComp.NftUuid);
      this.closeModal();
    },
  },
};
</script>

<style>
</style>