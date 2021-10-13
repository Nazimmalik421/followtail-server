const Post = require('../models/postModel')
const User = require('../models/user')
const cloudinary = require('cloudinary')
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

exports.createPost = async (req, res) => {
    // console.log('POST=>', req.body)
    const { content, image } = req.body;
    if (!content || content.length === '') return res.json({ error: 'Content is required!' })

    try {
        const post = new Post({ content, image, postedBy: req.user._id });
        await post.save();

        const postWithUser = await Post.findById(post._id)
            .populate('postedBy', '-password -answer')

        res.json(postWithUser)
        // return res.json({ success: 'Post created' })
    } catch (err) {
        console.log(err)
        res.sendStatus(400)
    }
}
exports.uploadImage = async (req, res) => {
    // console.log('REQ FILES=>', req.body)

    try {
        const result = await cloudinary.uploader.upload(req.files.image.path)
        console.log('UPLOADED IMG URL=>', result)
        res.json({ url: result.secure_url, public_id: result.public_id })
    } catch (err) {
        console.log(err)
    }
}

// exports.postsByUser = async (req, res) => {
//     console.log('POST BY USER', req.body)
//     try {
//         // const posts = await Post.find({ postedBy: req.user._id })//All the posts posted by current user will be available
//         const posts = await Post.find()//All the posts posted by all user will be available
//             .populate('postedBy', '_id name image') //populate helps us to get the user details who created the post like(name, ID, image)
//             .sort({ createdAt: -1 })                //To show the latest post, we sort as per time stamp
//             .limit(10)                              //Limiting posts per request helps to create pagination
//         console.log('POSTs', posts)

//         return res.json(posts)
//     } catch (err) {
//         console.log(err)
//     }
// }

exports.editPost = async (req, res) => {
    // console.log('FROM EDIT POST CONT', req.params._id)

    try {
        //Findng POST in the DB related to passed _id in url params
        const post = await Post.findById(req.params._id)
            //Below code will send res with the details of the creator of post
            .populate('postedBy', '_id name image')
            //Below code will populate the response with commentor's _id name image
            .populate('comments.postedBy', '_id name image')

        res.json(post)  //Sending back that post which has the _id of given id
    } catch (err) {
        console.log(err)
    }
}

exports.updatePost = async (req, res) => {
    // console.log('POST UPDATE CONTROLLER', req.body)

    try {
        //1st argument is actual id, 2nd arg is what we want to update, 3rd is optional but we wont get updated json res unless we pass this 3rd arg new true
        const post = await Post.findByIdAndUpdate(req.params._id, req.body, { new: true })
        res.json(post)
    } catch (err) {
        console.log(err)
    }
}

exports.deletePost = async (req, res) => {
    // console.log('POST RECEVIED TO DELETE', req.body)

    try {
        const post = await Post.findByIdAndDelete(req.params._id)
        //removing image from cloudinary
        if (post.image && post.image.public_id) {
            const image = await cloudinary.uploader.destroy(post.image.public_id)
        }
        res.json({ ok: true })
    } catch (err) {

    }
}

//This will only show the posts for user we are following
exports.newsFeed = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)//getting user id
        let following = user.following;//getting ids of users current user follows
        following.push(req.user._id)//pushing user's own id into following array so that user can see his posts and the people he follow

        //PAGINATION

        const currentPage = req.params.page || 1;//if browser url has page nuber then Receiving page value on req.params.page else default 1
        const postPerPage = 3;
        // console.log('CURRENT PAGE =>', currentPage)

        const posts = await Post.find({ postedBy: { $in: following } })//finding posts posted by following ids in following array
            .skip((currentPage - 1) * postPerPage)//Defining the number of posts to skip as per page number we are on
            .populate('postedBy', '_id name image')
            .populate('comments.postedBy', '_id name image')
            .sort({ createdAt: -1 })//sorting posts array to show latest post
            .limit(postPerPage)//limiting posts to as defined

        res.json(posts)
        // console.log('POST BY USER NEWSFEED', posts)
    } catch (err) {
        console.log(err)
    }
}

exports.likePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.body._id, {//finding post by id which we get from client
            $addToSet: { likes: req.user._id }//Using $addToSet to push the userId into likes array
        }, { new: true })//return the updated post using new: true
        res.json(post)
    } catch (err) {
        console.log(err)
    }
}


exports.unlikePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.body._id, {
            $pull: { likes: req.user._id }//Using $addToSet to push the userId into likes array
        }, { new: true })
        res.json(post)
    } catch (err) {
        console.log(err)
    }
}

exports.addComment = async (req, res) => {
    // console.log('THIS IS COMMENT ON POST', req.body.comment)
    // console.log('ADD THAT COMMENT ON THIS POST', req.body.postId,)
    try {
        const { postId, comment } = req.body;
        const post = await Post.findByIdAndUpdate(postId, {
            //below line will populate the PostModel Schema structure with the comment text and with commentor id

            $push: { comments: { text: comment, postedBy: req.user._id } }//$push helps us to push objects into array even if it is same or more than onw
        }, { new: true })
            //Below code will send res with the details of the creator of post
            .populate('postedBy', '_id name image')
            //Below code will populate the response with commentor's _id name image
            .populate('comments.postedBy', '_id name image')
        res.json(post)
    } catch (err) {
        console.log(err)
    }
}

exports.removeComment = async (req, res) => {
    console.log(req.body.postId, req.body.comment)

    try {
        const { postId, comment } = req.body;
        const post = await Post.findByIdAndUpdate(postId, {
            $pull: { comments: { _id: comment._id } }
        }, { new: true })
        res.json(post)
    } catch (err) {
        console.log(err)
    }
}

exports.totalPosts = async (req, res) => {
    try {
        totalPosts = await Post.find().estimatedDocumentCount();
        res.json(totalPosts)
    } catch (err) {
        console.log(err)
    }
}
exports.posts = async (req, res) => {
    try {
        const post = await Post.find()
            //Below code will populate the response with poster's _id name image ie who created the post
            .populate('postedBy', '_id name image')
            //Below code will populate the response with commentor's _id name image
            .populate('comments.postedBy', '_id name image')
            .sort({ createdAt: -1 })
            .limit(12)
        res.json(post)
    } catch (err) {
        console.log(err)
    }
}
exports.getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params._id)
            //Below code will populate the response with poster's _id name image ie who created the post
            .populate('postedBy', '_id name image')
            //Below code will populate the response with commentor's _id name image
            .populate('comments.postedBy', '_id name image')
        res.json(post)
    } catch (err) {
        console.log(err)
    }
}