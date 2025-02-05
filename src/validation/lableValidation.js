import Joi from "@hapi/joi";

const lableValidation = Joi.object({
    SsccCode: Joi.string().required(),
    SerialNo: Joi.number().required(),
    mac_address: Joi.string().required()
})

export default lableValidation      