
const ethers = require('ethers')
const request = require('request')
const urljoin = require('url-join');
const BigNumber = require('bignumber.js')
const WebSocket = require('ws')

class TomoXJS {
    constructor (
        relayerUri = 'https://dex.tomochain.com',
        relayerWsUri = 'wss://dex.tomochain.com/socket',
        pkey = '' // sample
    ) {
        this.relayerUri = relayerUri
        this.relayerWsUri = relayerWsUri
        if (!pkey) {
            let randomWallet = ethers.Wallet.createRandom()
            pkey = randomWallet.privateKey
        }
        this.wallet = new ethers.Wallet(pkey)
        this.coinbase = this.wallet.address
    }
    watchNotification({ userAddress }) {
        return new Promise((resolve, reject) => {
            let url = urljoin(this.relayerWsUri)
            const ws = new WebSocket(url)
            ws.on('close', () => { 
                resolve()
            })
            ws.on('open', function connection() {
                ws.send(JSON.stringify({
                    channel: 'notification',
                    event: {
                        type: 'SUBSCRIBE',
                        payload: userAddress
                    }
                }))
                resolve(ws)
            })
        })
    }
    watchOrders({ userAddress }) {
        return new Promise((resolve, reject) => {
            let url = urljoin(this.relayerWsUri)
            const ws = new WebSocket(url)
            ws.on('close', () => { 
                resolve()
            })
            ws.on('open', function connection() {
                ws.send(JSON.stringify({
                    channel: 'orders',
                    event: {
                        type: 'SUBSCRIBE',
                        payload: userAddress
                    }
                }))
                resolve(ws)
            })
        })
    }
    watchLendingOrders({ userAddress }) {
        return new Promise((resolve, reject) => {
            let url = urljoin(this.relayerWsUri)
            const ws = new WebSocket(url)
            ws.on('close', () => { 
                resolve()
            })
            ws.on('open', function connection() {
                ws.send(JSON.stringify({
                    channel: 'lending_orders',
                    event: {
                        type: 'SUBSCRIBE',
                        payload: userAddress
                    }
                }))
                resolve(ws)
            })
        })
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
            let url = urljoin(this.relayerWsUri)
            const ws = new WebSocket(url)
            ws.on('close', () => { 
                resolve()
            })
            ws.on('open', function connection() {
                ws.send(JSON.stringify({
                    channel: 'trades',
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
            let url = urljoin(this.relayerWsUri)
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
    watchOHLCV({ baseToken, quoteToken, units, duration }) {
        return new Promise((resolve, reject) => {
            let url = urljoin(this.relayerWsUri)
            const ws = new WebSocket(url)
            ws.on('close', () => { 
                resolve()
            })
            ws.on('error', (e) => { 
                console.log("aaaa", e)
                resolve()
            })
            ws.on('open', function connection() {
                ws.send(JSON.stringify({
                    channel: 'ohlcv',
                    event: {
                        type: 'SUBSCRIBE',
                        payload: {
                            baseToken: baseToken,
                            quoteToken: quoteToken,
                            units: units,
                            duration: duration
                        }
                    }
                }))
                resolve(ws)
            })
        })
    }
    watchMarkets() {
        return new Promise((resolve, reject) => {
            let url = urljoin(this.relayerWsUri)
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
    getTokens() {
        return new Promise((resolve, reject) => {

            let url = urljoin(this.relayerUri, '/api/tokens')
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
    getMarkets() {
        return new Promise((resolve, reject) => {
            let url = urljoin(this.relayerUri, '/api/market/stats/all')
            var options = {
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
                    let data = ((body || {}).data || {})
                    return resolve(data)
                } catch (e) {
                    return reject(Error('Can not get nonce, check relayer uri again'))
                }

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

    getOrderCancelHash(oc) {
        return ethers
            .utils.solidityKeccak256(
                ['bytes', 'uint256', 'bytes', 'uint256', 'string', 'bytes', 'bytes', 'bytes'],
                [oc.orderHash, oc.nonce, oc.userAddress, oc.orderID, oc.status, oc.exchangeAddress, oc.baseToken, oc.quoteToken]
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
                            .multipliedBy(10 ** quoteToken.decimals).toFixed(0).toString(10)
                    }
                    o.amount = new BigNumber(order.amount)
                        .multipliedBy(10 ** baseToken.decimals).toFixed(0).toString(10)

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
                        .multipliedBy(10 ** quoteToken.decimals).toFixed(0).toString(10)
                }
                o.amount = new BigNumber(order.amount)
                    .multipliedBy(10 ** baseToken.decimals).toFixed(0).toString(10)

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

                    let order = await this.getOrderByHash(orderHash)
                    if (!order) {
                        continue
                    }

                    let { baseToken, quoteToken, exchangeAddress, userAddress, orderID } = order
                    if (!orderID) {
                        continue
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
                    let order = (body || {}).data || {}
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
    getOrders({ status, baseToken, quoteToken, page, limit }) {
        return new Promise((resolve, reject) => {
            let url = urljoin(this.relayerUri, '/api/orders')

            let qs = {
                address: this.coinbase
            }

            qs.pageSize = limit || 50
            qs.pageOffset = parseInt(page) - 1 || 0

            if (quoteToken && baseToken) {
                qs.baseToken = baseToken
                qs.quoteToken = quoteToken
            }

            if (status) {
                qs.orderStatus = status
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
    // lending function
    getCreatedLendingHash(order) {
        if (order.type === 'MO') {
            if (order.side === 'BORROW') {
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
                        'uint256'
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
                        order.nonce,
                        order.autoTopUp
                    ],
                )
            }
            return ethers.utils.solidityKeccak256(
                [
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
        if (order.side === 'BORROW') {
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
                    'uint256'
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
                    order.nonce,
                    order.autoTopUp
                ],
            )
        }
        return ethers.utils.solidityKeccak256(
            [
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
    getLendingCancelHash(order) {
        return ethers.utils.solidityKeccak256(
            [
                'uint256',
                'string',
                'bytes',
                'bytes',
                'bytes',
                'uint256',
                'uint256',
            ],
            [
                order.nonce,
                order.status,
                order.relayerAddress,
                order.userAddress,
                order.lendingToken,
                order.term,
                order.lendingId,
            ],
        )
    }
    getRepayLendingHash(order) {
        return ethers.utils.solidityKeccak256(
            [
                'uint256',
                'string',
                'bytes',
                'bytes',
                'bytes',
                'uint256',
                'uint256',
                'string'
            ],
            [
                order.nonce,
                order.status,
                order.relayerAddress,
                order.userAddress,
                order.lendingToken,
                order.term,
                order.tradeId,
                order.type
            ],
        )
    }

    getTopupLendingHash(order) {
        return ethers.utils.solidityKeccak256(
            [
                'uint256',
                'string',
                'bytes',
                'bytes',
                'bytes',
                'uint256',
                'uint256',
                'uint256',
                'string'
            ],
            [
                order.nonce,
                order.status,
                order.relayerAddress,
                order.userAddress,
                order.lendingToken,
                order.term,
                order.tradeId,
                order.quantity,
                order.type
            ],
        )
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
                    relayerAddress: order.relayerAddress || relayer.exchangeAddress,
                    lendingToken: order.lendingToken,
                    term: order.term,
                    interest: interest,
                    side: order.side || 'BORROW',
                    type: order.type || 'LO',
                    status: 'NEW',
                    autoTopUp: order.autoTopUp || '1'
                }
                
                o.collateralToken = order.collateralToken

                let collateralToken = (o.side == 'BORROW') ? await this.getTokenInfo(order.collateralToken) : true
                let lendingToken = await this.getTokenInfo(order.lendingToken)

                if (!collateralToken || !lendingToken) {
                    return reject(Error('Can not get token info'))
                }

                o.quantity = new BigNumber(order.quantity)
                    .multipliedBy(10 ** lendingToken.decimals).toString(10)

                o.nonce = String(nonce)
                o.hash = this.getCreatedLendingHash(o)
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
    cancelLending({ hash, nonce }) {
        return new Promise(async (resolve, reject) => {
            try {
                let relayer = await this.getRelayerInfo()
                let url = urljoin(this.relayerUri, '/api/lending/cancel')
                nonce = nonce || await this.getLendingNonce()
                let order = await this.getLendingByHash(hash)
                let o = {
                    userAddress: this.coinbase,
                    relayerAddress: order.relayerAddress || relayer.exchangeAddress,
                    lendingToken: order.lendingToken,
                    term: order.term,
                    lendingId: order.lendingId,
                    status: 'CANCELLED'
                }
                o.nonce = String(nonce)
                o.hash = hash
                let signature = await this.wallet.signMessage(ethers.utils.arrayify(this.getLendingCancelHash(o)))
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
    repayLending(order) {
        return new Promise(async (resolve, reject) => {
            try {
                let relayer = await this.getRelayerInfo()
                let url = urljoin(this.relayerUri, '/api/lending/repay')
                let nonce = order.nonce || await this.getLendingNonce()
                let o = {
                    userAddress: this.coinbase,
                    relayerAddress: order.relayerAddress || relayer.exchangeAddress,
                    lendingToken: order.lendingToken,
                    term: order.term,
                    tradeId: order.tradeId,
                    type: 'REPAY',
                    status: 'NEW'
                }

                o.nonce = String(nonce)
                o.hash = this.getRepayLendingHash(o)
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
    topupLending(order) {
        return new Promise(async (resolve, reject) => {
            try {
                let relayer = await this.getRelayerInfo()
                let url = urljoin(this.relayerUri, '/api/lending/topup')
                let nonce = order.nonce || await this.getLendingNonce()
                let o = {
                    userAddress: this.coinbase,
                    relayerAddress: order.relayerAddress || relayer.exchangeAddress,
                    lendingToken: order.lendingToken,
                    term: order.term,
                    quantity: order.quantity,
                    tradeId: order.tradeId,
                    status: 'NEW',
                    type: 'TOPUP'
                }
                let collateralToken = await this.getTokenInfo(order.collateralToken)

                if (!collateralToken) {
                    return reject(Error('Can not get token info'))
                }

                o.quantity = new BigNumber(order.quantity)
                    .multipliedBy(10 ** collateralToken.decimals).toString(10)
                o.nonce = String(nonce)
                o.hash = this.getTopupLendingHash(o)
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
    createWsLending(order) {
        const _self = this;
        return new Promise(async(resolve, reject) => {

            _self._getLendingOrder(order).then((order) => {
                let url = urljoin(_self.relayerWsUri)
                const ws = new WebSocket(url)
                ws.on('close', () => { 
                    resolve()
                })
                ws.on('open', function connection() {
                    ws.send(JSON.stringify({
                        channel: 'lending_orders',
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

    async _getLendingOrder(order) {
        
        let relayer = await this.getRelayerInfo()
        let nonce = order.nonce || await this.getLendingNonce()
        let interest = new BigNumber(order.interest)
            .multipliedBy(10 ** 8).toString(10)
        let o = {
            userAddress: this.coinbase,
            relayerAddress: order.relayerAddress || relayer.exchangeAddress,
            collateralToken: order.collateralToken,
            lendingToken: order.lendingToken,
            term: order.term,
            interest: interest,
            side: order.side || 'BORROW',
            type: order.type || 'LO',
            status: 'NEW',
            autoTopUp: order.autoTopUp || '1'
        }

        let collateralToken = await this.getTokenInfo(order.collateralToken)
        let lendingToken = await this.getTokenInfo(order.lendingToken)

        if (!collateralToken || !lendingToken) {
            throw Error('Can not get token info')
        }

        o.quantity = new BigNumber(order.quantity)
            .multipliedBy(10 ** lendingToken.decimals).toString(10)

        o.nonce = String(nonce)
        o.hash = this.getCreatedLendingHash(o)
        let signature = await this.wallet.signMessage(ethers.utils.arrayify(o.hash))
        let { r, s, v } = ethers.utils.splitSignature(signature)

        o.signature = { R: r, S: s, V: v }
        return o
    }

    getLendingOrderBook(params) {
        return new Promise((resolve, reject) => {
            let url = urljoin(this.relayerUri, '/api/lending/orderbook')

            let qs = { }

            qs.lendingToken = params.lendingToken
            qs.term = params.term

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

    watchLendingOrderBook({ term, lendingToken }) {
        return new Promise((resolve, reject) => {
            let url = urljoin(this.relayerWsUri)
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
            let url = urljoin(this.relayerWsUri)
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

    watchLendingOhlcv({ term, lendingToken, units, duration }) {
        return new Promise((resolve, reject) => {
            let url = urljoin(this.relayerWsUri)
            const ws = new WebSocket(url)
            ws.on('close', () => { 
                resolve()
            })
            ws.on('open', function connection() {
                ws.send(JSON.stringify({
                    channel: 'lending_ohlcv',
                    event: {
                        type: 'SUBSCRIBE',
                        payload: {
                            term: term,
                            lendingToken: lendingToken,
                            units: units,
                            duration: duration
                        }
                    }
                }))
                resolve(ws)
            })
        })
    }
    getLendingPairs() {
        return new Promise((resolve, reject) => {

            let url = urljoin(this.relayerUri, '/api/lending/pairs')
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
                    return reject(Error('Can not get lending pairs, check relayer uri again'))
                }
            })
        })
    }
    getLendingMarkets() {
        return new Promise((resolve, reject) => {

            let url = urljoin(this.relayerUri, '/api/lending/market/stats/all')
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
                    return reject(Error('Can not get lending pairs, check relayer uri again'))
                }
            })
        })
    }
    getLendingMarket(params) {
        return new Promise((resolve, reject) => {
            let url = urljoin(this.relayerUri, '/api/lending/market/stats')
            let data = {
                term: params.term,
                lendingToken: params.lendingToken
            }

            let options = {
                method: 'GET',
                url: url,
                json: true,
                qs: data,
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
    watchLendingMarkets() {
        return new Promise((resolve, reject) => {
            let url = urljoin(this.relayerWsUri)
            const ws = new WebSocket(url)
            ws.on('close', () => { 
                resolve()
            })
            ws.on('open', function connection() {
                ws.send(JSON.stringify({
                    channel: 'lending_markets',
                    event: {
                        type: 'SUBSCRIBE'
                    }
                }))
                resolve(ws)
            })
        })
    }

    getCollateralTokens() {
        return new Promise((resolve, reject) => {

            let url = urljoin(this.relayerUri, '/api/lending/collateraltoken')
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
                    return reject(Error('Can not get collateral token, check relayer uri again'))
                }
            })
        })
    }
    getLendingTokens() {
        return new Promise((resolve, reject) => {

            let url = urljoin(this.relayerUri, '/api/lending/lendingtoken')
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
                    return reject(Error('Can not get lending token, check relayer uri again'))
                }
            })
        })
    }
    getLendingTradesHistory(params) {
        return new Promise((resolve, reject) => {
            let url = urljoin(this.relayerUri, '/api/lending/trades/history')
            let qs = {
                term: params.term,
                lendingToken: params.lendingToken,
                address: params.address || this.coinbase
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
                    let pairs = (body || {}).data
                    return resolve(pairs)
                } catch (e) {
                    return reject(Error('Can not get lending token, check relayer uri again'))
                }
            })
        })
    }
    getLendingTerms() {
        return new Promise((resolve, reject) => {

            let url = urljoin(this.relayerUri, '/api/lending/terms')
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
                    return reject(Error('Can not get term, check relayer uri again'))
                }
            })
        })
    }
    getLendingOrders(params) {
        return new Promise((resolve, reject) => {
            let url = urljoin(this.relayerUri, '/api/lending/orders')
            let qs = {
                term: params.term,
                lendingToken: params.lendingToken,
                address: params.address || this.coinbase,
                lendingStatus: params.lendingStatus,
                from: params.from,
                to: params.to,
                pageOffset: params.pageOffset,
                pageSize: params.pageSize
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
                    let pairs = (body || {}).data
                    return resolve(pairs)
                } catch (e) {
                    return reject(Error('Can not get orders, check relayer uri again'))
                }
            })
        })
    }
    getLendingTrades(params) {
        return new Promise((resolve, reject) => {
            let url = urljoin(this.relayerUri, '/api/lending/trades')
            let qs = {
                term: params.term,
                lendingToken: params.lendingToken,
                address: params.address || this.coinbase,
                status: params.status,
                from: params.from,
                to: params.to,
                pageOffset: params.pageOffset,
                pageSize: params.pageSize
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
                    let pairs = (body || {}).data
                    return resolve(pairs)
                } catch (e) {
                    return reject(Error('Can not trade, check relayer uri again'))
                }
            })
        })
    }
    watchLendingPriceBoard({ term, lendingToken }) {
        return new Promise((resolve, reject) => {
            let url = urljoin(this.relayerWsUri)
            const ws = new WebSocket(url)
            ws.on('close', () => { 
                resolve()
            })
            ws.on('open', function connection() {
                ws.send(JSON.stringify({
                    channel: 'lending_price_board',
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
    getLendingTopups(params) {
        return new Promise((resolve, reject) => {
            let url = urljoin(this.relayerUri, '/api/lending/topup')
            let qs = {
                term: params.term,
                lendingToken: params.lendingToken,
                collateralToken: params.collateralToken,
                address: params.address,
                from: params.from,
                to: params.to,
                pageOffset: params.pageOffset,
                pageSize: params.pageSize
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
                    let pairs = (body || {}).data
                    return resolve(pairs)
                } catch (e) {
                    return reject(Error('Can not get topup, check again'))
                }
            })
        })
    }

    getLendingRepays(params) {
        return new Promise((resolve, reject) => {
            let url = urljoin(this.relayerUri, '/api/lending/repay')
            let qs = {
                term: params.term,
                lendingToken: params.lendingToken,
                address: params.address,
                from: params.from,
                to: params.to,
                pageOffset: params.pageOffset,
                pageSize: params.pageSize
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
                    let pairs = (body || {}).data
                    return resolve(pairs)
                } catch (e) {
                    return reject(Error('Can not get topup, check again'))
                }
            })
        })
    }
    getLendingRecalls(params) {
        return new Promise((resolve, reject) => {
            let url = urljoin(this.relayerUri, '/api/lending/recall')
            let qs = {
                term: params.term,
                lendingToken: params.lendingToken,
                collateralToken: params.collateralToken,
                address: params.address,
                from: params.from,
                to: params.to,
                pageOffset: params.pageOffset,
                pageSize: params.pageSize
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
                    let pairs = (body || {}).data
                    return resolve(pairs)
                } catch (e) {
                    return reject(Error('Can not get recall, check again'))
                }
            })
        })
    }

    estimateCollateral(params) {
        return new Promise((resolve, reject) => {
            let url = urljoin(this.relayerUri, '/api/lending/estimate')
            let qs = {
                amount: params.amount,
                lendingToken: params.lendingToken,
                collateralToken: params.collateralToken,
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
                    let pairs = (body || {}).data
                    return resolve(pairs)
                } catch (e) {
                    return reject(Error('Can not estimate collateral amount, check again'))
                }
            })
        })
    }
    getLendingOhlcv(params) {
        return new Promise((resolve, reject) => {
            let url = urljoin(this.relayerUri, '/api/lending-ohlcv')
            let qs = {
                term: params.term,
                lendingToken: params.lendingToken,
                timeInterval: params.timeInterval,
                from: params.from,
                to: params.to,
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
                    let pairs = (body || {}).data
                    return resolve(pairs)
                } catch (e) {
                    return reject(Error('Can not get lending ohlcv, check again'))
                }
            })
        })
    }
}

module.exports = TomoXJS
