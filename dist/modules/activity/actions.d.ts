export declare const ACTIVITY_ACTIONS: {
    readonly CREATED: "created";
    readonly UPDATED: "updated";
    readonly DELETED: "deleted";
};
export type ActivityAction = (typeof ACTIVITY_ACTIONS)[keyof typeof ACTIVITY_ACTIONS];
