import { AppError } from "@/helpers/app-error";
import { prisma } from "@/lib/prisma";
import { TransactionType } from "@prisma/client";

export const linkReceivableToCashFlowService = async (data: {
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

			if (cashFlow.type !== TransactionType.CREDIT) {
				throw new AppError("Apenas lançamentos de crédito podem ser vinculados a contas a receber", 400);
			}

			const accountReceivable = await prisma.accountsReceivable.findFirst({
				where: {
					documentNumber: documentNumber,
					status: "PENDING",
				},
			});

			if (!accountReceivable) {
				throw new AppError("Conta a receber pendente não encontrada com este número de documento", 404);
			}

			const updatedCashFlow = await prisma.cashFlow.update({
				where: { id: cashFlowId },
				data: {
					documentNumber: documentNumber,
				},
			});

			return updatedCashFlow;
		});
	} catch (error) {
		if (error instanceof AppError) {
			throw error;
		}
		console.error("Erro ao vincular conta a receber ao fluxo de caixa:", error);
		throw new AppError("Erro interno do servidor", 500);
	}
};