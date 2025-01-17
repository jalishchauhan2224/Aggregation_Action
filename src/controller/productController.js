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
    const product = await prisma.product.findFirst({ where: { id: product_id } });
    if (!product) {
      return handlePrismaError(res, null, "Product not found", ResponseCodes.NOT_FOUND);
    }
    let totalProduct = 0;
    const packaging_size = {};
    if (product.packagingHierarchy) {
      if (product.productNumber) {
        totalProduct += product.productNumber;
        packaging_size["level0"] = product.productNumber;
      }
      if (product.firstLayer) {
        totalProduct += product.firstLayer;
        packaging_size['level1'] = product.firstLayer;
      }
      if (product.secondLayer) {
        totalProduct += product.secondLayer;
        packaging_size['level2'] = product.secondLayer;
      }
      if (product.thirdLayer) {
        totalProduct += product.thirdLayer;
        packaging_size['level3'] = product.thirdLayer;
      }

      // Add level 5 (unit per package)
      totalProduct += 1;
      packaging_size['level5'] = 1;

      // Create packaging_size_value array, including the final value of 1 for unit level
      const packaging_size_value = Object.values(packaging_size);
      packaging_size_value.push(1);

      const productLevel = [];
      const productWithLevel = {};
      let perPackageProduct = 0;

      console.log('Packaging Hierarchy:');
      console.log('----------------------------------------------------------------------');
      // Loop through packaging hierarchy levels and calculate values
      for (let i = 0; i < product.packagingHierarchy + 1; i++) {
        const currentLevelValue = packaging_size_value[i];
        const nextLevelValue = packaging_size_value[i + 1];
      // Calculate product level ratio
        const levelRatio = currentLevelValue / nextLevelValue;
  
        productLevel.push(levelRatio);
        // Assign value for each level
        productWithLevel[`level${i}`] = levelRatio;
        perPackageProduct += productWithLevel[`level${i}`];
      }

      perPackageProduct++

      console.log('----------------------------------------------------------------------');
      console.log('Product Level Ratios:', productLevel.slice(currentLevel, productLevel.length));
      console.log('Product with Level Breakdown:', productWithLevel);

      // Destructure the first two values for quantity and packaged
      const [quantity, packaged] = productLevel;

      handlePrismaSuccess(res, "Get successfully", {
        packaged,
        quantity,
        currentLevel,
        totalLevel: product.packagingHierarchy,
        totalProduct,
        perPackageProduct
      });
    }

  }
  catch (error) {
    console.error("Error while fetching products:", error);
    handlePrismaError(res, error, "An error occurred while fetching products.", ResponseCodes.INTERNAL_SERVER_ERROR);
  }
}
export { getPackagingHierarchy }
export default getAllProducts;