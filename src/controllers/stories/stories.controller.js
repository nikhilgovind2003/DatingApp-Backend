import ProfileModel from "../../models/profile.model.js";

export const getStories =
  ("/",
  async (req, res) => {
    const data = await ProfileModel.find({ user: { $in: req.user.friends } }).populate({ path: "user", select: ["firstName"] });


    console.log("data", data); 

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
        user: 1,
        profileImage: 1,
        reel: 1
      });
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }

      const isFriend = req.user.friends?.some((id) => id.toString() === story.user.toString());
      const isSelf = story.user.toString() === req.user._id.toString();
      if (!isFriend && !isSelf) {
        return res.status(403).json({ message: "You are not allowed to view this story" });
      }

      res.json(story);
    } catch (error) {
      if (error.kind === "ObjectId") {
        return res.status(400).json({ message: "Invalid ObjectId" });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
