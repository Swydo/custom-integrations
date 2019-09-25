const Prando = require('prando');
const logger = require('../../lib/logger')('cli:start');
const { getHardwareId } = require('./getHardwareId');

const SUBDOMAIN_CHARACTERS = 'bcdfghjklmnpqrstvwxyz0123456789';

async function generateLocalTunnelSubdomain() {
    const seed = await getHardwareId();

    let rng;

    if (seed) {
        rng = new Prando(seed);
    } else {
        logger.info('Unable to get your hardware ID, tunnel domain will be different each run');
        rng = new Prando();
    }

    return rng.nextString(6, SUBDOMAIN_CHARACTERS);
}

module.exports = {
    generateLocalTunnelSubdomain,
};
