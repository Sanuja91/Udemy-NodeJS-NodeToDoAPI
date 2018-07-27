const { ObjectID } = require('mongodb')
const { mongoose } = require('./../server/db/mongoose')
const { Todo } = require('./../server/models/todo')

let id = 'a5b5aeee07c4e973d10de74bf'

if (!ObjectID.isValid(id))
    return console.log('ID not valid')

// Todo.find({ _id: id })
//     .then(todos => {
//         console.log('Todos', todos)
//     })

// Todo.findOne({ _id: id })
//     .then(todo => {
//         console.log('Todo', todo)
//     })

Todo.findById(id)
    .then(todo => {
        if (!todo)
            return console.log('ID not found')
        console.log('Todo by ID', todo)
    })
    .catch(err => {
        console.log('Error', err)
    })
