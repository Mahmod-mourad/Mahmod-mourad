"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationQuerySchema = exports.apiErrorBodySchema = exports.appErrorKindSchema = exports.appErrorKinds = void 0;
const zod_1 = require("zod");
/**
 * The error contract shared across the boundary. The api maps every `AppError`
 * to one of these kinds (see `core/result`), and the web api client rebuilds a
 * typed `ApiError` from the same shape — so failure handling is symmetrical.
 */
exports.appErrorKinds = [
    'Validation',
    'NotFound',
    'Unauthorized',
    'Forbidden',
    'Conflict',
    'RateLimited',
    'ExternalFailure',
    'Unexpected',
];
exports.appErrorKindSchema = zod_1.z.enum(exports.appErrorKinds);
/** The JSON body every error response carries. */
exports.apiErrorBodySchema = zod_1.z.object({
    error: zod_1.z.object({
        kind: exports.appErrorKindSchema,
        message: zod_1.z.string(),
        details: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
    }),
});
exports.paginationQuerySchema = zod_1.z.object({
    cursor: zod_1.z.string().optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
//# sourceMappingURL=common.js.map