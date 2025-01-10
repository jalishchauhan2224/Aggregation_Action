// prismaErrorHandler.js

import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ResponseCodes } from "../../constant.js";
import { sendErrorResponse, sendSuccessResponse } from "./sendResponse.js";

/**
 * Centralized function to handle PrismaClient errors.
 *
 * @param {Object} error - The Prisma error object.
 * @return {Object} An object containing the status code and message.
 */
export function handlePrismaError(res, error, message = null, statusCode = null) {
  let code = ResponseCodes.INTERNAL_SERVER_ERROR;
  let errorMessage = "An unexpected error occurred.";

  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": { // Unique constraint failed
        code = ResponseCodes.CONFLICT;
        const targetField = error.meta?.target[0];
        errorMessage = `The ${targetField} already exists.`;
        break;
      }
      case "P2025": { // Record not found
        code = ResponseCodes.NOT_FOUND;
        errorMessage = "The requested record was not found.";
        break;
      }
      case "P2003": { // Not exits
        code = ResponseCodes.BAD_REQUEST;
        errorMessage = "The requested record was not exits.";
        break;
      } 
      case "P2017": { // Not exits
        code = ResponseCodes.NOT_FOUND;
        errorMessage = `${targetField} does not exist."`;
        break;
      }
      // Add more cases for other Prisma error codes as needed
      default: {
        errorMessage = "A database error occurred.";
        break;
      }
    }
  } else {
    // Handle other generic errors or unexpected exceptions
    errorMessage = message || errorMessage;
    code = statusCode || code;
  }

  sendErrorResponse(res, code, errorMessage, error);
}

export function handlePrismaSuccess(res, message, data = null) {
  sendSuccessResponse(res, ResponseCodes.OK, message, data);
}
