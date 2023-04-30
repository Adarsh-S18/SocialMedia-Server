
import PostModel from '../Models/postModel.js'
import UserModel from '../Models/userModel.js'
import jwt from 'jsonwebtoken';
import ReportModel from '../Models/reportModel.js'
import NotificationModel from '../Models/notificationModel.js';


export const createPost = async (req, res) => {
    try {
        req.body.userId = jwt.decode(req.headers['token'].split(" ")[1]).id
        const newPost = new PostModel(req.body)
        const savedPost = await newPost.save()
        res.status(200).json(savedPost)
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}




export const getPost = async (req, res) => {
    const id = req.params.id;
    try {
        const post = await PostModel.findById(id)
        post ? res.status(200).json(post) : res.status(400).json("Invalid")
    } catch (err) {
        res.status(500).json(err)
    }
}

export const updatePost = async (req, res) => {
    const id = req.params.id;
    const userId = jwt.decode(req.headers['token'].split(" ")[1]).id
    try {
        const post = await PostModel.findById(id)
        if (post.userId === userId) {
            await post.updateOne({ $set: req.body })
            return res.status(200).json("Updated successfully")
        } else {
            return res.status(403).json("Invalid")
        }
    } catch (err) {
        return res.status(500).json(res)
    }
}


export const deletePost = async (req, res) => {
    const id = req.params.id
    const userId = jwt.decode(req.headers['token'].split(" ")[1]).id
    try {
        const post = await PostModel.findById(id)
        if (post.userId === userId) {
            await post.deleteOne()
            return res.status(200).json("Deleted post!")
        } else {
            res.status(403).json("Action forbidden")
        }
    } catch (error) {
        return res.status(500).json(error)
    }
}

export const likePost = async (req, res) => {
    const userId = jwt.decode(req.headers['token'].split(" ")[1]).id
    const id = req.params.id

    console.log(id,"odikko")
    try {
        const post = await PostModel.findById(id)
        if (!post) {
            res.status(403).json("Post Not Found")
        }
        const tempPostId = post._id.toString()

        if (!post.likes.includes(userId)) {
            await post.updateOne({ $push: { likes: userId } })
            if (post.userId != id) {
                NotificationModel.create({
                    userId: post.userId,
                    emiterId: userId,
                    text: 'liked your post.',
                    postId: tempPostId
                })
                    .then((response) => res.status(200).json("post liked"))
                    .catch((error) => res.status(500).json(error))
            }
            else res.status(200).json("Post liked")
        } else {
            await post.updateOne({ $pull: { likes: userId } })
            if (post.userId != id) {
                NotificationModel.create({
                    userId: post.userId,
                    emiterId: userId,
                    text: 'Liked your post.',
                    postId: req.body.postId
                }).then((response) => res.status(200).json("Post disliked"))
                    .catch((error) => res.status(500).json(error))
            } else res.status(200).json("post removed")
        }
    } catch (error) {
        console.log(error, "like ile errror");
        return res.status(500).json(error)
    }
}


// GET TIMELINE POST


export const getTimelinePost = async (req, res) => {
    try {
        const userid = jwt.decode(req.headers['token'].split(" ")[1]).id;
        if (userid) {
            const currentUser = await UserModel.findById(userid)
            const userPosts = await PostModel.find({ userId: currentUser._id, _id: { $nin: currentUser.reportedPost } });
            const friendPosts = await Promise.all(
                currentUser.following.map((friendId) => {
                    return PostModel.find({ userId: friendId, _id: { $nin: currentUser.reportedPost } });
                })
            );
            res.status(200).json(userPosts.concat(...friendPosts));
        } else {
            const userPosts = await PostModel.find();
            res.status(200).json(userPosts);
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}




export const userPosts = async (req, res) => {
    try {
        const posts = await PostModel.find({ userId: req.params.id })
        res.status(200).json(posts)
    } catch (err) {
        res.status(500).json(err);
    }
}

export const allPosts = async (req, res) => {
    try {
        const posts = await PostModel.find();
        res.status(200).json(posts)
    } catch (error) {
        res.status(500).json(error)
    }
}

export const addComment = async (req, res) => {
    try {
        const comment = req.body;
        const idUser = jwt.decode(req.headers['token'].split(" ")[1]).id
        comment.userId = jwt.decode(req.headers['token'].split(" ")[1]).id
        const post = await PostModel.findById(req.params.id);
        await post.updateOne({ $push: { comments: comment } });
        NotificationModel.create({
            userId: post.userId,
            emiterId: idUser,
            text: 'commented your post.',
            postId: req.params.id
          })
        res.status(200).json("commented successfully");
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}


export const deleteComment = async (req, res) => {
    try {
        const commentId = req.params.id
        const userId = jwt.decode(req.headers['token'].split(" ")[1]).id
        const post = await PostModel.findOne({ "comments._id": commentId })

        await post.updateOne({ $pull: { comments: { _id: commentId } } })
        res.status(200).json("Comment deleted Successfully")

    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }

}

export const allReports = async (req, res) => {
    console.log("oooh no")
    try {
        const reports = await ReportModel.find();
        res.status(200).json(reports);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}


export const reportPost = async (req, res) => {
    try {
        const post = await PostModel.findById(req.params.id);
        const user = jwt.decode(req.headers['token'].split(" ")[1]).id
        const theUser = await UserModel.findById(user)
        req.body.userId = user;
        req.body.name = theUser.email;
        req.body.postId = post._id;

        console.log(req.body.userId, req.body.postId, "asddsaadsdsadsa");
        req.body.post = post?.img;
        req.body.desc = post.desc;
        req.body.type = "post";

        if (post?.reports.filter((e) => e === user).length <= 0) {
            await theUser.updateOne({ $push: { reportedPost: req.body.postId.toString() } });
            await post.updateOne({ $push: { reports: user } });
            const newReport = new ReportModel(req.body);
            const savedReport = await newReport.save();
            res.status(200).json(savedReport);
        } else {
            res.status(403).json("You already reported this post");
        }
    } catch (err) {
        res.status(500).json(err);
        console.log(err);
    }
}


export const rejectReport = async (req, res) => {
    try {
        console.log(req.query.name, "userid")
        console.log(req.params.id, "postid")
        var isPostFound = true;
        const post = await PostModel.findById(req.params.id)
        if (!post) {
            res.status(403).json("Post not found");
            isPostFound = false;
        }
        await post.updateOne({ $pull: { reports: req.query.name } }).then((res) => {
            console.log(res, "hm")
        })
        await ReportModel.deleteMany({ _id: req.query.id })
        res.status(200).json("Report Removed")
    } catch (error) {
        if (isPostFound) {
            res.status(500).json(error)
        }
        console.log(error)
    }
}

export const resolveReport = async (req, res) => {
    try {
        var isPostFound = true
        const post = await PostModel.findById(req.params.id)
        if (!post) {
            res.status(403).json("Post not found !")
            isPostFound = false;
        }
        await post.deleteOne()
        await ReportModel.deleteMany({ _id: req.query.id })
        res.status(200).json('Post deleted!')

    } catch (error) {
        if (isPostFound) {
            res.status(500).json(error)
        }
        console.log(error);
    }
}


export const getPostStat = async (req, res) => {
    const today = new Date()
    const latYear = today.setFullYear(today.setFullYear() - 1);
    try {
        const data = await PostModel.aggregate([
            {
                $project: {
                    month: { $month: "$createdAt" }
                }
            },
            {
                $group: {
                    _id: "$month",
                    total: { $sum: 1 },
                }
            }
        ])
        res.status(200).json(data)
        console.log(data)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}