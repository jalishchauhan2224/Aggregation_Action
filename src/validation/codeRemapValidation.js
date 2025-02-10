import Joi from "@hapi/joi";

const codeRemapValidation = Joi.object({
    product_id : Joi.string().required(),
    batch_id : Joi.string().required(),
    code : Joi.string().required()
})

export default codeRemapValidation