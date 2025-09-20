import { PrismaClient } from '@prisma/client'

const connectionLimit = parseInt(process.env.DATABASE_CONNECTION_LIMIT || '50')
const connectionTimeout = parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '60000')
const poolTimeout = parseInt(process.env.DATABASE_POOL_TIMEOUT || '60000')

// Configuração mais robusta do Prisma
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

// Função para reconectar com retry automático
export async function connectWithRetry(maxRetries = 5, delay = 1000): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await prisma.$connect()
      console.log('Prisma connected successfully')
      return
    } catch (error) {
      console.error(`Connection attempt ${attempt} failed:`, error)
      
      if (attempt === maxRetries) {
        throw new Error(`Failed to connect after ${maxRetries} attempts`)
      }
      
      // Backoff exponencial
      const waitTime = delay * Math.pow(2, attempt - 1)
      console.log(`Waiting ${waitTime}ms before retry...`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }
}

// Função para executar queries com retry automático
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      const isConnectionError = error?.code === 'P1001' || 
                               error?.code === 'P2028' || 
                               error?.message?.includes('connection') ||
                               error?.message?.includes('terminating connection')
      
      if (isConnectionError && attempt < maxRetries) {
        console.log(`Connection error on attempt ${attempt}, retrying...`)
        
        // Tentar reconectar
        try {
          await prisma.$disconnect()
          await connectWithRetry(3, 500)
        } catch (reconnectError) {
          console.error('Reconnection failed:', reconnectError)
        }
        
        // Backoff exponencial
        const waitTime = delay * Math.pow(2, attempt - 1)
        await new Promise(resolve => setTimeout(resolve, waitTime))
        continue
      }
      
      throw error
    }
  }
  
  throw new Error(`Operation failed after ${maxRetries} attempts`)
}

// Monitoramento mais suave do pool (sem terminar conexões)
setInterval(async () => {
  try {
    // Apenas monitora, não termina conexões
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
    console.error('Pool monitoring error:', error)
  }
}, 300000) // A cada 5 minutos

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
