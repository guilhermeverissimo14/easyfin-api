import { PaymentStatus, PrismaClient } from '@prisma/client'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns'

const prisma = new PrismaClient()

export const getTotalsAccountReceivableService = async () => {
   const today = new Date()

   const totalReceived = await prisma.accountsReceivable.aggregate({
      _sum: {
         receivedValue: true,
      },
      where: {
         receiptDate: {
            lt: today,
         },
         status: PaymentStatus.PAID,
      },
   })

   const startOfCurrentMonth = startOfMonth(today)
   const endOfCurrentMonth = endOfMonth(today)

   const receivedThisMonth = await prisma.accountsReceivable.aggregate({
      _sum: {
         receivedValue: true,
      },
      where: {
         receiptDate: {
            gte: startOfCurrentMonth,
            lte: endOfCurrentMonth,
            lt: today,
         },
         status: PaymentStatus.PAID,
      },
   })

   const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 })
   const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 })

   const receivedThisWeek = await prisma.accountsReceivable.aggregate({
      _sum: {
         receivedValue: true,
      },
      where: {
         receiptDate: {
            gte: startOfCurrentWeek,
            lte: endOfCurrentWeek,
            lt: today,
         },
         status: PaymentStatus.PAID,
      },
   })

   const receivedToday = await prisma.accountsReceivable.aggregate({
      _sum: {
         receivedValue: true,
      },
      where: {
         receiptDate: {
            gte: startOfDay(today),
            lte: endOfDay(today),
            lt: today,
         },
         status: PaymentStatus.PAID,
      },
   })

   return {
      totalReceived: totalReceived._sum.receivedValue ? totalReceived._sum.receivedValue / 100 : 0,
      receivedThisMonth: receivedThisMonth._sum.receivedValue ? receivedThisMonth._sum.receivedValue / 100 : 0,
      receivedThisWeek: receivedThisWeek._sum.receivedValue ? receivedThisWeek._sum.receivedValue / 100 : 0,
      receivedToday: receivedToday._sum.receivedValue ? receivedToday._sum.receivedValue / 100 : 0,
   }
}
