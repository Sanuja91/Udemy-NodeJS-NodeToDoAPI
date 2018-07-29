const mongoose = require('mongoose')

let Todo = mongoose.model('Todo', {
    text: { type: String, required: true, minLength: 5, trim: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Number, default: new Date().getTime() },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
})

module.exports = { Todo }