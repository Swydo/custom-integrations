#!/usr/bin/env node

const yargs = require('yargs');
const startCommand = require('./commands/start');

// eslint-disable-next-line no-unused-expressions
yargs
    .option('silent', {
        alias: 's',
        type: 'boolean',
        default: false,
    })
    .command(startCommand)
    .argv;
