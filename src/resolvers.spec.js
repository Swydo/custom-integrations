const { describe, it } = require('mocha');
const { expect } = require('chai');
const { resolvers } = require('./resolvers');
const packageJSON = require('../package.json');

describe('resolvers', function () {
    describe('JSON resolvers', function () {
        it('has a JSON resolver', function () {
            const resolver = resolvers.JSON;

            expect(resolver).to.exist;
        });
    });

    describe('Query resolvers', function () {
        describe('#adapter', function () {
            it('returns the adapter', function () {
                const config = {
                    adapter: {
                        id: 'foo',
                        endpoints: [],
                    },
                };

                const resolver = resolvers.Query.adapter;
                const result = resolver(config);

                expect(result).to.exist;
                expect(result).to.have.property('id', config.adapter.id);
            });

            it('throws when the adapter config is invalid', function () {
                const config = {
                    adapter: {
                        id: 'foo',
                    },
                };

                const resolver = resolvers.Query.adapter;
                const failingCall = () => resolver(config);

                expect(failingCall).to.throw('INVALID_CONFIG');
            });
        });

        describe('#version', function () {
            it('returns the version', function () {
                const resolver = resolvers.Query.version;
                const result = resolver();

                expect(result).to.exist;
                expect(result).to.have.equal(packageJSON.version);
            });
        });

        describe('#config', function () {
            it('returns the raw adapter cofiguration', function () {
                const config = {
                    adapter: {
                        id: 'foo',
                        endpoints: [],
                    },
                };

                const resolver = resolvers.Query.config;
                const result = resolver(config);

                expect(result).to.equal(config);
            });
        });
    });

    describe('Adapter resolvers', function () {
        describe('#endpoint', function () {
            it('returns an endpoint', function () {
                const adapter = {
                    endpoints: [
                        {
                            id: 'foo',
                        },
                    ],
                };

                const resolver = resolvers.Adapter.endpoint;
                const result = resolver(adapter, { id: 'foo' });

                expect(result).to.exist;
                expect(result).to.have.property('id', adapter.endpoints[0].id);
            });
        });
    });

    describe('Endpoint resolvers', function () {
        describe('#data', function () {
            it('returns the data for an endpoint', async function () {
                const result = {
                    rows: [{
                        foo: 'foo',
                    }],
                    totals: {
                        foo: 'foo',
                    },
                    resultCount: 20,
                    totalPages: 2,
                    nextPage: 'http://example.com?page=2',
                };

                const endpoint = {
                    connector: () => result,
                };

                const resolver = resolvers.Endpoint.data;
                const resolverOutput = await resolver(endpoint, { request: { dimensions: ['foo'], metrics: ['foo'] } });

                expect(resolverOutput).to.exist;
                expect(resolverOutput).to.deep.equal(result);
            });

            it('resolves an async connector', async function () {
                const result = {
                    rows: [{
                        foo: 'foo',
                    }],
                    totals: {
                        foo: 'foo',
                    },
                    resultCount: 20,
                    totalPages: 2,
                    nextPage: 'http://example.com?page=2',
                };

                const endpoint = {
                    connector: async () => result,
                };

                const resolver = resolvers.Endpoint.data;
                const resolverOutput = await resolver(endpoint, { request: { dimensions: ['foo'], metrics: ['foo'] } });

                expect(resolverOutput).to.exist;
                expect(resolverOutput).to.deep.equal(result);
            });

            it('returns defaults when the connector did not return anything', async function () {
                const endpoint = {
                    connector: () => {
                    },
                };

                const resolver = resolvers.Endpoint.data;
                const resolverOutput = await resolver(endpoint, { request: { dimensions: ['foo'], metrics: ['foo'] } });

                expect(resolverOutput).to.exist;
                expect(resolverOutput).to.have.property('rows').that.is.an('array').with.length(0);
                expect(resolverOutput).to.have.property('totals').that.is.an('object').that.is.empty;
                expect(resolverOutput).to.have.property('totalPages', undefined);
                expect(resolverOutput).to.have.property('resultCount', undefined);
                expect(resolverOutput).to.have.property('nextPage', undefined);
            });

            it('removes unsupported properties from the returned object', async function () {
                const result = {
                    rows: [{
                        foo: 'foo',
                    }],
                    totals: {
                        foo: 'foo',
                    },
                    resultCount: 20,
                    totalPages: 2,
                    nextPage: 'http://example.com?page=2',
                };

                const endpoint = {
                    connector: () => ({ ...result, foo: 'foo' }),
                };

                const resolver = resolvers.Endpoint.data;
                const resolverOutput = await resolver(endpoint, { request: { dimensions: ['foo'], metrics: ['foo'] } });

                expect(resolverOutput).to.exist;
                expect(resolverOutput).to.deep.equal(result);
            });

            it('removes fields that weren\'t requested from rows and totals', async function () {
                const result = {
                    rows: [{
                        foo: 'foo',
                    }],
                    totals: {
                        foo: 'foo',
                    },
                    resultCount: 20,
                    totalPages: 2,
                    nextPage: 'http://example.com?page=2',
                };

                const endpoint = {
                    connector: () => ({
                        ...result,
                        rows: [{
                            ...result.rows[0],
                            bar: 'bar',
                        }],
                        totals: {
                            ...result.totals,
                            bar: 'bar',
                        },
                    }),
                };

                const resolver = resolvers.Endpoint.data;
                const request = {
                    dimension: ['foo'],
                    metrics: ['foo'],
                    projection: ['foo'],
                };
                const resolverOutput = await resolver(endpoint, { request });

                expect(resolverOutput).to.exist;
                expect(resolverOutput).to.deep.equal(result);
            });

            it('supports requests without metrics', async function () {
                const result = {
                    rows: [{
                        foo: 'foo',
                    }],
                    totals: {
                        foo: 'foo',
                    },
                    resultCount: 20,
                    totalPages: 2,
                    nextPage: 'http://example.com?page=2',
                };

                const endpoint = {
                    connector: () => result,
                };

                const resolver = resolvers.Endpoint.data;
                const resolverOutput = await resolver(endpoint, { request: { dimensions: ['foo'] } });

                expect(resolverOutput).to.exist;
                expect(resolverOutput).to.deep.equal(result);
            });

            it('supports requests without dimensions', async function () {
                const result = {
                    rows: [{
                        foo: 'foo',
                    }],
                    totals: {
                        foo: 'foo',
                    },
                    resultCount: 20,
                    totalPages: 2,
                    nextPage: 'http://example.com?page=2',
                };

                const endpoint = {
                    connector: () => result,
                };

                const resolver = resolvers.Endpoint.data;
                const resolverOutput = await resolver(endpoint, { request: { metrics: ['foo'] } });

                expect(resolverOutput).to.exist;
                expect(resolverOutput).to.deep.equal(result);
            });
        });
    });

    describe('Config resolvers', function () {
        describe('#isValid', function () {
            it('returns true when the configuration is valid', function () {
                const config = {
                    adapter: {
                        id: 'foo',
                        endpoints: [],
                    },
                };

                const resolver = resolvers.Config.isValid;
                const result = resolver(config);

                expect(result).to.equal(true);
            });

            it('returns false when the configuration is not valid', function () {
                const config = {
                    adapter: {
                        id: 'foo',
                    },
                };

                const resolver = resolvers.Config.isValid;
                const result = resolver(config);

                expect(result).to.equal(false);
            });
        });
    });
});
