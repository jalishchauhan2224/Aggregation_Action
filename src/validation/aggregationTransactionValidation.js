import Joi from "@hapi/joi"

const AggregationValidation = Joi.object({
    productId: Joi.string().required(),
    batchId: Joi.string().required(),
    esign_status: Joi.string().valid("rejected", "approved", "pending", null),
    status: Joi.string().valid("approved", "pending"),
    audit_log: Joi.object().optional()
});


export const aggregationTransactionCurrentStateValidation = Joi.object({
    aggregatedTransactionId: Joi.string().required(),
    packageNo: Joi.number().required(),
    currentPackageLevel: Joi.number().required(),
    quantity: Joi.number().required(),
    perPackageProduct: Joi.number().required(),
    totalLevel: Joi.number().required(),
    totalProduct: Joi.number().required(),
    currentIndex: Joi.number().optional(),
    scannedCodes: Joi.array().required()
})

export default AggregationValidation;