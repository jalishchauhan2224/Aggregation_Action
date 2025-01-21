import Joi from "@hapi/joi"

const codeValid = Joi.object({
    uniqueCode: Joi.string().required(),
    productId : Joi.string().required(),
    batchId : Joi.string().required(),
    packageLevel: Joi.number().integer().required(),
    package: Joi.number().integer().required(),
    quantity: Joi.number().integer().required(),
})

const codeScanValid = Joi.object({
    uniqueCode : Joi.string().required(),
    transactionId : Joi.string().required(),
    currentPackageLevel : Joi.number().required(),
    packageNo : Joi.number().required(),
    quantity : Joi.number().required(),
    totalLevel : Joi.number().required(),
    perPackageProduct : Joi.number().required(),
    totalProduct : Joi.number().required(),
})
  

export {codeValid,codeScanValid}