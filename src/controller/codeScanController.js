import prisma from "../../DB/db.config.js";
import codeValid from "../validation/codeScanValidation.js";
import { ResponseCodes } from "../../constant.js";
import { handlePrismaError, handlePrismaSuccess } from "../services/prismaResponseHandler.js";
const scanValidation = async (req, res) => {

  try {
    const validation = await codeValid.validateAsync(req.body);

    console.log(validation);
    console.log("uniqueCode:", validation.uniqueCode);
    console.log("productId:", validation.productId);
    console.log("BatchId", validation.batchId);

    //1.
    // Fetch the productCodeLength from superadmin configuration table
    const productConfig = await prisma.superadmin_configuration.findFirst();

    if (!productConfig) {
      return handlePrismaError(
        res, undefined, "Code Length not configured", ResponseCodes.BAD_REQUEST
      );
    }

    console.log("productCodeLength", productConfig.product_code_length);

    // Extract the first product_code_length characters from the uniqueCode
    const extractedCode = validation.uniqueCode.substring(0, productConfig.product_code_length);
    console.log("Extracted uniqueCode:", extractedCode);

    // Fetch the product details based on product_id
    const productDetails = await prisma.aggregation_transaction.findFirst({
      where: {
        product_id: validation.productId,
      },
    });
    console.log(productDetails);

    if (!productDetails) {
      return handlePrismaError(
        res, undefined, "Invalid Product Code", ResponseCodes.NOT_FOUND
      );
    }
    console.log("product_gen_id", productDetails.product_gen_id);

    // Validate the generation_id with the extracted code
    if (productDetails.product_gen_id != extractedCode) {
      console.log("Code Scanned from Different Product");
      return handlePrismaError(
        res, undefined, "Code Scanned from Different Product or Invalid Code", ResponseCodes.NOT_FOUND
      );
    }
    else {
      console.log("Product generation Id match ");
    }
    console.log("......................");


    // 2. 
    const tableName = `${productDetails.product_gen_id.toLowerCase()}${validation.packageLevel}_codes`
    console.log("Table name is ", tableName);
    const uniqueCodeRecord = await prisma.$queryRawUnsafe(`SELECT unique_code FROM ${tableName} WHERE unique_code =$1`, validation.uniqueCode);

    console.log("Fetched unique code record:", uniqueCodeRecord);
    console.log(uniqueCodeRecord);

    if (!uniqueCodeRecord) {
      return handlePrismaError(
        res, undefined, "Unique code not found", ResponseCodes.NOT_FOUND
      );
    }

    const checkPackageLevel = validation.uniqueCode.substring(productConfig.product_code_length, productConfig.product_code_length + 1);
    console.log("check Package Level", checkPackageLevel);

    //Validate package level
    if (checkPackageLevel != validation.packageLevel) {
      console.log("Invalid package level");
      return handlePrismaError(
        res, undefined, "Code Scanned from different packaging level", ResponseCodes.BAD_REQUEST
      );
    }
    console.log("valid Package level");

    // 3.
    const batchCheck = await prisma.$queryRawUnsafe(`SELECT batch_id FROM ${tableName} WHERE unique_code = $1`, validation.uniqueCode);
    console.log(batchCheck);

    console.log("batch id from dynamic table  ", batchCheck[0].batch_id);
    if (batchCheck[0].batch_id != validation.batchId) {
      return handlePrismaError(
        res, undefined, "Scanned Code is from different Batch", ResponseCodes.BAD_REQUEST
      );
    }
    console.log("batch_id valid");


    // 4.
    const getTable = await prisma.$queryRawUnsafe(`SELECT * FROM ${tableName} WHERE unique_code = $1`, validation.uniqueCode)
    // console.log("get table ",getTable);
    console.log(getTable[0]);
    console.log("get is Scanned", getTable[0].is_scanned);

    if (getTable[0].is_scanned) {
      console.log("already scanned");
      return handlePrismaError(
        res, undefined, "Code is Already Scanned", ResponseCodes.CONFLICT
      );
    }
    else {
      const Scanned = await prisma.$queryRawUnsafe(`UPDATE ${tableName} SET is_scanned = TRUE WHERE unique_code = $1`, validation.uniqueCode)
      console.log(Scanned);
      console.log("code scanned done", Scanned);
    }

    // because validation 
    let validationQuantity = validation.quantity;
    let validatePackaged = validation.package

    validationQuantity--;
    if (validationQuantity == 0) {
      validatePackaged--
    }
    return handlePrismaSuccess(res,
      "Successfully scanned",
      { validationQuantity, validatePackaged, currentLevel: validation.packageLevel }
    );

  } catch (error) {
    console.log(error);
    if (error.isJoi === true) {
      return handlePrismaError(
        res, undefined, error.details[0].message, ResponseCodes.INTERNAL_SERVER_ERROR
      )
    }
    console.error("Error in scan:", error.message);
    return handlePrismaError(
      res, undefined, error.details[0].message, ResponseCodes.INTERNAL_SERVER_ERROR
    );
  }
};

const codeScan = async (req, res) => {
  try {
    // console.log(req.body)
    let { uniqueCode, transaction_id, totalLevel, totalProduct, currentPackageLevel, packaged, quantity, perPackageProduct } = req.body;
    // const productConfig = await prisma.superadmin_configuration.findFirst();
    if (currentPackageLevel == 5 && totalProduct == 0) {
      return res.status(200).send({ message: "All code are scanned" })
    }
    const productDetails = await prisma.aggregation_transaction.findFirst({
      where: {
        transaction_id: transaction_id
      },
    });
    const productInfo = await prisma.product.findFirst({ where: { id: productDetails.product_id } });
    if (!productInfo) {
      res.status(404).json({ message: "Product is not found" });
      return;
    }


    const batchInfo = await prisma.batch.findFirst({ where: { id: productDetails.batch_id } })
    if (!batchInfo) {
      res.status(404).json({ message: "Batch is not found" });
      return;
    }
    const tableName = `${productDetails.product_gen_id.toLowerCase()}${currentPackageLevel}_codes`
    console.log(tableName)

    const getTable = await prisma.$queryRawUnsafe(`SELECT * FROM ${tableName} WHERE unique_code = $1`, uniqueCode)
    // console.log("get table ",getTable);
    if (!getTable[0]) {
      res.status(400).json({ message: "This code is already scan" });
      return;
    }
    console.log(getTable[0]);
    console.log("get is Scanned", getTable[0].is_scanned);

    if (getTable[0].is_scanned) {
      console.log("This code is already scan");
      res.status(400).json({ message: "This code is already scan" });
      return;
    }
    else {
      const Scanned = await prisma.$queryRawUnsafe(`UPDATE ${tableName} SET is_scanned = TRUE WHERE unique_code = $1`, uniqueCode)
      console.log(Scanned);
      console.log("code scanned done", Scanned);
    }

    if (getTable[0].is_scanned) {
      console.log("inValid all Ready scanned");
      res.status(400).json({ message: " inValid allReady scanned" });
      return;
    }
    else {
      const Scanned = await prisma.$queryRawUnsafe(`UPDATE ${tableName} SET is_scanned = TRUE WHERE unique_code = $1`, uniqueCode)
      console.log(Scanned);
      console.log("code scanned done", Scanned);
    }

    if (getTable[0].is_aggregated) {
      console.log("Invalid all ready aggregated");
      res.status(400).json({ message: " inValid allReady scanned" });
      return;
    }
    else {
      const Scanned = await prisma.$queryRawUnsafe(`UPDATE ${tableName} SET is_aggregated = TRUE WHERE unique_code = $1`, uniqueCode)
      console.log(Scanned);
      console.log("code scanned done", Scanned);
    }
    if (quantity > 0) {
      quantity--;
    }
    totalProduct--;
    perPackageProduct--;
    if (packaged == 0 && totalProduct == 1) {
      // perPackageProduct--;
      // if (totalProduct == 1) {
      currentPackageLevel = 5
      // }
    }
    else {
      if (quantity == 0) {
        // quantity += 1;
        if (perPackageProduct == 0) {
          currentPackageLevel = 0
        }
        else {
          packaged--;
          currentPackageLevel++;
        }
      }

      // currentPackageLevel++
    }
    return res.status(200).json({ message: "", packaged, currentPackageLevel, packaged, quantity, perPackageProduct, totalLevel, totalProduct });

  }
  catch (error) {
    console.error("Error in scan:", error.message);
    return res.status(500).json({ message: "Internal server error", error: error.message });

  }
}
export { codeScan }

export default scanValidation;