const Ajv = require('ajv');
const betterAjvErrors = require('better-ajv-errors');

const ajv = new Ajv({
    removeAdditional: true,
    jsonPointers: true,
    allErrors: true,
});

ajv.addKeyword('custom', {
    validate: /* istanbul ignore next */ function doValidate(schema, ...args) {
        return schema(doValidate, ...args);
    },
    errors: true,
});

function validate(schemaName, data) {
    const valid = ajv.validate(schemaName, data);

    if (!valid) {
        const schema = ajv.getSchema(schemaName);

        // betterAjvErrors only supports a single error, so we'll just print them one by one.
        ajv.errors.forEach((error) => {
            const message = betterAjvErrors(schema, data, [error], { format: 'cli', indent: 4 });
            console.error(`${message}\n`); // eslint-disable-line no-console
        });

        throw new Error('INVALID_CONFIG');
    }
}

function compileSchema(schema, schemaName) {
    ajv.addSchema(schema, schemaName);

    return data => validate(schemaName, data);
}

function getCustomError(message, field) {
    return [
        {
            keyword: 'custom',
            message: `${message} '${field}'`,
            missingProperty: field,
        },
    ];
}

module.exports = {
    validate,
    compileSchema,
    getCustomError,
};
