import { AppError } from "@/helpers/app-error"
import { PrismaClient, UserRole } from "@prisma/client"


const prisma = new PrismaClient()

export const listSuppliersService = async (userId: string, userRole: string) => {
    try{

        if(userRole !== UserRole.ADMIN){
            throw new AppError('Permissão negada', 403)
        }

        const suppliers = await prisma.supplier.findMany()
        return suppliers

    }catch(error){
        console.error(error)
        throw new AppError('Erro ao listar os fornecedores', 500)
    }
}