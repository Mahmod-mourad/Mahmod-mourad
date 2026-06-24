"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationResponseSchema = exports.updateApplicationSchema = exports.createApplicationSchema = exports.applicationStatusSchema = exports.applicationStatuses = void 0;
const zod_1 = require("zod");
/** The five Kanban stages, in board order. */
exports.applicationStatuses = [
    'applied',
    'screening',
    'interview',
    'offer',
    'rejected',
];
exports.applicationStatusSchema = zod_1.z.enum(exports.applicationStatuses);
/**
 * Tracker MVP carries company/role denormalized so a real application can be
 * added in week one — before the job aggregator (Sprint 3) exists to link a Job.
 */
exports.createApplicationSchema = zod_1.z.object({
    company: zod_1.z.string().trim().min(1, 'Company is required').max(200),
    role: zod_1.z.string().trim().min(1, 'Role is required').max(200),
    location: zod_1.z.string().trim().max(200).optional(),
    url: zod_1.z.string().url('Enter a valid URL').optional(),
    source: zod_1.z.string().trim().max(100).optional(),
    notes: zod_1.z.string().max(5000).optional(),
    status: exports.applicationStatusSchema.default('applied'),
});
/** PATCH — every field optional, including a stage move from the board. */
exports.updateApplicationSchema = exports.createApplicationSchema.partial();
exports.applicationResponseSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    company: zod_1.z.string(),
    role: zod_1.z.string(),
    location: zod_1.z.string().nullable(),
    url: zod_1.z.string().nullable(),
    source: zod_1.z.string().nullable(),
    notes: zod_1.z.string().nullable(),
    status: exports.applicationStatusSchema,
    atsScore: zod_1.z.number().int().min(0).max(100).nullable(),
    appliedAt: zod_1.z.string().datetime(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
//# sourceMappingURL=application.js.map