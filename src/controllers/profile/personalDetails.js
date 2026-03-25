import EmploymentModel from "../../models/employment.model.js";

// Handler for adding job details
export const jobDetails = async (req, res) => {
  try {
    const { companyName, designation, location } = req.body;
    const { _id: userId } = req.user; 

    console.log(userId);
    
    const employment = await EmploymentModel.findOneAndUpdate(
      { user: userId },
      {
        companyName,
        designation,
        location,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Job details saved successfully",
      employment,
    });
  } catch (error) {
    console.error("Job details error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save job details",
      error: error.message,
    });
  }
};

// Handler for updating additional job details (expertise level)
export const moreJobDetails = async (req, res) => {
  try {
    const { level, title } = req.body;
    const { _id: userId } = req.user; // Get the user ID from the authenticated user

    // Find employment records associated with the authenticated user
    const userEmployments = await EmploymentModel.find({ user: userId });

    if (userEmployments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No employment records found for this user",
      });
    }

    // Update the level for all employment records of this user
    const updatedEmployment = await EmploymentModel.updateMany(
      { user: userId },
      { $set: { level, title } }
    );

    return res.status(200).json({
      success: true,
      message: "Job details updated successfully",
      data: updatedEmployment,
    });
  } catch (error) {
    console.error("Job details update error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update job details",
      error: error.message,
    });
  }
};
