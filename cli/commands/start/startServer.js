const path = require('path');
const express = require('express');
const { invokeHandler } = require('@swydo/byol');
const debug = require('debug')('custom-integrations:server');

function getPackage() {
    const externalPackagePath = path.join(process.cwd(), 'package.json');

    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(externalPackagePath);
}

function getMainPath() {
    const { main } = getPackage();

    if (!main) {
        throw new Error('PROJECT_MISSING_MAIN');
    }

    return path.join(process.cwd(), main);
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
                    res.send(result);
                })
                .catch(() => {
                    res.status(500);
                    res.end();
                });
        });
    });

    app.listen(port);

    debug('Listening on port', port);
}

module.exports = {
    startServer,
};
