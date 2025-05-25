-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'OVERDUE');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "birthdate" TIMESTAMP(3),
    "phone" TEXT,
    "cpf_cnpj" TEXT,
    "avatar" TEXT,
    "token" TEXT,
    "recovery_code" TEXT,
    "first_access" BOOLEAN NOT NULL DEFAULT true,
    "failed_attempts" INTEGER NOT NULL DEFAULT 0,
    "last_login" TIMESTAMP(3),
    "password_reset_at" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "zip_code" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "contact" TEXT,
    "ret_iss" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fornecedores" (
    "id" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "zip_code" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "contact" TEXT,
    "ret_iss" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fornecedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "centro_custos" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "centro_custos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aliquotas" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "issqn_tax_rate" DOUBLE PRECISION NOT NULL,
    "effective_tax_rate" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aliquotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caixa" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "caixa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transacoes_caixa" (
    "id" TEXT NOT NULL,
    "cash_box_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "TransactionType" NOT NULL,
    "transaction_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transacoes_caixa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contas_bancarias" (
    "id" TEXT NOT NULL,
    "bank" TEXT NOT NULL,
    "agency" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "type" TEXT DEFAULT 'C',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contas_bancarias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saldo_bancario" (
    "id" TEXT NOT NULL,
    "bank_account_id" TEXT NOT NULL,
    "balance" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saldo_bancario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transacoes_bancarias" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "detailing" TEXT,
    "type" "TransactionType" NOT NULL,
    "csv" BOOLEAN DEFAULT false,
    "csv_file_name" TEXT,
    "bank_account_id" TEXT NOT NULL,
    "reason_for_cancellation" TEXT,
    "transaction_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "cancelled_at" TIMESTAMP(3),

    CONSTRAINT "transacoes_bancarias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formas_pagamento" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "requires_bank" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "formas_pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "condicoes_pagamento" (
    "id" TEXT NOT NULL,
    "payment_method_id" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "description" TEXT,
    "installments" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "condicoes_pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contas_pagar" (
    "id" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "document_number" TEXT,
    "document_date" TIMESTAMP(3),
    "launch_date" TIMESTAMP(3),
    "due_date" TIMESTAMP(3),
    "payment_date" TIMESTAMP(3),
    "value" INTEGER,
    "value_paid" INTEGER,
    "discount" INTEGER,
    "fine" INTEGER,
    "interest" INTEGER,
    "installment_number" INTEGER,
    "total_installments" INTEGER,
    "cost_center_id" TEXT,
    "planned_payment_method" TEXT,
    "payment_method_id" TEXT,
    "user_id" TEXT,
    "observation" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "cancelled_at" TIMESTAMP(3),

    CONSTRAINT "contas_pagar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contas_receber" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "document_number" TEXT,
    "document_date" TIMESTAMP(3),
    "launch_date" TIMESTAMP(3),
    "due_date" TIMESTAMP(3),
    "receipt_date" TIMESTAMP(3),
    "value" INTEGER,
    "received_value" INTEGER,
    "discount" INTEGER,
    "fine" INTEGER,
    "interest" INTEGER,
    "installment_number" INTEGER,
    "total_installments" INTEGER,
    "cost_center_id" TEXT,
    "bank_account_id" TEXT,
    "planned_payment_method" TEXT,
    "payment_method_id" TEXT,
    "user_id" TEXT,
    "observation" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "cancelled_at" TIMESTAMP(3),

    CONSTRAINT "contas_receber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faturas" (
    "id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "payment_condition_id" TEXT NOT NULL,
    "issue_date" TIMESTAMP(3) NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "service_value" INTEGER NOT NULL,
    "retains_iss" BOOLEAN NOT NULL,
    "issqn_tax_rate" DOUBLE PRECISION,
    "effective_tax_rate" DOUBLE PRECISION,
    "issqn_value" INTEGER,
    "net_value" INTEGER,
    "effective_tax" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faturas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_cnpj_key" ON "clientes"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_email_key" ON "clientes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "fornecedores_cnpj_key" ON "fornecedores"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "fornecedores_email_key" ON "fornecedores"("email");

-- AddForeignKey
ALTER TABLE "transacoes_caixa" ADD CONSTRAINT "transacoes_caixa_cash_box_id_fkey" FOREIGN KEY ("cash_box_id") REFERENCES "caixa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saldo_bancario" ADD CONSTRAINT "saldo_bancario_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "contas_bancarias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacoes_bancarias" ADD CONSTRAINT "transacoes_bancarias_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "contas_bancarias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "condicoes_pagamento" ADD CONSTRAINT "condicoes_pagamento_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "formas_pagamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contas_pagar" ADD CONSTRAINT "contas_pagar_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "fornecedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contas_pagar" ADD CONSTRAINT "contas_pagar_cost_center_id_fkey" FOREIGN KEY ("cost_center_id") REFERENCES "centro_custos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contas_pagar" ADD CONSTRAINT "contas_pagar_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "formas_pagamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contas_receber" ADD CONSTRAINT "contas_receber_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contas_receber" ADD CONSTRAINT "contas_receber_cost_center_id_fkey" FOREIGN KEY ("cost_center_id") REFERENCES "centro_custos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contas_receber" ADD CONSTRAINT "contas_receber_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "contas_bancarias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contas_receber" ADD CONSTRAINT "contas_receber_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "formas_pagamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faturas" ADD CONSTRAINT "faturas_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faturas" ADD CONSTRAINT "faturas_payment_condition_id_fkey" FOREIGN KEY ("payment_condition_id") REFERENCES "condicoes_pagamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
