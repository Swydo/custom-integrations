const GraphQLJSON = require('graphql-type-json');
const packageJSON = require('../package.json');

const resolvers = {
    JSON: GraphQLJSON,
    Query: {
        adapter: ({ adapter }) => adapter,
        version: () => packageJSON.version,
    },
    Adapter: {
        endpoint: ({ endpoints }, { id }) => endpoints.find(endpoint => endpoint.id === id),
    },
    Endpoint: {
        data: ({ connector }, { request }) => connector(request),
    },
};

module.exports = {
    resolvers,
};
