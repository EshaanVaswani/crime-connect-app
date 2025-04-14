import jwt from "jsonwebtoken";
import ErrorResponse from "../utils/error-response.js";
import User from "../models/user.model.js";

export const protect = async (req, res, next) => {
   let token = req.cookies?.token; // 🔥 read from cookie

   if (!token) {
      return next(
         new ErrorResponse("Not authorized to access this route", 401)
      );
   }

   try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
      next();
   } catch (err) {
      return next(
         new ErrorResponse("Not authorized to access this route", 401)
      );
   }
};
