const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    regNumber: {
      type: String,
      required: [true, "Registration Number is required"],
      unique: true,
    },
    mobileNumber: {
      type: String,
      required: [true, "Mobile Number is required"],
      minlength: [10, "Mobile Number must be at least 10 characters long"],
      maxlength: [10, "Mobile Number must be at least 10 characters long"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    certificateImage: {
      type: String,
    },
    userImage: {
      type: String,
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

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.pre("update", async function (next) {
  const updateObj = this.getUpdate();
  if (updateObj.password) {
    const salt = await bcrypt.genSalt(10);
    updateObj.password = await bcrypt.hash(updateObj.password, salt);
  }
  updateObj.updatedAt = new Date();
  next();
});

userSchema.pre("findOneAndUpdate", async function (next) {
  const updateObj = this.getUpdate();

  if (updateObj.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      updateObj.password = await bcrypt.hash(updateObj.password, salt);
    } catch (error) {
      return next(error);
    }
  }

  // Ensure that the updatedAt field is set
  updateObj.updatedAt = new Date();

  next();
});

userSchema.pre("updateOne", async function (next) {
  const updateObj = this.getUpdate();

  if (updateObj.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      updateObj.password = await bcrypt.hash(updateObj.password, salt);
    } catch (error) {
      return next(error);
    }
  }

  updateObj.updatedAt = new Date();
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
