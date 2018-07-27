const {MongoClient, ObjectID} = require('mongodb')

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
    if (err) {
        console.log('Unable to connect to MongoDB server')
        return
    }
    console.log('Connected to MongoDB server')
    const db = client.db('TodoApp')
    
    db.collection('Todos').insertOne({
        text:'Walk the dog2',
        completed:true

    }, (err, result) => {
        if (err)
            return console.log('Unable to insert todo', err)

        console.log(JSON.stringify(result.ops, undefined, 2))
    })

    // db.collection('Users').insertOne({
    //     name:'Sanuja',
    //     age:26,
    //     location:'Colombo'

    // }, (err, result) => {
    //     if (err)
    //         return console.log('Unable to insert todo', err)

    //     console.log(JSON.stringify(result.ops[0]._id.getTimestamp(), undefined, 2))
    // })
    

    client.close()
})
