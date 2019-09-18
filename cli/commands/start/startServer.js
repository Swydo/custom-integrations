const express = require('express');
const { invokeHandler } = require('@swydo/byol');
const StackTracey = require('stacktracey');
const debug = require('debug')('custom-integrations:cli:start');
const { getMainPath } = require('../../lib/getMainPath');

StackTracey.isThirdParty.include(path => path.includes('/custom-integrations/'));

function logGraphqlErrors(errors) {
    errors.forEach((error) => {
        const stack = new StackTracey(error.extensions.exception.stacktrace.join('\n'));

        /* eslint-disable no-console */
        if (debug.enabled) {
            console.log('');
        }

        console.error(`  ${error.message}`);
        stack.clean.pretty.split('\n').forEach(line => console.error(`  ${line}`));

        if (debug.enabled) {
            console.log('');
        }
        /* eslint-enable no-console */
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

    debug('Listening on port', port);
}

module.exports = {
    startServer,
};
