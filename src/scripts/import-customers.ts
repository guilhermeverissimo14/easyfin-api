import * as XLSX from 'xlsx'
import { PrismaClient } from '@prisma/client'
import path from 'path'
import { formatCpfCnpj, formatPhone } from '@/utils/format'

const prisma = new PrismaClient()

interface CustomerData {
  cnpj: string
  name: string
  email?: string
  phone?: string
  address?: string
  zipCode?: string
  city?: string
  state?: string
  country?: string
  contact?: string
  retIss?: boolean
}

// Função para normalizar nomes de colunas (remove acentos, espaços, etc.)
function normalizeColumnName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]/g, '') // Remove caracteres especiais
    .trim()
}

// Mapeamento de possíveis nomes de colunas para os campos do modelo
const columnMapping: Record<string, keyof CustomerData> = {
  // CNPJ
  'cnpj': 'cnpj',
  'cpfcnpj': 'cnpj',
  'documento': 'cnpj',
  'doc': 'cnpj',

  // Nome
  'nome': 'name',
  'name': 'name',
  'razaosocial': 'name',
  'empresa': 'name',
  'cliente': 'name',

  // Email
  'email': 'email',
  'mail': 'email',
  'correio': 'email',

  // Telefone
  'telefone': 'phone',
  'phone': 'phone',
  'fone': 'phone',
  'celular': 'phone',

  // Endereço
  'endereco': 'address',
  'address': 'address',
  'rua': 'address',
  'logradouro': 'address',

  // CEP
  'cep': 'zipCode',
  'zipcode': 'zipCode',
  'codigopostal': 'zipCode',

  // Cidade
  'cidade': 'city',
  'city': 'city',
  'municipio': 'city',

  // Estado
  'estado': 'state',
  'state': 'state',
  'uf': 'state',

  // País
  'pais': 'country',
  'country': 'country',

  // Contato
  'contato': 'contact',
  'contact': 'contact',
  'responsavel': 'contact',

  // Retenção ISS
  'retiss': 'retIss',
  'retencaoiss': 'retIss',
  'iss': 'retIss'
}

function parseExcelData(filePath: string): CustomerData[] {
  console.log('📖 Lendo arquivo Excel:', filePath)

  const workbook = XLSX.readFile(filePath)
  const sheetName = workbook.SheetNames[0] // Pega a primeira aba
  const worksheet = workbook.Sheets[sheetName]

  // Converte para JSON
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

  if (rawData.length === 0) {
    throw new Error('Planilha está vazia')
  }

  // Primeira linha são os cabeçalhos
  const headers = rawData[0].map((header: any) => normalizeColumnName(String(header || '')))
  const dataRows = rawData.slice(1)

  console.log('📋 Cabeçalhos encontrados:', headers)

  // Mapeia os cabeçalhos para os campos do modelo
  const fieldMapping: Record<number, keyof CustomerData> = {}
  headers.forEach((header, index) => {
    const field = columnMapping[header]
    if (field) {
      fieldMapping[index] = field
      console.log(`✅ Mapeado: "${header}" -> "${field}"`)
    } else {
      console.log(`⚠️  Coluna não mapeada: "${header}"`)
    }
  })

  // Verifica se pelo menos CNPJ e Nome foram encontrados
  const hasCnpj = Object.values(fieldMapping).includes('cnpj')
  const hasName = Object.values(fieldMapping).includes('name')

  if (!hasCnpj) {
    throw new Error('Coluna CNPJ não encontrada. Verifique se existe uma coluna com nome: cnpj, cpfcnpj, documento, doc')
  }

  if (!hasName) {
    throw new Error('Coluna Nome não encontrada. Verifique se existe uma coluna com nome: nome, name, razaosocial, empresa, cliente')
  }

  // Processa os dados
  const customers: CustomerData[] = []

  dataRows.forEach((row, rowIndex) => {
    const customer: Partial<CustomerData> = {}

    // Mapeia cada célula para o campo correspondente
    Object.entries(fieldMapping).forEach(([colIndex, field]) => {
      const cellValue = row[parseInt(colIndex)]
      if (cellValue !== undefined && cellValue !== null && cellValue !== '') {
        let value = String(cellValue).trim()

        // Tratamentos específicos por campo
        if (field === 'retIss') {
          customer[field] = ['true', '1', 'sim', 's', 'yes', 'y'].includes(value.toLowerCase())
        } else if (field === 'cnpj') {
          // Remove formatação do CNPJ
          value = value.replace(/\D/g, '')
          customer[field] = value
        } else if (field === 'phone') {
          // Remove formatação do telefone
          value = value.replace(/\D/g, '')
          customer[field] = value
        } else if (field === 'zipCode') {
          // Remove formatação do CEP
          value = value.replace(/\D/g, '')
          customer[field] = value
        } else {
          customer[field] = value
        }
      }
    })

    // Valida se tem os campos obrigatórios
    if (customer.cnpj && customer.name) {
      customers.push(customer as CustomerData)
    } else {
      console.log(`⚠️  Linha ${rowIndex + 2} ignorada - faltam campos obrigatórios:`, customer)
    }
  })

  console.log(`📊 Total de registros válidos encontrados: ${customers.length}`)
  return customers
}

async function importCustomers() {
  try {
    console.log('🚀 Iniciando importação de clientes...')

    // Caminho para a planilha
    const excelPath = path.join(process.cwd(), 'import.xlsx')

    // Lê e processa os dados da planilha
    const customersData = parseExcelData(excelPath)

    if (customersData.length === 0) {
      console.log('❌ Nenhum cliente válido encontrado na planilha')
      return
    }

    let imported = 0
    let skipped = 0
    let errors = 0

    console.log('💾 Iniciando inserção no banco de dados...')

    for (const customerData of customersData) {
      try {
        // Valida CNPJ
        if (!customerData.cnpj || customerData.cnpj.length !== 14) {
          console.log(`⚠️  CNPJ inválido para ${customerData.name}: ${customerData.cnpj}`)
          errors++
          continue
        }

        // Formata o CNPJ para verificação
        const formattedCnpj = formatCpfCnpj(customerData.cnpj)

        // Verifica se já existe (usando CNPJ formatado)
        const existingCustomer = await prisma.customer.findUnique({
          where: { cnpj: formattedCnpj }
        })

        if (existingCustomer) {
          console.log(`⏭️  Cliente já existe: ${customerData.name} (${formattedCnpj})`)
          skipped++
          continue
        }

        // Verifica email duplicado se fornecido
        if (customerData.email) {
          const existingEmail = await prisma.customer.findUnique({
            where: { email: customerData.email }
          })

          if (existingEmail) {
            console.log(`⚠️  Email já existe para outro cliente: ${customerData.email}`)
            // Remove o email para evitar erro
            delete customerData.email
          }
        }

        // Formata os dados
        const formattedData = {
          ...customerData,
          cnpj: formattedCnpj, // Usa o CNPJ já formatado
          phone: customerData.phone ? formatPhone(customerData.phone) : undefined,
          retIss: customerData.retIss || false
        }

        // Cria o cliente
        await prisma.customer.create({
          data: formattedData
        })

        console.log(`✅ Cliente importado: ${customerData.name}`)
        imported++

      } catch (error: any) {
        // Verifica se é erro de CNPJ duplicado
        if (error.code === 'P2002' && error.meta?.target?.includes('cnpj')) {
          console.log(`⏭️  Cliente já existe (CNPJ duplicado): ${customerData.name} (${formatCpfCnpj(customerData.cnpj)})`)
          skipped++
        }
        // Verifica se é erro de email duplicado
        else if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
          console.log(`⚠️  Email duplicado para ${customerData.name}: ${customerData.email}`)
          // Tenta importar sem o email
          try {
            const dataWithoutEmail = { ...customerData, cnpj: formatCpfCnpj(customerData.cnpj), phone: customerData.phone ? formatPhone(customerData.phone) : undefined, retIss: customerData.retIss || false }
            delete dataWithoutEmail.email

            await prisma.customer.create({
              data: dataWithoutEmail
            })

            console.log(`✅ Cliente importado sem email: ${customerData.name}`)
            imported++
          } catch (retryError) {
            console.error(`❌ Erro ao importar ${customerData.name} sem email:`, retryError)
            errors++
          }
        }
        // Outros erros
        else {
          console.error(`❌ Erro ao importar ${customerData.name}:`, error.message || error)
          errors++
        }
      }
    }

    console.log('\n📈 Resumo da importação:')
    console.log(`✅ Importados: ${imported}`)
    console.log(`⏭️  Ignorados (já existem): ${skipped}`)
    console.log(`❌ Erros: ${errors}`)
    console.log(`📊 Total processados: ${imported + skipped + errors}`)

  } catch (error) {
    console.error('💥 Erro durante a importação:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executa o script se chamado diretamente
if (require.main === module) {
  importCustomers()
}

export { importCustomers }