const debug = require('debug');

function handleGlobalOptions({ silent }) {
    if (silent) {
        debug.disable();
    } else {
        debug.enable('custom-integrations:*');
    }
}

module.exports = {
    handleGlobalOptions,
};
