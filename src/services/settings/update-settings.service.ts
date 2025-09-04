import { CashType } from '@prisma/client'
import { AppError } from '@/helpers/app-error'
import { prisma } from '@/lib/prisma'

export const updateSettingsService = async (
   userId: string, 
   updateData: { 
      cashFlowDefault?: CashType; 
      bankAccountDefault?: string;
      showClock?: boolean;
   }
) => {
   if (!updateData.cashFlowDefault) {
      throw new AppError('Dados insuficientes para atualizar as configurações', 400)
   }

   const settings = await prisma.settings.findUnique({
      where: { userId }
   })

   if (!settings) {
      return await prisma.settings.create({
         data: {
            userId,
            cashFlowDefault: updateData.cashFlowDefault || 'CASH',
            bankAccountDefault: updateData.bankAccountDefault,
            showClock: updateData.showClock ?? true
         }
      })
   }

   const updatedSettings = await prisma.settings.update({
      where: { userId },
      data: {
         ...(updateData.cashFlowDefault && { cashFlowDefault: updateData.cashFlowDefault }),
         ...(updateData.bankAccountDefault !== undefined && { bankAccountDefault: updateData.bankAccountDefault }),
         ...(updateData.showClock !== undefined && { showClock: updateData.showClock })
      },
   })

   return updatedSettings
}
