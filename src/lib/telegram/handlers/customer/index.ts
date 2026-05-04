import { Telegraf } from 'telegraf';
import { registerStartHandler } from './start';
import { registerCallbackHandlers } from './callbacks';
import { registerMessageHandlers } from './messages';

export function registerCustomerHandlers(bot: Telegraf) {
    registerStartHandler(bot);
    registerCallbackHandlers(bot);
    registerMessageHandlers(bot);
}
