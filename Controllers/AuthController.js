import UserModel from "../Models/userModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import adminModel from "../Models/adminModel.js";

export const registerUser = async (req, res) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt)
    req.body.password = hashedPass
    const newUser = new UserModel(req.body)
    const { username } = req.body

    try {
        const oldUser = await UserModel.findOne({ username })
        if (oldUser) {
            return res.status(400).json({ message: "Username Already exist..!" })
        }
        const user = await newUser.save()

        const token = jwt.sign({ username: user.username, id: user._id }, process.env.JWT_KEY, { expiresIn: '1h' })
        res.status(200).json({ user, token })

    } catch (err) {
        res.status(500).json("* Try another Username / Email")
    }
}


export const loginUser = async (req, res) => {
    try {
        if (req.body.email && req.body.password) {
            const user = await UserModel.findOne({ email: req.body.email })
            !user && res.status(404).json("     * User Not Found")

            if (user) {
                const validity = await bcrypt.compare(req.body.password, user.password)
                if (!validity) {
                    res.status(400).json("     *Wrong Password")
                } else {
                    const accessToken = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_KEY, { expiresIn: '7d' })
                    const { password, updatedAt, createdAt, ...other } = user._doc;

                    res.cookie("accessToken", accessToken, {
                        httpOnly: true,
                        secure: true,
                    }).status(200).json({ other, accessToken })
                }

            } else {
                res.status(404).json("Please fill all credentials")
            }
        }
    } catch (err) {
        res.status(500).json(err)
    }
}

export const adminLogin = async (req, res) => {
    try {
        if (req.body.email && req.body.password) {
            const user = await adminModel.findOne({
                email: req.body.email,
            });
            !user && res.status(404).json("User not found");
            if (user) {
                const validPassword = await bcrypt.compare(
                    req.body.password,
                    user.password
                );
                !validPassword && res.status(400).json("Wrong password");
                if (validPassword) {
                    const accessToken = jwt.sign(
                        { id: user._id, email: user.email, isAdmin: user.isAdmin },
                        process.env.JWT_KEY,
                        { expiresIn: "5d" }
                    );
                    const {
                        password,
                        updatedAt,
                        profilePicture,
                        coverPicture,
                        followers,
                        followings,
                        blocked,
                        email,
                        createdAt,
                        ...other
                    } = user._doc;

                    res
                        .cookie("accessToken", accessToken, {
                            httpOnly: true,
                        })
                        .status(200)
                        .json({ other, accessToken });
                }
            }
        } else {
            res.status(400).json("please fill all the credentials");
        }
    } catch (err) {
        res.status(500).json(err);
    }
}