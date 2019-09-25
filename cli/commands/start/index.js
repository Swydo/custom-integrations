/* istanbul ignore file */

const { handleGlobalOptions } = require('../../handleGlobalOptions');
const { startServer } = require('./lambdaServer');
const { openLocalTunnel } = require('./localTunnel');

const command = 'start';
const desc = 'Start a local server';

const builder = yargs => (
    yargs
        .option('port', { alias: 'p', default: 3000 })
        .option('tunnel', { type: 'boolean', default: false })
);

const handler = async ({ port, tunnel, ...globalOptions }) => {
    handleGlobalOptions(globalOptions);

    startServer(port);

    if (tunnel) {
        await openLocalTunnel(port);
    }
};

module.exports = {
    command,
    desc,
    builder,
    handler,
};
