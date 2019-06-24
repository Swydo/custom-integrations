const GraphQLJSON = require('graphql-type-json');
const packageJSON = require('../package.json');

const resolvers = {
    JSON: GraphQLJSON,
    Query: {
        adapter: ({ adapter }) => adapter,
        version: () => packageJSON.version,
    },
    Adapter: {
        endpoint: ({ endpoints }, { id }) => endpoints.find(endpoint => endpoint.key === id),
    },
    Endpoint: {
        data: ({ endpointId, connector }, { request }) => connector({
            ...request,
            adapterId: endpointId.substring(0, endpointId.indexOf(':')),
            endpointId,
        }),
    },
};

module.exports = {
    resolvers,
};
