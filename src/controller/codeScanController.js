import prisma from "../../DB/db.config.js";
import { codeValid, codeScanValid } from "../validation/codeScanValidation.js";
import { ResponseCodes } from "../../constant.js";
import { handlePrismaError, handlePrismaSuccess } from "../services/prismaResponseHandler.js";
const scanValidation = async (req, res) => {
  try {
    const validation = await codeValid.validateAsync(req.body);
    //1.
    // Fetch the productCodeLength from superadmin configuration table
    const productConfig = await prisma.superadmin_configuration.findFirst();


    if (!productConfig) {
      return handlePrismaError(
        res, undefined, "Code Length not configured", ResponseCodes.BAD_REQUEST
      );
    }

    const checkPackageLevel = validation.uniqueCode.substring(productConfig.product_code_length, productConfig.product_code_length + 1);
    // Extract the first product_code_length characters from the uniqueCode

    const extractedCode = validation.uniqueCode.substring(0, productConfig.product_code_length);



    // Fetch the product details based on product_id
    const productDetails = await prisma.aggregation_transaction.findFirst({
      where: {
        product_id: validation.productId,
      },
    });
    // console.log("product ", productDetails);
    if (!productDetails) {
      return handlePrismaError(
        res, undefined, "Invalid Product Code", ResponseCodes.NOT_FOUND
      );
    }

    // Validate the generation_id with the extracted code
    (productDetails.product_gen_id != extractedCode)
    if (productDetails.product_gen_id != extractedCode) {
      console.log("Code Scanned from Different Product");
      return handlePrismaError(
        res, undefined, "Code Scanned from Different Product or Invalid Code", ResponseCodes.NOT_FOUND
      );
    }
    else {
      console.log("Product generation Id match ");
    }
    const tableName = `${productDetails.product_gen_id.toLowerCase()}${checkPackageLevel}_codes`
    const uniqueCodeRecord = await prisma.$queryRawUnsafe(`SELECT unique_code FROM ${tableName} WHERE unique_code =$1`, validation.uniqueCode);

    if (uniqueCodeRecord.length < 1) {
      return handlePrismaError(
        res, undefined, "Unique code not found", ResponseCodes.NOT_FOUND
      );
    }


    //Validate package level
    // if (checkPackageLevel != validation.packageLevel) {
    //   console.log("Invalid package level");
    //   return handlePrismaError(
    //     res, undefined, "Code Scanned from different packaging level", ResponseCodes.BAD_REQUEST
    //   );
    // }
    console.log("valid Package level");

    // 3.
    console.log(validation.uniqueCode)
    const batchCheck = await prisma.$queryRawUnsafe(`SELECT batch_id FROM ${tableName} WHERE unique_code = $1`, validation.uniqueCode);
    console.log(batchCheck, validation.batchId)
    if (batchCheck[0].batch_id != validation.batchId) {
      return handlePrismaError(
        res, undefined, "Scanned Code is from different Batch", ResponseCodes.BAD_REQUEST
      );
    }
    console.log("batch_id valid");


    return handlePrismaSuccess(res,
      "Successfully validation  the code");

  } catch (error) {
    console.log(error);
    if (error.isJoi === true) {
      return handlePrismaError(
        res, error, error?.message, ResponseCodes.INTERNAL_SERVER_ERROR
      )
    }
    console.error("Error in scan:", error.message);
    return handlePrismaError(
      res, error, error?.message, ResponseCodes.INTERNAL_SERVER_ERROR
    );
  }
};

const codeScan = async (req, res) => {
  try {
    let serialNo = undefined
    console.log("code scan :", req.body)
    let validation = await codeScanValid.validateAsync(req.body)
    let sscc_code = undefined;
    if (validation.totalProduct == 0) {
      return handlePrismaError(res, null,
        "All level codes have already been scanned.", ResponseCodes.BAD_REQUEST);
    }

    const productDetails = await prisma.aggregation_transaction.findFirst({
      where: {
        transaction_id: validation.transactionId
      },
    });
    console.log("Product Details ", productDetails)
    const productInfo = await prisma.product.findFirst({ where: { id: productDetails.product_id } });
    if (!productInfo) {
      return handlePrismaError(
        res, undefined, "Product is not found", ResponseCodes.NOT_FOUND
      );
    }

    const batchInfo = await prisma.batch.findFirst({ where: { id: productDetails.batch_id } })
    if (!batchInfo) {
      return handlePrismaError(
        res, undefined, "Batch is not found", ResponseCodes.NOT_FOUND
      );
    }

    const tableName = `${productDetails.product_gen_id.toLowerCase()}${validation.currentPackageLevel}_codes`

    console.log(tableName)
    const getTable = await prisma.$queryRawUnsafe(`SELECT * FROM ${tableName} WHERE unique_code = $1`, validation.uniqueCode)
    if (!getTable[0]) {
      return handlePrismaError(
        res, undefined, `unique id of this product is not found at this ${validation.currentPackageLevel} level`, ResponseCodes.NOT_FOUND
      );
    }

    // if (getTable[0].is_scanned) {
    //   return handlePrismaError(
    //     res, undefined, "This code is already scan", ResponseCodes.BAD_REQUEST
    //   );
    // }
    // else {
    //   const Scanned = await prisma.$queryRawUnsafe(`UPDATE ${tableName} SET is_scanned = TRUE WHERE unique_code = $1`, validation.uniqueCode)
    //   
    // }
    // console.log()

    const alreadyScanned = await prisma.scanned_code.findFirst({
      where: {
        OR: [
          {
            [`scanned_${validation.currentPackageLevel}_codes`]: {
              equals: [validation.uniqueCode]
            },
          },
        ],
      },
    });
    console.log(alreadyScanned)
    if (alreadyScanned) {
      return handlePrismaError(
        res, undefined, "Unique code his already scanned", ResponseCodes.BAD_REQUEST
      )
    }


    //     const fieldName = `scanned_${validation.currentPackageLevel}_codes`;
    //     const info = await prisma.scanned_code.findFirst({ where: { transaction_id: validation.transactionId } })
    //     console.log("info :", info)

    //     // if (info && info[`scanned_${validation.currentPackageLevel}_codes`][validation.currentIndex] && info[`scanned_${validation.currentPackageLevel}_codes`][validation.currentIndex][validation.currentIndex + 1]?.includes(validation.uniqueCode)) {
    //     //   return handlePrismaError(res, undefined, "The code has already been scanned. Please use a different code.", ResponseCodes.BAD_REQUEST)
    //     // }

    //     // if (info && validation.packageNo !== 0) {
    //     //   const currentLevelCodes = info[`scanned_${validation.currentPackageLevel}_codes`];
    //     //   console.log(currentLevelCodes)
    //     // if (currentPackageLevel > 0) {


    //     // }
    //     // else {

    //     // }

    //     // // Ensure the index exists in the current level
    //     // if (!currentLevelCodes[validation.currentIndex]) {
    //     //   currentLevelCodes[validation.currentIndex] = {}; // Initialize if not present
    //     // }
    //     // // Ensure the next index exists
    //     // const nextIndex = validation.currentIndex + 1;


    //     // if (!currentLevelCodes[validation.currentIndex][nextIndex]) {
    //     //   currentLevelCodes[validation.currentIndex][nextIndex] = []; // Initialize if not present
    //     // }


    //     // Update the scanned code in the database using Prisma
    //     const data = {
    //       [`scanned_${validation.currentPackageLevel}_codes`]: [{ [nextIndex]: currentLevelCodes[validation.currentIndex][nextIndex] }],
    //     }
    //     // console.log(data[`scanned_${validation.currentPackageLevel}_codes`][validation.currentIndex][nextIndex])
    //     const updateInfo = await prisma.scanned_code.update({
    //       where: {
    //         id: info.id,
    //         transaction_id: validation.transactionId,
    //       },
    //       data: {
    //         ...data
    //         // Send the entire array (not just a single index)
    //       },
    //     });

    //     // Log for debugging
    //     // console.log(currentLevelCodes[validation.currentIndex][nextIndex]);
    //   }
    //     else if (info && validation.packageNo == 0) {
    //   validation.currentIndex = info[`scanned_${validation.currentPackageLevel}_codes`].length + 1

    // }
    // else {
    //   const data = {
    //     transaction_id: validation.transactionId,
    //   };
    //   data[fieldName] = { set: [{ [validation.currentIndex + 1]: [validation.uniqueCode] }] }; // Dynamically set the field
    //   // console.log(data)
    //   const scannedCode = await prisma.scanned_code.create({
    //     data: data,
    //   });
    //   console.log(`Code is store in scanned table ${scannedCode != undefined}`)
    // }

    if (getTable[0].is_aggregated) {
      return handlePrismaError(
        res, undefined, "Already scanned code", ResponseCodes.BAD_REQUEST
      );
    }
    else {
      const aggregated = await prisma.$queryRawUnsafe(`UPDATE ${tableName} SET is_aggregated = TRUE WHERE unique_code = $1`, validation.uniqueCode)
      console.log(aggregated);
      console.log("code aggregated done", aggregated);
    }

    // if (validation.currentPackageLevel > 0) {
    //   const [sscc_code_info] = await prisma.$queryRaw`Select * from sscc_codes where "product_id"=${productDetails.product_id}::uuid AND "batch_id"=${productDetails.batch_id}::uuid AND serial_no is NOT NULL AND printed=false  ORDER BY sscc_code ASC LIMIT 1`;

    //   if (!sscc_code_info) {
    //     return handlePrismaError(
    //       res, undefined, "SSCC record is not found", ResponseCodes.NOT_FOUND
    //     )
    //   }


    //   await prisma.$executeRaw` 
    //     UPDATE "sscc_codes"
    //     SET "printed" = true
    //     WHERE "sscc_codes".id = ${sscc_code_info.id}::uuid ;
    //   `;
    // }



    if (validation.quantity > 0) {
      validation.quantity--;
    }
    validation.totalProduct--;
    validation.perPackageProduct--;
    if (validation.packageNo == 0 && validation.totalProduct == 1) {
      validation.currentPackageLevel = 5
    }
    else {
      if (validation.quantity == 0) {
        if (validation.perPackageProduct == 1) {
          validation.packageNo--;
        }
        if (validation.packageNo == 0 && validation.totalProduct == 1) {
          validation.currentPackageLevel = 5
        }
        else if (validation.perPackageProduct == 0) {
          validation.currentPackageLevel = 0
        }
        else {
          validation.currentPackageLevel++;
          validation.currentIndex = 0
        }
      }
    }
    console.log("Response of code scan ")
    if (validation.quantity == 0) {

      const [ssccInfo] = await prisma.$queryRaw`Select * from sscc_codes where "product_id"=${productDetails.product_id}::uuid AND pack_level=${validation.currentPackageLevel} AND "batch_id"=${productDetails.batch_id}::uuid AND serial_no is NULL  ORDER BY sscc_code ASC LIMIT 1`;
      console.log("SSCC info------>", ssccInfo)
      if (!ssccInfo) {
        return handlePrismaError(
          res, undefined, "SSCC record is not found", ResponseCodes.NOT_FOUND
        )
      }
      const ssccInfo_not_null = (await prisma.$executeRaw` Select * from sscc_codes where "product_id"=${productDetails.product_id}::uuid AND pack_level=${validation.currentPackageLevel} AND "batch_id"=${productDetails.batch_id}::uuid AND serial_no is NOT NULL  ORDER BY sscc_code`) + 1
      console.log("not null :", ssccInfo_not_null)
      console.log(ssccInfo)
      const ssccInfoUpdate = await prisma.$executeRaw` 
        UPDATE "sscc_codes"
        SET "serial_no" = ${ssccInfo_not_null + 1}
        WHERE "sscc_codes".id = ${ssccInfo.id}::uuid ;
      `;

      if (!ssccInfoUpdate) {
        console.log(`SSCC information for ID ${ssccInfo.id} is not updated.`)
        return handlePrismaError(
          res, undefined, "We encountered an issue while updating the information. Please ensure the data is valid and try again.", ResponseCodes.BAD_REQUEST
        )
      }

      serialNo = ssccInfo_not_null + 1

      sscc_code = ssccInfo.sscc_code;
      console.log(`SSCC information for ID ${ssccInfo.id} is updated.`)
    }

    console.log({ packageNo: validation.packageNo, currentPackageLevel: validation.checkPackageLevel, quantity: validation.quantity, perPackageProduct: validation.perPackageProduct, totalLevel: validation.totalLevel, totalProduct: validation.totalProduct, currentIndex: validation.currentIndex, currentPackageLevel: validation.currentPackageLevel })
    return handlePrismaSuccess(res,
      "Barcode scanned successfully.",
      { packageNo: validation.packageNo, currentPackageLevel: validation.checkPackageLevel, quantity: validation.quantity, perPackageProduct: validation.perPackageProduct, totalLevel: validation.totalLevel, totalProduct: validation.totalProduct, currentIndex: validation.currentIndex, currentPackageLevel: validation.currentPackageLevel, transactionId: validation.transactionId, sscc_code, serialNo }
    );
  }
  catch (error) {

    if (error.isJoi === true) {
      return handlePrismaError(
        res, undefined, error?.message, ResponseCodes.INTERNAL_SERVER_ERROR
      )
    }
    console.error("Error in scan:", error);
    return handlePrismaError(
      res, undefined, error?.message, ResponseCodes.INTERNAL_SERVER_ERROR
    );
  }
}
export { scanValidation, codeScan };