# custom-integrations

[![CircleCI](https://img.shields.io/circleci/build/github/Swydo/custom-integrations/master.svg?label=circleci&style=flat-square)](https://circleci.com/gh/Swydo/custom-integrations) [![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg?style=flat-square)](https://istanbul.js.org/) [![npm](https://img.shields.io/npm/v/@swydo/custom-integrations.svg?style=flat-square)](https://www.npmjs.com/package/@swydo/custom-integrations) [![node](https://img.shields.io/node/v/@swydo/custom-integrations.svg?style=flat-square)](https://nodejs.org/) [![conventionalCommits](https://img.shields.io/badge/conventional%20commits-1.0.0-yellow.svg?style=flat-square)](https://conventionalcommits.org) [![GitHub](https://img.shields.io/github/license/Swydo/custom-integrations.svg?style=flat-square)](https://github.com/Swydo/custom-integrations/blob/master/LICENSE)

<img src="https://user-images.githubusercontent.com/2283434/52522860-25eee400-2c8b-11e9-8602-f8de0d158600.png">

---

Swydo custom integrations enables any online platform to be connected to Swydo.

---

<!-- markdown-toc start - Don't edit this section. Run M-x markdown-toc-refresh-toc -->

**Table of Contents**

-   [Install](#install)
    -   [Compatibility](#Compatibility)
-   [Usage](#usage)
-   [Example](#example)
-   [Reference](#reference)
    -   [Configuration](#configuration)
        -   [adapter](#adapter)
        -   [endpoints](#endpoints)
        -   [fields](#fields)
        -   [connector](#connector)

<!-- markdown-toc end -->

---

## Install

```bash
npm install @swydo/custom-integrations
```

### Compatibility

The supported Node.js version is `10.x`.

## Usage

Your module should export a custom integration, for example:
`src/index.js`

```js
const { buildCustomIntegration } = require('@swydo/custom-integrations');
const config = require('./adapter');

const customIntegration = buildCustomIntegration(config);

module.exports = {
    customIntegration,
};
```

Your module defines the primary endpoint the custom integration is exported from. For example:
`package.json`

```json
{
    "name": "my-swydo-integration",
    "version": "0.0.1",
    "main": "src/index.js",
    "dependencies": {
        "@swydo/custom-integrations ": "latest"
    }
}
```

## Example

A complete custom integration example integrating the [Star Wars API](https://swapi.co/) can be found here: [github.com/Swydo/star-wars-integration](https://github.com/Swydo/star-wars-integration)

## Reference

Reference guide of all available configuration options.

### Configuration

Custom integrations are designed to accept a configuration that contains an `adapter`.

```js
const config = {
    // adapter specification
    adapter,
};
```

#### adapter

An `adapter` is a container for a set of different endpoints that defines authentication, rate limits and scopes.

```js
const adapter = {
    // String - identifier, must be kebab case e.g. foo-bar
    key: 'foo',
    // String (optional) - human readable name
    name: 'Foo',
    // String (optional) - a url to an icon
    icon: 'https://example.com/foo.png',
    // Object - authentication specification
    authentication: {
        // String - type
        type: 'form' | 'oauth1' | 'oauth2',
        // Object (required when type = form) - options used to create a form in the gui
        formOptions: {
            // [Object] - fields in a form
            fields: [
                {
                    // String - field type
                    type: 'text' | 'password' | 'email',
                    // String - interface label of the field
                    label: 'API key',
                    // String - internal key of the field
                    key: 'apiKey',
                    // String - placeholder value of the field (not saved as default)
                    type: 'Enter your API key',
                    // Boolean - whether the result of the form field should be encrypted
                    encrypted: true,
                },
            ],
        },
        // Object (required when type = oauth1) - options used for OAuth1
        oauth1Options: {
            // String - OAuth1 version
            version: '1.0A',
            // String - OAuth1 request url
            request_url: 'https://example.com/oauth/request_token',
            // String - OAuth1 access url
            access_url: 'https://example.com/oauth/access_token',
            // String - OAuth1 authorize url
            authorize_url: 'https://example.com/oauth/authorize',
            // String - OAuth1 signature method
            signature_method: 'HMAC-SHA1' | 'RSA-SHA1' | 'PLAINTEXT',
            // Object - variable references to environment variables
            environment: {
                // String - env var name containing the OAuth1 consumer key
                consumer_key: 'EXAMPLE_CONSUMER_KEY',
                // String - env var name containing the OAuth1 consumer secret
                consumer_secret: 'EXAMPLE_CONSUMER_SECRET',
            },
        },
        // Object (required when type = oauth2) - options used for OAuth2
        oauth2Options: {
            // String - OAuth2 version
            version: '2.0',
            // String - OAuth2 base site url
            base_site: 'https://oauth2.example.com',
            // [String] - OAuth2 scopes
            scopes: ['email'],
            // Object - variable references to environment variables
            environment: {
                // String - env var name containing the OAuth2 client id
                client_id: 'EXAMPLE_CLIENT_ID',
                // String - env var name containing the OAuth2 client_secret
                client_secret: 'EXAMPLE_CLIENT_SECRET',
            },
        },
    },
    // Object (optional) - specifify how all your data requests are limited to a subset of data e.g. Analytics view, YouTube channel, Facebook page, etc.
    scope: {
        parts: [
            {
                // String - identifier, must be kebab case e.g. foo-bar
                key: 'foo',
                // Object - options to fetch scope options using a request
                optionsRequest: {
                    // String - identifier of the endpoint the request will be made to.
                    endpointId: 'example-adapter:foo',
                    // String - name of the field that functions as the identifier of the options.
                    idField: 'fooId',
                    // String - name of the field that functions as the visible name of the options.
                    nameField: 'fooName',
                },
            },
        ],
    },
    // Object - rate limit specification, limit the rate of requests
    rateLimit: {
        // Number -  time in milliseconds until the rate limit resets
        resetInterval: 1000,
        // Number - amount of requests that can be done per interval
        requests: 1,
        // [String] (optional) - entity the rate limit applies to
        per: ['endpoint' | 'user'],
    },
    // [Object] - endpoint specification, configuration for each api endpoint
    endpoints,
};
```

#### endpoints

An API endpoint configuration is stored in an adapter's endpoint.

```js
const endpoints = [
    {
        // String - identifier
        key: 'foo',
        // Boolean (optional) - indicates whether the endpoint is selectable in the gui
        isSelectable: true, // default false
        // String (optional) - human readable name this endpoint should be shown as in the gui
        categoryId: 'foo',
        // Object (optional) - date range options
        dateRange: {
            // Boolean (optional) - indicates if this endpoint supports date ranges
            enabled: true, // default true
            // Boolean (optional) - indicates whether a date range is required
            required: true, // default false
            // Number (optional) - maximum length of the date range in ms
            maxLength: 31556952000, // default 157766399999 (5 years)
            // String 'YYYY-MM-DD' (optional) - Minimum value for the start and end date of a date range
            min: '2010-01-01', // default '1999-01-01'
            // String 'YYYY-MM-DD' (optional) - maximum value for the start and end date of a date range
            max: '2019-01-01',
            // String (optional) - what validation strategy should be used to check the date range for the above specs.Modify tries to fix the date range, validate throws an error
            strategy: 'modify' | 'validate',
        },
        // Object (optional) - credential options
        credentials: {
            // Boolean (optional) - credentials requirement, if true all requests must have credentials
            required: true, // default false
        },
        // Object (optional) - metric options
        metrics: {
            // Number (optional) - minimum amount of metrics that need to be requested
            min: 1,
            // Number (optional) - maximum amount of metrics that need to be requested
            max: 10,
        },
        // Object (optional) - dimension options
        dimensions: {
            // Number (optional) - minimum amount of dimensions that need to be requested
            min: 1,
            // Number (optional) - maximum amount of dimensions that need to be requested
            max: 10,
        },
        // Object (optional) - caching options
        cache: {
            // Boolean (optional) - enable or disable caching of data
            enabled: true, // default true
            // Number (optional) - expire cache after amount of seconds
            expireAfterSeconds: 3600, // default 3600
            // Number (optional) - expire cache after amount of seconds for golden data. Golden data means that the rows and totals are static and won't change anymore in the future
            expireGoldenAfterSeconds: 604800, // default 604800
        },
        // Object (optional) - comparison options
        comparison: {
            // Boolean (optional) - indicates whether the endpoint can handle comparison
            enabled: true, // default true
        },
        // Object (optional) - totals options
        totals: {
            // Boolean (optional) - auto calculate totals that are missing in the response
            aggregate: false, // default false
            // Boolean (optional) - auto calculate the totals based on all returned rows instead of limited rows
            useGrandTotals: false, // default false
        },
        // Object (optional) - scope options
        scope: {
            // Boolean (optional) - indicates whether the endpoint supports scopes
            enabled: true, // default true
            // Boolean (optional) - indicates whether the endpoint requires scopes
            required: true, // default true
            // [String] (optional) - specifiy which scope keys are required
            requiredPartKeys: ['foo'],
        },
        // Object (optional) - pagination options
        pagination: {
            // Boolean (optional) - indicates whether the endpoint supports pagination
            enabled: true, // default true
            // Number (optional) - indicates the number of items per page
            perPage: 10,
        },
        // [Object] - field definitions
        fields,
        // Function|Promise - responsible for formatting the input options to an external request and the response of the external request to the custom integration format
        connector,
    },
];
```

#### fields

Fields contains the definitions of external or internal metrics or dimensions.

```js
const fields = [
    {
        // String - identifier
        key: 'foo',
        // String - field name as it a appears in the gui
        name: 'Foo',
        // String - type of the field's value
        type: 'String' | 'Boolean' | 'Number' | 'Object',
        // String (optional) - human readable name this field should be shown as in the gui
        categoryId: 'foo',
        // Boolean (optional) - indicates whether the field is selectable in the gui
        isSelectable: true, // default true
        // Boolean (optional) - deprecation state of the field
        isDeprecated: false, // default false
        // Boolean (optional) = indicates whether the field is constant or can be divided through a time dimension
        isConstant: false, // default false
        // Boolean (optional) - indicates whether the field can be used as dimension
        isDimension: false, // default false
        // Boolean (optional) - indicates whether the field can be used as metric
        isMetric: true, // default true
        // Boolean (optional) - indicates whether the field can be retrieved from the api
        isRetrievable: true, // default true
        // Boolean (optional) - indicates whether it's possible to sort on the field
        isSortable: true, // default true
        // Boolean (optional) - indicates whether the field's return value is date/time series
        isDateTime: false, // default false
        // Boolean (optional) - indicates whether it's positive or negative if the number is higher or lower when compared to a previous period
        isNegative: false, // default false
        // String (optional) - indicates how missing dates are added
        // default based on the field's key
        dateRangeFiller:
            'null' |
            'second' |
            'minute' |
            'hour' |
            'day' |
            'week' |
            'isoWeek' |
            'month' |
            'year' |
            'isoYear' |
            'minuteOfHour' |
            'hourOfDay' |
            'dayOfWeek' |
            'dayOfMonth' |
            'weekOfYear' |
            'isoWeekOfYear' |
            'monthOfYear',
        // Object (optional) - indicates how the field's value should be formatted in the interface.
        display: {
            // default based on field key and/or type
            // String - indicates which display formatter to use
            // dates use MomentJs http://momentjs.com/docs/#/displaying/format/
            // numbers use Numbro.js: https://numbrojs.com/old-format.html
            type:
                'date' | // input: ISO 8601, format: 'YYYY-MM-DDTHH:MM:ssZ'
                'day' | // input: 'YYYY-MM-DD', format: 'LL'
                'year' | // input: 'YYYY', format: 'YYYY'
                'quarter' | // input: ''YYYY-Q'', format: 'Qo YYYY'
                'quarterOfYear' | // input: 'Q', format: 'Qo YYYY'
                'monthOfYear' | // input: 'MM', format: 'MMMM'
                'month' | // input: 'YYYY-MM', format: 'MMM YYY'
                'hourOfDay' | // input: 'HH', format: 'LT'
                'minute' | // input: 'YYYY-MM-DD HH:mm', format: 'LLLL'
                'second' | // input: 'YYYY-MM-DD HH:mm:ss', format: 'LL LTS'
                'minuteOfHour' | // input: 'mm', format: 'm'
                'dayOfWeek' | // input: 'e', format: 'dddd'
                'hour' | // input: 'YYYY-MM-DD HH', format: 'LLL'
                'week' | // input: 'YYYY-MM-DD HH', format: 'LLL'
                'isoYear' | // input: 'GGGG', format: 'GGGG'
                'isoWeek' | // input: 'GGGGWW', format: 'W GGGG'
                'dayOfMonth' | // input: 'DD', format: 'D'
                'weekOfYear' | // input: 'ww', format: 'w'
                'isoWeekOfYear' | // input: 'WW', format: 'W'
                'number' | // format: '0,0.[00]'
                'currency' | // input: ISO 4217
                'percentage' | // format: '0,0.[00]%'
                'object' | // format an object to a gui friendly format
                'boolean' | // format a boolean to a checkmark or cross icon based on the value
                'time' | // input: milliseconds, format:' h m'
                'link' | // format the field value to a clickable link
                'text' | // format the field to a text span
                'subParts' | // split the field by input delimiter and format sub part by format tag
                'multiLineUrl' | // format the field value to a clickable link over multiple lines
                'timeBucket' | // format the field to a time bucket
                'icon' | // input: 'down' | 'delete' | 'enabled' | 'error' | 'removed' | 'nocredits' | 'notdelivered' | 'paused' | 'sent' | 'up' | 'unconfirmed' | 'unknown', format: icon
                'base64Image' | // input: base64 string
                'image', // input: url to an image
            format: 'LLLL', // overwrite output format
            input: 'YYYY-MM-DDTHH:MM:ssZ', // overwrite input format
            path: 'foo.date', // path to input value when field type is object
        },
        // Object (optional) - indicates how the value should be formatted in the gui if it's returned as an array
        listDisplay: {
            // default based on type and/or aggregation
            // String - indicates which list display formatter to use
            type: 'separatedValues' | 'unorderedList',
            // String (optional) - separator to use between list values
            separator: ' - ', // default ','
        },
        // Any (optional) - default value for the field if it's not returned. Same type as field type
        default: 'foo',
        // default based on field type
        aggregate:
            'average' |
            'weightedAvg' |
            'array' |
            'distinctArray' |
            'distinct' | // default for field type: 'String' | 'Object' | 'Boolean'
            'concatenate' |
            'sum' | // default for field type: 'Number'
            'percentage' |
            'min' |
            'max' |
            'range' | // for date fields
            'median' |
            'mode' |
            'compute' |
            'last' |
            'oneOrNothing',
        // String (optional) - how the field should be requested.  If used, this name will be sent to the connector instead of the field's "key" value
        requestName: 'foo',
        // String (optional) - name that's returned for the field in the response.Tthe response with this name will be mapped to the field's "key" value
        responseName: 'bar',
        // String (optional) - formula to calculate the field value
        formula: 'foo / 100',
        // Object (optional) - specify how a field should be sorted
        sort: {
            // String - path containing the value to sort on, similar to display.path
            path: 'foo.bar',
        },
        // Object (optional) - specify how to filter this value. Only usable for dimensions
        filter: {
            // Number (optional) - minimum amount of filter options that need to be selected
            min: 0, // default 0
            // Number (optional) - maximum amount of filter options that need to be selected
            max: 2,
            // String (optional) - how the filter should be requested. This name will be sent to the connector instead of the field's "key" value
            requestKey: 'foo',
            // [Object] (optional) - operators that are supported by this filter
            operators: [
                {
                    // String - operators allow filters to work in different ways and define capabilities that are supported by a filter
                    type: 'INCLUDES' | 'CONTAINS' | 'STARTS_WITH' | 'ENDS_WITH',
                    capabilities: {
                        // Boolean - whether or not the filter can be case-sensitive
                        caseSensitive: true,
                        // Boolean - whether or not the filter can be case-insensitive
                        caseInsensitive: true,
                        // Boolean - whether or not the filter can be negated, converting an "INCLUDES" to "NOT INCLUDES" etc.
                        negate: true,
                    },
                    // Object (optional) - options to fetch filter options using a request
                    optionsRequest: {
                        // String - identifier of the endpoint the request will be made to.
                        endpointId: 'example-adapter:foo',
                        // String - name of the field that functions as the identifier of the options.
                        idField: 'fooId',
                        // String - name of the field that functions as the visible name of the options.
                        nameField: 'fooName',
                    },
                    // [Object] (required if optionsRequest is not set) - selectable filter options
                    options: [
                        {
                            // String - identifier of the filter option. This is the value that's sent along in the request
                            _id: 'foo',
                            // name of the filter option that is shown in the ui
                            name: 'foo',
                        },
                    ],
                },
            ],
        },
        // [Object] - subfields are field definitions that describe nested fields when field type is object
        subFields,
    },
];
```

#### connector

A connector is a function/promise that's responsible for formatting the input options to an external request and the response of the external request to the custom integration format.

```js
async function connector({
    // [String] - the requested metrics
    metrics: ['bar'],
    // [String] - the original field keys before they are manipulated for the request by e.g. 'requestName`
    originalMetrics: ['foo'],
    // [String] - the requested dimensions
    dimensions: ['foo'],
    // [Number] - limits set for dimensions. The index of the limit number corresponds to the index of the fields in dimensions
    limits: [10],
    // [[String]] - array containing one or more Arrays with sort settings. In the inner array, the first value is the metric's name and the second value is either asc or desc describing the sort direction
    sort: [['foo', 'asc']],
    // Object - the date range that needs to requested by the connector
    dateRange: {
        // String - format 'YYYY-MM-DD', start date of the date range
        start: '2010-01-01',
        // String - format 'YYYY-MM-DD', end date of the date range
        end: '2010-02-02',
    },
    // [Object]- contains all filters that need to be handled by the connector. When multiple filters are used, make sure to use the AND operator between filters.
    filters: [
        {
            // String - filter key that the expression applies to
            key: 'foo',
            // [String] - filter values. Should be handled according to the operator
            expressions: ['foo'],
            // String - the operator to use for the given expression
            operator: 'INCLUDES',
            // Boolean - whether or not to use case sensitive matching for the expressions
            caseSensitive: true,
            // Boolean - whether or not to negate the filter operator (i.e. "INCLUDES" becomes "NOT INCLUDES")
            negate: true,
        },
    ],
    // Object - contains the credentials set by the adapter's authentication (accessToken when using OAuth 1/OAuth 2, or the key and all properties used in the auth form)
    credentials: {
        accessToken: 'n227uuKd9CuX3LuCIyMc2q564q5y8HD5',
    },
    // Object - contains the key and all properties defined by the scope
    scope: {
        foo: 'bar',
    },
    // Number - current page number that is being requested. Useful for an api that supports pagination
    page: 0,
    // Number - The amount of rows expected per page
    perPage: 10,
    // Any - nextPage value returned by the previous page, e.g. a uri for requesting the following page
    nextPage: 'http://example.com/page/2',
    // Number - offset based on page and perPage that represents the number of rows already requested, for example 20 when requesting page 3 and perPage is set to 10
    offset: 20,
}) {
    return {
        // [Object] - array containing objects with the results of the requested metrics and dimensions
        rows: [
            {
                foo: '1',
                bar: '10',
            },
            {
                foo: '1',
                bar: '1',
            },
            {
                foo: '2',
                bar: '20',
            },
        ],
        // Object - containing the totals of the requested metrics.
        totals: {
            bar: '40',
        },
        // Boolean (optional) - determines wether data is golden or not. Golden data means that the rows and totals are static and won't change anymore in the future. This setting is used to determine the Cache duration
        isGolden: false,
        // Number (optional) - the total number of pages to expect. All other pages will be requested automatically when this value is returned on page one
        totalPages: 1,
        // Number (optional) - the total number of rows to expect. All other pages will be requested automatically when this value is returned on page one and perPage is available
        resultCount: 3,
        // Any (optional) - when returned a truthy value, the connector will be called again with nextPage set to this value
        any: 'http://example.com/page/3',
    };
}
```
