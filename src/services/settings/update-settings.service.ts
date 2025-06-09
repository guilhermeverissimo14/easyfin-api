import { CashType, PrismaClient } from '@prisma/client'
import { AppError } from '@/helpers/app-error'

const prisma = new PrismaClient()

export const updateSettingsService = async (updateData: { cashFlowDefault: CashType; bankAccountDefault?: string }) => {
   if (!updateData.cashFlowDefault) {
      throw new AppError('Dados insuficientes para atualizar as configurações', 400)
   }

   const settings = await prisma.settings.findFirst()

   if (!settings) {
      throw new AppError('Configurações não encontradas', 404)
   }

   if (updateData.cashFlowDefault === CashType.BANK && !updateData.bankAccountDefault) {
      throw new AppError('Conta bancária padrão é obrigatória para o tipo de fluxo de caixa BANK', 400)
   }

   if (updateData.cashFlowDefault === CashType.CASH && !updateData.bankAccountDefault) {
      const cashAccount = await prisma.cashBox.findFirst()

      if (!cashAccount) {
         throw new AppError('Conta de caixa padrão é obrigatória para o tipo de fluxo de caixa CASH', 400)
      }

      updateData.bankAccountDefault = cashAccount.id
   }

   const updatedSettings = await prisma.settings.update({
      where: { id: settings.id },
      data: {
         cashFlowDefault: updateData.cashFlowDefault as CashType,
         bankAccountDefault: updateData.bankAccountDefault,
      },
   })

   return updatedSettings
}
