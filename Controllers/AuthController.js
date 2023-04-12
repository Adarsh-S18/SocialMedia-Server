import UserModel from "../Models/userModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import adminModel from "../Models/adminModel.js";
import crypto from 'crypto';
import { sendEmailtoUser } from "../config/EmailTemplate.js";


const generateVerificationToken = () => {
    const buffer = crypto.randomBytes(20);
    return buffer.toString('hex');
};



export const registerUser = async (req, res) => {

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt)
    req.body.password = hashedPass
    const secretKey = "hectrum";
    const verifyToken = jwt.sign({ email: req.body.email }, secretKey, {
        expiresIn: "5m"
    })
    const link = `http://localhost:5000/api/auth/verify/${verifyToken}`

    sendEmailtoUser(link, req.body.email)
    const newUser = new UserModel(req.body)
    newUser.isVerified = false;
    const { username, } = req.body
    try {
        const oldUser = await UserModel.findOne({ username })
        if (oldUser) {
            return res.status(400).json({ message: "Username Already exist..!" })
        }
        const user = await newUser.save()
        console.log(user)
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
            console.log(user, "asdsadsda")

            if (user) {
                if (user.blocked !== true) {
                const isVerifiedProfile = await UserModel.findById(user._id)

                    if (isVerifiedProfile.isVerified) {
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
                        return res.status(400).json("Email Verification Pending")
                    }
                } else {
                    res.status(404).json("The User has been blocked!")
                }
                //Check email verified
            } else {
                res.status(404).json("Please fill all credentials")
            }
        }
    } catch (err) {
        console.log(err)
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

export const saveVerifiedEmail = async (req, res) => {
    const { token } = req.params
    try {
        if (token) {
            //  Verify token
            const secretKey = "hectrum";
            const isEmailVerified = await jwt.verify(token, secretKey)
            if (isEmailVerified) {
                const getUser = await UserModel.findOne({ email: isEmailVerified.email })
                const saveEmail = await UserModel.findByIdAndUpdate(getUser._id, {
                    $set: {
                        isVerified: true
                    }
                })
                if (saveEmail) {
                    res.status(200).json({ message: "Email Verification Success" })
                }
            } else {
                res.status(400).json({ message: "Link expired" })
            }
        } else {
            res.status(400).json({ message: "Inavalid URL" })

        }

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}



// const Verifytoken = new TokenModel({
//     userId: user._id,
//     token: crypto.randomBytes(16).toString('hex')
// })
// console.log(Verifytoken);
// await Verifytoken.save()