const debug = require('debug')('custom-integrations:handler');
const { makeExecutableSchema } = require('graphql-tools');
const { runHttpQuery } = require('apollo-server-core');
const { resolvers } = require('./resolvers');
const { typeDefs } = require('./typeDefs');

const schema = makeExecutableSchema({ typeDefs, resolvers });

function getAsyncHandler(config) {
    return async ({ query, variables }, context = {}) => {
        // Keep connections alive for resue but return result immediately.
        context.callbackWaitsForEmptyEventLoop = false; // eslint-disable-line no-param-reassign

        try {
            const { graphqlResponse } = await runHttpQuery([], {
                method: 'POST',
                query: {
                    query,
                    variables,
                },
                options: {
                    schema,
                    rootValue: config,
                },
            });

            const graphqlResponseObject = JSON.parse(graphqlResponse);

            if (graphqlResponseObject.errors) {
                // eslint-disable-next-line no-console
                debug(graphqlResponseObject.errors);
            }

            return graphqlResponseObject;
        } catch (error) {
            debug(error);

            try {
                // GraphQL will return JSON-formatted error messages that are expected to be returned as normal
                // response payload.
                return JSON.parse(error.message);
            } catch (e) {
                throw error;
            }
        }
    };
}

function getHandler(config) {
    const handler = getAsyncHandler(config);

    return (event, context, callback) => {
        handler(event, context)
            .then(result => callback(null, result))
            .catch(error => callback(error, null));
    };
}

module.exports = {
    getAsyncHandler,
    getHandler,
};
