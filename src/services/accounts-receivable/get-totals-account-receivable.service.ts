import { PaymentStatus } from '@prisma/client'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns'
import { getTodayInBrazilTimezone } from '@/utils/format'
import { prisma } from '@/lib/prisma'

export const getTotalsAccountReceivableService = async () => {
   const today = getTodayInBrazilTimezone()

   const totalReceivable = await prisma.accountsReceivable.aggregate({
      _sum: {
         value: true,
      },
      where: {
         status: PaymentStatus.PENDING,
      },
   })

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

   const totalDueReceivable = await prisma.accountsReceivable.aggregate({
      _sum: {
         value: true,
      },
      where: {
         dueDate: {
            lt: startOfDay(today),
         },
         status: PaymentStatus.PENDING,
      },
   })

   const startOfCurrentMonth = startOfMonth(today)
   const endOfCurrentMonth = endOfMonth(today)

   const receivedThisMonth = await prisma.accountsReceivable.aggregate({
      _sum: {
         value: true,
      },
      where: {
         dueDate: {
            gte: startOfCurrentMonth,
            lte: endOfCurrentMonth,
         },
         status: PaymentStatus.PENDING,
      },
   })

   const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 })
   const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 })

   const receivedThisWeek = await prisma.accountsReceivable.aggregate({
      _sum: {
         value: true,
      },
      where: {
         dueDate: {
            gte: startOfCurrentWeek,
            lte: endOfCurrentWeek,
         },
         status: PaymentStatus.PENDING,
      },
   })

   const receivedToday = await prisma.accountsReceivable.aggregate({
      _sum: {
         value: true,
      },
      where: {
         dueDate: {
            gte: startOfDay(today),
            lte: endOfDay(today),
         },
         status: PaymentStatus.PENDING,
      },
   })

   return {
      totalReceivable: totalReceivable._sum.value ? totalReceivable._sum.value / 100 : 0,
      totalDueReceivable: totalDueReceivable._sum.value ? totalDueReceivable._sum.value / 100 : 0,
      totalReceived: totalReceived._sum.receivedValue ? totalReceived._sum.receivedValue / 100 : 0,
      receivedThisMonth: receivedThisMonth._sum.value ? receivedThisMonth._sum.value / 100 : 0,
      receivedThisWeek: receivedThisWeek._sum.value ? receivedThisWeek._sum.value / 100 : 0,
      receivedToday: receivedToday._sum.value ? receivedToday._sum.value / 100 : 0,
   }
}
