export const getDashboardOverviewSchema = {
   description: 'Obtém a visão geral do dashboard com totais úteis',
   tags: ['Dashboard'],
   summary: 'Obter visão geral do dashboard',
   querystring: {
      type: 'object',
      properties: {
         month: {
            type: 'string',
            pattern: '^(0[1-9]|1[0-2])\/[0-9]{4}$',
            description: 'Mês e ano no formato MM/YYYY (ex: 08/2025). Se não informado, usa o mês atual.',
         }
      }
   },
   response: {
      200: {
         description: 'Visão geral do dashboard',
         type: 'object',
         properties: {
            totalCustomers: {
               type: 'number',
               description: 'Total de clientes cadastrados',
            },
            totalSuppliers: {
               type: 'number',
               description: 'Total de fornecedores cadastrados',
            },
            totalInvoices: {
               type: 'number',
               description: 'Total de notas fiscais emitidas',
            },
            totalAccountsPayable: {
               type: 'number',
               description: 'Total de contas a pagar pendentes',
            },
            totalAccountsReceivable: {
               type: 'number',
               description: 'Total de contas a receber pendentes',
            },
            totalOverduePayable: {
               type: 'number',
               description: 'Total de contas a pagar vencidas',
            },
            totalOverdueReceivable: {
               type: 'number',
               description: 'Total de contas a receber vencidas',
            },
            totalPaidThisMonth: {
               type: 'number',
               description: 'Total pago este mês',
            },
            totalReceivedThisMonth: {
               type: 'number',
               description: 'Total recebido este mês',
            },
            cashFlowBalance: {
               type: 'number',
               description: 'Saldo do fluxo de caixa',
            },
            pendingInvoices: {
               type: 'number',
               description: 'Total de notas fiscais',
            },
            monthlyRevenue: {
               type: 'number',
               description: 'Receita mensal',
            },
            monthlyExpenses: {
               type: 'number',
               description: 'Despesas mensais',
            },
         },
         example: {
            totalCustomers: 150,
            totalSuppliers: 75,
            totalInvoices: 320,
            totalAccountsPayable: 25000.50,
            totalAccountsReceivable: 18500.75,
            totalOverduePayable: 5000.00,
            totalOverdueReceivable: 2500.00,
            totalPaidThisMonth: 15000.00,
            totalReceivedThisMonth: 12000.00,
            cashFlowBalance: 45000.25,
            pendingInvoices: 320,
            monthlyRevenue: 35000.00,
            monthlyExpenses: 22000.00,
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

export const getDashboardChartsSchema = {
   description: 'Obtém dados para gráficos do dashboard',
   tags: ['Dashboard'],
   summary: 'Obter dados de gráficos',
   querystring: {
      type: 'object',
      properties: {
         period: {
            type: 'string',
            enum: ['week', 'month', 'quarter', 'year'],
            description: 'Período para os gráficos',
            default: 'month',
         },
         month: {
            type: 'string',
            description: 'Mês e ano no formato MM/YYYY (ex: 08/2025). Se não informado, usa o mês atual.',
         },
         startDate: {
            type: 'string',
            format: 'date',
            description: 'Data de início (opcional)',
         },
         endDate: {
            type: 'string',
            format: 'date',
            description: 'Data de fim (opcional)',
         },
      },
   },
   response: {
      200: {
         description: 'Dados dos gráficos',
         type: 'object',
         properties: {
            accountsPayableChart: {
               type: 'array',
               items: {
                  type: 'object',
                  properties: {
                     label: { type: 'string' },
                     value: { type: 'number' },
                     date: { type: 'string' },
                  },
               },
            },
            accountsReceivableChart: {
               type: 'array',
               items: {
                  type: 'object',
                  properties: {
                     label: { type: 'string' },
                     value: { type: 'number' },
                     date: { type: 'string' },
                  },
               },
            },
            cashFlowChart: {
               type: 'object',
               properties: {
                  entries: {
                     type: 'number',
                     description: 'Total de entradas no período',
                  },
                  exits: {
                     type: 'number', 
                     description: 'Total de saídas no período',
                  },
               },
            },
            entries: {
               type: 'array',
               items: {
                  type: 'object',
                  properties: {
                     label: { type: 'string' },
                     value: { type: 'number' },
                     date: { type: 'string' },
                  },
               },
            },
            exits: {
               type: 'array',
               items: {
                  type: 'object',
                  properties: {
                     label: { type: 'string' },
                     value: { type: 'number' },
                     date: { type: 'string' },
                  },
               },
            },
            monthlyComparisonChart: {
               type: 'object',
               properties: {
                  revenue: {
                     type: 'array',
                     items: {
                        type: 'object',
                        properties: {
                           label: { type: 'string' },
                           value: { type: 'number' },
                           date: { type: 'string' },
                        },
                     },
                  },
                  expenses: {
                     type: 'array',
                     items: {
                        type: 'object',
                        properties: {
                           label: { type: 'string' },
                           value: { type: 'number' },
                           date: { type: 'string' },
                        },
                     },
                  },
               },
            },
            paymentStatusChart: {
               type: 'object',
               properties: {
                  paid: { type: 'number' },
                  pending: { type: 'number' },
                  overdue: { type: 'number' },
               },
            },
            topCostCenters: {
               type: 'array',
               items: {
                  type: 'object',
                  properties: {
                     label: { type: 'string' },
                     value: { type: 'number' },
                  },
               },
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

export const getDashboardTopCustomersSchema = {
   description: 'Obtém os principais clientes por volume financeiro',
   tags: ['Dashboard'],
   summary: 'Obter top clientes',
   querystring: {
      type: 'object',
      properties: {
         limit: {
            type: 'string',
            description: 'Limite de clientes a retornar',
            default: '10',
         },
         period: {
            type: 'string',
            enum: ['month', 'quarter', 'year'],
            description: 'Período para análise',
            default: 'year',
         },
      },
   },
   response: {
      200: {
         description: 'Lista dos principais clientes',
         type: 'array',
         items: {
            type: 'object',
            properties: {
               id: { type: 'string' },
               name: { type: 'string' },
               cnpj: { type: 'string' },
               email: { type: 'string' },
               totalValue: { type: 'number' },
               totalInvoices: { type: 'number' },
               totalReceived: { type: 'number' },
               pendingValue: { type: 'number' },
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

export const getDashboardTopSuppliersSchema = {
   description: 'Obtém os principais fornecedores por volume financeiro',
   tags: ['Dashboard'],
   summary: 'Obter top fornecedores',
   querystring: {
      type: 'object',
      properties: {
         limit: {
            type: 'string',
            description: 'Limite de fornecedores a retornar',
            default: '10',
         },
         period: {
            type: 'string',
            enum: ['month', 'quarter', 'year'],
            description: 'Período para análise',
            default: 'year',
         },
      },
   },
   response: {
      200: {
         description: 'Lista dos principais fornecedores',
         type: 'array',
         items: {
            type: 'object',
            properties: {
               id: { type: 'string' },
               name: { type: 'string' },
               cnpj: { type: 'string' },
               email: { type: 'string' },
               totalValue: { type: 'number' },
               totalAccounts: { type: 'number' },
               totalPaid: { type: 'number' },
               pendingValue: { type: 'number' },
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

export const getDashboardRecentTransactionsSchema = {
   description: 'Obtém as transações mais recentes do sistema',
   tags: ['Dashboard'],
   summary: 'Obter transações recentes',
   querystring: {
      type: 'object',
      properties: {
         limit: {
            type: 'string',
            description: 'Limite de transações a retornar',
            default: '20',
         },
         type: {
            type: 'string',
            enum: ['all', 'payable', 'receivable', 'cash-flow'],
            description: 'Tipo de transações a retornar',
            default: 'all',
         },
      },
   },
   response: {
      200: {
         description: 'Lista das transações recentes',
         type: 'array',
         items: {
            type: 'object',
            properties: {
               id: { type: 'string' },
               type: { type: 'string', enum: ['payable', 'receivable', 'cash-flow'] },
               description: { type: 'string' },
               value: { type: 'number' },
               date: { type: 'string', format: 'date-time' },
               status: { type: 'string' },
               customerName: { type: 'string' },
               supplierName: { type: 'string' },
               documentNumber: { type: 'string' },
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