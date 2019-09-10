#!/usr/bin/env node

const yargs = require('yargs');
const initCommand = require('./commands/init');
const startCommand = require('./commands/start');
const validateCommand = require('./commands/validate');

// eslint-disable-next-line no-unused-expressions
yargs
    .option('silent', {
        alias: 's',
        type: 'boolean',
        default: false,
    })
    .command(initCommand)
    .command(startCommand)
    .command(validateCommand)
    .argv;
