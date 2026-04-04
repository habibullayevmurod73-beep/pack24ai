const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking models...');
    const models = Object.keys(prisma).filter(k => !k.startsWith('_') && typeof prisma[k] === 'object');
    console.log('Available models:', models.join(', '));
    await prisma.$disconnect();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
