const { describe, it, before, after, beforeEach, afterEach } = require('mocha');
const sinon = require('sinon');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const byol = require('@swydo/byol');
const rp = require('request-promise-native');
const { startServer, stopServer } = require('./lambdaServer');

chai.use(chaiAsPromised);
const { expect } = chai;

const {
    PORT = 3000,
} = process.env;

describe('lambdaServer', function () {
    after(function () {
        stopServer();
    });

    it('only starts a single server', function () {
        startServer(PORT);
    });

    it('ignores requests to stop a server when there is no server', function () {
        stopServer();
        stopServer();
    });

    describe('/ping', function () {
        before(function () {
            startServer(PORT);
        });

        it('returns a 204', async function () {
            const options = {
                uri: `http://127.0.0.1:${PORT}/ping`,
                resolveWithFullResponse: true,
            };
            const res = await rp(options);

            expect(res).to.have.property('statusCode', 204);
        });
    });

    describe('/', function () {
        before(function () {
            startServer(PORT);
        });

        beforeEach(function () {
            sinon.stub(byol, 'invokeHandler');
        });

        afterEach(function () {
            byol.invokeHandler.restore();
        });

        it('invokes a handler with the event and returns the result', async function () {
            byol.invokeHandler.resolvesArg(0);

            const options = {
                uri: `http://127.0.0.1:${PORT}`,
                method: 'POST',
                body: {
                    foo: 'foo',
                },
                json: true,
            };
            const result = await rp(options);

            expect(result).to.have.property('event').that.deep.equals(options.body);
        });

        it('defaults to an empty event when no event is given', async function () {
            byol.invokeHandler.resolvesArg(0);

            const options = {
                uri: `http://127.0.0.1:${PORT}`,
                method: 'POST',
                json: true,
            };
            const result = await rp(options);

            expect(result).to.have.property('event').that.deep.equals({});
        });

        it('returns a 500 when an error occurs', async function () {
            byol.invokeHandler.rejects();

            const options = {
                uri: `http://127.0.0.1:${PORT}`,
                method: 'POST',
                body: {
                    foo: 'foo',
                },
                json: true,
            };
            const requestPromise = rp(options);

            await expect(requestPromise).to.eventually.be.rejectedWith('500 - undefined');
        });

        it('logs a GraphQL error when one occurs', async function () {
            byol.invokeHandler.resolves({
                errors: [{
                    extensions: {
                        exception: {
                            stacktrace: [],
                        },
                        message: 'FOO',
                    },
                }],
            });

            const options = {
                uri: `http://127.0.0.1:${PORT}`,
                method: 'POST',
                body: {
                    foo: 'foo',
                },
                json: true,
            };
            await rp(options);
        });
    });
});
