// utils/auditLogger.js
import prisma from "../../DB/db.config.js";

export const logAudit = async ({ performed_action, remarks, user_name, user_id }) => {
    try {
        await prisma.audit_logs.create({
            data: {
                performed_action,
                remarks,
                user_name,
                user_id,
            },
        }).then(() => {
            console.log("Audit log created successfully");
        }).catch(error => {
            console.error("Failed to log audit:", error);
        });
    } catch (error) {
        console.error("Failed to log audit:", error);
    }
};