const { handleGlobalOptions } = require('../../handleGlobalOptions');
const { startServer } = require('./startServer');

const command = 'start';
const desc = 'Start a local server';

const builder = yargs => (
    yargs
        .option('port', { alias: 'p', default: 3000 })
);

const handler = async ({ port, ...globalOptions }) => {
    handleGlobalOptions(globalOptions);

    startServer(port);
};

module.exports = {
    command,
    desc,
    builder,
    handler,
};
