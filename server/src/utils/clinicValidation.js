import mongoose from "mongoose";

/**
 * Validate whether an ID is a valid MongoDB ObjectId.
 */
export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Find a document only if it belongs to the current clinic.
 */
export const findClinicDocument = async (Model, id, clinic) => {
  if (!isValidObjectId(id)) {
    return null;
  }

  return Model.findOne({
    _id: id,
    clinic,
  });
};