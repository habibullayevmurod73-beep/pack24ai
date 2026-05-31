import { Telegraf } from 'telegraf';
import { registerTaskLifecycleCallbacks } from './callbacks/taskLifecycle';
import { registerCalculatorCallbacks } from './callbacks/calculator';
import { registerCompletionCallbacks } from './callbacks/completion';

export function registerCallbackHandlers(bot: Telegraf) {
    registerTaskLifecycleCallbacks(bot);
    registerCalculatorCallbacks(bot);
    registerCompletionCallbacks(bot);
}
