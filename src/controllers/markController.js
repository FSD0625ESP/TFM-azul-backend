import Mark from "../models/Mark.js";

export const createMark = async (userId, lat, long, type = "shop") => {
  try {
    const newMark = new Mark({
      user: userId,
      type_mark: type,
      lat,
      long,
    });

    await newMark.save();
    return newMark;
  } catch (error) {
    console.error("Error creating mark:", error);
    throw error;
  }
};
