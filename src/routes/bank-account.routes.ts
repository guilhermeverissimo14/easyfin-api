import BankAccountController from '@/controllers/bank-accounts.controller'
import {
   createBankAccountSchema,
   listBankAccountSchema,
   getBankAccountByIdSchema,
   updateBankAccountSchema,
   deleteBankAccountSchema,
} from '@/documentation/bank-account.schemas'
import { authMiddleware } from '@/middleware/auth.middleware'
import { FastifyPluginAsync } from 'fastify'

const bankAccountRoutes: FastifyPluginAsync = async (server) => {
   //Rota para listar contas bancárias
   server.get('/', { preHandler: authMiddleware, schema: listBankAccountSchema }, BankAccountController.list)

   //Rota para criar conta bancária
   server.post('/', { preHandler: authMiddleware, schema: createBankAccountSchema }, BankAccountController.create)

   //Rota para listar uma conta bancária
   server.get('/:id', { preHandler: authMiddleware, schema: getBankAccountByIdSchema }, BankAccountController.getById)

   //Rota para atualizar uma conta bancária
   server.put('/:id', { preHandler: authMiddleware, schema: updateBankAccountSchema }, BankAccountController.update)

   //Rota para deletar uma conta bancária
   server.delete('/:id', { preHandler: authMiddleware, schema: deleteBankAccountSchema }, BankAccountController.delete)
}

export { bankAccountRoutes }
