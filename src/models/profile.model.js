import mongoose, { Schema } from "mongoose";
import { ObjectId } from "mongodb";

const profileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    bio: {
      type: String,
    },
    location: {
      type: String
    },

    age: {
      type: Number,
    },
    gender: {
      type: String,
    },
    hobbies: {
      type: String,
    },
    qualification: {
      type: String,
      required: true,
    },
    interests: {
      type: [String],
    },
    drinking: {
      type: String,
      enum: ['Never', 'Occasionally', 'Regularly', 'Quit']
    },
    smoking: {
      type: String,
      enum: ['Never', 'Occasionally', 'Regularly', 'Quit']
    },
    genderPreference: {
      type: String,
      enum: ["MEN", "WOMEN", "BOTH"],
    },
    profileImage: {
      publicId: String,
      url: String,
    },
    additionalImage: [
      {
        publicId: String,
        url: String,
      },
    ],
    reel: {
      publicId: String,
      url: String,
    },
    relationshipGoal: {
      type: String,
    },
    doNotShowFor: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);


const ProfileModel = mongoose.model('Profile', profileSchema);

export default ProfileModel;