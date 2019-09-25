const byol = require('@swydo/byol'); // The function invokeHandler is not destructured to allow stubbing.
const { getMainPath } = require('../../lib/getMainPath');

function getInvokeOptions() {
    const absoluteIndexPath = getMainPath();

    return {
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
}

async function validateConfig() {
    const invokeOptions = getInvokeOptions();

    try {
        const {
            data: {
                config: {
                    isValid,
                },
            },
        } = await byol.invokeHandler(invokeOptions);

        return isValid;
    } catch (e) {
        // Intentionally left blank. Handler itself will log errors right now.
        return false;
    }
}

module.exports = {
    getInvokeOptions,
    validateConfig,
};
