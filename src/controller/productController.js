import { handlePrismaSuccess, handlePrismaError } from "../services/prismaResponseHandler.js";
import prisma from "../../DB/db.config.js";
import { ResponseCodes } from "../../constant.js";

const getAllProducts = async (req, res) => {
  console.log("product api called.......");

  const { limit = 25, page = 1, search = '', esign_status = '', product_name = '' } = req.query;
  const offset = (page - 1) * parseInt(limit, 10);
  try {
    const where = {
      ...(search && {
        OR: [
          { product_name: { contains: search, mode: "insensitive" } },
          { product_id: { contains: search, mode: "insensitive" } },
          { gtin: { contains: search, mode: "insensitive" } },
          { ndc: { contains: search, mode: "insensitive" } },
          { generic_name: { contains: search, mode: "insensitive" } },

          { packaging_size: { contains: search, mode: "insensitive" } },
          { antidote_statement: { contains: search, mode: "insensitive" } },
          { registration_no: { contains: search, mode: "insensitive" } },

        ],
      }),
      ...(esign_status && { esign_status: esign_status.toLowerCase() }),
      ...(product_name && { product_name: { contains: product_name, mode: "insensitive" } }),
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
          countryMaster: true
        },
      }),
      prisma.product.count({ where }),
    ]);
    const newProducts = products.map((el) => ({ ...el, product_image: `${process.env.URL}${el.product_image}`, label: `${process.env.URL}${el.label}`, leaflet: `${process.env.URL}${el.leaflet}` }));
    handlePrismaSuccess(res, "Get all products successfully", { products: newProducts, total });
  } catch (error) {
    console.error("Error while fetching products:", error);
    handlePrismaError(res, error, "An error occurred while fetching products.", ResponseCodes.INTERNAL_SERVER_ERROR);
  }
};

const getPackagingHierarchy = async (req, res) => {
  try {
    const { product_id, currentLevel } = req.body;
    if (!product_id) {
      return handlePrismaError(res, null, "Product Id is required", ResponseCodes.BAD_REQUEST);
    }
    const product = await prisma.product.findFirst({ where: { id: product_id } }); // Ensure 'where' clause is used in Prisma query
    if (!product) {
      return handlePrismaError(res, null, "Product not found", ResponseCodes.NOT_FOUND);
    }
    if (product.packagingHierarchy) {

      const packaging_size = {}
      if (product.productNumber) {
        packaging_size["level0"] = product.productNumber;
      }
      if (product.firstLayer) {
        packaging_size['level1'] = product.firstLayer;
      }
      if (product.secondLayer) {
        packaging_size['level2'] = product.secondLayer;
      }
      if (product.thirdLayer) {
        packaging_size['level3'] = product.thirdLayer;
      }
      packaging_size['level5'] = 1
      // console.log(packaging_size)
      const packaging_size_value = Object.values(packaging_size);
      packaging_size_value.push(1)
      const productLevel = []
      console.log(product.packagingHierarchy)
      for (let i = currentLevel; i < product.packagingHierarchy + 1; i++) {
        productLevel.push((packaging_size_value[i] / packaging_size_value[i + 1]))
      }
      const [quantity, packaged] = productLevel;
      handlePrismaSuccess(res, "Get successfully", { packaged, quantity, currenlLevel: currentLevel, totallevel: product.packagingHierarchy, });
    }
  }
  catch (error) {
    console.error("Error while fetching products:", error);
    handlePrismaError(res, error, "An error occurred while fetching products.", ResponseCodes.INTERNAL_SERVER_ERROR);
  }
}
export { getPackagingHierarchy }
export default getAllProducts;