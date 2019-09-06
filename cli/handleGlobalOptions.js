const debug = require('debug');

function handleGlobalOptions({ silent }) {
    if (silent) {
        debug.disable();
    } else {
        const namespaces = [
            'custom-integrations:cli:*',
        ];

        // Debug's `enable` overwrites the namespaces set in the environment, so take those into account manually.
        const environmentNamespaces = process.env.DEBUG;

        if (environmentNamespaces) {
            namespaces.push(environmentNamespaces);
        }

        debug.enable(namespaces.join(','));
    }
}

module.exports = {
    handleGlobalOptions,
};
