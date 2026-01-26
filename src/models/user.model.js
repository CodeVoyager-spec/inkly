const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { USER_ROLE, USER_STATUS } = require("../constants/user.constants");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLE),
      default: USER_ROLE.READER,
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.PENDING,
    },
  },
  { timestamps: true },
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return; // no next() needed
  this.password = await bcrypt.hash(this.password, 8);
});

// Compare plain password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static method for soft-delete-safe lookup
userSchema.statics.findActiveById = function (id) {
  return this.findOne({
    _id: id,
    status: { $ne: USER_STATUS.DELETED },
  });
};

module.exports = mongoose.model("User", userSchema);
