import { ResponseCodes } from "../../constant.js";
import prisma from "../../DB/db.config.js";
import { handlePrismaSuccess, handlePrismaError } from "../services/prismaResponseHandler.js";
import lableValidation from "../validation/lableValidation.js";
import moment from "moment/moment.js";
// const PRINTER_IP = "192.168.1.30";
// const PRINTER_PORT = 9100;
import printer from "../services/printer-client.js";
import { readFile } from "fs";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const inputFile = path.resolve(__dirname, "../services/LABLE.prn");

const calculateGtinCheckDigit = input => {
    let sum = 0;
    for (let i = 0; i < 13; i++) {
        const digit = parseInt(input[i]);
        sum += (i + 1) % 2 === 0 ? digit : digit * 3;
    }
    const nearestMultipleOfTen = Math.ceil(sum / 10) * 10;
    const checkDigit = nearestMultipleOfTen - sum;

    console.log("checksum of ", input, " ==> ", checkDigit);
    return checkDigit;
};
const SsccLable = async (req, res) => {
    try {
        const validation = await lableValidation.validateAsync(req.body)
        // console.log(validation); 
        const { SsccCode, SerialNo, mac_address } = validation

        if (!mac_address) {
            return handlePrismaError(
                res, undefined, "mac address not found", ResponseCodes.BAD_REQUEST
            );
        }
        const mac_details = await prisma.printer_allocation.findFirst({
            where: {
                mac_address: mac_address
            }
        });

        if (!mac_details) {
            return handlePrismaError(
                res, undefined, "please define printerip and printPort from setting", ResponseCodes.BAD_REQUEST
            );
        }

        const PRINTER_IP = mac_details.printer_ip;
        const PRINTER_PORT = mac_details.printer_port;
        console.log("PRINTER_IP", PRINTER_IP);
        console.log("PRINTER_PORT", PRINTER_PORT);

        if (!SsccCode) {
            return handlePrismaError(
                res, undefined, "sscc code Not Found", ResponseCodes.BAD_REQUEST
            );
        }

        const uniqueCodeRecord = await prisma.$queryRawUnsafe(`SELECT * FROM sscc_codes WHERE sscc_code =$1`, SsccCode);

        if (uniqueCodeRecord.length < 1) {
            return handlePrismaError(
                res, undefined, "sscc code not found", ResponseCodes.NOT_FOUND
            );
        }
        // console.log("SSCC CODE Record:", uniqueCodeRecord);  

        // for batch table 
        const batch = await prisma.batch.findFirst({
            where: {
                id: uniqueCodeRecord[0].batch_id
            }
        })

        if (!batch) {
            return handlePrismaError(
                res, undefined, "batch not found", ResponseCodes.NOT_FOUND
            );
        }
        // console.log("batch",batch);
        // console.log("product_history_id:",uniqueCodeRecord[0].product_history_id);

        // for product History table 
        const productHistory = await prisma.product_history.findFirst({
            where: {
                id: uniqueCodeRecord[0].product_history_id
            }
        })

        if (!productHistory) {
            return handlePrismaError(
                res, undefined, "product not found", ResponseCodes.NOT_FOUND
            );
        }

        // console.log("productHistory",productHistory);

        // for Unit measurement
        const uom = await prisma.uom.findFirst({
            where: {
                id: productHistory.productNumber_unit_of_measurement
            }
        })
        if (!uom) {
            return handlePrismaError(
                res, undefined, "Unit Measurement Not Found of this Product", ResponseCodes.NOT_FOUND
            );
        }
        // console.log(uom);
        const NumberOfUnit = `01 x ${productHistory.firstLayer} x ${productHistory.productNumber / productHistory.firstLayer} x ${productHistory.no_of_units_in_primary_level} ${uom.uom_name}`;
        // console.log("NumberOfUnit",NumberOfUnit);

        const checkSum = calculateGtinCheckDigit(`5${productHistory.gtin}`);
        const newGTIN = `5${productHistory.gtin}${checkSum}`;
        const date = moment(batch.expiry_date).format('YYMMDD');
        const barcode1 = `01${newGTIN}17${date}10${batch.batch_no}`
        // console.log("barcode1",barcode1);
        const barcode2 = `00${SsccCode}`
        // console.log("barcode2",barcode2);

        try {
            // Read the file content
            readFile(inputFile, "utf8", (err, data) => {
                if (err) {
                    console.error("Error reading file:", err);
                    return handlePrismaError(res, null, "Error reading file", ResponseCodes.INTERNAL_SERVER_ERROR);
                }

                // Connect to the printer and send the modified content
                printer.connect(PRINTER_PORT, PRINTER_IP, () => {
                    console.log("Connected to printer");
                    let modifiedContent = data;

                    const variable = [
                        // "Product Name : ",
                        productHistory.product_name,
                        // "Batch Number :",
                        batch.batch_no,
                        // "Number Of Unit :",
                        NumberOfUnit,
                        // "Manufacturing Date :",
                        moment(batch.manufacturing_date).format('MMM. YYYY'),
                        // "Expiry Date :",
                        moment(batch.expiry_date).format('MMM. YYYY'),
                        // "SSCC :",
                        SsccCode,
                        // "GTIN :",
                        newGTIN,
                        `${SerialNo}`,
                        // "Shipper Number: ",
                        // "2 of ______",
                        // "Gross Wt.:",
                        // "_____",
                        // "Tare Wt.:",
                        // "_____",
                        // "Net Wt.:",
                        // "_____",
                        barcode1,
                        barcode2
                    ];

                    // Replace placeholders with corresponding values
                    variable.forEach((item, index) => {
                        const expression = `V${index + 1}`;
                        const searchExpression = new RegExp(`"${expression}"`, "g");
                        modifiedContent = modifiedContent.replace(
                            searchExpression,
                            `"${item}"`
                        );
                    });

                    // Remove any remaining unused placeholders (e.g., "V10", "V11")
                    modifiedContent = modifiedContent.replace(/"V\d+"/g, '""');

                    printer.write(modifiedContent, () => {
                        // Close the connection after printing
                        printer.destroy();
                        console.log("Printing complete and connection closed");
                        return handlePrismaSuccess(res, "Get lable Details",
                            {
                                ProductName: productHistory.product_name,
                                BatchNumber: batch.batch_no,
                                NumberOfUnits: NumberOfUnit,
                                ManufacturingDate: batch.manufacturing_date,
                                ExpiryDate: batch.expiry_date,
                                GTIN: newGTIN,
                                SSCC: SsccCode,
                                barcode1: barcode1,
                                barcode2: barcode2
                            }
                        );
                    });
                });
                printer.on("error", (err) => {
                    console.error("Printer error:", err);
                    printer.destroy();
                    return handlePrismaError(res, null, "Printer error", ResponseCodes.INTERNAL_SERVER_ERROR);
                });
            });
        } catch (error) {
            console.log("Error to read file", error);
            return handlePrismaError(res, error, "Error to read file", ResponseCodes.INTERNAL_SERVER_ERROR);
        }



        // return handlePrismaSuccess(res, "Get lable Details",
        //                 {
        //                     ProductName : productHistory.product_name ,
        //                     BatchNumber : batch.batch_no,
        //                     NumberOfUnits :NumberOfUnit, 
        //                     ManufacturingDate : batch.manufacturing_date, 
        //                     ExpiryDate : batch.expiry_date, 
        //                     GTIN : newGTIN, 
        //                     SSCC : SsccCode,
        //                     barcode1 : barcode1,
        //                     barcode2: barcode2
        //                 }
        //             );
    }
    catch (error) {
        console.error("Error in Label Details:", error);
        return handlePrismaError(res, error.message || "An unexpected error", ResponseCodes.INTERNAL_SERVER_ERROR);
    }
}
export { SsccLable }