const express = require('express')
const bodyParser = require('body-parser')
const { ObjectID } = require('mongodb')

const { mongoose } = require('./db/mongoose.js')
const { Todo } = require('./models/todo.js')
const { User } = require('./models/user.js')

const app = express()
const port = process.env.PORT || 3000

app.use(bodyParser.json())

app.post('/todos', (req, res) => {
    let todo = new Todo({
        text: req.body.text
    })
    todo.save()
        .then(doc => { res.status(200).send(doc) })
        .catch(err => { res.status(400).send(err) })
})

app.get('/todos', (req, res) => {
    Todo.find()
        .then(
            todos => { res.send({ todos }) },
            err => { res.status(400).send(err) })
})

app.get('/todos/:id', (req, res) => {
    let id = req.params.id
    if (!ObjectID.isValid(id))
        return res.status(404).send(`Invalid ID ${id}`)

    Todo.findById(id)
        .then(todo => {
            if (!todo)
                return res.status(404).send('ID not found')
            console.log('Todo by ID', todo)
            res.status(200).send({todo})
        })
        .catch(err => {
            console.log('Error', err)
            res.status(400).send(`Error ${err}`)
        })
   
})
app.listen(port, () => {
    console.log(`Started on port ${port}`)
})

module.exports = { app }