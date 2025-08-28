import { PrismaClient, PaymentStatus, TransactionType } from "@prisma/client";
import { AppError } from "@/helpers/app-error";
import {
	recalculateCashFlowBalances,
	recalculateCashBoxFlowBalances,
} from "@/utils/recalculate-cash-flow-balances";

const prisma = new PrismaClient();

export const reverseAccountPayableService = async (
	id: string,
	reason: string,
) => {
	// Buscar a conta a pagar
	const account = await prisma.accountsPayable.findUnique({
		where: { id },
	});

	if (!account) {
		throw new AppError("Conta a pagar não encontrada", 404);
	}

	// Validar se a conta está paga
	if (account.status !== PaymentStatus.PAID) {
		throw new AppError(
			"Apenas contas com status PAID podem ser estornadas",
			400,
		);
	}

	// Validar se tem valor pago
	if (!account.paidValue || account.paidValue <= 0) {
		throw new AppError("Conta não possui valor pago para estornar", 400);
	}

	try {
		let bankAccountToRecalculate: string | null = null;
		let cashBoxToRecalculate: string | null = null;

		await prisma.$transaction(async (prisma) => {
			// 1. Buscar transações bancárias relacionadas à liquidação
			const bankTransactions = await prisma.bankTransactions.findMany({
				where: {
					description: { contains: "Liquidação de conta a pagar" },
					amount: account!.paidValue!,
					type: TransactionType.DEBIT,
					createdAt: {
						gte: account.paymentDate || account.updatedAt,
					},
				},
				orderBy: { createdAt: "desc" },
				take: 1,
			});

			// 2. Buscar transações de caixa relacionadas à liquidação
			const cashTransactions = await prisma.cashTransaction.findMany({
				where: {
					description: { contains: "Liquidação de conta a pagar" },
					amount: account!.paidValue!,
					type: TransactionType.DEBIT,
					createdAt: {
						gte: account.paymentDate || account.updatedAt,
					},
				},
				orderBy: { createdAt: "desc" },
				take: 1,
			});

			// 3. Buscar entradas do fluxo de caixa relacionadas
			const cashFlowEntries = await prisma.cashFlow.findMany({
			   where: {
			      documentNumber: account.documentNumber,
			      type: TransactionType.DEBIT,
			      value: account!.paidValue!,
			   },
			   orderBy: { createdAt: "desc" },
			   take: 1,
			});

			// 4. Estornar transações bancárias
			if (bankTransactions.length > 0) {
				const bankTransaction = bankTransactions[0];

				// Criar transação de estorno (crédito)
				await prisma.bankTransactions.create({
					data: {
						bankAccountId: bankTransaction.bankAccountId,
						type: TransactionType.CREDIT,
						description: `Estorno de liquidação de conta a pagar - ${reason}`,
						detailing: `Estorno da transação: ${bankTransaction.id}`,
						amount: account!.paidValue!,
						transactionAt: new Date(),
					},
				});

				// Atualizar saldo da conta bancária
				const bankBalance = await prisma.bankBalance.findFirst({
					where: {
						bankAccountId: bankTransaction.bankAccountId,
					},
				});

				if (bankBalance) {
					await prisma.bankBalance.update({
						where: { id: bankBalance.id },
						data: {
							balance: bankBalance.balance + account!.paidValue!,
						},
					});
				}
			} else {
				// 5. Estornar transações de caixa
				if (cashTransactions.length > 0) {
					const cashTransaction = cashTransactions[0];

					// Criar transação de estorno (crédito)
					await prisma.cashTransaction.create({
						data: {
							cashBoxId: cashTransaction.cashBoxId,
							type: TransactionType.CREDIT,
							description: `Estorno de liquidação de conta a pagar - ${reason}`,
							amount: account!.paidValue!,
							transactionAt: new Date(),
						},
					});

					// Atualizar saldo do caixa
					await prisma.cashBox.update({
						where: { id: cashTransaction.cashBoxId },
						data: {
							balance: {
								increment: account!.paidValue!,
							},
						},
					});
				}
			}

			// 6. Remover entradas do fluxo de caixa
			if (cashFlowEntries.length > 0) {
				const cashFlowEntry = cashFlowEntries[0];

				// Armazenar IDs para recálculo posterior
				if (cashFlowEntry.bankAccountId) {
					bankAccountToRecalculate = cashFlowEntry.bankAccountId;
				}
				if (cashFlowEntry.cashBoxId) {
					cashBoxToRecalculate = cashFlowEntry.cashBoxId;
				}

				// Deletar a entrada do fluxo de caixa
				await prisma.cashFlow.delete({
					where: { id: cashFlowEntry.id },
				});
			}

			// 7. Reverter status da conta para PENDING e limpar campos de liquidação
			await prisma.accountsPayable.update({
				where: { id },
				data: {
					status: PaymentStatus.PENDING,
					paidValue: 0,
					fine: 0,
					interest: 0,
					discount: 0,
					paymentDate: null,
					paymentMethodId: null,
					observation:
						`${account.observation || ""} [ESTORNADO: ${reason}]`.trim(),
				},
			});
		});

		// Recalcular saldos APÓS a transação
		if (bankAccountToRecalculate) {
			await recalculateCashFlowBalances(bankAccountToRecalculate);
		}
		if (cashBoxToRecalculate) {
			await recalculateCashBoxFlowBalances(cashBoxToRecalculate);
		}

		return { message: "Conta a pagar estornada com sucesso" };
	} catch (error) {
		if (error instanceof AppError) {
			throw error;
		}
		throw new AppError(
			"Erro interno do servidor ao estornar conta a pagar",
			500,
		);
	}
};
