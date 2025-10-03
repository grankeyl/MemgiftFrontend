import { createRouter, createWebHistory } from 'vue-router'

import Home from '../pages/Home.vue'
import Collection from '../pages/Collection.vue'
import Activity from '../pages/Activity.vue'
import Profile from '../pages/Profile.vue'
import Deposit from '../pages/Deposit.vue'
import Receive from '../pages/Receive.vue'
import Rating from '../pages/Rating.vue'
import View from '../pages/View.vue'
import Gift from '../pages/Gift.vue'
// import Dev from '../pages/Dev.vue'
import Market from '../pages/Market/Market.vue'
import MarketBasket from '../pages/Market/Basket.vue'
import Tickets from '../pages/Tickets.vue'
import Multicheck from '../pages/Multicheck.vue'
import Deal from '../pages/Deal.vue'
import PrivateDeal from '../pages/PrivateDeal.vue'
import ActivateMulticheck from '../pages/Activate/Multicheck.vue'
import Referral from '../pages/Referral.vue'
import Wallet from '../pages/Wallet.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
    // { path: '/market', name: 'market', component: Dev },
    { path: '/m', name: 'market', component: Market },
    { path: '/m/basket', name: 'market-basket', component: MarketBasket },
    { path: '/wallet', name: 'wallet', component: Wallet },
    { path: '/tickets', name: 'tickets', component: Tickets },
    { path: '/multicheck', name: 'multicheck', component: Multicheck },
    { path: '/deal', name: 'deal', component: Deal },
    { path: '/private-deal', name: 'private-deal', component: PrivateDeal },
    { path: '/referral', name: 'referral', component: Referral },
    // {
    //   path: '/:pathMatch(.*)*',
    //   name: 'NotFound',
    //   component: { render: () => null }, // ничего не рисует
    //   meta: { noLayout: true }
    // }
  ]
})

export default router