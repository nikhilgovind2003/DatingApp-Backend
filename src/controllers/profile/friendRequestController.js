import mongoose from 'mongoose';
import UserModel from '../../models/user.model.js';
import { socket } from '../../app.js';
import { createNotification } from '../notification/notificationController.js';

// Send a Friend Request
export const sendFriendRequest = async (req, res) => {
  try {
    const { to } = req.params;
    const from = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(to)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const sender = await UserModel.findById(from);
    const receiver = await UserModel.findById(to);

    if (!sender || !receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingRequest = receiver.friendRequests.find(res => res.from.toString() === from.toString());
    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    receiver.friendRequests.push({ from: sender._id });
    sender.requestedLists.push(receiver._id);

    await receiver.save();
    await sender.save();

    // Create notification (handles socket emission)
    await createNotification("friend_request", from, to);

    res.status(200).json({
      success: true,
      message: 'Friend request sent successfully'
    });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ success: false, message: 'Error sending friend request' });
  }
};

// Remove a Friend Request
export const removeFriendRequest = async (req, res) => {
  try {
    const { to } = req.params;
    const from = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(to)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const [sender, receiver] = await Promise.all([
      UserModel.findById(from),
      UserModel.findById(to)
    ]);

    if (!sender || !receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    receiver.friendRequests = receiver.friendRequests.filter(req => req.from.toString() !== from.toString());
    sender.requestedLists = sender.requestedLists.filter(id => id.toString() !== to.toString());

    await Promise.all([receiver.save(), sender.save()]);

    res.status(200).json({ success: true, message: 'Friend request removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Accept a Friend Request
export const acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { from } = req.params; 

    if (!mongoose.Types.ObjectId.isValid(from)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const user = await UserModel.findById(userId);
    const friendRequest = user.friendRequests.find(request => request.from.toString() === from.toString());

    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    const alreadyFriend = user.friends.find(u => u.toString() === from.toString());
    if (alreadyFriend) {
      return res.status(400).json({ message: 'User is already a friend' });
    }

    friendRequest.status = 'accepted';
    user.friends.push(from);

    const friend = await UserModel.findById(from);
    friend.friends.push(userId);
    friend.requestedLists = friend.requestedLists.filter(id => id.toString() !== userId.toString());

    await user.save();
    await friend.save();

    // Create notification for acceptance
    await createNotification("friend_request_accepted", userId, from);

    res.status(200).json({ success: true, message: 'Friend request accepted' });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};
