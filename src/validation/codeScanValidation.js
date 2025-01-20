import Joi from "@hapi/joi"

const codeValid = Joi.object({
    uniqueCode: Joi.string().required(),
    productId : Joi.string().required(),
    batchId : Joi.string().required(),
    packageLevel: Joi.number().integer().required(),
    package: Joi.number().integer().required(),
    quantity: Joi.number().integer().required(),
})
  

export default codeValid