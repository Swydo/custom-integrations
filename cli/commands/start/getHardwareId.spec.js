const { describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const sinon = require('sinon');
const hwid = require('hwid');
const { getHardwareId } = require('./getHardwareId');

describe('getHardwareId', function () {
    beforeEach(function () {
        sinon.stub(hwid, 'getHWID');
    });

    afterEach(function () {
        hwid.getHWID.restore();
    });

    it('returns a hardware ID', async function () {
        const expectedId = 'foo';
        hwid.getHWID.resolves(expectedId);

        const id = await getHardwareId();

        expect(id).to.equal(expectedId);
    });

    it('returns null when an error occurs', async function () {
        hwid.getHWID.rejects('FOO');

        const id = await getHardwareId();

        expect(id).to.equal(null);
    });
});
