import mongoose from "mongoose";

const AlertSchema = new mongoose.Schema({
  id: String,
  satelliteId: String,
  satelliteName: String,
  timestamp: String,
  level: String,
  code: String,
  message: String,
  subsystem: String,
  status: String,
  assignedTo: String,
  recommendedAction: String
});

const AlertModel = mongoose.model("Alert", AlertSchema);

export default AlertModel;