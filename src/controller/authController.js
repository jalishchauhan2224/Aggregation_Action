import { handlePrismaSuccess, handlePrismaError } from "../services/prismaResponseHandler.js";
import { UserResponseCodes, PasswordPolicy, ResponseCodes } from "../../constant.js";
import { decrypt } from "../services/encryptDecrypt.js";
import { logAudit } from '../utils/auditLog.js'
import prisma from "../../DB/db.config.js";
import pkg from 'jsonwebtoken';
import loginSchema from "../validation/authValidation.js";
const { sign } = pkg;

const login = async (req, res) => {
  try {
  const validation = await loginSchema.validateAsync(req.body)
    console.log(validation);
  
    // Fetch user by userId
    const user = await findByUserId(validation.userId);
    if (!user) {
      handlePrismaError(res, undefined, "Invalid username or password",UserResponseCodes.USER_NOT_FOUND );
      return;
    }

    if (!user.is_active) {
      handlePrismaError(res, undefined,"User is deleted", UserResponseCodes.USER_DELETED_ERROR);
      return;
    }

    const currentDate = new Date();
    const lockTime = new Date().setMinutes(
      currentDate.getMinutes() + PasswordPolicy.ACCOUNT_lOCK_TIME
    );

    // Check if account is locked
    if (user.account_locked_until_at > currentDate) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failed_login_attempt_count: 0 },
      });

      handlePrismaError(
        res,undefined,`Account is locked until ${user.account_locked_until_at}`, ResponseCodes.ACCOUNT_LOCKED_ERROR);
      return;
    }

    // Handle too many failed login attempts
    if (user.failed_login_attempt_count >= PasswordPolicy.MAX_LOGIN_ATTEMPT) {
      await prisma.user.update({
        where: { id: user.id },
        data: { account_locked_until_at: new Date(lockTime) },
      });

      handlePrismaError(
        res,undefined,"Too many failed login attempts. Please try again later.",ResponseCodes.TOO_MANY_REQUEST);
      return;
    }

    // Verify password
    console.log(user.password)

    const originalPassword = await decrypt(user.password);
    if (originalPassword !== validation.password) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failed_login_attempt_count: user.failed_login_attempt_count + 1,
          last_failed_login_at: new Date(),
        },
      });
      handlePrismaError(
         res, undefined,"Invalid username or password",UserResponseCodes.USER_PASSWORD_MATCH_ERROR);
      return;
    }
    // Check for expired password
    if (user.password_expires_on && user.password_expires_on < currentDate) {
      handlePrismaError(
        res,undefined,"Password expired, please reset your password",ResponseCodes.UNAUTHORIZED
      );
      return;
    }

    const checker = await prisma.superadmin_configuration.findMany();
    // Ensure user is not already logged in
    if (user.jwt_token !== null && !validation.forceFully) {
      handlePrismaError(
        res,undefined,"User is already logged in, please logout and login again",UserResponseCodes.USER_ALREADY_EXIST
      );
      return;
    }
    const token = sign(
      {
        userId: user.id,
        role: user.role,
        userName: user.user_name,
        config: checker[0],
      },
      process.env.encryptDecryptKey,
      {
        expiresIn: PasswordPolicy.TOKEN_EXPIRE_TIME,
      }
    );

    const loginRes = await prisma.user.update({
      where: { id: user.id },
      data: {
        jwt_token: token,
        last_activity_at: new Date(),
        last_failed_login_at: null,
        account_locked_until_at: null,
        failed_login_attempt_count: 0,
      },
      include: {
        department: true
      }
    });

    if (req.body.audit_logs) {
      await logAudit({
        performed_action: "login",
        remarks: "user logged in",
        user_name: loginRes.user_name,
        user_id: loginRes.user_id,
      });
    }
    console.log("loginRes", loginRes);
    console.log("login successful");

    handlePrismaSuccess(res, "Login successful", {
      token,
      accessibility: loginRes.accessibility,
      userName: loginRes.user_name,
      departmentName: loginRes?.department?.department_name ?? "Admin",
      email: loginRes.email,
      profile_image: loginRes.profile_photo,
    });

  } catch (error) {
    if(error.isJoi === true){
      return handlePrismaError(
        res, error.details[0].message,undefined ,ResponseCodes.INTERNAL_SERVER_ERROR
      )
    }
    console.log("Error in login ", error);
    handlePrismaError(
      res,undefined,"Invalid username or password",UserResponseCodes.USER_PASSWORD_MATCH_ERROR
    );
  }
};

const findByUserId = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        user_id: userId,
      },
      select: {
        id: true,
        user_id: true,
        user_name: true,
        email: true,
        phone_number: true,
        password: true,
        location_id: true,
        department_id: true,
        designation_id: true,
        profile_photo: true,
        esign_status: true,
        is_active: true,
        role: true,
        jwt_token: true,
        last_activity_at: true,
        password_expires_on: true,
        old_passwords: true,
        failed_login_attempt_count: true,
        last_failed_login_at: true,
        account_locked_until_at: true,
        department: {
          select: {
            id: true,
            department_id: true,
            department_name: true,
            is_location_required: true,
          },
        },
        // Add similar selection if designations or other relations are needed
      },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
  }
};


const logout = async (req, res) => {
 // Extract token from Authorization header
  const token = req.headers.authorization?.split(" ")[1];
  console.log(token);
  console.log(req.headers);


  if (!token) {
    handlePrismaError(
      res, undefined,"Token missing",ResponseCodes.UNAUTHORIZED
    );
  }

  try {
    // Decode the token to get the user ID
    const decoded = pkg.verify(token, process.env.encryptDecryptKey); // Use your secret key here
    const userId = decoded.userId;

    // Log the extracted user ID
    console.log(userId);


    // Update the user data in the database
    await prisma.user.update({
      where: { id: userId },
      data: {
        jwt_token: null,
        last_activity_at: new Date(),
      },
    });

    handlePrismaSuccess(res, "Logout successful");
    console.log("Logout successful");

  } catch (err) {
    if(err.isJoi === true){
      return handlePrismaError(
        res, err.details[0].message,undefined ,ResponseCodes.INTERNAL_SERVER_ERROR
      )
    }
    console.error("Logout failed", err);
    handlePrismaError(
       res, undefined,"Logout failed",ResponseCodes.BAD_REQUEST
      );
  }
};

const checkUserActive = (res, user) => {
  if (!user) {
    handlePrismaError(
      res,undefined,"Invalid username or password",UserResponseCodes.USER_NOT_FOUND
    );
    return;
  }

  if (!user.is_active) {
    handlePrismaError(
      res,undefined,"User is deleted",UserResponseCodes.USER_DELETED_ERROR
    );
  }
};

const checkUserMaxAttempt = async (res, user, lockTime) => {
  if (user.failed_login_attempt_count >= PasswordPolicy.MAX_LOGIN_ATTEMPT) {
    await prisma.user.update({
      where: { id: user.id },
      data: { account_locked_until_at: new Date(lockTime) },
    });
    handlePrismaError(
      res,undefined,`Too many failed login attempts. Please try again later.`,ResponseCodes.TOO_MANY_REQUEST
    );
    return;
  }
};

const checkUserPassword = async (
  res,
  user,
  originalPassword,
  password,
  currentDate
) => {
  if (originalPassword !== password) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failed_login_attempt_count: user.failed_login_attempt_count + 1,
        last_failed_login_at: currentDate,
      },
    });
    handlePrismaError(
      res,undefined,"Invalid username or password",UserResponseCodes.USER_PASSWORD_MATCH_ERROR
    );
  }
};

const checkPasswordExpire = async (res, user, currentDate) => {
  if (user.password_expires_on && user.password_expires_on < currentDate) {
    handlePrismaError(res,undefined,"Password expired, please reset your password",ResponseCodes.UNAUTHORIZED
    );
  }
};

const checkUserAccountLock = async (res, user, currentDate) => {
  // console.log(user)
  if (user.account_locked_until_at > currentDate) {
    await prisma.user.update({
      where: { id: user.id },
      data: { failed_login_attempt_count: 0 },
    });
    handlePrismaError(
      res,undefined,`Account is locked until ${user.account_locked_until_at}`,ResponseCodes.ACCOUNT_LOCKED_ERROR
    );
    return;
  }
};

const securityCheck = async (request, res) => {
  console.log(request.body)
  const { userId, password, securityCheck, approveAPIName, approveAPImethod } = request.body;
  try {
    const user = await findByUserId(userId);
    console.log(user)
    checkUserActive(res, user);

    const currentDate = new Date();
    const lockTime = new Date().setMinutes(
      currentDate.getMinutes() + PasswordPolicy.ACCOUNT_lOCK_TIME
    );
    checkUserAccountLock(res, user, currentDate);
    checkUserMaxAttempt(res, user, lockTime);

    const originalPassword = await decrypt(user.password);
    checkUserPassword(res, user, originalPassword, password, currentDate);
    checkPasswordExpire(res, user, currentDate);

    if (!securityCheck) {
      handlePrismaError(
        res,undefined,"Invalid username or password",UserResponseCodes.USER_PASSWORD_MATCH_ERROR
      );
      return;
    }

    const audit_logs = { auditlog_username: user.user_name, auditlog_userid: user.user_id, esign_status_id: user.id }
    const designation = await prisma.designations.findUnique({
      where: { id: user?.designation_id },
    });
    if (!user.designation_id || !designation) {
      handlePrismaError(res,undefined,"Access denied, no designation found",ResponseCodes.UNAUTHORIZED);
      return;
    }

    // Fetch the `ApiRegistry` entries using the correct UUIDs from `api_ids`.
    const apiIds = await prisma.apiRegistry.findMany({
      where: {
        api_id: {
          in: designation.api_ids, // assuming `api_id` is the corresponding integer field in `ApiRegistry`
        },
      },
    });

    const valueExists = apiIds.some(
      (api) => api.name === approveAPIName && api.method === approveAPImethod
    );

    if (!valueExists) {
      handlePrismaError(
        res,undefined,`Access denied, ${approveAPIName} API is not found`,ResponseCodes.UNAUTHORIZED
      );
      return;
    }

    if (request?.body?.audit_log?.audit_log) {
      await logAudit({
        performed_action: request?.body?.audit_log?.performed_action,
        remarks: request?.body?.audit_log.remarks,
        user_name: audit_logs?.auditlog_username,
        user_id: audit_logs?.auditlog_userid,
      });
      console.log("Audit log added successfully");
    }

    handlePrismaSuccess(res, "Security check successful", {
      userName: user.user_name,
      userId: user.user_id,
      user_id: user.id,
      success: true
    });
    
  } catch (error) {
    console.error("Error in login", error);
      if(error.isJoi === true){
        return handlePrismaError (
          res,undefined, error.details[0].message ,ResponseCodes.INTERNAL_SERVER_ERROR
        )
      }
    handlePrismaError( 
      res,error,"Invalid username or password",ResponseCodes.INTERNAL_SERVER_ERROR
    );
  }
};

export { login, logout, securityCheck }