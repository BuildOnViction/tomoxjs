
const ethers = require('ethers')
const request = require('request')
const urljoin = require('url-join');
const BigNumber = require('bignumber.js')
const validator = require('validator')

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
                    let nonce = ((body || {}).data || 0).toString()
                    return resolve(nonce)
                } catch (e) {
                    return reject(Error('Can not get nonce, check relayer uri again'))
                }

            })
        })
    }
    getRelayerInfo() {
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
    getTokenInfo(address) {
        return new Promise((resolve, reject) => {

            let url = urljoin(this.relayerUri, '/api/tokens', address)
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
                    return reject(Error('Can not get token info, check relayer uri again'))
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
    getOrderCancelHash(oc) {
        return ethers.utils.solidityKeccak256(['bytes', 'uint256'], [oc.orderHash, oc.nonce])
    }
    createOrder(order) {
        return new Promise(async (resolve, reject) => {
            try {
                let relayer = await this.getRelayerInfo()
                let url = urljoin(this.relayerUri, '/api/orders')
                let o = {
                    userAddress: this.coinbase,
                    exchangeAddress: relayer.exchangeAddress,
                    baseToken: order.baseToken,
                    quoteToken: order.quoteToken,
                    side: order.side || 'BUY',
                    type: order.type || 'LO',
                    status: 'NEW'
                }

                let baseToken = await this.getTokenInfo(order.baseToken)
                let quoteToken = await this.getTokenInfo(order.quoteToken)

                if (!baseToken || !quoteToken) {
                    return reject(Error('Can not get token info'))
                }

                o.pricepoint = new BigNumber(order.price)
                    .multipliedBy(10 ** baseToken.decimals).toString(10)
                o.amount = new BigNumber(order.amount)
                    .multipliedBy(10 ** quoteToken.decimals).toString(10)

                o.nonce = validator.isInt(order.nonce || "0") ? String(order.nonce) : await this.getOrderNonce()
                o.hash = this.getOrderHash(o)
                let signature = await this.wallet.signMessage(ethers.utils.arrayify(o.hash))
                let { r, s, v } = ethers.utils.splitSignature(signature)

                o.signature = { R: r, S: s, V: v }

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
                    if (response.statusCode !== 200 && response.statusCode !== 201) {
                        return reject(body)
                    }

                    return resolve(o)

                })
            } catch(e) {
                return reject(e)
            }
        })
    }
    cancelOrder(orderHash, nonce = 0) {
        return new Promise(async (resolve, reject) => {

            try {
                const oc = {}
                oc.orderHash = orderHash
                oc.nonce = nonce || await this.getOrderNonce()
                oc.hash = this.getOrderCancelHash(oc)

                const signature = await this.wallet.signMessage(ethers.utils.arrayify(oc.hash))
                const { r, s, v } = ethers.utils.splitSignature(signature)

                oc.signature = { R: r, S: s, V: v }

                let url = urljoin(this.relayerUri, '/api/orders/cancel')
                let options = {
                    method: 'POST',
                    url: url,
                    json: true,
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: oc
                }
                request(options, (error, response, body) => {
                    if (error) {
                        return reject(error)
                    }
                    if (response.statusCode !== 200 && response.statusCode !== 201) {
                        return reject(body)
                    }

                    return resolve(oc)

                })
            } catch(e) {
                return reject(e)
            }
        })
    }
    getPairs() {
        return new Promise((resolve, reject) => {

            let url = urljoin(this.relayerUri, '/api/pairs')
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
                    let pairs = (body || {}).data
                    return resolve(pairs)
                } catch (e) {
                    return reject(Error('Can not get pairs, check relayer uri again'))
                }
            })
        })
    }
}


module.exports = TomoXJS
