const winston = require('winston');
const loggerConsoleTransport = require('./lib/loggerConsoleTransport');

const DEFAULT_LEVEL = winston.config.npm.levels.info;

const MAX_LEVEL = winston.config.npm.levels.silly;

function handleGlobalOptions({ silent, verbose }) {
    loggerConsoleTransport.silent = silent;

    const levelValue = Math.min(verbose + DEFAULT_LEVEL, MAX_LEVEL);
    loggerConsoleTransport.level = Object
        .keys(winston.config.npm.levels)
        .find(key => winston.config.npm.levels[key] === levelValue);
}

module.exports = {
    handleGlobalOptions,
};
