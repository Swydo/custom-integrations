/* istanbul ignore file */

const chokidar = require('chokidar');
const debounce = require('debounce');
const { handleGlobalOptions } = require('../../handleGlobalOptions');
const { validateConfig } = require('./validateConfig');
const logger = require('../../lib/logger')('cli:validate');

const command = 'validate';
const desc = 'validate configuration';

const builder = yargs => (
    yargs
        .option('watch', { type: 'boolean', alias: 'w', default: false })
        .option('fullscreen', { type: 'boolean', default: true })
);

const handler = async ({ watch, ...globalOptions }) => {
    handleGlobalOptions(globalOptions);

    const validate = async () => {
        logger.info('Validating');
        const isValid = await validateConfig();
        logger.info('Done');

        return isValid;
    };

    if (watch) {
        logger.info('Watching for file changes');

        const debouncedValidate = debounce(validate, 500);

        chokidar.watch(process.cwd(), { ignored: [/node_modules/] })
            .on('change', () => {
                debouncedValidate();
            })
            .on('ready', () => debouncedValidate());
    } else {
        const isValid = await validate();

        const exitCode = isValid ? 0 : 1;
        process.exit(exitCode);
    }
};

module.exports = {
    command,
    desc,
    builder,
    handler,
};
