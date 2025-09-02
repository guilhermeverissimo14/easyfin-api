import { AppError } from "@/helpers/app-error";
import { UserRole } from "@prisma/client";
import { prisma } from '@/lib/prisma'

export const toggleSupplierService = async (id: string, userRole: string) => {
    const supplier = await prisma.supplier.findUnique({ where: { id } })

    if (!supplier) {
        throw new AppError("Fornecedor não encontrado", 404)
    }

    if (userRole === UserRole.ADMIN) {
        const updatedSupplier = await prisma.supplier.update({
            where: { id },
            data: { 
                active: !supplier.active, 
            },
        })
        return updatedSupplier
    }

    throw new AppError("Acesso negado", 403)
}
