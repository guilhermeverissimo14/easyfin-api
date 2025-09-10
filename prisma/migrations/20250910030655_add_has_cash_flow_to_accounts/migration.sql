-- AlterTable
ALTER TABLE "contas_pagar" ADD COLUMN     "has_cash_flow" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "contas_receber" ADD COLUMN     "has_cash_flow" BOOLEAN NOT NULL DEFAULT true;
