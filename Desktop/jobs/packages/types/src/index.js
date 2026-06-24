"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResponseSchema = exports.LoginSchema = exports.err = exports.ok = exports.AppError = void 0;
const zod_1 = require("zod");
class AppError extends Error {
    kind;
    message;
    details;
    constructor(kind, message, details) {
        super(message);
        this.kind = kind;
        this.message = message;
        this.details = details;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
const ok = (value) => ({ ok: true, value });
exports.ok = ok;
const err = (error) => ({ ok: false, error });
exports.err = err;
// DTOs (Zod schemas for shared validation)
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
exports.UserResponseSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    email: zod_1.z.string().email(),
    visaProfile: zod_1.z.any().optional(), // Adjust based on JSON type
});
//# sourceMappingURL=index.js.map