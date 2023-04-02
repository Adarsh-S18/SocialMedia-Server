import mongoose from "mongoose";
const Schema= mongoose.Schema,
ObjectId = Schema.ObjectId;

const postSchema = mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    desc:{
        type:String,
    },
    likes:{
        type:Array
    },
    reports: {
      type: Array,
      default: [],
    },
    img:{
        type:String
    },
    comments: [
        {
          type: new mongoose.Schema(
            {
              user: { type: ObjectId },
              name: { type: String },
              userId: ObjectId,
              profilePic: { type: String },
              comment: { type: String },
            },
            { timestamps: true }
          ),
        },
      ],
},
{timestamps : true})

const PostModel = mongoose.model("Posts",postSchema);
export default PostModel