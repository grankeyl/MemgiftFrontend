import { createRouter, createWebHistory } from 'vue-router'

import Home from '../pages/Home.vue'

const Collection = () => import('../pages/Collection.vue')
const Activity = () => import('../pages/Activity.vue')
const Profile = () => import('../pages/Profile.vue')
const Deposit = () => import('../pages/Deposit.vue')
const Receive = () => import('../pages/Receive.vue')
const Rating = () => import('../pages/Rating.vue')
const View = () => import('../pages/View.vue')
const Gift = () => import('../pages/Gift.vue')
const Market = () => import('../pages/Market/Market.vue')
const MarketBasket = () => import('../pages/Market/Basket.vue')
const Tickets = () => import('../pages/Tickets.vue')
const Multicheck = () => import('../pages/Multicheck.vue')
const Deal = () => import('../pages/Deal.vue')
const PrivateDeal = () => import('../pages/PrivateDeal.vue')
const PrivateDealView = () => import('../pages/PrivateDealView.vue')
const ActivateMulticheck = () => import('../pages/Activate/Multicheck.vue')
const Referral = () => import('../pages/Referral.vue')
const Wallet = () => import('../pages/Wallet.vue')
const Soda = () => import('../pages/Soda.vue')
const Maintenance = () => import('../pages/Maintenance.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/maintenance', name: 'maintenance', component: Maintenance, meta: { noLayout: true } },
    { path: '/', name: 'home', component: Home },
    { path: '/profile', name: 'profile', component: Profile },
    { path: '/deposit', name: 'deposit', component: Deposit },
    { path: '/view/:id', name: 'view', component: View },
    { path: '/gift/:id', name: 'gift', component: Gift },
    { path: '/collection/:nft', name: 'collection', component: Collection },
    { path: '/activity', name: 'activity', component: Activity },
    { path: '/receive/:nft/:nftType', name: 'receive', component: Receive },
    { path: '/activate-multicheck/:nft/:nftType', name: 'activate-multicheck', component: ActivateMulticheck },
    { path: '/rating', name: 'rating', component: Rating },
    { path: '/m', name: 'market', component: Market },
    { path: '/m/basket', name: 'market-basket', component: MarketBasket },
    { path: '/wallet', name: 'wallet', component: Wallet },
    { path: '/tickets', name: 'tickets', component: Tickets },
    { path: '/multicheck', name: 'multicheck', component: Multicheck },
    { path: '/deal', name: 'deal', component: Deal },
    { path: '/private-deal', name: 'private-deal', component: PrivateDeal },
    { path: '/private-deal/:id', name: 'private-deal-view', component: PrivateDealView },
    { path: '/referral', name: 'referral', component: Referral },
    { path: '/soda', name: 'soda', component: Soda },
  ]
})

export default router
