const expressJWT = require('express-jwt')
require("dotenv").config();

//By providing our JWT_SECRET it will verify if the currently loggedIn userToken and JWT_SECRET are matching then it authorised it to access prtected routed
//if it verifies then we will be able to acces user.id or else it throws err
exports.requireSignIn = expressJWT({ secret: process.env.JWT_SECRET, algorithms: ['HS256'] })
