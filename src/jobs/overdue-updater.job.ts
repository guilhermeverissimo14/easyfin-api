import cron from 'node-cron'
import { prisma } from '../lib/prisma'

export function startOverdueUpdaterJob() {
   cron.schedule('0 0 * * *', async () => {
      try {
         const result = await prisma.$executeRawUnsafe(`
        UPDATE contas_pagar
        SET status = 'OVERDUE'
        WHERE status = 'PENDING'
          AND due_date < CURRENT_DATE
      `)
         console.log(`[JOB] Status atualizado para OVERDUE (${result} registros afetados)`)
      } catch (error) {
         console.error('[JOB] Erro ao atualizar contas vencidas:', error)
      }
   })

   console.log('[JOB] Agendamento de atualização de contas vencidas ativado.')
}
