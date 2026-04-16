const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Cleaning up duplicate sections...');

    try {
        const sections = await prisma.section.findMany({
            orderBy: { createdAt: 'asc' }
        });

        const seen = new Set();
        const toDelete = [];

        for (const section of sections) {
            const key = `${section.name}-${section.departmentId}`;
            if (seen.has(key)) {
                const userCount = await prisma.user.count({ where: { sectionId: section.id } });
                const requestCount = await prisma.serviceRequest.count({ where: { sectionId: section.id } });

                if (userCount === 0 && requestCount === 0) {
                    toDelete.push(section.id);
                } else {
                    console.log(`⚠️ Duplicate section "${section.name}" is in use. Skipping deletion for ID: ${section.id}`);
                }
            } else {
                seen.add(key);
            }
        }

        if (toDelete.length > 0) {
            console.log(`🗑️ Deleting ${toDelete.length} unused duplicate sections...`);
            await prisma.section.deleteMany({
                where: { id: { in: toDelete } }
            });
            console.log('✅ Cleanup complete!');
        } else {
            console.log('✨ No unused duplicate sections found.');
        }
    } catch (err) {
        console.error('❌ Error during cleanup:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
