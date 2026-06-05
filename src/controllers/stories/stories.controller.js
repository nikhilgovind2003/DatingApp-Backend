import ProfileModel from "../../models/profile.model.js";
import UserModel from "../../models/user.model.js";
import { users } from "../usersDetails/userDetails.controller.js";

export const getStories =
  ("/",
  async (req, res) => {
    const user = await UserModel.find({}) 
    const data = await ProfileModel.find({}).populate({ path: "user", select: ["firstName"] });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "User not found for stories",
      });
    }

    return res.status(200).json({
      success: true,
      data
    });
  });

export const oneStory =
  ("/:id",
  async (req, res) => {
    // API to get story by ObjectId
    try {
      const story = await ProfileModel.findById(req.params.id, {
        profileImage: 1,
        reel: 1
      });
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }
      res.json(story);
    } catch (error) {
      if (error.kind === "ObjectId") {
        return res.status(400).json({ message: "Invalid ObjectId" });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
