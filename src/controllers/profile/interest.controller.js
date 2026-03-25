import ProfileModel from "../../models/profile.model.js";

export const setInterest = async (req, res) => {
    try {
        const { interest } = req.body;

        const allowedInterests = ["MEN", "WOMEN", "BOTH"];
        if (!interest || !allowedInterests.includes(interest)) {
            return res.status(400).json({
                success: false,
                message: "Please select a valid interest: MEN, WOMEN, or BOTH."
            });
        }

        const profile = await ProfileModel.findOne({ user: req.user._id });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        profile.genderPreference = interest;
        await profile.save();

        return res.status(200).json({
            success: true,
            message: 'Gender preference updated successfully',
            data: profile
        });
    } catch (error) {
        console.error("Set Interest Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update interest: " + error.message
        });
    }
};
