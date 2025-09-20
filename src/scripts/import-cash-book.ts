import '@/config/module-alias';
import { PrismaClient, TransactionType } from '@prisma/client';
import * as XLSX from 'xlsx';
import path from 'path';
import { processBankTransactionsService } from '@/services/cash-flow/process-bank-transactions.service';
import { ParsedTransaction } from '@/services/cash-flow/parse-bank-transactions.service';
import { connectWithRetry, executeWithRetry } from '@/lib/prisma';

console.log('💰 Iniciando script de importação do Livro Caixa...');

const prisma = new PrismaClient();

interface CashFlowData {
  data: Date;
  historico: string;
  valor: number;
  inf: string; // C ou D
  detalhamentoHist: string;
  centroCustos: string;
  saldo: number;
}

// Função para converter valor monetário string para centavos
function parseMonetaryValue(value: any): number {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    // Remove caracteres não numéricos exceto vírgula e ponto
    const cleanValue = value.replace(/[^\d,.-]/g, '');
    // Substitui vírgula por ponto para conversão
    const normalizedValue = cleanValue.replace(',', '.');
    const numericValue = parseFloat(normalizedValue);
    return isNaN(numericValue) ? 0 : numericValue;
  }

  return 0;
}

// Função para converter data do Excel
function parseExcelDate(value: any): Date {
  if (!value) {
    throw new Error('Data não fornecida');
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'number') {
    // Excel armazena datas como números (dias desde 1900-01-01)
    const excelEpoch = new Date(1900, 0, 1);
    const date = new Date(excelEpoch.getTime() + (value - 2) * 24 * 60 * 60 * 1000);
    return date;
  }

  if (typeof value === 'string') {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error(`Data inválida: ${value}`);
    }
    return date;
  }

  throw new Error(`Formato de data não suportado: ${typeof value}`);
}

// Função para normalizar strings para comparação
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .trim();
}

// Função para buscar centro de custo por nome
async function findCostCenterByName(costCenterName: string): Promise<string | null> {
  try {
    if (!costCenterName || costCenterName.trim() === '') {
      return null;
    }

    console.log(`🔍 Buscando centro de custo: "${costCenterName}"`);
    
    // Busca exata primeiro
    let costCenter = await prisma.costCenter.findFirst({
      where: {
        name: costCenterName.trim()
      }
    });

    if (costCenter) {
      console.log(`✅ Centro de custo encontrado (busca exata): ${costCenter.name} (ID: ${costCenter.id})`);
      return costCenter.id;
    }

    // Se não encontrou, tenta busca normalizada
    const normalizedSearchTerm = normalizeString(costCenterName);
    console.log(`🔍 Tentando busca normalizada: "${normalizedSearchTerm}"`);

    const allCostCenters = await prisma.costCenter.findMany();
    
    for (const center of allCostCenters) {
      const normalizedCenterName = normalizeString(center.name);
      if (normalizedCenterName === normalizedSearchTerm) {
        console.log(`✅ Centro de custo encontrado (busca normalizada): ${center.name} (ID: ${center.id})`);
        return center.id;
      }
    }

    // Se ainda não encontrou, tenta busca parcial
    for (const center of allCostCenters) {
      const normalizedCenterName = normalizeString(center.name);
      if (normalizedCenterName.includes(normalizedSearchTerm) || normalizedSearchTerm.includes(normalizedCenterName)) {
        console.log(`✅ Centro de custo encontrado (busca parcial): ${center.name} (ID: ${center.id})`);
        return center.id;
      }
    }

    console.log(`❌ Centro de custo não encontrado: "${costCenterName}"`);
    return null;

  } catch (error) {
    console.error(`❌ Erro ao buscar centro de custo "${costCenterName}":`, error);
    return null;
  }
}

// Função principal de importação do Livro Caixa
async function importCashBook() {
  try {
    console.log('💰 Iniciando importação do Livro Caixa...\n');
    
    // Conecta com retry automático
    await connectWithRetry(5, 1000);

    // Carrega a planilha
    const filePath = path.join(process.cwd(), 'import.xlsx');
    const workbook = XLSX.readFile(filePath);

    // Lê a terceira aba (índice 2)
    const sheetNames = workbook.SheetNames;
    if (sheetNames.length < 3) {
      throw new Error('A planilha deve ter pelo menos 3 abas');
    }

    const worksheet = workbook.Sheets[sheetNames[2]]; // Terceira aba
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📊 Encontradas ${jsonData.length} linhas na terceira aba (Livro Caixa)\n`);

    const transactions: ParsedTransaction[] = [];
    let skipped = 0;
    let errors = 0;

    // Processa cada linha e converte para ParsedTransaction
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as any;

      try {
        // Mapeia os dados da planilha
        const cashFlowData: CashFlowData = {
          data: parseExcelDate(row['Data']),
          historico: row['Histórico']?.toString() || '',
          valor: parseMonetaryValue(row['Valor']),
          inf: row['Inf.']?.toString()?.toUpperCase() || '',
          detalhamentoHist: row['Detalhamento Hist.']?.toString() || '',
          centroCustos: row['Centro de custos']?.toString() || '',
          saldo: parseMonetaryValue(row['Saldo'])
        };

        // Validações básicas
        if (!cashFlowData.data || isNaN(cashFlowData.data.getTime())) {
          console.log(`⚠️  Linha ${i + 1}: Data inválida, pulando...`);
          skipped++;
          continue;
        }

        if (!cashFlowData.historico.trim()) {
          console.log(`⚠️  Linha ${i + 1}: Histórico vazio, pulando...`);
          skipped++;
          continue;
        }

        if (cashFlowData.valor <= 0) {
          console.log(`⚠️  Linha ${i + 1}: Valor inválido (${cashFlowData.valor}), pulando...`);
          skipped++;
          continue;
        }

        if (!['C', 'D'].includes(cashFlowData.inf)) {
          console.log(`⚠️  Linha ${i + 1}: Tipo inválido (${cashFlowData.inf}), deve ser C ou D, pulando...`);
          skipped++;
          continue;
        }

        // Busca centro de custo se informado
        let costCenterId: string | undefined = undefined;
        if (cashFlowData.centroCustos.trim()) {
          costCenterId = await executeWithRetry(
            () => findCostCenterByName(cashFlowData.centroCustos),
            3,
            1000
          ) || undefined;
        }

        // Converte tipo C/D para TransactionType
        const transactionType = cashFlowData.inf === 'C' ? TransactionType.CREDIT : TransactionType.DEBIT;

        // Formata a data para o formato dd/mm/yyyy
        const day = cashFlowData.data.getDate().toString().padStart(2, '0');
        const month = (cashFlowData.data.getMonth() + 1).toString().padStart(2, '0');
        const year = cashFlowData.data.getFullYear();
        const formattedDate = `${day}/${month}/${year}`;

        // Cria a transação no formato ParsedTransaction
        const transaction: ParsedTransaction = {
          date: formattedDate,
          historic: cashFlowData.historico,
          value: cashFlowData.valor,
          type: transactionType,
          detailing: cashFlowData.detalhamentoHist || cashFlowData.historico,
          originalRow: i + 1,
          costCenterId
        };

        transactions.push(transaction);
        console.log(`💰 Linha ${i + 1} preparada: ${cashFlowData.historico} - ${transactionType} - R$ ${cashFlowData.valor.toFixed(2)}`);

      } catch (error: any) {
        console.error(`❌ Erro na linha ${i + 1}:`, error.message || error);
        errors++;
      }
    }

    console.log(`\n📊 Transações preparadas: ${transactions.length}`);
    console.log(`⚠️  Linhas puladas: ${skipped}`);
    console.log(`❌ Erros de processamento: ${errors}`);

    if (transactions.length === 0) {
      throw new Error('Nenhuma transação válida encontrada para importar');
    }

    // Processa as transações em lotes para evitar timeout
    const bankAccountId = '8225b613-5930-4593-adb5-c638abf1ac57'; // ID fixo conforme solicitado
    const filename = 'livro-caixa-import.xlsx';
    const batchSize = 50; // Processa 50 transações por vez
    
    console.log('\n🚀 Iniciando processamento das transações em lotes...');
    console.log(`📦 Processando ${transactions.length} transações em lotes de ${batchSize}`);
    
    let totalImported = 0;
    let finalBalance = 0;
    let batchNumber = 1;
    
    // Divide as transações em lotes
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      const isLastBatch = i + batchSize >= transactions.length;
      
      console.log(`\n📦 Processando lote ${batchNumber}/${Math.ceil(transactions.length / batchSize)} (${batch.length} transações)`);
      
      try {
        const result = await executeWithRetry(
          async () => {
            return await processBankTransactionsService({
              bankAccountId,
              filename: `${filename}-lote-${batchNumber}`,
              transactions: batch
            });
          },
          5, // Máximo 5 tentativas
          2000 // Delay inicial de 2 segundos
        );
        
        totalImported += result.importedTransactions;
        finalBalance = result.finalBalance;
        
        console.log(`✅ Lote ${batchNumber} concluído: ${result.importedTransactions} transações importadas`);
        
        // Pausa entre lotes para não sobrecarregar o banco
        if (!isLastBatch) {
          console.log('⏳ Aguardando 3 segundos antes do próximo lote...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
      } catch (error: any) {
        console.error(`❌ Erro no lote ${batchNumber} após múltiplas tentativas:`, error.message);
        throw error;
      }
      
      batchNumber++;
    }

    console.log('\n📊 Resumo da importação do Livro Caixa:');
    console.log(`✅ Transações importadas: ${totalImported}`);
    console.log(`💰 Saldo final: R$ ${(finalBalance / 100).toFixed(2)}`);
    console.log(`⚠️  Linhas puladas: ${skipped}`);
    console.log(`❌ Erros de processamento: ${errors}`);
    console.log(`📦 Lotes processados: ${batchNumber - 1}`);
    console.log(`📊 Total processado: ${totalImported + skipped + errors}`);

  } catch (error) {
    console.error('❌ Erro geral na importação do Livro Caixa:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executa a importação
if (require.main === module) {
  importCashBook()
    .then(() => {
      console.log('\n✨ Importação do Livro Caixa finalizada!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Falha na importação do Livro Caixa:', error);
      process.exit(1);
    });
}

export { importCashBook };