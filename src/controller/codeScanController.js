import prisma from "../../DB/db.config.js";
import { logAudit } from "../utils/auditLog.js";
const scan = async (req, res) => {
  try {
    
    const { uniqueCode, productId, batchId, packgelevel, audit_log, packaged, quantity } = req.body;
    const { auditlog_username, auditlog_userid } = req;
    console.log("uniqueCode:", uniqueCode);
    console.log("productId:", productId);
    console.log("BatchId", batchId);
    //1.
    // Fetch the productCodeLength from superadmin configuration table
    const productConfig = await prisma.superadmin_configuration.findFirst();

    if (!productConfig) {
      return res.status(400).json({ message: "Product configuration is missing or invalid" });
    }
    console.log("productCodeLength", productConfig.product_code_length);

    // Extract the first product_code_length characters from the uniqueCode
    const extractedCode = uniqueCode.substring(0, productConfig.product_code_length);
    console.log("Extracted uniqueCode:", extractedCode);

    // Fetch the product details based on product_id
    const productDetails = await prisma.aggregation_transaction.findFirst({
      where: {
        product_id: productId,
      },
    });
    console.log(productDetails);

    if (!productDetails) {
      console.log("product details not found");
      res.status(404).json({ message: "product details not found" })
      return;
    }
    console.log("product_gen_id", productDetails.product_gen_id);

    // Validate the generation_id with the extracted code
    if (productDetails.product_gen_id != extractedCode) {
      console.log("Mismatch: Product not found for extracted code");
      return res.status(404).json({ message: "Product not found or generation ID mismatch" });
    }
    else {
      console.log("Product generation Id match ");
    }
    console.log("......................");


    // 2. 
    const tableName = `${productDetails.product_gen_id.toLowerCase()}${packgelevel}_codes`
    console.log("Table name is ", tableName);
    const uniqueCodeRecord = await prisma.$queryRawUnsafe(`SELECT unique_code FROM ${tableName} WHERE unique_code =$1`,uniqueCode);

    console.log("Fetched unique code record:", uniqueCodeRecord);

    if (!uniqueCodeRecord) {
      return res.status(404).json({ message: "Unique code not found" });
    }

    const checkPackageLevel = uniqueCode.substring(productConfig.product_code_length, 4);
    console.log("check Package Level", checkPackageLevel);

    //Validate package level
    if (checkPackageLevel != packgelevel) {
      console.log("Invalid package level");
      return res.status(404).json({ message: "Invalid package level" });
    }
    console.log("valid Package level");

    // 3.
    const batchCheck = await prisma.$queryRawUnsafe(`SELECT batch_id FROM ${tableName} WHERE unique_code = $1`, uniqueCode);
    console.log(batchCheck);

    console.log("batch id from dynamic table  ", batchCheck[0].batch_id);

    if (batchCheck[0].batch_id != batchId) {
      console.log("batch_id is invalid");
      res.status(200).json({ message: "batch_id is invalid" })
      return;
    }
    console.log("batch_id valid");

    
    // 4.
    const getTable = await prisma.$queryRawUnsafe(`SELECT * FROM ${tableName} WHERE unique_code = $1`, uniqueCode)
    // console.log("get table ",getTable);
    console.log(getTable[0]);
    console.log("get is Scanned", getTable[0].is_scanned);

    if (getTable[0].is_scanned) {
      console.log("inValid allReady scanned");
      res.status(400).json({ message: " inValid allReady scanned" });
      return;
    }
    else {
      const Scanned = await prisma.$queryRawUnsafe(`UPDATE ${tableName} SET is_scanned = TRUE WHERE unique_code = $1`, uniqueCode)
      console.log(Scanned);
      console.log("code scanned done", Scanned);
    }

    // if (audit_log?.audit_log) {
    //   await logAudit({
    //     performed_action: audit_log.performed_action,
    //     remarks: audit_log.remarks,
    //     user_name: auditlog_username,
    //     user_id: auditlog_userid,
    //   });
    // }
    // quantity--;
    // if (quantity == 0) {
    //   packaged--
    // }
    return res.status(200).json({ message: "package_generate_id , Package level ,batch_id valid", quantity, packaged, currentLevel: packgelevel });
  }
  catch (error) {
    console.error("Error in scan:", error.message);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export default scan;