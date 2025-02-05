import Joi from "@hapi/joi";


const printerAllocationValidation = Joi.object({
    printer_ip: Joi.string().ip({version:['ipv4']}).required(),
    printer_port : Joi.number().required(),
    mac_address : Joi.string().required()
})

export default printerAllocationValidation;