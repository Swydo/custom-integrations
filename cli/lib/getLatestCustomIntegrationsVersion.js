const npmFetch = require('npm-registry-fetch');

async function getLatestCustomIntegrationsVersion() {
    const options = {
        headers: {
            // Request a smaller response.
            accept: 'application/vnd.npm.install-v1+json',
        },
    };
    const {
        'dist-tags': {
            latest,
        },
    } = await npmFetch.json('/@swydo/custom-integrations', options);

    return latest;
}

module.exports = {
    getLatestCustomIntegrationsVersion,
};
