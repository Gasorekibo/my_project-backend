import mongoose from "mongoose";

const validateMongodbId = (id) => {
  const isValidID = mongoose.Types.ObjectId.isValid(id);
  if (!isValidID) throw new Error("Id provided is not Valid or not found. ");
};

export default validateMongodbId;
