import CashFlowController from '@/controllers/cash-flow.controller'
import {
   createCashFlowSchema,
   getTotalsPerDayCashFlowSchema,
   importBankTransactionsCashFlowSchema,
   listByAccountCashFlowSchema,
   listByCashCashFlowSchema,
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

   //Rota para importar transações bancárias de um arquivo XLSX
   server.post('/import-bank-extract', { preHandler: authMiddleware, schema: importBankTransactionsCashFlowSchema }, CashFlowController.importXlsx)
}

export { cashFlowRoutes }
