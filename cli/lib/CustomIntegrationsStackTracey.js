const StackTracey = require('stacktracey');

class CustomIntegrationsStackTracey extends StackTracey {
    isThirdParty(path) {
        return super.isThirdParty(path) || path.includes('/custom-integrations/');
    }
}

module.exports = {
    CustomIntegrationsStackTracey,
};
