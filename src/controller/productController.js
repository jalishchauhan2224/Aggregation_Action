import { handlePrismaSuccess, handlePrismaError } from "../services/prismaResponseHandler.js";
import prisma from "../../DB/db.config.js";
import { ResponseCodes } from "../../constant.js";
import { logAudit } from "../utils/auditLog.js";
const getAllProducts = async (req, res) => {
  const {
    limit = 25,
    page = 1,
    search = "",
    esign_status = "",
    product_name = "",
  } = req.query;
  const offset = (page - 1) * parseInt(limit, 10);
  try {
    const where = {
      ...(search && {
        OR: [
          { product_name: { contains: search, mode: "insensitive" } },
          { productId: { contains: search, mode: "insensitive" } },
          { gtin: { contains: search, mode: "insensitive" } },
          { ndc: { contains: search, mode: "insensitive" } },
          { generic_name: { contains: search, mode: "insensitive" } },

          { packaging_size: { contains: search, mode: "insensitive" } },
          { antidote_statement: { contains: search, mode: "insensitive" } },
          { registration_no: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(esign_status && { esign_status: esign_status.toLowerCase() }),
      ...(product_name && {
        product_name: { contains: product_name, mode: "insensitive" },
      }),
    };

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        skip: offset,
        take: parseInt(limit, 10) !== -1 ? parseInt(limit, 10) : undefined,
        include: {
          company: {
            select: {
              id: true,
              company_name: true,
            },
          },
          countryMaster: true,
        },
      }),
      prisma.product.count({ where }),
    ]);
    const newProducts = products.map((el) => ({
      ...el,
      product_image: `${process.env.URL}${el.product_image}`,
      label: `${process.env.URL}${el.label}`,
      leaflet: `${process.env.URL}${el.leaflet}`,
    }));
    handlePrismaSuccess(res, "Get all products successfully", { products: newProducts, total, });

  } catch (error) {
    console.error("Error while fetching products:", error);
    handlePrismaError(
      res,
      error,
      "An error occurred while fetching products.",
      ResponseCodes.INTERNAL_SERVER_ERROR
    );
  }
};

const getPackagingHierarchy = async (req, res) => {
  try {
    console.log('getPackagingHierarchy')
    console.log(req.body)
    const { productId, currentLevel, isRestorePreviousState } = req.body;
    const { auditlog_username, auditlog_userid } = req;
    console.log(auditlog_username);
    if (isRestorePreviousState) {
      return handlePrismaSuccess(res, "Get successfully", {
        packageNo: req.body.packageNo,
        quantity: req.body.quantity,
        perPackageProduct: req.body.perPackageProduct,
        currentLevel: req.body.currentLevel,
        totalProduct: req.body.totalProduct,
        totalLevel: req.body.totalLevel,
        transactionId: req.body.transactionId
      });
    }
    let totalProduct = 0
    if (!productId) {
      return handlePrismaError(
        res,
        null,
        "Product Id is required",
        ResponseCodes.BAD_REQUEST
      );
    }
    if (currentLevel < 0 || currentLevel > 4) {
      return handlePrismaError(
        res,
        null,
        "Invalid input: The current level must be between 0 and 4 (inclusive). Please enter a valid level.",
        ResponseCodes.BAD_REQUEST
      );
    }
    const product = await prisma.product.findFirst({
      where: { id: productId },
    }); // Ensure 'where' clause is used in Prisma query
    if (!product) {
      return handlePrismaError(
        res, null, "Product not found", ResponseCodes.NOT_FOUND
      );

    }
    if (product.packagingHierarchy) {
      const packaging_size = {};
      if (product.productNumber) {
        totalProduct += product.productNumber;
        packaging_size["level0"] = product.productNumber;
      }
      if (product.firstLayer) {
        totalProduct += product.firstLayer;
        packaging_size["level1"] = product.firstLayer;
      }
      if (product.secondLayer) {
        totalProduct += product.secondLayer;
        packaging_size["level2"] = product.secondLayer;
      }
      if (product.thirdLayer) {
        totalProduct += product.thirdLayer;
        packaging_size["level3"] = product.thirdLayer;
      }
      packaging_size["level5"] = 1;
      totalProduct++

      const packaging_size_value = Object.values(packaging_size);
      packaging_size_value.push(1);
      const productLevel = [];
      for (let i = currentLevel; i < product.packagingHierarchy + 1; i++) {
        productLevel.push(
          packaging_size_value[i] / packaging_size_value[i + 1]
        );
      }

      var perPackageProduct = productLevel[currentLevel] + 1
      const [quantity, packageNo] = productLevel;
      const aggregation_transactionInfo = await prisma.aggregation_transaction.findFirst({ where: { product_id: productId } })
      console.log(aggregation_transactionInfo)
      if (req.body.audit_log?.audit_log && currentLevel == 0) {
        await logAudit({
          performed_action: `Scan transaction started with Transaction ID: ${aggregation_transactionInfo.transaction_id}, Product ID: ${aggregation_transactionInfo.product_id}, Batch ID: ${aggregation_transactionInfo.batch_id}, initiated by User ID: ${req.id}.`,
          remarks: req.body.audit_log.remarks,
          user_name: auditlog_username,
          user_id: auditlog_userid,
        });
      }
      handlePrismaSuccess(res, "Get successfully", {
        packageNo,
        quantity,
        perPackageProduct,
        currentLevel: currentLevel,
        totalProduct,
        totalLevel: product.packagingHierarchy,
        transactionId: aggregation_transactionInfo.transaction_id
      });
    }
  } catch (error) {
    console.error("Error while fetching products:", error);
    handlePrismaError(
      res,
      error,
      "An error occurred while fetching products.",
      ResponseCodes.INTERNAL_SERVER_ERROR
    );
  }
};

const getCountryCodeByProductId = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return handlePrismaError(
        res,
        null,
        "Product is required",
        ResponseCodes.BAD_REQUEST
      );
    }
    const product = await prisma.product.findFirst({
      where: { id: productId },
      select: { countryMaster: { select: { codeStructure: true } } },
    });
    if (!product) {
      return handlePrismaError(
        res,
        null,
        "Product not found",
        ResponseCodes.NOT_FOUND
      );
    }
    handlePrismaSuccess(res, "Get successfully", {
      country_code: product.countryMaster.codeStructure,
    });
  } catch (error) {
    console.error("Error while fetching products:", error);
    handlePrismaError(
      res,
      error,
      "An error occurred while country code by product.",
      ResponseCodes.INTERNAL_SERVER_ERROR
    );
  }
};

export { getPackagingHierarchy, getAllProducts, getCountryCodeByProductId };
