#!/usr/bin/env node

/* istanbul ignore file */

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
    .option('verbose', {
        alias: 'v',
        type: 'count',
        default: false,
    })
    .option('version-check', {
        type: 'boolean',
        default: true,
    })
    .command(initCommand)
    .command(startCommand)
    .command(validateCommand)
    .argv;
