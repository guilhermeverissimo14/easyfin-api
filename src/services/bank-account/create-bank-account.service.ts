import { prisma } from '@/lib/prisma'

export const createBankAccountService = async (bankAccountData: { bank: string; agency: string; account: string; type: string }) => {
   const { bank, agency, account, type } = bankAccountData

   const existingBankAccount = await prisma.bankAccounts.findFirst({
      where: {
         bank,
         agency,
         account,
         type,
      },
   })

   if (existingBankAccount) {
      throw new Error('Já existe uma conta bancária com os mesmos dados. Caso deseje criar em uma variação diferente, altere o tipo da conta (C/P).')
   }

   try {
      const bankAccount = await prisma.bankAccounts.create({
         data: {
            ...bankAccountData,
         },
      })

      if (!bankAccount) {
         throw new Error('Erro ao criar a conta bancária')
      }

      await prisma.bankBalance.create({
         data: {
            bankAccountId: bankAccount.id,
            balance: 0,
         },
      })

      return bankAccount
   } catch (error) {
      console.error(error)
      throw new Error('Erro ao criar a conta bancária')
   }
}
