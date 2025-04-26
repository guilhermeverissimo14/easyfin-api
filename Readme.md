# Minas Drones Backend

Bem-vindo ao backend do Sistema de Gestão Minas Drones! Este projeto é uma API RESTful construída com Fastify, TypeScript e Prisma, projetada para gerenciar operações de drones de pulverização e outros serviços.

## 🚀 Características

* Autenticação e autorização de usuários
* Gerenciamento de usuários (administradores, gerentes, gerentes locais e pilotos)
* Gestão Financeira com despesas e receitas
* Relatórios, Gráficos e Painel Administrativo por usuário
* Documentação da API com Swagger
* Banco de dados PostgreSQL com Prisma ORM
* Ambiente de desenvolvimento com Docker

## 📋 Pré-requisitos

* Node.js (v14 ou superior)
* npm ou yarn
* Docker e Docker Compose

## 🛠️ Instalação

1. Clone o repositório:

   ```
   git clone https://github.com/edutrindade/minas-drones-backend.git
   cd minas-drones-backend
   ```
2. Instale as dependências:

   ```
   npm install
   ```
3. Configure as variáveis de ambiente:

   * Copie o arquivo `.env.example` para `.env`
   * Preencha as variáveis no `.env` com seus valores
4. Inicie o banco de dados com Docker:

```
   docker-compose up -d
```

5. Execute as migrações do Prisma:

   ```
   npx prisma migrate dev
   ```
6. Inicie o servidor de desenvolvimento:

   ```
   npm run dev
   ```

## 🐳 Usando Docker Compose

O projeto inclui um `docker-compose.yml` para facilitar a configuração do ambiente de desenvolvimento. Para usar:

1. Certifique-se de que o Docker e o Docker Compose estão instalados em sua máquina.
2. No diretório raiz do projeto, execute:
   ```
   docker-compose up -d
   ```

Isso iniciará um container PostgreSQL configurado de acordo com as variáveis definidas no seu arquivo `.env`.

## 📚 Documentação da API

A documentação da API está disponível através do Swagger UI. Após iniciar o servidor, acesse:

```
http://localhost:3333/documentation
```

## 🏃‍♂️ Executando o Projeto

* Para desenvolvimento:
  ```
  npm run dev
  ```
* Para construir o projeto:
  ```
  npm run build
  ```
* Para iniciar em produção:
  ```
  npm start
  ```
