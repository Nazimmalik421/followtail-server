const bcrypt = require('bcrypt')

exports.hashPassword = (password) => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(12, (err, salt) => {
            if (err) {
                reject(err)
            }
            bcrypt.hash(password, salt, (err, hashed) => {
                if (err) {
                    reject(err)
                }
                resolve(hashed)
            })
        })
    })
}

exports.comparePassword = (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword)
}