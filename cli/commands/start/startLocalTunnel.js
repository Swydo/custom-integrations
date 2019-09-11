const debug = require('debug')('custom-integrations:cli:start');
const localtunnel = require('localtunnel');

async function startLocalTunnel(port) {
    const tunnel = await new Promise((resolve, reject) => {
        localtunnel(port, (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });

    tunnel.on('close', () => {
        debug('Tunnel closed unexpectedly');
    });

    debug(tunnel.url);
}

module.exports = {
    startLocalTunnel,
};
