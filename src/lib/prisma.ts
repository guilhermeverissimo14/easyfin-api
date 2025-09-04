import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },

  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

const connectionLimit = parseInt(process.env.DATABASE_CONNECTION_LIMIT || '100')
const connectionTimeout = parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '20000')
const poolTimeout = parseInt(process.env.DATABASE_POOL_TIMEOUT || '20000')

process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

export { prisma }
