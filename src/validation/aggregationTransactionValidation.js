import Joi from "@hapi/joi"

const AggregationValidation = Joi.object({
    productId: Joi.string().required(),
    batchId: Joi.string().required(),
    esign_status: Joi.string().valid("rejected", "approved", "pending", null),
    status: Joi.string().valid("approved", "pending"),
    audit_log: Joi.object().optional()
})

export default AggregationValidation;