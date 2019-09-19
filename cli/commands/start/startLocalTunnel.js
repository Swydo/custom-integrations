const Prando = require('prando');
const { getHWID } = require('hwid');
const debug = require('debug')('custom-integrations:cli:start');
const localtunnel = require('localtunnel');

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

    tunnel.on('url', (url) => {
        debug(url.replace('http://', 'https://'));
    });

    tunnel.on('close', () => {
        debug('Tunnel closed unexpectedly');
    });
}

module.exports = {
    startLocalTunnel,
};
