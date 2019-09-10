---
to: src/adapter.js
---
const { connector } = require('./connector');

const fields = [
];

const endpoints = [
    {
        id: '<%= name %>-endpoint',
        connector: connector,
        fields,
    },
];

const adapter = {
    id: '<%= name %>',
    authentication: {
        type: 'form',
        formOptions: {
            fields: [
                {
                    label: 'Username',
                    type: 'text',
                    key: 'name',
                    placeholder: 'Username',
                },
                {
                    label: 'Password',
                    type: 'password',
                    key: 'password',
                    placeholder: 'Password',
                },
            ],
        },
    },
    endpoints,
};

module.exports = {
    adapter,
};
