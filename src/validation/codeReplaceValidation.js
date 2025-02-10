import Joi from "@hapi/joi";

const codeReplaceValidation = Joi.object({
    product_id: Joi.string().required(),
    batch_id: Joi.string().required(),
    code: Joi.string().required(),
    replace_code: Joi.string().required(),
})

export default codeReplaceValidation;