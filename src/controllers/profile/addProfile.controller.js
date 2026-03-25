import ProfileModel from "../../models/profile.model.js";
import uploadOnCloudinary from "../../utils/uploadOnCloudinary.js";

export const createProfile = async (req, res) => {
    try {
 const { bio, gender, age, hobbies, qualification, interests, drinking, smoking, location } = req.body;
        const profile = req?.files?.profile[0];
        const additionalImages = req?.files?.additionalImg;
        const reel = req?.files?.reel[0];
        if([profile, additionalImages, reel, bio, gender, age, hobbies, qualification, interests, drinking, smoking].some(field => !field || field.length === 0)) {
            return res.status(400).json({
                success: false,
                message: "Please upload all required fields"
            })
        }
        if (additionalImages.length > 3) {
            return res.status(400).json({
                success: false,
                message: "You can upload up to 3 additional images only."
            });
        }
        const profileResponse = await uploadOnCloudinary(profile?.path, profile?.filename, 'image');
        const reelResponse = await uploadOnCloudinary(reel?.path, reel?.filename, 'video');
        
        // Upload additional images to Cloudinary concurrently
        const uploadPromises = additionalImages.map((img) =>
            uploadOnCloudinary(img.path, img.filename).then((response) => ({
                url: response.url,
                publicId: response.public_id
            }))
        );
        const additionalImageArr = await Promise.all(uploadPromises);

        const newProfile = await ProfileModel.create({
            user: req.user._id,
            age,
            bio,
            gender,
            location,
            hobbies,
            qualification,
            interests,
            drinking,
            smoking,
            profileImage: {
                publicId: profileResponse.public_id,
                url: profileResponse.url
            },
            additionalImage: additionalImageArr,
            reel: {
                publicId: reelResponse.public_id,
                url: reelResponse.url
            },
        });

        return res.status(200).json({
            success: true,
            message: "Profile created successfully",
            profile: newProfile,

        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}