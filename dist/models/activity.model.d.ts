import { Document, Model } from "mongoose";
export interface IActivity extends Document {
    createdAt: Date;
    updatedAt: Date;
}
export declare const ActivityModel: Model<IActivity>;
