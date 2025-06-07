export const getTotalsAccountReceivableSchema = {
   description: 'Obtém os totais das contas a receber',
   tags: ['Accounts Receivable'],
   summary: 'Obter totais das contas a receber',
   response: {
      200: {
         description: 'Totais das contas a receber',
         type: 'object',
         properties: {
            totalReceived: {
               type: 'number',
               description: 'Total de contas a receber em atraso (Total Vencido)',
            },
            receivedThisMonth: {
               type: 'number',
               description: 'Total de contas a receber em atraso este mês (Vencido este mês)',
            },
            receivedThisWeek: {
               type: 'number',
               description: 'Total de contas a receber em atraso esta semana (Vencido esta semana)',
            },
            receivedToday: {
               type: 'number',
               description: 'Total de contas a receber em atraso hoje (Vencido hoje)',
            },
         },
         example: {
            totalReceived: 1000.0,
            receivedThisMonth: 500.0,
            receivedThisWeek: 200.0,
            receivedToday: 50.0,
         },
      },
      401: {
         description: 'Usuário não autenticado',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Usuário não autenticado',
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

export const createAccountReceivableSchema = {
   description: 'Cria uma nova conta a receber',
   tags: ['Accounts Receivable'],
   summary: 'Criar conta a receber',
   body: {
      type: 'object',
      properties: {
         customerId: {
            type: 'string',
            description: 'ID do cliente',
         },
         documentNumber: {
            type: 'string',
            description: 'Número do documento',
         },
         plannedPaymentMethod: {
            type: 'string',
            description: 'Método de pagamento previsto',
         },
         documentDate: {
            type: 'string',
            format: 'date-time',
            description: 'Data do documento',
         },
         dueDate: {
            type: 'string',
            format: 'date-time',
            description: 'Data de vencimento',
         },
         value: {
            type: 'number',
            description: 'Valor da conta',
         },
         costCenterId: {
            type: 'string',
            description: 'ID do centro de custo',
         },
         observation: {
            type: 'string',
            description: 'Observações (opcional)',
         },
      },
   },
   response: {
      201: {
         description: 'Conta a receber criada com sucesso',
         type: 'object',
         properties: {
            id: {
               type: 'string',
               description: 'ID da conta a receber',
            },
            customerId: {
               type: 'string',
               description: 'ID do cliente',
            },
            documentNumber: {
               type: 'string',
               description: 'Número do documento (opcional)',
            },
            documentDate: {
               type: 'string',
               format: 'date-time',
               description: 'Data do documento (opcional)',
            },
            launchDate: {
               type: 'string',
               format: 'date-time',
               description: 'Data de lançamento (opcional)',
            },
            dueDate: {
               type: 'string',
               format: 'date-time',
               description: 'Data de vencimento',
            },
            receiptDate: {
               type: 'string',
               format: 'date-time',
               description: 'Data de recebimento (opcional)',
            },
            value: {
               type: 'number',
               description: 'Valor total da conta',
            },
            paidValue: {
               type: 'number',
               description: 'Valor pago (opcional, padrão: 0)',
            },
            discount: {
               type: 'number',
               description: 'Valor do desconto (opcional, padrão: 0)',
            },
            fine: {
               type: 'number',
               description: 'Valor da multa (opcional, padrão: 0)',
            },
            interest: {
               type: 'number',
               description: 'Valor dos juros (opcional, padrão: 0)',
            },
            installmentNumber: {
               type: 'number',
               description: 'Número da parcela (opcional)',
            },
            totalInstallments: {
               type: 'number',
               description: 'Total de parcelas (opcional)',
            },
            costCenterId: {
               type: 'string',
               description: 'ID do centro de custo (opcional)',
            },
            plannedPaymentMethod: {
               type: 'string',
               description: 'Método de pagamento planejado (opcional)',
            },
            paymentMethodId: {
               type: 'string',
               description: 'ID do método de pagamento (opcional)',
            },
            userId: {
               type: 'string',
               description: 'ID do usuário que criou a conta',
            },
            observation: {
               type: 'string',
               description: 'Observações (opcional)',
            },
            status: {
               type: 'string',
               enum: ['PENDING', 'PAID', 'CANCELLED'],
               description: 'Status da conta',
            },
            createdAt: {
               type: 'string',
               format: 'date-time',
               description: 'Data de criação da conta a receber',
            },
            updatedAt: {
               type: 'string',
               format: 'date-time',
               description: 'Data de atualização da conta a receber',
            },
         },
         example: {
            id: 'uuid',
            customerId: 'uuid',
            documentNumber: '12345',
            documentDate: '2025-06-03T03:00:00.000Z',
            launchDate: '2025-06-06T03:00:00.000Z',
            dueDate: '2025-07-31T03:00:00.000Z',
            receiptDate: null,
            value: 252.95,
            paidValue: 0,
            discount: 0,
            fine: 0,
            interest: 0,
            installmentNumber: 1,
            totalInstallments: 1,
            costCenterId: null,
            plannedPaymentMethod: 'Boleto',
            paymentMethodId: null,
            userId: 'uuid',
            observation: 'Conta de energia',
            status: 'PENDING',
            createdAt: '2025-06-06T00:00:00.000Z',
            updatedAt: '2025-06-06T00:00:00.000Z',
         },
      },
      400: {
         description: 'Erro ao criar a conta a receber',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Cliente não encontrado',
            },
         },
      },
      401: {
         description: 'Usuário não autenticado',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Usuário não autenticado',
            },
         },
      },
      404: {
         description: 'Duplicidade',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example:
                  'Já existe uma conta a receber com os mesmos dados. Caso deseje criar em uma variação diferente, altere o número da parcela ou a data de vencimento.',
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

export const listAccountsReceivableSchema = {
   description: 'Lista contas a receber',
   tags: ['Accounts Receivable'],
   summary: 'Listar contas a receber',
   querystring: {
      type: 'object',
      properties: {
         customerId: {
            type: 'string',
            description: 'ID do cliente (opcional)',
         },
         costCenterId: {
            type: 'string',
            description: 'ID do centro de custo (opcional)',
         },
         status: {
            type: 'string',
            enum: ['PENDING', 'PAID', 'CANCELLED', 'OVERDUE'],
            description: 'Status da conta (opcional)',
         },
         paymentMethodId: {
            type: 'string',
            description: 'ID do método de pagamento (opcional)',
         },
         dueDateStart: {
            type: 'string',
            format: 'date',
            description: 'Data de vencimento inicial (opcional)',
         },
         dueDateEnd: {
            type: 'string',
            format: 'date',
            description: 'Data de vencimento final (opcional)',
         },
         documentDateStart: {
            type: 'string',
            format: 'date',
            description: 'Data do documento inicial (opcional)',
         },
         documentDateEnd: {
            type: 'string',
            format: 'date',
            description: 'Data do documento final (opcional)',
         },
      },
   },
   response: {
      200: {
         description: 'Lista de contas a receber',
         type: 'array',
         items: {
            type: 'object',
            properties: {
               id: {
                  type: 'string',
                  description: 'ID da conta a receber',
               },
               customer: {
                  type: 'object',
                  properties: {
                     id: { type: 'string', description: 'ID do cliente' },
                     name: { type: 'string', description: 'Nome do cliente' },
                  },
               },
               documentNumber: {
                  type: 'string',
                  description: 'Número do documento',
               },
               documentDate: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Data do documento',
               },
               launchDate: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Data de lançamento',
               },
               dueDate: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Data de vencimento',
               },
               receiptDate: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Data de recebimento',
               },
               value: {
                  type: 'number',
                  description: 'Valor total da conta',
               },
               paidValue: {
                  type: 'number',
                  description: 'Valor pago (opcional, padrão: 0)',
               },
               discount: {
                  type: 'number',
                  description: 'Valor do desconto (opcional, padrão: 0)',
               },
               fine: {
                  type: 'number',
                  description: 'Valor da multa (opcional, padrão: 0)',
               },
               interest: {
                  type: 'number',
                  description: 'Valor dos juros (opcional, padrão: 0)',
               },
               installmentNumber: {
                  type: 'number',
                  description: 'Número da parcela (opcional, padrão é 1 se não for parcelado)',
               },
               totalInstallments: { type: 'number', description: 'Total de parcelas (opcional, padrão é 1 se não for parcelado)' },
               costCenter: {
                  type: 'object',
                  properties: {
                     id: { type: 'string', description: 'ID do centro de custo (opcional)' },
                     name: { type: 'string', description: 'Nome do centro de custo (opcional)' },
                  },
               },
               plannedPaymentMethod: {
                  type: 'object',
                  properties: {
                     id: { type: 'string', description: 'ID do método de pagamento planejado (opcional)' },
                     name: { type: 'string', description: 'Nome do método de pagamento planejado (opcional)' },
                  },
               },
               paymentMethod: {
                  type: 'object',
                  properties: {
                     id: { type: 'string', description: 'ID do método de pagamento (opcional)' },
                     name: { type: 'string', description: 'Nome do método de pagamento (opcional)' },
                  },
               },
               userId: { type: 'string', description: 'ID do usuário que criou a conta' },
               observation: {
                  type: 'string',
                  description: 'Observações (opcional)',
               },
               status: {
                  type: 'string',
                  enum: ['PENDING', 'PAID', 'CANCELLED', 'OVERDUE'],
               },
               createdAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Data de criação da conta a receber',
               },
               updatedAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Data da última atualização da conta a receber',
               },
            },
            example: {
               id: 'uuid',
               supplier: {
                  id: 'uuid',
                  name: 'Fornecedor Exemplo',
               },
               documentNumber: '12345',
               documentDate: '2025-06-03T00:00:00.000Z',
               launchDate: '2025-06-06T00:00:00.000Z',
               dueDate: '2025-07-31T00:00:00.000Z',
               paymentDate: null,
               value: 252.95,
               paidValue: 0,
               discount: 0,
               fine: 0,
               interest: 0,
               installmentNumber: 1,
               totalInstallments: 1,
               costCenter: {
                  id: null,
                  name: null,
               },
               plannedPaymentMethod: {
                  id: 'uuid',
                  name: 'Boleto',
               },
               paymentMethod: {
                  id: null,
                  name: null,
               },
               userId: 'uuid',
               observation: 'Conta de energia',
               status: 'PENDING',
               createdAt: '2025-06-06T00:00:00Z',
               updatedAt: '2025-06-06T00:00:00Z',
            },
         },
      },
      400: {
         description: 'Erro ao listar contas a receber',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Erro ao listar contas a receber',
            },
         },
      },
      401: {
         description: 'Usuário não autenticado',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Usuário não autenticado',
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

export const getAccountsReceivableByIdSchema = {
   description: 'Consulta uma conta a receber pelo ID',
   tags: ['Accounts Receivable'],
   summary: 'Consultar conta a receber por ID',
   params: {
      type: 'object',
      properties: {
         id: {
            type: 'string',
            description: 'ID da conta a receber',
         },
      },
      required: ['id'],
   },
   response: {
      200: {
         description: 'Conta a receber encontrada',
         type: 'object',
         properties: {
            id: { type: 'string', description: 'ID da conta a receber' },
            customer: {
               type: 'object',
               properties: {
                  id: { type: 'string', description: 'ID do cliente' },
                  name: { type: 'string', description: 'Nome do cliente' },
               },
            },
            documentNumber: { type: 'string', description: 'Número do documento' },
            documentDate: { type: 'string', format: 'date-time', description: 'Data do documento' },
            launchDate: { type: 'string', format: 'date-time', description: 'Data de lançamento' },
            dueDate: { type: 'string', format: 'date-time', description: 'Data de vencimento' },
            receiptDate: { type: 'string', format: 'date-time', description: 'Data de recebimento' },
            value: { type: 'number', description: 'Valor total da conta' },
            paidValue: { type: 'number', description: 'Valor pago (opcional, padrão: 0)' },
            discount: { type: 'number', description: 'Valor do desconto (opcional, padrão: 0)' },
            fine: { type: 'number', description: 'Valor da multa (opcional, padrão: 0)' },
            interest: { type: 'number', description: 'Valor dos juros (opcional, padrão: 0)' },
            installmentNumber: { type: 'number', description: 'Número da parcela' },
            totalInstallments: { type: 'number', description: 'Total de parcelas' },
            costCenter: {
               type: 'object',
               properties: {
                  id: { type: 'string', description: 'ID do centro de custo (opcional)' },
                  name: { type: 'string', description: 'Nome do centro de custo (opcional)' },
               },
            },
            plannedPaymentMethod: {
               type: 'object',
               properties: {
                  id: { type: 'string', description: 'ID do método de pagamento planejado (opcional)' },
                  name: { type: 'string', description: 'Nome do método de pagamento planejado (opcional)' },
               },
            },
            paymentMethod: {
               type: 'object',
               properties: {
                  id: { type: 'string', description: 'ID do método de pagamento (opcional)' },
                  name: { type: 'string', description: 'Nome do método de pagamento (opcional)' },
               },
            },
            user: {
               type: 'object',
               properties: {
                  id: { type: 'string', description: 'ID do usuário que criou a conta' },
                  name: { type: 'string', description: 'Nome do usuário que criou a conta' },
               },
            },
            observation: { type: 'string', description: 'Observações (opcional)' },
            status: { type: 'string', enum: ['PENDING', 'PAID', 'CANCELLED', 'OVERDUE'] },
            createdAt: { type: 'string', format: 'date-time', description: 'Data de criação' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Data de atualização' },
         },
         example: {
            id: 'uuid',
            customer: {
               id: 'uuid',
               name: 'Cliente Exemplo',
            },
            documentNumber: '12345',
            documentDate: '2025-06-03T00:00:00.000Z',
            launchDate: '2025-06-06T00:00:00.000Z',
            dueDate: '2025-07-31T00:00:00.000Z',
            receiptDate: null,
            value: 252.95,
            paidValue: 0,
            discount: 0,
            fine: 0,
            interest: 0,
            installmentNumber: 1,
            totalInstallments: 1,
            costCenter: {
               id: null,
               name: null,
            },
            plannedPaymentMethod: {
               id: 'uuid',
               name: 'Boleto',
            },
            paymentMethod: {
               id: null,
               name: null,
            },
            user: {
               id: 'uuid',
               name: 'Usuário Exemplo',
            },
            observation: 'Conta de cliente',
            status: 'PENDING',
            createdAt: '2025-06-06T00:00:00.000Z',
            updatedAt: '2025-06-06T00:00:00.000Z',
         },
      },
      404: {
         description: 'Conta a receber não encontrada',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Conta a receber não encontrada',
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

export const updateAccountsReceivableSchema = {
   description: 'Atualiza uma conta a receber existente',
   tags: ['Accounts Receivable'],
   summary: 'Atualizar conta a receber',
   params: {
      type: 'object',
      properties: {
         id: {
            type: 'string',
            description: 'ID da conta a receber a ser atualizada',
         },
      },
      required: ['id'],
   },
   body: {
      type: 'object',
      properties: {
         customerId: {
            type: 'string',
            description: 'ID do cliente (opcional)',
         },
         documentNumber: {
            type: 'string',
            description: 'Número do documento (opcional)',
         },
         documentDate: {
            type: 'string',
            format: 'date-time',
            description: 'Data do documento (opcional)',
         },
         launchDate: {
            type: 'string',
            format: 'date-time',
            description: 'Data de lançamento (opcional)',
         },
         dueDate: {
            type: 'string',
            format: 'date-time',
            description: 'Data de vencimento (opcional)',
         },
         receiptDate: {
            type: 'string',
            format: 'date-time',
            description: 'Data de recebimento (opcional)',
         },
         value: {
            type: 'number',
            description: 'Valor total da conta (opcional)',
         },
         paidValue: {
            type: 'number',
            description: 'Valor pago (opcional)',
         },
         discount: {
            type: 'number',
            description: 'Valor do desconto (opcional)',
         },
         fine: {
            type: 'number',
            description: 'Valor da multa (opcional)',
         },
         interest: {
            type: 'number',
            description: 'Valor dos juros (opcional)',
         },
         installmentNumber: {
            type: 'number',
            description: 'Número da parcela (opcional)',
         },
         totalInstallments: {
            type: 'number',
            description: 'Total de parcelas (opcional)',
         },
         costCenterId: {
            type: 'string',
            description: 'ID do centro de custo (opcional)',
         },
         plannedPaymentMethod: {
            type: 'string',
            description: 'Método de pagamento planejado (opcional)',
         },
         paymentMethodId: {
            type: 'string',
            description: 'ID do método de pagamento (opcional)',
         },
         observation: {
            type: 'string',
            description: 'Observações (opcional)',
         },
         status: {
            type: 'string',
            enum: ['PENDING', 'PAID', 'CANCELLED', 'OVERDUE'],
            description: 'Status da conta (opcional)',
         },
      },
   },
   response: {
      200: {
         description: 'Conta a receber atualizada com sucesso',
         type: 'object',
         properties: {
            id: { type: 'string', description: 'ID da conta a receber' },
            customerId: { type: 'string', description: 'ID do cliente' },
            documentNumber: { type: 'string', description: 'Número do documento (opcional)' },
            documentDate: { type: 'string', format: 'date-time', description: 'Data do documento (opcional)' },
            launchDate: { type: 'string', format: 'date-time', description: 'Data de lançamento (opcional)' },
            dueDate: { type: 'string', format: 'date-time', description: 'Data de vencimento' },
            receiptDate: { type: 'string', format: 'date-time', description: 'Data de recebimento (opcional)' },
            value: { type: 'number', description: 'Valor total da conta' },
            paidValue: { type: 'number', description: 'Valor pago (opcional)' },
            discount: { type: 'number', description: 'Valor do desconto (opcional)' },
            fine: { type: 'number', description: 'Valor da multa (opcional)' },
            interest: { type: 'number', description: 'Valor dos juros (opcional)' },
            installmentNumber: { type: 'number', description: 'Número da parcela (opcional)' },
            totalInstallments: { type: 'number', description: 'Total de parcelas (opcional)' },
            costCenterId: { type: 'string', description: 'ID do centro de custo (opcional)' },
            plannedPaymentMethod: { type: 'string', description: 'Método de pagamento planejado (opcional)' },
            paymentMethodId: { type: 'string', description: 'ID do método de pagamento (opcional)' },
            userId: { type: 'string', description: 'ID do usuário que criou a conta' },
            observation: { type: 'string', description: 'Observações (opcional)' },
            status: { type: 'string', enum: ['PENDING', 'PAID', 'CANCELLED', 'OVERDUE'] },
            createdAt: { type: 'string', format: 'date-time', description: 'Data de criação' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Data de atualização' },
         },
         example: {
            id: 'uuid',
            customerId: 'uuid',
            documentNumber: '12345',
            documentDate: '2025-06-03T03:00:00.000Z',
            launchDate: '2025-06-06T03:00:00.000Z',
            dueDate: '2025-07-31T03:00:00.000Z',
            receiptDate: null,
            value: 252.95,
            paidValue: 0,
            discount: 0,
            fine: 0,
            interest: 0,
            installmentNumber: 1,
            totalInstallments: 1,
            costCenterId: null,
            plannedPaymentMethod: 'Boleto',
            paymentMethodId: null,
            userId: 'uuid',
            observation: 'Conta de cliente',
            status: 'PENDING',
            createdAt: '2025-06-06T00:00:00.000Z',
            updatedAt: '2025-06-07T00:00:00.000Z',
         },
      },
      404: {
         description: 'Conta a receber não encontrada',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Conta a receber não encontrada',
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

export const deleteAccountsReceivableSchema = {
   description: 'Exclui uma conta a receber',
   tags: ['Accounts Receivable'],
   summary: 'Excluir conta a receber',
   params: {
      type: 'object',
      properties: {
         id: {
            type: 'string',
            description: 'ID da conta a receber a ser excluída',
         },
      },
      required: ['id'],
   },
   response: {
      204: {
         description: 'Conta a receber excluída com sucesso',
      },
      400: {
         description: 'Erro ao excluir a conta a receber',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Não é possível excluir esta conta a receber.',
            },
         },
      },
      404: {
         description: 'Conta a receber não encontrada',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Conta a receber não encontrada',
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

export const receiveAccountsReceivableSchema = {
   description: 'Liquida uma conta a receber',
   tags: ['Accounts Receivable'],
   summary: 'Liquidar conta a receber',
   params: {
      type: 'object',
      properties: {
         id: {
            type: 'string',
            description: 'ID da conta a receber a ser liquidada',
         },
      },
      required: ['id'],
   },
   body: {
      type: 'object',
      properties: {
         fine: {
            type: 'number',
            description: 'Valor da multa (opcional)',
         },
         interest: {
            type: 'number',
            description: 'Valor dos juros (opcional)',
         },
         discount: {
            type: 'number',
            description: 'Valor do desconto (opcional)',
         },
         observation: {
            type: 'string',
            description: 'Observações (opcional)',
         },
         paymentMethodId: {
            type: 'string',
            description: 'ID do método de pagamento (opcional)',
         },
         paymentDate: {
            type: 'string',
            format: 'date-time',
            description: 'Data de pagamento (opcional)',
         },
         costCenterId: {
            type: 'string',
            description: 'ID do centro de custo (opcional)',
         },
      },
   },
   response: {
      200: {
         description: 'Conta a receber liquidada com sucesso',
         type: 'object',
         properties: {
            id: { type: 'string', description: 'ID da conta a receber' },
            customerId: { type: 'string', description: 'ID do cliente' },
            documentNumber: { type: 'string', description: 'Número do documento' },
            documentDate: { type: 'string', format: 'date-time', description: 'Data do documento' },
            launchDate: { type: 'string', format: 'date-time', description: 'Data de lançamento' },
            dueDate: { type: 'string', format: 'date-time', description: 'Data de vencimento' },
            receiptDate: { type: 'string', format: 'date-time', description: 'Data de recebimento' },
            value: { type: 'number', description: 'Valor total da conta' },
            receivedValue: { type: 'number', description: 'Valor pago (opcional, padrão: 0)' },
            discount: { type: 'number', description: 'Valor do desconto (opcional, padrão: 0)' },
            fine: { type: 'number', description: 'Valor da multa (opcional, padrão: 0)' },
            interest: { type: 'number', description: 'Valor dos juros (opcional, padrão: 0)' },
            installmentNumber: { type: 'number', description: 'Número da parcela' },
            totalInstallments: { type: 'number', description: 'Total de parcelas' },
            costCenterId: { type: 'string', description: 'ID do centro de custo (opcional)' },
            plannedPaymentMethod: { type: 'string', description: 'Método de pagamento planejado (opcional)' },
            paymentMethodId: { type: 'string', description: 'ID do método de pagamento (opcional)' },
            userId: { type: 'string', description: 'ID do usuário que criou a conta' },
            observation: { type: 'string', description: 'Observações (opcional)' },
            status: { type: 'string', enum: ['PENDING', 'PAID', 'CANCELLED', 'OVERDUE'] },
            createdAt: { type: 'string', format: 'date-time', description: 'Data de criação' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Data de atualização' },
         },
         example: {
            id: 'uuid',
            customerId: 'uuid',
            documentNumber: '12345',
            documentDate: '2025-06-03T03:00:00.000Z',
            launchDate: '2025-06-06T03:00:00.000Z',
            dueDate: '2025-07-31T03:00:00.000Z',
            receiptDate: '2025-07-30T03:00:00.000Z',
            value: 252.95,
            receivedValue: 252.95,
            discount: 0,
            fine: 0,
            interest: 0,
            installmentNumber: 1,
            totalInstallments: 1,
            costCenterId: null,
            plannedPaymentMethod: 'Boleto',
            paymentMethodId: 'uuid',
            userId: 'uuid',
            observation: 'Liquidação da conta de cliente',
            status: 'PAID',
            createdAt: '2025-06-06T00:00:00.000Z',
            updatedAt: '2025-07-30T00:00:00.000Z',
         },
      },
      400: {
         description: 'Erro ao liquidar a conta a receber',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Erro ao liquidar a conta a receber',
            },
         },
      },
      401: {
         description: 'Usuário não autenticado',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Usuário não autenticado',
            },
         },
      },
      404: {
         description: 'Conta a receber não encontrada',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Conta a receber não encontrada',
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
