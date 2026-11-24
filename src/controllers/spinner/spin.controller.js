import LocationModel from "../../models/location.model.js";
import ProfileModel from "../../models/profile.model.js";

const spinIndexByUser = new Map(); // userId -> next index
export const matchBySpin = async (req, res) => {
  const userId = req.user._id;

  try {
    // Retrieve current user's profile to get location and gender preference
    const currentUserLocation = await LocationModel.findOne({ user: userId });

    if (!currentUserLocation) {
      return res.status(404).json({ message: "User not found" });
    }

    const [userLon, userLat] = currentUserLocation.location.coordinates || [
      null,
      null,
    ];
    if (userLat === null || userLon === null) {
      return res.status(400).json({ message: "User location not available" });
    }

    const userProfile = await ProfileModel.findOne({ user: userId });
    if (!userProfile) {
      return res.status(400).send("User profile not found");
    }

    // Set preferred gender based on the user's gender preference
    const userGenderPreference = userProfile.genderPreference;
    let preferredGender = [];

    console.log("User gender preference:", userGenderPreference);

    if (userGenderPreference === "MEN") {
      preferredGender = ["Male"];
    } else if (userGenderPreference === "WOMEN") {
      preferredGender = ["Female"];
    } else if (userGenderPreference === "BOTH") {
      preferredGender = ["Male", "Female"];
    }

    // Use aggregation to calculate distance, filter by gender preference, and retrieve nearby users
    const nearestUsers = await LocationModel.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [userLon, userLat] },
          distanceField: "distance",
          maxDistance: 5000, // 5km
          spherical: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $lookup: {
          from: "profiles",
          localField: "user",
          foreignField: "user",
          as: "profileDetails",
        },
      },
      {
        $unwind: "$profileDetails",
      },
      {
        $match: {
          "userDetails._id": { $ne: userId },
          "profileDetails.gender": { $in: preferredGender },
          "userDetails.isActive": true, //only show users who are online
        },
      },
      {
        $project: {
          user: 1,
          location: 1,
          distance: { $divide: ["$distance", 1000] },
          "userDetails.firstName": 1,
          "userDetails.lastName": 1,
          "profileDetails.profileImage": 1,
          "profileDetails.gender": 1,
          "profileDetails.location": 1,
          "profileDetails.age": 1,
          "profileDetails.occupation": 1,
          "profileDetails.bio": 1,
        },
      },
      {
        $sort: { distance: 1 }, // Sort by distance in ascending order
      },
    ]);

    // Ensure lastFetchedIndex is within the bounds of the array
    if (!nearestUsers.length) {
      return res.status(404).json({ message: "No nearby users found" });
    }
    const key = String(userId);
    let lastFetchedIndex = spinIndexByUser.get(key) || 0;
    if (lastFetchedIndex >= nearestUsers.length) {
      lastFetchedIndex = 0; // Reset index if all users have been fetched
    }

    const userToSend = nearestUsers[lastFetchedIndex];
    spinIndexByUser.set(key, lastFetchedIndex + 1);

    res.json(userToSend);
    
  } catch (error) {
    console.error("Error finding nearby users:", error);
    res.status(500).json({ error: "Error occurred while finding nearby users" });
  }
};