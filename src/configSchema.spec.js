const { describe, it } = require('mocha');
const { expect } = require('chai');
const { validateConfig, configSchema } = require('./configSchema');

describe('configSchema', function () {
    describe('#validateConfig', function () {
        it('validates an adapter config', function () {
            const adapter = {
                id: 'foo',
                authentication: {
                    type: 'form',
                    formOptions: {
                        fields: [
                            {
                                label: 'Name',
                                type: 'text',
                                id: 'name',
                                placeholder: 'Enter connection name',
                            },
                        ],
                    },
                },
                endpoints: [{
                    id: 'bar',
                    connector: () => 'bar',
                    fields: [],
                }],
            };

            const successfulValidate = () => validateConfig(adapter);

            expect(successfulValidate).to.not.throw;
        });

        it('invalidates an invalid adapter config', function () {
            const adapter = {};

            const failingValidate = () => validateConfig(adapter);

            expect(failingValidate).to.throw;
        });
    });

    describe('#authenticationCustomValidator', function () {
        const customValidator = configSchema.properties.adapter.properties.authentication.custom;

        it('validates valid oauth1 config', function () {
            const validateContext = {};
            const data = { type: 'oauth1', oauth1Options: {} };

            const isValid = customValidator(validateContext, data);

            expect(isValid).to.be.true;
        });

        it('invalidates oauth1 config', function () {
            const validateContext = {};
            const data = { type: 'oauth1' };

            const isValid = customValidator(validateContext, data);

            expect(isValid).to.be.false;
        });

        it('validates valid oauth2 config', function () {
            const validateContext = {};
            const data = { type: 'oauth2', oauth2Options: {} };

            const isValid = customValidator(validateContext, data);

            expect(isValid).to.be.true;
        });

        it('invalidates oauth2 config', function () {
            const validateContext = {};
            const data = { type: 'oauth2' };

            const isValid = customValidator(validateContext, data);

            expect(isValid).to.be.false;
        });

        it('validates valid form config', function () {
            const validateContext = {};
            const data = { type: 'form', formOptions: {} };

            const isValid = customValidator(validateContext, data);

            expect(isValid).to.be.true;
        });

        it('invalidates form config', function () {
            const validateContext = {};
            const data = { type: 'form' };

            const isValid = customValidator(validateContext, data);

            expect(isValid).to.be.false;
        });

        it('validates valid config when no auth config is set', function () {
            const validateContext = {};
            const data = { };

            const isValid = customValidator(validateContext, data);

            expect(isValid).to.be.true;
        });
    });

    describe('#scopePartCustomValidator', function () {
        const customValidator = configSchema.properties.adapter.properties.scope.properties.parts.items.custom;

        it('validates when only has one of the unique properties', function () {
            const validateContext = {};
            const data = { optionsRequest: {} };

            const isValid = customValidator(validateContext, data);

            expect(isValid).to.be.true;
        });

        it('invalidates when more than one unique properties are set', function () {
            const validateContext = {};
            const data = { optionsRequest: {}, options: {} };

            const isValid = customValidator(validateContext, data);

            expect(isValid).to.be.false;
        });

        it('invalidates when none of the unique properties are set', function () {
            const validateContext = {};
            const data = { };

            const isValid = customValidator(validateContext, data);

            expect(isValid).to.be.false;
        });
    });

    describe('#scopePartCustomValidator', function () {
        const fieldSchema = configSchema.properties.adapter.properties.endpoints.items.properties.fields.itmes;
        const customValidator = fieldSchema.properties.default.custom;

        it('validates when parent data type matches type', function () {
            const _ = {};
            const validateContext = {};
            const parentData = { type: 'String' };
            const data = 'foo';

            const isValid = customValidator(validateContext, data, _, _, parentData);

            expect(isValid).to.be.true;
        });

        it('invalidates when parent data type does not matches type', function () {
            const _ = {};
            const validateContext = {};
            const parentData = { type: 'String' };
            const data = 0;

            const isValid = customValidator(validateContext, data, _, _, parentData);

            expect(isValid).to.be.false;
        });
    });

    describe('#endpointPartCustomValidator', function () {
        const customValidator = configSchema.properties.adapter.properties.endpoints.items.properties.connector.custom;

        it('validates when connector is a function', function () {
            const validateContext = {};
            const data = () => 'foo';

            const isValid = customValidator(validateContext, data);

            expect(isValid).to.be.true;
        });

        it('validates when connector is a promise', function () {
            const validateContext = {};
            const data = async () => 'foo';

            const isValid = customValidator(validateContext, data);

            expect(isValid).to.be.true;
        });

        it('invalidates when connector is not a promise or function', function () {
            const validateContext = {};
            const data = 'foo';

            const isValid = customValidator(validateContext, data);

            expect(isValid).to.be.false;
        });
    });
});
