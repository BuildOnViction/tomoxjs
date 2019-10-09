
const Web3 = require('web3')
const request = require('request')

class TomoXJS {
    constructor (
        rpcUri = 'https://rpc.tomochain.com',
        pkey = '0xb377a94c7f88c55e4bc83560659ca4cbf6bd17e2d6ab2d32663d9d09ec9766f7' // sample
    ) {
        const web3 = new Web3(rpcUri)
        const account = web3.eth.accounts.privateKeyToAccount(pkey)
        let coinbase = account.address
        web3.eth.accounts.wallet.add(account)
        web3.eth.defaultAccount = coinbase
        this.coinbase = coinbase
        this.rpcUri = rpcUri
    }
    getOrderNonce() {

        return new Promise((resolve, reject) => {

            var options = {
                method: 'POST',
                uri: this.rpcUri,
                path: '/getOrderNonce',
                headers: {
                    'content-type': 'application/json'
                },
                json: true,
                body: {
                    jsonrpc: '2.0',
                    method: 'tomox_getOrderNonce',
                    params: [ this.coinbase ],
                    id: 1
                }
            }
            request(options, (error, response, body) => {
                if (error) {
                    return reject(error)
                }

                return resolve(parseInt(body.result, 16))

            })
        })
        
    }
    createOrder() {
        return 0
    }
    cancelOrder() {
        return 0
    }
}


module.exports = TomoXJS
