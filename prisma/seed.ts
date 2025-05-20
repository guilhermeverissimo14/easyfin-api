import { PrismaClient } from '@prisma/client'
import { UserRole } from '@prisma/client/wasm'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

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
      { name: 'Despesas Administrativas' },
      { name: 'Despesas Bancárias' },
      { name: 'Despesas Combustíveis' },
      { name: 'Despesas Hospedagem' },
      { name: 'Despesas Refeição' },
      { name: 'Despesas Veículos' },
      { name: 'Fretes Transportes' },
      { name: 'Impostos FGTS' },
      { name: 'Impostos INSS' },
      { name: 'Impostos Simples' },
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

   const suppliers = [
      {
         cnpj: '12345678000195',
         name: 'Fornecedor 1',
         email: 'fornecedor1@email.com',
         phone: '11999999999',
         address: 'Rua A, 123',
         zipCode: '12345678',
         city: 'São Paulo',
         state: 'SP',
         country: 'Brasil',
         contact: 'Contato 1',
         retIss: false,
      },
      {
         cnpj: '98765432000196',
         name: 'Fornecedor 2',
         email: 'fornecedor2@email.com',
         phone: '11988888888',
         address: 'Rua B, 456',
         zipCode: '87654321',
         city: 'Rio de Janeiro',
         state: 'RJ',
         country: 'Brasil',
         contact: 'Contato 2',
         retIss: true,
      },
   ]

   for (const supplier of suppliers) {
      const existingSupplier = await prisma.supplier.findUnique({
         where: {
            cnpj: supplier.cnpj,
         },
      })

      if (!existingSupplier) {
         await prisma.supplier.create({
            data: supplier,
         })
         console.log(`Fornecedor criado: ${supplier.name}`)
      } else {
         console.log(`Fornecedor já existe: ${supplier.name}`)
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
