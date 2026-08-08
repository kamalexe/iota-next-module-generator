export const ACTIVITY_ACTIONS = {
    CREATED: "created",
    UPDATED: "updated",
    DELETED: "deleted",
} as const;

export type ActivityAction =
    (typeof ACTIVITY_ACTIONS)[keyof typeof ACTIVITY_ACTIONS];
