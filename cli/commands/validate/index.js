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

    if (fullscreen) {
        terminal.fullscreen();
    } else if (watch) {
        debug('Watching for file changes');
        console.log(''); // eslint-disable-line no-console
    }

    const validate = async () => {
        if (fullscreen) {
            terminal.clear();
            debug('Watching for file changes');
            console.log(''); // eslint-disable-line no-consol
        }

        await validateConfig();
    };

    const debouncedValidate = debounce(validate, 500);

    terminal.grabInput({ mouse: 'button' });
    terminal.on('key', (name) => {
        if (name === 'CTRL_C' || name === 'ESCAPE') {
            terminal.processExit(0);
        }
    });

    if (watch) {
        chokidar.watch(process.cwd(), { ignored: [/node_modules/] })
            .on('change', () => {
                debouncedValidate();
            })
            .on('ready', () => debouncedValidate());
    } else {
        debouncedValidate();
    }
};

module.exports = {
    command,
    desc,
    builder,
    handler,
};
