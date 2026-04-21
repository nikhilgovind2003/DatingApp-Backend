import UserModel from "../../models/user.model.js";
import ProfileModel from "../../models/profile.model.js";

import deleteFromCloudinary from "../../utils/removeFromCloudinary.js";
import uploadToCloudinary from "../../utils/uploadOnCloudinary.js";
import { validationResult } from "express-validator";

export const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await UserModel.aggregate([
      {
        $match: {
          _id: userId,
        },
      },
      {
        $lookup: {
          from: "profiles",
          localField: "_id",
          foreignField: "user",
          as: "profileDetails",
        },
      },
      {
        $unwind: "$profileDetails",
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          contact: 1,
          email: 1,
          profileDetails: {
            bio: 1,
            reel: 1,
            profileImage: 1,
            additionalImage: 1,
            age: 1,
            gender: 1,
            location: 1,
            hobbies: 1,
            interests: 1,
            drinking: 1,
            smoking: 1,
            qualification: 1,
          },
        },
      },
    ]);
    res.status(200).send(user[0]);
  } catch (error) {
    console.error("failed to fetch user,", error);
    res.status(500).send({ error: "failed" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg, details: errors.array() });
    }

    const userId = req.user._id;
    const { firstName, lastName, bio, age, contact, gender, location, hobbies, interests, drinking, smoking, qualification } = req.body;

    const profile = await ProfileModel.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const personalDetailsUpdate = {};
    const profileUpdate = {};

    if (firstName) personalDetailsUpdate.firstName = firstName;
    if (lastName) personalDetailsUpdate.lastName = lastName;
    if (contact) personalDetailsUpdate.contact = contact;

    if (bio) profileUpdate.bio = bio;
    if (age) profileUpdate.age = age;
    if (gender) profileUpdate.gender = gender;
    if (location) profileUpdate.location = location;
    if (hobbies) profileUpdate.hobbies = hobbies;
    if (interests) profileUpdate.interests = typeof interests === 'string' ? interests.split(',').map(s => s.trim()) : interests;
    if (drinking) profileUpdate.drinking = drinking;
    if (smoking) profileUpdate.smoking = smoking;
    if (qualification) profileUpdate.qualification = qualification;

    // Handle profile image
    if (req.files["profileImage"]) {
      if (profile.profileImage && profile.profileImage.publicId) {
        await deleteFromCloudinary(profile.profileImage.publicId);
      }
      const profileImage = req.files["profileImage"][0];
      const uploadedImage = await uploadToCloudinary(
        profileImage.path,
        "profiles"
      );
      profileUpdate.profileImage = {
        publicId: uploadedImage.public_id,
        url: uploadedImage.secure_url,
      };
    }

    // Handle additional images
    if (req.files["additionalImg"]) {
      if (req.files["additionalImg"].length > 3) {
        return res
          .status(400)
          .json({ error: "You can upload up to 3 additional images only." });
      }

      const newImages = req.files["additionalImg"].map((file) =>
        uploadToCloudinary(file.path, "profiles")
      );
      const newImageResults = await Promise.all(newImages);

      // Find images to delete
      const newImageUrls = newImageResults.map((result) => result.public_id);
      const imagesToDelete = profile.additionalImage
        .filter((img) => !newImageUrls.includes(img.publicId))
        .map((img) => img.publicId);

      // Delete old images
      for (const publicId of imagesToDelete) {
        await deleteFromCloudinary(publicId);
      }

      // Update profile with new images
      profileUpdate.additionalImage = newImageResults.map((result) => ({
        publicId: result.public_id,
        url: result.secure_url,
      }));
    }

    // Handle reel
    if (req.files["reel"]) {
      if (profile.reel && profile.reel.publicId) {
        await deleteFromCloudinary(profile.reel.publicId);
      }
      const reel = req.files["reel"][0];
      const uploadedReel = await uploadToCloudinary(reel.path, "reels");
      profileUpdate.reel = {
        publicId: uploadedReel.public_id,
        url: uploadedReel.secure_url,
      };
    }

    // Update profile in the database
    await ProfileModel.updateOne({ user: userId }, profileUpdate);
    await UserModel.updateOne({ _id: userId }, personalDetailsUpdate);

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Failed to update profile:", error);
    res.status(500).json({ error: error.message });
  }
};