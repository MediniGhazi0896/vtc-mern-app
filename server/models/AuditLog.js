// models/AuditLog.js
import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
    {
        actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // admin
        target: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // affected user
        action: { type: String, required: true }, // e.g. 'role-change', 'deactivated', 'deleted'
        details: { type: String }, // optional message
    },
    { timestamps: true }
);

export default mongoose.model('AuditLog', auditLogSchema);
