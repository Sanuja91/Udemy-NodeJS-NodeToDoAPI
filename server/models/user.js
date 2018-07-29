const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const bcrypt = require('bcryptjs')

let secret = 'abc123'

let UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minLength: 1,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        require: true,
        minLength: 6
    },
    tokens: [{
        access: {
            type: String,
            require: true
        },
        token: {
            type: String,
            require: true
        }
    }]
})

// Overrides a method
UserSchema.methods.toJSON = function () {
    let user = this
    let userObject = user.toObject()

    return _.pick(userObject, ['_id', 'email'])
}

// Adds instance methods into the Schema
// Cant use arrow functions here as arrow function dont hold 'this' binding
UserSchema.methods.generateAuthToken = function () {

    // Instance methods get called with the individual document
    let user = this
    let access = 'auth'
    let token = jwt.sign({ _id: user._id.toHexString(), access }, secret).toString()
    user.tokens.push({ access, token })

    console.log('User Tokens', user.tokens)

    return user.save()
        .then(() => {
            return token
        })
}

// Adds model methods into the Schema
UserSchema.statics.findByToken = function (token) {
    // Model methods get called with the model as the 'this' binding
    let User = this
    let decoded

    try {
        decoded = jwt.verify(token, secret)
    } catch (err) {
        console.log('Decoding JWT failed')
        return Promise.reject()
    }

    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    })
}

// Finds user by email address
UserSchema.statics.findByCredentials = function (email, password) {
    let User = this
    User.findOne({ email })
        .then(user => {
            if (!user)
                return Promise.reject()

            return new Promise((resolve, reject) => {
                bcrypt.compare(password, user.password, (err, res) => {
                    if (res)
                        return resolve(user)
                    else
                        return reject()
                })
            })
        })
}

// User is signing out.. Delete specfic token
UserSchema.methods.removeToken = function (token) {
    let user = this
    return user.update({
        $pull: { tokens: { token } }
    })
}

// Runs before user schema 'save' function
UserSchema.pre('save', function (next) {
    let user = this

    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            if (err)
                Promise.reject(err)
            bcrypt.hash(user.password, salt, (err, hash) => {
                if (err)
                    Promise.reject(err)
                user.password = hash
                next()
            })
        })
    }
    else
        next()
})

let User = mongoose.model('User', UserSchema)

module.exports = { User }