require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user.model");
const getEnv = require("../config/env");
const { USER_ROLE, USER_STATUS } = require("../constants/user.constants");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: USER_ROLE.ADMIN });
    if (existingAdmin) {
      console.log("Admin user already exists");
      return process.exit(0);
    }

    const admin = await User.create({
      name: "Super Admin",
      userId: "admin001",
      email: "admin@example.com",
      password: "Admin@123",
      role: USER_ROLE.ADMIN,
      status: USER_STATUS.APPROVED,
    });

    console.log("Admin user created successfully");
    console.log({
      email: admin.email,
      password: "Admin@123",
      role: admin.role,
    });

    process.exit(0);
  } catch (err) {
    console.error("Error creating admin user:", err);
    process.exit(1);
  }
};

createAdmin();
