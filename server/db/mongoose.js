const mongoose = require('mongoose')

mongoose.Promise = global.Promise
mongoose.connect(process.env.MONGODB_URI)
    .then(result => { console.log('Mongoose connection succcessful') })
    .catch(err => { console.log('Mongoose connection failed') })


module.exports = { mongoose }