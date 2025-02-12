import { handlePrismaError } from "../services/prismaResponseHandler.js";
import { ResponseCodes } from "../../constant.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()

export const aggregratedTransactionScanMiddleware = async (request, response, next) => {
    try {
        const { id } = request;
        const aggregratedTransactionCurrentStateInfo = await prisma.aggregationTransactionCurrentScanState.findFirst({ where: { user_id: id } });
        if (aggregratedTransactionCurrentStateInfo) {

            const aggregratedTransactionInfo = await prisma.aggregation_transaction.findFirst({ where: { transaction_id: aggregratedTransactionCurrentStateInfo.aggregated_transcation_id } });
            if (!aggregratedTransactionInfo) {
                return handlePrismaError(response, null, "Aggregation data not found.Please check your request and try again.", ResponseCodes.NOT_FOUND)
            }
            if (aggregratedTransactionCurrentStateInfo) {
                request.body.packageNo = aggregratedTransactionCurrentStateInfo.packagedNo;
                request.body.currentPackageLevel = aggregratedTransactionCurrentStateInfo.currentIndex;
                request.body.quantity = aggregratedTransactionCurrentStateInfo.quantity;
                request.body.perPackageProduct = aggregratedTransactionCurrentStateInfo.perPackageProduct;
                request.body.totalLevel = aggregratedTransactionCurrentStateInfo.totalLevel;
                request.body.totalProduct = aggregratedTransactionCurrentStateInfo.totalProduct;
                request.body.transactionId = aggregratedTransactionInfo.transaction_id;
                request.body.currentIndex = aggregratedTransactionCurrentStateInfo.currentIndex;
                console.log(aggregratedTransactionCurrentStateInfo.scannedCode)
                request.body.scannedCodes = aggregratedTransactionCurrentStateInfo.scannedCode;
                request.body.isRestorePreviousState = true

                const deleteaggregationTransactionCurrentScanState = await prisma.aggregationTransactionCurrentScanState.delete({ where: { id: aggregratedTransactionCurrentStateInfo.id } })
                if (!deleteaggregationTransactionCurrentScanState) {
                    return handlePrismaError(
                        res, undefined, "A problem occurred while deleting the record. Please try again.", ResponseCodes.BAD_REQUEST
                    )
                }
            }
        }
        console.log(request.body)
        next()
    }
    catch (error) {
        console.log(error)
        return handlePrismaError(response, error, error?.message, ResponseCodes.INTERNAL_SERVER_ERROR)
    }
};