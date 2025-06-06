import { PaymentStatus, PrismaClient } from '@prisma/client'
import { AppError } from '@/helpers/app-error'

const prisma = new PrismaClient()

export const createAccountPayableService = async (data: {
   supplierId: string
   documentNumber: string
   documentDate: string
   launchDate?: string
   dueDate: string
   paymentDate?: string
   value: number
   paidValue?: number
   discount?: number
   fine?: number
   interest?: number
   installmentNumber?: number
   totalInstallments?: number
   costCenterId?: string
   plannedPaymentMethod?: string
   paymentMethodId?: string
   userId?: string
   observation?: string
   status?: string
}) => {
   const supplierExists = await prisma.supplier.findUnique({ where: { id: data.supplierId } })
   if (!supplierExists) {
      throw new AppError('Fornecedor não encontrado', 404)
   }

   try {
      const existingAccount = await prisma.accountsPayable.findFirst({
         where: {
            supplierId: data.supplierId,
            documentNumber: data.documentNumber,
            documentDate: new Date(data.documentDate),
            dueDate: new Date(data.dueDate),
         },
      })

      if (existingAccount) {
         throw new AppError(
            'Já existe uma conta a pagar com os mesmos dados. Caso deseje criar em uma variação diferente, altere o número da parcela ou a data de vencimento.',
            400,
         )
      }
   } catch (error) {
      console.log('Erro ao verificar conta a pagar existente:', error)
      throw new AppError('Erro ao verificar conta a pagar existente', 500)
   }

   try {
      const account = await prisma.accountsPayable.create({
         data: {
            supplierId: data.supplierId,
            documentNumber: data.documentNumber,
            documentDate: new Date(data.documentDate),
            launchDate: data.launchDate || new Date(),
            dueDate: new Date(data.dueDate),
            paymentDate: data.paymentDate ? new Date(data.paymentDate) : null,
            value: data.value * 100 || 0,
            paidValue: 0,
            discount: 0,
            fine: 0,
            interest: 0,
            installmentNumber: 1,
            totalInstallments: 1,
            costCenterId: data.costCenterId,
            plannedPaymentMethod: data.plannedPaymentMethod,
            paymentMethodId: data.plannedPaymentMethod || null,
            userId: data.userId,
            observation: data.observation || null,
            status: (data.status as PaymentStatus) || PaymentStatus.PENDING,
         },
      })

      return account
   } catch (error) {
      throw new AppError('Erro ao criar conta a pagar', 500)
   }
}
