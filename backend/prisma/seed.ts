import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    const hashedPassword = await bcrypt.hash('admin123', 10);

    // 1. Create Department
    const hopss = await prisma.department.upsert({
        where: { code: 'HOPSS' },
        update: {},
        create: { code: 'HOPSS', name: 'HOSPITAL OPERATIONS AND PATIENT SUPPORT SERVICE' }
    });

    // 2. Create Section
    const efm = await prisma.section.upsert({
        where: {
            name_departmentId: {
                name: 'ENGINEERING AND FACILITIES MANAGEMENT',
                departmentId: hopss.id
            }
        },
        update: {},
        create: { name: 'ENGINEERING AND FACILITIES MANAGEMENT', departmentId: hopss.id }
    });

    // 3. Create Request Types
    await prisma.requestType.upsert({
        where: { name: 'IT SUPPORT' },
        update: {},
        create: { name: 'IT SUPPORT' }
    });

    await prisma.requestType.upsert({
        where: { name: 'FACILITIES' },
        update: {},
        create: { name: 'FACILITIES' }
    });

    // 4. Create Sample Admin
    await prisma.user.upsert({
        where: { email: 'admin@cdh.gov' },
        update: {},
        create: {
            name: 'SYSTEM ADMIN',
            email: 'admin@cdh.gov',
            password: hashedPassword,
            role: 'ADMIN',
            status: 'ACTIVE',
            sectionId: efm.id
        }
    });

    console.log('✅ Seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
