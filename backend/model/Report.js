import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Reporter is required"],
  },
  isForwarded: {type: Boolean,default: false},
  title: { type: String, required: true },
  description: { type: String, required: true},
  image:{type:String, default: "https://cdn.pixabay.com/photo/2020/10/25/09/23/seagull-5683637_960_720.jpg"},
  chw: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
})

const Report = mongoose.model("Report", reportSchema);
export default Report;