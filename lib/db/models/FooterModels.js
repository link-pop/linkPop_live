import mongoose from "mongoose";

// * ################# refund #################
const refundSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      default: "Refund Info",
      required: true,
    },
  },
  { timestamps: true }
);
refundSchema.settings = {
  navPlace: "footer",
  displayName: "Refund / Return Policy",
  fields: {
    text: {
      subtype: "text",
    },
  },
};

// * ################# terms #################
const termsSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      default: "Terms of Service",
      required: true,
    },
  },
  { timestamps: true }
);
termsSchema.settings = {
  navPlace: "footer",
  displayName: "Terms and Conditions",
  fields: {
    text: {
      subtype: "text",
    },
  },
};

// * ################# privacy #################
const privacySchema = new mongoose.Schema(
  {
    text: {
      type: String,
      default: "Privacy Policy",
      required: true,
    },
  },
  { timestamps: true }
);
privacySchema.settings = {
  navPlace: "footer",
  displayName: "Privacy Policy",
  fields: {
    text: {
      subtype: "text",
    },
  },
};

// * ################# about #################
const aboutSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      default: "About Info",
      required: true,
    },
  },
  { timestamps: true }
);
aboutSchema.settings = {
  navPlace: "footer",
  displayName: "About Us",
  fields: {
    text: {
      subtype: "text",
    },
  },
};

// * ################# environment #################
const environmentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      default: "Environment Info",
      required: true,
    },
  },
  { timestamps: true }
);
environmentSchema.settings = {
  navPlace: "footer",
  displayName: "Environment",
  fields: {
    text: {
      subtype: "text",
    },
  },
};

export {
  termsSchema,
  privacySchema,
  refundSchema,
  aboutSchema,
  environmentSchema,
};
