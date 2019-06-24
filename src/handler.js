const path = require('path');
const { importSchema } = require('graphql-import');
const { makeExecutableSchema } = require('graphql-tools');
const { runQuery } = require('apollo-server-core');
const { resolvers } = require('./resolvers');
const { validateConfig } = require('./configSchema');

const typeDefs = importSchema(path.join(__dirname, './schema.graphql'));
const schema = makeExecutableSchema({ typeDefs, resolvers });

function getAsyncHandler(config) {
    return async ({ query, variables }, context = {}) => {
        // Keep connections alive for resue but return result immediately.
        context.callbackWaitsForEmptyEventLoop = false; // eslint-disable-line no-param-reassign

        const result = await runQuery({
            schema,
            variables,
            rootValue: config,
            queryString: query,
        });

        return result;
    };
}

function getHandler(config) {
    validateConfig(config);
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
