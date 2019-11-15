'use strict'

const commander = require('commander')
const createOrder = require('./commands/createOrder')

commander
    .version('1.0.0')
    .description('TomoX Market Console')

commander
    .command('createOrder <pair>')
    .action(async (pair) => {
        await bot.run(pair)
    })

commander.parse(process.argv)
