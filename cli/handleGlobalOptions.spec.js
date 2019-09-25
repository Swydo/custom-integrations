const { describe, it } = require('mocha');
const { expect } = require('chai');
const loggerConsoleTransport = require('./lib/loggerConsoleTransport');
const { handleGlobalOptions } = require('./handleGlobalOptions');

describe('handleGlobalOptions', function () {
    describe('silent', function () {
        it('disables all logging when the silent option is set to true', function () {
            handleGlobalOptions({ silent: true });

            expect(loggerConsoleTransport).to.have.property('silent', true);
        });

        it('enables logging when the silent option is set to false', function () {
            handleGlobalOptions({ silent: false });

            expect(loggerConsoleTransport).to.have.property('silent', false);
        });
    });

    it('defaults to "info" level verbosity', function () {
        handleGlobalOptions({});
        expect(loggerConsoleTransport).to.have.property('level', 'info');

        handleGlobalOptions({ verbose: 0 });
        expect(loggerConsoleTransport).to.have.property('level', 'info');
    });

    it('increases the level of verbosity depending on the verbose option', function () {
        handleGlobalOptions({ verbose: 1 });
        expect(loggerConsoleTransport).to.have.property('level', 'http');

        handleGlobalOptions({ verbose: 2 });
        expect(loggerConsoleTransport).to.have.property('level', 'verbose');

        handleGlobalOptions({ verbose: 3 });
        expect(loggerConsoleTransport).to.have.property('level', 'debug');

        handleGlobalOptions({ verbose: 4 });
        expect(loggerConsoleTransport).to.have.property('level', 'silly');
    });

    it('maxes out at level "silly"', function () {
        handleGlobalOptions({ verbose: 4 });
        expect(loggerConsoleTransport).to.have.property('level', 'silly');

        handleGlobalOptions({ verbose: 5 });
        expect(loggerConsoleTransport).to.have.property('level', 'silly');

        handleGlobalOptions({ verbose: Number.MAX_SAFE_INTEGER });
        expect(loggerConsoleTransport).to.have.property('level', 'silly');
    });
});
