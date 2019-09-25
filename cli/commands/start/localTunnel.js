const debounce = require('debounce');
const localtunnel = require('localtunnel');
const logger = require('../../lib/logger')('cli:start');
const { generateLocalTunnelSubdomain } = require('./generateLocalTunnelSubdomain');

const TUNNEL_HOST = 'https://tun.swy.do';

let tunnel = null;
let previousTunnelUrl = null;

async function openLocalTunnel(port) {
    if (tunnel) {
        return;
    }

    const subdomain = await generateLocalTunnelSubdomain();
    const options = {
        host: TUNNEL_HOST,
        subdomain,
    };

    tunnel = await new Promise((resolve, reject) => {
        localtunnel(port, options, (err, res) => {
            /* istanbul ignore if */
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });

    /* istanbul ignore next */
    const reconnect = () => {
        closeLocalTunnel();

        logger.verbose('Reconnecting');
        openLocalTunnel(port);
    };

    const debouncedReconnect = debounce(reconnect, 1000);

    /* istanbul ignore next */
    tunnel.on('url', (url) => {
        const secureUrl = url.replace('http://', 'https://');

        if (previousTunnelUrl !== url) {
            logger.info(secureUrl);

            previousTunnelUrl = url;
        } else {
            logger.verbose(secureUrl);
        }
    });

    tunnel.on('request', (req) => {
        logger.http('%s %s', req.method, req.path);
    });

    /* istanbul ignore next */
    tunnel.on('error', () => {
        debouncedReconnect();
    });

    tunnel.on('close', () => {
        logger.verbose('Tunnel closed');
    });
}

function closeLocalTunnel() {
    if (tunnel) {
        tunnel.close();
        tunnel = null;
    }
}

function getLocalTunnel() {
    return tunnel;
}

module.exports = {
    openLocalTunnel,
    closeLocalTunnel,
    getLocalTunnel,
};
