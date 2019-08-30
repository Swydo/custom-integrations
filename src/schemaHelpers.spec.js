const { describe, it } = require('mocha');
const { expect } = require('chai');
const { validate, compileSchema, getCustomError } = require('./schemaHelpers');

describe('schemaHelprs', function () {
    describe('#compileSchema', function () {
        const schemaName = 'foo';
        const schema = {
            type: 'object',
            additionalProperties: false,
            required: ['foo'],
            properties: {
                foo: {
                    type: 'string',
                },
            },
        };

        compileSchema(schema, schemaName);

        it('validates a valid object against a schema', function () {
            const obj = { foo: 'foo' };

            const successfulValidate = () => validate(schemaName, obj);

            expect(successfulValidate).to.not.throw;
        });

        it('invalidates an invalid object against a schema', function () {
            const obj = { foo: 0 };

            const failingValidate = () => validate(schemaName, obj);

            expect(failingValidate).to.throw('INVALID_CONFIG');
        });
    });

    describe('#compileSchema', function () {
        it('compiles a shcema and returns a validate function', function () {
            const schema = {
                type: 'object',
                additionalProperties: false,
                required: ['foo'],
                properties: {
                    foo: {
                        type: 'string',
                    },
                },
            };

            const validateSchema = compileSchema(schema, 'bar');

            expect(validateSchema).to.be.a('function');

            const obj = { foo: 'foo' };

            const successfulValidate = () => validateSchema(obj);

            expect(successfulValidate).to.not.throw;
        });
    });

    describe('#getCustomError', function () {
        it('formats a message to a custom ajv error', function () {
            const message = 'foo';
            const field = 'bar';

            const formattedCustomError = getCustomError(message, field);

            expect(formattedCustomError).to.have.nested.property('[0].keyword', 'custom');
            expect(formattedCustomError).to.have.nested.property(
                '[0].message',
                `${message} '${field}'`,
            );
            expect(formattedCustomError).to.have.nested.property('[0].missingProperty', field);
        });
    });
});
