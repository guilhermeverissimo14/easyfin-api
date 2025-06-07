import AccountsPayableController from '@/controllers/accounts-payable.controller'
import {
   listAccountsPayableSchema,
   createAccountPayableSchema,
   getAccountsPayableByIdSchema,
   updateAccountsPayableSchema,
   deleteAccountsPayableSchema,
   getTotalsAccountPayableSchema,
   settleAccountsPayableSchema,
} from '@/documentation/account-payable.schemas'
import { authMiddleware } from '@/middleware/auth.middleware'
import { FastifyPluginAsync } from 'fastify'

const accountPayableRoutes: FastifyPluginAsync = async (server) => {
   // Rota para obter totais das contas a pagar
   server.get('/totals', { preHandler: authMiddleware, schema: getTotalsAccountPayableSchema }, AccountsPayableController.getTotals)

   // Rota para listar contas a pagar
   server.get('/', { preHandler: authMiddleware, schema: listAccountsPayableSchema }, AccountsPayableController.list)

   // Rota para criar conta a pagar
   server.post('/', { preHandler: authMiddleware, schema: createAccountPayableSchema }, AccountsPayableController.create)

   // Rota para listar uma conta a pagar
   server.get('/:id', { preHandler: authMiddleware, schema: getAccountsPayableByIdSchema }, AccountsPayableController.getById)

   // Rota para atualizar uma conta a pagar
   server.put('/:id', { preHandler: authMiddleware, schema: updateAccountsPayableSchema }, AccountsPayableController.update)

   // Rota para deletar uma conta a pagar
   server.delete('/:id', { preHandler: authMiddleware, schema: deleteAccountsPayableSchema }, AccountsPayableController.delete)

   // Rota para liquidar uma conta a pagar
   server.post('/:id/settle', { preHandler: authMiddleware, schema: settleAccountsPayableSchema }, AccountsPayableController.settle)
}

export { accountPayableRoutes }
