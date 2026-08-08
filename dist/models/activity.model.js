import mongoose, { Schema, } from "mongoose";
const ActivitySchema = new Schema({}, {
    timestamps: true,
});
ActivitySchema.index({
    createdAt: -1,
});
export const ActivityModel = mongoose.models.Activity ||
    mongoose.model("Activity", ActivitySchema);
//# sourceMappingURL=activity.model.js.map