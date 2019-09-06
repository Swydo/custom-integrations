const debug = require('debug')('custom-integrations:cli:start');
const ngrok = require('ngrok');

async function startLocalTunnel(port) {
    const url = await ngrok.connect(port);

    debug(url);
}

module.exports = {
    startLocalTunnel,
};
