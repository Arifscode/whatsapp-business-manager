require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.$queryRaw`SELECT 1`
  .then(() => console.log('DB connected'))
  .catch(e => console.error('DB error:', e.message))
  .finally(() => prisma.$disconnect());