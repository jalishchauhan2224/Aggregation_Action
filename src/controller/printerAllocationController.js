import Joi from "@hapi/joi";
import { ResponseCodes } from "../../constant.js";
import prisma from "../../DB/db.config.js"
import { handlePrismaError, handlePrismaSuccess } from "../services/prismaResponseHandler.js";
import printerAllocationValidation from "../validation/printerAllocationValidation.js"
const printerAllocation = async (req, res) => {
    try {
        console.log(req.body)
        const validation = await printerAllocationValidation.validateAsync(req.body)
        console.log(validation);
        const { printer_ip, printer_port, mac_address } = validation;

        console.log("printer ip", printer_ip);
        console.log("printer port", printer_port);
        console.log("mac_address", mac_address);

        const printerInfo = await prisma.printer_allocation.findFirst({
            where: {
                mac_address: mac_address
            }
        });

        console.log("printerInfo", printerInfo);
        if (!printerInfo) {
            const createData = await prisma.printer_allocation.create({
                data: {
                    mac_address: mac_address,
                    printer_ip: printer_ip,
                    printer_port: printer_port
                }
            })
            console.log("createData", createData);
            handlePrismaSuccess(res, "Printer ip address and port is added successfully!", {}, ResponseCodes.CREATED)
        } else {
            const updateConnection = await prisma.printer_allocation.update({
                where: {
                    mac_address: printerInfo.mac_address
                },
                data: {
                    printer_ip: printer_ip,
                    printer_port: printer_port
                }
            })
            console.log("updateConnection", updateConnection);
            handlePrismaSuccess(res, "Updated printer ip and port successfully", {}, ResponseCodes.OK)
        }
    } catch (error) {
        console.error("Error in printer Allocation", error);
        return handlePrismaError(res, error, error.message || "An unexpected error", ResponseCodes.INTERNAL_SERVER_ERROR);
    }
}

const getPrinterAllocation = async (req, res) => {
    try {
        const { mac_address } = req.params
        if (!mac_address) {
            handlePrismaError(res, undefined, "not able to get", ResponseCodes.BAD_REQUEST)
        }
        console.log("mac_address", mac_address);
        const getDetails = await prisma.printer_allocation.findUnique({
            where: {
                mac_address: mac_address
            },
            select: {
                printer_ip: true,
                printer_port: true
            }
        })

        if (!getDetails) {
            handlePrismaSuccess(res, "get ip and port successfull", {
                printer_ip: "",
                printer_port: ""
            })
            return;
        }
        console.log("getDetails", getDetails);
        handlePrismaSuccess(res, "get ip and port successfull", {
            printer_ip: getDetails.printer_ip,
            printer_port: getDetails.printer_port
        })
    } catch (error) {
        console.log(error);
        return handlePrismaError(
            res, error, error?.message, ResponseCodes.INTERNAL_SERVER_ERROR
        );
    }
};



export { getPrinterAllocation, printerAllocation }