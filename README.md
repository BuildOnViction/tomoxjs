
## Install
It requires NodeJS 8+.

Easy to install the package with command:
```
npm install --save tomoxjs
```

Or you can use TomoXJS binary:
```
cd /tmp && wget https://github.com/tomochain/tomoxjs/releases/download/[VERSION]/tomoxjs.[VERSION].linux-x64 -O tomoxjs
chmod +x tomoxjs && sudo mv tomoxjs /usr/local/bin/
```

## APIs
You can refer to [TomoX API Document](https://apidocs.tomochain.com/#tomodex-apis) to know the APIs that will work with the SDK

## Use
You need to declare Relayer URL and your private key to unlock the wallet. You can create a private key at [https://wallet.tomochain.com](https://wallet.tomochain.com)
```javascript
const TomoX = require('tomoxjs')


const relayerUri = 'https://dex.tomochain.com'  // TomoChain Relayer URL
const relayerWsUri = 'wss://dex.tomochain.com'  // TomoChain Relayer URL
const pkey = '0x0' // your private key

const tomox = new TomoX(relayerUri, relayerWsUri, pkey)
```

## Wallet providers
TomoXJS suports wallet providers that have `signMessage` function, and you have to init `coinbase` for the SDK.

For example:
```
let web3 = new Web3()
// create signMessage function
let wallet = web3.eth.accounts
wallet.signMessage = web3.eth.accounts.sign
tomox.wallet = wallet
tomox.coinbase = web3.eth.defaultAccount
```

### Create order
Before creating an order, make sure you have enough balance for the trade and fee.

```javascript
tomox.createOrder({
    baseToken:'0xBD8b2Fb871F97b2d5F0A1af3bF73619b09174B2A', // Base Token Address e.g BTC
    quoteToken: '0x0000000000000000000000000000000000000001', // Quote Token Address e.g TOMO
    price: '21207.02',
    amount: '0.004693386710283129'
}).then(data => {
        console.log(data)
    }).catch(e => {
        console.log(e)
    })
```

### Create many orders
It is the same as creating order, just need to input array of orders you need to create.

```javascript
tomox.createManyOrders([{
    baseToken:'0xBD8b2Fb871F97b2d5F0A1af3bF73619b09174B2A', // Base Token Address e.g BTC
    quoteToken: '0x0000000000000000000000000000000000000001', // Quote Token Address e.g TOMO
    price: '21207.02',
    amount: '0.004693386710283129'
}]).then(data => {
        console.log(data)
    }).catch(e => {
        console.log(e)
    })
```

### Cancel order
After creating an order, you can cancel it with order hash
```javascript
const orderHash = '0x0' // hash of order you want to cancel
tomox.cancelOrder(orderHash)
    .then(data => {
        console.log(data)
    }).catch(e => {
        console.log(e)
    })
```

### Get account balances
Get the current account balances
```javascript
tomox.getAccount()
    .then(data => {
        console.log(data)
    }).catch(e => {
        console.log(e)
    })
```
Get the specify account balances
```javascript
tomox.getAccount(address)
    .then(data => {
        console.log(data)
    }).catch(e => {
        console.log(e)
    })
```

## Command Line
You need to init env or create `.env` file to setup `DEX_URI` and `TRADER_PKEY` before using the tool.

```
tomoxjs init
```
Or
```
cp .env.example .env
```

Help:
```bash
Usage: tomoxjs [options] [command]

TomoX Market CLI

Options:
  -V, --version                         output the version number
  -h, --help                            output usage information

Commands:
  init [options]                        setup/init enviroment
  config                                show environment information
  create [options]                      create a trading order
  cancel [options]                      cancel a trading order
  pairs                                 show trading pairs
  o-list|list [options]                 show user orders
  o-get|get [options]                   show order by hash
  orderbook [options]                   show trading orderbook
  ohlcv [options]                       show trading OHLCV data
  info                                  show DEX information
  ws-orderbook [options]                watch trading orderbook
  ws-ohlcv [options]                    watch trading OHLCV data
  ws-trades [options]                   watch trades
  ws-price-board|price-board [options]  watch price board
  ws-markets|markets                    watch trading market
  lending-hash|get [options]            show lending order by hash
  lending-nonce                         show lending user nonce
  lending-create [options]              create a lendig order
  lending-create-ws [options]           create a lendig order via websocket
  lending-repay [options]               repay a loan
  lending-topup [options]               topup a loan
  lending-cancel [options]              cancel a lending order
  lending-orderbook [options]           show lending orderbook
  ws-lending-orderbook [options]        watch lending orderbook
  ws-lending-trade [options]            watch lending trades
  ws-lending-ohlcv [options]            watch lending OHLCV data
  lending-pairs                         show lending pairs
  lending-markets                       show all lending markets
  lending-market [options]              show lending market by pairs
  ws-lending-markets|lending-markets    watch all lending markets
  lending-tokens                        show lending tokens
  collateral-tokens                     show lending collateral tokens
```

### Create Order CLI
```bash
$ ./tomoxjs create --help
Usage: tomoxjs create [options]

Options:
  -b, --baseToken <baseToken>    base token (default: "0xBD8b2Fb871F97b2d5F0A1af3bF73619b09174B2A")
  -q, --quoteToken <quoteToken>  quote token (default: "0x0000000000000000000000000000000000000001")
  -p, --price <price>            price (default: "21207")
  -a, --amount <amount>          amount (default: "00469")
  -s, --side <side>              side (default: "BUY")
  -t, --type <type>              type (default: "LO")
  -h, --help                     output usage information
```

### Cancel Order CLI
```bash
$ ./tomoxjs cancel --help
Usage: tomoxjs cancel [options]

Options:
  -s, --hash <hash>    hash
  -n, --nonce <nonce>  nonce (default: 0)
  -h, --help           output usage information
```

### Get User Order List CLI
```bash
$ ./tomoxjs orders -h
Usage: tomoxjs orders [options]

Options:
  -b, --baseToken <baseToken>    base token
  -q, --quoteToken <quoteToken>  quote token
  -h, --help                     output usage information

```

### Get Orderbook CLI
```bash
$ ./tomoxjs orderbook -h
Usage: tomoxjs orderbook [options]

Options:
  -b, --baseToken <baseToken>    base token
  -q, --quoteToken <quoteToken>  quote token
  -h, --help                     output usage information
```

### Get OHLCV CLI
```bash
$ ./tomoxjs ohlcv --help
Usage: tomoxjs ohlcv [options]

Options:
  -b, --baseToken <baseToken>        base token
  -q, --quoteToken <quoteToken>      quote token
  -i, --timeInternal <timeInterval>  time interval, candle size. Valid values: 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 1w, 1mo (1 month)
  -h, --help                         output usage information
```
