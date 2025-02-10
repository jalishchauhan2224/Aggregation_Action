import codeReplaceValidation from "../validation/codeReplaceValidation.js"
import { handlePrismaError, handlePrismaSuccess } from "../services/prismaResponseHandler.js";
import prisma from "../../DB/db.config.js";
import { ResponseCodes } from "../../constant.js";

const replaceCode = async (req, res) => {
    try {
        console.log(req.body)
        const validation = await codeReplaceValidation.validateAsync(req.body);
        console.log(validation);
        const { product_id, batch_id, code, replace_code } = validation

        if (code === replace_code) {
            return handlePrismaError(
                res, undefined, "Both code cannot be same", ResponseCodes.CONFLICT
            );
        }

        const productGen = await prisma.productGenerationId.findFirst({
            where: {
                product_id: product_id
            },
            select: {
                generation_id: true
            }
        })
        console.log("productGen", productGen);

        if (!productGen) {
            return handlePrismaError(
                res, undefined, "Product Code Not Found", ResponseCodes.BAD_REQUEST
            );
        }

        if (!code.startsWith(productGen.generation_id)) {
            return handlePrismaError(
                res, undefined, "Old code not found in selected product", ResponseCodes.BAD_REQUEST
            );
        }

        if (!replace_code.startsWith(productGen.generation_id)) {
            return handlePrismaError(
                res, undefined, "New code not found in selected product", ResponseCodes.BAD_REQUEST
            );
        }

        // Fetch the productCodeLength from superadmin configuration table
        const superConfig = await prisma.superadmin_configuration.findFirst();

        if (!superConfig) {
            return handlePrismaError(
                res, undefined, "Superadmin confing not define", ResponseCodes.BAD_REQUEST
            );
        }
        console.log("product Code Length", superConfig.product_code_length);

        const extractePervCode = code.substring(0, superConfig.product_code_length);
        console.log("Extracted previous uniqueCode:", extractePervCode);

        const extracteNewCode = replace_code.substring(0, superConfig.product_code_length);
        console.log("Extracted New uniqueCode ", extracteNewCode);


        const extractdLevelPrevCode = code.substring(superConfig.product_code_length, superConfig.product_code_length + 1)
        console.log("Extracted level previous Code :", extractdLevelPrevCode);
        const extractdLevelNewCode = replace_code.substring(superConfig.product_code_length, superConfig.product_code_length + 1)
        console.log("Extracted level new code :", extractdLevelNewCode);

        if (extractePervCode != extracteNewCode) {
            return handlePrismaError(
                res, undefined, "Both code must be from same product", ResponseCodes.BAD_REQUEST
            );
        }

        if (extractdLevelPrevCode != extractdLevelNewCode) {
            return handlePrismaError(
                res, undefined, "Both code must be from same level", ResponseCodes.BAD_REQUEST
            );
        }

        const tableName = `${productGen.generation_id.toLowerCase()}${extractdLevelPrevCode}_codes`
        console.log("Table name is ", tableName);


        const pervCodeRecord = await prisma.$queryRawUnsafe(`SELECT * FROM ${tableName} WHERE unique_code =$1`, code);
        console.log("Fetched previous code record:", pervCodeRecord);

        const newCodeRecord = await prisma.$queryRawUnsafe(`SELECT * FROM ${tableName} WHERE unique_code =$1`, replace_code);
        console.log("Fetched new Code record:", newCodeRecord);

        if (pervCodeRecord.length < 1) {
            return handlePrismaError(
                res, undefined, "Old code not found", ResponseCodes.NOT_FOUND
            );
        }

        if (newCodeRecord.length < 1) {
            return handlePrismaError(
                res, undefined, "New code not found", ResponseCodes.NOT_FOUND
            );
        }
        await prisma.$queryRawUnsafe(`UPDATE "${tableName}" SET parent_id = '${pervCodeRecord[0].parent_id}'  WHERE unique_code =$1`, replace_code);
        await prisma.$queryRawUnsafe(`UPDATE "${tableName}" SET parent_id = NULL  WHERE unique_code =$1 `, code)

        handlePrismaSuccess(res, "code replace successfully",
            { product_id: product_id, batch_id: batch_id, code: code, replace_code: replace_code }, null
        )

    } catch (error) {

        if (error.isJoi === true) {
            return handlePrismaError(
                res, undefined, error.details[0].message, ResponseCodes.INTERNAL_SERVER_ERROR
            )
        }
        console.log("Error in codereplace", error);
        return handlePrismaError(res, error, "Error in replace", ResponseCodes.INTERNAL_SERVER_ERROR);
    }
}

export { replaceCode };