const path = require('path');
const debug = require('debug')('custom-integrations:handler');
const { importSchema } = require('graphql-import');
const { makeExecutableSchema } = require('graphql-tools');
const { runQuery } = require('apollo-server-core');
const { resolvers } = require('./resolvers');

const typeDefs = importSchema(path.join(__dirname, './schema.graphql'));
const schema = makeExecutableSchema({ typeDefs, resolvers });

function getAsyncHandler(config) {
    return async ({ query, variables }, context = {}) => {
        // Keep connections alive for resue but return result immediately.
        context.callbackWaitsForEmptyEventLoop = false; // eslint-disable-line no-param-reassign

        try {
            const result = await runQuery({
                schema,
                variables,
                rootValue: config,
                queryString: query,
            });

            if (result.errors) {
                // eslint-disable-next-line no-console
                debug(result.errors);
            }

            return result;
        } catch (error) {
            // eslint-disable-next-line no-console
            debug(error);

            throw error;
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
