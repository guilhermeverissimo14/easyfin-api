import CashFlowController from '@/controllers/cash-flow.controller'
import {
   createCashFlowSchema,
   getTotalsPerDayCashFlowSchema,
   listByAccountCashFlowSchema,
   listByCashCashFlowSchema,
   parseBankTransactionsCashFlowSchema,
   processBankTransactionsCashFlowSchema,
} from '@/documentation/cash-flow'
import { authMiddleware } from '@/middleware/auth.middleware'
import { FastifyPluginAsync } from 'fastify'

const cashFlowRoutes: FastifyPluginAsync = async (server) => {
   //Rota para lançar um registro no fluxo de caixa
   server.post('/', { preHandler: authMiddleware, schema: createCashFlowSchema }, CashFlowController.create)

   //Rota para listar os lançamentos do fluxo de caixa por conta bancária
   server.get('/account/:bankAccountId', { preHandler: authMiddleware, schema: listByAccountCashFlowSchema }, CashFlowController.listByAccountId)

   //Rota para listar os lançamentos do fluxo de caixa por caixa
   server.get('/cash', { preHandler: authMiddleware, schema: listByCashCashFlowSchema }, CashFlowController.listByCash)

   //Rota para obter os totais do fluxo de caixa por dia
   server.get('/totals-per-day', { preHandler: authMiddleware, schema: getTotalsPerDayCashFlowSchema }, CashFlowController.getTotalsPerDay)

   //Rota para parsear um extrato bancário em um arquivo XLSX
   server.post('/parse-bank-extract', { preHandler: authMiddleware, schema: parseBankTransactionsCashFlowSchema }, CashFlowController.parseXlsx)

   //Rota para processar as transações bancárias e lançar no fluxo de caixa
   server.post(
      '/process-bank-transactions',
      { preHandler: authMiddleware, schema: processBankTransactionsCashFlowSchema },
      CashFlowController.processTransactions,
   )

   // Rota para vincular lançamento de crédito com conta a receber
   server.patch('/:id/link-receivable', { preHandler: authMiddleware }, CashFlowController.linkReceivable)

   // Rota para vincular lançamento de débito com conta a pagar
   server.patch('/:id/link-payable', { preHandler: authMiddleware }, CashFlowController.linkPayable)
}

export { cashFlowRoutes }
