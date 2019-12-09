
const ethers = require('ethers')
const request = require('request')
const urljoin = require('url-join');
const BigNumber = require('bignumber.js')

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
        if (order.type === 'MO') {
            return ethers.utils.solidityKeccak256(
                [
                    'bytes',
                    'bytes',
                    'bytes',
                    'bytes',
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
                    order.side === 'BUY' ? '0' : '1',
                    order.status,
                    order.type,
                    order.nonce
                ],
            )
        }
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
        return ethers
            .utils.solidityKeccak256(
                ['bytes', 'uint256', 'bytes', 'uint256', 'string', 'bytes'],
                [oc.orderHash, oc.nonce, oc.userAddress, oc.orderID, oc.status, oc.exchangeAddress]
            )
    }
    createManyOrders(orders) {
        return new Promise(async (resolve, reject) => {
            try {
                let relayer = await this.getRelayerInfo()
                let url = urljoin(this.relayerUri, '/api/orders')

                let ret = []
                let nonce = orders[0].nonce || await this.getOrderNonce()

                for (let order of orders) {
                    let o = {
                        userAddress: this.coinbase,
                        exchangeAddress: order.exchangeAddress || relayer.exchangeAddress,
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

                    if (o.type !== 'MO') {
                        o.pricepoint = new BigNumber(order.price)
                            .multipliedBy(10 ** quoteToken.decimals).toString(10)
                    }
                    o.amount = new BigNumber(order.amount)
                        .multipliedBy(10 ** baseToken.decimals).toString(10)

                    o.nonce = String(nonce)
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
                    let p = () => {
                        return new Promise((rl, rj) => {
                            request(options, (error, response, body) => {
                                if (error) {
                                    return rj(error)
                                }
                                if (response.statusCode !== 200 && response.statusCode !== 201) {
                                    return rj(body)
                                }

                                return rl(o)

                            })
                        })
                    }
                    ret.push(await p())
                    nonce = parseInt(nonce) + 1
                }
                return resolve(ret)

            } catch(e) {
                return reject(e)
            }
        })
    }
    createOrder(order) {
        return new Promise(async (resolve, reject) => {
            try {
                let relayer = await this.getRelayerInfo()
                let url = urljoin(this.relayerUri, '/api/orders')
                let nonce = order.nonce || await this.getOrderNonce()
                let o = {
                    userAddress: this.coinbase,
                    exchangeAddress: order.exchangeAddress || relayer.exchangeAddress,
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

                if (o.type !== 'MO') {
                    o.pricepoint = new BigNumber(order.price)
                        .multipliedBy(10 ** quoteToken.decimals).toString(10)
                }
                o.amount = new BigNumber(order.amount)
                    .multipliedBy(10 ** baseToken.decimals).toString(10)

                o.nonce = String(nonce)
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
                oc.nonce = String(nonce || await this.getOrderNonce())
                let { exchangeAddress, userAddress, orderID } = await this.getOrderByHash(orderHash)
                if (!orderID) {
                    return reject(Error('Order is still in pool, not ready to cancel'))
                }
                oc.userAddress = ethers.utils.getAddress(userAddress)
                oc.exchangeAddress = ethers.utils.getAddress(exchangeAddress)
                oc.orderID = orderID
                oc.status = 'CANCELLED'
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
    getOrderByHash(hash) {
        return new Promise((resolve, reject) => {

            let url = urljoin(this.relayerUri, '/api/orders', hash)
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
                    let order = (body || {}).data
                    return resolve(order)
                } catch (e) {
                    return reject(Error('Can not get order, check relayer uri again'))
                }
            })
        })
    }
    getAccount(address = false, tokenAddress = false) {
        return new Promise((resolve, reject) => {
            address = address ? address : this.coinbase

            let url = urljoin(this.relayerUri, '/api/account', address)
            if (tokenAddress) {
                url = urljoin(this.relayerUri, '/api/account', address, tokenAddress)
            }
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
                    let data = (body || {}).data

                    let ret = {}
                    ret = (data || {}).tokenBalances || data
                    return resolve(ret)
                } catch (e) {
                    return reject(Error('Can not get pairs, check relayer uri again'))
                }
            })
        })
    }
    getOrders(params) {
        return new Promise((resolve, reject) => {
            let url = urljoin(this.relayerUri, '/api/orders')

            let qs = {
                    address: this.coinbase
                }

            if (params.quoteToken && params.baseToken) {
                qs.baseToken = params.baseToken
                qs.quoteToken = params.quoteToken
            }

            let options = {
                method: 'GET',
                url: url,
                qs: qs,
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
                    let data = (body || {}).data

                    return resolve(data)
                } catch (e) {
                    return reject(Error('Can not get orders, check relayer uri again'))
                }
            })
        })
    }
    getOrderBook(params) {
        return new Promise((resolve, reject) => {
            let url = urljoin(this.relayerUri, '/api/orderbook')

            let qs = { }

            qs.baseToken = params.baseToken
            qs.quoteToken = params.quoteToken

            let options = {
                method: 'GET',
                url: url,
                qs: qs,
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
                    let data = (body || {}).data

                    return resolve(data)
                } catch (e) {
                    return reject(Error('Can not get orders, check relayer uri again'))
                }
            })
        })
    }
    getOHLCV(params) {
        return new Promise((resolve, reject) => {
            let url = urljoin(this.relayerUri, '/api/ohlcv')

            let qs = { }

            qs.baseToken = params.baseToken
            qs.quoteToken = params.quoteToken
            qs.timeInterval = params.timeInterval

            let options = {
                method: 'GET',
                url: url,
                qs: qs,
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
                    let data = (body || {}).data

                    return resolve(data)
                } catch (e) {
                    return reject(Error('Can not get orders, check relayer uri again'))
                }
            })
        })
    }
}

module.exports = TomoXJS
