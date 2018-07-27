const { MongoClient, ObjectID } = require('mongodb')

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
    if (err) {
        console.log('Unable to connect to MongoDB server')
        return
    }
    console.log('Connected to MongoDB server')
    const db = client.db('TodoApp')

    // Delete many
    db.collection('Todos').deleteMany(
        { text: 'Walk the dog2' }
    ).then(result => { console.log(result) })

    // Delete one
    db.collection('Todos').deleteOne(
        { text: 'Walk the dog1' }
    ).then(result => { console.log(result) })
    
    // Find one and delete
    db.collection('Todos').findOneAndDelete(
        { text: 'Walk the dog' }
    ).then(result => { console.log(result) })
    
    client.close()
})
