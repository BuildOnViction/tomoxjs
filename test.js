const TomoXJS = require('./index')


let tomox = new TomoXJS('http://localhost:3001/')

tomox.getOrderNonce().then(data => {
    console.log(data)
})
tomox.getRelayerInformation().then(data => {
    console.log(data)
})
tomox.createOrder({
    baseToken:'0xBD8b2Fb871F97b2d5F0A1af3bF73619b09174B2A',
    quoteToken: '0x0000000000000000000000000000000000000001'
}).then(data => {
    console.log(data)
})
