const { describe, it } = require('mocha');
const { expect } = require('chai');
const { getAsyncHandler, getHandler } = require('./handler');

describe('handler', function () {
    describe('#getAsyncHandler', function () {
        it('returns an async handler', function () {
            const config = {
                adapter: {
                    key: 'foo',
                    endpoints: [],
                },
            };
            const handler = getAsyncHandler(config);
            const event = {
                query: '{}',
            };
            const handlerPromise = handler(event);

            expect(handler).to.be.a('function');
            expect(handlerPromise).to.be.a.instanceOf(Promise);
        });

        it('returns graphql errors', async function () {
            const config = {
                adapter: {
                    key: 'foo',
                    endpoints: [],
                },
            };
            const handler = getAsyncHandler(config);
            const event = {
                query: '{}',
                endpoints: [],
            };
            const result = await handler(event);

            expect(result).to.be.a('object');
            expect(result).to.have.nested.property('errors');
        });

        it('returns the result of a graphql query', async function () {
            const config = {
                adapter: {
                    key: 'foo',
                    endpoints: [],
                },
            };
            const handler = getAsyncHandler(config);
            const event = {
                query: '{ adapter { key }}',
            };
            const result = await handler(event);

            expect(result).to.be.an('object');
            expect(result).to.have.nested.property('data');
            expect(result).to.have.nested.property('data.adapter');
            expect(result).to.have.nested.property('data.adapter.key');
            expect(result.data.adapter.key).to.equal(config.adapter.key);
        });
    });

    describe('#getHandler', function () {
        it('returns a handler for an adapter', function () {
            const config = {
                adapter: {
                    key: 'foo',
                    endpoints: [],
                },
            };
            const handler = getHandler(config);
            expect(handler).to.be.a('function');
        });

        it('returns graphql errors', function (done) {
            const config = {
                adapter: {
                    key: 'foo',
                    endpoints: [],
                },
            };
            const handler = getHandler(config);
            const event = {
                foo: '{}',
            };
            handler(event, {}, function (error) {
                expect(error).to.be.an.instanceOf(Error);

                done();
            });
        });

        it('returns graphql errors', function (done) {
            const config = {
                adapter: {
                    key: 'foo',
                    endpoints: [],
                },
            };
            const handler = getHandler(config);
            const event = {
                query: '{}',
            };
            handler(event, {}, function (error, result) {
                expect(result).to.be.an('object');
                expect(result).to.have.nested.property('errors');

                done();
            });
        });

        it('returns the result of a graphql query', function (done) {
            const config = {
                adapter: {
                    key: 'foo',
                    endpoints: [],
                },
            };
            const handler = getHandler(config);
            const event = {
                query: '{ adapter { key } }',
            };
            handler(event, {}, function (error, result) {
                expect(result).to.be.an('object');
                expect(result).to.have.nested.property('data.adapter');
                expect(result).to.have.nested.property('data.adapter.key');
                expect(result.data.adapter.key).to.equal(config.adapter.key);

                done();
            });
        });
    });
});
