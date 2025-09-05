import { AppError } from "@/helpers/app-error";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";

export const unlinkReceivableFromCashFlowService = async (data: {
	cashFlowId: string;
}) => {
	const { cashFlowId } = data;

	try {
		return await prisma.$transaction(async (prisma) => {
			const cashFlow = await prisma.cashFlow.findUnique({
				where: { id: cashFlowId },
			});

			if (!cashFlow) {
				throw new AppError("Lançamento do fluxo de caixa não encontrado", 404);
			}

			if (!cashFlow.documentNumber) {
				throw new AppError("Este lançamento não possui vínculo com conta a receber", 400);
			}

			// Buscar a conta a receber vinculada
			const accountReceivable = await prisma.accountsReceivable.findFirst({
				where: {
					documentNumber: cashFlow.documentNumber,
					status: PaymentStatus.PAID,
				},
			});

			// Atualizar o fluxo de caixa removendo o vínculo
			const updatedCashFlow = await prisma.cashFlow.update({
				where: { id: cashFlowId },
				data: {
					documentNumber: null,
				},
			});

			// Se encontrou a conta, reverter o status para PENDING
			if (accountReceivable) {
				await prisma.accountsReceivable.update({
					where: { id: accountReceivable.id },
					data: {
						status: PaymentStatus.PENDING,
						receiptDate: null,
						receivedValue: 0,
						observation: "Desvinculado do fluxo de caixa"
					},
				});
			}

			return updatedCashFlow;
		});
	} catch (error) {
		if (error instanceof AppError) {
			throw error;
		}
		console.error("Erro ao desvincular conta a receber do fluxo de caixa:", error);
		throw new AppError("Erro interno do servidor", 500);
	}
};