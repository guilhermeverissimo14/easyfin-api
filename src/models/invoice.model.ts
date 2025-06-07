export interface CreateInvoiceRequest {
   Body: {
      invoiceNumber: string
      customerId: string
      paymentConditionId: string
      issueDate: string
      serviceValue: number
      retainsIss: boolean
      bankAccountId?: string
      costCenterId?: string
      notes?: string
   }
}

export interface UpdateInvoiceRequest {
   Params: { id: string }
   Body: {
      invoiceNumber?: string
      customerId?: string
      paymentConditionId?: string
      issueDate?: string
      serviceValue?: number
      retainsIss?: boolean
      bankAccountId?: string
      costCenterId?: string
      notes?: string
      userId?: string
   }
}

export interface ListInvoicesRequest {
   Querystring: {
      customerId?: string
      bankAccountId?: string
      issueDateStart?: string
      issueDateEnd?: string
   }
}
