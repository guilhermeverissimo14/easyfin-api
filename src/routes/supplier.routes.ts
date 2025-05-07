import SupplierController from "@/controllers/Supplier.controller";
import { deleteCustomerSchema, toggleCustomerStatusSchema } from "@/documentation/customer.schemas";
import { createSupplierSchema, getSupplierByIdSchema, listSuppliersSchema, updateSupplierSchema } from "@/documentation/supplier.schema";
import { authMiddleware } from "@/middleware/auth.middleware";
import { FastifyPluginAsync } from "fastify";

const supplierRoutes: FastifyPluginAsync = async (server) => {
    //Rota para listar fornecedores 
    server.get("/",  {preHandler: authMiddleware, schema: listSuppliersSchema}, SupplierController.list)

    //Rota para criar fornecedor
    server.post("/", {preHandler: authMiddleware, schema: createSupplierSchema}, SupplierController.create)

    //Rota para listar um fornecedor
    server.get("/:id", {preHandler: authMiddleware, schema: getSupplierByIdSchema}, SupplierController.getById)

    //Rota para atualizar um fornecedor
    server.put("/:id", {preHandler: authMiddleware, schema: updateSupplierSchema}, SupplierController.update)

    //Rota para ativar/desativar um fornecedor
    server.patch("/:id/toggle-status", {preHandler: authMiddleware, schema:toggleCustomerStatusSchema}, SupplierController.toggleStatus)

    //Rota para deletar um fornecedor
    server.delete("/:id", {preHandler: authMiddleware, schema:deleteCustomerSchema}, SupplierController.delete)
}

export { supplierRoutes };