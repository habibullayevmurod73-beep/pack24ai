import { Telegraf } from 'telegraf';
import { registerStartHandler } from './start';
import { registerContactHandler } from './contact';
import { registerCallbackHandlers } from './callbacks';
import { registerTextHandlers } from './text';

export function registerPack24AdminHandlers(bot: Telegraf) {
    registerStartHandler(bot);
    registerContactHandler(bot);
    registerCallbackHandlers(bot);
    registerTextHandlers(bot);
}
