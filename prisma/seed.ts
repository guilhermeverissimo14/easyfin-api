import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client/wasm'
import * as bcrypt from 'bcrypt'

async function main() {
   const userExists = await prisma.user.findUnique({
      where: {
         email: 'admineasyfin@gmail.com',
      },
   })

   if (!userExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10)

      const admin = await prisma.user.create({
         data: {
            name: 'Easyfin',
            email: 'admineasyfin@gmail.com',
            password: hashedPassword,
            role: UserRole.ADMIN,
         },
      })

      console.log(`Usuário admin criado: ${admin.email}`)
   } else {
      console.log('Usuário admin já existe')
   }

   const costCenters = [
      { name: 'Compras de Materiais' },
      { name: 'Fretes Transportes' },
      { name: 'Impostos FGTS' },
      { name: 'Impostos INSS' },
      { name: 'Impostos Simples' },
      { name: 'Infraestrutura' },
      { name: 'Saldo Inicial' },
      { name: 'Ajustes de Saldo' },
      { name: 'Despesas Administrativas' },
      { name: 'Despesas Bancárias' },
      { name: 'Despesas com Combustíveis' },
      { name: 'Despesas com Hospedagem' },
      { name: 'Despesas com Refeição' },
      { name: 'Despesas com Veículos' },
      { name: 'Despesas com Marketing' },
      { name: 'Despesas com Vendas' },
      { name: 'Despesas com Serviços' },
      { name: 'Despesas com Telefonia' },
      { name: 'Despesas com Internet' },
      { name: 'Despesas com Energia' },
      { name: 'Despesas com Água' },
      { name: 'Despesas com Aluguel' },
      { name: 'Despesas com Manutenção' },
      { name: 'Despesas com Limpeza' },
      { name: 'Despesas com Segurança' },
      { name: 'Manutenção' },
      { name: 'Outras Despesas' },
      { name: 'Transações Bancárias' },
      { name: 'Transações de Caixa' },
      { name: 'Recebimentos a Vista' },
      { name: 'Recebimentos a Prazo' },
      { name: 'Outros Recebimentos' },
      { name: 'Outros Pagamentos' },
   ]

   for (const costCenter of costCenters) {
      const existingCostCenter = await prisma.costCenter.findFirst({
         where: {
            name: costCenter.name,
         },
      })

      if (!existingCostCenter) {
         await prisma.costCenter.create({
            data: costCenter,
         })
         console.log(`Centro de custo criado: ${costCenter.name}`)
      } else {
         console.log(`Centro de custo já existe: ${costCenter.name}`)
      }
   }

   // const customers = [
   //    {
   //       cnpj: '12.345.678/0001-90',
   //       name: 'Empresa Exemplo Ltda',
   //       email: 'contato@empresaexemplo.com.br',
   //       phone: '(11) 1234-5678',
   //       address: 'Rua Exemplo, 123',
   //       zipCode: '01234-567',
   //       city: 'São Paulo',
   //       state: 'SP',
   //       country: 'Brasil',
   //       contact: 'João da Silva',
   //       retIss: false,
   //    },
   // ]

   // for (const customer of customers) {
   //    const existingCustomer = await prisma.customer.findUnique({
   //       where: {
   //          cnpj: customer.cnpj,
   //       },
   //    })

   //    if (!existingCustomer) {
   //       await prisma.customer.create({
   //          data: customer,
   //       })
   //       console.log(`Cliente criado: ${customer.name}`)
   //    } else {
   //       console.log(`Cliente já existe: ${customer.name}`)
   //    }
   // }

   // const suppliers = [
   //    {
   //       cnpj: '12345678000195',
   //       name: 'Fornecedor 1',
   //       email: 'fornecedor1@email.com',
   //       phone: '11999999999',
   //       address: 'Rua A, 123',
   //       zipCode: '12345678',
   //       city: 'São Paulo',
   //       state: 'SP',
   //       country: 'Brasil',
   //       contact: 'Contato 1',
   //       retIss: false,
   //    },
   //    {
   //       cnpj: '98765432000196',
   //       name: 'Fornecedor 2',
   //       email: 'fornecedor2@email.com',
   //       phone: '11988888888',
   //       address: 'Rua B, 456',
   //       zipCode: '87654321',
   //       city: 'Rio de Janeiro',
   //       state: 'RJ',
   //       country: 'Brasil',
   //       contact: 'Contato 2',
   //       retIss: true,
   //    },
   // ]

   // for (const supplier of suppliers) {
   //    const existingSupplier = await prisma.supplier.findUnique({
   //       where: {
   //          cnpj: supplier.cnpj,
   //       },
   //    })

   //    if (!existingSupplier) {
   //       await prisma.supplier.create({
   //          data: supplier,
   //       })
   //       console.log(`Fornecedor criado: ${supplier.name}`)
   //    } else {
   //       console.log(`Fornecedor já existe: ${supplier.name}`)
   //    }
   // }

   const taxRates = [
      {
         year: 2024,
         month: 7,
         issqnTaxRate: 4.89,
         effectiveTaxRate: 14.6,
      },
      {
         year: 2024,
         month: 8,
         issqnTaxRate: 5,
         effectiveTaxRate: 14.93,
      },
      {
         year: 2024,
         month: 9,
         issqnTaxRate: 5,
         effectiveTaxRate: 15.19,
      },
      {
         year: 2024,
         month: 10,
         issqnTaxRate: 5,
         effectiveTaxRate: 15,
      },
      {
         year: 2024,
         month: 11,
         issqnTaxRate: 4.77,
         effectiveTaxRate: 15,
      },
      {
         year: 2024,
         month: 12,
         issqnTaxRate: 4.87,
         effectiveTaxRate: 15,
      },
      {
         year: 2025,
         month: 1,
         issqnTaxRate: 4.61,
         effectiveTaxRate: 15,
      },
      {
         year: 2025,
         month: 7,
         issqnTaxRate: 3,
         effectiveTaxRate: 2,
      },
      {
         year: 2025,
         month: 8,
         issqnTaxRate: 5,
         effectiveTaxRate: 16.71,
      },
   ]

   for (const taxRate of taxRates) {
      const existingTaxRate = await prisma.taxRates.findFirst({
         where: {
            year: taxRate.year,
            month: taxRate.month,
         },
      })

      if (!existingTaxRate) {
         await prisma.taxRates.create({
            data: taxRate,
         })
         console.log(`Taxa criada: ${taxRate.year}-${taxRate.month}`)
      } else {
         console.log(`Taxa já existe: ${taxRate.year}-${taxRate.month}`)
      }
   }

   const cashBoxes = [
      {
         name: 'Caixa Geral',
         balance: 0,
      },
   ]

   for (const cashBox of cashBoxes) {
      const existingCashBox = await prisma.cashBox.findFirst({
         where: {
            name: cashBox.name,
         },
      })

      if (!existingCashBox) {
         const cash = await prisma.cashBox.create({
            data: cashBox,
         })
         console.log(`Caixa criado: ${cashBox.name}`)

         const cashTransaction = await prisma.cashTransaction.create({
            data: {
               cashBoxId: cash.id,
               type: 'CREDIT',
               description: 'Saldo inicial',
               amount: cashBox.balance,
               transactionAt: new Date(),
            },
         })
         console.log(`Transação de caixa criada: ${cashTransaction.description}`)

         const costCenter = await prisma.costCenter.findFirst({
            where: {
               name: 'Saldo Inicial',
            },
         })

         await prisma.cashFlow.create({
            data: {
               date: new Date(new Date().setHours(3, 0, 0, 0)),
               historic: 'Saldo inicial',
               cashBoxId: cash.id,
               costCenterId: costCenter!.id,
               type: 'CREDIT',
               description: 'Ajuste de saldo inicial',
               value: cashBox.balance,
               balance: cashBox.balance,
            },
         })
         console.log(`Fluxo de caixa criado: ${cashBox.name} - Saldo inicial: ${cashBox.balance}`)
      } else {
         console.log(`Caixa já existe: ${cashBox.name}`)
      }
   }

   // const bankAccounts = [
   //    {
   //       bank: 'Banco do Brasil',
   //       agency: '1234',
   //       account: '56789-0',
   //       type: 'C',
   //    },
   // ]

   // for (const bankAccount of bankAccounts) {
   //    const existingBankAccount = await prisma.bankAccounts.findFirst({
   //       where: {
   //          bank: bankAccount.bank,
   //          agency: bankAccount.agency,
   //          account: bankAccount.account,
   //       },
   //    })

   //    if (!existingBankAccount) {
   //       const bank = await prisma.bankAccounts.create({
   //          data: bankAccount,
   //       })
   //       console.log(`Conta bancária criada: ${bankAccount.bank} - ${bankAccount.agency} - ${bankAccount.account}`)

   //       const bankTransaction = await prisma.bankTransactions.create({
   //          data: {
   //             bankAccountId: bank!.id,
   //             type: 'CREDIT',
   //             description: 'Ajuste de Saldo inicial',
   //             detailing: 'Saldo inicial da conta bancária',
   //             amount: 0,
   //             transactionAt: new Date(),
   //             csv: false,
   //          },
   //       })
   //       console.log(`Transação bancária inicial criada: ${bankTransaction.description}`)

   //       const costCenter = await prisma.costCenter.findFirst({
   //          where: {
   //             name: 'Saldo Inicial',
   //          },
   //       })

   //       await prisma.cashFlow.create({
   //          data: {
   //             date: new Date(new Date().setHours(3, 0, 0, 0)),
   //             historic: 'Saldo inicial',
   //             bankAccountId: bank!.id,
   //             costCenterId: costCenter!.id,
   //             type: 'CREDIT',
   //             description: 'Ajuste de saldo inicial',
   //             value: bankTransaction.amount,
   //             balance: bankTransaction.amount,
   //          },
   //       })
   //    } else {
   //       console.log(`Conta bancária já existe: ${bankAccount.bank} - ${bankAccount.agency} - ${bankAccount.account}`)
   //    }
   // }

   // const bank = await prisma.bankAccounts.findFirst()

   // const initialBalance = [
   //    {
   //       bankAccountId: bank!.id,
   //       balance: 0,
   //    },
   // ]

   // await prisma.bankBalance.create({
   //    data: initialBalance[0],
   // })
   // console.log(`Saldo inicial criado: ${initialBalance[0].balance}`)

   const paymentMethods = [
      {
         name: 'Boleto',
      },
      {
         name: 'Dinheiro',
         requiresBank: false,
      },
      {
         name: 'Cartão de Crédito',
      },
      {
         name: 'Cartão de Débito',
      },
      {
         name: 'Pix',
      },
      {
         name: 'Transferência Bancária',
      },
   ]

   for (const paymentMethod of paymentMethods) {
      const existingPaymentMethod = await prisma.paymentMethod.findFirst({
         where: {
            name: paymentMethod.name,
         },
      })

      if (!existingPaymentMethod) {
         await prisma.paymentMethod.create({
            data: paymentMethod,
         })
         console.log(`Método de pagamento criado: ${paymentMethod.name}`)
      } else {
         console.log(`Método de pagamento já existe: ${paymentMethod.name}`)
      }
   }

   const paymentMethodBoleto = await prisma.paymentMethod.findFirst({
      where: {
         name: 'Boleto',
      },
   })

   const paymentMethodCardCredit = await prisma.paymentMethod.findFirst({
      where: {
         name: 'Cartão de Crédito',
      },
   })

   const paymentTerms = [
      {
         paymentMethodId: paymentMethodBoleto!.id,
         condition: '0,7,14',
         description: 'Boleto 07 dias',
         installments: 3,
      },
      {
         paymentMethodId: paymentMethodBoleto!.id,
         condition: '8,16',
         description: 'Boleto 08 dias',
         installments: 2,
      },
      {
         paymentMethodId: paymentMethodBoleto!.id,
         condition: '0,10,20',
         description: 'Boleto 10 dias',
         installments: 3,
      },
      {
         paymentMethodId: paymentMethodBoleto!.id,
         condition: '0,14,28',
         description: 'Boleto 14 dias',
         installments: 3,
      },
      {
         paymentMethodId: paymentMethodBoleto!.id,
         condition: '0,15,30',
         description: 'Boleto 15 dias',
         installments: 3,
      },
      {
         paymentMethodId: paymentMethodBoleto!.id,
         condition: '30,60,90,120',
         description: 'Boleto 30 dias',
         installments: 4,
      },
      {
         paymentMethodId: paymentMethodBoleto!.id,
         condition: '30,60',
         description: 'Boleto 30,60 dias',
         installments: 4,
      },
      {
         paymentMethodId: paymentMethodBoleto!.id,
         condition: '180',
         description: 'Boleto 180 dias',
         installments: 4,
      },
      {
         paymentMethodId: paymentMethodCardCredit!.id,
         condition: '30,60,90',
         description: 'Crédito (3x)',
         installments: 3,
      },
   ]

   for (const paymentTerm of paymentTerms) {
      const existingPaymentTerm = await prisma.paymentTerms.findFirst({
         where: {
            condition: paymentTerm.condition,
         },
      })
      if (!existingPaymentTerm) {
         await prisma.paymentTerms.create({
            data: paymentTerm,
         })
         console.log(`Condição de pagamento criada: ${paymentTerm.description}`)
      } else {
         console.log(`Condição de pagamento já existe: ${paymentTerm.description}`)
      }
   }
}

main()
   .catch((e) => {
      console.error(e)
      process.exit(1)
   })
   .finally(async () => {
      await prisma.$disconnect()
   })
