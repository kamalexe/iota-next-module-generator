import { z } from "zod";
export const createActivitySchema = z.object({});
export const updateActivitySchema = z.object({});
export const activityQuerySchema = z.object({
    page: z.coerce
        .number()
        .int()
        .positive()
        .default(1),
    limit: z.coerce
        .number()
        .int()
        .positive()
        .max(100)
        .default(20),
    search: z
        .string()
        .optional(),
});
//# sourceMappingURL=activities.schema.js.map