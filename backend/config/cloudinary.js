import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
   cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "eshaan",
   api_key: process.env.CLOUDINARY_API_KEY || "584665468287249",
   api_secret:
      process.env.CLOUDINARY_API_SECRET || "yn1r_XWEslTXwQjIWyMsyM4oarw",
});

const uploadOnCloudinary = async (localFilePath) => {
   try {
      console.log("[Cloudinary] Attempting upload from:", localFilePath);

      if (!localFilePath) {
         console.error("[Cloudinary] No file path provided");
         return null;
      }

      // Verify file exists before upload
      if (!fs.existsSync(localFilePath)) {
         console.error("[Cloudinary] File does not exist:", localFilePath);
         return null;
      }

      const response = await cloudinary.uploader.upload(localFilePath, {
         resource_type: "auto",
         folder: "crime-connect",
         upload_preset: "ml_default", // Add if using unsigned uploads
      });

      console.log("[Cloudinary] Upload success:", response.secure_url);

      // Delete local file only after successful upload
      fs.unlinkSync(localFilePath);
      return response;
   } catch (error) {
      console.error("[Cloudinary] Upload failed:", {
         error: error.message,
         stack: error.stack,
         response: error.response?.body,
      });

      // Safely delete local file
      if (fs.existsSync(localFilePath)) {
         fs.unlinkSync(localFilePath);
      }

      return null;
   }
};
const deleteFromCloudinary = async (folder, cloudPath) => {
   try {
      if (!cloudPath) return null;

      // extract publicId from cloudPath
      const parts = cloudPath.split("/");
      const file = parts[parts.length - 1];
      const id = file.split(".")[0];

      const publicId = `${folder}/${id}`;

      // delete file from cloudinary
      const resource = cloudPath.includes("video") ? "video" : "image";

      const response = await cloudinary.uploader.destroy(publicId, {
         resource_type: resource,
      });

      return response;
   } catch (error) {
      console.log(
         "ERROR :: Error while deleting file from cloudinary :: ",
         error
      );
      return null;
   }
};

export { uploadOnCloudinary, deleteFromCloudinary };
