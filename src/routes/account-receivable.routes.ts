import AccountsReceivableController from '@/controllers/accounts-receivable.controller'
import {
   listAccountsReceivableSchema,
   createAccountReceivableSchema,
   getAccountsReceivableByIdSchema,
   updateAccountsReceivableSchema,
   deleteAccountsReceivableSchema,
   getTotalsAccountReceivableSchema,
   receiveAccountsReceivableSchema,
} from '@/documentation/account-receivable.schemas'
import { authMiddleware } from '@/middleware/auth.middleware'
import { FastifyPluginAsync } from 'fastify'

const accountReceivableRoutes: FastifyPluginAsync = async (server) => {
   // Rota para obter totais das contas a receber
   server.get('/totals', { preHandler: authMiddleware, schema: getTotalsAccountReceivableSchema }, AccountsReceivableController.getTotals)

   // Rota para listar contas a receber
   server.get('/', { preHandler: authMiddleware, schema: listAccountsReceivableSchema }, AccountsReceivableController.list)

   // Rota para criar conta a receber
   server.post('/', { preHandler: authMiddleware, schema: createAccountReceivableSchema }, AccountsReceivableController.create)

   // Rota para listar uma conta a receber
   server.get('/:id', { preHandler: authMiddleware, schema: getAccountsReceivableByIdSchema }, AccountsReceivableController.getById)

   // Rota para atualizar uma conta a receber
   server.put('/:id', { preHandler: authMiddleware, schema: updateAccountsReceivableSchema }, AccountsReceivableController.update)

   // Rota para deletar uma conta a receber
   server.delete('/:id', { preHandler: authMiddleware, schema: deleteAccountsReceivableSchema }, AccountsReceivableController.delete)

   // Rota para liquidar uma conta a receber
   server.post('/:id/receive', { preHandler: authMiddleware, schema: receiveAccountsReceivableSchema }, AccountsReceivableController.receive)
}

export { accountReceivableRoutes }
