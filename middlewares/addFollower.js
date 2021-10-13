const User = require('../models/user')

const addFollower = async (req, res, next) => {

    /*The $addToSet operator adds or appends a value to an array, only if the value does not exist in the array. 
    The $addToSet returns the same array without modifying when the value already is in the array.*/
    try {
        //receving user ID which is to be followed by currently loggedIn user
        const user = await User.findByIdAndUpdate(req.body._id, {//finding the user based on the req.body._id
            $addToSet: { followers: req.user._id } //then we are adding 1 follower to the following array inside User schema
        })
        next()
    } catch (err) {
        console.log(err)
    }
}

module.exports = addFollower;