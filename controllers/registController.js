const User = require('../models/user')
const { hashPassword, comparePassword } = require('../helpers/hashPassword')
const { nanoid } = require('nanoid')
const jwt = require('jsonwebtoken')

exports.registController = async (req, res) => {
    // console.log('REGISTER', req.body)
    const { name, email, password, answer } = req.body;
    //Validating data entered by user
    if (!name || name.trim().length === '') return res.json({ error: 'Please enter a valid name' });
    if (!password || password.length < 6) return res.json({ error: 'Password is required and should be at least 6 characters' });
    if (!answer || answer.trim() === '') return res.json({ error: 'Enter a valid answer.' });
    const userExist = await User.findOne({ email })
    if (userExist) return res.json({ error: 'User already exist' })

    //Hashing password
    const hashedPassword = await hashPassword(password);

    //Creating user based on input received from client
    const user = new User({ name, email, password: hashedPassword, answer, username: nanoid(6) })
    try {
        await user.save();
        console.log(user)
        return res.json({
            ok: true
        })
    } catch (err) {
        console.log('REGISTRATION FAILED', err)
        return res.status(400).send('Error, Try again')
    }
}

exports.login = async (req, res) => {
    // console.log('Login', req.body)

    try {
        const { email, password } = req.body;

        //Checking if user exist in our DATABASE with the provided email on client
        const user = await User.findOne({ email });
        if (!user) return res.json({ error: `User doesn't exist` });

        //Checking password-> providing entered plain password and the hashed password user have in our DATABASE
        const match = await comparePassword(password, user.password)    //if matched returns true else false. 
        if (!match) return res.json({ error: 'Incorrect password' })

        //Creating a JWT token if everything goes well till this point
        //Passing the user data into jwt token and 1st arg Passing user id as payload in jwt token so that later we can extract that id & find that user in our DATABASE 2nd jwtSecret
        //2nd If someone got userId then they won't be able to access any info unless they have JWT secret
        //3rd expirytime
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        //Before sending successfull message on front-end we have to make sure we are not sending the password and secret
        user.password = undefined
        user.answer = undefined
        //Now every details of user will be sent to frontend except password and secret
        res.json({ token, user })

    } catch (err) {
        console.log(err)
        return res.status(400).send('Err. Try again.')
    }
}

exports.currentUser = async (req, res) => {
    // console.log(req.user)
    try {
        const user = await User.findById(req.user._id)//Finding user in our DB using User model
        // res.json(user)
        res.json({ ok: true })
    } catch (err) {
        console.log(err)
        res.sendStatus(400)
    }
}

exports.forgotPassword = async (req, res) => {
    // console.log(req.body)

    const { email, newPassword, answer } = req.body;

    //validation
    if (!email) return res.json({ error: 'Email is incorrect' })
    if (!newPassword || newPassword.length < 6) return res.json({ error: 'New password is required and should be atleast 6 characters' });
    if (!answer) return res.json({ error: 'Answer is required' })

    const user = await User.findOne({ email, answer });
    if (!user) res.json({ error: 'We cant verify you with these details' })

    try {
        const hashedPassword = await hashPassword(newPassword)

        //Finding user By Id and updating his password with updated hashed password
        await User.findByIdAndUpdate(user._id, { password: hashedPassword })
        return res.json({ success: 'Congrats! Now you can login using new password' })

    } catch (err) {
        console.log(err)
        return res.json({ error: 'Something went wrong, try again' })
    }

}

exports.updateProfile = async (req, res) => {

    console.log(req.body)

    try {
        const data = {};

        if (req.body.username) {
            data.username = req.body.username
        }
        if (req.body.about) {
            data.about = req.body.about
        }
        if (req.body.name) {
            data.name = req.body.name
        }
        if (req.body.password) {
            if (req.body.password.length < 6) {
                return res.json({ error: 'Password is required and should be at least 6 characters' })
            } else {
                data.password = await hashPassword(req.body.password)
            }
        }
        if (req.body.answer) {
            data.answer = req.body.answer
        }
        if (req.body.image) {
            data.image = req.body.image
        }

        let user = await User.findByIdAndUpdate(req.user._id, data, { new: true })
        // console.log('UPDATEUSER', user)
        // console.log('PROFILEUPDATE', req.body)
        user.password = undefined;
        user.answer = undefined;
        res.json(user)

    } catch (err) {
        if (err.code === 11000) return res.json({ error: 'Username already taken.' })
        console.log(err)
    }
}

exports.findPeople = async (req, res) => {
    try {
        //Getting the id of the current loggedIn user
        const user = await User.findById(req.user._id)
        let following = user.following; //creating following var & assigning user following array to it which is empty at this point.
        following.push(user._id)        //Pushing users own id into that user's following array
        const people = await User.find({ _id: { $nin: following } })
            .select('-password -answer')    //this select -pass, sec will not send pass, sec as res to frontend
            .limit(10)    //finding every person not including the user's own id
        res.json(people)
    } catch (err) {
        console.log(err)
    }
}

exports.followUser = async (req, res) => {
    /*The $addToSet operator adds or appends a value to an array, only if the value does not exist in the array. 
    The $addToSet returns the same array without modifying when the value already is in the array.*/
    try {
        //receiving the currently loggedIn user ID and adding the user's id into his following user list which he requested to follow
        const user = await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { following: req.body._id }
        }, { new: true }).select('-password -answer')
        res.json(user)

    } catch (err) {
        console.log(err)
    }
}

exports.followingUsers = async (req, res) => {

    try {
        const user = await User.findById(req.user._id);//finding currently loggedIn user in DB
        const following = await User.find({ _id: user.following }).limit(10).select('-password -answer')//find the users based on currently loggedin user is following
        res.json(following)

    } catch (err) {
        console.log(err)
    }
}

exports.unfollowUser = async (req, res) => {

    try {
        //getting curently loggedIn user's id then finding & pulling the id(of the user currently loggedIn user want to unfollow) out of currently loggedIn user's following array
        const user = await User.findByIdAndUpdate(req.user._id, {
            $pull: { following: req.body._id }
        }, { new: true });
        res.json(user)
    } catch (err) {
        console.log(err)
    }
}

exports.searchUser = async (req, res) => {
    const { query } = req.params;   //We are using this query to find user either with their name or their username
    if (!query) return;
    try {
        const user = await User.find({
            $or: [  //This $or will will help look into either name or username
                { name: { $regex: query, $options: 'i' } },//to convert or make query case insensitive we use $regex which is mongodb specific operator
                { username: { $regex: query, $options: 'i' } }
            ]
        }).select('-password -answer')//Selecting what not sent to client as a response. If not seleted then whole user including seacret and password, email will be sent!
        res.json(user)
    } catch (err) {
        console.log(err)
    }
}

exports.getUser = async (req, res) => {
    console.log('SEARCH THIS USER IN DB', req.params.username)
    try {
        const user = await User.findOne({ username: { $regex: req.params.username, $options: 'i' } }).select('-password -answer');
        res.json(user)
    } catch (err) {
        console.log(err)
    }
}


