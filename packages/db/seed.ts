import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Demo Studio',
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      name: 'Admin User',
      password: 'password', // In a real app, this should be hashed
      tenantId: tenant.id,
    },
  });

  const doctor = await prisma.user.create({
    data: {
      email: 'doctor@demo.com',
      name: 'Doctor User',
      password: 'password', // In a real app, this should be hashed
      tenantId: tenant.id,
    },
  });

  for (let i = 1; i <= 5; i++) {
    await prisma.patient.create({
      data: {
        firstName: `Patient_FirstName_${i}`,
        lastName: `Patient_LastName_${i}`,
        cf: `CF${i.toString().padStart(10, '0')}`,
        tenantId: tenant.id,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
