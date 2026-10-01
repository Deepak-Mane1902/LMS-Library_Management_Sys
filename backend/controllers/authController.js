import User from "../models/User.js";

import { generate } from "otp-generator";

import sendOtp from "../utils/sendOtp.js";

import bcrypt from "bcryptjs";

import { v4 as uuidv4 } from "uuid";

import jwt from "jsonwebtoken";

// ======================================================
// STEP 1: REGISTER USER AND SEND OTP
// ======================================================

export async function registerUser(req, res) {
  try {
    console.log("========================================");
    console.log("1. Registration started");
    console.log("========================================");

    const {
      name,
      email,
      phone,
      password,
    } = req.body;

    // ------------------------------------------
    // Validate required fields
    // ------------------------------------------

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // ------------------------------------------
    // Normalize email
    // ------------------------------------------

    const normalizedEmail = email.trim().toLowerCase();

    // ------------------------------------------
    // Clean phone number
    // ------------------------------------------

    const cleanPhone = phone
      ? phone.toString().replace(/\D/g, "")
      : "";

    if (cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be exactly 10 digits",
      });
    }

    // ------------------------------------------
    // Check existing user
    // ------------------------------------------

    console.log("2. Checking existing user...");

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    console.log("3. Existing user check completed");

    // ------------------------------------------
    // If verified user already exists
    // ------------------------------------------

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // ------------------------------------------
    // Delete old unverified account
    // ------------------------------------------

    if (existingUser && !existingUser.isVerified) {
      console.log("4. Removing old unverified user...");

      await User.deleteOne({
        email: normalizedEmail,
      });

      console.log("5. Old unverified user deleted");
    }

    // ------------------------------------------
    // Generate OTP
    // ------------------------------------------

    const otp = generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    console.log("6. OTP generated");

    // ------------------------------------------
    // Send OTP
    // ------------------------------------------

    console.log("7. Sending OTP to:", normalizedEmail);

    try {
      await sendOtp(normalizedEmail, otp);

      console.log("8. OTP sent successfully");
    } catch (emailError) {
      console.error(
        "OTP sending failed:",
        emailError
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to send OTP to email. Please try again.",
      });
    }

    // ------------------------------------------
    // Hash password
    // ------------------------------------------

    console.log("9. Hashing password...");

    const hashPassword = await bcrypt.hash(
      password,
      10
    );

    console.log("10. Password hashed");

    // ------------------------------------------
    // OTP expiry
    // ------------------------------------------

    const otpExpiry = new Date(
      Date.now() + 5 * 60 * 1000
    );

    // ------------------------------------------
    // Generate student ID
    // ------------------------------------------

    const studentId = `ST-${uuidv4()
      .slice(0, 8)
      .toUpperCase()}`;

    // ------------------------------------------
    // Create user
    // ------------------------------------------

    console.log("11. Creating user in MongoDB...");

    const user = await User.create({
      name,
      email: normalizedEmail,
      phone: cleanPhone,
      password: hashPassword,
      otp,
      otpExpiry,
      studentId,
    });

    console.log("12. User created successfully");

    // ------------------------------------------
    // Remove password from response
    // ------------------------------------------

    const {
      password: _,
      ...userResponse
    } = user.toObject();

    // ------------------------------------------
    // Response
    // ------------------------------------------

    return res.status(201).json({
      success: true,
      message:
        "User registered successfully, OTP sent to email",
      user: userResponse,
    });

  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
}

// ======================================================
// STEP 2: VERIFY OTP
// ======================================================

export async function verifyOtp(req, res) {
  try {
    const {
      email,
      otp,
    } = req.body;

    // ------------------------------------------
    // Validate email
    // ------------------------------------------

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    // ------------------------------------------
    // Normalize email
    // ------------------------------------------

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    // ------------------------------------------
    // Find user
    // ------------------------------------------

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ------------------------------------------
    // Check OTP
    // ------------------------------------------

    if (
      user.otp !== otp ||
      !user.otpExpiry ||
      new Date() > new Date(user.otpExpiry)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // ------------------------------------------
    // Verify user
    // ------------------------------------------

    Object.assign(user, {
      isVerified: true,
      otp: null,
      otpExpiry: null,
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });

  } catch (error) {
    console.error(
      "Error verifying OTP:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Error while verifying OTP",
      error: error.message,
    });
  }
}

// ======================================================
// STEP 3: COMPLETE PROFILE
// ======================================================

export async function completeProfile(req, res) {
  try {
    const {
      email,
      department,
      stream,
      semester,
      year,
      rollNo,
    } = req.body;

    // ------------------------------------------
    // Validate email
    // ------------------------------------------

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    // ------------------------------------------
    // Find user
    // ------------------------------------------

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ------------------------------------------
    // Check verification
    // ------------------------------------------

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User is not verified",
      });
    }

    // ------------------------------------------
    // Complete profile
    // ------------------------------------------

    Object.assign(user, {
      department,
      stream,
      semester,
      year,
      rollNo,
      isProfileComplete: true,
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile completed successfully",
    });

  } catch (error) {
    console.error(
      "Failed to complete user profile:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Error while completing user profile",
      error: error.message,
    });
  }
}

// ======================================================
// STEP 4: LOGIN USER
// ======================================================

export async function loginUser(req, res) {
  try {
    const {
      email,
      password,
    } = req.body;

    // ------------------------------------------
    // Validate fields
    // ------------------------------------------

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and Password are required",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    // ------------------------------------------
    // Find user
    // ------------------------------------------

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ------------------------------------------
    // Check verification
    // ------------------------------------------

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Please verify your email with OTP before login",
      });
    }

    // ------------------------------------------
    // Compare password
    // ------------------------------------------

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // ------------------------------------------
    // Check JWT secret
    // ------------------------------------------

    if (!process.env.JWT_SECRET) {
      console.error(
        "JWT_SECRET is missing from environment variables"
      );

      return res.status(500).json({
        success: false,
        message:
          "Server configuration error",
      });
    }

    // ------------------------------------------
    // Generate JWT
    // ------------------------------------------

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // ------------------------------------------
    // Remove password
    // ------------------------------------------

    const {
      password: _,
      ...userResponse
    } = user.toObject();

    // ------------------------------------------
    // Response
    // ------------------------------------------

    return res.status(200).json({
      success: true,
      token,
      user: userResponse,
    });

  } catch (error) {
    console.error(
      "Error during login:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Error during login",
      error: error.message,
    });
  }
}

// ======================================================
// STEP 5: GET CURRENT USER PROFILE
// ======================================================

export async function getProfile(req, res) {
  try {
    const user = await User.findById(
      req.user.id
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    console.error(
      "Error fetching user profile:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Error fetching user profile",
      error: error.message,
    });
  }
}

// ======================================================
// STEP 6: UPDATE USER PROFILE
// ======================================================

export async function updateProfile(req, res) {
  try {
    const {
      name,
      email,
      phone,
      department,
      stream,
      semester,
      academicYear,
      rollNumber,
    } = req.body;

    // ------------------------------------------
    // Find current user
    // ------------------------------------------

    const user = await User.findById(
      req.user.id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ------------------------------------------
    // Update email
    // ------------------------------------------

    if (email) {
      const normalizedEmail = email
        .trim()
        .toLowerCase();

      if (
        normalizedEmail !==
        user.email.toLowerCase()
      ) {
        // Students cannot change email

        if (user.role === "user") {
          return res.status(400).json({
            success: false,
            message:
              "Students are not allowed to change their email address",
          });
        }

        // Check duplicate email

        const existingUser =
          await User.findOne({
            email: normalizedEmail,
            _id: {
              $ne: user._id,
            },
          });

        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: "Email already in use",
          });
        }

        user.email = normalizedEmail;
      }
    }

    // ------------------------------------------
    // Update phone
    // ------------------------------------------

    if (phone) {
      const cleanPhone = phone
        .toString()
        .replace(/\D/g, "");

      if (cleanPhone.length !== 10) {
        return res.status(400).json({
          success: false,
          message:
            "Mobile number must be exactly 10 digits",
        });
      }

      user.phone = cleanPhone;
    }

    // ------------------------------------------
    // Update other fields
    // ------------------------------------------

    if (name) {
      user.name = name;
    }

    if (department) {
      user.department = department;
    }

    if (stream) {
      user.stream = stream;
    }

    if (semester) {
      user.semester = semester;
    }

    if (academicYear) {
      user.year = academicYear;
    }

    if (rollNumber) {
      user.rollNo = rollNumber;
    }

    // ------------------------------------------
    // Save
    // ------------------------------------------

    await user.save();

    // ------------------------------------------
    // Remove password
    // ------------------------------------------

    const {
      password: _,
      ...userResponse
    } = user.toObject();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: userResponse,
    });

  } catch (error) {
    console.error(
      "Error updating profile:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
}

// ======================================================
// STEP 7: GET ALL STUDENTS - ADMIN
// ======================================================

export async function getusers(req, res) {
  try {
    const users = await User.find({
      role: "user",
      isVerified: true,
      isProfileComplete: true,
    }).select("-password");

    return res.status(200).json({
      success: true,
      users,
    });

  } catch (error) {
    console.error(
      "Error fetching students:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Error fetching students",
      error: error.message,
    });
  }
}

// ======================================================
// STEP 8: ADMIN REGISTRATION
// ======================================================

export async function registerAdmin(req, res) {
  try {
    const {
      name,
      email,
      phone,
      password,
    } = req.body;

    // ------------------------------------------
    // Validate fields
    // ------------------------------------------

    if (
      !name ||
      !email ||
      !phone ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter all required fields",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    // ------------------------------------------
    // Check existing user
    // ------------------------------------------

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "User already exists with the same email",
      });
    }

    // ------------------------------------------
    // Clean phone
    // ------------------------------------------

    const cleanPhone = phone
      .toString()
      .replace(/\D/g, "");

    if (cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message:
          "Mobile number must be exactly 10 digits",
      });
    }

    // ------------------------------------------
    // Hash password
    // ------------------------------------------

    const hashPassword =
      await bcrypt.hash(password, 10);

    // ------------------------------------------
    // Create admin
    // ------------------------------------------

    const user = await User.create({
      name,
      email: normalizedEmail,
      phone: cleanPhone,
      password: hashPassword,
      role: "admin",
      isVerified: true,
    });

    // ------------------------------------------
    // Remove password
    // ------------------------------------------

    const {
      password: _,
      ...userResponse
    } = user.toObject();

    // ------------------------------------------
    // Response
    // ------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      user: userResponse,
    });

  } catch (error) {
    console.error(
      "Error registering admin:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Error registering admin",
      error: error.message,
    });
  }
}