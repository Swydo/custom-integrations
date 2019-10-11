/* istanbul ignore file */

const path = require('path');
const enquirer = require('enquirer');
const execa = require('execa');
const stripAnsi = require('strip-ansi');
const { engine } = require('hygen');
const { getLatestCustomIntegrationsVersion } = require('../../lib/getLatestCustomIntegrationsVersion');
const logger = require('../../lib/logger')('cli:init');
const { handleGlobalOptions } = require('../../handleGlobalOptions');

const KEBAB_CASE_REGEX = /^[a-z0-9]+[a-z0-9-]*[a-z0-9]+$/;

const NOOP = () => {
};

const command = 'init';
const desc = 'Initialize a new custom integration';

const builder = yargs => (
    yargs
);

const handler = async ({ ...globalOptions }) => {
    handleGlobalOptions(globalOptions);

    logger.info('Fetching latest information from npm');

    const customIntegrationsVersion = await getLatestCustomIntegrationsVersion();

    logger.info(`Initializing with version ${customIntegrationsVersion}`);

    const response = await enquirer.prompt([{
        type: 'input',
        name: 'name',
        message: 'custom integration identifier?',
        default: path.basename(process.cwd()),
        validate: name => KEBAB_CASE_REGEX.test(name),
    }]);

    const hygenArgs = Object
        .keys(response)
        .map(key => ({
            key,
            value: response[key],
        }))
        .concat([{
            key: 'customIntegrationsVersion',
            value: customIntegrationsVersion,
        }])
        .map(({ key, value }) => `--${key} ${value}`)
        .join(' ');
    const hygenArgv = `customIntegration new ${hygenArgs}`;

    await engine(hygenArgv, {
        templates: path.join(__dirname, 'templates'),
        cwd: process.cwd(),
        // Disable hygen logging.
        logger: {
            log: NOOP,
            ok: NOOP,
            warn: NOOP,
        },
        debug: false,
        exec: (action, body) => {
            const opts = body && body.length > 0 ? { input: body } : {};

            return execa(action, opts);
        },
        createPrompter: () => ({
            prompt(args) {
                // Remove indentation and color from default hygen message for consistency in this package.
                const cleanMessage = stripAnsi(args.message).trim();

                return enquirer.prompt({
                    ...args,
                    message: cleanMessage,
                });
            },
        }),
    });

    logger.info('All done, try running "npm install" to install all dependencies');
};

module.exports = {
    command,
    desc,
    builder,
    handler,
};
