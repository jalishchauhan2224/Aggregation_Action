import Joi from "@hapi/joi"

const AggregationValidation = Joi.object({
    productId: Joi.string().required(),
    batchId:Joi.string().required(),
    esign_status: Joi.string().valid("rejected", "approved", "pending", null),
    audit_log : Joi.object().optional()
})

export default AggregationValidation;