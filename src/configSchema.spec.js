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
                                key: 'foo',
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
                    fields: [{
                        id: 'bar',
                        name: 'bar',
                        type: 'String',
                    }],
                }],
            };

            function successfulValidate() {
                return validateConfig({ adapter });
            }

            expect(successfulValidate()).to.not.throw;
        });

        it('invalidates an invalid adapter config', function () {
            const adapter = {};

            function failingValidate() {
                return validateConfig({ adapter });
            }

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

    describe('#fieldDefaultCustomValidator', function () {
        const fieldSchema = configSchema.properties.adapter.properties.endpoints.items.properties.fields.items;
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

    describe('#fieldDisplayCustomValidator', function () {
        const fieldSchema = configSchema.properties.adapter.properties.endpoints.items.properties.fields.items;
        const customValidator = fieldSchema.properties.display.custom;

        it('validates when parent data does not have dateTime', function () {
            const _ = {};
            const validateContext = {};
            const parentData = { };
            const data = 'foo';

            const isValid = customValidator(validateContext, data, _, _, parentData);

            expect(isValid).to.be.true;
        });

        it('invalidates when parent data has dateTime', function () {
            const _ = {};
            const validateContext = {};
            const parentData = { dateTime: { type: 'day' } };
            const data = 0;

            const isValid = customValidator(validateContext, data, _, _, parentData);

            expect(isValid).to.be.false;
        });
    });

    describe('#fieldShortDisplayCustomValidator', function () {
        const fieldSchema = configSchema.properties.adapter.properties.endpoints.items.properties.fields.items;
        const customValidator = fieldSchema.properties.shortDisplay.custom;

        it('validates when parent data does not have dateTime', function () {
            const _ = {};
            const validateContext = {};
            const parentData = { };
            const data = 'foo';

            const isValid = customValidator(validateContext, data, _, _, parentData);

            expect(isValid).to.be.true;
        });

        it('invalidates when parent data has dateTime', function () {
            const _ = {};
            const validateContext = {};
            const parentData = { dateTime: { type: 'day' } };
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
