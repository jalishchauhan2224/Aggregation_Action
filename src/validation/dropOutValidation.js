import Joi from "@hapi/joi"

const dropOutValidattion = Joi.object({
    product_id: Joi.string().required(),
    batch_id: Joi.string().required(),
    dropout_reason : Joi.string().required()
})
const dropoutCodesValidation = Joi.object({
    product_id: Joi.string().required(),
    batch_id: Joi.string().required(),
    dropout_reason : Joi.string().required(),
    dropoutCodes:Joi.array().required()
})
export  {dropOutValidattion,dropoutCodesValidation}