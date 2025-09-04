import { PrismaClient } from '@prisma/client'

const connectionLimit = parseInt(process.env.DATABASE_CONNECTION_LIMIT || '100')
const connectionTimeout = parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '30000')
const poolTimeout = parseInt(process.env.DATABASE_POOL_TIMEOUT || '30000')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Configurar timeouts do pool
prisma.$connect().catch(console.error)

// Cleanup automático em intervalos
setInterval(async () => {
  try {
    // Força uma query simples para manter o pool ativo
    await prisma.$queryRaw`SELECT 1`
    
    // Força a liberação de conexões idle
    await prisma.$queryRaw`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle'`
    
    // Log para monitoramento
    if (process.env.NODE_ENV === 'development') {
      const connections = await prisma.$queryRaw`
        SELECT count(*) as total, state 
        FROM pg_stat_activity 
        WHERE datname = current_database()
        GROUP BY state
      `
      console.log('Pool status:', connections)
    }
  } catch (error) {
    console.error('Pool maintenance error:', error)
  }
}, 120000)

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
