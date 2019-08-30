const debug = require('debug')('custom-integrations:start');
const ngrok = require('ngrok');

async function startLocalTunnel(port) {
    const url = await ngrok.connect(port);

    debug(url);
}

module.exports = {
    startLocalTunnel,
};
