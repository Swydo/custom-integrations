const nock = require('nock');
const { describe, it } = require('mocha');
const { expect } = require('chai');
const { getLatestCustomIntegrationsVersion } = require('./getLatestCustomIntegrationsVersion');

describe('getLatestCustomIntegrationsVersion', function () {
    it('fetches the latest version of the custom integrations package from npm', async function () {
        nock('https://registry.npmjs.org:443')
            .get('/@swydo/custom-integrations')
            .reply(200, {
                'dist-tags': {
                    latest: '0.15.0',
                },
            });

        const version = await getLatestCustomIntegrationsVersion();

        expect(version).to.equal('0.15.0');
    });
});
