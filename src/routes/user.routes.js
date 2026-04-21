import { Router } from "express";
import { registerUser, generateOtpAndSend, loginUser } from "../controllers/auth/localAuth.controller.js";
import { verifyUser } from "../middlewares/verifyjwt.middleware.js";
import { createProfile } from "../controllers/profile/addProfile.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { relationshipGoalsController } from "../controllers/profile/relationshipGoalsController.js";
import { setInterest } from "../controllers/profile/interest.controller.js";
import { jobDetails, moreJobDetails } from "../controllers/profile/personalDetails.js";
import { createPartnerPreference, deletePartnerPreference, getPartnerPreferenceById, updatePartnerPreference } from "../controllers/profile/partnerPreferance.controller.js";
import { getProfileByDesigination } from "../controllers/profileDesigination/ProfileDesigantion.controller.js";
import {getLocation, matchByLocation } from "../controllers/location/location.controller.js";
import { getProfileByQualification } from "../controllers/profileQualification/profileQualification.controller.js";
import { userProfile, users , getUserdetails,getAllProfilesExceptLoggedInUser } from "../controllers/usersDetails/userDetails.controller.js";
import { compareUserWithAllOthers } from "../controllers/userMatchPercent/userMatchPercent.js";
import { editReel } from "../controllers/profile/reel.controller.js";
import { shortlistProfile ,removeShortlistedProfile} from '../controllers/profile/shortListController.js';
import{RejectFriendRequest} from "../controllers/profile/rejectFriendRequest.controller.js"
import { acceptFriendRequest,removeFriendRequest, sendFriendRequest } from "../controllers/profile/friendRequestController.js";
import { viewedBy } from "../controllers/profile/viewedByController.js";
import { getProfiles } from "../controllers/profile/profileController.js"
import { getMessages, sendMessage } from "../controllers/message/message.controller.js";
import { matchBySpin } from "../controllers/spinner/spin.controller.js";

import { getProfile, updateProfile } from "../controllers/Editprofile/Editprofile.js"
import { editProfileValidator } from "../utils/profileValidation.js"
import {getSortedAndFilteredUsers} from '../controllers/sortFilter/sortFilter.cotrller.js'
import { getNotifications } from '../controllers/notification/notificationController.js'


const router = new Router();

// Routes from emailotp branch
router.route("/register").post(registerUser);
router.route("/generateotp").post(generateOtpAndSend);
router.route("/login").post(loginUser);

// Routes from main branch
router.route('/profile-details').post(verifyUser, upload.fields([
    { name: 'profile', maxCount: 1 },
    { name: 'additionalImg', maxCount: 3 },
    { name: 'reel', maxCount: 1 },
]), createProfile);

router.route('/relationship-goals').patch(verifyUser, relationshipGoalsController);
router.route('/reel').patch(verifyUser,upload.single('reel'), editReel);

// New route for setting interest
router.route('/set-interest').patch(verifyUser, setInterest);

//job details
router.post('/job_details', verifyUser, jobDetails);
router.patch('/more_job_details', verifyUser, moreJobDetails);

//partner preferences
router.post('/preferences/:id', createPartnerPreference);
router.get('/preferences/:id', getPartnerPreferenceById);
router.put('/preferences/:id', updatePartnerPreference);
router.delete('/preferences/:id', deletePartnerPreference);

//get profile by desigination
router.get('/profile/designations',verifyUser,getProfileByDesigination)
//get profile by Qualification
router.get('/profile/qualification',verifyUser,getProfileByQualification)
router.get('/profile/:id',userProfile)

//get profile by location
router.post('/getlocation',verifyUser,getLocation)
router.get('/matchbylocation',verifyUser, matchByLocation)

//get profiles by spinning
router.get('/matchbyspin',verifyUser,matchBySpin)

//get data users
router.get("/users", verifyUser, users);
router.get("/user",verifyUser, getUserdetails);
router.get("/userdetails",verifyUser, getAllProfilesExceptLoggedInUser);


router.get('/compare', verifyUser, compareUserWithAllOthers)

// Route to send a friend request
router.patch('/send/:to', verifyUser, sendFriendRequest);
router.delete('/friend-request/:to',verifyUser, removeFriendRequest);

// Route to accept a friend request
router.patch('/accept/:from', verifyUser, acceptFriendRequest);


//Route to Reject reguest
router.patch('/reject/:from',verifyUser,RejectFriendRequest)


// Route to shortlist a profile
router.post('/shortlist/:profileId', verifyUser, shortlistProfile);

router.delete('/delete-shortlist/:profileId', verifyUser, removeShortlistedProfile);

router.patch('/viewed-by/:id', verifyUser, viewedBy);

// Route to get profiles with sort and filter
router.get('/profiles', verifyUser, getProfiles);

router.post('/sortfilter/:id',getSortedAndFilteredUsers)

router.post("/messages/send/:id",verifyUser, sendMessage)
router.get("/messages/:id",verifyUser, getMessages)
router.get("/get-profile",verifyUser, getProfile)
// router.post("/update-profile",verifyUser, updateProfile)

router.post('/update-profile',verifyUser, upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'additionalImg', maxCount: 3 },
    { name: 'reel', maxCount: 1 },
  ]), editProfileValidator, updateProfile);
  
  // get notifications
router.get('/notifications',verifyUser, getNotifications)

export default router;
