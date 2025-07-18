import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (existingAdmin) {
    console.log('Admin already exists.');
    return;
  }

  const password = await bcrypt.hash('admin123',10); 

  const admin = await prisma.user.create({
    data: {
      name: 'Master Admin',
      email: 'admin@edlms.com',
      password,
      role: 'ADMIN',
      adminProfile: { create: {} }
    }
  });

  console.log('Admin created:', admin.email);
}

main().catch(console.error);
