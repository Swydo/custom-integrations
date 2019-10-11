const semverDiff = require('semver-diff');
const winston = require('winston');
const chalk = require('chalk');
const { version: currentVersion } = require('../package.json');
const { getLatestCustomIntegrationsVersion } = require('./lib/getLatestCustomIntegrationsVersion');
const logger = require('./lib/logger')('cli:global');
const loggerConsoleTransport = require('./lib/loggerConsoleTransport');

const DEFAULT_LEVEL = winston.config.npm.levels.info;

const MAX_LEVEL = winston.config.npm.levels.silly;

function handleGlobalOptions({ silent = false, verbose = 0, versionCheck = true }) {
    const optionalPromises = [];

    loggerConsoleTransport.silent = silent;

    const levelValue = Math.min(verbose + DEFAULT_LEVEL, MAX_LEVEL);
    loggerConsoleTransport.level = Object
        .keys(winston.config.npm.levels)
        .find(key => winston.config.npm.levels[key] === levelValue);

    if (versionCheck) {
        const versionCheckPromise = getLatestCustomIntegrationsVersion().then((latestVersion) => {
            const versionDiff = semverDiff(currentVersion, latestVersion);

            if (versionDiff) {
                logger.info(chalk.green(`A ${versionDiff} update is available for @swydo/custom-integrations`));
                logger.info(chalk.green(`npm install --save @swydo/custom-integrations@${latestVersion}`));
            }
        });

        optionalPromises.push(versionCheckPromise);
    }

    // Optional async stuff can be awaited through Promise.all if the user of this function deems that necessary.
    // Primarily added for testing purposes so that we can await before asserting certain behaviour.
    return {
        optionalPromises,
    };
}

module.exports = {
    handleGlobalOptions,
};
