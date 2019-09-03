const chokidar = require('chokidar');
const debounce = require('debounce');
const { terminal } = require('terminal-kit');
const debug = require('debug')('custom-integrations:validate');
const { handleGlobalOptions } = require('../../handleGlobalOptions');
const { validateConfig } = require('./validateConfig');

const command = 'validate';
const desc = 'validate configuration';

const builder = yargs => (
    yargs
        .option('watch', { type: 'boolean', alias: 'w', default: false })
        .option('fullscreen', { type: 'boolean', default: true })
);

const handler = async ({ watch, fullscreen, ...globalOptions }) => {
    handleGlobalOptions(globalOptions);

    const validate = async () => {
        if (watch && fullscreen) {
            terminal.clear();
            debug('Watching for file changes');
        }

        debug('Validating');
        await validateConfig();
        debug('Done');
    };

    if (watch) {
        if (fullscreen) {
            terminal.fullscreen();
        }

        debug('Watching for file changes');

        const debouncedValidate = debounce(validate, 500);

        terminal.grabInput({ mouse: 'button' });
        terminal.on('key', (name) => {
            if (name === 'CTRL_C' || name === 'ESCAPE') {
                terminal.processExit(0);
            }
        });

        chokidar.watch(process.cwd(), { ignored: [/node_modules/] })
            .on('change', () => {
                debouncedValidate();
            })
            .on('ready', () => debouncedValidate());
    } else {
        await validate();
    }
};

module.exports = {
    command,
    desc,
    builder,
    handler,
};
