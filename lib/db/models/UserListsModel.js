import mongoose from "mongoose";

const userListSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      // required: true,
      index: true,
    },
    name: {
      type: String,
      // required: true,
      trim: true,
      maxlength: 50,
    },
    description: {
      type: String,
      default: "",
      maxlength: 200,
    },
    // Unique identifier for the list (URL-friendly)
    slug: {
      type: String,
      // required: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9-]+$/,
      maxlength: 50,
    },
    // Which collection this list applies to
    targetCollection: {
      type: String,
      // required: true,
      enum: ["attachments", "feeds", "storeitems", "chatmessages"],
      default: "attachments",
    },
    // Filter criteria for this list
    filterCriteria: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Whether this list is active/visible
    active: {
      type: Boolean,
      default: true,
    },
    // Color theme for the list (optional)
    color: {
      type: String,
      default: "#3b82f6",
      match: /^#[0-9a-fA-F]{6}$/,
    },
    // Icon for the list (lucide-react icon name)
    icon: {
      type: String,
      default: "folder",
      maxlength: 30,
    },
    // Sort order for display
    sortOrder: {
      type: Number,
      default: 0,
    },
    // Whether this is a system-generated list (feeds, chatmessages, etc.)
    isSystemList: {
      type: Boolean,
      default: false,
    },
    // Privacy setting
    isPrivate: {
      type: Boolean,
      default: true,
    },
    // Array of attachment IDs in this list
    attachmentIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "attachments",
      default: [],
    },
  },
  {
    timestamps: true,
    // Compound index for unique slug per user
    index: [{ createdBy: 1, slug: 1 }],
  }
);

// Add compound index for unique slug per user
userListSchema.index({ createdBy: 1, slug: 1 }, { unique: true });

// Pre-save middleware to ensure slug is URL-friendly
userListSchema.pre("save", function (next) {
  if (this.isModified("slug")) {
    this.slug = this.slug
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }
  next();
});

// Create the model
const UserList =
  mongoose.models?.userlists || mongoose.model("userlists", userListSchema);

export default UserList;
export { userListSchema };
