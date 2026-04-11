import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
    const client = new PrismaClient({
        log: process.env.NODE_ENV === 'development'
            ? ['error', 'warn']
            : ['error'],
    });

    // Prisma 5+ — $extends bilan retry middleware
    const extendedClient = client.$extends({
        query: {
            async $allOperations({ operation, model, args, query }) {
                try {
                    return await query(args);
                } catch (error: unknown) {
                    // Neon ConnectionReset xatoligini ushlash va qayta urinish
                    if (
                        error instanceof Error &&
                        (error.message.includes('ConnectionReset') ||
                         error.message.includes('connection') ||
                         error.message.includes('P1017') ||
                         error.message.includes('P1001') ||
                         error.message.includes('10054'))
                    ) {
                        console.warn(`[Prisma] Connection reset — qayta urinish (${model}.${operation})`);
                        // Biroz kutib, qayta urinish
                        await new Promise(r => setTimeout(r, 500));
                        try {
                            return await query(args);
                        } catch (retryError) {
                            console.error('[Prisma] Qayta urinish ham muvaffaqiyatsiz:', retryError);
                            throw retryError;
                        }
                    }
                    throw error;
                }
            },
        },
    });

    return extendedClient;
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
