import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    // 1. Create Departments
    const finance = await prisma.department.upsert({
        where: { code: 'FIN' },
        update: {},
        create: { code: 'FIN', name: 'FINANCE & ACCOUNTS' }
    });

    const admin = await prisma.department.upsert({
        where: { code: 'ADM' },
        update: {},
        create: { code: 'ADM', name: 'ADMINISTRATION' }
    });

    // 2. Create Sections
    const accountsPayable = await prisma.section.upsert({
        where: {
            name_departmentId: {
                name: 'ACCOUNTS PAYABLE',
                departmentId: finance.id
            }
        },
        update: {},
        create: { name: 'ACCOUNTS PAYABLE', departmentId: finance.id }
    });

    const hr = await prisma.section.upsert({
        where: {
            name_departmentId: {
                name: 'HUMAN RESOURCES',
                departmentId: admin.id
            }
        },
        update: {},
        create: { name: 'HUMAN RESOURCES', departmentId: admin.id }
    });

    // 3. Create Request Types
    const itSupport = await prisma.requestType.upsert({
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
            sectionId: hr.id
        }
    });

    // 5. Create Sample User
    await prisma.user.upsert({
        where: { email: 'user@cdh.gov' },
        update: {},
        create: {
            name: 'REGULAR USER',
            email: 'user@cdh.gov',
            password: userPassword,
            role: 'USER',
            status: 'ACTIVE',
            sectionId: accountsPayable.id
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
