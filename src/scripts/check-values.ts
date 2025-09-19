import '@/config/module-alias';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkValues() {
  try {
    const invoices = await prisma.invoice.findMany({
      select: {
        invoiceNumber: true,
        serviceValue: true,
        netValue: true
      },
      take: 10,
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('📊 Últimas 10 faturas:');
    console.log('Número | Service Value | Net Value');
    console.log('-------|---------------|----------');
    
    invoices.forEach(invoice => {
      console.log(`${invoice.invoiceNumber.padEnd(6)} | ${String(invoice.serviceValue).padEnd(13)} | ${invoice.netValue || 'null'}`);
    });

    // Verificar também algumas faturas específicas da planilha
    const specificInvoices = await prisma.invoice.findMany({
      where: {
        invoiceNumber: {
          in: ['2025/135', '2025/136', '2025/137']
        }
      },
      select: {
        invoiceNumber: true,
        serviceValue: true,
        netValue: true
      }
    });

    console.log('\n📋 Faturas específicas da planilha:');
    console.log('Número | Service Value | Net Value');
    console.log('-------|---------------|----------');
    
    specificInvoices.forEach(invoice => {
      console.log(`${invoice.invoiceNumber.padEnd(6)} | ${String(invoice.serviceValue).padEnd(13)} | ${invoice.netValue || 'null'}`);
    });

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkValues();