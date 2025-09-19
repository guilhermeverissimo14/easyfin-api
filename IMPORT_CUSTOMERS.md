# Importação de Clientes via Excel

Este documento explica como usar o script de importação de clientes a partir de uma planilha Excel.

## Como usar

1. **Prepare sua planilha Excel:**
   - Coloque o arquivo Excel na raiz do projeto com o nome `import.xlsx`
   - A primeira linha deve conter os cabeçalhos das colunas
   - Os dados dos clientes devem estar nas linhas seguintes

2. **Execute o script:**
   ```bash
   npm run import-customers
   ```

## Estrutura da Planilha

### Colunas Obrigatórias
- **CNPJ**: Documento da empresa (pode ser nomeada como: cnpj, cpfcnpj, documento, doc)
- **Nome**: Nome da empresa (pode ser nomeada como: nome, name, razaosocial, empresa, cliente)

### Colunas Opcionais
- **Email**: E-mail do cliente (pode ser nomeada como: email, mail, correio)
- **Telefone**: Telefone do cliente (pode ser nomeada como: telefone, phone, fone, celular)
- **Endereço**: Endereço completo (pode ser nomeada como: endereco, address, rua, logradouro)
- **CEP**: Código postal (pode ser nomeada como: cep, zipcode, codigopostal)
- **Cidade**: Cidade (pode ser nomeada como: cidade, city, municipio)
- **Estado**: Estado/UF (pode ser nomeada como: estado, state, uf)
- **País**: País (pode ser nomeada como: pais, country)
- **Contato**: Nome do contato (pode ser nomeada como: contato, contact, responsavel)
- **Retenção ISS**: Se retém ISS (pode ser nomeada como: retiss, retencaoiss, iss)

## Exemplo de Planilha

| CNPJ | Nome | Email | Telefone | Endereço | CEP | Cidade | Estado | País | Contato | RetISS |
|------|------|-------|----------|----------|-----|--------|--------|------|---------|--------|
| 12345678000195 | Empresa ABC Ltda | contato@empresaabc.com | 11999999999 | Rua das Flores, 123 | 01234567 | São Paulo | SP | Brasil | João Silva | false |
| 98765432000123 | XYZ Comércio | vendas@xyz.com.br | 21888888888 | Av. Principal, 456 | 87654321 | Rio de Janeiro | RJ | Brasil | Maria Santos | true |

## Validações

O script realiza as seguintes validações:

1. **CNPJ obrigatório**: Deve ter exatamente 14 dígitos
2. **Nome obrigatório**: Deve estar preenchido
3. **CNPJ único**: Não pode haver clientes duplicados
4. **Email único**: Se fornecido, não pode estar em uso por outro cliente
5. **Formatação automática**: CNPJ, telefone e CEP são formatados automaticamente

## Comportamento do Script

- **Clientes existentes**: São ignorados (não sobrescritos)
- **Emails duplicados**: O email é removido para evitar erro, mas o cliente é importado
- **Dados inválidos**: Linhas com dados inválidos são ignoradas e reportadas
- **Log detalhado**: O script mostra o progresso e erros durante a importação

## Relatório de Importação

Ao final, o script exibe um resumo com:
- ✅ Quantidade de clientes importados com sucesso
- ⏭️ Quantidade de clientes ignorados (já existiam)
- ❌ Quantidade de erros encontrados
- 📊 Total de registros processados

## Troubleshooting

### Erro: "Coluna CNPJ não encontrada"
- Verifique se existe uma coluna com um dos nomes aceitos: cnpj, cpfcnpj, documento, doc

### Erro: "Coluna Nome não encontrada"
- Verifique se existe uma coluna com um dos nomes aceitos: nome, name, razaosocial, empresa, cliente

### Erro: "CNPJ inválido"
- O CNPJ deve ter exatamente 14 dígitos numéricos
- Remova pontos, barras e hífens da planilha ou deixe apenas os números

### Erro: "Email já existe"
- O sistema não permite emails duplicados
- O cliente será importado, mas sem o email

## Dicas

1. **Backup**: Sempre faça backup do banco antes de importar
2. **Teste pequeno**: Teste primeiro com poucos registros
3. **Limpeza de dados**: Remova linhas vazias da planilha
4. **Formatação**: Use formato de texto para CNPJ para evitar perda de zeros à esquerda
5. **Encoding**: Salve a planilha em formato Excel (.xlsx) para evitar problemas de encoding

## Suporte

Em caso de dúvidas ou problemas, verifique:
1. Se o arquivo `import.xlsx` está na raiz do projeto
2. Se as variáveis de ambiente estão configuradas (arquivo .env)
3. Se o banco de dados está acessível
4. Os logs detalhados do script para identificar erros específicos