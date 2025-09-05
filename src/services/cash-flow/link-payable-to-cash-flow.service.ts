import { AppError } from "@/helpers/app-error";
import { prisma } from "@/lib/prisma";
import { TransactionType, PaymentStatus } from "@prisma/client";

export const linkPayableToCashFlowService = async (data: {
	cashFlowId: string;
	documentNumber: string;
}) => {
	const { cashFlowId, documentNumber } = data;

	try {
		return await prisma.$transaction(async (prisma) => {
			const cashFlow = await prisma.cashFlow.findUnique({
				where: { id: cashFlowId },
			});

			if (!cashFlow) {
				throw new AppError("Lançamento do fluxo de caixa não encontrado", 404);
			}

			if (cashFlow.type !== TransactionType.DEBIT) {
				throw new AppError("Apenas lançamentos de débito podem ser vinculados a contas a pagar", 400);
			}

			const accountPayable = await prisma.accountsPayable.findFirst({
				where: {
					documentNumber: documentNumber,
					status: "PENDING",
				},
			});

			if (!accountPayable) {
				throw new AppError("Conta a pagar pendente não encontrada com este número de documento", 404);
			}

			// Atualizar o fluxo de caixa com o número do documento
			const updatedCashFlow = await prisma.cashFlow.update({
				where: { id: cashFlowId },
				data: {
					documentNumber: documentNumber,
				},
			});

			// Atualizar o status da conta a pagar para PAID
			await prisma.accountsPayable.update({
				where: { id: accountPayable.id },
				data: {
					status: PaymentStatus.PAID,
					paymentDate: cashFlow.date,
					paidValue: cashFlow.value,
					observation: "Vinculado ao fluxo de caixa"
				},
			});

			return updatedCashFlow;
		});
	} catch (error) {
		if (error instanceof AppError) {
			throw error;
			}
		console.error("Erro ao vincular conta a pagar ao fluxo de caixa:", error);
		throw new AppError("Erro interno do servidor", 500);
	}
};