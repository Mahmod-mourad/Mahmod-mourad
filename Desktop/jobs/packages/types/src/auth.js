"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authUserSchema = exports.loginSchema = exports.registerSchema = exports.passwordSchema = void 0;
const zod_1 = require("zod");
exports.passwordSchema = zod_1.z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long');
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Enter a valid email'),
    password: exports.passwordSchema,
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Enter a valid email'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
/** The authenticated principal carried on every request and returned by /me. */
exports.authUserSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    email: zod_1.z.string().email(),
    createdAt: zod_1.z.string().datetime(),
});
//# sourceMappingURL=auth.js.map