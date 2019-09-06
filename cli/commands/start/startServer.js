const express = require('express');
const { invokeHandler } = require('@swydo/byol');
const debug = require('debug')('custom-integrations:cli:start');
const { getMainPath } = require('../../lib/getMainPath');

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
