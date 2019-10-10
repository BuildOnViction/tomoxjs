const TomoXJS = require('./index')


let tomox = new TomoXJS('http://localhost:3001/', '0x84d044e32416c2caa14ba6e5b2f423ff20811329128c85889a1eac6769e1eb80')

/*
tomox.getOrderNonce().then(data => {
    console.log(data)
})
tomox.getRelayerInfo().then(data => {
    console.log(data)
})
*/
const args = process.argv.slice(2);
tomox.createOrder({
    baseToken:'0xBD8b2Fb871F97b2d5F0A1af3bF73619b09174B2A',
    quoteToken: '0x0000000000000000000000000000000000000001',
    price: '21207.02',
    amount: '0.004693386710283129',
    nonce: String(args[0])
}).then(data => {
    console.log('order', data.nonce)
    /*
    return tomox.cancelOrder(data.hash).then(data => {
        console.log('cancelOrder', data)
    })
    */
}).catch(e => console.log(e))
