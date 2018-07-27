const { MongoClient, ObjectID } = require('mongodb')

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
    if (err) {
        console.log('Unable to connect to MongoDB server')
        return
    }
    console.log('Connected to MongoDB server')
    const db = client.db('TodoApp')

    db.collection('Todos').findOneAndUpdate(
        { _id: new ObjectID('5b57376e79520430282d4f82') },
        { $set: { completed: true,text:'Live' } },
        { returnOriginal: false, upsert:false }
    ).then((result) => { console.log('RESULT',result) }
    ).catch((err) => { console.log('ERROR', err) })

    db.collection('Users').findOneAndUpdate(
        { _id: new ObjectID('5b5737c61f81fb042047d3cf') },
        { $set: { name: 'Nuwan' }, $inc:{age:1} },
        { returnOriginal: false, upsert:false }
    ).then((result) => { console.log('RESULT',result) }
    ).catch((err) => { console.log('ERROR', err) })

    client.close()
})
