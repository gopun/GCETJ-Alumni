const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      default: "CERTIFICATE_UPLOAD", // RESET_PASSWORD
    },
    status: {
      type: String,
      default: "Active",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.pre("update", async function (next) {
  const updateObj = this.getUpdate();
  updateObj.updatedAt = new Date();
  next();
});

notificationSchema.pre("findOneAndUpdate", async function (next) {
  const updateObj = this.getUpdate();

  // Ensure that the updatedAt field is set
  updateObj.updatedAt = new Date();

  next();
});

notificationSchema.pre("updateOne", async function (next) {
  const updateObj = this.getUpdate();

  updateObj.updatedAt = new Date();
  next();
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
