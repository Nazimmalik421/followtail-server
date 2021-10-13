const expresss = require('express');
const postsRouter = expresss.Router();
const formidable = require('express-formidable');
const canEditDeletePost = require('../middlewares/canEditDeletePost')
const isAdmin = require('../middlewares/isAdmin')


//Middlewares
const { requireSignIn } = require('../middlewares/checkAuthTokenMidware')

//Controllers
const { createPost, uploadImage, postsByUser, editPost,
    updatePost, deletePost, newsFeed, likePost,
    unlikePost, addComment, removeComment, totalPosts,posts, getPost
} = require('../controllers/postsController')

postsRouter.post('/create-post', requireSignIn, createPost);
postsRouter.post('/upload-image', requireSignIn, formidable({ maxFileSize: 5 * 1024 * 1024 }), uploadImage);

// postsRouter.get('/user-posts', requireSignIn, postsByUser)
postsRouter.get('/user-post/:_id', requireSignIn, editPost)
postsRouter.put('/update-post/:_id', requireSignIn, canEditDeletePost, updatePost)
postsRouter.delete('/delete-post/:_id', requireSignIn, canEditDeletePost, deletePost)
postsRouter.put('/like-post', requireSignIn, likePost);
postsRouter.put('/unlike-post', requireSignIn, unlikePost);
postsRouter.post('/add-comment', requireSignIn, addComment);
postsRouter.put('/remove-comment', requireSignIn, removeComment);
postsRouter.get('/total-post', totalPosts);
postsRouter.get('/posts', posts);
postsRouter.get('/post/:_id', getPost);
postsRouter.get('/newsfeed/:page', requireSignIn, newsFeed)

//Admin
postsRouter.delete('/admin/delete-post/:_id', requireSignIn, isAdmin, deletePost)

// postsRouter.get('/user-post/:_id', requireSignIn, removeComment);


module.exports = postsRouter;