const path = require('path');
const sinon = require('sinon');
const { describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const { getPackage } = require('./getPackage');

describe('getPackage', function () {
    beforeEach(function () {
        sinon.stub(process, 'cwd');
    });

    afterEach(function () {
        process.cwd.restore();
    });

    it('fetches the package.json from the current cwd', function () {
        process.cwd.returns(path.resolve(__dirname, './assets/validPackageJson'));

        const packageJson = getPackage();

        expect(packageJson).to.be.an('object');
        expect(packageJson).to.have.property('name', 'foo');
    });
});
