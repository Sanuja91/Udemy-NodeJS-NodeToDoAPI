const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const _ = require('lodash')

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
// Adds methods into the Schema
// Cant use arrow functions here as aarrow function dont hold 'this'
UserSchema.methods.generateAuthToken = function () {
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

let User = mongoose.model('User', UserSchema)

module.exports = { User }