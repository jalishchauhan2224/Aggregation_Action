import codeRemapValidation from "../validation/codeRemapValidation.js";
import {
  handlePrismaError,
  handlePrismaSuccess,
} from "../services/prismaResponseHandler.js";
import prisma from "../../DB/db.config.js";
import { ResponseCodes } from "../../constant.js";

const codeRemap = async (req, res) => {
  try {
    const validation = await codeRemapValidation.validateAsync(req.body);
    const { product_id, batch_id, code } = validation;

    const batch = await prisma.batch.findFirst({ where: { id: batch_id }, select: { productHistory: { select: { packagingHierarchy: true }} }});
    console.log("packaging hierarchy " , batch);
    
    const productGen = await prisma.productGenerationId.findFirst({
      where: {
        product_id: product_id,
      },
      select: {
        generation_id: true,
      },
    });

    if (!productGen) {
      return handlePrismaError(
        res,
        undefined,
        "Product code not found",
        ResponseCodes.BAD_REQUEST
      );
    }
    
    const tableMaping = {
        1: [0],
        2: [0, 1],
        3: [0, 1, 2],
        4: [0, 1, 2, 3],
    }

    if (code.startsWith(productGen.generation_id)) {
      //If unique code is there.
      // Fetch the productCodeLength from superadmin configuration table
      const superConfig = await prisma.superadmin_configuration.findFirst();

      if (!superConfig) {
        return handlePrismaError(
          res,
          undefined,
          "Superadmin configuration not defined",
          ResponseCodes.BAD_REQUEST
        );
      }

      const extractedCode = code.substring(0, superConfig.product_code_length);
      const extractdLevel = code.substring(
        superConfig.product_code_length,
        superConfig.product_code_length + 1
      );

      if (productGen.generation_id != extractedCode) {
        return handlePrismaError(
          res,
          undefined,
          "Provided code not found from selected product.",
          ResponseCodes.NOT_FOUND
        );
      }
      // Level is 0
      const tableName = `${productGen.generation_id.toLowerCase()}${extractdLevel}_codes`;
      console.log("Table name is ", tableName);

      const uniqueCodeRecord = await prisma.$queryRawUnsafe(`SELECT id, parent_id FROM "${tableName}" WHERE unique_code = $1`, code);
      console.log("Fetched unique code record:", uniqueCodeRecord);

      if (uniqueCodeRecord.length < 1) {
        return handlePrismaError(
          res,
          undefined,
          "Provided code not found.",
          ResponseCodes.NOT_FOUND
        );
      }

      if (extractdLevel == 0) {
          const updateRecord = await prisma.$queryRawUnsafe(`UPDATE "${tableName}" SET parent_id = NULL WHERE parent_id = CAST($1 AS UUID) RETURNING id`, uniqueCodeRecord[0].parent_id);
          console.log("upDATE code record:", updateRecord);
    
           let id = uniqueCodeRecord[0].parent_id;
           for (let i = 1; i < batch.productHistory.packagingHierarchy; i++) {
                const currentLevel = tableMaping[batch.productHistory.packagingHierarchy][i];
                console.log("currentLevel ", currentLevel);
                const updateRecord = await prisma.$queryRawUnsafe(`UPDATE "${productGen.generation_id.toLowerCase()}${currentLevel}_codes" SET parent_id = NULL WHERE id = CAST($1 AS UUID) RETURNING id`, id);
                console.log("Update record :", updateRecord);
                id = updateRecord[0].id
           }
      }

      handlePrismaSuccess(
        res,
        "Remapping done succesfully",
        { success: true, code: 200 },
      );
    } else {
      // If sscc code is there
      const ssccCodeRecord = await prisma.$queryRawUnsafe(`SELECT id FROM "sscc_codes" WHERE sscc_code = $1`, code);
      console.log("Fetched sscc code record:", ssccCodeRecord);
      let id = [ssccCodeRecord[0].id];
      for (let i = batch.productHistory.packagingHierarchy -1 ; i >=0; i--) {
        console.log("level ", productGen.generation_id.toLowerCase(), i);
        const updateRecord = await prisma.$queryRawUnsafe(`UPDATE "${productGen.generation_id.toLowerCase()}${i}_codes" SET parent_id = NULL WHERE "parent_id" = ANY($1::uuid[]) RETURNING id`, id);
        console.log("Sscc update :", updateRecord);
        id = updateRecord.map(r => r.id);
      }
      handlePrismaSuccess(
        res,
        "Remapping done successfully.",
        { success: true, code: 200 },
        null
      );
    }
 
  } catch (error) {
    if (error.isJoi === true) {
      return handlePrismaError(
        res,
        undefined,
        error.details[0].message,
        ResponseCodes.INTERNAL_SERVER_ERROR
      );
    }
    console.log("Error in remap ", error);
    return handlePrismaError(
      res,
      error,
      "Error in reprint",
      ResponseCodes.INTERNAL_SERVER_ERROR
    );
  }
};

export default codeRemap;
