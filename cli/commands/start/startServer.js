const express = require('express');
const { invokeHandler } = require('@swydo/byol');
const StackTracey = require('stacktracey');
const { getMainPath } = require('../../lib/getMainPath');
const logger = require('../../lib/logger')('cli:start');

StackTracey.isThirdParty.include(path => path.includes('/custom-integrations/'));

function logGraphqlErrors(errors) {
    errors.forEach((error) => {
        const stack = new StackTracey(error.extensions.exception.stacktrace.join('\n'));

        logger.error('');

        logger.error(`  ${error.message}`);
        stack.clean.pretty.split('\n').forEach(line => logger.error(`  ${line}`));

        logger.error('');
    });
}

function startServer(port) {
    const app = express();

    app.post('/', (req, res) => {
        let eventString = '';

        req.on('data', (chunk) => {
            eventString += chunk;
        });

        req.on('end', () => {
            const event = eventString ? JSON.parse(eventString) : {};

            const absoluteIndexPath = getMainPath();
            const invokeOptions = {
                absoluteIndexPath,
                event,
                handlerName: 'customIntegration',
            };

            invokeHandler(invokeOptions)
                .then((result) => {
                    if (result && result.errors) {
                        logGraphqlErrors(result.errors);
                    }

                    res.send(result);
                })
                .catch(() => {
                    res.status(500);
                    res.end();
                });
        });
    });

    app.get('/ping', (req, res) => {
        res.status(204);
        res.end();
    });

    app.listen(port);

    logger.info('Listening on port %d', port);
}

module.exports = {
    startServer,
};
