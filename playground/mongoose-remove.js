const { ObjectID } = require('mongodb')
const { mongoose } = require('./../server/db/mongoose')
const { Todo } = require('./../server/models/todo')

let id = '5b5aeee07c4e973d10de74bf'

if (!ObjectID.isValid(id))
    return console.log('ID not valid')

Todo.remove({}).then(result=>{
    console.log(result)
})

Todo.findOneAndRemove({_id:id}).then(result=>{
    console.log(result)
})

Todo.findByIdAndRemove(id).then(result=>{
    console.log(result)
})