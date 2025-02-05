import Joi from "@hapi/joi";

const reprintValidation = Joi.object({
    product_id: Joi.string().required(),
    batch_id: Joi.string().required(),
    SsccCode: Joi.string().required(),
    mac_address: Joi.string().required()
})

export default reprintValidation