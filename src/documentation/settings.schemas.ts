export const updateSettingsSchema = {
   description: 'Atualiza as configurações do sistema',
   tags: ['Settings'],
   body: {
      type: 'object',
      properties: {
         cashFlowDefault: { type: 'string', enum: ['CASH', 'BANK'] },
         bankAccountDefault: { type: 'string', nullable: true },
      },
      required: ['cashFlowDefault'],
   },
   response: {
      200: {
         description: 'Configurações atualizadas com sucesso',
         type: 'object',
         properties: {
            cashFlowDefault: { type: 'string', enum: ['CASH', 'BANK'] },
            bankAccountDefault: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
         },
         example: {
            cashFlowDefault: 'BANK',
            bankAccountDefault: 'uuid-bank-account-123',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
         },
      },
      400: {
         description: 'Erro na validação dos dados',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Dados insuficientes para atualizar as configurações',
         },
      },
      401: {
         description: 'Não autorizado',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Usuário não autenticado',
         },
      },
      403: {
         description: 'Acesso negado',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Usuário sem permissão',
         },
      },
      500: {
         description: 'Erro ao atualizar as configurações',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Erro ao atualizar as configurações',
         },
      },
   },
}

export const listSettingsSchema = {
   description: 'Lista as configurações do sistema',
   tags: ['Settings'],
   response: {
      200: {
         description: 'Configurações do sistema',
         type: 'object',
         properties: {
            cashFlowDefault: { type: 'string', enum: ['CASH', 'BANK'] },
            bankAccountDefault: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
         },
         example: {
            cashFlowDefault: 'BANK',
            bankAccountDefault: 'uuid-bank-account-123',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
         },
      },
      401: {
         description: 'Não autorizado',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Usuário não autenticado',
         },
      },
      500: {
         description: 'Erro ao listar as configurações',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Erro ao listar as configurações',
         },
      },
   },
}
