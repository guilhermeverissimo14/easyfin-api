import '@/config/module-alias';
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import path from 'path';
import { createInvoiceService } from '@/services/invoice/create-invoice.service';
import { updateInvoiceService } from '@/services/invoice/update-invoice.service';
import { receiveAccountReceivableService } from '@/services/accounts-receivable/receive-account-receivable.service';

console.log('🚀 Iniciando script de importação de faturas...');

const prisma = new PrismaClient();

interface InvoiceData {
  notaFiscal: string;
  cliente: string;
  condPagto: string;
  emissao: Date;
  vencimento: Date;
  valorServico: number;
  statusCliente: string;
  clienteRetem: string;
  aliquotaIss: number;
  aliquotaEfetiva: number;
  valorIss: number;
  valorLiquido: number;
  impostoEfetivo: number;
  statusContasReceber: string;
}

// Função para converter valor monetário string para centavos
function parseMonetaryValue(value: any): number {
  if (typeof value === 'number') {
    return value; // Converte para centavos
  }

  if (typeof value === 'string') {
    // Remove caracteres não numéricos exceto vírgula e ponto
    const cleanValue = value.replace(/[^\d,.-]/g, '');
    // Substitui vírgula por ponto para conversão
    const normalizedValue = cleanValue.replace(',', '.');
    const numericValue = parseFloat(normalizedValue);
    return isNaN(numericValue) ? 0 : numericValue; // Converte para centavos
  }

  return 0;
}

// Função para converter porcentagem para decimal
function parsePercentage(value: any): number {
  if (typeof value === 'number') {
    return value > 1 ? value / 100 : value; // Se maior que 1, assume que está em %
  }

  if (typeof value === 'string') {
    const cleanValue = value.replace(/[^\d,.-]/g, '');
    const normalizedValue = cleanValue.replace(',', '.');
    const numericValue = parseFloat(normalizedValue);
    if (isNaN(numericValue)) return 0;
    return numericValue;
  }

  return 0;
}

// Função para converter data do Excel
function parseExcelDate(value: any): Date {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'number') {
    // Data do Excel (número de dias desde 1900-01-01)
    const excelEpoch = new Date(1900, 0, 1);
    const date = new Date(excelEpoch.getTime() + (value - 2) * 24 * 60 * 60 * 1000);
    return date;
  }

  if (typeof value === 'string') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? new Date() : date;
  }

  return new Date();
}

// Função para normalizar string (remove acentos, espaços extras, caracteres especiais)
function normalizeString(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s]/g, '') // Remove caracteres especiais exceto letras, números e espaços
    .replace(/\s+/g, ' ') // Substitui múltiplos espaços por um só
    .trim();
}

// Função para buscar cliente por nome
async function findCustomerByName(customerName: string): Promise<string | null> {
  try {
    const normalizedSearchName = normalizeString(customerName);
    console.log(`🔍 Buscando cliente: "${customerName}" (normalizado: "${normalizedSearchName}")`);

    // Primeiro tenta busca exata
    let customer = await prisma.customer.findFirst({
      where: {
        name: {
          equals: customerName.trim(),
          mode: 'insensitive'
        }
      },
      select: { id: true, name: true }
    });

    if (customer) {
      console.log(`✓ Cliente encontrado (busca exata): ${customer.name} -> ${customer.id}`);
      return customer.id;
    }

    // Se não encontrou, busca todos os clientes e compara normalizado
    const allCustomers = await prisma.customer.findMany({
      select: { id: true, name: true }
    });

    for (const dbCustomer of allCustomers) {
      const normalizedDbName = normalizeString(dbCustomer.name);
      if (normalizedDbName === normalizedSearchName) {
        console.log(`✓ Cliente encontrado (busca normalizada): ${dbCustomer.name} -> ${dbCustomer.id}`);
        return dbCustomer.id;
      }
    }

    // Se ainda não encontrou, tenta busca por contains
    customer = await prisma.customer.findFirst({
      where: {
        name: {
          contains: customerName.trim(),
          mode: 'insensitive'
        }
      },
      select: { id: true, name: true }
    });

    if (customer) {
      console.log(`✓ Cliente encontrado (busca contains): ${customer.name} -> ${customer.id}`);
      return customer.id;
    }

    console.log(`✗ Cliente não encontrado: "${customerName}"`);
    console.log(`   Clientes disponíveis com nomes similares:`);

    // Mostra clientes similares para debug
    const similarCustomers = allCustomers.filter(c =>
      normalizeString(c.name).includes(normalizedSearchName.split(' ')[0]) ||
      normalizedSearchName.includes(normalizeString(c.name).split(' ')[0])
    ).slice(0, 3);

    similarCustomers.forEach(c => {
      console.log(`   - "${c.name}" (normalizado: "${normalizeString(c.name)}")`);
    });

    return null;
  } catch (error) {
    console.error(`Erro ao buscar cliente "${customerName}":`, error);
    return null;
  }
}

// Função para processar recebimento de contas a receber quando status for "Recebido"
async function processAccountReceivablePayment(invoiceNumber: string, customerId: string, dueDate: Date): Promise<void> {
  try {
    // Busca a fatura para obter a condição de pagamento
    const invoice = await prisma.invoice.findFirst({
      where: {
        invoiceNumber: invoiceNumber,
        customerId: customerId
      },
      include: {
        PaymentCondition: {
          include: {
            paymentMethod: true
          }
        }
      }
    });

    if (!invoice) {
      console.log(`⚠️  Fatura ${invoiceNumber} não encontrada`);
      return;
    }

    // Busca as contas a receber criadas para esta fatura
    const accountsReceivable = await prisma.accountsReceivable.findMany({
      where: {
        documentNumber: invoiceNumber,
        customerId: customerId,
        status: 'PENDING' // Só processa se ainda estiver pendente
      }
    });

    if (accountsReceivable.length === 0) {
      console.log(`⚠️  Nenhuma conta a receber pendente encontrada para a fatura ${invoiceNumber}`);
      return;
    }

    // Obtém o paymentMethodId da condição de pagamento da fatura
    const paymentMethodId = invoice.PaymentCondition.paymentMethodId;
    console.log(`📋 Usando método de pagamento da condição: ${invoice.PaymentCondition.paymentMethod.name} (${paymentMethodId})`);

    // Processa cada conta a receber (pode ter múltiplas parcelas)
    for (const account of accountsReceivable) {
      // Usa a data de vencimento da conta a receber como receiptDate
      const receiptDate = account.dueDate || dueDate;
      
      await receiveAccountReceivableService(account.id, {
        fine: 0,
        interest: 0,
        discount: 0,
        observation: 'Recebimento automático via importação',
        paymentMethodId: paymentMethodId,
        receiptDate: receiptDate, // Usa a data de vencimento da conta a receber
        costCenterId: undefined,
        bankAccountId: '8225b613-5930-4593-adb5-c638abf1ac57',
        generateCashFlow: false
      });

      console.log(`✅ Conta a receber ${account.id} marcada como recebida automaticamente (vencimento: ${receiptDate.toLocaleDateString()})`);
    }
  } catch (error: any) {
    console.error(`❌ Erro ao processar recebimento da fatura ${invoiceNumber}:`, error.message);
    throw error;
  }
}

// Função para buscar condição de pagamento por nome
async function findPaymentTermByName(paymentTermName: string): Promise<string | null> {
  try {
    const normalizedSearchTerm = normalizeString(paymentTermName);
    console.log(`🔍 Buscando condição de pagamento: "${paymentTermName}" (normalizado: "${normalizedSearchTerm}")`);

    // Primeiro tenta busca exata
    let paymentTerm = await prisma.paymentTerms.findFirst({
      where: {
        description: {
          equals: paymentTermName.trim(),
          mode: 'insensitive'
        }
      },
      select: { id: true, description: true }
    });

    if (paymentTerm) {
      console.log(`✓ Condição de pagamento encontrada (busca exata): ${paymentTerm.description || 'N/A'} -> ${paymentTerm.id}`);
      return paymentTerm.id;
    }

    // Se não encontrou, busca todas as condições e compara normalizado
    const allPaymentTerms = await prisma.paymentTerms.findMany({
      select: { id: true, description: true }
    });

    for (const dbTerm of allPaymentTerms) {
      const normalizedDbTerm = normalizeString(dbTerm!.description || '');
      if (normalizedDbTerm === normalizedSearchTerm) {
        console.log(`✓ Condição de pagamento encontrada (busca normalizada): ${dbTerm.description || 'N/A'} -> ${dbTerm.id}`);
        return dbTerm.id;
      }
    }

    // Se ainda não encontrou, tenta busca por contains
    paymentTerm = await prisma.paymentTerms.findFirst({
      where: {
        description: {
          contains: paymentTermName.trim(),
          mode: 'insensitive'
        }
      },
      select: { id: true, description: true }
    });

    if (paymentTerm) {
      console.log(`✓ Condição de pagamento encontrada (busca contains): ${paymentTerm.description || 'N/A'} -> ${paymentTerm.id}`);
      return paymentTerm.id;
    }

    console.log(`✗ Condição de pagamento não encontrada: "${paymentTermName}"`);
    console.log(`   Condições disponíveis:`);

    // Mostra condições similares para debug
    allPaymentTerms.slice(0, 5).forEach(term => {
      console.log(`   - "${term.description || 'N/A'}" (normalizado: "${normalizeString(term.description || '')}")`);
    });

    return null;
  } catch (error) {
    console.error(`Erro ao buscar condição de pagamento "${paymentTermName}":`, error);
    return null;
  }
}

// Função principal de importação
async function importInvoices() {
  try {
    console.log('🚀 Iniciando importação de faturas...\n');

    // Carrega a planilha
    const filePath = path.join(process.cwd(), 'import.xlsx');
    const workbook = XLSX.readFile(filePath);

    // Lê a segunda aba (índice 1)
    const sheetNames = workbook.SheetNames;
    if (sheetNames.length < 2) {
      throw new Error('A planilha deve ter pelo menos 2 abas');
    }

    const worksheet = workbook.Sheets[sheetNames[1]]; // Segunda aba
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📊 Encontradas ${jsonData.length} linhas na segunda aba\n`);

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as any;

      try {
        // Mapeia os dados da planilha
        const invoiceData: InvoiceData = {
          notaFiscal: row['Nota Fiscal']?.toString() || '',
          cliente: row['Cliente']?.toString() || '',
          condPagto: row['Cond. Pagto']?.toString() || '',
          emissao: parseExcelDate(row['Emissão']),
          vencimento: parseExcelDate(row['Vencimento']),
          valorServico: parseMonetaryValue(row['Valor Serviço']),
          statusCliente: row['Status Cliente']?.toString() || '',
          clienteRetem: row['Cliente Retém']?.toString() || '',
          aliquotaIss: parsePercentage(row['Alíquota ISS']),
          aliquotaEfetiva: parsePercentage(row['Alíquota Efetiva']),
          valorIss: parseMonetaryValue(row['Valor do ISS']),
          valorLiquido: parseMonetaryValue(row['Valor líquido']),
          impostoEfetivo: parseMonetaryValue(row['Imp. Efetivo']),
          statusContasReceber: row['Status Contas a Receber']?.toString() || ''
        };

        // Debug para faturas de 2024
        if (invoiceData.notaFiscal?.startsWith('2024')) {
          console.log(`🔍 DEBUG Fatura ${invoiceData.notaFiscal}:`);
          console.log(`   - Emissão (raw): ${row['Emissão']} -> Parseado: ${invoiceData.emissao}`);
          console.log(`   - Vencimento (raw): ${row['Vencime']} -> Parseado: ${invoiceData.vencimento}`);
          console.log(`   - Valor Serviço (raw): ${row['Valor Serv']} -> Parseado: ${invoiceData.valorServico}`);
          console.log(`   - Cliente retém (raw): "${row['Cliente retém']}" -> Parseado: ${invoiceData.clienteRetem}`);
        }

        // Validações básicas
        if (!invoiceData.notaFiscal || !invoiceData.cliente) {
          console.log(`⚠️  Linha ${i + 2}: Dados obrigatórios faltando (Nota Fiscal ou Cliente)`);
          skipped++;
          continue;
        }

        // Busca o cliente
        const customerId = await findCustomerByName(invoiceData.cliente);
        if (!customerId) {
          console.log(`⚠️  Linha ${i + 2}: Cliente "${invoiceData.cliente}" não encontrado - IGNORANDO`);
          skipped++;
          continue;
        }

        // Busca a condição de pagamento
        const paymentConditionId = await findPaymentTermByName(invoiceData.condPagto);
        if (!paymentConditionId) {
          console.log(`⚠️  Linha ${i + 2}: Condição de pagamento "${invoiceData.condPagto}" não encontrada - IGNORANDO`);
          skipped++;
          continue;
        }

        // Prepara os dados para o serviço create-invoice
        const invoiceServiceData = {
          invoiceNumber: invoiceData.notaFiscal,
          customerId: customerId,
          paymentConditionId: paymentConditionId,
          issueDate: invoiceData.emissao.toISOString(),
          serviceValue: invoiceData.valorServico, // parseMonetaryValue já retorna em centavos
          retainsIss: invoiceData.clienteRetem.toLowerCase().trim() === 'sim',
          notes: invoiceData.statusContasReceber
        };

        // Verifica se a fatura já existe
        const existingInvoice = await prisma.invoice.findFirst({
          where: {
            invoiceNumber: invoiceData.notaFiscal,
            customerId: customerId
          }
        });

        let invoice;
        if (existingInvoice) {
          // Verifica se os valores estão zerados ou diferentes e atualiza
          const needsUpdate = existingInvoice.serviceValue === 0 ||
            existingInvoice.netValue === 0 ||
            Math.abs(existingInvoice.serviceValue - (invoiceData.valorServico)) > 1; // Tolerância de 1 centavo

          if (needsUpdate) {
            // Atualiza a fatura existente com os valores corretos
            const updateData = {
              id: existingInvoice.id,
              serviceValue: invoiceData.valorServico, // parseMonetaryValue já retorna em centavos
              retainsIss: invoiceData.clienteRetem.toLowerCase().trim() === 'sim',
              notes: invoiceData.statusContasReceber
            };

            invoice = await updateInvoiceService(updateData);
            console.log(`🔄 Linha ${i + 2}: Fatura ${invoiceData.notaFiscal} atualizada com valores corretos (ID: ${invoice.id})`);
            imported++;

            // Verifica se o status é "Recebido" e processa o recebimento automaticamente
            if (invoiceData.statusContasReceber.toLowerCase().trim() === 'recebido') {
              console.log(`💰 Processando recebimento automático para fatura atualizada ${invoiceData.notaFiscal}...`);
              await processAccountReceivablePayment(invoiceData.notaFiscal, customerId, invoiceData.vencimento);
            }
          } else {
            console.log(`⚠️  Linha ${i + 2}: Fatura ${invoiceData.notaFiscal} já existe com valores corretos - IGNORANDO`);
            skipped++;
          }
        } else {
          // Cria nova fatura usando o serviço
          invoice = await createInvoiceService(invoiceServiceData);
          console.log(`✅ Linha ${i + 2}: Fatura ${invoiceData.notaFiscal} importada com sucesso (ID: ${invoice.id})`);
          imported++;
        }

        // Verifica se o status é "Recebido" e processa o recebimento automaticamente
        if (invoiceData.statusContasReceber.toLowerCase().trim() === 'recebido') {
          console.log(`💰 Processando recebimento automático para fatura ${invoiceData.notaFiscal}...`);
          await processAccountReceivablePayment(invoiceData.notaFiscal, customerId, invoiceData.vencimento);
        }

      } catch (error: any) {
        console.error(`❌ Linha ${i + 2}: Erro ao processar fatura:`, error.message);
        errors++;
      }
    }

    console.log('\n📈 RESUMO DA IMPORTAÇÃO:');
    console.log(`✅ Faturas criadas/atualizadas: ${imported}`);
    console.log(`⚠️  Faturas ignoradas (já corretas ou dados inválidos): ${skipped}`);
    console.log(`❌ Erros: ${errors}`);
    console.log(`📊 Total processado: ${imported + skipped + errors}`);

  } catch (error) {
    console.error('❌ Erro geral na importação:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executa a importação
if (require.main === module) {
  importInvoices()
    .then(() => {
      console.log('\n🎉 Importação de faturas concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Falha na importação:', error);
      process.exit(1);
    });
}

export { importInvoices };