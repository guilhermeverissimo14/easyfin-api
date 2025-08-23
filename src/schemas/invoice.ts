export const deleteInvoiceSchema = {
	params: {
		type: "object",
		properties: {
			id: { type: "string", format: "uuid" },
		},
		required: ["id"],
	},
	response: {
		200: {
			type: "object",
			properties: {
				message: { type: "string" },
			},
		},
		400: {
			type: "object",
			properties: {
				message: { type: "string" },
			},
		},
		404: {
			type: "object",
			properties: {
				message: { type: "string" },
			},
		},
	},
};
