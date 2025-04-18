import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import asyncHandler from "../utils/async.js";

// @desc    Login/Register user with phone
// @route   POST /api/v1/auth/login
export const login = asyncHandler(async (req, res, next) => {
   const { phone } = req.body;

   // Check if user exists
   let user = await User.findOne({ phone });

   if (!user) {
      user = await User.create({ phone });
   }

   // Create token
   const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
   });

   res.status(200)
      .cookie("token", token, {
         expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      })
      .json({
         success: true,
         token,
      });
});

export const verifyOTP = asyncHandler(async (req, res, next) => {
   const { phone, otp } = req.body;

   // Add your OTP validation logic here
   const storedOTP = 1234;
   const isValid = otp === storedOTP;

   if (!isValid) {
      return next(new ErrorResponse("Invalid OTP", 401));
   }

   const user = await User.findOne({ phone });
   const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
   });

   res.status(200).json({
      success: true,
      token,
   });
});

// auth.controller.js
export const getMe = asyncHandler(async (req, res) => {
   const user = await User.findById(req.user.id).select("phone createdAt");

   res.status(200).json({
      success: true,
      data: user,
   });
});

