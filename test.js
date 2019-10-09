const TomoXJS = require('./index')


let tomox = new TomoXJS('http://localhost:8545')

tomox.getOrderNonce().then(data => {
    console.log(data)
})
