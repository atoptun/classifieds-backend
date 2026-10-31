import { v2 as cloudinary } from "cloudinary";

// Automatically configure Cloudinary using CLOUDINARY_URL
cloudinary.config();

export default cloudinary;
