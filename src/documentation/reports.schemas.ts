export const getCostCenterAnalysisSchema = {
   description: 'Obtém análise financeira por centro de custo ao longo dos meses do ano',
   tags: ['Reports'],
   summary: 'Análise por Centro de Custo',
   querystring: {
      type: 'object',
      properties: {
         type: {
            type: 'string',
            enum: ['C', 'D'],
            description: 'Tipo de lançamento: C para crédito, D para débito. Se não informado, considera ambos.',
         },
         year: {
            type: 'string',
            pattern: '^[0-9]{4}$',
            description: 'Ano para análise (ex: 2025). Se não informado, usa o ano atual.',
         },
      },
   },
   response: {
      200: {
         description: 'Análise por centro de custo',
         type: 'object',
         properties: {
            year: {
               type: 'number',
               description: 'Ano da análise',
            },
            type: {
               type: 'string',
               enum: ['C', 'D', 'ALL'],
               description: 'Tipo de lançamento analisado',
            },
            months: {
               type: 'array',
               items: {
                  type: 'object',
                  properties: {
                     month: {
                        type: 'number',
                        description: 'Número do mês (1-12)',
                     },
                     monthName: {
                        type: 'string',
                        description: 'Nome do mês',
                     },
                     costCenters: {
                        type: 'array',
                        items: {
                           type: 'object',
                           properties: {
                              id: {
                                 type: 'string',
                                 description: 'ID do centro de custo',
                              },
                              name: {
                                 type: 'string',
                                 description: 'Nome do centro de custo',
                              },
                              balance: {
                                 type: 'number',
                                 description: 'Saldo do centro de custo no mês',
                              },
                           },
                        },
                     },
                  },
               },
            },
         },
      },
      400: {
         description: 'Erro de validação',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
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
            },
         },
      },
   },
}