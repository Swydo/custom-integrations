const { describe, it, beforeEach, afterEach } = require('mocha');
const nock = require('nock');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const { version: currentVersion } = require('../package.json');
const Logger = require('./lib/logger');
const loggerConsoleTransport = require('./lib/loggerConsoleTransport');
const { handleGlobalOptions } = require('./handleGlobalOptions');

chai.use(sinonChai);
const { expect } = chai;

describe('handleGlobalOptions', function () {
    let safeDefaults;

    beforeEach(function () {
        safeDefaults = {
            versionCheck: false,
        };
    });

    describe('silent', function () {
        it('disables all logging when the silent option is set to true', function () {
            handleGlobalOptions({ ...safeDefaults, silent: true });

            expect(loggerConsoleTransport).to.have.property('silent', true);
        });

        it('enables logging when the silent option is set to false', function () {
            handleGlobalOptions({ ...safeDefaults, silent: false });

            expect(loggerConsoleTransport).to.have.property('silent', false);
        });
    });

    describe('verbose', function () {
        it('defaults to "info" level verbosity', function () {
            handleGlobalOptions({ ...safeDefaults });
            expect(loggerConsoleTransport).to.have.property('level', 'info');

            handleGlobalOptions({ ...safeDefaults, verbose: 0 });
            expect(loggerConsoleTransport).to.have.property('level', 'info');
        });

        it('increases the level of verbosity depending on the verbose option', function () {
            handleGlobalOptions({ ...safeDefaults, verbose: 1 });
            expect(loggerConsoleTransport).to.have.property('level', 'http');

            handleGlobalOptions({ ...safeDefaults, verbose: 2 });
            expect(loggerConsoleTransport).to.have.property('level', 'verbose');

            handleGlobalOptions({ ...safeDefaults, verbose: 3 });
            expect(loggerConsoleTransport).to.have.property('level', 'debug');

            handleGlobalOptions({ ...safeDefaults, verbose: 4 });
            expect(loggerConsoleTransport).to.have.property('level', 'silly');
        });

        it('maxes out at level "silly"', function () {
            handleGlobalOptions({ ...safeDefaults, verbose: 4 });
            expect(loggerConsoleTransport).to.have.property('level', 'silly');

            handleGlobalOptions({ ...safeDefaults, verbose: 5 });
            expect(loggerConsoleTransport).to.have.property('level', 'silly');

            handleGlobalOptions({ ...safeDefaults, verbose: Number.MAX_SAFE_INTEGER });
            expect(loggerConsoleTransport).to.have.property('level', 'silly');
        });
    });

    describe('version-check', function () {
        let globalLogger;

        beforeEach(function () {
            globalLogger = Logger('cli:global');

            sinon.spy(globalLogger, 'info');
        });

        afterEach(function () {
            globalLogger.info.restore();
        });

        it('logs when there is an updated version of this package', async function () {
            nock('https://registry.npmjs.org:443')
                .get('/@swydo/custom-integrations')
                .reply(200, {
                    'dist-tags': {
                        latest: '99.99.99',
                    },
                });

            const { optionalPromises } = handleGlobalOptions({ ...safeDefaults, versionCheck: true });
            await Promise.all(optionalPromises);

            expect(globalLogger.info).to.have.been.calledTwice;
        });

        it('checks the version by default', async function () {
            nock('https://registry.npmjs.org:443')
                .get('/@swydo/custom-integrations')
                .reply(200, {
                    'dist-tags': {
                        latest: '99.99.99',
                    },
                });

            const { optionalPromises } = handleGlobalOptions({ });
            await Promise.all(optionalPromises);

            expect(globalLogger.info).to.have.been.calledTwice;
        });

        it('does not log when the current version is up-to-date', async function () {
            nock('https://registry.npmjs.org:443')
                .get('/@swydo/custom-integrations')
                .reply(200, {
                    'dist-tags': {
                        latest: currentVersion,
                    },
                });

            const { optionalPromises } = handleGlobalOptions({ ...safeDefaults, versionCheck: true });
            await Promise.all(optionalPromises);

            expect(globalLogger.info).to.not.have.been.called;
        });

        it('does not log when the version check is disabled', async function () {
            const { optionalPromises } = handleGlobalOptions({ ...safeDefaults, versionCheck: false });
            await Promise.all(optionalPromises);

            expect(globalLogger.info).to.have.not.been.called;
        });
    });
});
