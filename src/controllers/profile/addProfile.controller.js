import ProfileModel from "../../models/profile.model.js";
import uploadOnCloudinary from "../../utils/uploadOnCloudinary.js";

export const createProfile = async (req, res) => {
    try {
        const { bio, gender, age, hobbies, qualification, interests, drinking, smoking, location } = req.body;
        
        // Validate required text fields
        const requiredFields = { bio, gender, age, hobbies, qualification, interests, drinking, smoking, location };
        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => !value || (typeof value === 'string' && value.trim() === ''))
            .map(([key]) => key);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Please provide all required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate files
        const profile = req?.files?.profile?.[0];
        const additionalImages = req?.files?.additionalImg || [];
        const reel = req?.files?.reel?.[0];

        console.log("profile,",  additionalImages);
        // if (!profile || additionalImages.length !== 3 || !reel) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Please upload a profile picture, exactly 3 additional images, and a short reel."
        //     });
        // }

        // Upload to Cloudinary
        const profileResponse = await uploadOnCloudinary(profile.path, profile.filename, 'image');
        const reelResponse = await uploadOnCloudinary(reel.path, reel.filename, 'video');
        
        if (!profileResponse || !reelResponse) {
            return res.status(500).json({
                success: false,
                message: "Failed to upload media to server."
            });
        }

        // Upload additional images concurrently
        const uploadPromises = additionalImages.map((img) =>
            uploadOnCloudinary(img.path, img.filename).then((response) => ({
                url: response.url,
                publicId: response.public_id
            }))
        );
        const additionalImageArr = await Promise.all(uploadPromises);

        // interests and hobbies as arrays (splitting by comma and trimming)
        const interestsArr = interests.split(',').map(i => i.trim()).filter(i => i !== "");
        // In model hobbies is String, but consistent with interests we can keep it as string or change model.
        // Looking at models/profile.model.js: hobbies is String, interests is [String].

        const newProfile = await ProfileModel.findOneAndUpdate(
            { user: req.user._id },
            {
                age: Number(age),
                bio,
                gender,
                location,
                hobbies, // Keep as string as per model
                qualification,
                interests: interestsArr,
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
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return res.status(200).json({
            success: true,
            message: "Profile saved successfully",
            profile: newProfile,
        });
    } catch (error) {
        console.error("Create Profile Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        });
    }
}