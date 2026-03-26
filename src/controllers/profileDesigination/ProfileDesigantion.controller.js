import EmploymentModel from "../../models/employment.model.js";
import ProfileModel from "../../models/profile.model.js";
import UserModel from "../../models/user.model.js";


export const getProfileByDesigination = async (req, res) => {
    const userid = req.user;
    console.log(userid)
    try {


        const employes = await EmploymentModel.findOne({ user: userid });
        console.log(employes)
        if (!employes) {
            return res.status(404).json({
                message: "user employment recordes not found"
            })
        }
        const userDesignation = employes.designation.trim(); // Remove extra spaces

        // Find matching employments with the same designation (case-insensitive and trimmed)
        const matchingEmployments = await EmploymentModel.find({
            designation: { $regex: new RegExp(userDesignation, 'i') }, // Case-insensitive match
            user: { $ne: userid } // Exclude the current user
        });
        const userIds = matchingEmployments.map(employment => employment.user);
        console.log(userIds);
        const currentUserProfile = await ProfileModel.findOne({ user: userid });

        if (!currentUserProfile || !currentUserProfile.genderPreference) {
            return res.status(404).json({
                message: "User profile or gender preference not found"
            });
        }

        const userGenderPreference = currentUserProfile.genderPreference.trim();
        console.log("User Gender Preference:", userGenderPreference);

        let preferredGender;

        if (userGenderPreference === 'MEN') {
            preferredGender = ['Male'];
        } else if (userGenderPreference === 'WOMEN') {
            preferredGender = ['Female'];
        } else if (userGenderPreference === 'BOTH') {
            preferredGender = ['Male', 'Female']; // Show both men and women
        }

        const profilesMatched = await ProfileModel.find({
            user: { $in: userIds }, // Match users from similar designations
            gender: { $in: preferredGender } // gender as usergenderpreference
        });

        console.log(profilesMatched);

        const profilesWithUserDetails = await Promise.all(
            profilesMatched.map(async (profile) => {
                const user = await UserModel.findById(profile.user).select('firstName lastName').lean();
                const name = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
                return {
                    ...profile._doc, // Spread profile document
                    name, // Add the combined name
                };
            })
        );



        return res.status(200).json(profilesWithUserDetails)

    }
    catch (error) {
        res.status(500).json({ error: 'Failed to retrieve profiles' });
    }
}