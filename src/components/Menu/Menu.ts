import { Icon } from "../Icon.ts"

export const MenuJson = {
    Home: {
        Key: 'home',
        Icon: Icon.MenuHome,
        Route: '/',
        Disable: false,
    },
    Tickets: {
        Key: 'tasks',
        Icon: Icon.MenuTasks,
        Route: '/tickets',
        Disable: false
    },
    Market: {
        Key: 'market',
        Icon: Icon.MenuMarket,
        Route: '/m',
        Disable: false
    },
    Profile: {
        Key: 'profile',
        Icon: Icon.MenuProfile,
        Route: '/profile',
        Disable: false
    }
}

export const MenuItems = [
    MenuJson.Home,
    MenuJson.Tickets,
    MenuJson.Market,
    MenuJson.Profile,
] as const