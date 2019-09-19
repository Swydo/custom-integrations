const winston = require('winston');
const loggerConsoleTransport = require('./loggerConsoleTransport');

function logger(label) {
    if (winston.loggers.has(label)) {
        return winston.loggers.get(label);
    }

    return winston.loggers.add(label, {
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.splat(),
            winston.format.prettyPrint(),
            winston.format.cli(),
        ),
        transports: [
            loggerConsoleTransport,
        ],
    });
}

module.exports = logger;
