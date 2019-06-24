const Ajv = require('ajv');

const ajv = new Ajv({
    removeAdditional: true,
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
        throw new Error(ajv.errorsText(validate.errors, { dataVar: schemaName }));
    }
}

function compileSchema(schema, schemaName) {
    ajv.addSchema(schema, schemaName);

    return (data, dataVar) => validate(schemaName, data, dataVar);
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
