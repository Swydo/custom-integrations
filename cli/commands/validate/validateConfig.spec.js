const { describe, it, beforeEach, afterEach } = require('mocha');
const sinon = require('sinon');
const { expect } = require('chai');
const byol = require('@swydo/byol');
const { getInvokeOptions, validateConfig } = require('./validateConfig');

describe('validateConfig', function () {
    describe('getInvokeOptions', function () {
        it('gets options to invoke a handler for config validation', function () {
            const options = getInvokeOptions();

            expect(options).to.have.property('absoluteIndexPath').that.is.a('string');
            expect(options).to.have.property('handlerName', 'customIntegration');
            expect(options).to.have.property('event').that.is.an('object');

            const { event } = options;
            expect(event).to.have.property('query').that.is.a('string');
            expect(event).to.have.property('variables').that.deep.equals({});
        });
    });

    describe('validateConfig', function () {
        beforeEach(function () {
            sinon.stub(byol, 'invokeHandler');
        });

        afterEach(function () {
            byol.invokeHandler.restore();
        });

        it('invokes the handler and returns the validation result', async function () {
            byol.invokeHandler.returns({
                data: {
                    config: {
                        isValid: true,
                    },
                },
            });

            const result = await validateConfig();

            expect(result).to.be.true;
        });

        it('returns false when an error occurs while invoking', async function () {
            byol.invokeHandler.rejects();

            const result = await validateConfig();

            expect(result).to.be.false;
        });
    });
});
