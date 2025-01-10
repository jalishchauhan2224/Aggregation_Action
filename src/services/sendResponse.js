// services/sendResponse.js

import { ResponseCodes } from "../../constant.js";

/**
 * Sends an error response with the provided status code, message, and error.
 *
 * @param {Object} res - The response object.
 * @param {number} statusCode - The status code of the response.
 * @param {string} message - The error message.
 * @param {Object} error - The error object.
 * @return {Object} The JSON response object.
 */
function sendErrorResponse(res, code, message, error) {
  // Create the JSON response object with the provided parameters
  return res.status(ResponseCodes.OK).json({
    code: code, // The status code of the response
    message, // The error message
    error: process.env.NODE_ENV === "development" ? error : error.message, // The error object
    success: false, // Indicates whether the request was successful or not
  });
}

/**
 * Sends a success response with the provided status code, message, and data.
 *
 * @param {Object} res - The response object.
 * @param {number} statusCode - The status code of the response.
 * @param {string} message - The success message.
 * @param {Object} data - The data to be sent in the response.
 * @return {Object} The JSON response object.
 */
function sendSuccessResponse(res, code, message, data) {
  // Create the JSON response object with the provided parameters
  return res.status(ResponseCodes.OK).json({
    code: code, // The status code of the response
    message, // The success message
    data, // The data to be sent in the response
    success: true, // Indicates whether the request was successful or not
  });
}

export { sendErrorResponse, sendSuccessResponse };
