const mongoose = require('mongoose')

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost:27017/TodoApp', { useNewUrlParser: true })
    .then(result => { console.log('Mongoose connection succcessful') })
    .catch(err => { console.log('Mongoose connection failed') })


module.exports = { mongoose }