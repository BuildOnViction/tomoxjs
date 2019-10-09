
const ethers = require('ethers')
const request = require('request')
const urljoin = require('url-join');

class TomoXJS {
    constructor (
        relayerUri = 'https://dex.tomochain.com',
        pkey = '0xb377a94c7f88c55e4bc83560659ca4cbf6bd17e2d6ab2d32663d9d09ec9766f7' // sample
    ) {
        this.relayerUri = relayerUri
        this.wallet = new ethers.Wallet(pkey)
        this.coinbase = this.wallet.address
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
    getRelayerInformation() {
        return new Promise((resolve, reject) => {

            let url = urljoin(this.relayerUri, '/api/info')
            let options = {
                method: 'GET',
                url: url,
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
                    let info = (body || {}).data
                    return resolve(info)
                } catch (e) {
                    return reject(Error('Can not get nonce, check relayer uri again'))
                }

            })
        })
    }
    getOrderHash(order) {
        return ethers.utils.solidityKeccak256(
            [
                'bytes',
                'bytes',
                'bytes',
                'bytes',
                'uint256',
                'uint256',
                'uint256',
                'string',
                'string',
                'uint256',
            ],
            [
                order.exchangeAddress,
                order.userAddress,
                order.baseToken,
                order.quoteToken,
                order.amount,
                order.pricepoint,
                order.side === 'BUY' ? '0' : '1',
                order.status,
                order.type,
                order.nonce
            ],
        )
    }
    createOrder(order) {

        return new Promise(async (resolve, reject) => {

            let relayer = await this.getRelayerInformation()
            let url = urljoin(this.relayerUri, '/api/orders')
            let o = {
                  userAddress: this.coinbase,
                  exchangeAddress: relayer.exchangeAddress,
                  baseToken: order.baseToken,
                  quoteToken: order.quoteToken,
                  side: order.side || 'BUY',
                  type: order.type || 'LO',
                  status: 'NEW',
                  pricepoint: '21207020000000000000000',
                  amount: '4693386710283129'
            }

            o.nonce = await this.getOrderNonce()
            o.hash = this.getOrderHash(o)
            let signature = await this.wallet.signMessage(ethers.utils.arrayify(o.hash))
            let { r, s, v } = ethers.utils.splitSignature(signature)

            o.signature = { R: r, S: s, V: v }


            console.log(o)
            let options = {
                method: 'POST',
                url: url,
                json: true,
                headers: {
                    'content-type': 'application/json'
                },
                body: o
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
    cancelOrder() {
        return 0
    }
}


module.exports = TomoXJS
