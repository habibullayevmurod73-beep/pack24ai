import { Telegraf } from 'telegraf';
import { registerRegistrationHandlers } from './messages/registration';
import { registerCalculatorMessageHandlers } from './messages/calculator';
import { registerMenuButtonHandlers } from './messages/menuButtons';

export function registerMessageHandlers(bot: Telegraf) {
    registerRegistrationHandlers(bot);
    registerCalculatorMessageHandlers(bot);
    registerMenuButtonHandlers(bot);
}
