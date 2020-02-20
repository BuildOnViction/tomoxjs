
const ethers = require('ethers')
const request = require('request')
const urljoin = require('url-join');
const BigNumber = require('bignumber.js')
const WebSocket = require('ws')

class TomoXJS {
    constructor (
        relayerUri = 'https://dex.tomochain.com',
        relayerWsUri = 'wss://dex.tomochain.com',
        pkey = '0xb377a94c7f88c55e4bc83560659ca4cbf6bd17e2d6ab2d32663d9d09ec9766f7' // sample
    ) {
        this.relayerUri = relayerUri
        this.relayerWsUri = relayerWsUri
        this.wallet = new ethers.Wallet(pkey)
        this.coinbase = this.wallet.address
    }
    watchPriceBoard({ baseToken, quoteToken }) {
        return new Promise((resolve, reject) => {
            let url = urljoin(this.relayerWsUri)
            const ws = new WebSocket(url)
            ws.on('close', () => { 
                resolve()
            })
            ws.on('open', function connection() {
                ws.send(JSON.stringify({
                    channel: 'price_board',
                    event: {
                        type: 'SUBSCRIBE',
                        payload: {
                            baseToken: baseToken,
                            quoteToken: quoteToken
                        }
                    }
                }))
                resolve(ws)
            })
        })
    }
    watchTrades({ baseToken, quoteToken }) {
        return new Promise((resolve, reject) => {
            let url = urljoin(this.relayerWsUri, 'socket')
            const ws = new WebSocket(url)
            ws.on('close', () => { 
                resolve()
            })
            ws.on('open', function connection() {
                ws.send(JSON.stringify({
                    channel: 'orderbook',
                    event: {
                        type: 'SUBSCRIBE',
                        payload: {
                            baseToken: baseToken,
                            quoteToken: quoteToken
                        }
                    }
                }))
                resolve(ws)
            })
        })
    }
    watchOrderBook({ baseToken, quoteToken }) {
        return new Promise((resolve, reject) => {
            let url = urljoin(this.relayerWsUri, 'socket')
            const ws = new WebSocket(url)
            ws.on('close', () => { 
                resolve()
            })
            ws.on('open', function connection() {
                ws.send(JSON.stringify({
                    channel: 'orderbook',
                    event: {
                        type: 'SUBSCRIBE',
                        payload: {
                            baseToken: baseToken,
                            quoteToken: quoteToken
                        }
                    }
                }))
                resolve(ws)
            })
        })
    }
    watchMarkets() {
        return new Promise((resolve, reject) => {
            let url = urljoin(this.relayerWsUri, 'socket')
            const ws = new WebSocket(url)
            ws.on('close', () => { 
                resolve()
            })
            ws.on('open', function connection() {
                ws.send(JSON.stringify({
                    channel: 'markets',
                    event: {
                        type: 'SUBSCRIBE'
                    }
                }))
                resolve(ws)
            })
        })
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

    getLendingHash(order) {
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
                    'string',
                    'uint256',
                ],
                [
                    order.relayerAddress,
                    order.userAddress,
                    order.collateralToken,
                    order.lendingToken,
                    order.quantity,
                    order.term,
                    order.side,
                    order.status,
                    order.type,
                    order.nonce
                ],
            )
        }
        console.log(order.exchangeAddress,  order.userAddress, order.collateralToken, order.lendingToken, order.quantity, order.term, order.interest, order.side,order.status, order.type, order.nonce)
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
                'string',
                'uint256',
            ],
            [
                order.relayerAddress,
                order.userAddress,
                order.collateralToken,
                order.lendingToken,
                order.quantity,
                order.term,
                order.interest,
                order.side,
                order.status,
                order.type,
                order.nonce
            ],
        )
    }

    getOrderCancelHash(oc) {
        return ethers
            .utils.solidityKeccak256(
                ['bytes', 'uint256', 'bytes', 'uint256', 'string', 'bytes', 'bytes', 'bytes'],
                [oc.orderHash, oc.nonce, oc.userAddress, oc.orderID, oc.status, oc.exchangeAddress, oc.baseToken, oc.quoteToken]
            )
    }
    getLendingCancelHash(oc) {
        console.log(oc.lendingHash, oc.nonce, oc.userAddress, oc.lendingID, oc.term, oc.interest,oc.status, oc.relayerAddress, oc.collateralToken, oc.lendingToken)
        return ethers
            .utils.solidityKeccak256(
                ['bytes', 'uint256', 'bytes', 'uint256', 'uint256', 'uint256', 'string', 'bytes', 'bytes', 'bytes'],
                [oc.lendingHash, oc.nonce, oc.userAddress, oc.lendingID, oc.term, oc.interest, oc.status, oc.relayerAddress, oc.collateralToken, oc.lendingToken]
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
                let { quoteToken, baseToken, exchangeAddress, userAddress, orderID } = await this.getOrderByHash(orderHash)
                if (!orderID) {
                    return reject(Error('Order is still in pool, not ready to cancel'))
                }
                oc.userAddress = ethers.utils.getAddress(userAddress)
                oc.exchangeAddress = ethers.utils.getAddress(exchangeAddress)
                oc.orderID = orderID
                oc.quoteToken = ethers.utils.getAddress(quoteToken)
                oc.baseToken = ethers.utils.getAddress(baseToken)
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
    cancelManyOrders(orderHashes, nonce = 0) {
        return new Promise(async (resolve, reject) => {

            try {
                let ret = []
                nonce = String(nonce || await this.getOrderNonce())
                for (let orderHash of orderHashes) {
                    const oc = {}
                    oc.orderHash = orderHash
                    oc.nonce = String(nonce)
                    let { baseToken, quoteToken, exchangeAddress, userAddress, orderID } = await this.getOrderByHash(orderHash)
                    if (!orderID) {
                        return reject(Error('Order is still in pool, not ready to cancel'))
                    }
                    oc.userAddress = ethers.utils.getAddress(userAddress)
                    oc.exchangeAddress = ethers.utils.getAddress(exchangeAddress)
                    oc.orderID = orderID
                    oc.status = 'CANCELLED'
                    oc.quoteToken = ethers.utils.getAddress(quoteToken)
                    oc.baseToken = ethers.utils.getAddress(baseToken)
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

                    let p = () => {
                        return new Promise((rl, rj) => {
                            request(options, (error, response, body) => {
                                if (error) {
                                    return rj(error)
                                }
                                if (response.statusCode !== 200 && response.statusCode !== 201) {
                                    return rj(body)
                                }

                                return rl(oc)

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

            if (params.status) {
                qs.orderStatus = params.status
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

    getLendingNonce() {
        return new Promise((resolve, reject) => {
            let url = urljoin(this.relayerUri, '/api/lending/nonce')
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

    getLendingByHash(hash) {
        return new Promise((resolve, reject) => {
            let url = urljoin(this.relayerUri, '/api/lending', hash)
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

    createLending(order) {
        return new Promise(async (resolve, reject) => {
            try {
                let relayer = await this.getRelayerInfo()
                let url = urljoin(this.relayerUri, '/api/lending')
                let nonce = order.nonce || await this.getLendingNonce()
                let interest = new BigNumber(order.interest)
                    .multipliedBy(10 ** 8).toString(10)
                let o = {
                    userAddress: this.coinbase,
                    relayerAddress: order.relayerAddress || relayer.relayerAddress,
                    collateralToken: order.collateralToken,
                    lendingToken: order.lendingToken,
                    term: order.term,
                    interest: interest,
                    side: order.side || 'BUY',
                    type: order.type || 'LO',
                    status: 'NEW'
                }

                let collateralToken = await this.getTokenInfo(order.collateralToken)
                let lendingToken = await this.getTokenInfo(order.lendingToken)

                if (!collateralToken || !lendingToken) {
                    return reject(Error('Can not get token info'))
                }

                o.quantity = new BigNumber(order.quantity)
                    .multipliedBy(10 ** collateralToken.decimals).toString(10)

                o.nonce = String(nonce)
                o.hash = this.getLendingHash(o)
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
    cancelLending(lendingHash, nonce = 0) {
        return new Promise(async (resolve, reject) => {

            try {
                const oc = {}
                oc.lendingHash = lendingHash
                oc.nonce = String(nonce || await this.getLendingNonce())
                let { lendingToken, collateralToken, relayerAddress, userAddress, lendingID, term, interest } = await this.getLendingByHash(lendingHash)
                
                if (!lendingID) {
                    return reject(Error('Lending is still in pool, not ready to cancel'))
                }
                oc.userAddress = ethers.utils.getAddress(userAddress)
                oc.relayerAddress = ethers.utils.getAddress(relayerAddress)
                oc.lendingID = lendingID
                oc.collateralToken = ethers.utils.getAddress(collateralToken)
                oc.lendingToken = ethers.utils.getAddress(lendingToken)
                oc.status = 'CANCELLED'
                oc.term = term
                oc.interest = interest
                oc.hash = this.getLendingCancelHash(oc)
                

                const signature = await this.wallet.signMessage(ethers.utils.arrayify(oc.hash))
                const { r, s, v } = ethers.utils.splitSignature(signature)

                oc.signature = { R: r, S: s, V: v }

                let url = urljoin(this.relayerUri, '/api/lending/cancel')
                let options = {
                    method: 'POST',
                    url: url,
                    json: true,
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: oc
                }
                console.log(oc)
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
    createWsLending(order) {
        const _self = this;
        return new Promise(async(resolve, reject) => {

            _self._getOrder(order).then((order) => {
                let url = urljoin(_self.relayerWsUri, 'socket')
                const ws = new WebSocket(url)
                ws.on('close', () => { 
                    resolve()
                })
                ws.on('open', function connection() {
                    ws.send(JSON.stringify({
                        channel: 'lending_order',
                        event: {
                            type: 'NEW_LENDING_ORDER',
                            payload: order
                        }
                    }))
                    resolve(ws)
                })
            }).catch(ex => {
                reject(ex)
            })
        })
    }

    async _getOrder(order) {
        
        
        let nonce = order.nonce || await this.getLendingNonce()
        let o = {
            userAddress: this.coinbase,
            relayerAddress: order.relayerAddress || relayer.relayerAddress,
            collateralToken: order.collateralToken,
            lendingToken: order.lendingToken,
            term: order.term,
            interest: order.interest,
            side: order.side || 'BUY',
            type: order.type || 'LO',
            status: 'NEW'
        }

        let collateralToken = await this.getTokenInfo(order.collateralToken)
        let lendingToken = await this.getTokenInfo(order.lendingToken)

        if (!collateralToken || !lendingToken) {
            return reject(Error('Can not get token info'))
        }

        o.quantity = new BigNumber(order.quantity)
            .multipliedBy(10 ** collateralToken.decimals).toString(10)

        o.nonce = String(nonce)
        o.hash = this.getLendingHash(o)
        let signature = await this.wallet.signMessage(ethers.utils.arrayify(o.hash))
        let { r, s, v } = ethers.utils.splitSignature(signature)

        o.signature = { R: r, S: s, V: v }
        return o
    }

    watchLendingOrderBook({ term, lendingToken }) {
        return new Promise((resolve, reject) => {
            let url = urljoin(this.relayerWsUri, 'socket')
            const ws = new WebSocket(url)
            ws.on('close', () => { 
                resolve()
            })
            ws.on('open', function connection() {
                ws.send(JSON.stringify({
                    channel: 'lending_orderbook',
                    event: {
                        type: 'SUBSCRIBE',
                        payload: {
                            term: term,
                            lendingToken: lendingToken
                        }
                    }
                }))
                resolve(ws)
            })
        })
    }
    watchLendingTrade({ term, lendingToken }) {
        return new Promise((resolve, reject) => {
            let url = urljoin(this.relayerWsUri, 'socket')
            const ws = new WebSocket(url)
            ws.on('close', () => { 
                resolve()
            })
            ws.on('open', function connection() {
                ws.send(JSON.stringify({
                    channel: 'lending_trades',
                    event: {
                        type: 'SUBSCRIBE',
                        payload: {
                            term: term,
                            lendingToken: lendingToken
                        }
                    }
                }))
                resolve(ws)
            })
        })
    }

}

module.exports = TomoXJS
