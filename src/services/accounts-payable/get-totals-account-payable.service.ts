import { PaymentStatus, PrismaClient } from '@prisma/client'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns'

const prisma = new PrismaClient()

export const getTotalsAccountPayableService = async () => {
   const today = new Date()

   const totalOverdue = await prisma.accountsPayable.aggregate({
      _sum: {
         value: true,
      },
      where: {
         dueDate: {
            lt: today,
         },
         status: {
            not: PaymentStatus.PAID,
         },
      },
   })

   const startOfCurrentMonth = startOfMonth(today)
   const endOfCurrentMonth = endOfMonth(today)

   const overdueThisMonth = await prisma.accountsPayable.aggregate({
      _sum: {
         value: true,
      },
      where: {
         dueDate: {
            gte: startOfCurrentMonth,
            lte: endOfCurrentMonth,
            lt: today,
         },
         status: {
            not: PaymentStatus.PAID,
         },
      },
   })

   const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 })
   const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 })

   const overdueThisWeek = await prisma.accountsPayable.aggregate({
      _sum: {
         value: true,
      },
      where: {
         dueDate: {
            gte: startOfCurrentWeek,
            lte: endOfCurrentWeek,
            lt: today,
         },
         status: {
            not: PaymentStatus.PAID,
         },
      },
   })

   const overdueToday = await prisma.accountsPayable.aggregate({
      _sum: {
         value: true,
      },
      where: {
         dueDate: {
            gte: startOfDay(today),
            lte: endOfDay(today),
            lt: today,
         },
         status: {
            not: PaymentStatus.PAID,
         },
      },
   })

   return {
      totalOverdue: totalOverdue._sum.value ? totalOverdue._sum.value / 100 : 0,
      overdueThisMonth: overdueThisMonth._sum.value ? overdueThisMonth._sum.value / 100 : 0,
      overdueThisWeek: overdueThisWeek._sum.value ? overdueThisWeek._sum.value / 100 : 0,
      overdueToday: overdueToday._sum.value ? overdueToday._sum.value / 100 : 0,
   }
}
