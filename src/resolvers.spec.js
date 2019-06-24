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
                        key: 'foo',
                    },
                };

                const resolver = resolvers.Query.adapter;
                const result = resolver(config);

                expect(result).to.exist;
                expect(result).to.have.property('key', config.adapter.key);
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
    });

    describe('Adapter resolvers', function () {
        describe('#endpoint', function () {
            it('returns an endpoint', function () {
                const adapter = {
                    endpoints: [
                        {
                            key: 'foo',
                        },
                    ],
                };

                const resolver = resolvers.Adapter.endpoint;
                const result = resolver(adapter, { id: 'foo' });

                expect(result).to.exist;
                expect(result).to.have.property('key', adapter.endpoints[0].key);
            });
        });
    });

    describe('Endpoint resolvers', function () {
        describe('#data', function () {
            it('returns the data for an endpoint', function () {
                const endpoint = {
                    endpointId: 'foo:bar',
                    connector: ({ endpointId, adapterId }) => ({
                        adapterId,
                        endpointId,
                    }),
                };

                const resolver = resolvers.Endpoint.data;
                const result = resolver(endpoint, {});

                expect(result).to.exist;
                expect(result).to.deep.equal({ endpointId: 'foo:bar', adapterId: 'foo' });
            });
        });
    });
});
