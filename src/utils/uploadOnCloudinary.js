import fs from "fs";
import { cloudinaryInstance } from "../config/cloudinary.config.js";

// `folder` groups uploads in Cloudinary; the public id is generated uniquely
// so different users' files never overwrite each other. The temp file is always removed.
const uploadOnCloudinary = async (localFilePath, folder = "uploads", resourceType = 'auto') => {
    try {
        if (!localFilePath) {
            throw new Error('Cannot get the local file path');
        }
        return await cloudinaryInstance.uploader.upload(localFilePath, {
            resource_type: resourceType,
            folder,
            use_filename: false,
            unique_filename: true,
        });
    } catch (error) {
        throw new Error(error.message);
    } finally {
        if (localFilePath) fs.unlink(localFilePath, () => {});
    }
}

export default uploadOnCloudinary;
