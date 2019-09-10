---
to: src/index.js
---
const { buildCustomIntegration } = require('@swydo/custom-integrations');
const config = require('./adapter');

const customIntegration = buildCustomIntegration(config);

module.exports = {
    customIntegration,
};
