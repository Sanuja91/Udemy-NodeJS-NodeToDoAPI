const expect = require('expect')
const request = require('supertest')
const { ObjectID } = require('mongodb')

const { app } = require('../server.js')
const { Todo } = require('./../models/todo')

const todos = [
    {
        _id: new ObjectID(),
        text: "First test todo"
    },
    {
        _id: new ObjectID(),
        text: "Second test todo"
    }
]


// Runs before of the test cases
// Clears the Todos database
// Sometimes shit gets fucked,, doesn't make sense
// Error Uncaught TypeError:Cannot read property call of undefined
beforeEach((done) => {
    Todo.remove({})
        .then(() => { return Todo.insertMany(todos) })
        .then(() => done())
})

describe('POST/todos', () => {
    it('should create a new todo', (done) => {
        let text = 'Test todo text'

        request(app)
            .post('/todos')
            .send({ text })
            .expect(200)
            .expect(res => {
                expect(res.body.text).toBe(text)
            })
            .end((err, res) => {
                if (err)
                    return done(err)
                Todo.find({ text })
                    .then((todos) => {
                        expect(todos.length).toBe(1)
                        expect(todos[0].text).toBe(text)
                        done()
                    }).catch(err => {
                        done(err)
                    })
            })
    })

    it('should not create a new todo due to invalid data', (done) => {
        let text = ''
        request(app)
            .post('/todos')
            .send({ text })
            .expect(400)
            .end((err, res) => {
                if (err)
                    return done(err)

                Todo.find().then(todos => {
                    expect(todos.length).toBe(2)
                    done()
                }).catch(err => done(err))
            })
    })
})

describe('GET/todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect(res => {
                expect(res.body.todos.length).toBe(2)
            })
            .end(done())
    })
})

describe('GET/todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect(res => {
                expect(res.body.todo.text).toBe(todos[0].text)
            })
            .end(done())
    })

    it('should return 404 if todo not found', (done) => {
        let hexID = new ObjectID().toHexString()
        request(app)
            .get(`/todos/${hexID}`)
            .expect(404)
            .end(done())
    })

    it('should return 404 if object ID is invalid', (done) => {
        let hexID = 123
        request(app)
            .get(`/todos/${hexID}`)
            .expect(404)
            .end(done())
    })
})

describe('DELETE/todos/:id', () => {
    it('should remove a todo', (done) => {
        let hexID = todos[0]._id.toHexString()
        request(app)
            .delete(`/todos/${hexID}`)
            .expect(200)
            .expect(res => {
                expect(res.body.todo._id).toBe(hexID)
            })
            .end((err, res) => {
                console.log('ERR', err)
                if (err)
                    return done(err)
                Todo.findById(hexID)
                    .then(todo => {
                        expect(todo).toNotExist()
                        done()
                    }).catch(err => {
                        done(err)
                    })
            })
    })

    it('should return 404 if todo not found', (done) => {
        let hexID = new ObjectID().toHexString()
        request(app)
            .delete(`/todos/${hexID}`)
            .expect(404)
            .end(done())
    })

    it('should return 404 if object ID is invalid', (done) => {
        let hexID = 123
        request(app)
            .delete(`/todos/${hexID}`)
            .expect(404)
            .end(done())
    })


})
