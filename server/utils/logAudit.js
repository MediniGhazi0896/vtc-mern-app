// utils/logAudit.js
import AuditLog from '../models/AuditLog.js';

export const logAudit = async ({ actorId, targetId, action, details = '' }) => {
    try {
        await AuditLog.create({
            actor: actorId,
            target: targetId,
            action,
            details
        });
    } catch (err) {
        console.error('Audit log failed:', err);
    }
};

