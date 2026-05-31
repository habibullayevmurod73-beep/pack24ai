import { Telegraf } from 'telegraf';
import {
    registerNavigationCallbacks,
    registerCabinetCallbacks,
    registerPrtsCallbacks,
    registerRecyclingCallbacks,
    registerCollectionCallbacks,
} from './callbacks/index';

export function registerCallbackHandlers(bot: Telegraf) {
    registerNavigationCallbacks(bot);
    registerCabinetCallbacks(bot);
    registerPrtsCallbacks(bot);
    registerRecyclingCallbacks(bot);
    registerCollectionCallbacks(bot);
}
