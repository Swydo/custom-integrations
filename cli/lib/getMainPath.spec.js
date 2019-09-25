const path = require('path');
const sinon = require('sinon');
const { describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const { getMainPath } = require('./getMainPath');

describe('getMainPath', function () {
    beforeEach(function () {
        sinon.stub(process, 'cwd');
    });

    afterEach(function () {
        process.cwd.restore();
    });

    it('fetches the absolute main path from the package.json in the current cwd', function () {
        process.cwd.returns(path.resolve(__dirname, './assets/validPackageJson'));

        const mainPath = getMainPath();
        const expectedPath = path.join(process.cwd(), 'src/foo.js');

        expect(mainPath).to.equal(expectedPath);
    });

    it('throws when there is no main in the package.json file', function () {
        process.cwd.returns(path.resolve(__dirname, './assets/invalidPackageJson'));

        expect(getMainPath).to.throw('PROJECT_MISSING_MAIN');
    });
});
