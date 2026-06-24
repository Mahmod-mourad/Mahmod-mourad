import { z } from 'zod';
/** The five Kanban stages, in board order. */
export declare const applicationStatuses: readonly ["applied", "screening", "interview", "offer", "rejected"];
export declare const applicationStatusSchema: z.ZodEnum<["applied", "screening", "interview", "offer", "rejected"]>;
export type ApplicationStatus = (typeof applicationStatuses)[number];
/**
 * Tracker MVP carries company/role denormalized so a real application can be
 * added in week one — before the job aggregator (Sprint 3) exists to link a Job.
 */
export declare const createApplicationSchema: z.ZodObject<{
    company: z.ZodString;
    role: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["applied", "screening", "interview", "offer", "rejected"]>>;
}, "strip", z.ZodTypeAny, {
    company: string;
    role: string;
    status: "applied" | "screening" | "interview" | "offer" | "rejected";
    location?: string | undefined;
    url?: string | undefined;
    source?: string | undefined;
    notes?: string | undefined;
}, {
    company: string;
    role: string;
    location?: string | undefined;
    url?: string | undefined;
    source?: string | undefined;
    notes?: string | undefined;
    status?: "applied" | "screening" | "interview" | "offer" | "rejected" | undefined;
}>;
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
/** PATCH — every field optional, including a stage move from the board. */
export declare const updateApplicationSchema: z.ZodObject<{
    company: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    url: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    source: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["applied", "screening", "interview", "offer", "rejected"]>>>;
}, "strip", z.ZodTypeAny, {
    company?: string | undefined;
    role?: string | undefined;
    location?: string | undefined;
    url?: string | undefined;
    source?: string | undefined;
    notes?: string | undefined;
    status?: "applied" | "screening" | "interview" | "offer" | "rejected" | undefined;
}, {
    company?: string | undefined;
    role?: string | undefined;
    location?: string | undefined;
    url?: string | undefined;
    source?: string | undefined;
    notes?: string | undefined;
    status?: "applied" | "screening" | "interview" | "offer" | "rejected" | undefined;
}>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export declare const applicationResponseSchema: z.ZodObject<{
    id: z.ZodString;
    company: z.ZodString;
    role: z.ZodString;
    location: z.ZodNullable<z.ZodString>;
    url: z.ZodNullable<z.ZodString>;
    source: z.ZodNullable<z.ZodString>;
    notes: z.ZodNullable<z.ZodString>;
    status: z.ZodEnum<["applied", "screening", "interview", "offer", "rejected"]>;
    atsScore: z.ZodNullable<z.ZodNumber>;
    appliedAt: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    company: string;
    role: string;
    location: string | null;
    url: string | null;
    source: string | null;
    notes: string | null;
    status: "applied" | "screening" | "interview" | "offer" | "rejected";
    id: string;
    atsScore: number | null;
    appliedAt: string;
    createdAt: string;
    updatedAt: string;
}, {
    company: string;
    role: string;
    location: string | null;
    url: string | null;
    source: string | null;
    notes: string | null;
    status: "applied" | "screening" | "interview" | "offer" | "rejected";
    id: string;
    atsScore: number | null;
    appliedAt: string;
    createdAt: string;
    updatedAt: string;
}>;
export type ApplicationResponse = z.infer<typeof applicationResponseSchema>;
/** Counts per stage + the headline response rate, for the board's stats strip. */
export interface ApplicationStats {
    total: number;
    byStatus: Record<ApplicationStatus, number>;
    /** (screening + interview + offer) / total, 0–1. The number that matters. */
    responseRate: number;
}
//# sourceMappingURL=application.d.ts.map