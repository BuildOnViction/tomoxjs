const TomoXJS = require('./index')


let tomox = new TomoXJS('http://localhost:3001/')

tomox.getOrderNonce().then(data => {
    console.log(data)
})
