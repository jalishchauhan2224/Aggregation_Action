import Joi from "@hapi/joi"

const loginSchema = Joi.object({
    userId: Joi.string().required(),
    password:Joi.string().max(20).min(8).required(),
    forceFully: Joi.boolean().optional(),
    audit_logs: Joi.boolean().optional()
});



export default loginSchema