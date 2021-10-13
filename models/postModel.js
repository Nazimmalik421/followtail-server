const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema;

const postSchema = new mongoose.Schema({
    content: {
        type: {},
        required: true
    },
    postedBy: {                                     //This postedBy refers to the post
        type: ObjectId,
        ref: 'User'
    },
    image: {
        url: String,
        public_id: String
    },
    likes: [{ type: ObjectId, ref: 'user' }],
    comments: [
        {
            text: String,
            created: { type: Date, default: Date.now },
            postedBy: {                                     //This postedBy refers to the post
                type: ObjectId,
                ref: 'User'
            }
        }
    ]
}, { timestamps: true })

module.exports = mongoose.model('Post', postSchema)