import Joi from "@hapi/joi"

const dropOutValidattion = Joi.object({
    product_id: Joi.string().required(),
    batch_id: Joi.string().required(),
    dropout_reason: Joi.string().required(),
    audit_log: Joi.object().optional()
})
const dropoutCodesValidation = Joi.object({
    product_id: Joi.string().required(),
    batch_id: Joi.string().required(),
    dropout_reason: Joi.string().required(),
    dropoutCodes: Joi.array().required(),
    audit_log: Joi.object().optional()
})
export { dropOutValidattion, dropoutCodesValidation }