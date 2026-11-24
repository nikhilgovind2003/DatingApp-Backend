import mongoose from 'mongoose';
import ProfileModel from "../../models/profile.model.js";
import UserModel from "../../models/user.model.js"; // Assuming the User model is imported

// Function to calculate match percentage between two users
export const calculateMatchPercentage = (userProfile, otherUserProfile) => {
    let matchScore = 0;
    const totalWeight = 100;
    let weightSum = 0;

    const criteria = [
        {
            field: 'drinking',
            weight: 10,
            matchFunc: (a, b) => (a === b ? 1 : 0),
        },
        {
            field: 'smoking',
            weight: 10,
            matchFunc: (a, b) => (a === b ? 1 : 0),
        },
        {
            field: 'qualification',
            weight: 10,
            matchFunc: (a, b) => (a === b ? 1 : 0),
        },
        {
            field: 'age',
            weight: 10,
            matchFunc: (a, b) => (Math.abs(a - b) <= 5 ? 1 : 0),
        },
        {
            field: 'interests',
            weight: 10,
            matchFunc: (a, b) => {
                const userInterests = Array.isArray(a) ? a.flatMap(interest => interest.split(',').map(s => s.trim())) : [];
                const otherUserInterests = Array.isArray(b) ? b.flatMap(interest => interest.split(',').map(s => s.trim())) : [];

                const sharedInterests = userInterests.filter((interest) => otherUserInterests.includes(interest));

                const max = Math.max(userInterests.length, otherUserInterests.length);
                return max ? sharedInterests.length / max : 0;
            },
        },
        {
            field: 'location',
            weight: 10,
            matchFunc: (a, b) => (String(a).trim().toLowerCase() === String(b).trim().toLowerCase() ? 1 : 0),
        },
    ];

    criteria.forEach((criterion) => {
        const { field, weight, matchFunc } = criterion;
        const userField = userProfile[field];
        const otherUserField = otherUserProfile[field];

        if (userField && otherUserField) {
            matchScore += matchFunc(userField, otherUserField) * weight;
        }
        weightSum += weight;
    });

    const matchPercentage = Math.round((matchScore / weightSum) * totalWeight);

    return matchPercentage;
};

// Function to compare a user with all other users and return the results
export const compareUserWithAllOthers = async (req, res) => {
    try {
        const { _id: userId } = req.user;

        const userProfile = await ProfileModel.findOne({ user: userId }).lean();

        if (!userProfile) {
            return res.status(404).json({ message: 'User profile not found.' });
        }

        // Fetch all profiles, removing the gender preference filter
        const allProfiles = await ProfileModel.find({ user: { $ne: userId } })
            .lean()
            .sort({ createdAt: -1 });

        if (allProfiles.length === 0) {
            return res.status(404).json({ message: 'No other users found for comparison.' });
        }

        // Fetch user names in a single query
        const userIds = allProfiles.map(profile => profile.user);
        const userNames = await UserModel.find({ _id: { $in: userIds } }, 'firstName lastName').lean();
        const userNamesMap = Object.fromEntries(userNames.map(user => [user._id.toString(), `${user.firstName} ${user.lastName}`]));

        // Use Promise.all to compare profiles in parallel
        const matchResults = await Promise.all(allProfiles.map(async (otherProfile) => {
            const matchPercentage = calculateMatchPercentage(userProfile, otherProfile);
            const otherUserName = userNamesMap[otherProfile.user.toString()] || 'Unknown';

            return {
                matchPercentage,
                user: otherProfile,
                otherUserName
            };
        }));

        return res.status(200).json({ results: matchResults });
    } catch (error) {
        console.error('Error comparing user with all others:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
