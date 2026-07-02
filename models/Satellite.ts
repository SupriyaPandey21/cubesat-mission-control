import mongoose from "mongoose";

const SatelliteSchema = new mongoose.Schema({
  id: String,
  name: String,
  status: String,
  orbit: String,
  battery: Number,
  signal: Number,
  mode: String,
  uplink: String,
});

const SatelliteModel = mongoose.model("Satellite", SatelliteSchema);

export default SatelliteModel;