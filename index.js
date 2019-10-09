
const Web3 = require('web3')
const request = require('request')
const urljoin = require('url-join');

class TomoXJS {
    constructor (
        relayerUri = 'https://dex.tomochain.com',
        pkey = '0xb377a94c7f88c55e4bc83560659ca4cbf6bd17e2d6ab2d32663d9d09ec9766f7' // sample
    ) {
        const web3 = new Web3()
        const account = web3.eth.accounts.privateKeyToAccount(pkey)
        let coinbase = account.address
        web3.eth.accounts.wallet.add(account)
        web3.eth.defaultAccount = coinbase
        this.coinbase = coinbase
        this.relayerUri = relayerUri
    }
    getOrderNonce() {
        return new Promise((resolve, reject) => {

            let url = urljoin(this.relayerUri, '/api/orders/nonce')
            var options = {
                method: 'GET',
                url: url,
                qs: {
                    address: this.coinbase
                },
                json: true,
                headers: {
                    'content-type': 'application/json'
                }
            }
            request(options, (error, response, body) => {
                if (error) {
                    return reject(error)
                }

                try {
                    let nonce = (body || {}).data
                    return resolve(nonce)
                } catch (e) {
                    return reject(Error('Can not get nonce, check relayer uri again'))
                }

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
