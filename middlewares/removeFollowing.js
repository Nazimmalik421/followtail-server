const User = require('../models/user')

const removeFollowing = async (req, res, next) => {
    try {
        //Receiving the user's id which currently loggedIn user wants to unfollow
        const user = await User.findByIdAndUpdate(req.body._id, {
            //The field we want to update is followers array & we want to pull the currently loggedIn user's id out from this followers array
            $pull: { followers: req.user._id }
        });
        next()
    } catch (err) {
        console.log(err)
    }
}

module.exports = removeFollowing;