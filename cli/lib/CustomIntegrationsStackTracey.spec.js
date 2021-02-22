const { describe, it } = require('mocha');
const { expect } = require('chai');
const { CustomIntegrationsStackTracey } = require('./CustomIntegrationsStackTracey');

describe('CustomIntegratonsStackTracey', function () {
    describe('isThirdParty', function () {
        it('returns true when the path contains custom-integrations', function () {
            const stackTracey = new CustomIntegrationsStackTracey();

            const isThirdParty = stackTracey.isThirdParty('/foo/custom-integrations/bar');

            expect(isThirdParty).to.be.true;
        });

        it('returns true when the path is a third party path according to StackTracey', function () {
            const stackTracey = new CustomIntegrationsStackTracey();

            const isThirdParty = stackTracey.isThirdParty('/node_modules/foo/index.js');

            expect(isThirdParty).to.be.true;
        });

        it('returns false when the path is not a third party path', function () {
            const stackTracey = new CustomIntegrationsStackTracey();

            const isThirdParty = stackTracey.isThirdParty('./CustomIntegrationsStackTracey');

            expect(isThirdParty).to.be.false;
        });
    });
});
