const { describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const sinon = require('sinon');
const hwid = require('hwid');
const { generateLocalTunnelSubdomain } = require('./generateLocalTunnelSubdomain');

describe('generateLocalTunnelSubdomain', function () {
    beforeEach(function () {
        sinon.stub(hwid, 'getHWID');
    });

    afterEach(function () {
        hwid.getHWID.restore();
    });

    it('returns the same domain each time when a hardware ID is available', async function () {
        const expectedId = 'foo';
        hwid.getHWID.resolves(expectedId);

        const firstSubdomain = await generateLocalTunnelSubdomain();
        const secondSubdomain = await generateLocalTunnelSubdomain();

        expect(firstSubdomain).to.equal(secondSubdomain);
    });

    it('returns a different domain each time without a hardware ID', async function () {
        hwid.getHWID.rejects('FOO');

        const firstSubdomain = await generateLocalTunnelSubdomain();
        const secondSubdomain = await generateLocalTunnelSubdomain();

        expect(firstSubdomain).to.not.equal(secondSubdomain);
    });
});
