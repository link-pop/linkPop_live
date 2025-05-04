import mongoose from "mongoose";

export const deepSanitize = (obj) => {
  if (
    obj instanceof mongoose.Types.ObjectId ||
    obj?.constructor?.name === "ObjectID"
  ) {
    return obj.toString();
  }
  if (obj?.constructor?.name === "Binary") {
    return obj.buffer.toString("base64");
  }
  if (obj?.toJSON) {
    return deepSanitize(obj.toJSON());
  }
  if (Array.isArray(obj)) {
    return obj.map(deepSanitize);
  }
  if (obj && typeof obj === "object" && !Buffer.isBuffer(obj)) {
    return Object.fromEntries(
      Object.entries(obj)
        .map(([key, value]) => {
          if (key === "__v") return [];
          return [key, deepSanitize(value)];
        })
        .filter(Boolean)
    );
  }
  return obj;
};
