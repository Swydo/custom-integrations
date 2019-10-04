const cloneDeep = require('lodash/cloneDeep');
const { compileSchema, getCustomError } = require('./schemaHelpers');

const SCHEMA_KEY = 'Config';

const FILTER_OPERATOR_TYPES = {
    CONTAINS: {
        value: 'CONTAINS',
    },
    ENDS_WITH: {
        value: 'ENDS_WITH',
    },
    INCLUDES: {
        value: 'INCLUDES',
    },
    STARTS_WITH: {
        value: 'STARTS_WITH',
    },
};

const fieldFormatters = [
    'number',
    'currency',
    'percentage',
    'object',
    'boolean',
    'time',
    'link',
    'text',
    'subParts',
    'multiLineUrl',
    'timeBucket',
    'icon',
    'base64Image',
    'image',
];

const dateTimeTypes = [
    'date',
    'day',
    'year',
    'quarter',
    'quarterOfYear',
    'monthOfYear',
    'month',
    'hourOfDay',
    'minute',
    'second',
    'minuteOfHour',
    'dayOfWeek',
    'hour',
    'week',
    'isoYear',
    'isoWeek',
    'dayOfMonth',
    'weekOfYear',
    'isoWeekOfYear',
];

const listFormatters = ['separatedValues', 'unorderedList'];

const oauth1Options = {
    type: 'object',
    additionalProperties: false,
    required: [
        'version',
        'signature_method',
        'request_url',
        'access_url',
        'authorize_url',
        'environment',
    ],
    properties: {
        version: {
            type: 'string',
            const: '1.0A',
        },
        signature_method: {
            type: 'string',
            enum: ['PLAINTEXT', 'HMAC-SHA1', 'RSA-SHA1'],
        },
        request_url: {
            type: 'string',
            format: 'uri',
        },
        access_url: {
            type: 'string',
            format: 'uri',
        },
        authorize_url: {
            type: 'string',
            format: 'uri',
        },
        environment: {
            type: 'object',
            additionalProperties: false,
            required: ['consumer_key', 'consumer_secret'],
            properties: {
                consumer_key: {
                    type: 'string',
                },
                consumer_secret: {
                    type: 'string',
                },
            },
        },
    },
};

const oauth2Options = {
    type: 'object',
    additionalProperties: false,
    required: ['version', 'base_site', 'environment'],
    properties: {
        version: {
            type: 'string',
            const: '2.0',
        },
        base_site: {
            type: 'string',
            format: 'uri',
        },
        access_token_path: {
            type: 'string',
        },
        authorize_path: {
            type: 'string',
        },
        scopes: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
        environment: {
            type: 'object',
            additionalProperties: false,
            required: ['client_id', 'client_secret'],
            properties: {
                client_id: {
                    type: 'string',
                },
                client_secret: {
                    type: 'string',
                },
            },
        },
        access_token_expire_after_seconds: {
            type: 'number',
        },
    },
};

const formOptions = {
    type: 'object',
    additionalProperties: false,
    required: ['fields'],
    properties: {
        fields: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['label', 'type', 'placeholder', 'key'],
                properties: {
                    label: {
                        type: 'string',
                    },
                    type: {
                        type: 'string',
                        enum: ['text', 'password', 'email'],
                    },
                    placeholder: {
                        type: 'string',
                    },
                    key: {
                        type: 'string',
                    },
                    isDeprecated: {
                        type: 'boolean',
                    },
                    encrypted: {
                        type: 'boolean',
                    },
                },
            },
        },
    },
};

const authentication = {
    type: 'object',
    additionalProperties: false,
    required: ['type'],
    custom(validateContext, data) {
        let missingField;

        switch (data.type) {
            case 'oauth1':
                missingField = data.oauth1Options ? null : 'oauth1Options';
                break;
            case 'oauth2':
                missingField = data.oauth2Options ? null : 'oauth2Options';
                break;
            case 'form':
                missingField = data.formOptions ? null : 'formOptions';
                break;
            default:
                return true;
        }

        if (missingField) {
            const errorMessage = 'should have required property';

            // eslint-disable-next-line no-param-reassign
            validateContext.errors = getCustomError(errorMessage, missingField);
        }

        return !missingField;
    },
    properties: {
        type: {
            type: 'string',
            enum: ['oauth1', 'oauth2', 'form'],
        },
        oauth1Options,
        oauth2Options,
        formOptions,
    },
};

const scopePart = {
    type: 'object',
    additionalProperties: false,
    required: ['key'],
    properties: {
        key: {
            type: 'string',
        },
        optionsRequest: {
            type: 'object',
            additionalProperties: false,
            required: ['endpointId', 'valueField', 'nameField'],
            properties: {
                endpointId: {
                    type: 'string',
                },
                valueField: {
                    type: 'string',
                },
                nameField: {
                    type: 'string',
                },
                metaFields: {
                    type: 'array',
                    items: {
                        type: 'string',
                    },
                },
            },
        },
        options: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['value', 'name'],
                properties: {
                    value: {
                        type: 'string',
                    },
                    name: {
                        type: 'string',
                    },
                },
            },
            minItems: 1,
        },
    },
    custom(validateContext, data) {
        let isValid;

        const uniqueKeys = ['optionsRequest', 'options'];
        const setUniqueKeys = Object.keys(data).filter(key => uniqueKeys.includes(key));

        if (setUniqueKeys.length === 0) {
            // eslint-disable-next-line no-param-reassign
            validateContext.errors = [
                {
                    keyword: 'scope.part[]',
                    message: `should have one of required properties ${uniqueKeys.join(', ')}`,
                },
            ];
            isValid = false;
        } else if (setUniqueKeys.length > 1) {
            // eslint-disable-next-line no-param-reassign
            validateContext.errors = [
                {
                    keyword: 'scope.part[]',
                    message: `should only have one of ${setUniqueKeys.join(', ')}`,
                },
            ];
            isValid = false;
        } else {
            isValid = true;
        }

        return isValid;
    },
};

const scope = {
    type: 'object',
    additionalProperties: false,
    required: ['parts'],
    properties: {
        parts: {
            type: 'array',
            items: scopePart,
            minItems: 1,
        },
    },
};

const rateLimit = {
    type: 'object',
    additionalProperties: false,
    required: ['resetInterval', 'requests'],
    properties: {
        resetInterval: {
            type: 'number',
        },
        requests: {
            type: 'number',
        },
        per: {
            type: 'array',
            items: {
                type: 'string',
                enum: ['endpoint', 'user'],
            },
        },
    },
};

const dateRangeStrategies = ['modify', 'validate'];

const dateRange = {
    type: 'object',
    additionalProperties: false,
    properties: {
        enabled: {
            type: 'boolean',
        },
        required: {
            type: 'boolean',
        },
        maxLength: {
            type: 'number',
        },
        min: {
            type: 'string',
            format: 'date',
        },
        max: {
            type: 'string',
            format: 'date',
        },
        strategy: {
            type: 'string',
            enum: dateRangeStrategies,
        },
        fieldSelection: {
            type: 'object',
            additionalProperties: false,
            required: ['enabled', 'required'],
            properties: {
                enabled: {
                    type: 'boolean',
                },
                required: {
                    type: 'boolean',
                },
            },
        },
    },
};

const credentials = {
    type: 'object',
    additionalProperties: false,
    properties: {
        required: {
            type: 'boolean',
        },
    },
};

const minMax = {
    type: 'object',
    additionalProperties: false,
    properties: {
        min: {
            type: 'number',
        },
        max: {
            type: 'number',
        },
    },
};

const cache = {
    type: 'object',
    additionalProperties: false,
    required: ['enabled', 'expireAfterSeconds'],
    properties: {
        enabled: {
            type: 'boolean',
        },
        expireAfterSeconds: {
            type: 'number',
            minimum: 0,
            maximum: 3600,
        },
    },
};

const pagination = {
    type: 'object',
    additionalProperties: false,
    properties: {
        enabled: {
            type: 'boolean',
        },
        perPage: {
            type: 'number',
        },
    },
};

const display = {
    type: 'object',
    additionalProperties: false,
    required: ['type'],
    properties: {
        type: {
            type: 'string',
            enum: fieldFormatters,
        },
        format: {
            type: 'string',
        },
        input: {
            type: 'string',
        },
        path: {
            type: 'string',
        },
        currencyCode: {
            type: 'string',
        },
    },
    custom(validateContext, data, parentSchema, dataPath, parentData) {
        const hasDateTime = parentData.dateTime;

        if (hasDateTime) {
            const errorMessage = 'can not be used when field is a date time';

            // eslint-disable-next-line no-param-reassign
            validateContext.errors = getCustomError(errorMessage, 'display');

            return false;
        }

        return true;
    },
};

const listDisplay = {
    type: 'object',
    additionalProperties: false,
    required: ['type'],
    properties: {
        type: {
            type: 'string',
            enum: listFormatters,
        },
        separator: {
            type: 'string',
        },
    },
};

const sort = {
    type: 'object',
    additionalProperties: false,
    properties: {
        path: {
            type: 'string',
        },
    },
};

const filterOperator = {
    type: 'object',
    additionalProperties: false,
    required: ['type', 'capabilities'],
    properties: {
        type: {
            type: 'string',
            enum: Object.keys(FILTER_OPERATOR_TYPES).map(
                operatorKey => FILTER_OPERATOR_TYPES[operatorKey].value,
            ),
        },
        capabilities: {
            type: 'object',
            additionalProperties: false,
            required: ['caseSensitive', 'caseInsensitive', 'negate'],
            properties: {
                caseSensitive: {
                    type: 'boolean',
                },
                caseInsensitive: {
                    type: 'boolean',
                },
                negate: {
                    type: 'boolean',
                },
            },
        },
    },
};

const optionsRequest = {
    type: 'object',
    additionalProperties: false,
    required: ['idField', 'nameField'],
    properties: {
        endpointId: {
            type: 'string',
        },
        idField: {
            type: 'string',
        },
        nameField: {
            type: 'string',
        },
        properties: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
    },
};

const filterOption = {
    type: 'object',
    additionalProperties: false,
    required: ['id', 'name'],
    properties: {
        id: {
            type: 'string',
        },
        name: {
            type: 'string',
        },
    },
};

const filter = {
    type: 'object',
    additionalProperties: false,
    properties: {
        key: {
            type: 'string',
        },
        min: {
            type: 'number',
        },
        max: {
            type: 'number',
        },
        operators: {
            type: 'array',
            items: filterOperator,
        },
        optionsRequest,
        options: {
            type: 'array',
            items: filterOption,
        },
    },
    custom(validateContext, data) {
        const { options: filterOptions, optionsRequest: filterOptionsRequest } = data;

        if (filterOptions || filterOptionsRequest) {
            return true;
        }

        // eslint-disable-next-line no-param-reassign
        validateContext.errors = [
            {
                keyword: 'filter',
                message: 'should specify options or optionsRequest',
            },
        ];

        return false;
    },
};

const dateTime = {
    type: 'object',
    additionalProperties: false,
    required: ['type'],
    properties: {
        type: {
            type: 'string',
            enum: dateTimeTypes,
        },
    },
};

const baseField = {
    type: 'object',
    additionalProperties: false,
    required: ['id', 'name', 'type'],
    properties: {
        id: {
            type: 'string',
        },
        name: {
            type: 'string',
        },
        category: {
            type: 'string',
        },
        type: {
            type: 'string',
            enum: ['String', 'Boolean', 'Number', 'Object'],
        },
        isSelectable: {
            type: 'boolean',
        },
        isDeprecated: {
            type: 'boolean',
        },
        isConstant: {
            type: 'boolean',
        },
        isDimension: {
            type: 'boolean',
        },
        isMetric: {
            type: 'boolean',
        },
        isFilter: {
            type: 'boolean',
        },
        isRetrievable: {
            type: 'boolean',
        },
        isSortable: {
            type: 'boolean',
        },
        isNegative: {
            type: 'boolean',
        },
        isEditable: {
            type: 'boolean',
        },
        dateTime,
        display,
        shortDisplay: display,
        listDisplay,
        default: {
            type: ['number', 'integer', 'string', 'boolean', 'array', 'object'],
            custom(validateContext, data, parentSchema, dataPath, parentData) {
                const type = parentData.type.toLowerCase();
                // eslint-disable-next-line valid-typeof
                const isSameType = typeof data === type;

                if (!isSameType) {
                    const errorMessage = 'should be of same type as';

                    // eslint-disable-next-line no-param-reassign
                    validateContext.errors = getCustomError(errorMessage, 'type');
                }

                return isSameType;
            },
        },
        aggregate: {
            type: 'string',
            enum: [
                'average',
                'distinctArray',
                'distinct',
                'sum',
                'min',
                'max',
                'range',
                'oneOrNothing',
                'last',
            ],
        },
        requestKey: {
            type: 'string',
        },
        responseKey: {
            type: 'string',
        },
        formula: {
            type: 'string',
        },
        sort,
        filter,
        identifierPath: {
            type: 'string',
        },
    },
};

const field = cloneDeep(baseField);
field.properties.subFields = {
    type: 'array',
    items: baseField,
};

const endpointScope = {
    type: 'object',
    additionalProperties: false,
    required: ['enabled', 'required'],
    properties: {
        enabled: {
            type: 'boolean',
        },
        required: {
            type: 'boolean',
        },
        requiredPartKeys: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
    },
};

const endpoint = {
    type: 'object',
    additionalProperties: false,
    required: ['id', 'name', 'fields', 'connector'],
    properties: {
        id: {
            type: 'string',
        },
        name: {
            type: 'string',
        },
        category: {
            type: 'string',
        },
        isSelectable: {
            type: 'boolean',
        },
        dateRange,
        credentials,
        metrics: minMax,
        dimensions: minMax,
        cache,
        pagination,
        scope: endpointScope,
        fields: {
            type: 'array',
            items: field,
        },
        connector: {
            custom(validateContext, data) {
                if (data instanceof Promise || typeof data === 'function') {
                    return true;
                }

                // eslint-disable-next-line no-param-reassign
                validateContext.errors = [
                    {
                        keyword: 'connector',
                        message: 'should be of type function or Promise',
                    },
                ];

                return false;
            },
        },
    },
};

const configSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['adapter'],
    properties: {
        adapter: {
            type: 'object',
            additionalProperties: false,
            required: ['id', 'endpoints'],
            properties: {
                id: {
                    type: 'string',
                },
                authentication,
                scope,
                rateLimits: {
                    type: 'array',
                    items: rateLimit,
                },
                endpoints: {
                    type: 'array',
                    items: endpoint,
                },
            },
        },
    },
};

const validateConfig = compileSchema(configSchema, SCHEMA_KEY);

module.exports = {
    validateConfig,
    configSchema,
};
