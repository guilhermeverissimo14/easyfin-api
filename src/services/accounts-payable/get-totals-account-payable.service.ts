import { PaymentStatus } from '@prisma/client'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay } from 'date-fns'
import { getTodayInBrazilTimezone } from '@/utils/format'

import { prisma } from '@/lib/prisma'

export const getTotalsAccountPayableService = async () => {
   const today = getTodayInBrazilTimezone()

   const totalPayable = await prisma.accountsPayable.aggregate({
      _sum: {
         value: true,
      },
      where: {
         status: {
            not: PaymentStatus.PAID,
         },
      },
   })

   const totalOverdue = await prisma.accountsPayable.aggregate({
      _sum: {
         value: true,
      },
      where: {
         dueDate: {
            lt: startOfDay(today),
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
            lte: today,
         },
         status: {
            not: PaymentStatus.PAID,
         },
      },
   })

   return {
      totalPayable: totalPayable._sum.value ? totalPayable._sum.value / 100 : 0,
      totalOverdue: totalOverdue._sum.value ? totalOverdue._sum.value / 100 : 0,
      overdueThisMonth: overdueThisMonth._sum.value ? overdueThisMonth._sum.value / 100 : 0,
      overdueThisWeek: overdueThisWeek._sum.value ? overdueThisWeek._sum.value / 100 : 0,
      overdueToday: overdueToday._sum.value ? overdueToday._sum.value / 100 : 0,
   }
}
