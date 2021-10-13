const expresss = require('express');
const router = expresss.Router()

//Middlewares
const { requireSignIn } = require('../middlewares/checkAuthTokenMidware')
const addFollower = require('../middlewares/addFollower')
const removeFollowing = require('../middlewares/removeFollowing')
//Controllers
const { registController, login, currentUser, forgotPassword, updateProfile, findPeople, followUser, followingUsers, unfollowUser, searchUser,
    getUser } = require('../controllers/registController');
const isAdmin = require('../middlewares/isAdmin');

router.post('/register', registController);
router.post('/login', login);

//After user has loggedIn we make request to our CLIENT to get the current loggedIn user
//To protect our ROUTES We have to make sure that user is loggedIn by getting current user JWT token from this get request from BACKEND->
//If the token is valid (not expired & issued by our BACKEND) only then we will be able to get that user from DB & send success res
//MIDDLEWARE -> before we try to access the currentUser from our database we need to verify the token 
router.get('/current-user', requireSignIn, currentUser);
router.post('/forgot-password', forgotPassword);
router.put('/profile-update', requireSignIn, updateProfile);
router.get('/find-people', requireSignIn, findPeople);
router.put('/follow-user', requireSignIn, addFollower, followUser);
router.put('/unfollow-user', requireSignIn, removeFollowing, unfollowUser);
router.get('/following-users', requireSignIn, followingUsers);
router.get('/search-user/:query', requireSignIn, searchUser);
router.get('/user/:username', getUser);
router.get('/current-admin',requireSignIn, isAdmin);

// router.post('/create-post',requireSignIn, createPost);


module.exports = router;