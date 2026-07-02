import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  name: String,
  role: String,
});

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;