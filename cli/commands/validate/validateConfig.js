const { invokeHandler } = require('@swydo/byol');
const { getMainPath } = require('../../lib/getMainPath');

async function validateConfig() {
    const absoluteIndexPath = getMainPath();
    const invokeOptions = {
        absoluteIndexPath,
        handlerName: 'customIntegration',
        event: {
            query: `
                query {
                    config {
                        isValid
                    }
                }
            `,
            variables: {},
        },
    };

    try {
        const {
            data: {
                config: {
                    isValid,
                },
            },
        } = await invokeHandler(invokeOptions);

        return isValid;
    } catch (e) {
        // Intentionally left blank. Handler itself will log errors right now.
        return false;
    }
}

module.exports = {
    validateConfig,
};
