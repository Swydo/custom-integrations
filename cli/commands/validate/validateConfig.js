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
                    adapter {
                        id
                    }
                }
            `,
            variables: {},
        },
    };

    try {
        await invokeHandler(invokeOptions);
    } catch (e) {
        // Intentionally left blank. Handler itself will log errors right now.
    }
}

module.exports = {
    validateConfig,
};
