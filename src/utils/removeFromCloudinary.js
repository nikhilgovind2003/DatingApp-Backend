import { cloudinaryInstance } from "../config/cloudinary.config.js";

const deleteImage = async (publicId, resourceType = 'image') => {
    try {
        if(!publicId) {
            throw new Error('Cannot get the public key');
        }
        return await cloudinaryInstance.uploader.destroy(publicId, { resource_type: resourceType })
    } catch (error) {
       throw new Error(error.message)
    }
}

export default deleteImage
