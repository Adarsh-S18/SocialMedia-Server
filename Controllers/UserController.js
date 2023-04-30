import UserModel from "../Models/userModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

// G E T   U S E R 

export const getAUser = async (req, res) => {
    try {
        
        const user = await UserModel.findById(req.params.id)
        const { password, updatedAt, ...other } = user._doc;
        res.status(200).json(other);

    } catch (error) {
        res.status(500).json(error)
        console.log(error)
    }
}

export const getUser = async (req, res) => {
    const id = req.params.id
    try {
        const user = await UserModel.findById(id);
        if (user) {
            const { password, ...otherDetails } = user._doc
            res.status(200).json(otherDetails)
        } else {
            res.status(404).json("User not found")
        }
    } catch (err) {
        res.status(500).json(err)
    }
}

export const getFriends = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.userId);
        const friends = await Promise.all(
            user.following.map((friendId) => {
                return UserModel.findById(friendId);
            })
        );
        let friendList = [];
        friends.map((friend) => {
            if (friend != null) {
                const { _id, username, profilePicture } = friend;
                friendList.push({ _id, username, profilePicture });
            }
        });
        res.status(200).json(friendList);
        console.log(friendList)
    } catch (err) {
        res.status(500).json(err);
        console.log(err);
    }
}

//G E T  ALL USER



export const getAllUser = async (req, res) => {
    try {
        const user = await UserModel.find({}, { password: 0 });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json(error)
    }
}

// U P D A T E   U S E R 

export const updateUser = async (req, res) => {
    if (req.body.password) {
        try {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        } catch (err) {
            return res.status(500).json(err);
        }
    }
    try {
        const user = await UserModel.findByIdAndUpdate(req.params.id, {
            $set: req.body,
        });
        res.status(200).json("Account has been updated");
    } catch (err) {
        return res.status(500).json(err);
    }
}

//  D E L E T E    U S E R 


export const deleteUser = async (req, res) => {
    const id = req.params.id;
    const { currentUserId } = req.body
    if (currentUserId === id) {
        try {
            await UserModel.findByIdAndDelete(id)
            res.status(200).json("User Deleted")
        } catch (err) {
            res.status(500).json(err)
        }
    } else {
        res.status(500).json("Not able to delete")
    }
}

//   F O L L O W    U S E R 

export const followUser = async (req, res) => {
    const id = req.params.id;
    const currentUserId = jwt.decode(req.headers['token'].split(" ")[1]).id
    if (currentUserId === id) {
        res.status(500).json("Request forbidden")
    } else {
        try {
            const followUser = await UserModel.findById(id);
            const followingUser = await UserModel.findById(currentUserId);
            if (!followUser.followers.includes(currentUserId)) {
                await followUser.updateOne({ $push: { followers: currentUserId } })
                await followingUser.updateOne({ $push: { following: id } })
                res.status(200).json("User Followed")
            } else {
                res.status(403).json("User is already been followed")
            }
        } catch (err) {
            res.status(500).json(err)
        }
    }
}


//   U N F O L L O W    U S E R 

export const UnfollowUser = async (req, res) => {
    const currentUserId = jwt.decode(req.headers['token'].split(" ")[1]).id
    if (currentUserId !== req.params.id) {
        try {
            const user = await UserModel.findById(req.params.id);
            const currentUser = await UserModel.findById(currentUserId);
            if (user.followers.includes(currentUserId)) {
                await user.updateOne({ $pull: { followers: currentUserId } });
                await currentUser.updateOne({ $pull: { following: req.params.id } });
                res.status(200).json("user has been unfollowed");
            } else {
                res.status(403).json("You are not following this user");
            }
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("you cant unfollow yourself");
    }
}


export const blockUser = async (req, res) => {
    try {
        await UserModel.findByIdAndUpdate(req.params.id, {
            $set: { blocked: true },
        });
        res.status(200).json("Account blocked successfully");
    } catch (err) {
        return res.status(500).json(err);
    }
}

export const unBlockUser = async (req, res) => {
    try {
        await UserModel.findByIdAndUpdate(req.params.id, {
            $set: { blocked: false },
        });
        res.status(200).json("Account unblocked successfully");
    } catch (err) {
        return res.status(500).json(err);
    }
}


export const getStat = async (req, res) => {
    const today = new Date();
    const latYear = today.setFullYear(today.setFullYear() - 1);
    try {
        const data = await UserModel.aggregate([
            {
                $project: {
                    month: { $month: "$createdAt" },
                },
            },
            {
                $group: {
                    _id: "$month",
                    total: { $sum: 1 },
                },
            },
        ]);
        res.status(200).json(data)
    } catch (err) {
        res.status(500).json(err);
    }
}

export const deletePic = async (req, res) => {
    try {
        const userId = jwt.decode(req.headers['token'].split(" ")[1]).id

        const user = await UserModel.findById(userId)
        if (user.profilePicture !== "https://www.kindpng.com/picc/m/780-7804962_cartoon-avatar-png-image-transparent-avatar-user-image.png") {
            const nowUser = await UserModel.findOneAndUpdate({ _id: userId }, { $set: { profilePicture: "https://www.kindpng.com/picc/m/780-7804962_cartoon-avatar-png-image-transparent-avatar-user-image.png" } })
            res.status(200).json(nowUser)
        } else {
            res.status(400).json("User Not found!")
        }
    } catch (error) {
        res.status(500).json(error)
        console.log(error)
    }

}