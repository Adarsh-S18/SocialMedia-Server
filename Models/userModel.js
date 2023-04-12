import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: String,
        default:
            "https://www.kindpng.com/picc/m/780-7804962_cartoon-avatar-png-image-transparent-avatar-user-image.png",
    },
    coverPicture: {
        type: String,
        default: ''
    },
    followers: {
        type: Array,
        default: []
    },
    following: {
        type: Array,
        default: []
    },
    blocked: {
        type: Boolean,
        default: false,
    },
    city: {
        type: String,
        max: 50,
    },
    from: {
        type: String,
        max: 50,
    },
    desc: {
        type: String,
        max: 20
    },
    reportedPost: {
        type: Array,
        default: [],
    },
    isVerified: {
        type: Boolean
    }

},
    { timestamps: true })

const UserModel = mongoose.model("Users", UserSchema)
export default UserModel;