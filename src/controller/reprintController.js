import { ResponseCodes } from "../../constant.js";
import prisma from "../../DB/db.config.js";
import { readFile } from "fs";
import printer from "../services/printer-client.js";
import reprintValidation from "../validation/reprintValidation.js"
const PRINTER_IP = "192.168.1.242";
const PRINTER_PORT = 9100;

import { fileURLToPath } from "url";
import path from "path";
import { handlePrismaError, handlePrismaSuccess } from "../services/prismaResponseHandler.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const inputFile = path.resolve(__dirname, "../services/TEST2.prn");

const reprint = async (req, res) => {
  const validation = await reprintValidation.validateAsync(req.body)
  try {
    console.log("reprint body ", req.body);

    // Check product id and batch id
    if (!validation.product_id || !validation.batch_id || !validation.code) {
      return handlePrismaError(res, null, "Missing required fields", ResponseCodes.BAD_REQUEST);
    }

    // find product id from batch table
    const batchDetails = await prisma.batch.findFirst({
      where: {
        id: validation.batch_id,
      },
      select: {
        batch_no: true,
        manufacturing_date: true,
        expiry_date: true,
        productHistory: true,
      },
    });

    // check batch id is found or not
    if (!batchDetails || !batchDetails.productHistory) {
      return handlePrismaError(res, null, "Batch details or product history not found", ResponseCodes.NOT_FOUND);
    }

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
            "Batch No.",
            batchDetails.batch_no,
            "Mfg. Date",
            new Date(batchDetails.manufacturing_date).toDateString(),
            "Exp. Date",
            new Date(batchDetails.expiry_date).toDateString(),
            "Product Name",
            batchDetails.productHistory.product_name,
            `Code ${validation.code}`,
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
            return handlePrismaSuccess(res, "Reprint successfully");
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
  } catch (error) {
    console.log("Error in reprint ", error);
    return handlePrismaError(res, error, "Error in reprint", ResponseCodes.INTERNAL_SERVER_ERROR);
  }
};

export { reprint };
