const bcrypt = require('bcryptjs')

let password = '123abc!'

bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
        console.log('Hash', hash)
    })
})

let hashedPassword = '$2a$10$GWHp0hsLONK2DJy662V60.FFeyQQrQOJ4KcM5U0xprMl5W1VMj7lu'

bcrypt.compare(password, hashedPassword, (err, result) => {
    console.log(result)
})



//////////////////////

// const jwt = require('jsonwebtoken')


// let data = {
//     id: 4
// }

// let secret = '123abc'
// let token = jwt.sign(data, secret)
// console.log('Token', token)

// let decoded = jwt.verify(token, secret)
// console.log('Decoded', decoded)

///////////////////////

// const { SHA256 } = require('crypto-js')

// let message = "I am Sanuja"
// let hash = SHA256(message).toString()

// console.log(`Message: ${message}`)
// console.log(`Hash: ${hash}`)

// let data = {
//     id: 4
// }

// let token = {
//     data,
//     hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
// }

// let resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString()

// if(token.hash === resultHash)
// console.log('Data was not changed')
// else
// console.log('Data was changed. Dont trust!')