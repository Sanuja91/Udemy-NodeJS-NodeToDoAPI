const expect = require('expect')
const request = require('supertest')
const { ObjectID } = require('mongodb')

const { app } = require('../server.js')
const { Todo } = require('./../models/todo')
const { User } = require('./../models/user')
const { todos, users, populateTodos, populateUsers } = require('./seed/seed')

// Runs before of the test cases
// Clears the Todos database
// Sometimes shit gets fucked,, doesn't make sense
// Error Uncaught TypeError:Cannot read property call of undefined

beforeEach(done => { populateUsers(done) })
beforeEach(done => { populateTodos(done) })

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

describe('PATCH/todos/:id', () => {
    it('should update a todo to completed', (done) => {
        let hexID = todos[0]._id.toHexString()
        let text = 'Testing patch'
        request(app)
            .delete(`/todos/${hexID}`)
            .send({
                text,
                completed: true
            })
            .expect(200)
            .expect(res => {
                expect(res.body.todo.completed).toBe(true)
                expect(res.body.todo.text).toBe(text)
                expect(res.body.todo.completedAt).toBeA('number')
            })
            .end(done())
    })


    it('should update a todo to not completed', (done) => {
        let hexID = todos[1]._id.toHexString()
        let text = 'Testing patch'
        request(app)
            .delete(`/todos/${hexID}`)
            .send({
                text,
                completed: false
            })
            .expect(200)
            .expect(res => {
                expect(res.body.todo.completed).toBe(false)
                expect(res.body.todo.text).toBe(text)
                expect(res.body.todo.completedAt).toNotExist()
            })
            .end(done())
    })
})

describe('GET/users/me', () => {
    it('should return user if authenticated', (done) => {
        request(app)
            .get(`/users/me`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect(res => {
                expect(res.body._id).toBe(users[0]._id.toHexString())
                expect(res.body.email).toBe(users[0].email)
            })
            .end(done())
    })

    it('should return 401 if user is not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(401)
            .expect(res => {
                expect(res.body).toEqual({})
            })
            .end(done())
    })
})


describe('POST/users/me', () => {
    it('should create a user', (done) => {
        let email = 'sanujasasds@gmail.com'
        let password = 'sdad123'
        request(app)
            .post(`/users`)
            .send({ email, password })
            .expect(200)
            .expect(res => {
                expect(res.headers['x-auth']).toExist()
                expect(res.body.email).toBe(email)
                expect(res.body._id).toExist()
            })
            .end(err => {
                if (err)
                    return done(err)

                User.findOne({ email }).then(user => {
                    expect(user).toExist()
                    expect(user.password).toNotBe(password)
                    done()
                })
            })
    })

    it('should not create user if email in use', (done) => {
        let email = 'sanujass@live.com'
        let password = 'sdad123'
        request(app)
            .post(`/users`)
            .send({ email, password })
            .expect(400)
            .end(done())
    })

    it('should return validation errors if request is invalid', (done) => {
        let email = 'ssadasdsa'
        let password = 'sdad123'
        request(app)
            .post(`/users`)
            .send({ email, password })
            .expect(400)
            .end(done())
    })
})


describe('POST/users/login', () => {
    it('should login user and return auth token', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: users[1].password
            })
            .expect(200)
            .expect(res => {
                expect(res.headers['x-auth']).toExist()
            })
            .end((err, res) => {
                if (err)
                    return done(err)
                User.findById(users[1]._id)
                    .then(user => {
                        expect(user.token[0]).toInclude({
                            access: 'auth',
                            token: res.headers['x-auth']
                        })
                        done()
                    })
                    .catch(err => {
                        done(err)
                    })
            })
    })

    it('should reject invalid login',(done)=>{
        request(app)
        .post('/users/login')
        .send({
            email: users[0].email,
            password: 'asdasdas'
        })
        .expect(400)
        .end(done())
    })
})
