import { Icon } from "../Icon.ts"

export const MenuJson = {
    Home: {
        Key: 'home',
        Icon: Icon.Gift,
        Route: '/'
    },
    Rating: {
        Key: 'rating',
        Icon: Icon.Rating,
        Route: '/rating'
    },
    Tickets: {
        Key: 'tasks',
        Icon: Icon.Ticket,
        Route: '/tickets',
        Disable: true
    },
    Market: {
        Key: 'market',
        Icon: Icon.Market,
        Route: '/market'
    },
    Profile: {
        Key: 'profile',
        Icon: Icon.User,
        Route: '/profile'
    }
}