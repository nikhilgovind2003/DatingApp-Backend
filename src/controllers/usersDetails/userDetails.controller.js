import UserModel from "../../models/user.model.js";
import ProfileModel from "../../models/profile.model.js";

//user details fetch dispaly cards
export const users = async (req, res) => {
  try {
    // Fetch profiles and populate user data, excluding the current logged-in user
    const profiles = await ProfileModel.find({
      user: { $ne: req.user._id },
    }).populate("user");

    // Combine profiles with their respective users
    const combinedData = profiles.map((profile) => {
      const user = profile.user;

      // Handle cases where the user might not be found (e.g., deleted user)
      if (!user) {
        return {
          ...profile._doc,
          user: {
            _id: null,
            firstName: "Unknown",
            lastName: "",
            email: "N/A",
            isActive: false,
            isVerified: false,
          },
        };
      }

      return {
        ...profile._doc,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isActive: user.isActive,
          isVerified: user.isVerified,
        },
      };
    });

    res.status(200).json(combinedData);
  } catch (error) {
    console.error("Error fetching users and profiles:", error);
    res.status(500).json({ error: error.message });
  }
};

export const userProfile = async (req, res) => {
  const userId = req.params.id; // Assuming the userId is passed in req.body.userId

  try {
    const user = await UserModel.findById(userId).populate("profile");

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    const profile = await ProfileModel.findOne({ user: userId });

    if (!profile) {
      return res.status(404).json({
        status: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({ ...user.toObject(), profile });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllProfilesExceptLoggedInUser = async (req, res) => {
  try {
    // Fetch the current user's profile to get genderPreference
    const currentUserProfile = await ProfileModel.findOne({
      user: req.user.id,
    });

    if (!currentUserProfile || !currentUserProfile.genderPreference) {
     
      return res.status(200).json([]); // Return empty list instead of crashing
    }

    // Set preferred gender based on the user's preference
    const userGenderPreference = currentUserProfile.genderPreference.trim();
    let preferredGender = [];

    if (userGenderPreference === "MEN") {
      preferredGender = ["Male"];
    } else if (userGenderPreference === "WOMEN") {
      preferredGender = ["Female"];
    } else if (userGenderPreference === "BOTH") {
      preferredGender = ["Male", "Female"];
    } else {
      // Fallback if preference is set but doesn't match expected values
      preferredGender = ["Male", "Female"];
    }

    // Fetch profiles that match the preferred gender and exclude the current user
    const profiles = await ProfileModel.find({
      user: { $ne: req.user.id }, // Exclude logged-in user
      gender: { $in: preferredGender }, // Filter based on gender preference
    }).populate("user");

    // Return the filtered profiles
    res.status(200).json(profiles);
  } catch (error) {
    console.error("Error fetching profiles:", error);
    res.status(500).json({ error: "Failed to fetch profiles" });
  }
};

export const getUserdetails = async (req, res) => {
  const userid = req.user;
  try {
    const user = await UserModel.find({ _id: userid });
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: erroor.message });
  }
};
