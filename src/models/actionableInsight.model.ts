import mongoose, { Schema, Types, Document } from "mongoose";

export interface ActionableInsight extends Document {
  _id: string | Types.ObjectId;
  vehicleId: string;
  type: InsightType;
  detail: string;
  location: string;
  timestamp: string;
}

export enum InsightType {
  BUS_DELAY = "bus_delay",
  VAN_NEEDED = "van_needed",
}

const actionableInsightSchema = new Schema<ActionableInsight>({
  vehicleId: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: Object.values(InsightType),
  },
  detail: { type: String, required: true },
  location: { type: String, required: true },
  timestamp: { type: String, required: true },
});

const ActionableInsightModel = mongoose.model<ActionableInsight>(
  "ActionableInsight",
  actionableInsightSchema
);

export default ActionableInsightModel;
