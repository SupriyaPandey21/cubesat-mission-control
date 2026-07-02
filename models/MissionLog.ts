import mongoose from "mongoose";

const MissionLogSchema = new mongoose.Schema({
  id: String,
  satelliteId: String,
  timestamp: String,
  level: String,
  subsystem: String,
  message: String,
  payload: String,
});

const MissionLogModel = mongoose.model("MissionLog", MissionLogSchema);

export default MissionLogModel;