const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpiando tablas...');
  await prisma.uploadLog.deleteMany();
  await prisma.employeeMonthlyRecord.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany({
    where: {
      username: { not: 'admin' }
    }
  });
  console.log('✅ Base de datos limpia (excepto admin).');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
