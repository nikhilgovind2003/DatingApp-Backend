
import ProfileModel from "../../models/profile.model.js";

export const getProfiles = async (req, res) => {
    try {
        const {
            sortBy,
            sortOrder = 'asc', // default ascending
            gender,
            location,
            hobbies,
            interests,
            ageMin,
            ageMax,
            smoking,
            drinking,
            languages,
            relationshipGoals,
            // Add other filter parameters as needed
        } = req.query;

        // Build the filter object
        const filter = {};

        if (gender) filter.gender = gender;
        if (location) filter['location.place'] = { $regex: location, $options: 'i' }; // Case-insensitive
        if (hobbies) filter.hobbies = { $regex: hobbies, $options: 'i' };
        if (interests) filter.interests = { $regex: interests, $options: 'i' };
        if (smoking) filter.smoking = smoking;
        if (drinking) filter.drinking = drinking;
        if (languages) filter.languages = { $regex: languages, $options: 'i' };
        if (relationshipGoals) filter.relationshipGoals = { $regex: relationshipGoals, $options: 'i' };

        if (ageMin || ageMax) {
            filter.age = {};
            if (ageMin) filter.age.$gte = Number(ageMin);
            if (ageMax) filter.age.$lte = Number(ageMax);
        }

        // Implementing geographical filtering (e.g., within a certain distance)
        // For simplicity, assuming `location.coordinates` are [lon, lat]
        // and we want to filter users within a certain distance (e.g., 50km)

        // Example: Add this if you have latitude and longitude in filters
        // const { latitude, longitude, distance } = req.query;
        // if (latitude && longitude && distance) {
        //     const earthRadiusKm = 6371;
        //     const maxDistance = distance / earthRadiusKm; // Convert distance to radians
        //     filter.location = {
        //         $geoWithin: {
        //             $centerSphere: [[longitude, latitude], maxDistance]
        //         }
        //     };
        // }

        // Build the sort object
        let sortOptions = {};
        if (sortBy) {
            // Map sortBy to actual fields in the database
            const sortFields = {
                'Newest Member': { createdAt: -1 },
                'Last Active': { lastActive: -1 }, // Assuming you have a lastActive field
                'Distance': { 'location.coordinates': 1 }, // This requires proper geospatial indexing
                'Popularity': { popularity: -1 }, // Assuming you have a popularity field
                'Age': { age: 1 },
            };

            if (sortFields[sortBy]) {
                sortOptions = sortFields[sortBy];
            }
        }

        // Fetch profiles from the database
        const profiles = await ProfileModel.find(filter)
            .sort(sortOptions)
            .exec();

        return res.status(200).json({
            success: true,
            count: profiles.length,
            profiles,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
