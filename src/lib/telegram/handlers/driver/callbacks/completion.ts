import { Telegraf } from 'telegraf';
import { prisma } from '@/lib/prisma';
import { RecycleRequestStatus, DriverStatus } from '@prisma/client';
import { getDriver } from '../helpers';
import { notifyCustomer } from '../../../notifier';
import { createBotEvent } from '../../../botEvents';
import { processEcoProgress } from '@/lib/eco/ecoProgressService';

export function registerCompletionCallbacks(bot: Telegraf) {
    bot.on('callback_query', async (ctx, next) => {
        const data = 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
        if (!data) return next();
        const tgId = ctx.from.id.toString();

        const driver = await getDriver(tgId);
        if (!driver) {
            if (data.startsWith('complete_') || data.startsWith('cancel_')) {
                await ctx.answerCbQuery('❌ Ro\'yxatdan o\'tmagan');
            }
            return next();
        }

        if (data.startsWith('complete_')) {
            const reqId = parseInt(data.replace('complete_', ''));
            const request = await prisma.recycleRequest.findUnique({ where: { id: reqId } });
            if (!request || request.assignedDriverId !== driver.id) {
                await ctx.answerCbQuery('❌');
                return;
            }

            // ─── Gamification Loop: Eko-Balllarni berish ───
            if (request.userId) {
                try {
                    const collection = await prisma.recycleCollection.findFirst({
                        where: { requestId: reqId },
                        orderBy: { collectedAt: 'desc' }
                    });
                    
                    if (collection && collection.effectiveWeight > 0) {
                        const ecoResult = await processEcoProgress(request.userId, request.material, collection.effectiveWeight);
                        
                        // Xaridorga xabar berish
                        if (request.customerTgId) {
                            let msg = `🌱 Tashakkur! Chiqindi topshirganingiz uchun <b>+${ecoResult.earnedPoints}</b> Eko-ball oldingiz!\n`;
                            msg += `Jami tejagan CO₂: ${ecoResult.stats.totalCO2Saved} kg\n`;
                            
                            if (ecoResult.levelUp) {
                                msg += `\n🎉 Tabriklaymiz, Eko-darajangiz ko'tarildi: <b>${ecoResult.newLevel}</b>!`;
                            }
                            if (ecoResult.newBadges && ecoResult.newBadges.length > 0) {
                                msg += `\n🏅 Yangi yutuq nishonini yutib oldingiz!`;
                            }
                            
                            await notifyCustomer(request.customerTgId, msg, { parse_mode: 'HTML' });
                        }
                    }
                } catch (e) {
                    console.error('[Driver Bot] Eco-Progress xatosi:', e);
                }
            }
            // ──────────────────────────────────────────────

            await prisma.recycleRequest.update({
                where: { id: reqId },
                data: { status: RecycleRequestStatus.completed, completedAt: new Date() },
            });

            await prisma.driver.update({
                where: { id: driver.id },
                data: { status: DriverStatus.active },
            });

            await createBotEvent({
                sourceBot: 'driver',
                eventType: 'request.completed',
                entityType: 'recycle_request',
                entityId: reqId,
                severity: 'success',
                title: 'Haydovchi vazifani yakunladi',
                message: `${driver.name} ariza #${reqId} ni qo'lda yakunladi.`,
                requestId: reqId,
                driverId: driver.id,
                pointId: request.pointId,
            });

            await ctx.answerCbQuery('✅');
            await ctx.editMessageText(`✅ Topshiriq #${reqId} to'liq yakunlandi!\nSiz endi bo'shsiz va yangi buyurtmalarni qabul qilishingiz mumkin.`, { parse_mode: 'HTML' });
            return;
        }

        if (data.startsWith('cancel_')) {
            const reqId = parseInt(data.replace('cancel_', ''));
            const request = await prisma.recycleRequest.findUnique({ where: { id: reqId } });
            if (!request || request.assignedDriverId !== driver.id) {
                await ctx.answerCbQuery('❌');
                return;
            }

            await prisma.recycleRequest.update({
                where: { id: reqId },
                data: { status: RecycleRequestStatus.cancelled, completedAt: new Date(), completedNote: 'Haydovchi tomonidan bekor qilindi' },
            });

            await prisma.driver.update({
                where: { id: driver.id },
                data: { status: DriverStatus.active },
            });

            await createBotEvent({
                sourceBot: 'driver',
                eventType: 'request.cancelled',
                entityType: 'recycle_request',
                entityId: reqId,
                severity: 'warning',
                title: 'Haydovchi vazifani bekor qildi',
                message: `${driver.name} ariza #${reqId} ni bekor qildi.`,
                requestId: reqId,
                driverId: driver.id,
                pointId: request.pointId,
            });

            await ctx.answerCbQuery('🚫');
            await ctx.editMessageText(`🚫 Topshiriq #${reqId} bekor qilindi.`, { parse_mode: 'HTML' });
            return;
        }

        return next();
    });
}
