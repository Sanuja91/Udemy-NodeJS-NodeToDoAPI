require('./config/config')

const express = require('express')
const bodyParser = require('body-parser')
const { ObjectID } = require('mongodb')
const _ = require('lodash')
const bcrypt = require('bcryptjs')

const { mongoose } = require('./db/mongoose.js')
const { Todo } = require('./models/todo.js')
const { User } = require('./models/user.js')
const { authenticate } = require('./middleware/authenticate')

const app = express()

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
            res.status(200).send({ todo })
        })
        .catch(err => {
            console.log('Error', err)
            res.status(400).send(`Error ${err}`)
        })

})

app.delete('/todos/:id', (req, res) => {
    let id = req.params.id
    if (!ObjectID.isValid(id))
        return res.status(404).send(`Invalid ID ${id}`)

    Todo.findByIdAndRemove(id)
        .then(todo => {
            if (!todo)
                return res.status(404).send('ID not found')
            console.log('Removed Todo by ID', todo)
            res.status(200).send({ todo })
        })
        .catch(err => {
            console.log('Error', err)
            res.status(400).send(`Error ${err}`)
        })
})

app.patch('/todos/:id', (req, res) => {
    let id = req.params.id
    let body = _.pick(req.body, ['text', 'completed'])

    if (!ObjectID.isValid(id))
        return res.status(404).send(`Invalid ID ${id}`)

    if (_.isBoolean(body.completed) && body.completed)
        body.completedAt = new Date().getTime()
    else {
        body.completed = false
        body.completedAt = null
    }

    Todo.findByIdAndUpdate(id, { $set: body }, { new: true })
        .then(todo => {
            if (!todo)
                return res.status(404).send()
            res.send({ todo })
        })
        .catch(err => {
            res.status(400).send()
        })
})

app.post('/users', (req, res) => {
    let body = _.pick(req.body, ['email', 'password'])
    let user = new User(body)

    user.save()
        .then(() => {
            return user.generateAuthToken()
        })
        .then(token => {
            res.header('x-auth', token).status(200).send(user)
        })
        .catch(err => {
            res.status(400).send(err)
        })
})

app.get('/users/me', authenticate, (req, res) => {
    res.status(200).send(req.user)
})

app.post('/users/login', (req, res) => {
    let body = _.pick(req.body, ['email', 'password'])
    User.findByCredentials(body.email,body.password)
    .then(user=>{
        user.generateAuthToken()
        .then(token=>{
            res.header('x-auth', token).status(200).send(user)
        })
    })
    .catch(err=>{
        res.status(400).send()
    })
})

app.listen(process.env.PORT, () => {
    console.log(`Started on port ${process.env.PORT}`)
})

module.exports = { app }