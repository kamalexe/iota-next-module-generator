import mongoose, {
    Document,
    Model,
    Schema,
} from "mongoose";

export interface IActivity
    extends Document {
    createdAt: Date;
    updatedAt: Date;
}

const ActivitySchema =
    new Schema<IActivity>(
        {},
        {
            timestamps: true,
        }
    );

ActivitySchema.index({
    createdAt: -1,
});

export const ActivityModel: Model<IActivity> =
    mongoose.models.Activity ||
    mongoose.model<IActivity>(
        "Activity",
        ActivitySchema
    );
