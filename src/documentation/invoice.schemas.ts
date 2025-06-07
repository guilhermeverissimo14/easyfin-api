export const createInvoiceSchema = {
   description: 'Cria uma nova fatura',
   tags: ['Invoice'],
   summary: 'Criar fatura',
   body: {
      type: 'object',
      properties: {
         invoiceNumber: {
            type: 'string',
            description: 'Número da fatura',
         },
         customerId: {
            type: 'string',
            description: 'ID do cliente',
         },
         paymentConditionId: {
            type: 'string',
            description: 'Número da condição de pagamento',
         },
         issueDate: {
            type: 'string',
            format: 'date-time',
            description: 'Data de emissão',
         },
         serviceValue: {
            type: 'number',
            description: 'Valor do serviço',
         },
         retainsIss: {
            type: 'boolean',
            description: 'Retém ISS?',
         },
         bankAccountId: {
            type: 'string',
            description: 'ID da conta bancária (opcional)',
         },
         costCenterId: {
            type: 'string',
            description: 'ID do centro de custo (opcional)',
         },
         notes: {
            type: 'string',
            description: 'Observações da fatura (opcional)',
         },
      },
      required: ['invoiceNumber', 'customerId', 'paymentConditionId', 'issueDate', 'serviceValue', 'retainsIss'],
   },
   response: {
      201: {
         description: 'Fatura criada com sucesso',
         type: 'object',
         properties: {
            id: {
               type: 'string',
               description: 'ID da fatura',
            },
            invoiceNumber: {
               type: 'string',
               description: 'Número da fatura',
            },
            customerId: {
               type: 'string',
               description: 'ID do cliente',
            },
            paymentConditionId: {
               type: 'string',
               description: 'ID da condição de pagamento',
            },
            issueDate: {
               type: 'string',
               format: 'date-time',
               description: 'Data de emissão',
            },
            month: {
               type: 'number',
               description: 'Mês da fatura',
            },
            year: {
               type: 'number',
               description: 'Ano da fatura',
            },
            dueDate: {
               type: 'string',
               format: 'date-time',
               description: 'Data de vencimento da próxima parcela',
            },
            serviceValue: {
               type: 'number',
               description: 'Valor do serviço',
            },
            retainsIss: {
               type: 'boolean',
               description: 'Retém ISS?',
            },
            issqnTaxRate: {
               type: 'number',
               description: 'Alíquota de ISSQN aplicada',
            },
            effectiveTaxRate: {
               type: 'number',
               description: 'Alíquota efetiva aplicada',
            },
            issqnValue: {
               type: 'number',
               description: 'Valor do ISSQN',
            },
            netValue: {
               type: 'number',
               description: 'Valor líquido após deduções',
            },
            effectiveTax: {
               type: 'number',
               description: 'Valor do imposto efetivo',
            },
            bankAccountId: {
               type: 'string',
               description: 'ID da conta bancária (opcional)',
            },
            costCenterId: {
               type: 'string',
               description: 'ID do centro de custo (opcional)',
            },
            notes: {
               type: 'string',
               description: 'Observações da fatura (opcional)',
            },
            createdAt: {
               type: 'string',
               format: 'date-time',
               description: 'Data de criação da fatura',
            },
            updatedAt: {
               type: 'string',
               format: 'date-time',
               description: 'Data de atualização da fatura',
            },
         },
      },
      400: {
         description: 'Erro ao criar a fatura',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Fatura já cadastrada',
            },
         },
      },
      500: {
         description: 'Erro interno do servidor',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Erro interno do servidor',
            },
         },
      },
   },
}

export const updateInvoiceSchema = {
   description: 'Atualiza uma fatura existente',
   tags: ['Invoice'],
   summary: 'Atualizar fatura',
   params: {
      type: 'object',
      properties: {
         id: {
            type: 'string',
            description: 'ID da fatura a ser atualizada',
         },
      },
      required: ['id'],
   },
   body: {
      type: 'object',
      properties: {
         invoiceNumber: {
            type: 'string',
            description: 'Número da fatura',
         },
         customerId: {
            type: 'string',
            description: 'ID do cliente',
         },
         paymentConditionId: {
            type: 'string',
            description: 'ID da condição de pagamento',
         },
         issueDate: {
            type: 'string',
            format: 'date-time',
            description: 'Data de emissão',
         },
         serviceValue: {
            type: 'number',
            description: 'Valor do serviço',
         },
         retainsIss: {
            type: 'boolean',
            description: 'Retém ISS? (Pegar do cadastro do cliente)',
         },
         bankAccountId: {
            type: 'string',
            description: 'ID da conta bancária (opcional)',
         },
         costCenterId: {
            type: 'string',
            description: 'ID do centro de custo (opcional)',
         },
         notes: {
            type: 'string',
            description: 'Observações da fatura (opcional)',
         },
      },
   },
   response: {
      200: {
         description: 'Fatura atualizada com sucesso',
         type: 'object',
         properties: {
            id: {
               type: 'string',
               description: 'ID da fatura',
            },
            invoiceNumber: {
               type: 'string',
               description: 'Número da fatura',
            },
            customerId: {
               type: 'string',
               description: 'ID do cliente',
            },
            paymentConditionId: {
               type: 'string',
               description: 'ID da condição de pagamento',
            },
            issueDate: {
               type: 'string',
               format: 'date-time',
               description: 'Data de emissão',
            },
            month: {
               type: 'number',
               description: 'Mês da fatura',
            },
            year: {
               type: 'number',
               description: 'Ano da fatura',
            },
            dueDate: {
               type: 'string',
               format: 'date-time',
               description: 'Data de vencimento da próxima parcela',
            },
            serviceValue: {
               type: 'number',
               description: 'Valor do serviço',
            },
            retainsIss: {
               type: 'boolean',
               description: 'Retém ISS?',
            },
            issqnTaxRate: {
               type: 'number',
               description: 'Alíquota de ISSQN aplicada',
            },
            effectiveTaxRate: {
               type: 'number',
               description: 'Alíquota efetiva aplicada',
            },
            issqnValue: {
               type: 'number',
               description: 'Valor do ISSQN',
            },
            netValue: {
               type: 'number',
               description: 'Valor líquido após deduções',
            },
            effectiveTax: {
               type: 'number',
               description: 'Valor do imposto efetivo',
            },
            bankAccountId: {
               type: 'string',
               description: 'ID da conta bancária (opcional)',
            },
            costCenterId: {
               type: 'string',
               description: 'ID do centro de custo (opcional)',
            },
            notes: {
               type: 'string',
               description: 'Observações da fatura (opcional)',
            },
            createdAt: {
               type: 'string',
               format: 'date-time',
               description: 'Data de criação da fatura',
            },
            updatedAt: {
               type: 'string',
               format: 'date-time',
               description: 'Data de atualização da fatura',
            },
         },
      },
      400: {
         description: 'Erro ao atualizar a fatura',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Fatura não encontrada',
            },
         },
      },
      401: {
         description: 'Não autorizado',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Usuário não autorizado a atualizar esta fatura',
            },
         },
      },
      500: {
         description: 'Erro interno do servidor',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Erro interno do servidor',
            },
         },
      },
   },
}

export const listInvoicesSchema = {
   description: 'Lista todas as faturas',
   tags: ['Invoice'],
   summary: 'Listar faturas',
   params: {
      type: 'object',
      properties: {
         customerId: {
            type: 'string',
            description: 'ID do cliente (opcional)',
         },
         bankAccountId: {
            type: 'string',
            description: 'ID da conta bancária (opcional)',
         },
         issueDateStart: {
            type: 'string',
            format: 'date-time',
            description: 'Data de início do período de emissão (opcional)',
         },
         issueDateEnd: {
            type: 'string',
            format: 'date-time',
            description: 'Data de fim do período de emissão (opcional)',
         },
      },
      required: [],
   },
   response: {
      200: {
         description: 'Lista de faturas',
         type: 'array',
         items: {
            type: 'object',
            properties: {
               id: {
                  type: 'string',
                  description: 'ID da fatura',
               },
               invoiceNumber: {
                  type: 'string',
                  description: 'Número da fatura',
               },
               customer: {
                  type: 'object',
                  properties: {
                     id: { type: 'string', description: 'ID do cliente' },
                     name: { type: 'string', description: 'Nome do cliente' },
                  },
                  description: 'Informações do cliente',
               },
               paymentCondition: {
                  type: 'object',
                  properties: {
                     id: { type: 'string', description: 'ID da condição de pagamento' },
                     condition: { type: 'string', description: 'Nome da condição de pagamento' },
                  },
                  description: 'Informações da condição de pagamento',
               },
               issueDate: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Data de emissão',
               },
               month: {
                  type: 'number',
                  description: 'Mês da fatura',
               },
               year: {
                  type: 'number',
                  description: 'Ano da fatura',
               },
               dueDate: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Data de vencimento da próxima parcela',
               },
               serviceValue: {
                  type: 'number',
                  description: 'Valor do serviço',
               },
               retainsIss: {
                  type: 'boolean',
                  description: 'Retém ISS?',
               },
               issqnTaxRate: {
                  type: 'number',
                  description: 'Alíquota de ISSQN aplicada',
               },
               effectiveTaxRate: {
                  type: 'number',
                  description: 'Alíquota efetiva aplicada',
               },
               issqnValue: {
                  type: 'number',
                  description: 'Valor do ISSQN',
               },
               netValue: {
                  type: 'number',
                  description: 'Valor líquido após deduções',
               },
               effectiveTax: {
                  type: 'number',
                  description: 'Valor do imposto efetivo',
               },
               bankAccount: {
                  type: 'object',
                  properties: {
                     id: { type: 'string', description: 'ID da conta bancária' },
                     bank: { type: 'string', description: 'Nome do banco' },
                     agency: { type: 'string', description: 'Agência bancária (opcional)' },
                     account: { type: 'string', description: 'Número da conta bancária (opcional)' },
                  },
                  description: 'Informações da conta bancária (opcional)',
               },
               costCenter: {
                  type: 'object',
                  properties: {
                     id: { type: 'string', description: 'ID do centro de custo' },
                     name: { type: 'string', description: 'Nome do centro de custo (opcional)' },
                  },
                  description: 'Informações do centro de custo (opcional)',
               },
               notes: { type: 'string', description: 'Observações da fatura (opcional)' },
               createdAt: { type: 'string', format: 'date-time', description: 'Data de criação da fatura' },
               updatedAt: { type: 'string', format: 'date-time', description: 'Data de atualização da fatura' },
            },
         },
      },
      500: {
         description: 'Erro interno do servidor',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Erro interno do servidor',
            },
         },
      },
   },
}

export const getInvoiceByIdSchema = {
   description: 'Obtém uma fatura pelo ID',
   tags: ['Invoice'],
   summary: 'Obter fatura por ID',
   params: {
      type: 'object',
      properties: {
         id: {
            type: 'string',
            description: 'ID da fatura a ser obtida',
         },
      },
      required: ['id'],
   },
   response: {
      200: {
         description: 'Fatura encontrada',
         type: 'object',
         properties: {
            id: { type: 'string', description: 'ID da fatura' },
            invoiceNumber: { type: 'string', description: 'Número da fatura' },
            customer: {
               type: 'object',
               properties: {
                  id: { type: 'string', description: 'ID do cliente' },
                  name: { type: 'string', description: 'Nome do cliente' },
               },
               description: 'Informações do cliente',
            },
            paymentCondition: {
               type: 'object',
               properties: {
                  id: { type: 'string', description: 'ID da condição de pagamento' },
                  condition: { type: 'string', description: 'Nome da condição de pagamento' },
               },
               description: 'Informações da condição de pagamento',
            },
            issueDate: { type: 'string', format: 'date-time', description: 'Data de emissão' },
            month: { type: 'number', description: 'Mês da fatura' },
            year: { type: 'number', description: 'Ano da fatura' },
            dueDate: { type: 'string', format: 'date-time', description: 'Data de vencimento da próxima parcela' },
            serviceValue: { type: 'number', description: 'Valor do serviço' },
            retainsIss: { type: 'boolean', description: 'Retém ISS?' },
            issqnTaxRate: { type: 'number', description: 'Alíquota de ISSQN aplicada' },
            effectiveTaxRate: { type: 'number', description: 'Alíquota efetiva aplicada' },
            issqnValue: { type: 'number', description: 'Valor do ISSQN' },
            netValue: { type: 'number', description: 'Valor líquido após deduções' },
            effectiveTax: { type: 'number', description: 'Valor do imposto efetivo' },
            bankAccount: {
               type: 'object',
               properties: {
                  id: { type: 'string', description: 'ID da conta bancária' },
                  bank: { type: 'string', description: 'Nome do banco' },
                  agency: { type: 'string', description: 'Agência bancária (opcional)' },
                  account: { type: 'string', description: 'Número da conta bancária (opcional)' },
               },
               description: 'Informações da conta bancária (opcional)',
            },
            costCenter: {
               type: 'object',
               properties: {
                  id: { type: 'string', description: 'ID do centro de custo' },
                  name: { type: 'string', description: 'Nome do centro de custo (opcional)' },
               },
               description: 'Informações do centro de custo (opcional)',
            },
            accountsReceivable: {
               type: 'array',
               items: {
                  type: 'object',
                  properties: {
                     id: { type: 'string', description: 'ID da conta a receber' },
                     documentNumber: { type: 'string', description: 'Número do documento' },
                     costCenterId: { type: 'string', description: 'ID do centro de custo (opcional)' },
                     value: { type: 'number', description: 'Valor da conta a receber' },
                     dueDate: { type: 'string', format: 'date-time', description: 'Data de vencimento' },
                     status: { type: 'string', description: 'Status da conta a receber' },
                  },
               },
               description: 'Lista de contas a receber associadas à fatura',
            },
            notes: { type: 'string', description: 'Observações da fatura (opcional)' },
            userId: { type: 'string', description: 'ID do usuário associado à fatura (opcional)' },
         },
      },
      400: {
         description: 'Erro ao obter a fatura',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Fatura não encontrada',
            },
         },
      },
      500: {
         description: 'Erro interno do servidor',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Erro interno do servidor',
            },
         },
      },
   },
}
