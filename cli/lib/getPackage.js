const path = require('path');

function getPackage() {
    const externalPackagePath = path.join(process.cwd(), 'package.json');

    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(externalPackagePath);
}

module.exports = {
    getPackage,
};

