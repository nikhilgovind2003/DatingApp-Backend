import ProfileModel from "../../models/profile.model.js"


export const relationshipGoalsController = async (req, res) => {
    const userId = req.user._id;
    try {
        const { relationshipGoal } = req.body;
        
        if (!relationshipGoal) {
            return res.status(400).json({
                success: false,
                message: "Please select a relationship goal."
            });
        }

        const profile = await ProfileModel.findOneAndUpdate(
            { user: userId },
            { relationshipGoal },
            { new: true }
        );

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found for this user."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Relationship goal updated successfully",
            profile,
        });
    } catch (error) {
        console.error("Relationship Goal Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update relationship goal: " + error.message
        });
    }
}