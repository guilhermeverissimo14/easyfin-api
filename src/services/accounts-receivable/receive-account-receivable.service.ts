import { PaymentStatus, TransactionType } from "@prisma/client";
import { AppError } from "@/helpers/app-error";
import { prisma } from '@/lib/prisma'

const createCashFlowEntry = async (
	prisma: any,
	date: Date,
	historic: string,
	type: TransactionType,
	description: string | null | undefined,
	value: number,
	costCenterId: string | null | undefined,
	bankAccountId: string | null | undefined,
	cashBoxId: string | null | undefined,
	documentNumber: string | null | undefined,
) => {
	const newEntry = await prisma.cashFlow.create({
		data: {
			date: new Date(date.getTime() - 3 * 60 * 60 * 1000),
			historic,
			type,
			description,
			value,
			balance: 0, // Será recalculado
			costCenterId,
			bankAccountId: bankAccountId || null,
			cashBoxId: cashBoxId || null,
			documentNumber: documentNumber || null, 
		},
	});

	// Recalcula todos os saldos da conta/caixa ordenando por data
	if (bankAccountId) {
		await recalculateBalancesForAccount(prisma, bankAccountId);
	}

	if (cashBoxId) {
		await recalculateBalancesForCashBox(prisma, cashBoxId);
	}

	return newEntry;
};

// Função auxiliar para recalcular saldos de conta bancária
const recalculateBalancesForAccount = async (
	prisma: any,
	bankAccountId: string,
) => {
	const entries = await prisma.cashFlow.findMany({
		where: { bankAccountId },
		orderBy: [{ date: "asc" }, { createdAt: "asc" }],
	});

	let balance = 0;
	for (const entry of entries) {
		balance =
			entry.type === TransactionType.CREDIT
				? balance + entry.value
				: balance - entry.value;
		await prisma.cashFlow.update({
			where: { id: entry.id },
			data: { balance },
		});
	}
};

// Função auxiliar para recalcular saldos de caixa
const recalculateBalancesForCashBox = async (
	prisma: any,
	cashBoxId: string,
) => {
	const entries = await prisma.cashFlow.findMany({
		where: { cashBoxId },
		orderBy: [{ date: "asc" }, { createdAt: "asc" }],
	});

	let balance = 0;
	for (const entry of entries) {
		balance =
			entry.type === TransactionType.CREDIT
				? balance + entry.value
				: balance - entry.value;
		await prisma.cashFlow.update({
			where: { id: entry.id },
			data: { balance },
		});
	}
};

export const receiveAccountReceivableService = async (
	id: string,
	data: {
		fine?: number;
		interest?: number;
		discount?: number;
		observation?: string;
		paymentMethodId?: string;
		receiptDate?: Date;
		costCenterId?: string;
		bankAccountId?: string;
	},
) => {
	const account = await prisma.accountsReceivable.findUnique({
		where: {
			id,
		},
	});

	if (!account) {
		throw new AppError("Conta a receber não encontrada", 404);
	}

	if (account.status === PaymentStatus.PAID) {
		throw new AppError("Esta conta já está recebida", 400);
	}

	const {
		fine = 0,
		interest = 0,
		discount = 0,
		observation,
		paymentMethodId,
		receiptDate,
		costCenterId = account.costCenterId,
	} = data;

	let finalPaymentMethodId =
		paymentMethodId ||
		account.paymentMethodId ||
		account.plannedPaymentMethod ||
		null;

	if (finalPaymentMethodId) {
		const paymentMethodExists = await prisma.paymentMethod.findUnique({
			where: {
				id: finalPaymentMethodId,
			},
		});

		if (!paymentMethodExists) {
			throw new AppError("Método de pagamento não encontrado", 404);
		}
	}

	if (account.value === null || account.value === undefined) {
		throw new AppError("O valor da conta a receber está ausente", 400);
	}

	const amountToReceive = account.value - (discount * 100) + (fine * 100) + (interest * 100);
	const receiptDateUTC = receiptDate || new Date(); // Remover a adição de 3 horas

	try {
		await prisma.$transaction(async (prisma) => {
			const updatedAccount = await prisma.accountsReceivable.update({
				where: {
					id,
				},
				data: {
					fine: fine * 100,
					interest: interest * 100,
					discount: discount * 100,
					observation,
					paymentMethodId: finalPaymentMethodId,
					receiptDate: receiptDateUTC,
					costCenterId,
					status: PaymentStatus.PAID,
					receivedValue: amountToReceive,
				},
			});

			if (data.bankAccountId) {
				const bankAccount = await prisma.bankAccounts.findUnique({
					where: {
						id: data.bankAccountId,
					},
				});

				if (!bankAccount) {
					throw new AppError("Conta bancária não encontrada", 404);
				}

				await prisma.bankTransactions.create({
					data: {
						bankAccountId: bankAccount.id,
						type: TransactionType.CREDIT,
						description: `Recebimento de conta a receber`,
						detailing: observation,
						amount: amountToReceive,
						transactionAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
					},
				});

				const bankBalance = await prisma.bankBalance.findFirst({
					where: {
						bankAccountId: bankAccount.id,
					},
				});

				if (bankBalance) {
					await prisma.bankBalance.update({
						where: {
							id: bankBalance.id,
						},
						data: {
							balance: bankBalance.balance + amountToReceive,
						},
					});
				}

				await createCashFlowEntry(
					prisma,
					receiptDateUTC,
					`Recebimento de conta a receber`,
					TransactionType.CREDIT,
					observation,
					amountToReceive,
					costCenterId,
					bankAccount.id,
					undefined,
					account.documentNumber || null,
				);

				return {
					...updatedAccount,
					value: updatedAccount.value ? updatedAccount.value / 100 : 0,
					receivedValue: updatedAccount.receivedValue
						? updatedAccount.receivedValue / 100
						: 0,
				};
			}

			const cash = await prisma.cashBox.findFirst();

			if (!cash) {
				throw new AppError("Caixa não encontrado", 404);
			}

			await prisma.cashTransaction.create({
				data: {
					cashBoxId: cash.id,
					type: TransactionType.CREDIT,
					description: `Recebimento de conta a receber`,
					amount: amountToReceive,
					transactionAt: new Date(receiptDateUTC.getTime() - 3 * 60 * 60 * 1000),
				},
			});

			await prisma.cashBox.update({
				where: {
					id: cash.id,
				},
				data: {
					balance: {
						increment: amountToReceive,
					},
				},
			});

			await createCashFlowEntry(
				prisma,
				receiptDateUTC,
				`Recebimento de conta a receber`,
				TransactionType.CREDIT,
				observation,
				amountToReceive,
				costCenterId,
				undefined,
				cash.id,
				account.documentNumber || null,
			);

			return {
				...updatedAccount,
				value: updatedAccount.value ? updatedAccount.value / 100 : 0,
				receivedValue: updatedAccount.receivedValue
					? updatedAccount.receivedValue / 100
					: 0,
			};
		});

	} catch (error) {
		throw new AppError("Error receiving account receivable", 500);
	}
};
