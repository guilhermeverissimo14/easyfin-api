import { AppError } from "@/helpers/app-error";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma  = new PrismaClient();

export const deleteSupplierService = async (id: string, userRole: string) => {
    const supplier = await prisma.supplier.findUnique({ where: { id } });

    if (!supplier) {
        throw new AppError('Fornecedor não encontrado', 404);
    }

    if (userRole === UserRole.ADMIN) {
        await prisma.supplier.delete({
            where: { id },
        });
        return supplier;
    }

    throw new AppError('Acesso negado', 403);
}