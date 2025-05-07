export const createSupplierSchema = {
    description: 'Cria um novo fornecedor',
    tags: ['Supplier'],
    body: {
       type: 'object',
       properties: {
          cnpj: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email', nullable: true },
          phone: { type: 'string', nullable: true },
          address: { type: 'string', nullable: true },
          zipCode: { type: 'string', nullable: true },
          city: { type: 'string', nullable: true },
          state: { type: 'string', nullable: true },
          country: { type: 'string', nullable: true },
          contact: { type: 'string', nullable: true },
          retIss: { type: 'boolean', default: false },
       },
       required: ['cnpj', 'name'],
    },
    response: {
       201: {
          description: 'Fornecedor criado com sucesso',
          type: 'object',
          properties: {
             id: { type: 'string' },
             cnpj: { type: 'string' },
             name: { type: 'string' },
             email: { type: 'string', format: 'email', nullable: true },
             phone: { type: 'string', nullable: true },
             address: { type: 'string', nullable: true },
             zipCode: { type: 'string', nullable: true },
             city: { type: 'string', nullable: true },
             state: { type: 'string', nullable: true },
             country: { type: 'string', nullable: true },
             contact: { type: 'string', nullable: true },
             retIss: { type: 'boolean' },
             active: { type: 'boolean' },
             createdAt: { type: 'string', format: 'date-time' },
             updatedAt: { type: 'string', format: 'date-time' },
          },
          example: {
             id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
             cnpj: '12.345.678/0001-90',
             name: 'Fornecedor Exemplo Ltda',
             email: 'contato@fornecedorexemplo.com.br',
             phone: '(11) 1234-5678',
             address: 'Rua Exemplo, 123',
             zipCode: '01234-567',
             city: 'São Paulo',
             state: 'SP',
             country: 'Brasil',
             contact: 'João da Silva',
             retIss: false,
             active: true,
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
             message: 'CNPJ já está cadastrado',
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
          description: 'Erro ao criar o fornecedor',
          type: 'object',
          properties: {
             message: { type: 'string' },
          },
          example: {
             message: 'Erro interno do servidor',
          },
       },
    },
 }
 
 export const updateSupplierSchema = {
    description: 'Atualiza um fornecedor existente',
    tags: ['Supplier'],
    body: {
       type: 'object',
       properties: {
          cnpj: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email', nullable: true },
          phone: { type: 'string', nullable: true },
          address: { type: 'string', nullable: true },
          zipCode: { type: 'string', nullable: true },
          city: { type: 'string', nullable: true },
          state: { type: 'string', nullable: true },
          country: { type: 'string', nullable: true },
          contact: { type: 'string', nullable: true },
          retIss: { type: 'boolean', default: false },
       },
       required: [],
    },
    response: {
       200: {
          description: 'Fornecedor atualizado com sucesso',
          type: 'object',
          properties: {
             id: { type: 'string' },
             cnpj: { type: 'string' },
             name: { type: 'string' },
             email: { type: 'string', format: 'email', nullable: true },
             phone: { type: 'string', nullable: true },
             address: { type: 'string', nullable: true },
             zipCode: { type: 'string', nullable: true },
             city: { type: 'string', nullable: true },
             state: { type: 'string', nullable: true },
             country: { type: 'string', nullable: true },
             contact: { type: 'string', nullable: true },
             retIss: { type: 'boolean' },
             active: { type: 'boolean' },
             createdAt: { type: 'string' },
             updatedAt: { type: 'string' },
          },
          example: {
             id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
             cnpj: '12.345.678/0001-90',
             name: 'Fornecedor Exemplo Ltda',
             email: 'contato@fornecedorexemplo.com.br',
             phone: '(11) 1234-5678',
             address: 'Rua Exemplo, 123',
             zipCode: '01234-567',
             city: 'São Paulo',
             state: 'SP',
             country: 'Brasil',
             contact: 'João da Silva',
             retIss: false,
             active: true,
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
             message: 'CNPJ já está cadastrado',
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
          description: 'Permissão negada',
          type: 'object',
          properties: {
             message: { type: 'string' },
          },
          example: {
             message: 'Permissão negada',
          },
       },
       404: {
          description: 'Fornecedor não encontrado',
          type: 'object',
          properties: {
             message: { type: 'string' },
          },
          example: {
             message: 'Fornecedor não encontrado',
          },
       },
       500: {
          description: 'Erro ao atualizar o fornecedor',
          type: 'object',
          properties: {
             message: { type: 'string' },
          },
          example: {
             message: 'Erro interno do servidor',
          },
       },
    },
 }
 
 export const getSupplierByIdSchema = {
    description: 'Busca um fornecedor pelo ID',
    tags: ['Supplier'],
    params: {
       type: 'object',
       properties: {
          id: { type: 'string' },
       },
       required: ['id'],
    },
    response: {
       200: {
          description: 'Fornecedor encontrado',
          type: 'object',
          properties: {
             id: { type: 'string' },
             cnpj: { type: 'string' },
             name: { type: 'string' },
             email: { type: 'string', format: 'email', nullable: true },
             phone: { type: 'string', nullable: true },
             address: { type: 'string', nullable: true },
             zipCode: { type: 'string', nullable: true },
             city: { type: 'string', nullable: true },
             state: { type: 'string', nullable: true },
             country: { type: 'string', nullable: true },
             contact: { type: 'string', nullable: true },
             retIss: { type: 'boolean' },
             active: { type: 'boolean' },
             createdAt: { type: 'string' },
             updatedAt: { type: 'string' },
          },
          example: {
             id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
             cnpj: '12.345.678/0001-90',
             name: 'Fornecedor Exemplo Ltda',
             email: 'contato@fornecedorexemplo.com.br',
             phone: '(11) 1234-5678',
             address: 'Rua Exemplo, 123',
             zipCode: '01234-567',
             city: 'São Paulo',
             state: 'SP',
             country: 'Brasil',
             contact: 'João da Silva',
             retIss: false,
             active: true,
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
       404: {
          description: 'Fornecedor não encontrado',
          type: 'object',
          properties: {
             message: { type: 'string' },
          },
          example: {
             message: 'Fornecedor não encontrado',
          },
       },
       500: {
          description: 'Erro ao buscar o fornecedor',
          type: 'object',
          properties: {
             message: { type: 'string' },
          },
          example: {
             message: 'Erro interno do servidor',
          },
       },
    },
 }
 
 export const listSuppliersSchema = {
    description: 'Lista todos os fornecedores',
    tags: ['Supplier'],
    response: {
       200: {
          description: 'Lista de fornecedores',
          type: 'array',
          items: {
             type: 'object',
             properties: {
                id: { type: 'string' },
                cnpj: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string', format: 'email', nullable: true },
                phone: { type: 'string', nullable: true },
                address: { type: 'string', nullable: true },
                zipCode: { type: 'string', nullable: true },
                city: { type: 'string', nullable: true },
                state: { type: 'string', nullable: true },
                country: { type: 'string', nullable: true },
                contact: { type: 'string', nullable: true },
                retIss: { type: 'boolean' },
                active: { type: 'boolean' },
             },
          },
          example: [
             {
                id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
                cnpj: '12.345.678/0001-90',
                name: 'Fornecedor Exemplo Ltda',
                email: 'contato@fornecedorexemplo.com.br',
                phone: '(11) 1234-5678',
                address: 'Rua Exemplo, 123',
                zipCode: '01234-567',
                city: 'São Paulo',
                state: 'SP',
                country: 'Brasil',
                contact: 'João da Silva',
                retIss: false,
                active: true,
             },
             {
                id: 'b2c3d4e5-f6g7-8901-2345-678901abcdef',
                cnpj: '98.765.432/0001-01',
                name: 'Outro Fornecedor Ltda',
                email: 'outro@fornecedorexemplo.com.br',
                phone: '(21) 9876-5432',
                address: 'Avenida Exemplo, 456',
                zipCode: '98765-432',
                city: 'Rio de Janeiro',
                state: 'RJ',
                country: 'Brasil',
                contact: 'Maria da Silva',
                retIss: true,
                active: false,
             },
          ],
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
       404: {
          description: 'Nenhum fornecedor encontrado',
          type: 'object',
          properties: {
             message: { type: 'string' },
          },
          example: {
             message: 'Nenhum fornecedor encontrado',
          },
       },
       500: {
          description: 'Erro ao buscar os fornecedores',
          type: 'object',
          properties: {
             message: { type: 'string' },
          },
          example: {
             message: 'Erro interno do servidor',
          },
       },
    },
 }
 
 export const toggleSupplierStatusSchema = {
    description: 'Ativa ou desativa um fornecedor existente',
    tags: ['Supplier'],
    params: {
       type: 'object',
       properties: {
          id: { type: 'string' },
       },
       required: ['id'],
    },
    response: {
       200: {
          description: 'Fornecedor atualizado com sucesso',
          type: 'object',
          properties: {
             id: { type: 'string' },
             cnpj: { type: 'string' },
             name: { type: 'string' },
             email: { type: 'string', format: 'email', nullable: true },
             phone: { type: 'string', nullable: true },
             address: { type: 'string', nullable: true },
             zipCode: { type: 'string', nullable: true },
             city: { type: 'string', nullable: true },
             state: { type: 'string', nullable: true },
             country: { type: 'string', nullable: true },
             contact: { type: 'string', nullable: true },
             retIss: { type: 'boolean' },
             active: { type: 'boolean' },
             createdAt: { type: 'string' },
             updatedAt: { type: 'string' },
          },
          example: {
             id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
             cnpj: '12.345.678/0001-90',
             name: 'Fornecedor Exemplo Ltda',
             email: 'contato@fornecedorexemplo.com.br',
             phone: '(11) 1234-5678',
             address: 'Rua Exemplo, 123',
             zipCode: '01234-567',
             city: 'São Paulo',
             state: 'SP',
             country: 'Brasil',
             contact: 'João da Silva',
             retIss: false,
             active: true,
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
       403: {
          description: 'Permissão negada',
          type: 'object',
          properties: {
             message: { type: 'string' },
          },
          example: {
             message: 'Permissão negada',
          },
       },
       404: {
          description: 'Fornecedor não encontrado',
          type: 'object',
          properties: {
             message: { type: 'string' },
          },
          example: {
             message: 'Fornecedor não encontrado',
          },
       },
       500: {
          description: 'Erro ao atualizar o fornecedor',
          type: 'object',
          properties: {
             message: { type: 'string' },
          },
          example: {
             message: 'Erro interno do servidor',
          },
       },
    },
 }
 
 export const deleteSupplierSchema = {
    description: 'Deleta um fornecedor existente',
    tags: ['Supplier'],
    params: {
       type: 'object',
       properties: {
          id: { type: 'string' },
       },
       required: ['id'],
    },
    response: {
       204: {
          description: 'Fornecedor deletado com sucesso',
          type: 'object',
          properties: {},
          example: {},
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
          description: 'Permissão negada',
          type: 'object',
          properties: {
             message: { type: 'string' },
          },
          example: {
             message: 'Permissão negada',
          },
       },
       404: {
          description: 'Fornecedor não encontrado',
          type: 'object',
          properties: {
             message: { type: 'string' },
          },
          example: {
             message: 'Fornecedor não encontrado',
          },
       },
       500: {
          description: 'Erro ao deletar o fornecedor',
          type: 'object',
          properties: {
             message: { type: 'string' },
          },
          example: {
             message: 'Erro interno do servidor',
          },
       },
    },
 }