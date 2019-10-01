const GraphQLJSON = require('graphql-type-json');
const packageJSON = require('../package.json');
const { validateConfig } = require('./configSchema');
const { createRowProjector } = require('./createRowProjector');

const resolvers = {
    JSON: GraphQLJSON,
    Query: {
        adapter: (config) => {
            validateConfig(config);

            return config.adapter;
        },
        version: () => packageJSON.version,
        config: config => config,
    },
    Adapter: {
        endpoint: ({ endpoints }, { id }) => endpoints.find(endpoint => endpoint.id === id),
    },
    Endpoint: {
        data: async ({ connector }, { request }) => {
            const {
                rows = [],
                totals = {},
                totalPages,
                resultCount,
                nextPage,
            } = await connector(request) || {};

            const { metrics = [], dimensions = [] } = request;
            const rowProjector = createRowProjector([...metrics, ...dimensions]);

            const projectedRows = rows.map(rowProjector);
            const projectedTotals = rowProjector(totals);

            return {
                rows: projectedRows,
                totals: projectedTotals,
                totalPages,
                resultCount,
                nextPage,
            };
        },
    },
    Config: {
        isValid: (config) => {
            let isValid;

            try {
                validateConfig(config);

                isValid = true;
            } catch (e) {
                isValid = false;
            }

            return isValid;
        },
    },
};

module.exports = {
    resolvers,
};
