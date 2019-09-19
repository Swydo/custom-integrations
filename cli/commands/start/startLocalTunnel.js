const debounce = require('debounce');
const Prando = require('prando');
const { getHWID } = require('hwid');
const localtunnel = require('localtunnel');
const logger = require('../../lib/logger')('cli:start');

const TUNNEL_HOST = 'https://tun.swy.do';

const SUBDOMAIN_CHARACTERS = 'bcdfghjklmnpqrstvwxyz0123456789';

async function generateSubdomain() {
    const seed = await getHWID();
    const rng = new Prando(seed);

    return rng.nextString(6, SUBDOMAIN_CHARACTERS);
}

async function startLocalTunnel(port) {
    const subdomain = await generateSubdomain();
    const options = {
        host: TUNNEL_HOST,
        subdomain,
    };

    const tunnel = await new Promise((resolve, reject) => {
        localtunnel(port, options, (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });

    const reconnect = () => {
        tunnel.close();

        logger.info('Reconnecting');
        startLocalTunnel(port);
    };

    const debouncedReconnect = debounce(reconnect, 1000);

    tunnel.on('url', (url) => {
        logger.info(url.replace('http://', 'https://'));
    });

    tunnel.on('request', (req) => {
        logger.http('%s %s', req.method, req.path);
    });

    tunnel.on('error', () => {
        debouncedReconnect();
    });

    tunnel.on('close', () => {
        logger.info('Tunnel closed');
    });
}

module.exports = {
    startLocalTunnel,
};
