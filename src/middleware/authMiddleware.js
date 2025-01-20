import pkg from "jsonwebtoken";
const { verify } = pkg;
import { PasswordPolicy, ResponseCodes  } from "../../constant.js";
import { PrismaClient } from "@prisma/client";
import { handlePrismaError } from "../services/prismaResponseHandler.js";
const prisma = new PrismaClient();

const secret_key = process.env.encryptDecryptKey;

// Middleware to verify authentication
const verifyAuthentication = async (request, response, next) => {
  let authToken = request.headers["authorization"]?.replace("Bearer ", "");
  // Check if authToken exists
  
  if (!authToken) {
    handlePrismaError(response, undefined, "Please provide valid authentication token", ResponseCodes.UNAUTHORIZED);
    return;
  }
  try {
    // Verify the authentication token
    const { userId, userName } = verify(authToken, secret_key);
    // Extract userId from the decoded token and attach it to the request object
    request.id = userId;
    request.userName = userName;
    
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (user && user.jwt_token === authToken) {
      // Create a new Date object for the current date and time
      const currentDate = new Date();
      // Add 15 minutes to the current date and time
      const lastActivity = new Date(user.last_activity_at);
      if (
        lastActivity.setMinutes(
          lastActivity.getMinutes() + PasswordPolicy.IN_ACTIVITY_TIME
        ) > currentDate
      ) {
        // Update the last_activity_at field in the database
        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            last_activity_at: new Date(),
          },
        });
        // Proceed to the next middleware or route handler
        request.auditlog_username = userName;
        request.auditlog_userid = user.user_id;
        next();
      } else {
        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            jwt_token: null,
          },
        });
        handlePrismaError(response, undefined, "Session expired, please login again", ResponseCodes.UNAUTHORIZED);
      }
    } else {
      handlePrismaError(response, undefined, "Invalid token please login again", ResponseCodes.UNAUTHORIZED);
    }
  } catch (error) {
    console.error("Error verifying authentication token:", error);
    if (error.name === "TokenExpiredError") {
      // Update the jwt_token field to '' if the token is expired
      const { userId } = verify(authToken, secret_key, {
        ignoreExpiration: true,
      });
      await prisma.user
        .update({
          where: {
            id: userId,
          },
          data: {
            jwt_token: null,
          },
        })
        .catch(() => { });
      handlePrismaError(response, undefined, "Token expired, please login again", ResponseCodes.UNAUTHORIZED);
    } else {
      handlePrismaError(response, undefined, "Invalid token, please login again", ResponseCodes.UNAUTHORIZED);
    }
  }
};

export default verifyAuthentication;