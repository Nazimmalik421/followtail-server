const Post = require('../models/postModel')

const canEditDeletePost = async (req, res, next) => {

    try {
        const post = await Post.findById(req.params._id)
        // console.log('POST TO UPDATE IN MIDDLEWARE', post)
        // console.log('USER ID', req.user._id)
        // console.log('POSTED BY ID', post.postedBy)
        if (req.user._id != post.postedBy) {
            return res.status(400).send('Unauthorized')
        } else {
            next()
        }
    } catch (err) {
        console.log(err)
    }
}

module.exports = canEditDeletePost;